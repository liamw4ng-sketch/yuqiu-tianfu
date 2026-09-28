import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ShareButton } from '../../components/ShareButton'
import { useTalentContent } from '../../content'
import { analyzeTalent } from '../../engine/talent'
import { useStore } from '../../lib/StoreProvider'
import { DoublesSection } from './report/DoublesSection'
import { MirrorSection } from './report/MirrorSection'
import { NotesSection } from './report/NotesSection'
import { PhysicalSection } from './report/PhysicalSection'
import { RadarSection } from './report/RadarSection'
import { ReferencesSection } from './report/ReferencesSection'
import { SinglesSection } from './report/SinglesSection'
import { TrainingSection } from './report/TrainingSection'

export default function ReportPage() {
  const { id } = useParams()
  const { state } = useStore()
  const c = useTalentContent()
  const record = state.talent.find((r) => r.id === id)
  const result = useMemo(() => (record ? analyzeTalent(record.input) : null), [record])
  if (!record || !result) return <Navigate to="/talent" replace state={{ missingReport: true }} />
  const props = { input: record.input, result }
  const doublesFirst = record.input.preference === 'doubles' || record.input.preference === 'mixed'
  return (
    <article className="card report stack">
      <div className="row">
        <Link to="/" className="btn btn-ghost">
          ← {c.report.back}
        </Link>
        <Link to="/talent" className="btn">
          🔄 {c.report.retest}
        </Link>
        <ShareButton />
      </div>
      <p className="mono-label report-mono">REPORT</p>
      <h1 className="report-title">🏸 {c.report.title}</h1>
      <RadarSection {...props} />
      <PhysicalSection {...props} />
      {doublesFirst ? (
        <>
          <DoublesSection {...props} />
          <SinglesSection {...props} />
        </>
      ) : (
        <>
          <SinglesSection {...props} />
          <DoublesSection {...props} />
        </>
      )}
      <MirrorSection {...props} />
      <TrainingSection {...props} />
      <NotesSection {...props} />
      <ReferencesSection />
    </article>
  )
}
