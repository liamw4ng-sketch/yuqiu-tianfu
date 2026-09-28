import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChoiceGroup } from '../../components/ChoiceGroup'
import { useMbtiContent } from '../../content/useMbtiContent'
import { isMbtiComplete, MBTI_QUESTION_IDS, type MbtiAnswers } from '../../engine/mbti'
import { format } from '../../i18n/I18nProvider'
import { useStore } from '../../lib/StoreProvider'

export default function MbtiPage() {
  const c = useMbtiContent()
  const { addMbti } = useStore()
  const navigate = useNavigate()
  const missing = (useLocation().state as { missing?: boolean } | null)?.missing === true
  const [answers, setAnswers] = useState<MbtiAnswers>({})
  const [showIncomplete, setShowIncomplete] = useState(false)
  const done = MBTI_QUESTION_IDS.filter((id) => answers[id]).length
  const submit = () => {
    if (!isMbtiComplete(answers)) {
      setShowIncomplete(true)
      return
    }
    navigate(`/mbti/result/${addMbti(answers).id}`)
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
      <p className="field-hint center">{c.disclaimer}</p>
      <p className="progress" aria-live="polite">
        {format(c.progress, { done, total: MBTI_QUESTION_IDS.length })}
      </p>
      {MBTI_QUESTION_IDS.map((id) => (
        <ChoiceGroup
          key={id}
          name={id}
          legend={c.questions[id].text}
          value={answers[id]}
          options={[
            { value: 'a', label: c.questions[id].a },
            { value: 'b', label: c.questions[id].b },
          ]}
          onChange={(v) => setAnswers((a) => ({ ...a, [id]: v as 'a' | 'b' }))}
        />
      ))}
      {showIncomplete && done < MBTI_QUESTION_IDS.length && (
        <p className="field-error" role="alert">
          {format(c.incomplete, { n: MBTI_QUESTION_IDS.length - done })}
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={submit}>
        {c.submit}
      </button>
    </section>
  )
}
