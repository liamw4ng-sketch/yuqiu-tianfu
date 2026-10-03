import { preferredStyle, singlesPreference, type Prefs } from './prefs'
import { clamp, correlation, mean, sd } from './stats'
import {
  ABILITY_KEYS,
  SINGLES_STYLES,
  type AbilityKey,
  type BmiBand,
  type BodyProfile,
  type FitBand,
  type Scores,
  type SinglesResult,
  type SinglesStyle,
} from './types'

export type Weights = Record<AbilityKey, number>

export const makeWeights = (p: Partial<Weights>): Weights => ({
  power: 0, endurance: 0, reaction: 0, netTouch: 0, speed: 0, rearCourt: 0, tactics: 0, mental: 0, ...p,
})

export const SINGLES_WEIGHTS: Record<Exclude<SinglesStyle, 'allround'>, Weights> = {
  attack: makeWeights({ power: 0.3, rearCourt: 0.25, speed: 0.15, endurance: 0.1, reaction: 0.05, netTouch: 0.05, tactics: 0.05, mental: 0.05 }),
  control: makeWeights({ endurance: 0.25, tactics: 0.25, rearCourt: 0.15, netTouch: 0.15, speed: 0.1, mental: 0.1 }),
  counter: makeWeights({ reaction: 0.25, speed: 0.2, endurance: 0.2, mental: 0.15, netTouch: 0.1, tactics: 0.1 }),
  speed: makeWeights({ speed: 0.3, reaction: 0.2, power: 0.2, netTouch: 0.15, endurance: 0.15 }),
  net: makeWeights({ netTouch: 0.35, tactics: 0.2, reaction: 0.15, speed: 0.1, mental: 0.1, rearCourt: 0.1 }),
}

export const toVector = (s: Scores): number[] => ABILITY_KEYS.map((k) => s[k])

/** Cuánto se diferencia el perfil (0–1). Un perfil casi plano no debe dar encajes extremos. */
export const spreadOf = (u: readonly number[]): number => Math.min(1, sd(u) / 1.0)

/** Encaje 0–100: capacidades 50 %, gustos (球风偏好) 30 %, cuerpo 20 %. */
export const FIT_WEIGHTS = { ability: 0.5, pref: 0.3, body: 0.2 } as const
export const fitFrom = (ability01: number, pref01: number, body01: number): number =>
  Math.round(100 * (FIT_WEIGHTS.ability * ability01 + FIT_WEIGHTS.pref * pref01 + FIT_WEIGHTS.body * body01))

export function fitBandOf(fit: number): FitBand {
  if (fit >= 70) return 'high'
  if (fit >= 55) return 'good'
  return 'lean'
}

/**
 * Encaje con un estilo (0–1): 60 % forma del perfil (correlación con los pesos, amortiguada si el perfil es plano)
 * + 40 % nivel absoluto en las capacidades que el estilo pide (suma ponderada normalizada, spec §5.3.4).
 */
/**
 * La banda de encaje también exige capacidad real: sin ninguna capacidad clave ≥ 6 no pasa de 'good',
 * y si todas las capacidades clave son carencias (≤ 4) queda en 'lean' (初步倾向).
 */
export function cappedFitBand(fit: number, keys: AbilityKey[], drivers: AbilityKey[], gaps: AbilityKey[]): FitBand {
  if (keys.length > 0 && gaps.length === keys.length) return 'lean'
  const band = fitBandOf(fit)
  return band === 'high' && drivers.length === 0 ? 'good' : band
}

export function profileMatch(u: readonly number[], weights: Weights): number {
  const shape = (correlation(u, toVector(weights)) * spreadOf(u) + 1) / 2
  const level = ABILITY_KEYS.reduce((s, k, i) => s + weights[k] * u[i], 0) / 10
  return 0.6 * shape + 0.4 * level
}

export function allroundMatch(u: readonly number[]): number {
  return (1 - Math.min(sd(u) / 2.5, 1)) * Math.min(1, mean(u) / 6.5)
}

const olderBand = (b: BodyProfile) => b.ageBand === 'forties' || b.ageBand === 'fiftyPlus'
const byBmi = (b: BmiBand, table: Record<BmiBand, number>) => table[b]

