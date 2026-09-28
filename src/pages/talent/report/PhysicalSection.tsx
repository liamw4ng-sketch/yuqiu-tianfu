import { SectionHeader } from '../../../components/SectionHeader'
import { bodyTypeName, useTalentContent } from '../../../content'
import type { TalentResult } from '../../../engine/talent'
import type { TalentInput } from '../../../engine/types'
import { format } from '../../../i18n/I18nProvider'

const one = (n: number) => n.toFixed(1)

export function PhysicalSection({ input, result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  const r = c.report
  const { body } = result
  const diag = (k: 'tactics' | 'mental', title: string) => (
    <div className="diag">
      <h3>{format(title, { score: one(result.current[k]) })}</h3>
      <p>{format(c.abilities[k].diag[result.diagnosis[k]], { score: one(result.current[k]) })}</p>
      <p className="muted">{c.abilities[k].tips[result.diagnosis[k]]}</p>
    </div>
  )
  return (
    <section className="stack">
      <SectionHeader mono="PHYSICAL ANALYSIS" title={r.physicalTitle} />
      <p>
        {format(r.bodyLine, {
          sex: c.options.sex[input.sex],
          height: input.heightCm,
          weight: input.weightKg,
          bmi: one(body.bmi),
          band: r.bmiBands[body.bmiBand],
        })}
      </p>
      <p>
        {format(r.wingspanLine, { diff: body.apeIndexCm, ratio: body.apeRatio.toFixed(3) })}
        {body.wingspanAssumed && <span className="muted"> {r.wingspanAssumed}</span>}
      </p>
      <p>{format(r.yearsLine, { years: input.yearsPlaying })}</p>
      <p>
        <strong>
          {r.bodyTypeLabel}
          {c.list.colon}
          {bodyTypeName(c, body)}
        </strong>{' '}
        — {c.bodyTypes[body.bodyType].summary}
      </p>
      {result.bodyClaims.map((claim) => (
        <p key={`${claim.kind}-${claim.key}`} className="claim">
          {format((claim.kind === 'advantage' ? r.claimAdvantage : r.claimDisadvantage)[claim.level], {
            ability: c.abilities[claim.key].name,
            score: one(result.current[claim.key]),
          })}
        </p>
      ))}
      <p>
        <strong>{r.ageBands[body.ageBand].name}</strong>
        {c.list.colon}
        {r.ageBands[body.ageBand].advice}
      </p>
      <p>
        {format(r.strongWeak, {
          strong: c.abilities[result.strongest].name,
          strongScore: one(result.current[result.strongest]),
          weak: c.abilities[result.weakest].name,
          weakScore: one(result.current[result.weakest]),
        })}
      </p>
      {diag('tactics', r.tacticsTitle)}
      {diag('mental', r.mentalTitle)}
    </section>
  )
}
