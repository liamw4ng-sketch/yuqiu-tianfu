import { SectionHeader } from '../../../components/SectionHeader'
import { useTalentContent } from '../../../content'

export function ReferencesSection() {
  const c = useTalentContent()
  return (
    <section className="stack">
      <SectionHeader mono="REFERENCES" title={c.report.referencesTitle} />
      <ol className="refs">
        {c.report.references.map((ref) => (
          <li key={ref.id}>
            <a href={ref.url} target="_blank" rel="noreferrer">
              {ref.citation}
            </a>
            <span className="muted"> — {ref.usedFor}</span>
          </li>
        ))}
      </ol>
      <p className="field-hint">{c.report.disclaimer}</p>
    </section>
  )
}
