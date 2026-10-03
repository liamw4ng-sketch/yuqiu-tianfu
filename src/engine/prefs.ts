import { SINGLES_STYLES, type SinglesStyle } from './types'

/** Preguntas de 球风偏好 (gustos de juego) y sus opciones. El texto vive en content/{zh,es}/talent.ts. */
export const PREF_OPTIONS = {
  scoring: ['smash', 'net', 'rally', 'counter'],
  midcourt: ['smash', 'drop', 'push'],
  tempo: ['fast', 'grind', 'adapt'],
  underAttack: ['drive', 'block', 'lift'],
  rally: ['short', 'long', 'either'],
  doublesSpot: ['front', 'back', 'rotate', 'none'],
} as const
export type PrefKey = keyof typeof PREF_OPTIONS
export type Prefs = { [K in PrefKey]: (typeof PREF_OPTIONS)[K][number] }
export const PREF_KEYS = Object.keys(PREF_OPTIONS) as PrefKey[]

// Puntos que cada respuesta da a cada estilo de individual.
const SINGLES_POINTS: { [K in PrefKey]: Record<string, Partial<Record<SinglesStyle, number>>> } = {
  // La forma favorita de ganar el punto es la señal más directa del estilo: vale 3.
  scoring: { smash: { attack: 3 }, net: { net: 3 }, rally: { control: 3 }, counter: { counter: 3 } },
  midcourt: { smash: { attack: 1, speed: 1 }, drop: { net: 1, control: 1 }, push: { control: 1, counter: 1 } },
  tempo: { fast: { speed: 2, attack: 1 }, grind: { control: 2, counter: 1 }, adapt: { allround: 2 } },
  underAttack: { drive: { counter: 2, speed: 1 }, block: { net: 1, counter: 1 }, lift: { control: 1, allround: 1 } },
  rally: { short: { attack: 1, speed: 1 }, long: { control: 1, counter: 1 }, either: { allround: 2 } },
  doublesSpot: { front: {}, back: {}, rotate: {}, none: {} },
}

const neutral = (): Record<SinglesStyle, number> =>
  Object.fromEntries(SINGLES_STYLES.map((s) => [s, 0.5])) as Record<SinglesStyle, number>

/** Afinidad 0–1 con cada estilo según los gustos: el más elegido vale 1. Sin respuestas, 0.5 para todos. */
export function singlesPreference(prefs: Prefs | undefined): Record<SinglesStyle, number> {
  if (!prefs) return neutral()
  const pts = Object.fromEntries(SINGLES_STYLES.map((s) => [s, 0])) as Record<SinglesStyle, number>
  for (const k of PREF_KEYS) {
    const add = SINGLES_POINTS[k][prefs[k]] ?? {}
    for (const [s, p] of Object.entries(add)) pts[s as SinglesStyle] += p
  }
  const max = Math.max(...SINGLES_STYLES.map((s) => pts[s]))
  if (max === 0) return neutral()
  return Object.fromEntries(SINGLES_STYLES.map((s) => [s, pts[s] / max])) as Record<SinglesStyle, number>
}

/** Estilo que más gusta (null sin respuestas). */
export function preferredStyle(prefs: Prefs | undefined): SinglesStyle | null {
  if (!prefs) return null
  const p = singlesPreference(prefs)
  return SINGLES_STYLES.find((s) => p[s] === 1) ?? null
}

/** Afinidad 0–1 con la red y con el fondo en dobles. */
export function doublesPreference(prefs: Prefs | undefined): { front: number; back: number } {
  switch (prefs?.doublesSpot) {
    case 'front':
      return { front: 1, back: 0 }
    case 'back':
      return { front: 0, back: 1 }
    case 'rotate':
      return { front: 0.6, back: 0.6 }
    default:
      return { front: 0.5, back: 0.5 }
  }
}

export function isPrefs(x: unknown): x is Prefs {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return PREF_KEYS.every((k) => (PREF_OPTIONS[k] as readonly unknown[]).includes(o[k]))
}
