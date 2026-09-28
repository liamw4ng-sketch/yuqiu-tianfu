import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTalentContent } from '../content'
import { useMbtiContent } from '../content/useMbtiContent'
import { useRatingContent } from '../content/useRatingContent'
import { useI18n } from '../i18n/I18nProvider'
import { latestProfile } from '../lib/latest'
import { useStore } from '../lib/StoreProvider'

export default function HomePage() {
  const { t } = useI18n()
  const { state } = useStore()
  const tc = useTalentContent()
  const rc = useRatingContent()
  const mc = useMbtiContent()
  const p = useMemo(() => latestProfile(state), [state])
  const modules = [
    { to: '/talent', mono: 'MODULE 01', title: t('home.m1.title'), desc: t('home.m1.desc'), emoji: '🏸' },
    { to: '/rating', mono: 'MODULE 02', title: t('home.m2.title'), desc: t('home.m2.desc'), emoji: '📈' },
    { to: '/mbti', mono: 'MODULE 03', title: t('home.m3.title'), desc: t('home.m3.desc'), emoji: '🧠' },
  ]
  return (
    <>
      <section className="card hero">
        <p className="mono-label">BADMINTON TALENT LAB</p>
        <h1 className="page-title">{t('app.name')}</h1>
        <p className="page-subtitle">{t('home.hero')}</p>
        <Link to="/talent" className="btn btn-primary">
          {t('home.start')}
        </Link>
      </section>
      {modules.map((m) => (
        <Link key={m.to} to={m.to} className="card module-card">
          <span className="module-emoji" aria-hidden>
            {m.emoji}
          </span>
          <span className="module-text">
            <span className="mono-label left">{m.mono}</span>
            <strong>{m.title}</strong>
            <span className="muted">{m.desc}</span>
          </span>
        </Link>
      ))}
      {(p.talent || p.rating || p.mbti) && (
        <Link to="/profile" className="card module-card">
          <span className="module-emoji" aria-hidden>
            👤
          </span>
          <span className="module-text">
            <span className="mono-label left">{t('home.yourProfile')}</span>
            {p.talent && (
              <strong>
                {tc.singles[p.talent.result.singles.top].emoji} {tc.singles[p.talent.result.singles.top].name} ·{' '}
                {tc.doubles[p.talent.result.doubles.role].emoji} {tc.doubles[p.talent.result.doubles.role].name}
              </strong>
            )}
            <span className="muted">
              {p.rating && `${rc.levels[p.rating.result.level].code} ${rc.levels[p.rating.result.level].name}`}
              {p.rating && p.mbti && ' · '}
              {p.mbti && `${p.mbti.result.code} ${mc.types[p.mbti.result.code].nickname}`}
            </span>
          </span>
        </Link>
      )}
    </>
  )
}
