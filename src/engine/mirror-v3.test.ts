import { describe, expect, it } from 'vitest'
import type { Athlete } from '../data/athletes'
import { findStyleMirrors, type MirrorUser } from './mirror'
import type { Prefs } from './prefs'
import { analyzeTalent } from './talent'
import { makeInput } from './testkit'
import { topTraits, userTraits, type Trait } from './traits'
import type { Level, Sex, SinglesStyle } from './types'

const L = { zh: 'x', es: 'x' }
const athlete = (id: string, style: SinglesStyle, traits: Trait[], h = 175, w: number | null = 70): Athlete => ({
  id, nameEn: id, nameZh: id, sex: 'M', country: L, heightCm: h, weightKg: w, hand: 'R', birthYear: 1995,
  status: 'active', retiredYear: null, style, traits, highlights: L, desc: L,
})
const CORE: Prefs = { scoring: 'net', midcourt: 'drop', tempo: 'adapt', underAttack: 'block', rally: 'either', doublesSpot: 'none' }
const user = (prefs?: Prefs): MirrorUser => ({ sex: 'M', heightCm: 175, bmi: 22.9, preference: 'all', hand: 'R', seed: 0, traits: userTraits(prefs) })
const STYLE = { top: 'net', runnerUp: 'control' } as const

describe('espejo de estilo con rasgos (spec §17.4)', () => {
  it('mismo estilo y cuerpo: gana quien comparte tus rasgos', () => {
    const pool = [athlete('basher', 'net', ['power', 'fight']), athlete('faker', 'net', ['deception', 'net'])]
    const trick = findStyleMirrors(user({ ...CORE, signature: 'deception', feints: 'often' }), STYLE, pool)
    expect(trick[0].athlete.id).toBe('faker')
    expect(trick[0].shared).toContain('deception')
    const power = findStyleMirrors(user({ ...CORE, scoring: 'smash', signature: 'smash', decider: 'finish', behind: 'attack' }), STYLE, pool)
    expect(power[0].athlete.id).toBe('basher')
  })
  it('el estilo manda: un jugador de otro estilo con tus mismos rasgos no gana al de tu estilo', () => {
    const pool = [athlete('same-style', 'net', ['power', 'fight']), athlete('other-style', 'attack', ['deception', 'net'])]
    const r = findStyleMirrors(user({ ...CORE, signature: 'deception', feints: 'often' }), STYLE, pool)
    expect(r[0].athlete.id).toBe('same-style')
    expect(r[0].shared).toEqual([])
  })
  it('el tercer estilo nunca gana si hay alguien del estilo principal o del segundo', () => {
    const pool = [athlete('far-main', 'net', ['power', 'fight'], 190, 90), athlete('third', 'attack', ['deception', 'net'])]
    for (let seed = 0; seed < 6; seed++) {
      const r = findStyleMirrors({ ...user({ ...CORE, signature: 'deception', feints: 'often' }), seed }, STYLE, pool)
      expect(r[0].athlete.id).toBe('far-main')
      expect(r.every((m) => m.styleMatch !== 'none')).toBe(true)
    }
  })
  it('calibración: con tus rasgos, uno del segundo estilo gana a uno del principal sin ninguno', () => {
    const pool = [athlete('main-no-traits', 'net', ['power', 'fight']), athlete('second-same-traits', 'control', ['deception', 'net'])]
    const r = findStyleMirrors(user({ ...CORE, signature: 'deception', feints: 'often' }), STYLE, pool)
    expect(r[0].athlete.id).toBe('second-same-traits')
    expect(r[0].styleMatch).toBe('secondary')
  })
  it('la variedad solo elige entre quienes comparten algún rasgo contigo, si los hay', () => {
    // 'near-none' está más cerca por cuerpo pero no comparte nada; 'sharer' comparte tu sello y cae dentro de la ventana.
    const pool = [athlete('near-none', 'net', ['stamina', 'speed', 'fight'], 175, 70), athlete('sharer', 'net', ['deception', 'net'], 190, 84)]
    for (let seed = 0; seed < 6; seed++) {
      const r = findStyleMirrors({ ...user({ ...CORE, signature: 'deception', feints: 'often' }), seed }, STYLE, pool)
      expect(r[0].athlete.id).toBe('sharer')
      expect(r[0].shared.length).toBeGreaterThan(0)
    }
  })
  it('registros v1 (sin gustos) conservan la ventana de variedad de la v2 (0,5)', () => {
    const pool = [athlete('t1', 'net', ['net', 'placement'], 175, 70), athlete('t2', 'net', ['net', 'placement'], 182, 76)]
    const v1 = new Set([0, 1, 2, 3, 4, 5].map((seed) => findStyleMirrors({ ...user(), traits: undefined, seed }, STYLE, pool)[0].athlete.id))
    expect(v1.size).toBe(2)
  })
  it('sin gustos, los rasgos no cambian el orden y shared está vacío', () => {
    const pool = [athlete('far', 'net', ['deception', 'net'], 185, 80), athlete('near', 'net', ['power', 'fight'], 175, 70)]
    const r = findStyleMirrors({ ...user(), traits: undefined }, STYLE, pool)
    expect(r[0].athlete.id).toBe('near')
    expect(r[0].shared).toEqual([])
  })
})

