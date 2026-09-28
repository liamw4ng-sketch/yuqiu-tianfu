export const RATING_QUESTION_IDS = [
  'clear', 'smash', 'drop', 'net', 'serve', 'defense', 'footwork', 'drive', 'backhand',
  'grip', 'doubles', 'tactics', 'consistency', 'fitness', 'match', 'training', 'years', 'benchmark',
] as const
export type RatingQuestionId = (typeof RATING_QUESTION_IDS)[number]
export const RATING_OPTIONS = ['a', 'b', 'c', 'd', 'e'] as const
export type RatingOption = (typeof RATING_OPTIONS)[number]
export type RatingAnswers = Partial<Record<RatingQuestionId, RatingOption>>
export type RatingLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export const RATING_LEVELS: RatingLevel[] = [1, 2, 3, 4, 5, 6, 7, 8]

export const LEVEL_MIN_PERCENT: Record<RatingLevel, number> = { 1: 0, 2: 15, 3: 28, 4: 42, 5: 56, 6: 70, 7: 82, 8: 92 }

export const RATING_CAPS: { question: RatingQuestionId; options: RatingOption[]; maxLevel: RatingLevel }[] = [
  { question: 'clear', options: ['a'], maxLevel: 2 },
  { question: 'clear', options: ['b'], maxLevel: 3 },
  { question: 'footwork', options: ['a'], maxLevel: 3 },
  { question: 'defense', options: ['a'], maxLevel: 3 },
  { question: 'serve', options: ['a'], maxLevel: 3 },
  { question: 'grip', options: ['a'], maxLevel: 3 },
  { question: 'match', options: ['a', 'b'], maxLevel: 6 },
  { question: 'training', options: ['a'], maxLevel: 6 },
]

export type RatingRuleId =
  | 'smashNoClear' | 'dropNoClear' | 'doublesNoDrive' | 'consistencyNoFitness'
  | 'tacticsNoFootwork' | 'newbieExpert' | 'benchmarkMismatch'
export const RATING_RULE_IDS: RatingRuleId[] = [
  'smashNoClear', 'dropNoClear', 'doublesNoDrive', 'consistencyNoFitness', 'tacticsNoFootwork', 'newbieExpert', 'benchmarkMismatch',
]

type Complete = Record<RatingQuestionId, RatingOption>
const pts = (o: RatingOption) => RATING_OPTIONS.indexOf(o)

export const RATING_RULES: { id: RatingRuleId; when: (a: Complete) => boolean }[] = [
  { id: 'smashNoClear', when: (a) => pts(a.smash) >= 3 && pts(a.clear) <= 1 },
  { id: 'dropNoClear', when: (a) => pts(a.drop) >= 3 && pts(a.clear) <= 1 },
  { id: 'doublesNoDrive', when: (a) => pts(a.doubles) >= 3 && pts(a.drive) === 0 },
  { id: 'consistencyNoFitness', when: (a) => pts(a.consistency) >= 3 && pts(a.fitness) === 0 },
  { id: 'tacticsNoFootwork', when: (a) => pts(a.tactics) === 4 && pts(a.footwork) <= 1 },
  { id: 'newbieExpert', when: (a) => pts(a.years) === 0 && pts(a.smash) === 4 && pts(a.net) === 4 },
  { id: 'benchmarkMismatch', when: (a) => pts(a.benchmark) >= 3 && (pts(a.clear) <= 1 || pts(a.footwork) <= 1) },
]

export interface RatingResult {
  points: number
  maxPoints: number
  percent: number
  rawLevel: RatingLevel
  level: RatingLevel
  caps: { question: RatingQuestionId; maxLevel: RatingLevel }[]
  warnings: RatingRuleId[]
}

/** Acepta respuestas guardadas (Record<string, string>) y comprueba que las 18 son opciones válidas. */
export function isRatingComplete(a: Partial<Record<string, string>>): a is Complete {
  return RATING_QUESTION_IDS.every((id) => (RATING_OPTIONS as readonly (string | undefined)[]).includes(a[id]))
}

export function levelFromPercent(p: number): RatingLevel {
  let level: RatingLevel = 1
  for (const l of RATING_LEVELS) if (p >= LEVEL_MIN_PERCENT[l]) level = l
  return level
}

export function scoreRating(a: Complete): RatingResult {
  const points = RATING_QUESTION_IDS.reduce((s, id) => s + pts(a[id]), 0)
  const maxPoints = RATING_QUESTION_IDS.length * 4
  const percent = Math.round((points / maxPoints) * 100)
  const rawLevel = levelFromPercent(percent)
  const caps = RATING_CAPS.filter((c) => c.options.includes(a[c.question])).map(({ question, maxLevel }) => ({ question, maxLevel }))
  const level = Math.min(rawLevel, ...caps.map((c) => c.maxLevel)) as RatingLevel
  const warnings = RATING_RULES.filter((r) => r.when(a)).map((r) => r.id)
  return { points, maxPoints, percent, rawLevel, level, caps, warnings }
}
