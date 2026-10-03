import { useEffect, useState } from 'react'
import type { AthleteLinks } from '../data/athletes'
import { useI18n } from '../i18n/I18nProvider'
import type { Lang } from '../i18n/types'

interface MediaAthlete {
  nameEn: string
  nameZh: string
  links?: AthleteLinks
}

/**
 * Enlaces de foto y vídeo. Los vídeos son búsquedas (YouTube, y Bilibili en chino) para que nunca se rompan;
 * la ficha es la de la BWF o, si no hay, Wikipedia.
 */
export function mediaLinks(a: MediaAthlete, lang: Lang) {
  const wiki = lang === 'zh' ? (a.links?.wikiZh ?? a.links?.wikiEn) : (a.links?.wikiEn ?? a.links?.wikiZh)
  return {
    youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${a.nameEn} badminton highlights`)}`,
    bilibili: lang === 'zh' ? `https://search.bilibili.com/all?keyword=${encodeURIComponent(`${a.nameZh} 羽毛球`)}` : null,
    profile: a.links?.bwf ?? null,
    wiki: wiki ?? null,
  }
}

/** URL de la API REST de Wikipedia que devuelve la miniatura (licencia libre de Wikimedia Commons). */
function summaryUrl(wikiUrl: string): string | null {
  const m = wikiUrl.match(/^https:\/\/(en|zh)\.wikipedia\.org\/wiki\/(.+)$/)
  return m ? `https://${m[1]}.wikipedia.org/api/rest_v1/page/summary/${m[2]}` : null
}

export function AthleteMedia({ athlete, lang }: { athlete: MediaAthlete; lang: Lang }) {
  const { t } = useI18n()
  const links = mediaLinks(athlete, lang)
  const [photo, setPhoto] = useState<string | null>(null)

  useEffect(() => {
    setPhoto(null)
    const url = links.wiki ? summaryUrl(links.wiki) : null
    if (!url) return
    let alive = true
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { thumbnail?: { source?: string } } | null) => {
        if (alive && data?.thumbnail?.source) setPhoto(data.thumbnail.source)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [links.wiki])

  return (
    <div className="athlete-media">
      {photo && (
        <figure className="athlete-photo">
          <img src={photo} alt={athlete.nameEn} loading="lazy" referrerPolicy="no-referrer" onError={() => setPhoto(null)} />
          <figcaption>
            <a href={links.wiki!} target="_blank" rel="noreferrer">
              {t('media.photoCredit')}
            </a>
          </figcaption>
        </figure>
      )}
      <div className="media-links">
        {links.profile && (
          <a className="btn btn-ghost small-btn" href={links.profile} target="_blank" rel="noreferrer">
            {t('media.profile')}
          </a>
        )}
        {links.wiki && (
          <a className="btn btn-ghost small-btn" href={links.wiki} target="_blank" rel="noreferrer">
            {t('media.wiki')}
          </a>
        )}
        <a className="btn btn-ghost small-btn" href={links.youtube} target="_blank" rel="noreferrer">
          {t('media.youtube')}
        </a>
        {links.bilibili && (
          <a className="btn btn-ghost small-btn" href={links.bilibili} target="_blank" rel="noreferrer">
            {t('media.bilibili')}
          </a>
        )}
      </div>
    </div>
  )
}
