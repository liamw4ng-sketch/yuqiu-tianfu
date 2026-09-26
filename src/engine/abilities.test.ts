import { describe, expect, it } from 'vitest'
import { blendFactor, blendScores, bodyTendency, currentScores, interpolate, testScore } from './abilities'
import { analyzeBody } from './body'
import type { AbilityKey, FieldTests, Level } from './types'

const NO_TESTS: FieldTests = { verticalJumpCm: null, ropeSkip1Min: null, cooper12MinM: null, rulerDropCm: null }
const GOLDEN_LEVELS: Record<AbilityKey, Level> = {
  power: 2, endurance: 3, reaction: 1, netTouch: 2, speed: 2, rearCourt: 2, tactics: 1, mental: 3,
}
const goldenBody = analyzeBody({ sex: 'F', age: 24, heightCm: 163, weightKg: 51, wingspanCm: 164 })

describe('pruebas reales', () => {
  it('interpolate limita en los extremos e interpola en medio', () => {
    const curve: [number, number][] = [[20, 2], [30, 4], [40, 6], [50, 8], [60, 10]]
    expect(interpolate(curve, 10)).toBe(2)
    expect(interpolate(curve, 70)).toBe(10)
    expect(interpolate(curve, 25)).toBe(3)
  })
  it('la regla puntúa mejor cuanto menos cae', () => {
    expect(testScore('rulerDropCm', 12.5, 'M')).toBe(7)
    expect(testScore('rulerDropCm', 30, 'F')).toBe(2)
  })
  it('normas por sexo en el salto', () => {
    expect(testScore('verticalJumpCm', 30, 'F')).toBe(6)
    expect(testScore('verticalJumpCm', 30, 'M')).toBe(4)
  })
})

describe('currentScores', () => {
  it('convierte niveles 1–5 en 2–10', () => {
    expect(currentScores({ sex: 'F', levels: GOLDEN_LEVELS, tests: NO_TESTS })).toEqual({
      power: 4, endurance: 6, reaction: 2, netTouch: 4, speed: 4, rearCourt: 4, tactics: 2, mental: 6,
    })
  })
  it('promedia autoevaluación y prueba cuando existe', () => {
    const s = currentScores({ sex: 'F', levels: GOLDEN_LEVELS, tests: { ...NO_TESTS, verticalJumpCm: 30, ropeSkip1Min: 140 } })
    expect(s.power).toBe(5) // (4 + 6) / 2
    expect(s.speed).toBe(5) // (4 + 6) / 2 — la comba ajusta 移动速度
  })
})

describe('tendencia corporal y mezcla', () => {
  it('tendencia del perfil de referencia', () => {
    const t = bodyTendency(goldenBody)
    expect(t.power).toBeCloseTo(5.1, 6)
    expect(t.endurance).toBeCloseTo(5.5, 6)
    expect(t.reaction).toBeCloseTo(5.1, 6)
    expect(t.netTouch).toBeCloseTo(5.05, 6)
    expect(t.speed).toBeCloseTo(5.5, 6)
    expect(t.rearCourt).toBeCloseTo(5.37, 6)
  })
  it('la tendencia se mantiene en [1, 9.5] con cuerpos extremos', () => {
    const extreme = analyzeBody({ sex: 'F', age: 70, heightCm: 215, weightKg: 150, wingspanCm: 240 })
    for (const v of Object.values(bodyTendency(extreme))) {
      expect(v).toBeGreaterThanOrEqual(1)
      expect(v).toBeLessThanOrEqual(9.5)
    }
  })
  it('blendFactor por años de juego', () => {
    expect([0.5, 1, 3, 3.5].map(blendFactor)).toEqual([0.5, 0.65, 0.65, 0.8])
  })
  it('mezcla del perfil de referencia (tactics y mental tiran hacia 5)', () => {
    const current = currentScores({ sex: 'F', levels: GOLDEN_LEVELS, tests: NO_TESTS })
    const b = blendScores(current, bodyTendency(goldenBody), 2)
    const expected = { power: 4.385, endurance: 5.825, reaction: 3.085, netTouch: 4.3675, speed: 4.525, rearCourt: 4.4795, tactics: 3.05, mental: 5.65 }
    for (const [k, v] of Object.entries(expected)) expect(b[k as AbilityKey]).toBeCloseTo(v, 6)
  })
})
