import { LEVEL_SCORE, TENDENCY_AGE_ADJ, TENDENCY_APE_COEF, TENDENCY_BMI_ADJ, TENDENCY_HEIGHT_COEF } from './constants'
import { clamp } from './stats'
import {
  ABILITY_KEYS,
  FIELD_TEST_KEYS,
  RADAR_KEYS,
  type BodyProfile,
  type FieldTestKey,
  type RadarKey,
  type RadarScores,
  type Scores,
  type Sex,
  type TalentInput,
} from './types'

type Curve = [number, number][]

export const TEST_TARGET: Record<FieldTestKey, RadarKey> = {
  verticalJumpCm: 'power',
  ropeSkip1Min: 'speed',
  cooper12MinM: 'endurance',
  rulerDropCm: 'reaction',
}

// Curvas (valor → nota 0–10), ordenadas por valor ascendente. Ver sports_science.md para la procedencia.
export const TEST_NORMS: Record<FieldTestKey, Record<Sex, Curve>> = {
  verticalJumpCm: {
    M: [[20, 2], [30, 4], [40, 6], [50, 8], [60, 10]],
    F: [[14, 2], [22, 4], [30, 6], [38, 8], [46, 10]],
  },
  ropeSkip1Min: {
    M: [[80, 2], [110, 4], [140, 6], [170, 8], [200, 10]],
    F: [[80, 2], [110, 4], [140, 6], [170, 8], [200, 10]],
  },
  cooper12MinM: {
    M: [[1600, 2], [2000, 4], [2300, 6], [2600, 8], [2900, 10]],
    F: [[1500, 2], [1800, 4], [2100, 6], [2400, 8], [2700, 10]],
  },
  rulerDropCm: {
    M: [[5, 10], [10, 8], [15, 6], [20, 4], [25, 2]],
    F: [[5, 10], [10, 8], [15, 6], [20, 4], [25, 2]],
  },
}

export function interpolate(curve: Curve, x: number): number {
  if (x <= curve[0][0]) return curve[0][1]
  const last = curve[curve.length - 1]
  if (x >= last[0]) return last[1]
  for (let i = 1; i < curve.length; i++) {
    const [x1, y1] = curve[i]
    if (x <= x1) {
      const [x0, y0] = curve[i - 1]
      return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
    }
  }
  return last[1]
}

export function testScore(key: FieldTestKey, value: number, sex: Sex): number {
  return interpolate(TEST_NORMS[key][sex], value)
}

export function currentScores(input: Pick<TalentInput, 'sex' | 'levels' | 'tests'>): Scores {
  const out = {} as Scores
  for (const k of ABILITY_KEYS) out[k] = LEVEL_SCORE[input.levels[k]]
  for (const t of FIELD_TEST_KEYS) {
    const value = input.tests[t]
    if (value == null || !Number.isFinite(value)) continue
    const target = TEST_TARGET[t]
    out[target] = (out[target] + testScore(t, value, input.sex)) / 2
  }
  return out
}

export function bodyTendency(body: BodyProfile): RadarScores {
  const out = {} as RadarScores
  for (const k of RADAR_KEYS) {
    const raw =
      5 +
      TENDENCY_HEIGHT_COEF[k] * clamp(body.heightZ, -2, 2) +
      TENDENCY_APE_COEF[k] * clamp(body.apeIndexCm, -8, 8) +
      TENDENCY_BMI_ADJ[k][body.bmiBand] +
      TENDENCY_AGE_ADJ[body.ageBand][k]
    out[k] = clamp(raw, 1, 9.5)
  }
  return out
}

export function blendFactor(years: number): number {
  if (years < 1) return 0.5
  if (years <= 3) return 0.65
  return 0.8
}

/** Mezcla capacidad actual y tendencia corporal. tactics y mental se mezclan con un 5 neutro. */
export function blendScores(current: Scores, tendency: RadarScores, years: number): Scores {
  const a = blendFactor(years)
  const out = {} as Scores
  for (const k of ABILITY_KEYS) {
    const t = (RADAR_KEYS as readonly string[]).includes(k) ? tendency[k as RadarKey] : 5
    out[k] = a * current[k] + (1 - a) * t
  }
  return out
}
