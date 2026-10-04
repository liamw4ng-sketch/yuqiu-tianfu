import { AthleteMedia } from '../../../components/AthleteMedia'
import { CompareBars } from '../../../components/CompareBars'
import { SectionHeader } from '../../../components/SectionHeader'
import { paren, pick, statusLabel, useTalentContent } from '../../../content'
import { athleteBmi, type SinglesMirror } from '../../../engine/mirror'
import type { TalentResult } from '../../../engine/talent'
import type { TalentInput } from '../../../engine/types'
import { format, useI18n } from '../../../i18n/I18nProvider'

function SinglesMirrorCard({
  mirror, label, input, result, showTraits,
}: { mirror: SinglesMirror; label: string; input: TalentInput; result: TalentResult; showTraits: boolean }) {
  const c = useTalentContent()
  const { lang } = useI18n()
  const r = c.report
  const a = mirror.athlete
  return (
    <div className="mirror-card">
      <p className="mono-label left">{label}</p>
      <h3>
        {a.nameEn} {a.nameZh}
      </h3>
      <p className="muted">
        {pick(a.country, lang)} · {a.heightCm}cm
        {a.weightKg !== null && ` / ${a.weightKg}kg`} · {statusLabel(c, a.status, a.retiredYear)}
      </p>
      <AthleteMedia athlete={a} lang={lang} />
      {showTraits && (
        <p className="trait-line" data-testid="mirror-traits">
          <strong>{mirror.shared.length > 0 ? r.sharedTraits : r.signatureTraits[a.sex]}</strong>
          {c.list.colon}
          {(mirror.shared.length > 0 ? mirror.shared : a.traits).map((t) => c.traits[t]).join(c.list.sep)}
        </p>
      )}
      <p>{pick(a.highlights, lang)}</p>
      <p>{pick(a.desc, lang)}</p>
      <p className="muted">
        {r.styleMatch[mirror.styleMatch]}
        {mirror.bmiDiff !== null && ` · ${format(r.bmiDiffLine, { diff: Math.abs(mirror.bmiDiff).toFixed(1) })}`}
      </p>
      <CompareBars
        youLabel={r.you}
        themLabel={r.mirror}
        rows={[
          { label: r.height, you: input.heightCm, them: a.heightCm, unit: 'cm' },
          { label: r.weight, you: input.weightKg, them: a.weightKg, unit: 'kg' },
          { label: r.bmi, you: result.body.bmi, them: athleteBmi(a.heightCm, a.weightKg), digits: 1 },
        ]}
      />
    </div>
  )
}

export function MirrorSection({ input, result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  const { lang } = useI18n()
  const r = c.report
  const [styleTop, ...styleRest] = result.mirrors.style
  const bodyTop = result.mirrors.body[0]
  const pairMirror = result.mirrors.doubles[0]
  const matched = pairMirror ? pairMirror.pair.players[pairMirror.playerIndex] : null
  const shown = new Set([styleTop?.athlete.id, bodyTop?.athlete.id])
  const alternates = styleRest.filter((m) => !shown.has(m.athlete.id))
  return (
    <section className="stack">
      <SectionHeader mono="PRO MIRROR" title={r.mirrorTitle} />
      {styleTop && <SinglesMirrorCard mirror={styleTop} label={`🎯 ${r.singlesMirror}`} input={input} result={result} showTraits />}
      {bodyTop && <SinglesMirrorCard mirror={bodyTop} label={`📏 ${r.bodyMirror}`} input={input} result={result} showTraits={false} />}
      {alternates.length > 0 && (
        <p className="muted">
          {r.alternates}
          {c.list.colon}
          {alternates.map((m) => `${m.athlete.nameEn}${paren(c, `${m.athlete.heightCm}cm`)}`).join(c.list.sep)}
        </p>
      )}
      {pairMirror && matched && (
        <div className="mirror-card">
          <p className="mono-label left">🤝 {r.doublesMirror}</p>
          <h3>{pairMirror.pair.pairEn}</h3>
          <p className="muted">
            {pairMirror.pair.pairZh} · {r.events[pairMirror.pair.event]} · {pick(pairMirror.pair.country, lang)} ·{' '}
            {statusLabel(c, pairMirror.pair.status)}
          </p>
          <AthleteMedia athlete={{ nameEn: pairMirror.pair.pairEn, nameZh: pairMirror.pair.pairZh }} lang={lang} />
          <p>{pick(pairMirror.pair.style, lang)}</p>
          <p>
            <strong>{format(r.matchedPlayer, { name: `${matched.nameEn} ${matched.nameZh}`, position: r.positions[matched.position] })}</strong>{' '}
            {pick(matched.role, lang)}
          </p>
          <CompareBars
            youLabel={r.you}
            themLabel={r.mirror}
            rows={[
              { label: r.height, you: input.heightCm, them: matched.heightCm, unit: 'cm' },
              { label: r.weight, you: input.weightKg, them: matched.weightKg, unit: 'kg' },
            ]}
          />
        </div>
      )}
    </section>
  )
}
