import { describe, expect, it } from 'vitest'
import { analyzeTalent } from './talent'
import { GOLDEN } from './testkit'

describe('analyzeTalent', () => {
  it('perfil de referencia completo', () => {
    const r = analyzeTalent(GOLDEN)
    expect(r.engineVersion).toBe(1)
    expect(r.body.bodyType).toBe('lightAgile')
    expect(r.strongest).toBe('endurance')
    expect(r.weakest).toBe('reaction')
    expect(r.singles.top).toBe('control')
    expect(r.doubles.role).toBe('back')
    expect(r.doubles.partner.role).toBe('front')
    expect(r.drills).toEqual(['rallyControl', 'netSpinning', 'shadowFootwork'])
    expect(r.flags).toEqual([])
    expect(r.diagnosis.reaction).toBe('weak')
    expect(r.diagnosis.endurance).toBe('medium')
    expect(r.bodyClaims).toEqual([
      { key: 'speed', kind: 'advantage', level: 'medium' },
      { key: 'endurance', kind: 'advantage', level: 'medium' },
      { key: 'power', kind: 'disadvantage', level: 'medium' },
    ])
    expect(r.mirrors.singles.length).toBeGreaterThan(0)
    expect(r.mirrors.singles.every((m) => m.athlete.sex === 'F')).toBe(true)
  })
  it('flags de principiante, edad y envergadura', () => {
    const r = analyzeTalent({ ...GOLDEN, age: 45, yearsPlaying: 0.5, wingspanCm: null })
    expect(r.flags).toEqual(expect.arrayContaining(['beginner', 'injury40', 'wingspanAssumed']))
  })
})
