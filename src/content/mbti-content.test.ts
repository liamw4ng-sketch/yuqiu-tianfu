import { describe, expect, it } from 'vitest'
import { MBTI_CODES, MBTI_QUESTION_IDS } from '../engine/mbti'
import { mbtiEs } from './es/mbti'
import { HAN, leaves, placeholders } from './testUtils'
import { mbtiZh } from './zh/mbti'

describe('contenido de 羽球MBTI', () => {
  it('sin vacíos, mismas rutas y mismos marcadores', () => {
    const zh = leaves(mbtiZh)
    const es = leaves(mbtiEs)
    expect(zh.filter((l) => !l.value.trim()).map((l) => l.path)).toEqual([])
    expect(es.filter((l) => !l.value.trim()).map((l) => l.path)).toEqual([])
    expect(es.map((l) => l.path)).toEqual(zh.map((l) => l.path))
    const esMap = new Map(es.map((l) => [l.path, l.value]))
    expect(zh.filter((l) => placeholders(l.value) !== placeholders(esMap.get(l.path)!)).map((l) => l.path)).toEqual([])
  })
  it('español sin caracteres chinos', () => {
    expect(leaves(mbtiEs).filter((l) => HAN.test(l.value)).map((l) => l.path)).toEqual([])
  })
  it('20 preguntas, 16 tipos y apodos únicos en cada idioma', () => {
    for (const c of [mbtiZh, mbtiEs]) {
      expect(Object.keys(c.questions)).toEqual([...MBTI_QUESTION_IDS])
      for (const q of Object.values(c.questions)) expect(q.a).not.toBe(q.b)
      expect(Object.keys(c.types).sort()).toEqual([...MBTI_CODES].sort())
      expect(new Set(Object.values(c.types).map((t) => t.nickname)).size).toBe(16)
    }
  })
})
