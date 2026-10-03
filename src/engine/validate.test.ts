import { describe, expect, it } from 'vitest'
import { emptyTalentForm, parseNumber, validateTalentForm, type TalentFormValues } from './validate'

const goldenForm = (): TalentFormValues => ({
  ...emptyTalentForm(),
  sex: 'F', age: '24', heightCm: '163', weightKg: '51', wingspanCm: '164', yearsPlaying: '2',
  levels: { power: 2, endurance: 3, reaction: 1, netTouch: 2, speed: 2, rearCourt: 2, tactics: 1, mental: 3 },
  prefs: { scoring: 'rally', midcourt: 'push', tempo: 'grind', underAttack: 'lift', rally: 'long', doublesSpot: 'front' },
})

describe('parseNumber', () => {
  it('acepta coma decimal española y espacios', () => {
    expect(parseNumber(' 51,5 ')).toBe(51.5)
    expect(parseNumber('1.5')).toBe(1.5)
  })
  it('vacío → null, texto → NaN', () => {
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('abc')).toBeNaN()
  })
})

describe('validateTalentForm', () => {
  it('formulario válido → TalentInput', () => {
    const r = validateTalentForm(goldenForm())
    expect(r.errors).toEqual({})
    expect(r.warnings).toEqual([])
    expect(r.input).toMatchObject({ sex: 'F', age: 24, heightCm: 163, weightKg: 51, wingspanCm: 164, yearsPlaying: 2 })
    expect(r.input?.tests).toEqual({ verticalJumpCm: null, ropeSkip1Min: null, cooper12MinM: null, rulerDropCm: null })
    expect(r.input?.prefs).toEqual({ scoring: 'rally', midcourt: 'push', tempo: 'grind', underAttack: 'lift', rally: 'long', doublesSpot: 'front' })
  })
  it('las 6 preguntas de 球风偏好 son obligatorias', () => {
    const r = validateTalentForm({ ...goldenForm(), prefs: { ...goldenForm().prefs, tempo: '', doublesSpot: '' } })
    expect(r.input).toBeNull()
    expect(r.errors.tempo).toBe('required')
    expect(r.errors.doublesSpot).toBe('required')
  })
  it('vacío → required en todos los obligatorios', () => {
    const r = validateTalentForm(emptyTalentForm())
    expect(r.input).toBeNull()
    for (const f of ['sex', 'age', 'heightCm', 'weightKg', 'yearsPlaying', 'power', 'mental'] as const) {
      expect(r.errors[f]).toBe('required')
    }
    expect(r.errors.wingspanCm).toBeUndefined()
  })
  it('números inválidos y fuera de rango', () => {
    const r = validateTalentForm({ ...goldenForm(), age: 'veinte', heightCm: '250', tests: { ...emptyTalentForm().tests, rulerDropCm: '60' } })
    expect(r.errors.age).toBe('number')
    expect(r.errors.heightCm).toBe('range')
    expect(r.errors.rulerDropCm).toBe('range')
  })
  it('coma decimal en peso y años', () => {
    const r = validateTalentForm({ ...goldenForm(), weightKg: '51,5', yearsPlaying: '1,5' })
    expect(r.input?.weightKg).toBe(51.5)
    expect(r.input?.yearsPlaying).toBe(1.5)
  })
  it('avisos no bloqueantes', () => {
    expect(validateTalentForm({ ...goldenForm(), wingspanCm: '190' }).warnings).toEqual(['wingspanDiff'])
    expect(validateTalentForm({ ...goldenForm(), age: '14' }).warnings).toEqual(['minor'])
    expect(validateTalentForm({ ...goldenForm(), weightKg: '40' }).warnings).toEqual(['bmiExtreme'])
  })
})
