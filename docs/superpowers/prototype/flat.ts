import { analyzeBody, tendency, current, blend, rankSingles, doublesRole } from './engine.ts'
const K = ['power','endurance','reaction','netTouch','speed','rearCourt','tactics','mental']
const out: Record<string, Record<string, number>> = {}
for (const sex of ['M','F'] as const) for (const h of [150,155,160,165,170,175,180,185,190]) for (const wt of [45,50,55,60,65,70,75,80,90]) for (const age of [25,45]) {
  const levels: any = {}; K.forEach(k => levels[k] = 2)
  const inp = { sex, age, heightCm: h, weightKg: wt, wingspanCm: null, yearsPlaying: 0.5, levels }
  const b = analyzeBody(inp); const bl = blend(current(inp), tendency(b), 0.5)
  const s = rankSingles(bl, b); const d = doublesRole(bl, b)
  const key = `${b.bodyType}/${b.ageBand}`
  out[key] ??= {}; out[key][s.top+'/'+d.role] = (out[key][s.top+'/'+d.role]||0)+1
}
for (const [k,v] of Object.entries(out)) console.log(k.padEnd(24), JSON.stringify(Object.entries(v).sort((a,b)=>b[1]-a[1])))
