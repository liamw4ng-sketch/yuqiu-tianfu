import { bmiOf } from './body'
import { ABILITY_KEYS, FIELD_TEST_KEYS, type AbilityKey, type FieldTestKey, type Freq, type Hand, type Level, type Preference, type Sex, type TalentInput } from './types'

export type FormField = 'sex' | 'age' | 'heightCm' | 'weightKg' | 'wingspanCm' | 'yearsPlaying' | AbilityKey | FieldTestKey
export type FieldErrorCode = 'required' | 'number' | 'range'
export type WarningCode = 'wingspanDiff' | 'bmiExtreme' | 'minor'

export interface TalentFormValues {
  sex: '' | Sex
  age: string
  heightCm: string
  weightKg: string
  wingspanCm: string
  yearsPlaying: string
  hand: Hand
  freq: Freq
  preference: Preference
  levels: Record<AbilityKey, Level | 0>
  tests: Record<FieldTestKey, string>
}

type NumericField = 'age' | 'heightCm' | 'weightKg' | 'wingspanCm' | 'yearsPlaying' | FieldTestKey
export const RANGES: Record<NumericField, [number, number]> = {
  age: [8, 80],
  heightCm: [130, 220],
  weightKg: [30, 150],
  wingspanCm: [120, 240],
  yearsPlaying: [0, 50],
  verticalJumpCm: [5, 120],
  ropeSkip1Min: [10, 350],
  cooper12MinM: [500, 5000],
  rulerDropCm: [0, 40],
}

export function emptyTalentForm(): TalentFormValues {
  const levels = {} as Record<AbilityKey, Level | 0>
  for (const k of ABILITY_KEYS) levels[k] = 0
  const tests = {} as Record<FieldTestKey, string>
  for (const k of FIELD_TEST_KEYS) tests[k] = ''
  return { sex: '', age: '', heightCm: '', weightKg: '', wingspanCm: '', yearsPlaying: '', hand: 'R', freq: '1', preference: 'all', levels, tests }
}

/** '' → null; admite coma decimal; texto no numérico → NaN. */
export function parseNumber(raw: string): number | null {
  const s = raw.trim().replace(',', '.')
  if (s === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

export function validateTalentForm(v: TalentFormValues): {
  input: TalentInput | null
  errors: Partial<Record<FormField, FieldErrorCode>>
  warnings: WarningCode[]
} {
  const errors: Partial<Record<FormField, FieldErrorCode>> = {}
  const read = (field: NumericField, raw: string, required: boolean): number | null => {
    const n = parseNumber(raw)
    if (n === null) {
      if (required) errors[field] = 'required'
      return null
    }
    if (Number.isNaN(n)) {
      errors[field] = 'number'
      return null
    }
    const [lo, hi] = RANGES[field]
    if (n < lo || n > hi) {
      errors[field] = 'range'
      return null
    }
    return n
  }
  if (v.sex === '') errors.sex = 'required'
  const age = read('age', v.age, true)
  const heightCm = read('heightCm', v.heightCm, true)
  const weightKg = read('weightKg', v.weightKg, true)
  const wingspanCm = read('wingspanCm', v.wingspanCm, false)
  const yearsPlaying = read('yearsPlaying', v.yearsPlaying, true)
  const tests = {} as TalentInput['tests']
  for (const k of FIELD_TEST_KEYS) tests[k] = read(k, v.tests[k], false)
  for (const k of ABILITY_KEYS) if (v.levels[k] === 0) errors[k] = 'required'

  if (Object.keys(errors).length > 0 || v.sex === '' || age === null || heightCm === null || weightKg === null || yearsPlaying === null) {
    return { input: null, errors, warnings: [] }
  }
  const warnings: WarningCode[] = []
  if (wingspanCm !== null && Math.abs(wingspanCm - heightCm) > 20) warnings.push('wingspanDiff')
  const bmi = bmiOf(heightCm, weightKg)
  if (bmi < 16 || bmi > 35) warnings.push('bmiExtreme')
  if (age < 16) warnings.push('minor')
  return {
    input: {
      sex: v.sex, age, heightCm, weightKg, wingspanCm, yearsPlaying,
      hand: v.hand, freq: v.freq, preference: v.preference,
      levels: v.levels as Record<AbilityKey, Level>,
      tests,
    },
    errors,
    warnings,
  }
}
