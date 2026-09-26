import type { AgeBand, BmiBand, BodyType, Level, RadarKey, Sex } from './types'

export const ENGINE_VERSION = 1

// Referencia aproximada de adultos jóvenes chinos. La altura del usuario se compara con su sexo.
export const HEIGHT_REF: Record<Sex, { mean: number; sd: number }> = {
  M: { mean: 172, sd: 6.5 },
  F: { mean: 160, sd: 6 },
}
export const HEIGHT_BAND_Z = 0.75

export const BMI_LIMITS: { band: BmiBand; below: number }[] = [
  { band: 'under', below: 18.5 },
  { band: 'lean', below: 20.5 },
  { band: 'normal', below: 23.5 },
  { band: 'solid', below: 26 },
]

export const LEVEL_SCORE: Record<Level, number> = { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 }

export const DIAG_WEAK_BELOW = 3.5
export const DIAG_STRONG_FROM = 6.5

export const BODY_TRAITS: Record<BodyType, { advantages: RadarKey[]; disadvantages: RadarKey[] }> = {
  compactQuick: { advantages: ['speed', 'reaction'], disadvantages: ['rearCourt'] },
  lightAgile: { advantages: ['speed', 'endurance'], disadvantages: ['power'] },
  balanced: { advantages: [], disadvantages: [] },
  sturdyPower: { advantages: ['power'], disadvantages: ['speed', 'endurance'] },
  tallLean: { advantages: ['rearCourt'], disadvantages: ['power', 'speed'] },
  tallPower: { advantages: ['power', 'rearCourt'], disadvantages: ['speed'] },
}

// Tendencia corporal (heurística documentada en la spec §5.3.2). Base 5, límites [1, 9.5].
export const TENDENCY_HEIGHT_COEF: Record<RadarKey, number> = {
  power: 0.8, endurance: 0, reaction: 0, netTouch: 0, speed: -0.6, rearCourt: 0.9,
}
export const TENDENCY_APE_COEF: Record<RadarKey, number> = {
  power: 0, endurance: 0, reaction: 0.1, netTouch: 0.05, speed: 0, rearCourt: 0.12,
}
export const TENDENCY_BMI_ADJ: Record<RadarKey, Record<BmiBand, number>> = {
  power: { under: -1.2, lean: -0.3, normal: 0.5, solid: 0.8, heavy: 0.3 },
  endurance: { under: -0.5, lean: 0.5, normal: 0.5, solid: -0.5, heavy: -1.5 },
  reaction: { under: 0, lean: 0, normal: 0, solid: 0, heavy: -0.5 },
  netTouch: { under: 0, lean: 0, normal: 0, solid: 0, heavy: 0 },
  speed: { under: -0.3, lean: 0.8, normal: 0.3, solid: -0.5, heavy: -1.5 },
  rearCourt: { under: -0.8, lean: -0.2, normal: 0.4, solid: 0.5, heavy: 0 },
}
const NO_AGE_ADJ: Record<RadarKey, number> = { power: 0, endurance: 0, reaction: 0, netTouch: 0, speed: 0, rearCourt: 0 }
export const TENDENCY_AGE_ADJ: Record<AgeBand, Record<RadarKey, number>> = {
  youth: { ...NO_AGE_ADJ, power: -0.5, rearCourt: -0.3 },
  prime: NO_AGE_ADJ,
  thirties: { ...NO_AGE_ADJ, power: -0.3, endurance: -0.3, reaction: -0.2, speed: -0.5 },
  forties: { ...NO_AGE_ADJ, power: -0.7, endurance: -0.8, reaction: -0.5, speed: -1.0, rearCourt: -0.3 },
  fiftyPlus: { ...NO_AGE_ADJ, power: -1.0, endurance: -1.2, reaction: -0.8, speed: -1.5, rearCourt: -0.6 },
}
