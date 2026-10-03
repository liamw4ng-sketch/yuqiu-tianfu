import { FitMeter } from '../../../components/FitMeter'
import { SectionHeader } from '../../../components/SectionHeader'
import { joinList, useTalentContent } from '../../../content'
import type { TalentResult } from '../../../engine/talent'
import type { AbilityKey, TalentInput } from '../../../engine/types'
import { format } from '../../../i18n/I18nProvider'

export function SinglesSection({ input, result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  const r = c.report
  const s = result.singles
  const style = c.singles[s.top]
  const runner = s.ranking[1]
  const names = (keys: AbilityKey[]) => joinList(c, keys.map((k) => c.abilities[k].name))
  return (
    <section className="stack">
      <SectionHeader variant="blue" mono={r.singlesMono} title={r.singlesBand} />
      <p className="small">{r.singlesIntro}</p>
      <h3 className="style-name">
        {style.emoji} {style.name}
      </h3>
      <p className="muted">{style.tagline}</p>
      <FitMeter fit={s.ranking[0].fit} label={format(r.fitLine, { fit: s.ranking[0].fit, band: r.fitBands[s.fitBand] })} />
      <p className="pref-note">
        <strong>
          {r.prefLabel}
          {c.list.colon}
        </strong>
        {!input.prefs || !s.preferred
          ? r.prefNone
          : s.preferred !== s.top
            ? format(r.prefConflict, { pref: c.singles[s.preferred].name, rec: style.name })
            : s.abilityTop === s.top
              ? format(r.prefAligned, { style: style.name })
              : format(r.prefLed, { pref: style.name, ability: c.singles[s.abilityTop].name })}
      </p>
      <p>
        <strong>{r.fitAnalysis}{c.list.colon}</strong>
        {format(style.fitIntro, { fit: s.ranking[0].fit })}
      </p>
      <p>{s.drivers.length ? format(r.driversLine, { list: names(s.drivers) }) : r.noDrivers}</p>
      <p>{s.gaps.length ? format(r.gapsLine, { list: names(s.gaps) }) : r.noGaps}</p>
      {(['coreTactic', 'opening', 'midgame', 'keyPoints', 'stamina', 'pitfalls', 'matchups'] as const).map((k) => (
        <p key={k}>
          <strong>{r.singlesLabels[k]}{c.list.colon}</strong>
          {style[k]}
        </p>
      ))}
      <p className="muted">
        {format(r.runnerUp, { emoji: c.singles[runner.style].emoji, name: c.singles[runner.style].name, fit: runner.fit })}
      </p>
    </section>
  )
}
