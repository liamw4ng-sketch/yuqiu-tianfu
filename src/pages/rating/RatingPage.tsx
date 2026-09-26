import { useI18n } from '../../i18n/I18nProvider'

export default function RatingPage() {
  const { t } = useI18n()
  return (
    <section className="card">
      <p className="mono-label">MODULE 02 | AMATEUR LEVEL</p>
      <h1 className="page-title">{t('nav.rating')}</h1>
    </section>
  )
}
