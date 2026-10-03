import { describe, expect, it } from 'vitest'
import { CORE_PREF_KEYS, doublesPreference, isPrefs, PREF_KEYS, PREF_OPTIONS, preferredStyle, SINGLES_POINTS, singlesPreference, type Prefs } from './prefs'
import { analyzeTalent } from './talent'
import { GOLDEN, makeInput } from './testkit'
import { SINGLES_STYLES } from './types'

const ATTACKER: Prefs = { scoring: 'smash', midcourt: 'smash', tempo: 'fast', underAttack: 'drive', rally: 'short', doublesSpot: 'back' }
const GRINDER: Prefs = { scoring: 'rally', midcourt: 'push', tempo: 'grind', underAttack: 'lift', rally: 'long', doublesSpot: 'front' }

describe('preferencias de juego (球风偏好)', () => {
  it('12 preguntas: las 6 de la v2 primero', () => {
    expect(CORE_PREF_KEYS).toEqual(['scoring', 'midcourt', 'tempo', 'underAttack', 'rally', 'doublesSpot'])
    expect(PREF_KEYS).toEqual([...CORE_PREF_KEYS, 'signature', 'feints', 'footwork', 'decider', 'receive', 'behind'])
    for (const k of PREF_KEYS) expect(PREF_OPTIONS[k].length).toBeGreaterThanOrEqual(3)
  })
  it('scoring sigue siendo la pregunta de más peso (3); las demás dan como mucho 2', () => {
    for (const k of PREF_KEYS.filter((x) => x !== 'scoring')) {
      for (const pts of Object.values(SINGLES_POINTS[k])) for (const p of Object.values(pts)) expect(p).toBeLessThanOrEqual(2)
    }
  })
  it('las preguntas nuevas suman al estilo', () => {
    const wall: Prefs = { ...GRINDER, scoring: 'counter', signature: 'retrieve', feints: 'rarely', footwork: 'reach', decider: 'fight', receive: 'deep', behind: 'persist' }
    expect(preferredStyle(wall)).toBe('counter')
    const trick: Prefs = { ...ATTACKER, scoring: 'net', midcourt: 'drop', signature: 'netShot', feints: 'often', receive: 'netReply' }
    expect(preferredStyle(trick)).toBe('net')
  })
  it('isPrefs: acepta v2 (6) y v3 (12); rechaza respuestas inválidas', () => {
    expect(isPrefs(ATTACKER)).toBe(true)
    expect(isPrefs({ ...ATTACKER, signature: 'smash', feints: 'often', footwork: 'explosive', decider: 'finish', receive: 'rush', behind: 'attack' })).toBe(true)
    expect(isPrefs({ ...ATTACKER, signature: 'foo' })).toBe(false)
    const { tempo: _t, ...noTempo } = ATTACKER
    expect(isPrefs(noTempo)).toBe(false)
  })
  it('sin preferencias, todas neutras (0.5)', () => {
    const p = singlesPreference(undefined)
    for (const s of SINGLES_STYLES) expect(p[s]).toBe(0.5)
    expect(doublesPreference(undefined)).toEqual({ front: 0.5, back: 0.5 })
  })
  it('el estilo más elegido vale 1 y los demás en proporción', () => {
    const p = singlesPreference(ATTACKER)
    expect(p.attack).toBe(1)
    expect(p.control).toBe(0)
    expect(singlesPreference(GRINDER).control).toBe(1)
  })
  it('dobles: la posición preferida', () => {
    expect(doublesPreference(ATTACKER)).toEqual({ front: 0, back: 1 })
    expect(doublesPreference({ ...ATTACKER, doublesSpot: 'rotate' })).toEqual({ front: 0.6, back: 0.6 })
    expect(doublesPreference({ ...ATTACKER, doublesSpot: 'none' })).toEqual({ front: 0.5, back: 0.5 })
  })
})

describe('las preferencias cambian la recomendación', () => {
  it('mismo cuerpo y capacidades: el atacante y el paciente reciben estilos distintos', () => {
    const base = makeInput('M', 26, 175, 70, null, 3, [3, 3, 3, 3, 3, 3, 3, 3])
    const a = analyzeTalent({ ...base, prefs: ATTACKER })
    const g = analyzeTalent({ ...base, prefs: GRINDER })
    expect(a.singles.top).toBe('attack')
    expect(g.singles.top).toBe('control')
    expect(a.doubles.role).toBe('back')
    expect(g.doubles.role).toBe('front')
  })
  it('detecta cuando el gusto y la capacidad no coinciden', () => {
    const r = analyzeTalent({ ...GOLDEN, prefs: ATTACKER })
    expect(r.singles.preferred).toBe('attack')
    expect(r.engineVersion).toBe(2)
  })
  it('sin preferencias (registros antiguos) sigue funcionando y preferred es null', () => {
    const r = analyzeTalent(GOLDEN)
    expect(r.singles.preferred).toBeNull()
    expect(r.singles.top).toBe('control')
  })
})

describe('qué decidió la recomendación', () => {
  it('abilityTop es el estilo que darían solo capacidades y cuerpo', () => {
    const counterFan: Prefs = { scoring: 'counter', midcourt: 'push', tempo: 'grind', underAttack: 'drive', rally: 'long', doublesSpot: 'front' }
    const r = analyzeTalent({ ...GOLDEN, prefs: counterFan })
    expect(r.singles.abilityTop).toBe('control')
    expect(r.singles.top).toBe('counter')
    expect(r.singles.preferred).toBe('counter')
  })
})
