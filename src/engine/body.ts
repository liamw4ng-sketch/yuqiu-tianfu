import { BMI_LIMITS, BODY_TRAITS, DIAG_STRONG_FROM, DIAG_WEAK_BELOW, HEIGHT_BAND_Z, HEIGHT_REF } from './constants'
import type { AgeBand, BmiBand, BodyClaim, BodyProfile, BodyType, DiagLevel, HeightBand, RadarScores, Scores, Sex, TalentInput } from './types'

export function bmiOf(heightCm: number, weightKg: number): number {
  const m = heightCm / 100
  return Math.round((weightKg / (m * m)) * 10) / 10
}

export function bmiBandOf(bmi: number): BmiBand {
  for (const { band, below } of BMI_LIMITS) if (bmi < below) return band
  return 'heavy'
}

export function ageBandOf(age: number): AgeBand {
  if (age <= 17) return 'youth'
  if (age <= 30) return 'prime'
  if (age <= 40) return 'thirties'
  if (age <= 50) return 'forties'
  return 'fiftyPlus'
}

export function heightZOf(sex: Sex, heightCm: number): number {
  const ref = HEIGHT_REF[sex]
  return (heightCm - ref.mean) / ref.sd
}

export function heightBandOf(z: number): HeightBand {
  if (z <= -HEIGHT_BAND_Z) return 'short'
  if (z >= HEIGHT_BAND_Z) return 'tall'
  return 'average'
}

export function bodyTypeOf(heightBand: HeightBand, bmiBand: BmiBand): BodyType {
  const heavyish = bmiBand === 'solid' || bmiBand === 'heavy'
  const light = bmiBand === 'under' || bmiBand === 'lean'
  if (heightBand === 'short') return heavyish ? 'sturdyPower' : 'compactQuick'
  if (heightBand === 'tall') return light ? 'tallLean' : 'tallPower'
  if (heavyish) return 'sturdyPower'
  return light ? 'lightAgile' : 'balanced'
}

export function analyzeBody(input: Pick<TalentInput, 'sex' | 'age' | 'heightCm' | 'weightKg' | 'wingspanCm'>): BodyProfile {
  const bmi = bmiOf(input.heightCm, input.weightKg)
  const bmiBand = bmiBandOf(bmi)
  const heightZ = heightZOf(input.sex, input.heightCm)
  const heightBand = heightBandOf(heightZ)
  const wingspanCm = input.wingspanCm ?? input.heightCm
  return {
    bmi,
    bmiBand,
    heightZ,
    heightBand,
    wingspanCm,
    wingspanAssumed: input.wingspanCm == null,
    apeIndexCm: Math.round((wingspanCm - input.heightCm) * 10) / 10,
    apeRatio: Math.round((wingspanCm / input.heightCm) * 1000) / 1000,
    ageBand: ageBandOf(input.age),
    bodyType: bodyTypeOf(heightBand, bmiBand),
  }
}

export function diagLevel(score: number): DiagLevel {
  if (score < DIAG_WEAK_BELOW) return 'weak'
  if (score < DIAG_STRONG_FROM) return 'medium'
  return 'strong'
}

/**
 * Ventajas y desventajas del 身材画像. BODY_TRAITS da las candidatas del tipo, pero solo se afirman las que
 * la capa de tendencia corporal respalda (> 5 ventaja, < 5 desventaja): así el texto nunca contradice al radar.
 */
export function bodyClaims(bodyType: BodyType, current: Scores, tendency: RadarScores): BodyClaim[] {
  const traits = BODY_TRAITS[bodyType]
  return [
    ...traits.advantages
      .filter((key) => tendency[key] > 5)
      .map((key) => ({ key, kind: 'advantage' as const, level: diagLevel(current[key]) })),
    ...traits.disadvantages
      .filter((key) => tendency[key] < 5)
      .map((key) => ({ key, kind: 'disadvantage' as const, level: diagLevel(current[key]) })),
  ]
}
