import { describe, expect, it } from 'vitest'
import type { Athlete, DoublesPair, DoublesPlayer, Position } from '../data/athletes'
import { athleteBmi, findBodyMirrors, findDoublesMirrors, type MirrorUser } from './mirror'
import type { Sex, SinglesStyle } from './types'

const L = { zh: 'x', es: 'x' }
const athlete = (id: string, sex: Sex, h: number, w: number | null, style: SinglesStyle, status: 'active' | 'retired' = 'active'): Athlete => ({
  id, nameEn: id, nameZh: id, sex, country: L, heightCm: h, weightKg: w, hand: 'R', birthYear: 1995,
  status, retiredYear: status === 'retired' ? 2024 : null, style, traits: ['placement', 'stamina'], highlights: L, desc: L,
})
const player = (sex: Sex, h: number, w: number | null, position: Position): DoublesPlayer => ({
  nameEn: `${sex}${h}`, nameZh: `${sex}${h}`, sex, heightCm: h, weightKg: w, hand: 'R', position, role: L,
})
const pair = (id: string, event: DoublesPair['event'], a: DoublesPlayer, b: DoublesPlayer): DoublesPair => ({
  id, event, pairZh: id, pairEn: id, country: L, status: 'active', highlights: L, style: L, players: [a, b],
})

const user: MirrorUser = { sex: 'F', heightCm: 163, bmi: 19.2, preference: 'all' }

describe('findBodyMirrors', () => {
  const list = [
    athlete('f-same-body-other-style', 'F', 163, 51, 'attack'),
    athlete('m-same-body', 'M', 163, 51, 'control'),
    athlete('f-taller', 'F', 170, 60, 'control'),
    athlete('f-twin', 'F', 163, 51, 'control'),
  ]
  it('solo mismo sexo, ordenados por cuerpo y luego estilo', () => {
    const r = findBodyMirrors(user, { top: 'control', runnerUp: 'speed' }, list)
    expect(r.map((m) => m.athlete.id)).toEqual(['f-twin', 'f-same-body-other-style', 'f-taller'])
    expect(r[0].styleMatch).toBe('primary')
    expect(r[2].heightDiff).toBe(-7)
    expect(r[2].bmiDiff).toBe(-1.6)
  })
  it('peso desconocido → bmiDiff null y penalización moderada (0.35)', () => {
    const r = findBodyMirrors(user, { top: 'control', runnerUp: 'speed' }, [athlete('f-noweight', 'F', 163, null, 'control')])
    expect(r[0].bmiDiff).toBeNull()
    expect(r[0].distance).toBeCloseTo(0.35, 6)
  })
  it('a igualdad de cuerpo prefiere a quien sigue en activo', () => {
    const r = findBodyMirrors(user, { top: 'control', runnerUp: 'speed' }, [
      athlete('a-retired', 'F', 163, 51, 'control', 'retired'),
      athlete('b-active', 'F', 163, 51, 'control'),
    ])
    expect(r[0].athlete.id).toBe('b-active')
  })
  it('athleteBmi', () => {
    expect(athleteBmi(163, 51)).toBe(19.2)
    expect(athleteBmi(163, null)).toBeNull()
  })
})

describe('findDoublesMirrors', () => {
  const wd = pair('wd', 'WD', player('F', 162, 50, 'front'), player('F', 170, 62, 'back'))
  const xd = pair('xd', 'XD', player('F', 163, 51, 'front'), player('M', 180, 75, 'back'))
  it('elige a la jugadora del mismo sexo cuya posición coincide con el rol', () => {
    const r = findDoublesMirrors(user, 'front', [wd, xd])
    expect(r[0].pair.id).toBe('xd')
    expect(r[0].playerIndex).toBe(0)
    expect(r.every((m) => m.pair.players[m.playerIndex].sex === 'F')).toBe(true)
  })
  it('con preferencia de dobles del mismo sexo, penaliza el mixto', () => {
    const r = findDoublesMirrors({ ...user, preference: 'doubles' }, 'front', [wd, xd])
    expect(r[0].pair.id).toBe('wd')
  })
  it('cada pareja aparece una sola vez', () => {
    const r = findDoublesMirrors(user, 'rotation', [wd])
    expect(r).toHaveLength(1)
  })
})
