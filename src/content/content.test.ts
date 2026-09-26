import { describe, expect, it } from 'vitest'
import { talentEs } from './es/talent'
import { HAN, leaves, placeholders } from './testUtils'
import { talentZh } from './zh/talent'

describe.each([
  ['zh', talentZh],
  ['es', talentEs],
])('contenido %s', (_lang, content) => {
  it('ningún texto vacío', () => {
    expect(leaves(content).filter((l) => l.value.trim() === '').map((l) => l.path)).toEqual([])
  })
  it('referencias con URL http(s)', () => {
    expect(content.report.references.length).toBeGreaterThanOrEqual(5)
    for (const r of content.report.references) expect(r.url).toMatch(/^https?:\/\//)
  })
})

describe('zh y es', () => {
  it('tienen exactamente las mismas rutas', () => {
    expect(leaves(talentEs).map((l) => l.path)).toEqual(leaves(talentZh).map((l) => l.path))
  })
  it('cada plantilla tiene los mismos marcadores en los dos idiomas', () => {
    const es = new Map(leaves(talentEs).map((l) => [l.path, l.value]))
    const mismatches = leaves(talentZh)
      .filter((l) => placeholders(l.value) !== placeholders(es.get(l.path) ?? ''))
      .map((l) => l.path)
    expect(mismatches).toEqual([])
  })
})

describe('chino', () => {
  it('los nombres de estilo y rol son los del informe', () => {
    expect(talentZh.singles.control.name).toContain('四方拉吊')
    expect(talentZh.doubles.front.name).toContain('封网')
    expect(talentZh.doubles.back.name).toContain('后场')
  })
  it('los 5 niveles de cada capacidad son distintos', () => {
    for (const a of Object.values(talentZh.abilities)) expect(new Set(a.levels).size).toBe(5)
  })
  it('el consejo de pareja de cada rol nombra el rol propio correcto', () => {
    expect(talentZh.report.partner.front).toContain('前场封网型')
    expect(talentZh.report.partner.back).toContain('后场攻击型')
    expect(talentZh.report.partner.rotation).toContain('全能轮转型')
    for (const t of Object.values(talentZh.report.partner)) {
      expect(t).toContain('{role}')
      expect(t).toContain('{strength}')
    }
  })
})

describe('español', () => {
  it('no contiene caracteres chinos ni es una copia del chino', () => {
    expect(leaves(talentEs).filter((l) => HAN.test(l.value)).map((l) => l.path)).toEqual([])
    expect(talentEs).not.toBe(talentZh)
  })
})
