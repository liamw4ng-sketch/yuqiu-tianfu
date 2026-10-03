import { SINGLES_STYLES, type SinglesStyle } from './types'

/** Preguntas de 球风偏好 (gustos de juego) y sus opciones. El texto vive en content/{zh,es}/talent.ts. */
export const PREF_OPTIONS = {
  scoring: ['smash', 'net', 'rally', 'counter'],
  midcourt: ['smash', 'drop', 'push'],
  tempo: ['fast', 'grind', 'adapt'],
  underAttack: ['drive', 'block', 'lift'],
  rally: ['short', 'long', 'either'],
  doublesSpot: ['front', 'back', 'rotate', 'none'],
  // v3 (spec §17.2)
  signature: ['smash', 'deception', 'netShot', 'retrieve', 'placement'],
  feints: ['often', 'sometimes', 'rarely'],
  footwork: ['explosive', 'reach', 'anticipate'],
  decider: ['steady', 'fight', 'finish'],
  receive: ['rush', 'netReply', 'deep'],
  behind: ['change', 'persist', 'attack'],
} as const
export type PrefKey = keyof typeof PREF_OPTIONS
/** Las 6 de la v2: obligatorias también en registros guardados. */
export const CORE_PREF_KEYS = ['scoring', 'midcourt', 'tempo', 'underAttack', 'rally', 'doublesSpot'] as const
type CorePrefKey = (typeof CORE_PREF_KEYS)[number]
type Answer<K extends PrefKey> = (typeof PREF_OPTIONS)[K][number]
/** Las 6 nuevas faltan en los registros de la v2: cuentan como sin responder. */
export type Prefs = { [K in CorePrefKey]: Answer<K> } & { [K in Exclude<PrefKey, CorePrefKey>]?: Answer<K> }
export const PREF_KEYS = Object.keys(PREF_OPTIONS) as PrefKey[]

// Puntos que cada respuesta da a cada estilo de individual.
export const SINGLES_POINTS: { [K in PrefKey]: Record<string, Partial<Record<SinglesStyle, number>>> } = {
  // La forma favorita de ganar el punto es la señal más directa del estilo: vale 3.
  scoring: { smash: { attack: 3 }, net: { net: 3 }, rally: { control: 3 }, counter: { counter: 3 } },
  midcourt: { smash: { attack: 1, speed: 1 }, drop: { net: 1, control: 1 }, push: { control: 1, counter: 1 } },
  tempo: { fast: { speed: 2, attack: 1 }, grind: { control: 2, counter: 1 }, adapt: { allround: 2 } },
  underAttack: { drive: { counter: 2, speed: 1 }, block: { net: 1, counter: 1 }, lift: { control: 1, allround: 1 } },
  rally: { short: { attack: 1, speed: 1 }, long: { control: 1, counter: 1 }, either: { allround: 2 } },
  doublesSpot: { front: {}, back: {}, rotate: {}, none: {} },
  signature: { smash: { attack: 2 }, deception: { allround: 1, net: 1 }, netShot: { net: 2 }, retrieve: { counter: 2 }, placement: { control: 2 } },
  feints: { often: { allround: 1, net: 1 }, sometimes: {}, rarely: {} },
  footwork: { explosive: { speed: 2 }, reach: { counter: 1, allround: 1 }, anticipate: { control: 1, allround: 1 } },
  decider: { steady: { control: 1, counter: 1 }, fight: { counter: 1 }, finish: { attack: 1 } },
  receive: { rush: { speed: 1, net: 1 }, netReply: { net: 1 }, deep: { control: 1 } },
  behind: { change: { allround: 2 }, persist: { control: 1, counter: 1 }, attack: { attack: 1 } },
}

const neutral = (): Record<SinglesStyle, number> =>
  Object.fromEntries(SINGLES_STYLES.map((s) => [s, 0.5])) as Record<SinglesStyle, number>

/** Afinidad 0–1 con cada estilo según los gustos: el más elegido vale 1. Sin respuestas, 0.5 para todos. */
export function singlesPreference(prefs: Prefs | undefined): Record<SinglesStyle, number> {
  if (!prefs) return neutral()
  const pts = Object.fromEntries(SINGLES_STYLES.map((s) => [s, 0])) as Record<SinglesStyle, number>
  for (const k of PREF_KEYS) {
    const answer = prefs[k]
    if (answer === undefined) continue
    const add = SINGLES_POINTS[k][answer] ?? {}
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
  const valid = (k: PrefKey) => (PREF_OPTIONS[k] as readonly unknown[]).includes(o[k])
  return CORE_PREF_KEYS.every(valid) && PREF_KEYS.every((k) => o[k] === undefined || valid(k))
}
