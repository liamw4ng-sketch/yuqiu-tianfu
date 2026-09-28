import { toBlob } from 'html-to-image'

export async function renderPng(node: HTMLElement): Promise<Blob> {
  const blob = await toBlob(node, { pixelRatio: 1, width: 1080, height: 1440, cacheBust: true, skipFonts: true })
  if (!blob) throw new Error('empty image')
  return blob
}

export async function shareOrDownload(blob: Blob, filename: string, title: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([blob], filename, { type: 'image/png' })
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] }) && typeof navigator.share === 'function') {
    try {
      await navigator.share({ files: [file], title })
      return 'shared'
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return 'cancelled'
      throw e
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'downloaded'
}
