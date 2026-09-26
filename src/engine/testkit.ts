import { blendScores, bodyTendency, currentScores } from './abilities'
import { analyzeBody } from './body'
import { ABILITY_KEYS, type AbilityKey, type Level, type Sex, type TalentInput } from './types'

/** Patrón de 8 niveles en el orden de ABILITY_KEYS. */
export function levelsOf(pattern: Level[]): Record<AbilityKey, Level> {
  const out = {} as Record<AbilityKey, Level>
  ABILITY_KEYS.forEach((k, i) => (out[k] = pattern[i]))
  return out
}

export function makeInput(
  sex: Sex, age: number, heightCm: number, weightKg: number, wingspanCm: number | null, yearsPlaying: number, pattern: Level[],
): TalentInput {
  return {
    sex, age, heightCm, weightKg, wingspanCm, yearsPlaying,
    hand: 'R', freq: '2-3', preference: 'all',
    levels: levelsOf(pattern),
    tests: { verticalJumpCm: null, ropeSkip1Min: null, cooper12MinM: null, rulerDropCm: null },
  }
}

export function prepare(input: TalentInput) {
  const body = analyzeBody(input)
  const current = currentScores(input)
  const blended = blendScores(current, bodyTendency(body), input.yearsPlaying)
  return { body, current, blended }
}

// Casos verificados con el prototipo (docs/superpowers/prototype/cases.ts)
export const GOLDEN = makeInput('F', 24, 163, 51, 164, 2, [2, 3, 1, 2, 2, 2, 1, 3])
export const SMASHER = makeInput('M', 25, 188, 80, null, 6, [5, 3, 2, 2, 3, 5, 2, 3])
export const NET_PLAYER = makeInput('F', 25, 160, 52, null, 4, [2, 2, 4, 5, 3, 2, 4, 3])
export const COUNTER = makeInput('M', 28, 170, 62, null, 5, [2, 4, 5, 3, 4, 2, 3, 5])
export const THINKER = makeInput('M', 35, 175, 70, null, 8, [2, 4, 2, 4, 3, 4, 5, 4])
export const SPEEDSTER = makeInput('F', 22, 158, 48, null, 3, [4, 3, 4, 3, 5, 2, 2, 3])
export const FLAT_HIGH = makeInput('M', 26, 172, 66, null, 6, [4, 4, 4, 4, 4, 4, 4, 4])
