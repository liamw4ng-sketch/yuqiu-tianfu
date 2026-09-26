import { useI18n } from '../../i18n/I18nProvider'

export default function MbtiPage() {
  const { t } = useI18n()
  return (
    <section className="card">
      <p className="mono-label">MODULE 03 | COURT PERSONALITY</p>
      <h1 className="page-title">{t('nav.mbti')}</h1>
    </section>
  )
}
