import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Lang } from './types'
import { uiZh, type UiKey } from './ui.zh'
import { uiEs } from './ui.es'

export type Params = Record<string, string | number>

export function format(template: string, params?: Params): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match))
}

interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: UiKey, params?: Params) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({
  lang: controlled,
  onLangChange,
  children,
}: {
  lang?: Lang
  onLangChange?: (lang: Lang) => void
  children: ReactNode
}) {
  const [inner, setInner] = useState<Lang>(controlled ?? 'zh')
  const lang = controlled ?? inner
  const setLang = useCallback(
    (next: Lang) => {
      setInner(next)
      onLangChange?.(next)
    },
    [onLangChange],
  )
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'es'
  }, [lang])
  const value = useMemo<I18nValue>(() => {
    const dict: Record<UiKey, string> = lang === 'zh' ? uiZh : uiEs
    return { lang, setLang, t: (key, params) => format(dict[key], params) }
  }, [lang, setLang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}
