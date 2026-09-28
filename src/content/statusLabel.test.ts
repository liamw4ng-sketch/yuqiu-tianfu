import { expect, it } from 'vitest'
import { statusLabel } from './index'
import { talentEs } from './es/talent'
import { talentZh } from './zh/talent'

it('estado de retirado sin año conocido no deja paréntesis vacíos', () => {
  expect(statusLabel(talentZh, 'retired', null)).toBe(talentZh.report.status.retiredNoYear)
  expect(statusLabel(talentEs, 'retired', undefined)).not.toMatch(/\(\s*\)/)
  expect(statusLabel(talentZh, 'retired', 2024)).toContain('2024')
  expect(statusLabel(talentZh, 'active', null)).toBe(talentZh.report.status.active)
})
