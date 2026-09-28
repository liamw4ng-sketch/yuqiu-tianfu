import { describe, expect, it } from 'vitest'
import { fitBandOf, keyAbilities, rankSingles, SINGLES_WEIGHTS } from './singles'
import { COUNTER, FLAT_HIGH, GOLDEN, NET_PLAYER, prepare, SMASHER, SPEEDSTER, THINKER } from './testkit'
import type { TalentInput } from './types'

const rank = (input: TalentInput) => {
  const { body, current, blended } = prepare(input)
  return rankSingles(blended, current, body)
}

describe('rankSingles', () => {
  it('perfil de referencia: 四方拉吊控制型 59', () => {
    const r = rank(GOLDEN)
    expect(r.ranking).toEqual([
      { style: 'control', fit: 59 },
      { style: 'attack', fit: 51 },
      { style: 'speed', fit: 51 },
      { style: 'counter', fit: 49 },
      { style: 'allround', fit: 49 },
      { style: 'net', fit: 42 },
    ])
    expect(r.top).toBe('control')
    expect(r.runnerUp).toBe('attack')
    expect(r.margin).toBe(8)
    expect(r.fitBand).toBe('good')
    expect(r.drivers).toEqual(['endurance'])
    expect(r.gaps).toEqual(['tactics', 'netTouch', 'rearCourt'])
  })
  it.each([
    ['rematador alto', SMASHER, 'attack'],
    ['jugador de red', NET_PLAYER, 'net'],
    ['defensor', COUNTER, 'counter'],
    ['táctico', THINKER, 'control'],
    ['rápido', SPEEDSTER, 'speed'],
    ['perfil plano alto', FLAT_HIGH, 'allround'],
  ])('%s → %s', (_name, input, style) => {
    expect(rank(input).top).toBe(style)
  })
  it('los encajes son enteros en [0, 100] y la lista está ordenada', () => {
    const r = rank(SMASHER)
    for (const s of r.ranking) {
      expect(Number.isInteger(s.fit)).toBe(true)
      expect(s.fit).toBeGreaterThanOrEqual(0)
      expect(s.fit).toBeLessThanOrEqual(100)
    }
    for (let i = 1; i < r.ranking.length; i++) expect(r.ranking[i - 1].fit).toBeGreaterThanOrEqual(r.ranking[i].fit)
  })
})

describe('utilidades', () => {
  it('fitBandOf', () => {
    expect([70, 69, 55, 54].map(fitBandOf)).toEqual(['high', 'good', 'good', 'lean'])
  })
  it('keyAbilities ordena por peso y luego por orden canónico', () => {
    expect(keyAbilities(SINGLES_WEIGHTS.control)).toEqual(['endurance', 'tactics', 'netTouch', 'rearCourt'])
  })
  it('los pesos de cada estilo suman 1', () => {
    for (const w of Object.values(SINGLES_WEIGHTS)) {
      expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10)
    }
  })
})
