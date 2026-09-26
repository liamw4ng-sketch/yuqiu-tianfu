import { useTalentContent } from '../../../content'
import type { TalentResult } from '../../../engine/talent'
import type { TalentInput } from '../../../engine/types'

export function NotesSection({ result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  if (result.flags.length === 0) return null
  return (
    <section className="notice stack">
      <strong>{c.report.flagsTitle}</strong>
      {result.flags.map((f) => (
        <p key={f}>{c.report.flags[f]}</p>
      ))}
    </section>
  )
}
