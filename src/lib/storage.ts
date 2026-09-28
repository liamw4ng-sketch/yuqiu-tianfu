import { ABILITY_KEYS, FIELD_TEST_KEYS, type TalentInput } from '../engine/types'
import type { Lang } from '../i18n/types'

export const STORAGE_KEY = 'yuqiu.v1'
export const MAX_RECORDS = 20

export interface TalentRecord {
  id: string
  createdAt: string
  engineVersion: number
  input: TalentInput
}
export interface RatingRecord {
  id: string
  createdAt: string
  answers: Record<string, string>
}
export interface MbtiRecord {
  id: string
  createdAt: string
  answers: Record<string, 'a' | 'b'>
}
export interface StoredState {
  version: 1
  lang: Lang
  talent: TalentRecord[]
  rating: RatingRecord[]
  mbti: MbtiRecord[]
}
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const emptyState = (): StoredState => ({ version: 1, lang: 'zh', talent: [], rating: [], mbti: [] })

export function browserStore(): KeyValueStore | null {
  try {
    const s = window.localStorage
    const probe = '__yuqiu_probe__'
    s.setItem(probe, '1')
    s.removeItem(probe)
    return s
  } catch {
    return null
  }
}

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null
const hasMeta = (r: Record<string, unknown>) =>
  typeof r.id === 'string' && typeof r.createdAt === 'string' && !Number.isNaN(Date.parse(r.createdAt))

export function isTalentInput(x: unknown): x is TalentInput {
  if (!isObj(x)) return false
  const levels = x.levels
  const tests = x.tests
  return (
    (x.sex === 'M' || x.sex === 'F') &&
    isNum(x.age) && isNum(x.heightCm) && isNum(x.weightKg) && isNum(x.yearsPlaying) &&
    (x.wingspanCm === null || isNum(x.wingspanCm)) &&
    (x.hand === 'R' || x.hand === 'L') &&
    ['lt1', '1', '2-3', '4+'].includes(x.freq as string) &&
    ['singles', 'doubles', 'mixed', 'all'].includes(x.preference as string) &&
    isObj(levels) && ABILITY_KEYS.every((k) => [1, 2, 3, 4, 5].includes(levels[k] as number)) &&
    isObj(tests) && FIELD_TEST_KEYS.every((k) => tests[k] === null || isNum(tests[k]))
  )
}

const isAnswers = (x: unknown): x is Record<string, string> =>
  isObj(x) && Object.values(x).every((v) => typeof v === 'string')

export function loadState(store: KeyValueStore | null): StoredState {
  if (!store) return emptyState()
  try {
    const raw = store.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const data: unknown = JSON.parse(raw)
    if (!isObj(data) || data.version !== 1) return emptyState()
    const list = (x: unknown) => (Array.isArray(x) ? x.filter(isObj) : [])
    return {
      version: 1,
      lang: data.lang === 'es' ? 'es' : 'zh',
      talent: list(data.talent).filter((r) => hasMeta(r) && isNum(r.engineVersion) && isTalentInput(r.input)) as unknown as TalentRecord[],
      rating: list(data.rating).filter((r) => hasMeta(r) && isAnswers(r.answers)) as unknown as RatingRecord[],
      mbti: list(data.mbti).filter(
        (r) => hasMeta(r) && isAnswers(r.answers) && Object.values(r.answers).every((v) => v === 'a' || v === 'b'),
      ) as unknown as MbtiRecord[],
    }
  } catch {
    return emptyState()
  }
}

export function saveState(store: KeyValueStore | null, state: StoredState): boolean {
  if (!store) return false
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function appendRecord<T>(list: T[], rec: T): T[] {
  return [...list, rec].slice(-MAX_RECORDS)
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
