import { Link, Navigate, useParams } from 'react-router-dom'
import { useMbtiContent } from '../../content/useMbtiContent'
import { bestPartner, isMbtiComplete, MBTI_AXES, scoreMbti, worstPartner } from '../../engine/mbti'
import { useStore } from '../../lib/StoreProvider'

export default function MbtiResultPage() {
  const { id } = useParams()
  const { state } = useStore()
  const c = useMbtiContent()
  const rec = state.mbti.find((r) => r.id === id)
  if (!rec || !isMbtiComplete(rec.answers)) return <Navigate to="/mbti" replace state={{ missing: true }} />
  const r = scoreMbti(rec.answers)
  const t = c.types[r.code]
  const best = bestPartner(r.code)
  const worst = worstPartner(r.code)
  return (
    <article className="card stack">
      <p className="mono-label">COURT PERSONALITY</p>
      <h1 className="page-title">
        {t.emoji} {t.nickname}
      </h1>
      <p className="mbti-code">{r.code}</p>
      <p className="page-subtitle">{t.tagline}</p>
      <div className="axes">
        {MBTI_AXES.map((axis) => {
          const a = r.axes[axis]
          const firstShare = Math.round((a.first / (a.first + a.second)) * 100)
          return (
            <div key={axis} className="axis">
              <span className={a.winner === c.axes[axis].first.charAt(0) ? 'win' : ''}>{c.axes[axis].first}</span>
              <div className="axis-track" role="img" aria-label={`${c.axes[axis].name}: ${a.winner} ${a.percent}%`}>
                <div className="axis-fill" style={{ width: `${firstShare}%` }} />
              </div>
              <span className={a.winner === c.axes[axis].second.charAt(0) ? 'win' : ''}>{c.axes[axis].second}</span>
            </div>
          )
        })}
      </div>
      <p>{t.desc}</p>
      <h2 className="form-section">{c.result.strengthsTitle}</h2>
      <ul className="list">
        {t.strengths.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <h2 className="form-section">{c.result.weaknessesTitle}</h2>
      <ul className="list">
        {t.weaknesses.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <h2 className="form-section">{c.result.bestPartnerTitle}</h2>
      <p>
        <strong>
          {c.types[best].emoji} {best} · {c.types[best].nickname}
        </strong>{' '}
        — {t.partnerWhy}
      </p>
      <h2 className="form-section">{c.result.worstPartnerTitle}</h2>
      <p>
        <strong>
          {c.types[worst].emoji} {worst} · {c.types[worst].nickname}
        </strong>{' '}
        — {t.clashWhy}
      </p>
      <h2 className="form-section">{c.result.proTitle}</h2>
      <p>{t.pro}</p>
      <h2 className="form-section">{c.result.tipsTitle}</h2>
      <ul className="list">
        {t.tips.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <p className="field-hint">{c.disclaimer}</p>
      <Link to="/mbti" className="btn">
        🔄 {c.result.retake}
      </Link>
    </article>
  )
}
