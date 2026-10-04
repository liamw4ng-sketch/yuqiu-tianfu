import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { talentEs } from '../../content/es/talent'
import { talentZh as c } from '../../content/zh/talent'
import { analyzeTalent } from '../../engine/talent'
import { GOLDEN, makeInput } from '../../engine/testkit'
import { format } from '../../i18n/I18nProvider'
import { emptyState, STORAGE_KEY } from '../../lib/storage'
import { renderApp } from '../../test/renderApp'

function seed() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...emptyState(), talent: [{ id: 'r1', createdAt: '2026-09-26T10:00:00.000Z', engineVersion: 1, input: GOLDEN }] }),
  )
}

describe('ReportPage', () => {
  it('muestra el informe coherente del perfil de referencia', () => {
    seed()
    renderApp('/talent/report/r1')
    // getAllByText: el mismo nombre puede aparecer en varias secciones.
    expect(screen.getAllByText(new RegExp(c.singles.control.name)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(new RegExp(c.doubles.back.name)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(new RegExp(c.bodyTypes.lightAgile.name.replace(/[()（）]/g, '.'))).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/19\.2/).length).toBeGreaterThan(0)
    // El consejo de pareja nombra el rol complementario (前场), nunca solo el propio.
    const partner = screen.getByTestId('partner-advice').textContent!
    expect(partner).toContain(c.doubles.front.name)
    expect(document.body.textContent).not.toContain('NaN')
    expect(document.body.textContent).not.toContain('undefined')
    // Dos espejos de individual: estilo y cuerpo.
    expect(screen.getByText(new RegExp(c.report.singlesMirror.replace(/[()（）]/g, '.')))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(c.report.bodyMirror.replace(/[()（）]/g, '.')))).toBeInTheDocument()
  })
  it('id inexistente → vuelve al formulario con aviso', () => {
    renderApp('/talent/report/nope')
    expect(screen.getByText(c.form.missingReport)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: c.form.submit })).toBeInTheDocument()
  })
  it('cambiar de idioma traduce todo el informe', async () => {
    seed()
    renderApp('/talent/report/r1')
    await userEvent.click(screen.getByRole('button', { name: '切换到西班牙语' }))
    expect(screen.getAllByText(new RegExp(talentEs.singles.control.name)).length).toBeGreaterThan(0)
    expect(document.body.textContent).not.toMatch(new RegExp(c.singles.control.name))
    // Sin restos de chino en la maquetación: bandas y dos puntos.
    expect(document.body.textContent).not.toContain('单打专属')
    expect(document.body.textContent).not.toContain('双打专属')
    expect(document.body.textContent).not.toContain('：')
  })
})

describe('ReportPage con perfil plano', () => {
  it('no dice que la misma capacidad es la más fuerte y la más débil', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...emptyState(), talent: [{ id: 'flat', createdAt: '2026-09-26T10:00:00.000Z', engineVersion: 1, input: makeInput('M', 25, 172, 66, null, 2, [3, 3, 3, 3, 3, 3, 3, 3]) }] }),
    )
    renderApp('/talent/report/flat')
    expect(screen.getByText(c.report.flatProfile)).toBeInTheDocument()
  })
})

