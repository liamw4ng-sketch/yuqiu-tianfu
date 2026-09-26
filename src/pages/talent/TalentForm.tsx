import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SelectField, TextField } from '../../components/fields'
import { useTalentContent } from '../../content'
import { ABILITY_KEYS, FIELD_TEST_KEYS, type AbilityKey, type FieldTestKey, type Level } from '../../engine/types'
import { emptyTalentForm, RANGES, validateTalentForm, type FormField, type TalentFormValues, type WarningCode } from '../../engine/validate'
import { format } from '../../i18n/I18nProvider'
import { useStore } from '../../lib/StoreProvider'

type NumericKey = 'age' | 'heightCm' | 'weightKg' | 'wingspanCm' | 'yearsPlaying'
const NUMERIC: NumericKey[] = ['age', 'heightCm', 'weightKg', 'wingspanCm', 'yearsPlaying']

export function TalentForm() {
  const c = useTalentContent()
  const { addTalent } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const missing = (location.state as { missingReport?: boolean } | null)?.missingReport === true
  const [values, setValues] = useState<TalentFormValues>(emptyTalentForm)
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({})
  const [pendingWarnings, setPendingWarnings] = useState<WarningCode[]>([])

  const errorText = (field: FormField, code: 'required' | 'number' | 'range') => {
    if (code !== 'range') return c.form.errors[code]
    const [min, max] = RANGES[field as keyof typeof RANGES]
    return format(c.form.errors.range, { min, max })
  }

  const submit = (confirmed: boolean) => {
    const r = validateTalentForm(values)
    const next: Partial<Record<FormField, string>> = {}
    for (const [f, code] of Object.entries(r.errors)) next[f as FormField] = errorText(f as FormField, code!)
    setErrors(next)
    if (!r.input) {
      setPendingWarnings([])
      return
    }
    if (r.warnings.length > 0 && !confirmed) {
      setPendingWarnings(r.warnings)
      return
    }
    const rec = addTalent(r.input)
    navigate(`/talent/report/${rec.id}`)
  }

  const setNum = (k: NumericKey) => (v: string) => setValues((s) => ({ ...s, [k]: v }))
  const setTest = (k: FieldTestKey) => (v: string) => setValues((s) => ({ ...s, tests: { ...s.tests, [k]: v } }))
  const setLevel = (k: AbilityKey) => (v: string) =>
    setValues((s) => ({ ...s, levels: { ...s.levels, [k]: Number(v) as Level | 0 } }))
  const testsHaveErrors = FIELD_TEST_KEYS.some((k) => errors[k])

  return (
    <form
      className="stack"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        submit(false)
      }}
    >
      {missing && (
        <p className="notice" role="status">
          {c.form.missingReport}
        </p>
      )}
      <SelectField
        id="sex"
        label={c.form.fields.sex}
        value={values.sex}
        placeholder={c.form.choose}
        options={(['M', 'F'] as const).map((v) => ({ value: v, label: c.options.sex[v] }))}
        onChange={(v) => setValues((s) => ({ ...s, sex: v as TalentFormValues['sex'] }))}
        error={errors.sex}
      />
      {NUMERIC.map((k) => (
        <TextField
          key={k}
          id={k}
          label={c.form.fields[k]}
          value={values[k]}
          onChange={setNum(k)}
          error={errors[k]}
          hint={k === 'wingspanCm' ? c.form.wingspanHint : undefined}
        />
      ))}
      <SelectField
        id="hand"
        label={c.form.fields.hand}
        value={values.hand}
        options={(['R', 'L'] as const).map((v) => ({ value: v, label: c.options.hand[v] }))}
        onChange={(v) => setValues((s) => ({ ...s, hand: v as TalentFormValues['hand'] }))}
      />
      <SelectField
        id="freq"
        label={c.form.fields.freq}
        value={values.freq}
        options={(['lt1', '1', '2-3', '4+'] as const).map((v) => ({ value: v, label: c.options.freq[v] }))}
        onChange={(v) => setValues((s) => ({ ...s, freq: v as TalentFormValues['freq'] }))}
      />
      <SelectField
        id="preference"
        label={c.form.fields.preference}
        value={values.preference}
        options={(['all', 'singles', 'doubles', 'mixed'] as const).map((v) => ({ value: v, label: c.options.preference[v] }))}
        onChange={(v) => setValues((s) => ({ ...s, preference: v as TalentFormValues['preference'] }))}
      />

      <h2 className="form-section">{c.form.abilitiesTitle}</h2>
      <p className="field-hint">{c.form.abilitiesHint}</p>
      {ABILITY_KEYS.map((k) => (
        <SelectField
          key={k}
          id={`level-${k}`}
          label={`${c.abilities[k].name}（${c.abilities[k].hint}）`}
          value={values.levels[k] === 0 ? '' : String(values.levels[k])}
          placeholder={c.form.choose}
          options={c.abilities[k].levels.map((text, i) => ({ value: String(i + 1), label: `${i + 1} · ${text}` }))}
          onChange={setLevel(k)}
          error={errors[k]}
        />
      ))}

      <details className="tests" open={testsHaveErrors || undefined}>
        <summary>{c.form.testsTitle}</summary>
        <p className="field-hint">{c.form.testsHint}</p>
        {FIELD_TEST_KEYS.map((k) => (
          <TextField
            key={k}
            id={k}
            label={`${c.tests[k].label}（${c.tests[k].unit}）`}
            value={values.tests[k]}
            onChange={setTest(k)}
            error={errors[k]}
            hint={c.tests[k].hint}
          />
        ))}
      </details>

      {pendingWarnings.length > 0 && (
        <div className="notice" role="alert">
          {pendingWarnings.map((w) => (
            <p key={w}>{c.form.warnings[w]}</p>
          ))}
          <button type="button" className="btn" onClick={() => submit(true)}>
            {c.form.confirmWarnings}
          </button>
        </div>
      )}
      <button type="submit" className="btn btn-primary">
        {c.form.submit}
      </button>
    </form>
  )
}
