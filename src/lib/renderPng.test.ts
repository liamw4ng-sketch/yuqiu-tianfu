import { expect, it, vi } from 'vitest'

const toBlob = vi.fn().mockResolvedValue(new Blob(['x']))
vi.mock('html-to-image', () => ({ toBlob }))

it('renderPng no intenta incrustar Google Fonts (evita errores CORS y acelera la captura)', async () => {
  const { renderPng } = await import('./share')
  await renderPng(document.createElement('div'))
  expect(toBlob).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ skipFonts: true, width: 1080, height: 1440 }))
})
