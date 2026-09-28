import { describe, expect, it } from 'vitest'
import { RATING_LEVELS, RATING_QUESTION_IDS, RATING_RULE_IDS } from '../engine/rating'
import { ratingEs } from './es/rating'
import { HAN, leaves, placeholders } from './testUtils'
import { ratingZh } from './zh/rating'

describe('contenido de 业余评级', () => {
  it('sin vacíos, mismas rutas y mismos marcadores', () => {
    const zh = leaves(ratingZh)
    const es = leaves(ratingEs)
    expect(zh.filter((l) => !l.value.trim()).map((l) => l.path)).toEqual([])
    expect(es.filter((l) => !l.value.trim()).map((l) => l.path)).toEqual([])
    expect(es.map((l) => l.path)).toEqual(zh.map((l) => l.path))
    const esMap = new Map(es.map((l) => [l.path, l.value]))
    expect(zh.filter((l) => placeholders(l.value) !== placeholders(esMap.get(l.path)!)).map((l) => l.path)).toEqual([])
  })
  it('español sin caracteres chinos', () => {
    expect(leaves(ratingEs).filter((l) => HAN.test(l.value)).map((l) => l.path)).toEqual([])
  })
  it('18 preguntas con 5 opciones distintas, 8 niveles y todas las reglas', () => {
    for (const c of [ratingZh, ratingEs]) {
      expect(Object.keys(c.questions)).toEqual([...RATING_QUESTION_IDS])
      for (const q of Object.values(c.questions)) expect(new Set(q.options).size).toBe(5)
      expect(Object.keys(c.levels).map(Number)).toEqual(RATING_LEVELS)
      for (const lv of Object.values(c.levels)) {
        expect(lv.can.length).toBeGreaterThanOrEqual(3)
        expect(lv.next.length).toBeGreaterThanOrEqual(2)
      }
      expect(Object.keys(c.rules).sort()).toEqual([...RATING_RULE_IDS].sort())
    }
  })
  it('los códigos de nivel son L1–L8', () => {
    expect(RATING_LEVELS.map((l) => ratingZh.levels[l].code)).toEqual(['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'])
  })
})
