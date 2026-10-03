import { describe, expect, it } from 'vitest'
import type { DoublesPair, DoublesPlayer, Position } from '../data/athletes'
import { partnerFor } from './doubles'
import { pickDrills } from './drills'
import { findDoublesMirrors } from './mirror'
import { scoreRating, RATING_QUESTION_IDS, type RatingOption, type RatingQuestionId } from './rating'
import { analyzeTalent } from './talent'
import { makeInput } from './testkit'
import type { RadarScores, Scores, Sex } from './types'
import { emptyTalentForm, validateTalentForm } from './validate'

const L = { zh: 'x', es: 'x' }
const player = (sex: Sex, h: number, w: number | null, position: Position): DoublesPlayer => ({
  nameEn: `${sex}${h}${position}`, nameZh: 'x', sex, heightCm: h, weightKg: w, hand: 'R', position, role: L,
})
const pair = (id: string, a: DoublesPlayer, b: DoublesPlayer): DoublesPair => ({
  id, event: 'WD', pairZh: id, pairEn: id, country: L, status: 'active', highlights: L, style: L, players: [a, b],
})

describe('detalles menores', () => {
  it('业余评级 solo lista los topes que de verdad bajaron el nivel', () => {
    const all = (o: RatingOption) => Object.fromEntries(RATING_QUESTION_IDS.map((id) => [id, o])) as Record<RatingQuestionId, RatingOption>
    expect(scoreRating(all('a')).caps).toEqual([])
    const r = scoreRating({ ...all('e'), clear: 'b', match: 'b' })
    expect(r.level).toBe(3)
    expect(r.caps).toEqual([{ question: 'clear', maxLevel: 3 }, { question: 'match', maxLevel: 6 }])
  })
  it('el espejo de dobles exige la posición del rol cuando hay candidatos', () => {
    const user = { sex: 'F' as const, heightCm: 163, bmi: 19.2, preference: 'all' as const }
    const pairs = [pair('p-back-twin', player('F', 163, 51, 'back'), player('F', 150, 45, 'back')), pair('p-front-far', player('F', 175, 65, 'front'), player('F', 176, 66, 'back'))]
    const r = findDoublesMirrors(user, 'front', pairs)
    expect(r.map((m) => m.pair.id)).toEqual(['p-front-far'])
  })
  it('principiantes: el primer ejercicio es de fundamentos (footwork)', () => {
    const current: Scores = { power: 4, endurance: 4, reaction: 4, netTouch: 2, speed: 4, rearCourt: 4, tactics: 4, mental: 4 }
    expect(pickDrills('net', current, true)[0]).toBe('shadowFootwork')
    expect(pickDrills('net', current)[0]).toBe('netSpinning')
  })
  it('menores de 18: sin avisos ni flags de IMC de adulto', () => {
    const kid = analyzeTalent(makeInput('F', 12, 145, 32, null, 1, [3, 3, 3, 3, 3, 3, 3, 3]))
    expect(kid.flags).not.toContain('bmiLow')
    const form = { ...emptyTalentForm(), sex: 'F' as const, age: '12', heightCm: '145', weightKg: '32', yearsPlaying: '1' }
    for (const k of Object.keys(form.levels) as (keyof typeof form.levels)[]) form.levels[k] = 3
    expect(validateTalentForm(form).warnings).not.toContain('bmiExtreme')
  })
  it('全能轮转 con perfil plano: la pareja complementa la capacidad con menor tendencia corporal', () => {
    const flat: Scores = { power: 6, endurance: 6, reaction: 6, netTouch: 6, speed: 6, rearCourt: 6, tactics: 6, mental: 6 }
    const tendency: RadarScores = { power: 5.5, endurance: 5.2, reaction: 5, netTouch: 4.6, speed: 5.1, rearCourt: 5.3 }
    expect(partnerFor('rotation', flat, tendency)).toEqual({ role: 'rotation', strength: 'netTouch' })
  })
})
