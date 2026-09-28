import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChoiceGroup } from '../../components/ChoiceGroup'
import { useRatingContent } from '../../content/useRatingContent'
import { isRatingComplete, RATING_OPTIONS, RATING_QUESTION_IDS, type RatingAnswers, type RatingOption } from '../../engine/rating'
import { format } from '../../i18n/I18nProvider'
import { useStore } from '../../lib/StoreProvider'

export default function RatingPage() {
  const c = useRatingContent()
  const { addRating } = useStore()
  const navigate = useNavigate()
  const missing = (useLocation().state as { missing?: boolean } | null)?.missing === true
  const [answers, setAnswers] = useState<RatingAnswers>({})
  const [showIncomplete, setShowIncomplete] = useState(false)
  const done = RATING_QUESTION_IDS.filter((id) => answers[id]).length
  const submit = () => {
    if (!isRatingComplete(answers)) {
      setShowIncomplete(true)
      return
    }
    navigate(`/rating/result/${addRating(answers).id}`)
  }
  return (
    <section className="card stack">
      <p className="mono-label">{c.moduleLabel}</p>
      <h1 className="page-title">{c.title}</h1>
      <p className="page-subtitle">{c.subtitle}</p>
      {missing && (
        <p className="notice" role="status">
          {c.result.missing}
        </p>
      )}
      <p>{c.intro}</p>
      <p className="progress" aria-live="polite">
        {format(c.progress, { done, total: RATING_QUESTION_IDS.length })}
      </p>
      {RATING_QUESTION_IDS.map((id) => (
        <ChoiceGroup
          key={id}
          name={id}
          legend={c.questions[id].title}
          value={answers[id]}
          options={RATING_OPTIONS.map((o, j) => ({ value: o, label: c.questions[id].options[j] }))}
          onChange={(v) => setAnswers((a) => ({ ...a, [id]: v as RatingOption }))}
        />
      ))}
      {showIncomplete && done < RATING_QUESTION_IDS.length && (
        <p className="field-error" role="alert">
          {format(c.incomplete, { n: RATING_QUESTION_IDS.length - done })}
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={submit}>
        {c.submit}
      </button>
    </section>
  )
}
