import { analyzeBody, tendency, current, blend, rankSingles, doublesRole } from './engine.ts'
const golden = { sex: 'F' as const, age: 24, heightCm: 163, weightKg: 51, wingspanCm: 164, yearsPlaying: 2, levels: { power: 2, endurance: 3, reaction: 1, netTouch: 2, speed: 2, rearCourt: 2, tactics: 1, mental: 3 } as any }
const b = analyzeBody(golden); const t = tendency(b); const c = current(golden); const bl = blend(c, t, 2)
console.log('body', b); console.log('tendency', t); console.log('blended', bl)
console.log('singles', JSON.stringify(rankSingles(bl, b))); console.log('doubles', doublesRole(bl, b))
