import { describe, expect, it } from 'vitest'
import { ageBandOf, analyzeBody, bmiBandOf, bmiOf, bodyClaims, bodyTypeOf, diagLevel, heightBandOf, heightZOf } from './body'
import type { BmiBand, BodyType, HeightBand, Scores } from './types'

describe('analyzeBody', () => {
  it('reproduce el perfil de las capturas de referencia', () => {
    expect(analyzeBody({ sex: 'F', age: 24, heightCm: 163, weightKg: 51, wingspanCm: 164 })).toEqual({
      bmi: 19.2,
      bmiBand: 'lean',
      heightZ: 0.5,
      heightBand: 'average',
      wingspanCm: 164,
      wingspanAssumed: false,
      apeIndexCm: 1,
      apeRatio: 1.006,
      ageBand: 'prime',
      bodyType: 'lightAgile',
    })
  })
  it('sin envergadura asume la altura', () => {
    const b = analyzeBody({ sex: 'M', age: 30, heightCm: 180, weightKg: 75, wingspanCm: null })
    expect(b.wingspanAssumed).toBe(true)
    expect(b.wingspanCm).toBe(180)
    expect(b.apeIndexCm).toBe(0)
    expect(b.apeRatio).toBe(1)
  })
})

describe('bandas', () => {
  it('IMC redondeado a 1 decimal', () => {
    expect(bmiOf(163, 51)).toBe(19.2)
    expect(bmiOf(180, 75)).toBe(23.1)
  })
  it('límites de IMC', () => {
    expect(bmiBandOf(18.4)).toBe('under')
    expect(bmiBandOf(18.5)).toBe('lean')
    expect(bmiBandOf(20.5)).toBe('normal')
    expect(bmiBandOf(23.5)).toBe('solid')
    expect(bmiBandOf(26)).toBe('heavy')
  })
  it('límites de edad', () => {
    expect([17, 18, 30, 31, 40, 41, 50, 51].map(ageBandOf)).toEqual([
      'youth', 'prime', 'prime', 'thirties', 'thirties', 'forties', 'forties', 'fiftyPlus',
    ])
  })
  it('altura relativa por sexo', () => {
    expect(heightZOf('M', 172)).toBe(0)
    expect(heightZOf('F', 155.5)).toBe(-0.75)
    expect(heightBandOf(-0.75)).toBe('short')
    expect(heightBandOf(0.74)).toBe('average')
    expect(heightBandOf(0.75)).toBe('tall')
  })
  it('身材画像 para las 15 combinaciones', () => {
    const table: [HeightBand, BmiBand, BodyType][] = [
      ['short', 'under', 'compactQuick'], ['short', 'lean', 'compactQuick'], ['short', 'normal', 'compactQuick'],
      ['short', 'solid', 'sturdyPower'], ['short', 'heavy', 'sturdyPower'],
      ['average', 'under', 'lightAgile'], ['average', 'lean', 'lightAgile'], ['average', 'normal', 'balanced'],
      ['average', 'solid', 'sturdyPower'], ['average', 'heavy', 'sturdyPower'],
      ['tall', 'under', 'tallLean'], ['tall', 'lean', 'tallLean'], ['tall', 'normal', 'tallPower'],
      ['tall', 'solid', 'tallPower'], ['tall', 'heavy', 'tallPower'],
    ]
    for (const [h, b, expected] of table) expect(bodyTypeOf(h, b)).toBe(expected)
  })
})

describe('diagnóstico y claims', () => {
  it('diagLevel', () => {
    expect([3.4, 3.5, 6.4, 6.5].map(diagLevel)).toEqual(['weak', 'medium', 'medium', 'strong'])
  })
  it('bodyClaims refleja el nivel actual, no el potencial', () => {
    const current: Scores = { power: 4, endurance: 6, reaction: 2, netTouch: 4, speed: 8, rearCourt: 4, tactics: 2, mental: 6 }
    expect(bodyClaims('compactQuick', current)).toEqual([
      { key: 'speed', kind: 'advantage', level: 'strong' },
      { key: 'reaction', kind: 'advantage', level: 'weak' },
      { key: 'rearCourt', kind: 'disadvantage', level: 'medium' },
    ])
    expect(bodyClaims('balanced', current)).toEqual([])
  })
})
