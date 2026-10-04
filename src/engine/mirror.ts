import type { Athlete, DoublesPair, PairEvent, Position } from '../data/athletes'
import { bmiOf } from './body'
import { athleteTraitVector, topTraits, traitSimilarity, type Trait, type TraitVector } from './traits'
import type { DoublesRole, Hand, Preference, Sex, SinglesStyle, TalentInput } from './types'

export interface MirrorUser {
  sex: Sex
  heightCm: number
  bmi: number
  preference: Preference
  hand?: Hand
  /** Semilla estable derivada de todas las respuestas: reparte entre candidatos casi iguales */
  seed?: number
  /** Puntos de rasgo del usuario (spec §17.3). Sin gustos, undefined. */
  traits?: TraitVector
}
export type StyleMatch = 'primary' | 'secondary' | 'none'
export interface SinglesMirror {
  athlete: Athlete
  distance: number
  heightDiff: number
  bmiDiff: number | null
  styleMatch: StyleMatch
  /** Rasgos principales del usuario que el jugador también tiene, en el orden del usuario */
  shared: Trait[]
}
export interface DoublesMirror {
  pair: DoublesPair
  playerIndex: 0 | 1
  distance: number
  heightDiff: number
  bmiDiff: number | null
}

// Sin peso fiable se compara por altura y se suma la diferencia de IMC típica, sin castigar al jugador.
const UNKNOWN_BMI_PENALTY = 0.35
const INACTIVE_PENALTY = 0.2
const STYLE_DISTANCE: Record<StyleMatch, number> = { primary: 0, secondary: 0.6, none: 1.5 }
const LEFTY_BONUS = 0.4
// Rasgos (spec §17.4). Calibrado 0,9 (spec decía 0,6): con 0,6 quien elige «engaño» podía recibir un espejo sin ningún rasgo
// en común aunque hubiera uno del segundo estilo con sus rasgos. El tercer estilo (1,5) sigue sin poder ganar.
const TRAIT_WEIGHT = 0.9
// Ventanas de "casi igual de parecidos" dentro de las cuales elige la semilla del usuario.
// La del espejo de estilo es más estrecha que antes (0,5) para que los rasgos se noten. Calibrado 0,3 (spec decía 0,2) por variedad.
const STYLE_WINDOW = 0.3
const BODY_WINDOW = 0.3
const DOUBLES_WINDOW = 0.3
// Posiciones que cuentan como "coinciden con el rol" (spec §5.3.6); 'both' sirve para ambos lados.
const ALLOWED_POSITIONS: Record<DoublesRole, Position[]> = {
  front: ['front', 'both'],
  back: ['back', 'both'],
  rotation: ['front', 'back', 'both'],
}
const POSITION_PENALTY: Record<DoublesRole, Record<Position, number>> = {
  front: { front: 0, both: 0.5, back: 2 },
  back: { back: 0, both: 0.5, front: 2 },
  rotation: { both: 0, front: 0.3, back: 0.3 },
}

export function athleteBmi(heightCm: number, weightKg: number | null): number | null {
  return weightKg == null ? null : bmiOf(heightCm, weightKg)
}

function bodyDistance(user: MirrorUser, heightCm: number, weightKg: number | null) {
  const bmi = athleteBmi(heightCm, weightKg)
  const heightDiff = user.heightCm - heightCm
  const bmiDiff = bmi == null ? null : Math.round((user.bmi - bmi) * 10) / 10
  const d = Math.abs(heightDiff) / 6 + (bmiDiff == null ? UNKNOWN_BMI_PENALTY : Math.abs(bmiDiff) / 1.5)
  return { heightDiff, bmiDiff, d }
}

function eventPenalty(event: PairEvent, user: MirrorUser): number {
  if (user.preference === 'mixed') return event === 'XD' ? 0 : 0.5
  if (user.preference === 'doubles') {
    const same: PairEvent = user.sex === 'M' ? 'MD' : 'WD'
    if (event === same) return 0
    return event === 'XD' ? 0.3 : 0.5
  }
  return 0
}

