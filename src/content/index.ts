import type { Localized } from '../data/athletes'
import type { BodyProfile } from '../engine/types'
import { format } from '../i18n/I18nProvider'
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


/** Nombre del 身材画像; 瘦高型 pasa a 瘦高长臂型 solo con envergadura ≥ altura + 3 cm. */
export function bodyTypeName(c: TalentContent, body: Pick<BodyProfile, 'bodyType' | 'apeIndexCm'>): string {
  const t = c.bodyTypes[body.bodyType]
  return t.nameLongArms && body.apeIndexCm >= 3 ? t.nameLongArms : t.name
}

/** Texto entre paréntesis con la puntuación del idioma. */
export function paren(c: TalentContent, text: string | number): string {
  return `${c.list.open}${text}${c.list.close}`
}

/** Etiqueta 现役 / 已退役（año） / 已拆对; sin año conocido no deja paréntesis vacíos. */
export function statusLabel(c: TalentContent, status: 'active' | 'retired' | 'split', year?: number | null): string {
  if (status !== 'retired') return c.report.status[status]
  return year ? format(c.report.status.retired, { year }) : c.report.status.retiredNoYear
}
