import { useParams } from 'react-router-dom'

export default function ReportPage() {
  const { id } = useParams()
  return <p data-testid="report-id">{id}</p>
}
