export interface RadarAxis {
  label: string
  value: number
  secondary?: number
}

export function radarPoint(i: number, n: number, ratio: number, radius: number, cx: number, cy: number): [number, number] {
  if (ratio === 0) return [cx, cy]
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
  return [cx + radius * ratio * Math.cos(angle), cy + radius * ratio * Math.sin(angle)]
}

const ratioOf = (v: number, max: number) => Math.min(1, Math.max(0, v / max))
const pts = (list: [number, number][]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

export function RadarChart({
  axes,
  max = 10,
  size = 340,
  primaryLabel,
  secondaryLabel,
  pixelSize = false,
}: {
  axes: RadarAxis[]
  max?: number
  size?: number
  primaryLabel?: string
  secondaryLabel?: string
  /** Fija width/height en píxeles (imagen para compartir) en lugar de adaptarse al contenedor */
  pixelSize?: boolean
}) {
  const n = axes.length
  const c = size / 2
  const radius = size * 0.3
  const at = (i: number, ratio: number) => radarPoint(i, n, ratio, radius, c, c)
  const primary = axes.map((a, i) => at(i, ratioOf(a.value, max)))
  const hasSecondary = axes.every((a) => a.secondary !== undefined)
  const secondary = hasSecondary ? axes.map((a, i) => at(i, ratioOf(a.secondary!, max))) : []
  // Colores y tamaños también como atributos SVG: html-to-image no traslada el CSS de los SVG a la captura.
  const labelSize = Math.round(size * 0.041)
  const tickSize = Math.round(size * 0.035)
  return (
    <figure className="radar">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={pixelSize ? size : undefined}
        height={pixelSize ? size : undefined}
        style={pixelSize ? { maxWidth: 'none' } : undefined}
        role="img"
        aria-label={axes.map((a) => `${a.label} ${a.value.toFixed(1)}`).join(' · ')}
      >
        {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
          <polygon key={r} points={pts(axes.map((_, i) => at(i, r)))} className="radar-ring" fill="none" stroke="#e6e8ee" />
        ))}
        {axes.map((_, i) => {
          const [x, y] = at(i, 1)
          return <line key={i} x1={c} y1={c} x2={x} y2={y} className="radar-spoke" stroke="#eceef3" />
        })}
        {[2, 4, 6, 8, 10].map((v) => {
          const [x, y] = at(0, v / max)
          return (
            <text key={v} x={x + 6} y={y + 4} className="radar-tick" fontSize={tickSize} fill="#b3b7c2">
              {v}
            </text>
          )
        })}
        {hasSecondary && (
          <polygon
            points={pts(secondary)}
            className="radar-secondary"
            data-testid="radar-secondary"
            fill="none"
            stroke="#2f6bff"
            strokeWidth={2}
            strokeDasharray="6 5"
          />
        )}
        <polygon
          points={pts(primary)}
          className="radar-primary"
          data-testid="radar-primary"
          fill="rgba(11, 11, 15, 0.06)"
          stroke="#0b0b0f"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {primary.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={5} className="radar-dot" fill="#0b0b0f" />
        ))}
        {axes.map((a, i) => {
          const [x, y] = at(i, 1.25)
          return (
            <text
              key={a.label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="radar-label"
              fontSize={labelSize}
              fontWeight={700}
              fill="#0b0b0f"
            >
              {a.label}
            </text>
          )
        })}
      </svg>
      {(primaryLabel || secondaryLabel) && (
        <figcaption className="radar-legend">
          {primaryLabel && <span className="legend-primary">{primaryLabel}</span>}
          {secondaryLabel && hasSecondary && <span className="legend-secondary">{secondaryLabel}</span>}
        </figcaption>
      )}
    </figure>
  )
}
