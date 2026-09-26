import { useI18n } from '../i18n/I18nProvider'

export default function HomePage() {
  const { t } = useI18n()
  return (
    <section className="card">
      <p className="mono-label">BADMINTON TALENT LAB</p>
      <h1 className="page-title">{t('app.name')}</h1>
      <p className="page-subtitle">{t('app.tagline')}</p>
    </section>
  )
}
