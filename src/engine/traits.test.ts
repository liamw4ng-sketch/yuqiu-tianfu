import { describe, expect, it } from 'vitest'
import { PREF_KEYS, PREF_OPTIONS, type Prefs } from './prefs'
import { athleteTraitVector, isTrait, TRAIT_KEYS, TRAIT_POINTS, topTraits, traitSimilarity, userTraits } from './traits'

const CORE: Prefs = { scoring: 'rally', midcourt: 'push', tempo: 'adapt', underAttack: 'lift', rally: 'either', doublesSpot: 'none' }

describe('rasgos (球风特点)', () => {
  it('8 rasgos en orden fijo', () => {
    expect(TRAIT_KEYS).toEqual(['power', 'deception', 'net', 'defense', 'stamina', 'speed', 'placement', 'fight'])
    expect(isTrait('net')).toBe(true)
    expect(isTrait('smash')).toBe(false)
  })
  it('cada opción de cada pregunta tiene puntos de rasgo válidos', () => {
    for (const k of PREF_KEYS) {
      for (const o of PREF_OPTIONS[k]) {
        const pts = TRAIT_POINTS[k][o]
        expect(pts, `${k}.${o}`).toBeDefined()
        for (const t of Object.keys(pts)) expect(isTrait(t), `${k}.${o}.${t}`).toBe(true)
      }
    }
  })
  it('sin gustos: vector a cero y sin rasgos principales', () => {
    const v = userTraits(undefined)
    for (const t of TRAIT_KEYS) expect(v[t]).toBe(0)
    expect(topTraits(v)).toEqual([])
  })
  it('quien elige engaño y fintas frecuentes tiene el engaño como primer rasgo', () => {
    const v = userTraits({ ...CORE, signature: 'deception', feints: 'often' })
    expect(topTraits(v)[0]).toBe('deception')
  })
  it('un registro v2 (6 respuestas) da rasgos sin fallar', () => {
    const v = userTraits({ scoring: 'smash', midcourt: 'smash', tempo: 'fast', underAttack: 'drive', rally: 'short', doublesSpot: 'back' })
    expect(topTraits(v)[0]).toBe('power')
    for (const t of TRAIT_KEYS) expect(Number.isFinite(v[t])).toBe(true)
  })
  it('topTraits: como mucho n, solo > 0, empates por el orden del vocabulario', () => {
    const v = { power: 1, deception: 0, net: 1, defense: 0, stamina: 3, speed: 0, placement: 0, fight: 0 }
    expect(topTraits(v)).toEqual(['stamina', 'power', 'net'])
    expect(topTraits(v, 1)).toEqual(['stamina'])
  })
  it('vector del jugador: 1, 0.7 y 0.5 por orden', () => {
    const a = athleteTraitVector(['deception', 'net', 'speed'])
    expect(a.deception).toBe(1)
    expect(a.net).toBe(0.7)
    expect(a.speed).toBe(0.5)
    expect(a.power).toBe(0)
  })
  it('similitud coseno entre 0 y 1; 0 si el usuario no tiene puntos', () => {
    const a = athleteTraitVector(['deception', 'net'])
    expect(traitSimilarity(a, a)).toBeCloseTo(1)
    expect(traitSimilarity(athleteTraitVector(['power', 'fight']), a)).toBe(0)
    expect(traitSimilarity(userTraits(undefined), a)).toBe(0)
  })
})
