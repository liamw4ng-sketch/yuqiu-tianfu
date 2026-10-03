import { describe, expect, it } from 'vitest'
import type { Athlete } from '../data/athletes'
import { findBodyMirrors, findStyleMirrors, seedOf, type MirrorUser } from './mirror'
import type { Prefs } from './prefs'
import { analyzeTalent } from './talent'
import { makeInput } from './testkit'
import type { Level, Sex, SinglesStyle } from './types'

const L = { zh: 'x', es: 'x' }
const athlete = (id: string, sex: Sex, h: number, w: number | null, style: SinglesStyle, hand: 'R' | 'L' = 'R'): Athlete => ({
  id, nameEn: id, nameZh: id, sex, country: L, heightCm: h, weightKg: w, hand, birthYear: 1995,
  status: 'active', retiredYear: null, style, highlights: L, desc: L,
})
const user = (over: Partial<MirrorUser> = {}): MirrorUser => ({ sex: 'M', heightCm: 175, bmi: 22.9, preference: 'all', hand: 'R', seed: 0, ...over })

describe('espejo de estilo y espejo de cuerpo', () => {
  const list = [
    athlete('same-body-other-style', 'M', 175, 70, 'speed'),
    athlete('same-style-taller', 'M', 182, 76, 'control'),
    athlete('same-style-close', 'M', 177, 72, 'control'),
  ]
  it('el espejo de estilo prioriza el estilo; el de cuerpo, el cuerpo', () => {
    expect(findStyleMirrors(user(), { top: 'control', runnerUp: 'attack' }, list)[0].athlete.id).toBe('same-style-close')
    expect(findBodyMirrors(user(), { top: 'control', runnerUp: 'attack' }, list)[0].athlete.id).toBe('same-body-other-style')
  })
  it('el espejo de cuerpo evita repetir al jugador del espejo de estilo', () => {
    const style = findStyleMirrors(user(), { top: 'speed', runnerUp: 'attack' }, list)[0].athlete.id
    const body = findBodyMirrors(user(), { top: 'speed', runnerUp: 'attack' }, list, 3, style)[0].athlete.id
    expect(body).not.toBe(style)
  })
  it('sin peso conocido no se castiga: se compara por altura', () => {
    const r = findBodyMirrors(user(), { top: 'control', runnerUp: 'attack' }, [athlete('no-weight', 'M', 175, null, 'speed'), athlete('heavier', 'M', 179, 82, 'speed')])
    expect(r[0].athlete.id).toBe('no-weight')
  })
  it('un usuario zurdo prefiere un espejo zurdo con estilo igual', () => {
    const r = findStyleMirrors(user({ hand: 'L' }), { top: 'control', runnerUp: 'attack' }, [athlete('righty', 'M', 175, 70, 'control'), athlete('lefty', 'M', 178, 73, 'control', 'L')])
    expect(r[0].athlete.id).toBe('lefty')
  })
  it('entre candidatos casi iguales, la semilla del usuario elige (variedad estable)', () => {
    const twins = [athlete('t1', 'M', 175, 70, 'control'), athlete('t2', 'M', 176, 71, 'control'), athlete('t3', 'M', 174, 69, 'control')]
    const picks = new Set([0, 1, 2, 3, 4, 5].map((seed) => findStyleMirrors(user({ seed }), { top: 'control', runnerUp: 'attack' }, twins)[0].athlete.id))
    expect(picks.size).toBeGreaterThan(1)
    const again = findStyleMirrors(user({ seed: 4 }), { top: 'control', runnerUp: 'attack' }, twins)[0].athlete.id
    expect(findStyleMirrors(user({ seed: 4 }), { top: 'control', runnerUp: 'attack' }, twins)[0].athlete.id).toBe(again)
  })
  it('seedOf es estable y cambia con las respuestas', () => {
    const a = makeInput('M', 26, 175, 70, null, 3, [3, 3, 3, 3, 3, 3, 3, 3])
    expect(seedOf(a)).toBe(seedOf({ ...a }))
    expect(seedOf(a)).not.toBe(seedOf({ ...a, levels: { ...a.levels, power: 4 } }))
  })
})

describe('variedad real con la base de datos', () => {
  const PATTERNS: Level[][] = [[3, 3, 3, 3, 3, 3, 3, 3], [4, 3, 2, 2, 3, 4, 2, 3], [2, 2, 4, 4, 3, 2, 4, 3], [2, 4, 4, 3, 4, 2, 3, 4], [3, 2, 3, 3, 4, 2, 2, 3]]
  const BODIES: Record<Sex, { h: number[]; w: number[] }> = {
    M: { h: [170, 173, 175, 178, 180], w: [64, 68, 72, 76] },
    F: { h: [156, 160, 163, 166, 170], w: [48, 52, 56, 60] },
  }
  it.each(['M', 'F'] as const)('cuerpos típicos (%s): ningún jugador acapara los espejos', (sex) => {
    const style: Record<string, number> = {}
    const body: Record<string, number> = {}
    let n = 0
    for (const h of BODIES[sex].h) for (const w of BODIES[sex].w) for (const p of PATTERNS)
      for (const sc of ['smash', 'net', 'rally', 'counter'] as const) for (const tp of ['fast', 'grind', 'adapt'] as const) {
        const prefs: Prefs = { scoring: sc, midcourt: 'drop', tempo: tp, underAttack: 'block', rally: 'either', doublesSpot: 'none' }
        const r = analyzeTalent({ ...makeInput(sex, 28, h, w, null, 3, p), prefs })
        style[r.mirrors.style[0].athlete.id] = (style[r.mirrors.style[0].athlete.id] ?? 0) + 1
        body[r.mirrors.body[0].athlete.id] = (body[r.mirrors.body[0].athlete.id] ?? 0) + 1
        n++
      }
    expect(Math.max(...Object.values(style)) / n).toBeLessThanOrEqual(0.12)
    expect(Math.max(...Object.values(body)) / n).toBeLessThanOrEqual(0.18)
    expect(Object.keys(style).length).toBeGreaterThanOrEqual(25)
    expect(Object.keys(body).length).toBeGreaterThanOrEqual(20)
  })
})
