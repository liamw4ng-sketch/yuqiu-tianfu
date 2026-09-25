import { analyzeBody, tendency, current, blend, rankSingles, doublesRole } from './engine.ts'
const K = ['power','endurance','reaction','netTouch','speed','rearCourt','tactics','mental']
function run(name: string, sex: 'M'|'F', age: number, h: number, w: number, ws: number|null, y: number, p: number[]) {
  const levels: any = {}; K.forEach((k,i)=>levels[k]=p[i]); const inp = { sex, age, heightCm: h, weightKg: w, wingspanCm: ws, yearsPlaying: y, levels }
  const b = analyzeBody(inp); const bl = blend(current(inp), tendency(b), y); const s = rankSingles(bl, b); const d = doublesRole(bl, b)
  console.log(name.padEnd(10), b.bodyType, JSON.stringify(s.ranking.map(r=>r.style+':'+r.fit)), d)
}
run('smasher','M',25,188,80,null,6,[5,3,2,2,3,5,2,3])
run('net','F',25,160,52,null,4,[2,2,4,5,3,2,4,3])
run('counter','M',28,170,62,null,5,[2,4,5,3,4,2,3,5])
run('thinker','M',35,175,70,null,8,[2,4,2,4,3,4,5,4])
run('speedster','F',22,158,48,null,3,[4,3,4,3,5,2,2,3])
for (const p of [[4,4,4,4,4,4,4,4],[4,4,4,4,4,4,5,4],[4,4,4,3,4,4,4,4],[3,4,4,4,4,3,4,4],[4,4,3,4,4,4,4,4],[4,3,4,4,4,4,4,4]]) for (const [h,w] of [[172,66],[176,70],[168,62]]) run('rot?'+p.join(''),'M',26,h,w,null,6,p)
