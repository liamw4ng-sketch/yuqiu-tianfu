import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CompareBars } from '../components/CompareBars'
import { RadarChart } from '../components/RadarChart'
import { SectionHeader } from '../components/SectionHeader'
import { ShareButton } from '../components/ShareButton'
import { pick, statusLabel, useTalentContent } from '../content'
import { useMbtiContent } from '../content/useMbtiContent'
import { useRatingContent } from '../content/useRatingContent'
import { currentScores } from '../engine/abilities'
import { athleteBmi } from '../engine/mirror'
import { RADAR_KEYS } from '../engine/types'
import { useI18n } from '../i18n/I18nProvider'
import { latestProfile } from '../lib/latest'
import { useStore } from '../lib/StoreProvider'

export default function ProfilePage() {
  const { t, lang } = useI18n()
  const { state, clearAll } = useStore()
  const tc = useTalentContent()
  const rc = useRatingContent()
  const mc = useMbtiContent()
  const p = useMemo(() => latestProfile(state), [state])
  const dateFmt = new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'es-ES', { dateStyle: 'medium' })

  if (!p.talent && !p.rating && !p.mbti) {
    return (
      <section className="card stack">
        <p className="mono-label">MY PROFILE</p>
        <h1 className="page-title">{t('nav.profile')}</h1>
        <p className="page-subtitle">{t('profile.empty')}</p>
        <Link to="/talent" className="btn btn-primary">
          {t('home.start')}
        </Link>
      </section>
    )
  }

  const first = state.talent[0]
  const talent = p.talent
  const mirror = talent?.result.mirrors.singles[0]
  return (
    <>
      {talent && (
        <section className="stack">
          <SectionHeader mono="SINGLE / DOUBLE" title={t('profile.styleRole')} />
          <div className="two-cols">
            <div className="card mini">
              <p className="mono-label left">Single Style</p>
              <h3>
                {tc.singles[talent.result.singles.top].emoji} {tc.singles[talent.result.singles.top].name}
              </h3>
              <p className="muted">{tc.singles[talent.result.singles.top].tagline}</p>
            </div>
            <div className="card mini">
              <p className="mono-label left">Double Role</p>
              <h3>
                {tc.doubles[talent.result.doubles.role].emoji} {tc.doubles[talent.result.doubles.role].name}
              </h3>
              <p className="muted">{tc.doubles[talent.result.doubles.role].tagline}</p>
            </div>
          </div>
          {mirror && (
            <>
              <SectionHeader mono="PRO MIRROR" title={t('profile.mirrors')} />
              <div className="card mini">
                <p className="mono-label left">Single Mirror</p>
                <h3>
                  {mirror.athlete.nameEn} {mirror.athlete.nameZh}
                </h3>
                <p className="muted">
                  {pick(mirror.athlete.country, lang)} · {mirror.athlete.heightCm}cm · {statusLabel(tc, mirror.athlete.status, mirror.athlete.retiredYear)}
                </p>
                <CompareBars
                  youLabel={tc.report.you}
                  themLabel={tc.report.mirror}
                  rows={[
                    { label: tc.report.height, you: talent.record.input.heightCm, them: mirror.athlete.heightCm, unit: 'cm' },
                    { label: tc.report.weight, you: talent.record.input.weightKg, them: mirror.athlete.weightKg, unit: 'kg' },
                    { label: tc.report.bmi, you: talent.result.body.bmi, them: athleteBmi(mirror.athlete.heightCm, mirror.athlete.weightKg), digits: 1 },
                  ]}
                />
              </div>
            </>
          )}
          {first && state.talent.length >= 2 && (
            <div className="card mini">
              <h3>{t('profile.progress')}</h3>
              <RadarChart
                axes={RADAR_KEYS.map((k) => ({
                  label: tc.abilities[k].name,
                  value: talent.result.current[k],
                  secondary: currentScores(first.input)[k],
                }))}
                primaryLabel={t('profile.latest')}
                secondaryLabel={t('profile.first')}
              />
            </div>
          )}
        </section>
      )}
      {p.rating && (
        <Link to={`/rating/result/${p.rating.record.id}`} className="card module-card">
          <span className="module-emoji" aria-hidden>
            📈
          </span>
          <span className="module-text">
            <span className="mono-label left">{t('profile.level')}</span>
            <strong>
              {rc.levels[p.rating.result.level].code} · {rc.levels[p.rating.result.level].name}
            </strong>
          </span>
        </Link>
      )}
      {p.mbti && (
        <Link to={`/mbti/result/${p.mbti.record.id}`} className="card module-card">
          <span className="module-emoji" aria-hidden>
            {mc.types[p.mbti.result.code].emoji}
          </span>
          <span className="module-text">
            <span className="mono-label left">{t('profile.mbti')}</span>
            <strong>
              {p.mbti.result.code} · {mc.types[p.mbti.result.code].nickname}
            </strong>
          </span>
        </Link>
      )}
      {state.talent.length > 0 && (
        <section className="card stack">
          <h2 className="form-section">{t('profile.history')}</h2>
          <ul className="history">
            {[...state.talent].reverse().map((r) => (
              <li key={r.id}>
                <span>{dateFmt.format(new Date(r.createdAt))}</span>
                <Link to={`/talent/report/${r.id}`}>{t('profile.open')} →</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="row center-row">
        <ShareButton />
      </div>
      <button
        type="button"
        className="btn btn-ghost danger"
        onClick={() => {
          if (window.confirm(t('profile.clearConfirm'))) clearAll()
        }}
      >
        {t('profile.clear')}
      </button>
    </>
  )
}
