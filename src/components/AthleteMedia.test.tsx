import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n/I18nProvider'
import { AthleteMedia, mediaLinks } from './AthleteMedia'

afterEach(() => vi.restoreAllMocks())

const lohLinks = { bwf: 'https://bwfbadminton.com/player/57442/loh-kean-yew', wikiEn: 'https://en.wikipedia.org/wiki/Loh_Kean_Yew' }

describe('enlaces de foto y vídeo', () => {
  it('genera búsquedas de vídeo que nunca se rompen y enlaces de ficha', () => {
    const l = mediaLinks({ nameEn: 'Loh Kean Yew', nameZh: '骆建佑', links: lohLinks }, 'zh')
    expect(l.youtube).toBe('https://www.youtube.com/results?search_query=Loh%20Kean%20Yew%20badminton%20highlights')
    expect(l.bilibili).toBe('https://search.bilibili.com/all?keyword=%E9%AA%86%E5%BB%BA%E4%BD%91%20%E7%BE%BD%E6%AF%9B%E7%90%83')
    expect(l.profile).toBe(lohLinks.bwf)
    expect(l.wiki).toBe(lohLinks.wikiEn)
    expect(mediaLinks({ nameEn: 'X', nameZh: 'Y' }, 'es').bilibili).toBeNull()
  })
  it('muestra la foto de Wikipedia con su crédito', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ thumbnail: { source: 'https://upload.wikimedia.org/x.jpg' } }), { status: 200 }),
    )
    render(
      <I18nProvider lang="es">
        <AthleteMedia athlete={{ nameEn: 'Loh Kean Yew', nameZh: '骆建佑', links: lohLinks }} lang="es" />
      </I18nProvider>,
    )
    const img = await screen.findByRole('img', { name: 'Loh Kean Yew' })
    expect(img).toHaveAttribute('src', 'https://upload.wikimedia.org/x.jpg')
    expect(globalThis.fetch).toHaveBeenCalledWith('https://en.wikipedia.org/api/rest_v1/page/summary/Loh_Kean_Yew')
    expect(screen.getByText('Foto: Wikipedia')).toBeInTheDocument()
  })
  it('sin Wikipedia o si falla la red: sin foto y sin romperse', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    render(
      <I18nProvider lang="zh">
        <AthleteMedia athlete={{ nameEn: 'Loh Kean Yew', nameZh: '骆建佑', links: lohLinks }} lang="zh" />
      </I18nProvider>,
    )
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled())
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByRole('link', { name: /YouTube/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Bilibili|B站/ })).toBeInTheDocument()
  })
})
