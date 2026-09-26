import { useTalentContent } from '../../content'
import { TalentForm } from './TalentForm'

export default function TalentPage() {
  const c = useTalentContent()
  return (
    <section className="card">
      <p className="mono-label">{c.form.moduleLabel}</p>
      <h1 className="page-title">{c.form.title}</h1>
      <p className="page-subtitle">{c.form.subtitle}</p>
      <TalentForm />
    </section>
  )
}
