import { afterEach, describe, expect, it, vi } from 'vitest'
import { shareOrDownload } from './share'

afterEach(() => vi.restoreAllMocks())

describe('shareOrDownload', () => {
  const blob = new Blob(['x'], { type: 'image/png' })
  it('usa Web Share con archivo si está disponible', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { canShare: () => true, share })
    expect(await shareOrDownload(blob, 'a.png', 't')).toBe('shared')
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: 't' }))
  })
  it('si el usuario cancela, no es un error', async () => {
    Object.assign(navigator, { canShare: () => true, share: vi.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' })) })
    expect(await shareOrDownload(blob, 'a.png', 't')).toBe('cancelled')
  })
  it('si no hay Web Share, descarga', async () => {
    Object.assign(navigator, { canShare: undefined, share: undefined })
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    expect(await shareOrDownload(blob, 'a.png', 't')).toBe('downloaded')
    expect(click).toHaveBeenCalled()
  })
})
