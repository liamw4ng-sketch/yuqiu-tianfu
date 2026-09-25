type Sex = 'M' | 'F'
const ABILITY_KEYS = ['power','endurance','reaction','netTouch','speed','rearCourt','tactics','mental'] as const
type AbilityKey = typeof ABILITY_KEYS[number]
const RADAR_KEYS = ['power','endurance','reaction','netTouch','speed','rearCourt'] as const
type RadarKey = typeof RADAR_KEYS[number]
type Level = 1|2|3|4|5
type BmiBand = 'under'|'lean'|'normal'|'solid'|'heavy'
type AgeBand = 'youth'|'prime'|'thirties'|'forties'|'fiftyPlus'
type HeightBand = 'short'|'average'|'tall'
type BodyType = 'compactQuick'|'lightAgile'|'balanced'|'sturdyPower'|'tallLean'|'tallPower'
interface Input { sex: Sex; age: number; heightCm: number; weightKg: number; wingspanCm: number|null; yearsPlaying: number; levels: Record<AbilityKey, Level> }
const HEIGHT_REF = { M: { mean: 172, sd: 6.5 }, F: { mean: 160, sd: 6 } }
const LEVEL_SCORE: Record<Level, number> = {1:2,2:4,3:6,4:8,5:10}
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))
const mean = (xs: number[]) => xs.reduce((a,b)=>a+b,0)/xs.length
const sd = (xs: number[]) => { const m = mean(xs); return Math.sqrt(mean(xs.map(x => (x-m)**2))) }
function correlation(xs: number[], ys: number[]) { const mx=mean(xs), my=mean(ys); let n=0,dx=0,dy=0; for (let i=0;i<xs.length;i++){const a=xs[i]-mx,b=ys[i]-my;n+=a*b;dx+=a*a;dy+=b*b} return dx===0||dy===0?0:n/Math.sqrt(dx*dy) }
const bmiOf = (h: number, w: number) => Math.round(w/((h/100)**2)*10)/10
const bmiBandOf = (b: number): BmiBand => b < 18.5 ? 'under' : b < 20.5 ? 'lean' : b < 23.5 ? 'normal' : b < 26 ? 'solid' : 'heavy'
const ageBandOf = (a: number): AgeBand => a <= 17 ? 'youth' : a <= 30 ? 'prime' : a <= 40 ? 'thirties' : a <= 50 ? 'forties' : 'fiftyPlus'
const heightBandOf = (z: number): HeightBand => z <= -0.75 ? 'short' : z >= 0.75 ? 'tall' : 'average'
function bodyTypeOf(hb: HeightBand, bb: BmiBand): BodyType { const heavy = bb==='solid'||bb==='heavy', light = bb==='under'||bb==='lean'; if (hb==='short') return heavy?'sturdyPower':'compactQuick'; if (hb==='tall') return light?'tallLean':'tallPower'; if (heavy) return 'sturdyPower'; return light?'lightAgile':'balanced' }
export function analyzeBody(i: Input) { const bmi = bmiOf(i.heightCm, i.weightKg); const ws = i.wingspanCm ?? i.heightCm; const heightZ = (i.heightCm - HEIGHT_REF[i.sex].mean)/HEIGHT_REF[i.sex].sd; const heightBand = heightBandOf(heightZ); const bmiBand = bmiBandOf(bmi); return { bmi, bmiBand, heightZ, heightBand, wingspanCm: ws, wingspanAssumed: i.wingspanCm == null, apeIndexCm: ws - i.heightCm, apeRatio: Math.round(ws/i.heightCm*1000)/1000, ageBand: ageBandOf(i.age), bodyType: bodyTypeOf(heightBand, bmiBand) } }
type Body = ReturnType<typeof analyzeBody>
const BMI_ADJ: Record<RadarKey, Record<BmiBand, number>> = {
  power: { under: -1.2, lean: -0.3, normal: 0.5, solid: 0.8, heavy: 0.3 },
  endurance: { under: -0.5, lean: 0.5, normal: 0.5, solid: -0.5, heavy: -1.5 },
  reaction: { under: 0, lean: 0, normal: 0, solid: 0, heavy: -0.5 },
  netTouch: { under: 0, lean: 0, normal: 0, solid: 0, heavy: 0 },
  speed: { under: -0.3, lean: 0.8, normal: 0.3, solid: -0.5, heavy: -1.5 },
  rearCourt: { under: -0.8, lean: -0.2, normal: 0.4, solid: 0.5, heavy: 0 },
}
const HEIGHT_COEF: Record<RadarKey, number> = { power: 0.8, endurance: 0, reaction: 0, netTouch: 0, speed: -0.6, rearCourt: 0.9 }
const APE_COEF: Record<RadarKey, number> = { power: 0, endurance: 0, reaction: 0.1, netTouch: 0.05, speed: 0, rearCourt: 0.12 }
const Z = { power: 0, endurance: 0, reaction: 0, netTouch: 0, speed: 0, rearCourt: 0 }
const AGE_ADJ: Record<AgeBand, Record<RadarKey, number>> = {
  youth: { ...Z, power: -0.5, rearCourt: -0.3 }, prime: Z,
  thirties: { ...Z, power: -0.3, endurance: -0.3, reaction: -0.2, speed: -0.5 },
  forties: { ...Z, power: -0.7, endurance: -0.8, reaction: -0.5, speed: -1.0, rearCourt: -0.3 },
  fiftyPlus: { ...Z, power: -1.0, endurance: -1.2, reaction: -0.8, speed: -1.5, rearCourt: -0.6 },
}
export function tendency(b: Body) { const out = {} as Record<RadarKey, number>; for (const k of RADAR_KEYS) out[k] = clamp(5 + HEIGHT_COEF[k]*clamp(b.heightZ,-2,2) + APE_COEF[k]*clamp(b.apeIndexCm,-8,8) + BMI_ADJ[k][b.bmiBand] + AGE_ADJ[b.ageBand][k], 1, 9.5); return out }
export const blendFactor = (y: number) => y < 1 ? 0.5 : y <= 3 ? 0.65 : 0.8
export function current(i: Input) { const o = {} as Record<AbilityKey, number>; for (const k of ABILITY_KEYS) o[k] = LEVEL_SCORE[i.levels[k]]; return o }
export function blend(c: Record<AbilityKey, number>, t: Record<RadarKey, number>, y: number) { const a = blendFactor(y); const o = { ...c }; for (const k of ABILITY_KEYS) { const tk = (RADAR_KEYS as readonly string[]).includes(k) ? t[k as RadarKey] : 5; o[k] = a*c[k] + (1-a)*tk } return o }
type W = Record<AbilityKey, number>
const w = (p: Partial<W>): W => ({ power:0, endurance:0, reaction:0, netTouch:0, speed:0, rearCourt:0, tactics:0, mental:0, ...p })
export const SINGLES_WEIGHTS = {
  attack: w({ power:.30, rearCourt:.25, speed:.15, endurance:.10, reaction:.05, netTouch:.05, tactics:.05, mental:.05 }),
  control: w({ endurance:.25, tactics:.25, rearCourt:.15, netTouch:.15, speed:.10, mental:.10 }),
  counter: w({ reaction:.25, speed:.20, endurance:.20, mental:.15, netTouch:.10, tactics:.10 }),
  speed: w({ speed:.30, reaction:.20, power:.20, netTouch:.15, endurance:.15 }),
  net: w({ netTouch:.35, tactics:.20, reaction:.15, speed:.10, mental:.10, rearCourt:.10 }),
}
const SINGLES_STYLES = ['attack','control','counter','speed','allround','net'] as const
type Style = typeof SINGLES_STYLES[number]
const vec = (r: Record<AbilityKey, number>) => ABILITY_KEYS.map(k => r[k])
const fitFrom = (score01: number, body01: number) => Math.round(100*(0.7*score01 + 0.3*body01))
const older = (b: Body) => b.ageBand === 'forties' || b.ageBand === 'fiftyPlus'
export function singlesBodyFit(s: Style, b: Body) { const z = clamp(b.heightZ,-1.5,1.5), bb = b.bmiBand, ape = b.apeIndexCm; let v = 0.6
  if (s==='attack') v = 0.5 + 0.2*z + ({under:-0.25, lean:-0.1, normal:0.1, solid:0.15, heavy:-0.05})[bb] + (ape>=5?0.05:0)
  if (s==='control') v = 0.6 + ({under:-0.1, lean:0.1, normal:0.1, solid:-0.05, heavy:-0.2})[bb] + (older(b)?0.1:0)
  if (s==='counter') v = 0.5 - 0.15*z + ({under:0, lean:0.1, normal:0.05, solid:-0.1, heavy:-0.25})[bb] + (ape>=3?0.1:0)
  if (s==='speed') v = 0.5 - 0.15*z + ({under:-0.05, lean:0.2, normal:0.1, solid:-0.15, heavy:-0.3})[bb] + ({youth:0, prime:0, thirties:-0.05, forties:-0.15, fiftyPlus:-0.25})[b.ageBand]
  if (s==='net') v = 0.6 + (older(b)?0.05:0)
  if (s==='allround') v = 0.6 + (bb==='lean'||bb==='normal'?0.05:0)
  return clamp(v,0,1) }
