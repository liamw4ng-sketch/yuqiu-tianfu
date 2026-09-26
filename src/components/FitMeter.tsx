export function FitMeter({ fit, label }: { fit: number; label: string }) {
  return (
    <div className="fit">
      <div className="fit-track" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={fit} aria-label={label}>
        <div className="fit-bar" style={{ width: `${fit}%` }} />
      </div>
      <span className="fit-text">{label}</span>
    </div>
  )
}
