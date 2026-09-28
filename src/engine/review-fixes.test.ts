import { describe, expect, it } from 'vitest'
import { analyzeBody } from './body'
import { pickDrills } from './drills'
import { analyzeTalent } from './talent'
import { makeInput } from './testkit'
import type { Scores } from './types'

describe('revisión final: coherencia del informe', () => {
  it('身材画像 no afirma una ventaja o desventaja que la capa de tendencia contradice', () => {
    for (const sex of ['M', 'F'] as const)
      for (const h of sex === 'M' ? [160, 168, 176, 184, 190] : [150, 157, 164, 171, 177])
        for (const bmi of [17.5, 20, 23, 26, 30])
          for (const age of [20, 35, 55]) {
            const w = Math.round(bmi * (h / 100) ** 2)
            const r = analyzeTalent(makeInput(sex, age, h, w, null, 2, [3, 3, 3, 3, 3, 3, 3, 3]))
            for (const c of r.bodyClaims) {
              const t = r.tendency[c.key]
              if (c.kind === 'advantage') expect(t, `${sex} ${h}/${w} ${age} ${c.key}`).toBeGreaterThan(5)
              else expect(t, `${sex} ${h}/${w} ${age} ${c.key}`).toBeLessThan(5)
            }
          }
  })
  it('un jugador flojo en todo no recibe un encaje "alto"', () => {
    const r = analyzeTalent(makeInput('M', 25, 180, 72, null, 2, [2, 1, 1, 1, 1, 2, 1, 1]))
    expect(r.singles.fitBand).not.toBe('high')
    expect(r.doubles.fitBand).not.toBe('high')
    const strong = analyzeTalent(makeInput('M', 25, 180, 72, null, 2, [5, 5, 5, 5, 5, 5, 5, 5]))
    expect(strong.singles.ranking[0].fit).toBeGreaterThan(r.singles.ranking[0].fit)
  })
  it('con el clear como punto débil, recomienda el ejercicio de clear y no remates', () => {
    const current: Scores = { power: 6, endurance: 6, reaction: 6, netTouch: 6, speed: 6, rearCourt: 2, tactics: 6, mental: 6 }
    const d = pickDrills('attack', current)
    expect(d[0]).toBe('clearToBaseline')
  })
  it('la diferencia de envergadura se redondea a 1 decimal', () => {
    expect(analyzeBody({ sex: 'F', age: 24, heightCm: 163.3, weightKg: 51, wingspanCm: 164.1 }).apeIndexCm).toBe(0.8)
  })
})
