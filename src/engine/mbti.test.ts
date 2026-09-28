import { describe, expect, it } from 'vitest'
import { bestPartner, isMbtiComplete, MBTI_CODES, MBTI_QUESTION_IDS, MBTI_QUESTIONS, scoreMbti, worstPartner, type MbtiQuestionId } from './mbti'

const all = (o: 'a' | 'b') => Object.fromEntries(MBTI_QUESTION_IDS.map((id) => [id, o])) as Record<MbtiQuestionId, 'a' | 'b'>

describe('羽球MBTI', () => {
  it('5 preguntas por eje, con la tabla de polos fijada', () => {
    for (const axis of ['EI', 'SN', 'TF', 'JP'] as const) expect(MBTI_QUESTIONS.filter((q) => q.axis === axis)).toHaveLength(5)
    expect(MBTI_QUESTIONS.slice(0, 8).map((q) => q.aPole).join('')).toBe('ESTJINFP')
  })
  it('todo a → ESTJ al 60%, todo b → INFP al 60%', () => {
    const a = scoreMbti(all('a'))
    expect(a.code).toBe('ESTJ')
    expect(a.axes.EI).toEqual({ first: 3, second: 2, winner: 'E', percent: 60 })
    expect(scoreMbti(all('b')).code).toBe('INFP')
  })
  it('un eje unánime da 100%', () => {
    const answers = { ...all('a'), m05: 'b', m13: 'b' } as Record<MbtiQuestionId, 'a' | 'b'>
    expect(scoreMbti(answers).axes.EI).toEqual({ first: 5, second: 0, winner: 'E', percent: 100 })
  })
  it('nunca hay empate: el código es siempre uno de los 16 en una muestra amplia de combinaciones', () => {
    for (let mask = 0; mask < 4096; mask += 7) {
      const answers = Object.fromEntries(MBTI_QUESTION_IDS.map((id, i) => [id, (mask >> (i % 12)) & 1 ? 'a' : 'b'])) as Record<MbtiQuestionId, 'a' | 'b'>
      expect(MBTI_CODES).toContain(scoreMbti(answers).code)
    }
  })
  it('parejas', () => {
    expect(bestPartner('ESTJ')).toBe('ISTP')
    expect(worstPartner('ESTJ')).toBe('ENFJ')
  })
  it('isMbtiComplete', () => {
    expect(isMbtiComplete(all('a'))).toBe(true)
    const { m01: _omit, ...rest } = all('a')
    expect(isMbtiComplete(rest)).toBe(false)
  })
})
