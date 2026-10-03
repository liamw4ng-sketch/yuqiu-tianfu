export interface CompareRow {
  label: string
  you: number | null
  them: number | null
  unit?: string
  digits?: number
}

// Sin `digits`, enteros sin decimales y el resto con 1 decimal (51.5 kg no se redondea a 52).
const show = (v: number | null, digits?: number) =>
  v === null || !Number.isFinite(v) ? '—' : v.toFixed(digits ?? (Number.isInteger(v) ? 0 : 1))

export function CompareBars({ rows, youLabel, themLabel }: { rows: CompareRow[]; youLabel: string; themLabel: string }) {
  return (
    <div className="compare">
      {rows.map((r) => {
        const max = Math.max(r.you ?? 0, r.them ?? 0) || 1
        return (
          <div key={r.label} className="compare-row">
            <span className="compare-label">{r.label}</span>
            <div className="compare-bars">
              <div className="compare-line">
                <span className="compare-who">{youLabel}</span>
                <span className="compare-bar you" style={{ width: `${((r.you ?? 0) / max) * 100}%` }} />
                <span className="compare-value">{show(r.you, r.digits)}</span>
              </div>
              <div className="compare-line">
                <span className="compare-who them">{themLabel}</span>
                <span className="compare-bar them" style={{ width: `${((r.them ?? 0) / max) * 100}%` }} />
                <span className="compare-value">{show(r.them, r.digits)}</span>
              </div>
            </div>
            {r.unit && <span className="compare-unit">{r.unit}</span>}
          </div>
        )
      })}
    </div>
  )
}
