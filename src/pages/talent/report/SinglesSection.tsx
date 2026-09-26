import { FitMeter } from '../../../components/FitMeter'
import { SectionHeader } from '../../../components/SectionHeader'
import { joinList, useTalentContent } from '../../../content'
import type { TalentResult } from '../../../engine/talent'
import type { AbilityKey, TalentInput } from '../../../engine/types'
import { format } from '../../../i18n/I18nProvider'

export function SinglesSection({ result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  const r = c.report
  const s = result.singles
  const style = c.singles[s.top]
  const runner = s.ranking[1]
  const names = (keys: AbilityKey[]) => joinList(c, keys.map((k) => c.abilities[k].name))
  return (
    <section className="stack">
      <SectionHeader variant="blue" mono="SINGLE STRATEGY · 单打专属" title={r.singlesBand} />
      <p className="small">{r.singlesIntro}</p>
      <h3 className="style-name">
        {style.emoji} {style.name}
      </h3>
      <p className="muted">{style.tagline}</p>
      <FitMeter fit={s.ranking[0].fit} label={format(r.fitLine, { fit: s.ranking[0].fit, band: r.fitBands[s.fitBand] })} />
      <p>
        <strong>{r.fitAnalysis}：</strong>
        {format(style.fitIntro, { fit: s.ranking[0].fit })}
      </p>
      <p>{s.drivers.length ? format(r.driversLine, { list: names(s.drivers) }) : r.noDrivers}</p>
      <p>{s.gaps.length ? format(r.gapsLine, { list: names(s.gaps) }) : r.noGaps}</p>
      {(['coreTactic', 'opening', 'midgame', 'keyPoints', 'stamina', 'pitfalls', 'matchups'] as const).map((k) => (
        <p key={k}>
          <strong>{r.singlesLabels[k]}：</strong>
          {style[k]}
        </p>
      ))}
      <p className="muted">
        {format(r.runnerUp, { emoji: c.singles[runner.style].emoji, name: c.singles[runner.style].name, fit: runner.fit })}
      </p>
    </section>
  )
}