export function singlesBodyFit(style: SinglesStyle, body: BodyProfile): number {
  const z = clamp(body.heightZ, -1.5, 1.5)
  const b = body.bmiBand
  let v = 0.6
  switch (style) {
    case 'attack':
      v = 0.5 + 0.2 * z + byBmi(b, { under: -0.25, lean: -0.1, normal: 0.1, solid: 0.15, heavy: -0.05 }) + (body.apeIndexCm >= 5 ? 0.05 : 0)
      break
    case 'control':
      v = 0.6 + byBmi(b, { under: -0.1, lean: 0.1, normal: 0.1, solid: -0.05, heavy: -0.2 }) + (olderBand(body) ? 0.1 : 0)
      break
    case 'counter':
      v = 0.5 - 0.15 * z + byBmi(b, { under: 0, lean: 0.1, normal: 0.05, solid: -0.1, heavy: -0.25 }) + (body.apeIndexCm >= 3 ? 0.1 : 0)
      break
    case 'speed':
      v =
        0.5 -
        0.15 * z +
        byBmi(b, { under: -0.05, lean: 0.2, normal: 0.1, solid: -0.15, heavy: -0.3 }) +
        { youth: 0, prime: 0, thirties: -0.05, forties: -0.15, fiftyPlus: -0.25 }[body.ageBand]
      break
    case 'net':
      v = 0.6 + (olderBand(body) ? 0.05 : 0)
      break
    case 'allround':
      v = 0.6 + (b === 'lean' || b === 'normal' ? 0.05 : 0)
      break
  }
  return clamp(v, 0, 1)
}

/** Capacidades con peso ≥ 0.15, ordenadas por peso y luego por orden canónico. */
export function keyAbilities(weights: Weights): AbilityKey[] {
  return ABILITY_KEYS.filter((k) => weights[k] >= 0.15).sort(
    (a, b) => weights[b] - weights[a] || ABILITY_KEYS.indexOf(a) - ABILITY_KEYS.indexOf(b),
  )
}

const DRIVER_FROM = 6
const GAP_UP_TO = 4

export function driversAndGaps(keys: AbilityKey[], current: Scores) {
  return {
    drivers: keys.filter((k) => current[k] >= DRIVER_FROM),
    gaps: keys.filter((k) => current[k] <= GAP_UP_TO),
  }
}

function rankStyles(u: number[], body: BodyProfile, pref: Record<SinglesStyle, number>) {
  return SINGLES_STYLES.map((style) => {
    const match = style === 'allround' ? allroundMatch(u) : profileMatch(u, SINGLES_WEIGHTS[style])
    return { style, fit: fitFrom(match, pref[style], singlesBodyFit(style, body)) }
  }).sort((a, b) => b.fit - a.fit || SINGLES_STYLES.indexOf(a.style) - SINGLES_STYLES.indexOf(b.style))
}

export function rankSingles(blended: Scores, current: Scores, body: BodyProfile, prefs?: Prefs): SinglesResult {
  const u = toVector(blended)
  const ranking = rankStyles(u, body, singlesPreference(prefs))
  const abilityTop = prefs ? rankStyles(u, body, singlesPreference(undefined))[0].style : ranking[0].style
  const top = ranking[0].style
  let drivers: AbilityKey[]
  let gaps: AbilityKey[]
  let keys: AbilityKey[]
  if (top === 'allround') {
    keys = [...ABILITY_KEYS].sort((a, b) => current[b] - current[a] || ABILITY_KEYS.indexOf(a) - ABILITY_KEYS.indexOf(b))
    const dg = driversAndGaps(keys, current)
    drivers = dg.drivers.slice(0, 2)
    gaps = dg.gaps.slice(-2)
  } else {
    keys = keyAbilities(SINGLES_WEIGHTS[top])
    ;({ drivers, gaps } = driversAndGaps(keys, current))
  }
  return {
    ranking,
    top,
    runnerUp: ranking[1].style,
    margin: ranking[0].fit - ranking[1].fit,
    fitBand: cappedFitBand(ranking[0].fit, keys, drivers, gaps),
    drivers,
    gaps,
    preferred: preferredStyle(prefs),
    abilityTop,
  }
}
