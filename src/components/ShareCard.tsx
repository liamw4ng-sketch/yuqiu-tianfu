import { forwardRef } from 'react'
import { bodyTypeName, useTalentContent } from '../content'
import { useMbtiContent } from '../content/useMbtiContent'
import { useRatingContent } from '../content/useRatingContent'
import { RADAR_KEYS } from '../engine/types'
import { format, useI18n } from '../i18n/I18nProvider'
import type { LatestProfile } from '../lib/latest'
import { RadarChart } from './RadarChart'

/** Tarjeta 1080×1440 (3:4, formato 小红书) que se convierte en PNG. */
export const ShareCard = forwardRef<HTMLDivElement, { profile: LatestProfile }>(function ShareCard({ profile }, ref) {
  const { t } = useI18n()
  const tc = useTalentContent()
  const rc = useRatingContent()
  const mc = useMbtiContent()
  const talent = profile.talent
  if (!talent) return null
  const s = tc.singles[talent.result.singles.top]
  const d = tc.doubles[talent.result.doubles.role]
  const mirror = talent.result.mirrors.singles[0]
  return (
    <div ref={ref} className="share-card">
      <p className="share-mono">BADMINTON TALENT LAB · {t('app.name')}</p>
      <h1 className="share-title">{bodyTypeName(tc, talent.result.body)}</h1>
      <RadarChart size={500} pixelSize axes={RADAR_KEYS.map((k) => ({ label: tc.abilities[k].name, value: talent.result.current[k] }))} />
      <div className="share-grid">
        <div>
          <small>Single Style</small>
          <strong>
            {s.emoji} {s.name}
          </strong>
          <span>{talent.result.singles.ranking[0].fit}%</span>
        </div>
        <div>
          <small>Double Role</small>
          <strong>
            {d.emoji} {d.name}
          </strong>
          <span>{talent.result.doubles.fit}%</span>
        </div>
        {mirror && (
          <div>
            <small>Pro Mirror</small>
            <strong>{mirror.athlete.nameZh}</strong>
            <span>{mirror.athlete.nameEn}</span>
          </div>
        )}
        {profile.rating && (
          <div>
            <small>Level</small>
            <strong>{rc.levels[profile.rating.result.level].code}</strong>
            <span>{rc.levels[profile.rating.result.level].name}</span>
          </div>
        )}
        {profile.mbti && (
          <div>
            <small>MBTI</small>
            <strong>{profile.mbti.result.code}</strong>
            <span>{mc.types[profile.mbti.result.code].nickname}</span>
          </div>
        )}
      </div>
      <p className="share-footer">{format(t('share.footer'), { url: window.location.origin + window.location.pathname })}</p>
    </div>
  )
})
