import { useI18n } from '../i18n/I18nProvider'
import { ratingEs } from './es/rating'
import type { RatingContent } from './types'
import { ratingZh } from './zh/rating'

export function useRatingContent(): RatingContent {
  return useI18n().lang === 'zh' ? ratingZh : ratingEs
}
