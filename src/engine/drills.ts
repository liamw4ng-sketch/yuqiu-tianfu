import { SINGLES_WEIGHTS } from './singles'
import { ABILITY_KEYS, type AbilityKey, type Scores, type SinglesStyle } from './types'

export const DRILLS = [
  { id: 'shadowFootwork', targets: ['speed', 'endurance'] },
  { id: 'fourCornerMulti', targets: ['speed', 'endurance'] },
  { id: 'plyoJump', targets: ['power', 'speed'] },
  { id: 'smashMulti', targets: ['power', 'rearCourt'] },
  { id: 'clearToBaseline', targets: ['rearCourt'] },
  { id: 'netSpinning', targets: ['netTouch'] },
  { id: 'netKillRush', targets: ['netTouch', 'reaction'] },
  { id: 'defenseBlock', targets: ['reaction'] },
  { id: 'driveExchange', targets: ['reaction', 'speed'] },
  { id: 'intervalCourtSprints', targets: ['endurance'] },
  { id: 'rallyControl', targets: ['tactics', 'endurance'] },
  { id: 'threeShotPatterns', targets: ['tactics'] },
  { id: 'matchReview', targets: ['tactics', 'mental'] },
  { id: 'pressurePoints', targets: ['mental'] },
  { id: 'serveRoutine', targets: ['mental', 'netTouch'] },
] as const satisfies readonly { id: string; targets: readonly AbilityKey[] }[]

export type DrillId = (typeof DRILLS)[number]['id']

const idx = (k: AbilityKey) => ABILITY_KEYS.indexOf(k)

/** 3 ejercicios para las capacidades clave del estilo en las que el usuario está más flojo. */
export function pickDrills(style: SinglesStyle, current: Scores): DrillId[] {
  const focus =
    style === 'allround'
      ? [...ABILITY_KEYS]
      : [...ABILITY_KEYS]
          .filter((k) => SINGLES_WEIGHTS[style][k] > 0)
          .sort((a, b) => SINGLES_WEIGHTS[style][b] - SINGLES_WEIGHTS[style][a] || idx(a) - idx(b))
          .slice(0, 5)
  focus.sort((a, b) => current[a] - current[b] || idx(a) - idx(b))
  const fallback = [...ABILITY_KEYS].sort((a, b) => current[a] - current[b] || idx(a) - idx(b))
  const chosen: DrillId[] = []
  for (const k of [...focus, ...fallback]) {
    if (chosen.length === 3) break
    // Primero el ejercicio cuyo objetivo principal es esa capacidad (p. ej. clear antes que multivolante de remate).
    const drill =
      DRILLS.find((d) => d.targets[0] === k && !chosen.includes(d.id)) ??
      DRILLS.find((d) => (d.targets as readonly AbilityKey[]).includes(k) && !chosen.includes(d.id))
    if (drill) chosen.push(drill.id)
  }
  return chosen
}
