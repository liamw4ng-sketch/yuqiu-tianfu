import { SectionHeader } from '../../../components/SectionHeader'
import { useTalentContent } from '../../../content'
import type { TalentResult } from '../../../engine/talent'
import type { TalentInput } from '../../../engine/types'

export function TrainingSection({ result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  return (
    <section className="stack">
      <SectionHeader mono="TRAINING" title={c.report.trainingTitle} />
      <ol className="drills">
        {result.drills.map((id) => (
          <li key={id}>
            <strong>{c.report.drills[id].name}</strong>
            <p>{c.report.drills[id].how}</p>
            <p className="muted">{c.report.drills[id].dose}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
