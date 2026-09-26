import { useI18n } from '../i18n/I18nProvider'

export function BackToTop() {
  const { t } = useI18n()
  return (
    <button
      type="button"
      className="back-to-top"
      aria-label={t('common.backTop')}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  )
}
