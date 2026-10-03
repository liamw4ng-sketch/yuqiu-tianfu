import { doublesPreference, type Prefs } from './prefs'
import { cappedFitBand, driversAndGaps, fitFrom, keyAbilities, makeWeights, profileMatch, toVector, type Weights } from './singles'
import { clamp, mean } from './stats'
import {
  ABILITY_KEYS,
  RADAR_KEYS,
  type BodyProfile,
  type DoublesResult,
  type DoublesRole,
  type MixedNote,
  type PartnerAdvice,
  type RadarKey,
  type RadarScores,
  type Scores,
  type Sex,
} from './types'

export const FRONT_WEIGHTS: Weights = makeWeights({ endurance: 0.05, reaction: 0.3, netTouch: 0.3, speed: 0.2, tactics: 0.1, mental: 0.05 })
export const BACK_WEIGHTS: Weights = makeWeights({ power: 0.35, endurance: 0.2, reaction: 0.05, speed: 0.1, rearCourt: 0.25, mental: 0.05 })
const ROTATION_WEIGHTS: Weights = Object.fromEntries(
  ABILITY_KEYS.map((k) => [k, (FRONT_WEIGHTS[k] + BACK_WEIGHTS[k]) / 2]),
) as Weights

const ROTATION_GAP = 8
const ROTATION_GAP_PREFERRED = 15
const ROTATION_MIN_MEAN = 5

export function frontBodyFit(body: BodyProfile): number {
  const z = clamp(body.heightZ, -1.5, 1.5)
  return clamp(0.5 - 0.15 * z + { under: 0, lean: 0.1, normal: 0.05, solid: -0.05, heavy: -0.2 }[body.bmiBand], 0, 1)
}

export function backBodyFit(body: BodyProfile): number {
  const z = clamp(body.heightZ, -1.5, 1.5)
  return clamp(
    0.5 + 0.2 * z + (body.apeIndexCm >= 3 ? 0.1 : 0) + { under: -0.2, lean: -0.05, normal: 0.1, solid: 0.15, heavy: 0 }[body.bmiBand],
    0,
    1,
  )
}

export function mixedNoteFor(sex: Sex, role: DoublesRole): MixedNote {
  if (role === 'rotation') return 'rotation'
  if (sex === 'F' && role === 'back') return 'femaleBack'
  if (sex === 'M' && role === 'front') return 'maleFront'
  return 'conventional'
}

/**
 * La pareja se deriva del rol propio: nunca se escribe a mano. En 全能轮转 busca a alguien fuerte en tu capacidad
 * más floja; si hay empate, desempata la tendencia corporal más baja.
 */
export function partnerFor(role: DoublesRole, current: Scores, tendency?: RadarScores): PartnerAdvice {
  if (role === 'front') return { role: 'back', strength: 'power' }
  if (role === 'back') return { role: 'front', strength: 'reaction' }
  const lower = (a: RadarKey, b: RadarKey) =>
    current[a] < current[b] || (current[a] === current[b] && tendency !== undefined && tendency[a] < tendency[b])
  return { role: 'rotation', strength: RADAR_KEYS.reduce((best, k) => (lower(k, best) ? k : best)) }
}

export function pickDoublesRole(
  blended: Scores,
  current: Scores,
  body: BodyProfile,
  sex: Sex,
  tendency?: RadarScores,
  prefs?: Prefs,
): DoublesResult {
  const u = toVector(blended)
  const pref = doublesPreference(prefs)
  const frontFit = fitFrom(profileMatch(u, FRONT_WEIGHTS), pref.front, frontBodyFit(body))
  const backFit = fitFrom(profileMatch(u, BACK_WEIGHTS), pref.back, backBodyFit(body))
  const diff = frontFit - backFit
  // Quien prefiere rotar acepta 全能轮转 con una diferencia mayor entre red y fondo.
  const gap = prefs?.doublesSpot === 'rotate' ? ROTATION_GAP_PREFERRED : ROTATION_GAP
  const role: DoublesRole = Math.abs(diff) < gap && mean(u) >= ROTATION_MIN_MEAN ? 'rotation' : diff >= 0 ? 'front' : 'back'
  const fit = role === 'rotation' ? Math.min(100, Math.round((frontFit + backFit) / 2) + 5) : Math.max(frontFit, backFit)
  const weights = role === 'front' ? FRONT_WEIGHTS : role === 'back' ? BACK_WEIGHTS : ROTATION_WEIGHTS
  const keys = keyAbilities(weights)
  const { drivers, gaps } = driversAndGaps(keys, current)
  return {
    role,
    fit,
    fitBand: cappedFitBand(fit, keys, drivers, gaps),
    frontFit,
    backFit,
    partner: partnerFor(role, current, tendency),
    mixedNote: mixedNoteFor(sex, role),
    drivers,
    gaps,
  }
}
