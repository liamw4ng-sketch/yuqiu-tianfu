import { useI18n } from '../i18n/I18nProvider'

export function LangToggle() {
  const { lang, setLang, t } = useI18n()
  return (
    <button
      type="button"
      className="lang-toggle"
      aria-label={t('lang.switchLabel')}
      onClick={() => setLang(lang === 'zh' ? 'es' : 'zh')}
    >
      {t('lang.switch')}
    </button>
  )
}
