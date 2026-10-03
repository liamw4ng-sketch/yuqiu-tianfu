export function ChoiceGroup({
  name,
  legend,
  options,
  value,
  onChange,
  id,
  error,
}: {
  name: string
  legend: string
  options: { value: string; label: string }[]
  value?: string
  onChange: (v: string) => void
  /** Para poder llevar el foco al grupo cuando falta la respuesta */
  id?: string
  error?: string
}) {
  return (
    <fieldset className={'choice' + (error ? ' has-error' : '')} id={id} tabIndex={id ? -1 : undefined}>
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o.value} className={'choice-option' + (value === o.value ? ' is-selected' : '')}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  )
}
