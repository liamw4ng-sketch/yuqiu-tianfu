export type Sex = 'M' | 'F'
export type Hand = 'R' | 'L'
export type Freq = 'lt1' | '1' | '2-3' | '4+'
export type Preference = 'singles' | 'doubles' | 'mixed' | 'all'

export const ABILITY_KEYS = ['power', 'endurance', 'reaction', 'netTouch', 'speed', 'rearCourt', 'tactics', 'mental'] as const
export type AbilityKey = (typeof ABILITY_KEYS)[number]
export const RADAR_KEYS = ['power', 'endurance', 'reaction', 'netTouch', 'speed', 'rearCourt'] as const
export type RadarKey = (typeof RADAR_KEYS)[number]

export type Level = 1 | 2 | 3 | 4 | 5
export type Scores = Record<AbilityKey, number>
export type RadarScores = Record<RadarKey, number>

export const FIELD_TEST_KEYS = ['verticalJumpCm', 'ropeSkip1Min', 'cooper12MinM', 'rulerDropCm'] as const
export type FieldTestKey = (typeof FIELD_TEST_KEYS)[number]
export type FieldTests = Record<FieldTestKey, number | null>

export interface TalentInput {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  wingspanCm: number | null
  yearsPlaying: number
  hand: Hand
  freq: Freq
  preference: Preference
  levels: Record<AbilityKey, Level>
  tests: FieldTests
  /** 球风偏好. Opcional: los registros guardados antes de la v2 no lo tienen. */
  prefs?: import('./prefs').Prefs
}

export type BmiBand = 'under' | 'lean' | 'normal' | 'solid' | 'heavy'
export type AgeBand = 'youth' | 'prime' | 'thirties' | 'forties' | 'fiftyPlus'
export type HeightBand = 'short' | 'average' | 'tall'
export const BODY_TYPES = ['compactQuick', 'lightAgile', 'balanced', 'sturdyPower', 'tallLean', 'tallPower'] as const
export type BodyType = (typeof BODY_TYPES)[number]

export interface BodyProfile {
  bmi: number
  bmiBand: BmiBand
  heightZ: number
  heightBand: HeightBand
  wingspanCm: number
  wingspanAssumed: boolean
  apeIndexCm: number
  apeRatio: number
  ageBand: AgeBand
  bodyType: BodyType
}

export type DiagLevel = 'weak' | 'medium' | 'strong'
export interface BodyClaim {
  key: RadarKey
  kind: 'advantage' | 'disadvantage'
  level: DiagLevel
}

export const SINGLES_STYLES = ['attack', 'control', 'counter', 'speed', 'allround', 'net'] as const
export type SinglesStyle = (typeof SINGLES_STYLES)[number]
export const DOUBLES_ROLES = ['front', 'back', 'rotation'] as const
export type DoublesRole = (typeof DOUBLES_ROLES)[number]
export type MixedNote = 'conventional' | 'femaleBack' | 'maleFront' | 'rotation'
export type FitBand = 'high' | 'good' | 'lean'

export interface StyleFit {
  style: SinglesStyle
  fit: number
}
export interface SinglesResult {
  ranking: StyleFit[]
  top: SinglesStyle
  runnerUp: SinglesStyle
  margin: number
  fitBand: FitBand
  drivers: AbilityKey[]
  gaps: AbilityKey[]
  /** Estilo que más le gusta según 球风偏好 (null si no respondió) */
  preferred: SinglesStyle | null
  /** Estilo que darían solo capacidades y cuerpo, sin gustos: dice si el gusto decidió la recomendación */
  abilityTop: SinglesStyle
}
export interface PartnerAdvice {
  role: DoublesRole
  strength: RadarKey
}
export interface DoublesResult {
  role: DoublesRole
  fit: number
  fitBand: FitBand
  frontFit: number
  backFit: number
  partner: PartnerAdvice
  mixedNote: MixedNote
  drivers: AbilityKey[]
  gaps: AbilityKey[]
}

export const FLAGS = [
  'beginner',
  'youth',
  'injury30',
  'injury40',
  'injury50',
  'wingspanAssumed',
  'closeCall',
  'selfRatingHigh',
  'bmiHigh',
  'bmiLow',
] as const
export type Flag = (typeof FLAGS)[number]