export function rankSingles(bl: Record<AbilityKey, number>, b: Body) { const u = vec(bl); const ranking = SINGLES_STYLES.map(s => { let score01: number; if (s==='allround') { score01 = (1 - Math.min(sd(u)/2.5,1)) * Math.min(1, mean(u)/6.5) } else { score01 = (correlation(u, vec(SINGLES_WEIGHTS[s]))+1)/2 } return { style: s, fit: fitFrom(score01, singlesBodyFit(s,b)) } }).sort((a,b2)=> b2.fit - a.fit || SINGLES_STYLES.indexOf(a.style)-SINGLES_STYLES.indexOf(b2.style)); return { ranking, top: ranking[0].style, runnerUp: ranking[1].style, margin: ranking[0].fit - ranking[1].fit } }
const FRONT = w({ endurance:.05, reaction:.30, netTouch:.30, speed:.20, tactics:.10, mental:.05 })
const BACK = w({ power:.35, endurance:.20, reaction:.05, speed:.10, rearCourt:.25, mental:.05 })
export function doublesRole(bl: Record<AbilityKey, number>, b: Body) { const z = clamp(b.heightZ,-1.5,1.5), bb = b.bmiBand, u = vec(bl)
  const fb = clamp(0.5 - 0.15*z + ({under:0, lean:0.1, normal:0.05, solid:-0.05, heavy:-0.2})[bb], 0, 1)
  const bbf = clamp(0.5 + 0.2*z + (b.apeIndexCm>=3?0.1:0) + ({under:-0.2, lean:-0.05, normal:0.1, solid:0.15, heavy:0})[bb], 0, 1)
  const frontFit = fitFrom((correlation(u, vec(FRONT))+1)/2, fb), backFit = fitFrom((correlation(u, vec(BACK))+1)/2, bbf)
  const diff = frontFit - backFit
  const role = Math.abs(diff) < 8 && mean(u) >= 5 ? 'rotation' : diff >= 0 ? 'front' : 'back'
  const fit = role === 'rotation' ? Math.min(100, Math.round((frontFit+backFit)/2) + 5) : Math.max(frontFit, backFit)
  return { role, fit, frontFit, backFit } }
