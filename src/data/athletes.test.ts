import { describe, expect, it } from 'vitest'
import { isTrait } from '../engine/traits'
import { athleteErrors, pairErrors, PAIRS, RETIRED_BEFORE_CUTOFF_NO_YEAR, RETIRED_CUTOFF_YEAR, SINGLES } from './athletes'

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
  it('cada jugador tiene 2–3 rasgos válidos y sin repetir', () => {
    for (const a of SINGLES) {
      expect(a.traits?.length, a.id).toBeGreaterThanOrEqual(2)
      expect(a.traits.length, a.id).toBeLessThanOrEqual(3)
      expect(new Set(a.traits).size, a.id).toBe(a.traits.length)
      for (const t of a.traits) expect(isTrait(t), `${a.id}: ${t}`).toBe(true)
    }
  })
  it('no hay jugadores duplicados con otro id', () => {
    const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
    const names = SINGLES.map((a) => norm(a.nameEn))
    expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual([])
    // El nombre chino sigue la Wikipedia china: no depende de acentos ni del orden de los apellidos.
    const zh = SINGLES.map((a) => a.nameZh)
    expect(zh.filter((n, i) => zh.indexOf(n) !== i)).toEqual([])
  })
  it('al menos 40 por sexo y los 6 estilos en cada sexo', () => {
    for (const sex of ['M', 'F'] as const) {
      const xs = SINGLES.filter((a) => a.sex === sex)
      expect(xs.length).toBeGreaterThanOrEqual(40)
      expect(new Set(xs.map((a) => a.style)).size).toBe(6)
    }
  })
  it('nadie se retiró antes de 2010 (decisión del usuario, 2026-10-05)', () => {
    expect(RETIRED_CUTOFF_YEAR).toBe(2010)
    expect(RETIRED_BEFORE_CUTOFF_NO_YEAR.length).toBeGreaterThan(0)
    const early = SINGLES.filter((a) => a.status === 'retired' && (a.retiredYear === null ? RETIRED_BEFORE_CUTOFF_NO_YEAR.includes(a.id) : a.retiredYear < RETIRED_CUTOFF_YEAR))
    expect(early.map((a) => a.id)).toEqual([])
  })
  it('las leyendas retiradas desde 2010 siguen (Lin Dan, Lee Chong Wei, Peter Gade, Zhou Mi)', () => {
    const ids = new Set(SINGLES.map((a) => a.id))
    expect(['lin-dan', 'lee-chong-wei', 'peter-gade', 'zhou-mi'].filter((id) => !ids.has(id))).toEqual([])
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
