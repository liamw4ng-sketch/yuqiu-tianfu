import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { talentEs } from '../content/es/talent'
import { talentZh } from '../content/zh/talent'
import { analyzeBody } from '../engine/body'
import { GOLDEN, makeInput } from '../engine/testkit'
import { bodyTypeName } from '../content'
import { emptyState, STORAGE_KEY } from '../lib/storage'
import { StoreProvider, useStore } from '../lib/StoreProvider'
import { renderApp } from '../test/renderApp'
import { CompareBars } from './CompareBars'
import { RadarChart } from './RadarChart'

describe('detalles menores de interfaz', () => {
  it('la imagen de un informe antiguo usa ese informe, no el último', () => {
    const tall = makeInput('M', 25, 190, 85, null, 4, [5, 3, 2, 2, 3, 5, 2, 3])
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...emptyState(), talent: [
        { id: 'old', createdAt: '2026-06-01T10:00:00.000Z', engineVersion: 1, input: tall },
        { id: 'new', createdAt: '2026-09-26T10:00:00.000Z', engineVersion: 1, input: GOLDEN },
      ] }),
    )
    const { container } = renderApp('/talent/report/old')
    expect(container.querySelector('.share-card')!.textContent).toContain(bodyTypeName(talentZh, analyzeBody(tall)))
  })
  it('los errores del formulario cambian de idioma con el botón 中/ES', async () => {
    renderApp('/talent')
    await userEvent.click(screen.getByRole('button', { name: talentZh.form.submit }))
    await userEvent.click(screen.getByRole('button', { name: '切换到西班牙语' }))
    expect(screen.getAllByText(talentEs.form.errors.required).length).toBeGreaterThan(0)
    expect(screen.queryByText(talentZh.form.errors.required)).toBeNull()
  })
  it('otra pestaña que guarda datos actualiza esta (evento storage)', () => {
    const ref: { current: ReturnType<typeof useStore> | null } = { current: null }
    function Probe() {
      ref.current = useStore()
      return null
    }
    render(
      <StoreProvider>
        <Probe />
      </StoreProvider>,
    )
    const saved = JSON.stringify({ ...emptyState(), talent: [{ id: 'x', createdAt: '2026-09-26T10:00:00.000Z', engineVersion: 1, input: GOLDEN }] })
    localStorage.setItem(STORAGE_KEY, saved)
    act(() => {
      fireEvent(window, new StorageEvent('storage', { key: STORAGE_KEY, newValue: saved }))
    })
    expect(ref.current!.state.talent.map((r) => r.id)).toEqual(['x'])
  })
  it('la descripción accesible del radar no usa la coma china', () => {
    render(<RadarChart axes={['a', 'b', 'c'].map((label) => ({ label, value: 5 }))} />)
    expect(screen.getByRole('img').getAttribute('aria-label')).not.toContain('，')
  })
  it('las barras muestran decimales cuando el dato los tiene', () => {
    render(<CompareBars youLabel="Tú" themLabel="Espejo" rows={[{ label: 'Peso', you: 51.5, them: 55, unit: 'kg' }]} />)
    expect(screen.getByText('51.5')).toBeInTheDocument()
    expect(screen.getByText('55')).toBeInTheDocument()
  })
  it('la navegación tiene etiqueta corta para la barra inferior del móvil', () => {
    renderApp('/')
    const link = screen.getByRole('link', { name: '天赋测评' })
    expect(link.querySelector('.tab-short')).not.toBeNull()
  })
})