describe('ReportPage con 球风偏好', () => {
  const seedWith = (prefs: NonNullable<typeof GOLDEN.prefs>) =>
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...emptyState(), talent: [{ id: 'p', createdAt: '2026-10-03T10:00:00.000Z', engineVersion: 2, input: { ...GOLDEN, prefs } }] }),
    )
  it('explica si el gusto y la recomendación coinciden o no', () => {
    const prefs = { scoring: 'net', midcourt: 'drop', tempo: 'adapt', underAttack: 'block', rally: 'either', doublesSpot: 'back' } as const
    seedWith(prefs)
    renderApp('/talent/report/p')
    const r = analyzeTalent({ ...GOLDEN, prefs })
    const pref = r.singles.preferred!
    const expected =
      pref !== r.singles.top
        ? format(c.report.prefConflict, { pref: c.singles[pref].name, rec: c.singles[r.singles.top].name })
        : r.singles.abilityTop === pref
          ? format(c.report.prefAligned, { style: c.singles[pref].name })
          : format(c.report.prefLed, { pref: c.singles[pref].name, ability: c.singles[r.singles.abilityTop].name })
    expect(screen.getByText(expected)).toBeInTheDocument()
  })
  it('si el gusto decide la recomendación, no dice que las capacidades coinciden', () => {
    const prefs = { scoring: 'counter', midcourt: 'push', tempo: 'grind', underAttack: 'drive', rally: 'long', doublesSpot: 'front' } as const
    seedWith(prefs)
    renderApp('/talent/report/p')
    expect(screen.getByText(format(c.report.prefLed, { pref: c.singles.counter.name, ability: c.singles.control.name }))).toBeInTheDocument()
    expect(screen.queryByText(format(c.report.prefAligned, { style: c.singles.counter.name }))).toBeNull()
  })
  it('un informe antiguo sin preferencias lo dice', () => {
    seed()
    renderApp('/talent/report/r1')
    expect(screen.getByText(c.report.prefNone)).toBeInTheDocument()
  })
})

describe('rasgos en el espejo de estilo (spec §17.5)', () => {
  const TRICK = { scoring: 'net', midcourt: 'drop', tempo: 'adapt', underAttack: 'block', rally: 'either', doublesSpot: 'front', signature: 'deception', feints: 'often', footwork: 'anticipate', decider: 'steady', receive: 'netReply', behind: 'change' } as const
  const seedRecord = (input: object, engineVersion = 3) =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...emptyState(), talent: [{ id: 't', createdAt: '2026-10-04T10:00:00.000Z', engineVersion, input }] }))

  it('muestra los rasgos en común o el sello del jugador', () => {
    seedRecord({ ...GOLDEN, prefs: TRICK })
    renderApp('/talent/report/t')
    const m = analyzeTalent({ ...GOLDEN, prefs: TRICK }).mirrors.style[0]
    const line = screen.getByTestId('mirror-traits').textContent!
    if (m.shared.length > 0) {
      expect(line).toContain(c.report.sharedTraits)
      for (const t of m.shared) expect(line).toContain(c.traits[t])
    } else {
      expect(line).toContain(c.report.signatureTraits[m.athlete.sex])
    }
    expect(document.body.textContent).not.toMatch(/NaN|undefined/)
  })
  it('registro v2 (6 gustos) y v1 (sin gustos) se abren sin errores', () => {
    const v2prefs = { scoring: 'net', midcourt: 'drop', tempo: 'adapt', underAttack: 'block', rally: 'either', doublesSpot: 'back' }
    for (const [input, v] of [[{ ...GOLDEN, prefs: v2prefs }, 2], [GOLDEN, 1]] as const) {
      seedRecord(input, v)
      const { unmount } = renderApp('/talent/report/t')
      expect(screen.getByTestId('mirror-traits')).toBeInTheDocument()
      expect(document.body.textContent).not.toMatch(/NaN|undefined/)
      unmount()
    }
  })
  it('sin gustos (v1) muestra el sello del jugador, nunca rasgos en común', () => {
    seedRecord(GOLDEN, 1)
    renderApp('/talent/report/t')
    const m = analyzeTalent(GOLDEN).mirrors.style[0]
    const line = screen.getByTestId('mirror-traits').textContent!
    expect(line).toContain(c.report.signatureTraits[m.athlete.sex])
    expect(line).toContain(c.traits[m.athlete.traits[0]])
  })
  it('en español los rasgos salen en español', async () => {
    seedRecord({ ...GOLDEN, prefs: TRICK })
    renderApp('/talent/report/t')
    await userEvent.click(screen.getByRole('button', { name: '切换到西班牙语' }))
    const line = screen.getByTestId('mirror-traits').textContent!
    expect(line).not.toMatch(/[一-鿿]/)
    expect(line.includes(talentEs.report.sharedTraits) || line.includes(talentEs.report.signatureTraits.F)).toBe(true)
  })
})
