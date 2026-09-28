import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { GOLDEN } from '../engine/testkit'
import { emptyState, STORAGE_KEY } from '../lib/storage'
import { renderApp } from '../test/renderApp'

vi.mock('../lib/share', () => ({
  renderPng: vi.fn().mockRejectedValue(new Error('canvas')),
  shareOrDownload: vi.fn(),
}))

it('muestra un error comprensible si no se puede generar la imagen', async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...emptyState(), talent: [{ id: 'r1', createdAt: '2026-09-26T10:00:00.000Z', engineVersion: 1, input: GOLDEN }] }))
  renderApp('/talent/report/r1')
  await userEvent.click(screen.getByRole('button', { name: /生成分享图/ }))
  expect(await screen.findByText('生成图片失败，请重试或直接截图。')).toBeInTheDocument()
})
