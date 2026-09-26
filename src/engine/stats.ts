export const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length

export const sd = (xs: readonly number[]): number => {
  const m = mean(xs)
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)))
}

export const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x))

export function correlation(xs: readonly number[], ys: readonly number[]): number {
  const mx = mean(xs)
  const my = mean(ys)
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - mx
    const b = ys[i] - my
    num += a * b
    dx += a * a
    dy += b * b
  }
  if (dx === 0 || dy === 0) return 0
  return num / Math.sqrt(dx * dy)
}

/** Devuelve la clave cuyo valor gana según `better`; en empate conserva la primera. */
export function argBy<K extends string>(keys: readonly K[], value: (k: K) => number, better: (a: number, b: number) => boolean): K {
  let best = keys[0]
  for (const k of keys.slice(1)) if (better(value(k), value(best))) best = k
  return best
}
