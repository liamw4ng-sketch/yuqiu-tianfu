import { useI18n } from '../../i18n/I18nProvider'

export default function TalentPage() {
  const { t } = useI18n()
  return (
    <section className="card">
      <p className="mono-label">MODULE 01 | TALENT &amp; BODY TYPE</p>
      <h1 className="page-title">{t('nav.talent')}</h1>
    </section>
  )
}
