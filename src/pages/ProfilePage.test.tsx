import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { talentZh } from '../content/zh/talent'
import { GOLDEN } from '../engine/testkit'
import { emptyState, STORAGE_KEY } from '../lib/storage'
import { renderApp } from '../test/renderApp'

const rec = (id: string, createdAt: string) => ({ id, createdAt, engineVersion: 1, input: GOLDEN })

describe('我的档案', () => {
  it('estado vacío', () => {
    renderApp('/profile')
    expect(screen.getByText('还没有测评记录，先做一个测评吧。')).toBeInTheDocument()
  })
  it('muestra estilo, rol, historial y la comparación primero/último', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...emptyState(), talent: [rec('r1', '2026-06-01T10:00:00.000Z'), rec('r2', '2026-09-26T10:00:00.000Z')] }),
    )
    renderApp('/profile')
    expect(screen.getAllByText(new RegExp(talentZh.singles.control.name)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(new RegExp(talentZh.doubles.back.name)).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /查看/ })).toHaveLength(2)
    expect(screen.getByText('能力变化（首次 vs 最近）')).toBeInTheDocument()
  })
  it('borrar datos pide confirmación', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...emptyState(), talent: [rec('r1', '2026-06-01T10:00:00.000Z')] }))
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderApp('/profile')
    await userEvent.click(screen.getByRole('button', { name: '清除我的全部数据' }))
    expect(confirm).toHaveBeenCalled()
    expect(screen.getByText('还没有测评记录，先做一个测评吧。')).toBeInTheDocument()
    confirm.mockRestore()
  })
})
