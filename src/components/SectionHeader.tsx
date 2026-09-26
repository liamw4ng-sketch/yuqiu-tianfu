export function SectionHeader({ mono, title, variant = 'plain' }: { mono: string; title: string; variant?: 'plain' | 'blue' | 'amber' }) {
  if (variant === 'plain') {
    return (
      <h2 className="section-header">
        <span className="mono-label">{mono}</span>
        <span className="section-title">{title}</span>
      </h2>
    )
  }
  return (
    <h2 className={variant === 'blue' ? 'band-blue' : 'band-amber'}>
      <span className="mono-label">{mono}</span>
      <span className="band-title">{title}</span>
    </h2>
  )
}
