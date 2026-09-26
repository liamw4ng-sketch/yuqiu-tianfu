import { describe, expect, it } from 'vitest'
import { athleteErrors, pairErrors, PAIRS, SINGLES } from './athletes'

describe('jugadores de individual', () => {
  it('todos los registros son válidos', () => {
    expect(SINGLES.flatMap(athleteErrors)).toEqual([])
  })
  it('hay al menos 20 por sexo y los ids son únicos', () => {
    expect(SINGLES.filter((a) => a.sex === 'M').length).toBeGreaterThanOrEqual(20)
    expect(SINGLES.filter((a) => a.sex === 'F').length).toBeGreaterThanOrEqual(20)
    expect(new Set(SINGLES.map((a) => a.id)).size).toBe(SINGLES.length)
  })
  it('cubre cuerpos bajos y altos de cada sexo', () => {
    const f = SINGLES.filter((a) => a.sex === 'F').map((a) => a.heightCm)
    const m = SINGLES.filter((a) => a.sex === 'M').map((a) => a.heightCm)
    expect(Math.min(...f)).toBeLessThanOrEqual(163)
    expect(Math.max(...f)).toBeGreaterThanOrEqual(174)
    expect(Math.min(...m)).toBeLessThanOrEqual(175)
    expect(Math.max(...m)).toBeGreaterThanOrEqual(188)
  })
  it('los 6 estilos tienen al menos un representante', () => {
    expect(new Set(SINGLES.map((a) => a.style)).size).toBe(6)
  })
  it('Kunlavut Vitidsarn usa la altura de la BWF (decisión del usuario)', () => {
    expect(SINGLES.find((a) => a.id === 'kunlavut-vitidsarn')?.heightCm).toBe(173)
  })
})

describe('parejas de dobles', () => {
  it('todas las parejas son válidas', () => {
    expect(PAIRS.flatMap(pairErrors)).toEqual([])
  })
  it('hay al menos 6 parejas por prueba y ids únicos', () => {
    for (const ev of ['MD', 'WD', 'XD'] as const) {
      expect(PAIRS.filter((p) => p.event === ev).length).toBeGreaterThanOrEqual(6)
    }
    expect(new Set(PAIRS.map((p) => p.id)).size).toBe(PAIRS.length)
  })
  it('hay jugadoras y jugadores de red y de fondo', () => {
    const players = PAIRS.flatMap((p) => p.players)
    for (const sex of ['M', 'F'] as const) {
      for (const pos of ['front', 'back'] as const) {
        expect(players.some((x) => x.sex === sex && x.position === pos)).toBe(true)
      }
    }
  })
})
