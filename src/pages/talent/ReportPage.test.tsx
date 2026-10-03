import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { talentEs } from '../../content/es/talent'
import { talentZh as c } from '../../content/zh/talent'
import { GOLDEN, makeInput } from '../../engine/testkit'
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
