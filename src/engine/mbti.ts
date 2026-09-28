export const MBTI_AXES = ['EI', 'SN', 'TF', 'JP'] as const
export type MbtiAxis = (typeof MBTI_AXES)[number]
export type MbtiLetter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'
export const POLES: Record<MbtiAxis, [MbtiLetter, MbtiLetter]> = { EI: ['E', 'I'], SN: ['S', 'N'], TF: ['T', 'F'], JP: ['J', 'P'] }

export const MBTI_QUESTION_IDS = [
  'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10',
  'm11', 'm12', 'm13', 'm14', 'm15', 'm16', 'm17', 'm18', 'm19', 'm20',
] as const
export type MbtiQuestionId = (typeof MBTI_QUESTION_IDS)[number]
export type MbtiAnswers = Partial<Record<MbtiQuestionId, 'a' | 'b'>>

/** La opción `a` de cada pregunta expresa `aPole`; la `b`, el polo opuesto del mismo eje. */
export const MBTI_QUESTIONS: { id: MbtiQuestionId; axis: MbtiAxis; aPole: MbtiLetter }[] = MBTI_QUESTION_IDS.map((id, i) => {
  const axis = MBTI_AXES[i % 4]
  const [first, second] = POLES[axis]
  return { id, axis, aPole: Math.floor(i / 4) % 2 === 0 ? first : second }
})

export const MBTI_CODES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
] as const
export type MbtiCode = (typeof MBTI_CODES)[number]

export interface MbtiAxisResult {
  first: number
  second: number
  winner: MbtiLetter
  percent: number
}
export interface MbtiResult {
  code: MbtiCode
  axes: Record<MbtiAxis, MbtiAxisResult>
}

export function isMbtiComplete(a: Partial<Record<string, string>>): a is Record<MbtiQuestionId, 'a' | 'b'> {
  return MBTI_QUESTION_IDS.every((id) => a[id] === 'a' || a[id] === 'b')
}

export function scoreMbti(answers: Record<MbtiQuestionId, 'a' | 'b'>): MbtiResult {
  const axes = {} as Record<MbtiAxis, MbtiAxisResult>
  for (const axis of MBTI_AXES) {
    const [first, second] = POLES[axis]
    let nFirst = 0
    let nSecond = 0
    for (const q of MBTI_QUESTIONS.filter((x) => x.axis === axis)) {
      const pole = answers[q.id] === 'a' ? q.aPole : q.aPole === first ? second : first
      if (pole === first) nFirst++
      else nSecond++
    }
    const winner = nFirst > nSecond ? first : second
    axes[axis] = { first: nFirst, second: nSecond, winner, percent: Math.round((Math.max(nFirst, nSecond) / (nFirst + nSecond)) * 100) }
  }
  const code = MBTI_AXES.map((a) => axes[a].winner).join('') as MbtiCode
  return { code, axes }
}

const flip = (code: MbtiCode, axes: MbtiAxis[]): MbtiCode =>
  MBTI_AXES.map((axis, i) => {
    const letter = code[i] as MbtiLetter
    if (!axes.includes(axis)) return letter
    const [a, b] = POLES[axis]
    return letter === a ? b : a
  }).join('') as MbtiCode

/** Pareja ideal: energía y estructura complementarias (E/I y J/P opuestos), misma lectura del juego y mismos valores. */
export const bestPartner = (code: MbtiCode): MbtiCode => flip(code, ['EI', 'JP'])
/** Choque típico: misma energía y estructura, pero lectura del juego y valores opuestos (S/N y T/F). */
export const worstPartner = (code: MbtiCode): MbtiCode => flip(code, ['SN', 'TF'])
