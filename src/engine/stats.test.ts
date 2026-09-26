import { describe, expect, it } from 'vitest'
import { argBy, clamp, correlation, mean, sd } from './stats'

describe('stats', () => {
  it('mean y sd poblacional', () => {
    expect(mean([2, 4, 6])).toBe(4)
    expect(sd([2, 4, 4, 4, 5, 5, 7, 9])).toBe(2)
  })
  it('clamp', () => {
    expect(clamp(12, 0, 10)).toBe(10)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(5, 0, 10)).toBe(5)
  })
  it('correlation: perfecta, inversa y 0 si una serie es plana', () => {
    expect(correlation([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 10)
    expect(correlation([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1, 10)
    expect(correlation([5, 5, 5], [1, 2, 3])).toBe(0)
  })
  it('argBy devuelve la primera clave en caso de empate', () => {
    const s = { a: 3, b: 7, c: 7 }
    expect(argBy(['a', 'b', 'c'] as const, (k) => s[k], (x, y) => x > y)).toBe('b')
    expect(argBy(['a', 'b', 'c'] as const, (k) => s[k], (x, y) => x < y)).toBe('a')
  })
})
