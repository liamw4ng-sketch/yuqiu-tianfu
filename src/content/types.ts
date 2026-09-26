import type { Localized, PairEvent, Position } from '../data/athletes'
import type { DrillId } from '../engine/drills'
import type { StyleMatch } from '../engine/mirror'
import type {
  AbilityKey, AgeBand, BmiBand, BodyType, DiagLevel, DoublesRole, FieldTestKey, FitBand, Flag, Freq, Hand,
  MixedNote, Preference, Sex, SinglesStyle,
} from '../engine/types'
import type { FieldErrorCode, WarningCode } from '../engine/validate'

export type Five = [string, string, string, string, string]

export interface AbilityText {
  /** Nombre corto para el radar: 爆发力 / Potencia */
  name: string
  /** Aclaración entre paréntesis: 杀球、起跳 / remate y salto */
  hint: string
  /** 5 niveles con conductas observables, del 1 (más bajo) al 5 */
  levels: Five
  /** Diagnóstico; plantilla con {score} */
  diag: Record<DiagLevel, string>
  /** 1–2 sugerencias concretas por nivel */
  tips: Record<DiagLevel, string>
}

export interface BodyTypeText {
  /** 矮快型（重心低 / 步频快） */
  name: string
  /** 1–2 frases sobre ventajas y desventajas naturales en pista */
  summary: string
}

export interface StyleText {
  name: string
  emoji: string
  tagline: string
  /** Por qué encaja; plantilla con {fit} */
  fitIntro: string
  coreTactic: string
  opening: string
  midgame: string
  keyPoints: string
  stamina: string
  pitfalls: string
  matchups: string
}

export interface RoleText {
  name: string
  emoji: string
  tagline: string
  fitIntro: string
  coreTactic: string
  rotation: string
  positioning: string
  positioningDont: string
  signals: string
  signalsDont: string
}

export interface DrillText {
  name: string
  how: string
  /** Series, repeticiones, duración y frecuencia semanal */
  dose: string
}

export interface Reference {
  id: string
  /** Autores (año). Título. Revista. */
  citation: string
  url: string
  /** Para qué lo usa el informe */
  usedFor: string
}

export interface TalentContent {
  list: { sep: string }
  form: {
    moduleLabel: string
    title: string
    subtitle: string
    fields: Record<'sex' | 'age' | 'heightCm' | 'weightKg' | 'wingspanCm' | 'yearsPlaying' | 'hand' | 'freq' | 'preference', string>
    wingspanHint: string
    abilitiesTitle: string
    abilitiesHint: string
    testsTitle: string
    testsHint: string
    choose: string
    submit: string
    confirmWarnings: string
    missingReport: string
    /** Plantillas: 'range' usa {min} y {max} */
    errors: Record<FieldErrorCode, string>
    warnings: Record<WarningCode, string>
  }
  options: {
    sex: Record<Sex, string>
    hand: Record<Hand, string>
    freq: Record<Freq, string>
    preference: Record<Preference, string>
  }
  abilities: Record<AbilityKey, AbilityText>
  tests: Record<FieldTestKey, { label: string; unit: string; hint: string }>
  bodyTypes: Record<BodyType, BodyTypeText>
  singles: Record<SinglesStyle, StyleText>
  doubles: Record<DoublesRole, RoleText>
  report: {
    title: string
    back: string
    retest: string
    share: string
    radarCurrent: string
    radarTendency: string
    radarNote: string
    physicalTitle: string
    /** {sex} {height} {weight} {bmi} {band} */
    bodyLine: string
    bmiBands: Record<BmiBand, string>
    /** {diff} {ratio} */
    wingspanLine: string
    wingspanAssumed: string
    /** {years} */
    yearsLine: string
    bodyTypeLabel: string
    /** Plantillas con {ability} y {score} */
    claimAdvantage: Record<DiagLevel, string>
    claimDisadvantage: Record<DiagLevel, string>
    ageBands: Record<AgeBand, { name: string; advice: string }>
    /** {strong} {strongScore} {weak} {weakScore} */
    strongWeak: string
    /** {score} */
    tacticsTitle: string
    mentalTitle: string
    singlesBand: string
    singlesIntro: string
    doublesBand: string
    doublesIntro: string
    fitBands: Record<FitBand, string>
    /** {fit} {band} */
    fitLine: string
    fitAnalysis: string
    /** {list} */
    driversLine: string
    gapsLine: string
    noDrivers: string
    noGaps: string
    /** {emoji} {name} {fit} */
    runnerUp: string
    singlesLabels: Record<'coreTactic' | 'opening' | 'midgame' | 'keyPoints' | 'stamina' | 'pitfalls' | 'matchups', string>
    doublesLabels: Record<'coreTactic' | 'rotation' | 'positioning' | 'positioningDont' | 'signals' | 'signalsDont' | 'partner' | 'mixed', string>
    /** Plantillas con {role} y {strength} */
    partner: Record<DoublesRole, string>
    mixedNotes: Record<MixedNote, string>
    mirrorTitle: string
    singlesMirror: string
    doublesMirror: string
    alternates: string
    you: string
    mirror: string
    height: string
    weight: string
    bmi: string
    /** {diff} */
    bmiDiffLine: string
    styleMatch: Record<StyleMatch, string>
    status: { active: string; retired: string; split: string }
    events: Record<PairEvent, string>
    positions: Record<Position, string>
    /** {name} {position} */
    matchedPlayer: string
    trainingTitle: string
    drills: Record<DrillId, DrillText>
    flagsTitle: string
    flags: Record<Flag, string>
    referencesTitle: string
    references: Reference[]
    disclaimer: string
  }
}

export type { Localized }
