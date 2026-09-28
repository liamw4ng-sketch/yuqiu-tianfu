import { Link, Navigate, useParams } from 'react-router-dom'
import { useRatingContent } from '../../content/useRatingContent'
import { isRatingComplete, scoreRating } from '../../engine/rating'
import { format } from '../../i18n/I18nProvider'
import { useStore } from '../../lib/StoreProvider'

export default function RatingResultPage() {
  const { id } = useParams()
  const { state } = useStore()
  const c = useRatingContent()
  const rec = state.rating.find((r) => r.id === id)
  if (!rec || !isRatingComplete(rec.answers)) return <Navigate to="/rating" replace state={{ missing: true }} />
  const r = scoreRating(rec.answers)
  const lv = c.levels[r.level]
  return (
    <article className="card stack">
      <p className="mono-label">LEVEL REPORT</p>
      <h1 className="page-title">{c.result.title}</h1>
      <div className="level-badge">
        <span className="level-code">{lv.code}</span>
        <span className="level-name">{lv.name}</span>
      </div>
      <p className="page-subtitle">{lv.tagline}</p>
      <p className="muted center">{format(c.result.scoreLine, { points: r.points, max: r.maxPoints, percent: r.percent })}</p>
      {r.caps.length > 0 && (
        <div className="notice stack">
          <strong>{c.result.capsTitle}</strong>
          {r.caps.map((cap) => (
            <p key={`${cap.question}-${cap.maxLevel}`}>
              {format(c.result.cap, { question: c.questions[cap.question].title, level: c.levels[cap.maxLevel].code })}
            </p>
          ))}
        </div>
      )}
      {r.warnings.length > 0 && (
        <div className="notice stack">
          <strong>{c.result.warningsTitle}</strong>
          {r.warnings.map((w) => (
            <p key={w}>{c.rules[w]}</p>
          ))}
        </div>
      )}
      <h2 className="form-section">{c.result.canTitle}</h2>
      <ul className="list">
        {lv.can.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <h2 className="form-section">{c.result.typicalTitle}</h2>
      <p>{lv.typical}</p>
      <h2 className="form-section">{c.result.nextTitle}</h2>
      <ul className="list">
        {lv.next.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <p className="field-hint">{c.result.basis}</p>
      <p className="field-hint">{c.result.disclaimer}</p>
      <Link to="/rating" className="btn">
        🔄 {c.result.retake}
      </Link>
    </article>
  )
}
