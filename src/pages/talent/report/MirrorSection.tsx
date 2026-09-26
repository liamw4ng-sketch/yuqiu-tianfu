import { CompareBars } from '../../../components/CompareBars'
import { SectionHeader } from '../../../components/SectionHeader'
import { pick, useTalentContent } from '../../../content'
import { athleteBmi } from '../../../engine/mirror'
import type { TalentResult } from '../../../engine/talent'
import type { TalentInput } from '../../../engine/types'
import { format, useI18n } from '../../../i18n/I18nProvider'

export function MirrorSection({ input, result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  const { lang } = useI18n()
  const r = c.report
  const [top, ...alternates] = result.mirrors.singles
  const pairMirror = result.mirrors.doubles[0]
  const statusText = (status: 'active' | 'retired' | 'split', year?: number | null) =>
    status === 'retired' ? format(r.status.retired, { year: year ?? '' }) : r.status[status]
  const matched = pairMirror ? pairMirror.pair.players[pairMirror.playerIndex] : null
  return (
    <section className="stack">
      <SectionHeader mono="PRO MIRROR" title={r.mirrorTitle} />
      {top && (
        <div className="mirror-card">
          <p className="mono-label left">🎯 {r.singlesMirror}</p>
          <h3>
            {top.athlete.nameEn} {top.athlete.nameZh}
          </h3>
          <p className="muted">
            {pick(top.athlete.country, lang)} · {top.athlete.heightCm}cm
            {top.athlete.weightKg !== null && ` / ${top.athlete.weightKg}kg`} · {statusText(top.athlete.status, top.athlete.retiredYear)}
          </p>
          <p>{pick(top.athlete.highlights, lang)}</p>
          <p>{pick(top.athlete.desc, lang)}</p>
          <p className="muted">
            {r.styleMatch[top.styleMatch]}
            {top.bmiDiff !== null && ` · ${format(r.bmiDiffLine, { diff: Math.abs(top.bmiDiff).toFixed(1) })}`}
          </p>
          <CompareBars
            youLabel={r.you}
            themLabel={r.mirror}
            rows={[
              { label: r.height, you: input.heightCm, them: top.athlete.heightCm, unit: 'cm' },
              { label: r.weight, you: input.weightKg, them: top.athlete.weightKg, unit: 'kg' },
              { label: r.bmi, you: result.body.bmi, them: athleteBmi(top.athlete.heightCm, top.athlete.weightKg), digits: 1 },
            ]}
          />
          {alternates.length > 0 && (
            <p className="muted">
              {r.alternates}：{alternates.map((m) => `${m.athlete.nameEn}（${m.athlete.heightCm}cm）`).join(c.list.sep)}
            </p>
          )}
        </div>
      )}
      {pairMirror && matched && (
        <div className="mirror-card">
          <p className="mono-label left">🤝 {r.doublesMirror}</p>
          <h3>{pairMirror.pair.pairEn}</h3>
          <p className="muted">
            {pairMirror.pair.pairZh} · {r.events[pairMirror.pair.event]} · {pick(pairMirror.pair.country, lang)} ·{' '}
            {statusText(pairMirror.pair.status)}
          </p>
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
