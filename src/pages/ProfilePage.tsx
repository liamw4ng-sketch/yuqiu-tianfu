import { useI18n } from '../i18n/I18nProvider'

export default function ProfilePage() {
  const { t } = useI18n()
  return (
    <section className="card">
      <p className="mono-label">MY PROFILE</p>
      <h1 className="page-title">{t('nav.profile')}</h1>
    </section>
  )
}
