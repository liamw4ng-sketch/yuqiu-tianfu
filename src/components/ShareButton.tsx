import { useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { latestProfile } from '../lib/latest'
import { renderPng, shareOrDownload } from '../lib/share'
import { useStore } from '../lib/StoreProvider'
import { ShareCard } from './ShareCard'

/** Comparte como imagen el perfil más reciente. No se muestra si no hay 天赋测评. */
export function ShareButton() {
  const { t } = useI18n()
  const { state } = useStore()
  const profile = useMemo(() => latestProfile(state), [state])
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  if (!profile.talent) return null
  const run = async () => {
    setBusy(true)
    setError(false)
    try {
      const blob = await renderPng(ref.current!)
      await shareOrDownload(blob, 'yuqiu-tianfu.png', t('app.name'))
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <button type="button" className="btn" onClick={run} disabled={busy}>
        📤 {busy ? t('share.working') : t('share.button')}
      </button>
      {error && (
        <p className="field-error" role="alert">
          {t('share.error')}
        </p>
      )}
      <div className="share-offscreen" aria-hidden>
        <ShareCard ref={ref} profile={profile} />
      </div>
    </>
  )
}
