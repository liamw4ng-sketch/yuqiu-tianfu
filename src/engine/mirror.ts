import type { Athlete, DoublesPair, PairEvent, Position } from '../data/athletes'
import { bmiOf } from './body'
import type { DoublesRole, Preference, Sex, SinglesStyle } from './types'

export interface MirrorUser {
  sex: Sex
  heightCm: number
  bmi: number
  preference: Preference
}
export type StyleMatch = 'primary' | 'secondary' | 'none'
export interface SinglesMirror {
  athlete: Athlete
  distance: number
  heightDiff: number
  bmiDiff: number | null
  styleMatch: StyleMatch
}
export interface DoublesMirror {
  pair: DoublesPair
  playerIndex: 0 | 1
  distance: number
  heightDiff: number
  bmiDiff: number | null
}

const UNKNOWN_BMI_PENALTY = 1
const INACTIVE_PENALTY = 0.2
const STYLE_PENALTY: Record<StyleMatch, number> = { primary: 0, secondary: 0.5, none: 1 }
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

export function findSinglesMirrors(
  user: MirrorUser,
  style: { top: SinglesStyle; runnerUp: SinglesStyle },
  athletes: Athlete[],
  n = 3,
): SinglesMirror[] {
  return athletes
    .filter((a) => a.sex === user.sex)
    .map((athlete) => {
      const { heightDiff, bmiDiff, d } = bodyDistance(user, athlete.heightCm, athlete.weightKg)
      const styleMatch: StyleMatch = athlete.style === style.top ? 'primary' : athlete.style === style.runnerUp ? 'secondary' : 'none'
      const distance = d + STYLE_PENALTY[styleMatch] + (athlete.status === 'active' ? 0 : INACTIVE_PENALTY)
      return { athlete, distance, heightDiff, bmiDiff, styleMatch }
    })
    .sort((x, y) => x.distance - y.distance || x.athlete.id.localeCompare(y.athlete.id))
    .slice(0, n)
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
  candidates.sort((x, y) => x.distance - y.distance || x.pair.id.localeCompare(y.pair.id) || x.playerIndex - y.playerIndex)
  const seen = new Set<string>()
  const out: DoublesMirror[] = []
  for (const c of candidates) {
    if (seen.has(c.pair.id)) continue
    seen.add(c.pair.id)
    out.push(c)
    if (out.length === n) break
  }
  return out
}