/** FNV-1a de todas las respuestas: la misma persona ve siempre los mismos espejos, otra distinta puede ver otros. */
export function seedOf(input: TalentInput): number {
  const text = JSON.stringify([input.sex, input.age, input.heightCm, input.weightKg, input.wingspanCm, input.yearsPlaying, input.hand, input.levels, input.prefs ?? null, input.tests])
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

/** Ordena por distancia y, entre los que están dentro de `window` del mejor, la semilla elige el primero. */
function withVariety<T extends { distance: number }>(sorted: T[], seed: number, window: number): T[] {
  if (sorted.length === 0) return sorted
  const pool = sorted.filter((c) => c.distance <= sorted[0].distance + window)
  const first = pool[seed % pool.length]
  return [first, ...sorted.filter((c) => c !== first)]
}

function sharedTraits(user: MirrorUser, athlete: Athlete): Trait[] {
  return user.traits ? topTraits(user.traits).filter((t) => athlete.traits.includes(t)) : []
}

function styleMatchOf(athlete: Athlete, style: { top: SinglesStyle; runnerUp: SinglesStyle }): StyleMatch {
  return athlete.style === style.top ? 'primary' : athlete.style === style.runnerUp ? 'secondary' : 'none'
}

/** 打法镜像: quien juega como tú (estilo, mano); el cuerpo solo desempata. */
export function findStyleMirrors(
  user: MirrorUser,
  style: { top: SinglesStyle; runnerUp: SinglesStyle },
  athletes: Athlete[],
  n = 3,
): SinglesMirror[] {
  const scored = athletes
    .filter((a) => a.sex === user.sex)
    .map((athlete) => {
      const { heightDiff, bmiDiff, d } = bodyDistance(user, athlete.heightCm, athlete.weightKg)
      const styleMatch = styleMatchOf(athlete, style)
      const lefty = user.hand === 'L' && athlete.hand === 'L' ? LEFTY_BONUS : 0
      const sim = user.traits ? traitSimilarity(user.traits, athleteTraitVector(athlete.traits)) : 0
      const distance =
        STYLE_DISTANCE[styleMatch] + TRAIT_WEIGHT * (1 - sim) + 0.35 * d + (athlete.status === 'active' ? 0 : INACTIVE_PENALTY) - lefty
      return { athlete, distance, heightDiff, bmiDiff, styleMatch, shared: sharedTraits(user, athlete) }
    })
    .sort((x, y) => x.distance - y.distance || x.athlete.id.localeCompare(y.athlete.id))
  return withVariety(scored, user.seed ?? 0, STYLE_WINDOW).slice(0, n)
}

/** 体型镜像: quien tiene un cuerpo como el tuyo; el estilo pesa poco. `excludeId` evita repetir el espejo de estilo. */
export function findBodyMirrors(
  user: MirrorUser,
  style: { top: SinglesStyle; runnerUp: SinglesStyle },
  athletes: Athlete[],
  n = 3,
  excludeId?: string,
): SinglesMirror[] {
  const pool = athletes.filter((a) => a.sex === user.sex)
  const candidates = excludeId && pool.length > 1 ? pool.filter((a) => a.id !== excludeId) : pool
  const scored = candidates
    .map((athlete) => {
      const { heightDiff, bmiDiff, d } = bodyDistance(user, athlete.heightCm, athlete.weightKg)
      const styleMatch = styleMatchOf(athlete, style)
      const distance = d + 0.25 * STYLE_DISTANCE[styleMatch] + (athlete.status === 'active' ? 0 : INACTIVE_PENALTY)
      return { athlete, distance, heightDiff, bmiDiff, styleMatch, shared: sharedTraits(user, athlete) }
    })
    .sort((x, y) => x.distance - y.distance || x.athlete.id.localeCompare(y.athlete.id))
  return withVariety(scored, user.seed ?? 0, BODY_WINDOW).slice(0, n)
}

export function findDoublesMirrors(user: MirrorUser, role: DoublesRole, pairs: DoublesPair[], n = 3): DoublesMirror[] {
  const candidates: DoublesMirror[] = []
  for (const pair of pairs) {
    pair.players.forEach((p, i) => {
      if (p.sex !== user.sex) return
      const { heightDiff, bmiDiff, d } = bodyDistance(user, p.heightCm, p.weightKg)
      const distance =
        d + POSITION_PENALTY[role][p.position] + eventPenalty(pair.event, user) + (pair.status === 'active' ? 0 : INACTIVE_PENALTY)
      candidates.push({ pair, playerIndex: i as 0 | 1, distance, heightDiff, bmiDiff })
    })
  }
  // Filtro duro por posición; si no queda nadie, se usan todos los candidatos.
  const matching = candidates.filter((c) => ALLOWED_POSITIONS[role].includes(c.pair.players[c.playerIndex].position))
  const pool = matching.length > 0 ? matching : candidates
  pool.sort((x, y) => x.distance - y.distance || x.pair.id.localeCompare(y.pair.id) || x.playerIndex - y.playerIndex)
  const seen = new Set<string>()
  const out: DoublesMirror[] = []
  for (const c of withVariety(pool, user.seed ?? 0, DOUBLES_WINDOW)) {
    if (seen.has(c.pair.id)) continue
    seen.add(c.pair.id)
    out.push(c)
    if (out.length === n) break
  }
  return out
}
