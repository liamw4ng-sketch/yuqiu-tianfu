import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { talentZh as c } from '../../content/zh/talent'
import { STORAGE_KEY } from '../../lib/storage'
import { renderApp } from '../../test/renderApp'

async function fillGolden(weight = '51') {
  const u = userEvent.setup()
  await u.selectOptions(screen.getByLabelText(c.form.fields.sex), 'F')
  await u.type(screen.getByLabelText(c.form.fields.age), '24')
  await u.type(screen.getByLabelText(c.form.fields.heightCm), '163')
  await u.type(screen.getByLabelText(c.form.fields.weightKg), weight)
  await u.type(screen.getByLabelText(c.form.fields.wingspanCm), '164')
  await u.type(screen.getByLabelText(c.form.fields.yearsPlaying), '2')
  const levels = { power: 2, endurance: 3, reaction: 1, netTouch: 2, speed: 2, rearCourt: 2, tactics: 1, mental: 3 } as const
  for (const [k, v] of Object.entries(levels)) {
    // Anclado al inicio: la etiqueta empieza por el nombre y así no choca con las aclaraciones de otras capacidades.
    await u.selectOptions(screen.getByLabelText(new RegExp('^' + c.abilities[k as keyof typeof levels].name)), String(v))
  }
  return u
}

describe('TalentForm', () => {
  it('muestra los errores obligatorios al enviar vacío', async () => {
    renderApp('/talent')
    await userEvent.click(screen.getByRole('button', { name: c.form.submit }))
    expect(screen.getAllByText(c.form.errors.required).length).toBeGreaterThanOrEqual(13)
  })
  it('guarda el perfil y abre el informe', async () => {
    renderApp('/talent')
    const u = await fillGolden('51,5')
    await u.click(screen.getByRole('button', { name: c.form.submit }))
    const id = screen.getByTestId('report-id').textContent!
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.talent[0].id).toBe(id)
    expect(saved.talent[0].input.weightKg).toBe(51.5)
  })
  it('pide confirmación con envergadura anómala', async () => {
    renderApp('/talent')
    const u = await fillGolden()
    await u.clear(screen.getByLabelText(c.form.fields.wingspanCm))
    await u.type(screen.getByLabelText(c.form.fields.wingspanCm), '195')
    await u.click(screen.getByRole('button', { name: c.form.submit }))
    expect(screen.getByText(c.form.warnings.wingspanDiff)).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: c.form.confirmWarnings }))
    expect(screen.getByTestId('report-id')).toBeInTheDocument()
  })
  it('avisa si llega desde un informe inexistente', () => {
    renderApp('/talent/report/nope')
    expect(screen.queryByTestId('report-id')).not.toBeNull()
  })
})
