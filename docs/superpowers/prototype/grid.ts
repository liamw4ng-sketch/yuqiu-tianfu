import { analyzeBody, tendency, current, blend, rankSingles, doublesRole } from './engine.ts'
const PATTERNS: Record<string, number[]> = { // power endurance reaction net speed rear tactics mental
  flatLow: [2,2,2,2,2,2,2,2], flatMid: [3,3,3,3,3,3,3,3], flatHigh: [4,4,4,4,4,4,4,4],
  smasher: [5,3,2,2,3,5,2,3], retriever: [2,4,4,3,4,2,3,4], netPlayer: [2,2,4,5,3,2,4,3],
  speedster: [4,3,4,3,5,2,2,3], thinker: [2,4,2,4,3,4,5,4], counterPro: [2,4,5,3,4,2,3,5],
}
const K = ['power','endurance','reaction','netTouch','speed','rearCourt','tactics','mental']
const cnt: Record<string, Record<string, number>> = { singles: {}, role: {}, body: {} }
const byPattern: Record<string, Record<string, number>> = {}
const fits: number[] = []
let n = 0
for (const sex of ['M','F'] as const) for (const h of [150,160,170,180,190,200]) for (const wt of [45,55,65,75,85,95]) for (const age of [15,25,35,45,60]) for (const y of [0.5,2,6]) for (const [pn, p] of Object.entries(PATTERNS)) {
  const levels: any = {}; K.forEach((k,i)=> levels[k]=p[i])
  const inp = { sex, age, heightCm: h, weightKg: wt, wingspanCm: null, yearsPlaying: y, levels }
  const b = analyzeBody(inp); const bl = blend(current(inp), tendency(b), y)
  const s = rankSingles(bl, b); const d = doublesRole(bl, b)
  cnt.singles[s.top] = (cnt.singles[s.top]||0)+1; cnt.role[d.role] = (cnt.role[d.role]||0)+1; cnt.body[b.bodyType] = (cnt.body[b.bodyType]||0)+1
  byPattern[pn] ??= {}; byPattern[pn][s.top+'/'+d.role] = (byPattern[pn][s.top+'/'+d.role]||0)+1
  fits.push(s.ranking[0].fit); n++
  for (const r of s.ranking) if (!(r.fit>=0 && r.fit<=100) || Number.isNaN(r.fit)) throw new Error('bad fit')
}
console.log('n', n, cnt)
fits.sort((a,b)=>a-b); console.log('top fit p10/p50/p90', fits[Math.floor(n*.1)], fits[Math.floor(n*.5)], fits[Math.floor(n*.9)])
for (const [k,v] of Object.entries(byPattern)) console.log(k, JSON.stringify(Object.entries(v).sort((a,b)=>b[1]-a[1]).slice(0,5)))
