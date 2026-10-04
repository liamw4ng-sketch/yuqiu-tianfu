import { isTrait, type Trait } from '../engine/traits'
import { SINGLES_STYLES, type Hand, type Sex, type SinglesStyle } from '../engine/types'
import doublesRaw from './athletes-doubles.json'
import singlesRaw from './athletes-singles.json'

export interface Localized {
  zh: string
  es: string
}

/** Enlaces del jugador sacados de las fuentes de la investigación */
export interface AthleteLinks {
  bwf?: string
  wikiEn?: string
  wikiZh?: string
}

export interface Athlete {
  id: string
  nameEn: string
  nameZh: string
  sex: Sex
  country: Localized
  heightCm: number
  weightKg: number | null
  hand: Hand | null
  birthYear: number | null
  status: 'active' | 'retired'
  retiredYear: number | null
  style: SinglesStyle
  /** 2–3 rasgos verificados; el primero es su sello (spec §17.3) */
  traits: Trait[]
  highlights: Localized
  desc: Localized
  links?: AthleteLinks
}

export type Position = 'front' | 'back' | 'both'
export type PairEvent = 'MD' | 'WD' | 'XD'

export interface DoublesPlayer {
  nameEn: string
  nameZh: string
  sex: Sex
  heightCm: number
  weightKg: number | null
  hand: Hand | null
  position: Position
  role: Localized
}

export interface DoublesPair {
  id: string
  event: PairEvent
  pairZh: string
  pairEn: string
  country: Localized
  status: 'active' | 'retired' | 'split'
  highlights: Localized
  style: Localized
  players: [DoublesPlayer, DoublesPlayer]
}

// "TRADUCIR" es el marcador que deja scripts/import-athletes.mjs: cuenta como vacío.
const filled = (l: Localized | undefined) => !!l && l.zh.trim().length > 0 && l.es.trim().length > 0 && l.es !== 'TRADUCIR'
const HAN = /[一-鿿]/
// "其他" contiene 他 pero no es un pronombre.
const HE = /(?<!其)他/
const SHE = /她/

function pronounErrors(sex: Sex, zh: string, where: string): string[] {
  if (sex === 'F' && HE.test(zh)) return [`${where}: usa 他 para una jugadora`]
  if (sex === 'M' && SHE.test(zh)) return [`${where}: usa 她 para un jugador`]
  return []
}

function bodyErrors(heightCm: number, weightKg: number | null, where: string): string[] {
  const e: string[] = []
  if (!(heightCm >= 145 && heightCm <= 215)) e.push(`${where}: altura fuera de rango`)
  if (weightKg !== null && !(weightKg >= 40 && weightKg <= 110)) e.push(`${where}: peso fuera de rango`)
  return e
}

export function athleteErrors(a: Athlete): string[] {
  const e: string[] = []
  if (!a.id || !a.nameEn || !a.nameZh) e.push(`${a.id}: faltan id o nombres`)
  if (a.sex !== 'M' && a.sex !== 'F') e.push(`${a.id}: sexo inválido`)
  if (!(SINGLES_STYLES as readonly string[]).includes(a.style)) e.push(`${a.id}: estilo inválido`)
  if (!Array.isArray(a.traits) || a.traits.length < 2 || a.traits.length > 3 || new Set(a.traits).size !== a.traits.length || !a.traits.every(isTrait)) e.push(`${a.id}: rasgos inválidos`)
  // Retirado con año desconocido es válido (p. ej. Tian Houwei): la app muestra 已退役 sin paréntesis vacíos.
  if (a.status === 'retired' && a.retiredYear !== null && !(a.retiredYear >= 1980 && a.retiredYear <= 2026)) e.push(`${a.id}: año de retirada imposible`)
  if (a.status === 'active' && a.retiredYear !== null) e.push(`${a.id}: activo con año de retirada`)
  for (const [k, v] of Object.entries({ country: a.country, highlights: a.highlights, desc: a.desc })) {
    if (!filled(v)) e.push(`${a.id}: ${k} incompleto`)
  }
  if (a.desc && HAN.test(a.desc.es)) e.push(`${a.id}: desc.es contiene caracteres chinos`)
  e.push(...bodyErrors(a.heightCm, a.weightKg, a.id))
  if (a.desc) e.push(...pronounErrors(a.sex, a.desc.zh, a.id))
  return e
}

export function pairErrors(p: DoublesPair): string[] {
  const e: string[] = []
  if (!['MD', 'WD', 'XD'].includes(p.event)) e.push(`${p.id}: prueba inválida`)
  if (!['active', 'retired', 'split'].includes(p.status)) e.push(`${p.id}: estado inválido`)
  if (p.players.length !== 2) e.push(`${p.id}: no tiene 2 jugadores`)
  const sexes = p.players.map((x) => x.sex).sort().join('')
  const expected = { MD: 'MM', WD: 'FF', XD: 'FM' }[p.event]
  if (sexes !== expected) e.push(`${p.id}: sexos ${sexes} no cuadran con ${p.event}`)
  for (const [k, v] of Object.entries({ country: p.country, highlights: p.highlights, style: p.style })) {
    if (!filled(v)) e.push(`${p.id}: ${k} incompleto`)
  }
  if (HAN.test(p.style.es)) e.push(`${p.id}: style.es contiene caracteres chinos`)
  p.players.forEach((x, i) => {
    const where = `${p.id}#${i}`
    if (!['front', 'back', 'both'].includes(x.position)) e.push(`${where}: posición inválida`)
    if (!filled(x.role)) e.push(`${where}: role incompleto`)
    if (HAN.test(x.role.es)) e.push(`${where}: role.es contiene caracteres chinos`)
    e.push(...bodyErrors(x.heightCm, x.weightKg, where))
    e.push(...pronounErrors(x.sex, x.role.zh, where))
  })
  return e
}

export const SINGLES = singlesRaw as unknown as Athlete[]
export const PAIRS = doublesRaw as unknown as DoublesPair[]
