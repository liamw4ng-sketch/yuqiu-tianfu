import { isMbtiComplete, scoreMbti, type MbtiResult } from '../engine/mbti'
import { isRatingComplete, scoreRating, type RatingResult } from '../engine/rating'
import { analyzeTalent, type TalentResult } from '../engine/talent'
import type { MbtiRecord, RatingRecord, StoredState, TalentRecord } from './storage'

export interface LatestProfile {
  talent: { record: TalentRecord; result: TalentResult } | null
  rating: { record: RatingRecord; result: RatingResult } | null
  mbti: { record: MbtiRecord; result: MbtiResult } | null
}

/** Último resultado válido de cada módulo, recalculado con el motor actual. */
export function latestProfile(state: StoredState): LatestProfile {
  const t = state.talent.at(-1)
  const r = [...state.rating].reverse().find((x) => isRatingComplete(x.answers))
  const m = [...state.mbti].reverse().find((x) => isMbtiComplete(x.answers))
  return {
    talent: t ? { record: t, result: analyzeTalent(t.input) } : null,
    rating: r && isRatingComplete(r.answers) ? { record: r, result: scoreRating(r.answers) } : null,
    mbti: m && isMbtiComplete(m.answers) ? { record: m, result: scoreMbti(m.answers) } : null,
  }
}
