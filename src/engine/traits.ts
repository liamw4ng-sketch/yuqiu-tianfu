import { PREF_KEYS, type PrefKey, type Prefs } from './prefs'

/** Vocabulario fijo de rasgos (spec §17.3). El orden decide los empates. */
export const TRAIT_KEYS = ['power', 'deception', 'net', 'defense', 'stamina', 'speed', 'placement', 'fight'] as const
export type Trait = (typeof TRAIT_KEYS)[number]
export type TraitVector = Record<Trait, number>

// Puntos de rasgo de cada respuesta (spec §17.3). doublesSpot no dice nada del individual.
export const TRAIT_POINTS: { [K in PrefKey]: Record<string, Partial<TraitVector>> } = {
  scoring: { smash: { power: 2 }, net: { net: 2 }, rally: { stamina: 1, placement: 1 }, counter: { defense: 2 } },
  midcourt: { smash: { power: 1 }, drop: { placement: 1 }, push: { placement: 1 } },
  tempo: { fast: { speed: 1 }, grind: { stamina: 1 }, adapt: {} },
  underAttack: { drive: { speed: 1 }, block: { defense: 1 }, lift: { defense: 1 } },
  rally: { short: { power: 1 }, long: { stamina: 1 }, either: {} },
  doublesSpot: { front: {}, back: {}, rotate: {}, none: {} },
  signature: { smash: { power: 2 }, deception: { deception: 2 }, netShot: { net: 2 }, retrieve: { defense: 2 }, placement: { placement: 2 } },
  feints: { often: { deception: 2 }, sometimes: { deception: 1 }, rarely: {} },
  footwork: { explosive: { speed: 2 }, reach: { defense: 1, stamina: 1 }, anticipate: { placement: 1 } },
  decider: { steady: { stamina: 2 }, fight: { fight: 2 }, finish: { power: 1 } },
  receive: { rush: { speed: 1, net: 1 }, netReply: { net: 1 }, deep: { placement: 1 } },
  behind: { change: { deception: 1, placement: 1 }, persist: { stamina: 1 }, attack: { power: 1, fight: 1 } },
}

const ATHLETE_WEIGHTS = [1, 0.7, 0.5]

const zero = (): TraitVector => Object.fromEntries(TRAIT_KEYS.map((t) => [t, 0])) as TraitVector

export function isTrait(x: unknown): x is Trait {
  return (TRAIT_KEYS as readonly unknown[]).includes(x)
}

/** Puntos de rasgo del usuario. Las preguntas sin responder (registros antiguos) no suman. */
export function userTraits(prefs: Prefs | undefined): TraitVector {
  const v = zero()
  if (!prefs) return v
  for (const k of PREF_KEYS) {
    const answer = prefs[k]
    if (answer === undefined) continue
    for (const [t, p] of Object.entries(TRAIT_POINTS[k][answer] ?? {})) v[t as Trait] += p
  }
  return v
}

/** Los n rasgos con más puntos (> 0); los empates siguen el orden de TRAIT_KEYS. */
export function topTraits(v: TraitVector, n = 3): Trait[] {
  return TRAIT_KEYS.filter((t) => v[t] > 0)
    .sort((a, b) => v[b] - v[a] || TRAIT_KEYS.indexOf(a) - TRAIT_KEYS.indexOf(b))
    .slice(0, n)
}

/** El primer rasgo es el sello del jugador: pesa 1; el segundo 0,7; el tercero 0,5. */
export function athleteTraitVector(traits: readonly Trait[]): TraitVector {
  const v = zero()
  traits.forEach((t, i) => (v[t] = ATHLETE_WEIGHTS[i] ?? 0))
  return v
}

/** Similitud coseno (0–1). 0 si alguno de los dos vectores está a cero. */
export function traitSimilarity(u: TraitVector, a: TraitVector): number {
  let dot = 0
  let nu = 0
  let na = 0
  for (const t of TRAIT_KEYS) {
    dot += u[t] * a[t]
    nu += u[t] * u[t]
    na += a[t] * a[t]
  }
  return nu === 0 || na === 0 ? 0 : dot / Math.sqrt(nu * na)
}
