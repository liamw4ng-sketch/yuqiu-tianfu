import { describe, expect, it } from 'vitest'
import { DRILLS, pickDrills } from './drills'
import { ABILITY_KEYS, SINGLES_STYLES, type Scores } from './types'

const golden: Scores = { power: 4, endurance: 6, reaction: 2, netTouch: 4, speed: 4, rearCourt: 4, tactics: 2, mental: 6 }

describe('pickDrills', () => {
  it('perfil de referencia con estilo control', () => {
    expect(pickDrills('control', golden)).toEqual(['rallyControl', 'netSpinning', 'shadowFootwork'])
  })
  it('siempre 3 ejercicios distintos para cualquier estilo', () => {
    for (const style of SINGLES_STYLES) {
      const d = pickDrills(style, golden)
      expect(d).toHaveLength(3)
      expect(new Set(d).size).toBe(3)
    }
  })
  it('cada capacidad tiene al menos un ejercicio', () => {
    for (const k of ABILITY_KEYS) expect(DRILLS.some((d) => (d.targets as readonly string[]).includes(k))).toBe(true)
  })
})
