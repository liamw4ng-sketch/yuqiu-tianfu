import { FitMeter } from '../../../components/FitMeter'
import { SectionHeader } from '../../../components/SectionHeader'
import { joinList, useTalentContent } from '../../../content'
import type { TalentResult } from '../../../engine/talent'
import type { AbilityKey, TalentInput } from '../../../engine/types'
import { format } from '../../../i18n/I18nProvider'

export function DoublesSection({ result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  const r = c.report
  const d = result.doubles
  const role = c.doubles[d.role]
  const names = (keys: AbilityKey[]) => joinList(c, keys.map((k) => c.abilities[k].name))
  return (
    <section className="stack">
      <SectionHeader variant="amber" mono="DOUBLE TACTICS · 双打专属" title={r.doublesBand} />
      <p className="small">{r.doublesIntro}</p>
      <h3 className="style-name">
        {role.emoji} {role.name}
      </h3>
      <p className="muted">{role.tagline}</p>
      <FitMeter fit={d.fit} label={format(r.fitLine, { fit: d.fit, band: r.fitBands[d.fitBand] })} />
      <p>
        <strong>{r.fitAnalysis}：</strong>
        {format(role.fitIntro, { fit: d.fit })}
      </p>
      <p>{d.drivers.length ? format(r.driversLine, { list: names(d.drivers) }) : r.noDrivers}</p>
      <p>{d.gaps.length ? format(r.gapsLine, { list: names(d.gaps) }) : r.noGaps}</p>
      {(['coreTactic', 'rotation', 'positioning', 'positioningDont', 'signals', 'signalsDont'] as const).map((k) => (
        <p key={k}>
          <strong>{r.doublesLabels[k]}：</strong>
          {role[k]}
        </p>
      ))}
      <p data-testid="partner-advice">
        <strong>{r.doublesLabels.partner}：</strong>
        {format(r.partner[d.role], { role: c.doubles[d.partner.role].name, strength: c.abilities[d.partner.strength].name })}
      </p>
      <p>
        <strong>{r.doublesLabels.mixed}：</strong>
        {r.mixedNotes[d.mixedNote]}
      </p>
    </section>
  )
}
