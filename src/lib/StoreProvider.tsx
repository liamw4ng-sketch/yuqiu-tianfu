import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { ENGINE_VERSION } from '../engine/constants'
import type { TalentInput } from '../engine/types'
import type { Lang } from '../i18n/types'
import {
  appendRecord,
  browserStore,
  emptyState,
  loadState,
  newId,
  saveState,
  type KeyValueStore,
  type MbtiRecord,
  type RatingRecord,
  type StoredState,
  type TalentRecord,
} from './storage'

interface StoreValue {
  state: StoredState
  persistent: boolean
  setLang: (lang: Lang) => void
  addTalent: (input: TalentInput) => TalentRecord
  addRating: (answers: Record<string, string>) => RatingRecord
  addMbti: (answers: Record<string, 'a' | 'b'>) => MbtiRecord
  clearAll: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children, store }: { children: ReactNode; store?: KeyValueStore | null }) {
  const [kv] = useState<KeyValueStore | null>(() => (store === undefined ? browserStore() : store))
  const [state, setState] = useState<StoredState>(() => loadState(kv))
  const [persistent, setPersistent] = useState<boolean>(kv !== null)
  // Copia síncrona del estado: así dos acciones seguidas en el mismo evento no se pisan
  // y el guardado queda fuera del updater de React.
  const stateRef = useRef(state)

  const update = useCallback(
    (f: (prev: StoredState) => StoredState) => {
      const next = f(stateRef.current)
      stateRef.current = next
      setState(next)
      setPersistent(saveState(kv, next))
    },
    [kv],
  )

  const value = useMemo<StoreValue>(() => {
    const stamp = () => ({ id: newId(), createdAt: new Date().toISOString() })
    return {
      state,
      persistent,
      setLang: (lang) => update((s) => ({ ...s, lang })),
      addTalent: (input) => {
        const rec: TalentRecord = { ...stamp(), engineVersion: ENGINE_VERSION, input }
        update((s) => ({ ...s, talent: appendRecord(s.talent, rec) }))
        return rec
      },
      addRating: (answers) => {
        const rec: RatingRecord = { ...stamp(), answers }
        update((s) => ({ ...s, rating: appendRecord(s.rating, rec) }))
        return rec
      },
      addMbti: (answers) => {
        const rec: MbtiRecord = { ...stamp(), answers }
        update((s) => ({ ...s, mbti: appendRecord(s.mbti, rec) }))
        return rec
      },
      clearAll: () => update((s) => ({ ...emptyState(), lang: s.lang })),
    }
  }, [state, persistent, update])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useStore must be used inside StoreProvider')
  return value
}
