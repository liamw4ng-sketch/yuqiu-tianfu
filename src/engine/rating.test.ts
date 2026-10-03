import { describe, expect, it } from 'vitest'
import { isRatingComplete, levelFromPercent, RATING_QUESTION_IDS, scoreRating, type RatingOption, type RatingQuestionId } from './rating'

const all = (o: RatingOption) => Object.fromEntries(RATING_QUESTION_IDS.map((id) => [id, o])) as Record<RatingQuestionId, RatingOption>

describe('scoreRating', () => {
  it('todo a → L1, sin topes que mostrar (ninguno baja el nivel)', () => {
    const r = scoreRating(all('a'))
    expect(r.points).toBe(0)
    expect(r.level).toBe(1)
    expect(r.caps).toEqual([])
  })
  it('todo e → L8 sin topes ni avisos', () => {
    const r = scoreRating(all('e'))
    expect(r).toMatchObject({ points: 72, maxPoints: 72, percent: 100, rawLevel: 8, level: 8, caps: [], warnings: [] })
  })
  it('todo c → 50% → L4', () => {
    expect(scoreRating(all('c'))).toMatchObject({ percent: 50, level: 4 })
  })
  it('clear que no llega al fondo limita a L3 y dispara avisos de coherencia', () => {
    const r = scoreRating({ ...all('e'), clear: 'b' })
    expect(r.rawLevel).toBe(8)
    expect(r.level).toBe(3)
    expect(r.warnings).toEqual(['smashNoClear', 'dropNoClear', 'benchmarkMismatch'])
  })
  it('sin torneos reales el máximo es L6', () => {
    expect(scoreRating({ ...all('e'), match: 'b' }).level).toBe(6)
  })
})

describe('utilidades', () => {
  it('levelFromPercent', () => {
    expect([0, 14, 15, 41, 42, 91, 92, 100].map(levelFromPercent)).toEqual([1, 1, 2, 3, 4, 7, 8, 8])
  })
  it('isRatingComplete', () => {
    expect(isRatingComplete(all('c'))).toBe(true)
    const { clear: _omit, ...rest } = all('c')
    expect(isRatingComplete(rest)).toBe(false)
    expect(isRatingComplete({ ...all('c'), clear: 'z' })).toBe(false)
  })
})
