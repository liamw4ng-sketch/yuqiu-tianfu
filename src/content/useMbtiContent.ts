import { useI18n } from '../i18n/I18nProvider'
import { mbtiEs } from './es/mbti'
import type { MbtiContent } from './types'
import { mbtiZh } from './zh/mbti'

export function useMbtiContent(): MbtiContent {
  return useI18n().lang === 'zh' ? mbtiZh : mbtiEs
}
