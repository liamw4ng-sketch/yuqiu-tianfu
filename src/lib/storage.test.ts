import { describe, expect, it } from 'vitest'
import { GOLDEN } from '../engine/testkit'
import { appendRecord, emptyState, isTalentInput, loadState, MAX_RECORDS, saveState, STORAGE_KEY, type KeyValueStore } from './storage'

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => void (data[k] = v),
    removeItem: (k) => void delete data[k],
  }
}

describe('loadState', () => {
  it('sin almacenamiento disponible → estado vacío', () => {
    expect(loadState(null)).toEqual(emptyState())
  })
  it('JSON corrupto o de otra versión → estado vacío', () => {
    expect(loadState(memoryStore({ [STORAGE_KEY]: '{oops' }))).toEqual(emptyState())
    expect(loadState(memoryStore({ [STORAGE_KEY]: JSON.stringify({ version: 99 }) }))).toEqual(emptyState())
  })
  it('descarta registros de talento con forma inválida y conserva los buenos', () => {
    const good = { id: 'a', createdAt: '2026-09-26T10:00:00.000Z', engineVersion: 1, input: GOLDEN }
    const bad = { id: 'b', createdAt: 'x', engineVersion: 1, input: { sex: 'X' } }
    const store = memoryStore({ [STORAGE_KEY]: JSON.stringify({ ...emptyState(), lang: 'es', talent: [good, bad] }) })
    const s = loadState(store)
    expect(s.lang).toBe('es')
    expect(s.talent.map((r) => r.id)).toEqual(['a'])
  })
  it('ida y vuelta', () => {
    const store = memoryStore()
    const state = { ...emptyState(), lang: 'es' as const }
    expect(saveState(store, state)).toBe(true)
    expect(loadState(store)).toEqual(state)
  })
})

describe('utilidades', () => {
  it('appendRecord conserva los últimos 20', () => {
    const list = Array.from({ length: MAX_RECORDS }, (_, i) => i)
    expect(appendRecord(list, 99)).toHaveLength(MAX_RECORDS)
    expect(appendRecord(list, 99)[0]).toBe(1)
    expect(appendRecord(list, 99).at(-1)).toBe(99)
  })
  it('isTalentInput', () => {
    expect(isTalentInput(GOLDEN)).toBe(true)
    expect(isTalentInput({ ...GOLDEN, levels: { ...GOLDEN.levels, power: 7 } })).toBe(false)
    expect(isTalentInput(null)).toBe(false)
  })
  it('saveState devuelve false si el almacenamiento lanza', () => {
    const throwing: KeyValueStore = {
      getItem: () => null,
      setItem: () => { throw new Error('QuotaExceeded') },
      removeItem: () => {},
    }
    expect(saveState(throwing, emptyState())).toBe(false)
  })
})
