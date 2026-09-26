import { RadarChart } from '../../../components/RadarChart'
import { useTalentContent } from '../../../content'
import type { TalentResult } from '../../../engine/talent'
import { RADAR_KEYS, type TalentInput } from '../../../engine/types'

export function RadarSection({ result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  return (
    <section>
      <RadarChart
        axes={RADAR_KEYS.map((k) => ({ label: c.abilities[k].name, value: result.current[k], secondary: result.tendency[k] }))}
        primaryLabel={c.report.radarCurrent}
        secondaryLabel={c.report.radarTendency}
      />
      <p className="field-hint">{c.report.radarNote}</p>
    </section>
  )
}
