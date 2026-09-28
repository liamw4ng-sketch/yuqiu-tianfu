import { describe, expect, it } from 'vitest'
import { mixedNoteFor, partnerFor, pickDoublesRole } from './doubles'
import { COUNTER, FLAT_HIGH, GOLDEN, NET_PLAYER, prepare, SMASHER, SPEEDSTER, THINKER } from './testkit'
import type { Scores, TalentInput } from './types'

const role = (input: TalentInput) => {
  const { body, current, blended } = prepare(input)
  return pickDoublesRole(blended, current, body, input.sex)
}

describe('pickDoublesRole', () => {
  it('perfil de referencia: 后场 57 con pareja de red', () => {
    expect(role(GOLDEN)).toEqual({
      role: 'back',
      fit: 57,
      fitBand: 'good',
      frontFit: 39,
      backFit: 57,
      partner: { role: 'front', strength: 'reaction' },
      mixedNote: 'femaleBack',
      drivers: ['endurance'],
      gaps: ['power', 'rearCourt'],
    })
  })
  it.each([
    ['rematador alto', SMASHER, 'back'],
    ['jugador de red', NET_PLAYER, 'front'],
    ['defensor', COUNTER, 'front'],
    ['rápido', SPEEDSTER, 'front'],
    ['táctico', THINKER, 'rotation'],
    ['perfil plano alto', FLAT_HIGH, 'rotation'],
  ])('%s → %s', (_name, input, expected) => {
    expect(role(input).role).toBe(expected)
  })
})

describe('pareja y mixto', () => {
  const current: Scores = { power: 8, endurance: 6, reaction: 2, netTouch: 4, speed: 6, rearCourt: 8, tactics: 4, mental: 6 }
  it('la pareja siempre complementa el rol', () => {
    expect(partnerFor('front', current)).toEqual({ role: 'back', strength: 'power' })
    expect(partnerFor('back', current)).toEqual({ role: 'front', strength: 'reaction' })
    expect(partnerFor('rotation', current)).toEqual({ role: 'rotation', strength: 'reaction' })
  })
  it('nota de mixto', () => {
    expect(mixedNoteFor('F', 'back')).toBe('femaleBack')
    expect(mixedNoteFor('M', 'front')).toBe('maleFront')
    expect(mixedNoteFor('F', 'front')).toBe('conventional')
    expect(mixedNoteFor('M', 'back')).toBe('conventional')
    expect(mixedNoteFor('F', 'rotation')).toBe('rotation')
  })
})
