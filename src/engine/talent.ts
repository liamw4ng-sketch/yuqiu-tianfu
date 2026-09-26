import { PAIRS, SINGLES, type Athlete, type DoublesPair } from '../data/athletes'
import { blendScores, bodyTendency, currentScores } from './abilities'
import { analyzeBody, bodyClaims, diagLevel } from './body'
import { ENGINE_VERSION } from './constants'
import { pickDoublesRole } from './doubles'
import { pickDrills, type DrillId } from './drills'
import { findDoublesMirrors, findSinglesMirrors, type DoublesMirror, type SinglesMirror } from './mirror'
import { rankSingles } from './singles'
import { argBy, mean } from './stats'
import {
  ABILITY_KEYS,
  RADAR_KEYS,
  type AbilityKey,
  type BodyClaim,
  type BodyProfile,
  type DiagLevel,
  type DoublesResult,
  type Flag,
  type RadarKey,
  type RadarScores,
  type Scores,
  type SinglesResult,
  type TalentInput,
} from './types'

export interface AthleteData {
  singles: Athlete[]
  pairs: DoublesPair[]
}

export interface TalentResult {
  engineVersion: number
  body: BodyProfile
  current: Scores
  tendency: RadarScores
  blended: Scores
  diagnosis: Record<AbilityKey, DiagLevel>
  strongest: RadarKey
  weakest: RadarKey
  bodyClaims: BodyClaim[]
  singles: SinglesResult
  doubles: DoublesResult
  mirrors: { singles: SinglesMirror[]; doubles: DoublesMirror[] }
  drills: DrillId[]
  flags: Flag[]
}

export function collectFlags(input: TalentInput, body: BodyProfile, current: Scores, singles: SinglesResult): Flag[] {
  const flags: Flag[] = []
  if (input.yearsPlaying < 1) flags.push('beginner')
  if (input.age <= 16) flags.push('youth')
  if (body.ageBand === 'thirties') flags.push('injury30')
  if (body.ageBand === 'forties') flags.push('injury40')
  if (body.ageBand === 'fiftyPlus') flags.push('injury50')
  if (body.wingspanAssumed) flags.push('wingspanAssumed')
  if (singles.margin < 3) flags.push('closeCall')
  if (input.yearsPlaying < 1 && mean(ABILITY_KEYS.map((k) => current[k])) >= 7) flags.push('selfRatingHigh')
  if (body.bmi >= 28) flags.push('bmiHigh')
  if (body.bmi < 17) flags.push('bmiLow')
  return flags
}

export function analyzeTalent(input: TalentInput, data: AthleteData = { singles: SINGLES, pairs: PAIRS }): TalentResult {
  const body = analyzeBody(input)
  const current = currentScores(input)
  const tendency = bodyTendency(body)
  const blended = blendScores(current, tendency, input.yearsPlaying)
  const diagnosis = {} as Record<AbilityKey, DiagLevel>
  for (const k of ABILITY_KEYS) diagnosis[k] = diagLevel(current[k])
  const singles = rankSingles(blended, current, body)
  const doubles = pickDoublesRole(blended, current, body, input.sex)
  const user = { sex: input.sex, heightCm: input.heightCm, bmi: body.bmi, preference: input.preference }
  return {
    engineVersion: ENGINE_VERSION,
    body,
    current,
    tendency,
    blended,
    diagnosis,
    strongest: argBy(RADAR_KEYS, (k) => current[k], (a, b) => a > b),
    weakest: argBy(RADAR_KEYS, (k) => current[k], (a, b) => a < b),
    bodyClaims: bodyClaims(body.bodyType, current),
    singles,
    doubles,
    mirrors: {
      singles: findSinglesMirrors(user, singles, data.singles),
      doubles: findDoublesMirrors(user, doubles.role, data.pairs),
    },
    drills: pickDrills(singles.top, current),
    flags: collectFlags(input, body, current, singles),
  }
}
