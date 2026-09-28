import { expect, it } from 'vitest'
import { analyzeBody } from '../engine/body'
import { bodyTypeName } from './index'
import { talentZh } from './zh/talent'

it('瘦高型 solo se llama "长臂" si la envergadura supera la altura en 3 cm o más', () => {
  const shortArms = analyzeBody({ sex: 'M', age: 25, heightCm: 188, weightKg: 64, wingspanCm: 188 })
  const longArms = analyzeBody({ sex: 'M', age: 25, heightCm: 188, weightKg: 64, wingspanCm: 193 })
  expect(shortArms.bodyType).toBe('tallLean')
  expect(bodyTypeName(talentZh, shortArms)).toBe('瘦高型')
  expect(bodyTypeName(talentZh, longArms)).toBe('瘦高长臂型')
  const golden = analyzeBody({ sex: 'F', age: 24, heightCm: 163, weightKg: 51, wingspanCm: 164 })
  expect(bodyTypeName(talentZh, golden)).toBe(talentZh.bodyTypes.lightAgile.name)
})
