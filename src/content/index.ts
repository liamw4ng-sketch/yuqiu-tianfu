import type { Localized } from '../data/athletes'
import { useI18n } from '../i18n/I18nProvider'
import type { Lang } from '../i18n/types'
import { talentEs } from './es/talent'
import type { TalentContent } from './types'
import { talentZh } from './zh/talent'

export function getTalentContent(lang: Lang): TalentContent {
  return lang === 'zh' ? talentZh : talentEs
}

export function useTalentContent(): TalentContent {
  return getTalentContent(useI18n().lang)
}

export function joinList(c: { list: { sep: string } }, items: string[]): string {
  return items.join(c.list.sep)
}

export function pick(l: Localized, lang: Lang): string {
  return l[lang]
}
