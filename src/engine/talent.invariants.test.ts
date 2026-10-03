import { describe, expect, it } from 'vitest'
import { analyzeTalent } from './talent'
import { makeInput } from './testkit'
import { ABILITY_KEYS, RADAR_KEYS, type Level, type TalentInput } from './types'

const PATTERNS: Level[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1], [3, 3, 3, 3, 3, 3, 3, 3], [5, 5, 5, 5, 5, 5, 5, 5],
  [5, 3, 2, 2, 3, 5, 2, 3], [2, 2, 4, 5, 3, 2, 4, 3], [2, 4, 5, 3, 4, 2, 3, 5],
]

function* grid(): Generator<TalentInput> {
  for (const sex of ['M', 'F'] as const)
    for (const h of [150, 160, 170, 180, 190, 200])
      for (const w of [45, 60, 75, 90])
        for (const age of [15, 25, 35, 45, 60])
          for (const years of [0.5, 2, 6])
            for (const p of PATTERNS)
              for (const ws of [null, h + 8]) yield makeInput(sex, age, h, w, ws, years, p)
}

describe('invariantes sobre ~8.600 perfiles', () => {
  it('se cumplen para todos', () => {
    const partnerOf = { front: 'back', back: 'front', rotation: 'rotation' } as const
    for (const input of grid()) {
      const r = analyzeTalent(input)
      const tag = JSON.stringify({ s: input.sex, h: input.heightCm, w: input.weightKg, a: input.age, y: input.yearsPlaying, l: input.levels })
      for (const s of r.singles.ranking) expect(Number.isInteger(s.fit) && s.fit >= 0 && s.fit <= 100, tag).toBe(true)
      expect(r.singles.top, tag).toBe(r.singles.ranking[0].style)
      expect(r.doubles.partner.role, tag).toBe(partnerOf[r.doubles.role])
      expect(r.doubles.fit >= 0 && r.doubles.fit <= 100, tag).toBe(true)
      for (const m of [...r.mirrors.style, ...r.mirrors.body]) expect(m.athlete.sex, tag).toBe(input.sex)
      for (const m of r.mirrors.doubles) expect(m.pair.players[m.playerIndex].sex, tag).toBe(input.sex)
      for (const c of r.bodyClaims) {
        if (r.current[c.key] < 3.5) expect(c.level, tag).toBe('weak')
      }
      for (const k of ABILITY_KEYS) expect(Number.isFinite(r.blended[k]), tag).toBe(true)
      for (const k of RADAR_KEYS) expect(r.tendency[k] >= 1 && r.tendency[k] <= 9.5, tag).toBe(true)
      expect(new Set(r.drills).size, tag).toBe(3)
    }
  })
})