describe('población (spec §17.7)', () => {
  const PERSONAS: Prefs[] = [
    { scoring: 'smash', midcourt: 'smash', tempo: 'fast', underAttack: 'drive', rally: 'short', doublesSpot: 'back', signature: 'smash', feints: 'rarely', footwork: 'explosive', decider: 'finish', receive: 'rush', behind: 'attack' },
    { scoring: 'net', midcourt: 'drop', tempo: 'adapt', underAttack: 'block', rally: 'either', doublesSpot: 'front', signature: 'deception', feints: 'often', footwork: 'anticipate', decider: 'steady', receive: 'netReply', behind: 'change' },
    { scoring: 'counter', midcourt: 'push', tempo: 'grind', underAttack: 'lift', rally: 'long', doublesSpot: 'none', signature: 'retrieve', feints: 'rarely', footwork: 'reach', decider: 'fight', receive: 'deep', behind: 'persist' },
    { scoring: 'rally', midcourt: 'drop', tempo: 'grind', underAttack: 'block', rally: 'long', doublesSpot: 'rotate', signature: 'placement', feints: 'sometimes', footwork: 'anticipate', decider: 'steady', receive: 'deep', behind: 'change' },
    { scoring: 'smash', midcourt: 'push', tempo: 'fast', underAttack: 'drive', rally: 'short', doublesSpot: 'front', signature: 'netShot', feints: 'sometimes', footwork: 'explosive', decider: 'fight', receive: 'rush', behind: 'attack' },
    { scoring: 'net', midcourt: 'drop', tempo: 'fast', underAttack: 'block', rally: 'short', doublesSpot: 'front', signature: 'netShot', feints: 'often', footwork: 'explosive', decider: 'finish', receive: 'netReply', behind: 'change' },
  ]
  const PATTERNS: Level[][] = [[3, 3, 3, 3, 3, 3, 3, 3], [4, 3, 2, 2, 3, 4, 2, 3], [2, 2, 4, 4, 3, 2, 4, 3], [2, 4, 4, 3, 4, 2, 3, 4], [3, 2, 3, 3, 4, 2, 2, 3]]
  const BODIES: Record<Sex, { h: number[]; w: number[] }> = {
    M: { h: [170, 173, 175, 178, 180], w: [64, 68, 72, 76] },
    F: { h: [156, 160, 163, 166, 170], w: [48, 52, 56, 60] },
  }
  it.each(['M', 'F'] as const)('%s: estilo principal o segundo, rasgos en común en ≥ 70 por ciento, variedad', (sex) => {
    const count: Record<string, number> = {}
    let n = 0
    let withShared = 0
    for (const h of BODIES[sex].h) for (const w of BODIES[sex].w) for (const p of PATTERNS) for (const prefs of PERSONAS) {
      const r = analyzeTalent({ ...makeInput(sex, 28, h, w, null, 3, p), prefs })
      const m = r.mirrors.style[0]
      expect(m.styleMatch, `${h}/${w}`).not.toBe('none')
      if (m.shared.length > 0) withShared++
      expect(m.shared).toEqual(topTraits(userTraits(prefs)).filter((t) => m.athlete.traits.includes(t)))
      count[m.athlete.id] = (count[m.athlete.id] ?? 0) + 1
      n++
    }
    expect(withShared / n).toBeGreaterThanOrEqual(0.7)
    expect(Math.max(...Object.values(count)) / n).toBeLessThanOrEqual(0.12)
    expect(Object.keys(count).length).toBeGreaterThanOrEqual(25)
  })
})
