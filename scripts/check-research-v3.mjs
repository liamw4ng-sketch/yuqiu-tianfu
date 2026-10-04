// Comprueba los archivos de investigación de la v3. Uso: node scripts/check-research-v3.mjs
import { existsSync, readFileSync } from 'node:fs'

const R = 'docs/superpowers/research'
const TRAITS = ['power', 'deception', 'net', 'defense', 'stamina', 'speed', 'placement', 'fight']
const STYLES = ['进攻压制型', '四方拉吊控制型', '防守反击型', '速度突击型', '全面型', '网前技巧型']
const read = (f) => JSON.parse(readFileSync(`${R}/${f}`, 'utf8'))
const norm = (x) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

// Base: la investigación anterior a la v3 (no src/data, que tras importar ya incluye a los nuevos).
const existing = ['athletes_singles.json', 'athletes_singles_new_m.json', 'athletes_singles_new_f.json']
  .filter((f) => existsSync(`${R}/${f}`))
  .flatMap((f) => read(f).athletes.filter((a) => a.verified === true))
const errors = []
const ids = new Set(existing.map((a) => a.id))
const names = new Set(existing.map((a) => norm(a.name_en)))
const zhNames = new Set(existing.map((a) => a.name_zh))
const fresh = []
for (const f of ['legends_m', 'legends_f', 'top_m', 'top_f']) {
  const file = `athletes_singles_v3_${f}.json`
  if (!existsSync(`${R}/${file}`)) { errors.push(`falta ${file}`); continue }
  for (const a of read(file).athletes.filter((x) => x.verified === true)) {
    if (ids.has(a.id) || names.has(norm(a.name_en)) || zhNames.has(a.name_zh)) errors.push(`${file}: ${a.id} ya existe`)
    if (typeof a.height_cm !== 'number') errors.push(`${a.id}: sin altura`)
    if (!STYLES.includes(a.style_primary)) errors.push(`${a.id}: estilo ${a.style_primary}`)
    if (!['M', 'F'].includes(a.gender)) errors.push(`${a.id}: sexo`)
    if (!a.sources?.length) errors.push(`${a.id}: sin fuentes`)
    ids.add(a.id); names.add(norm(a.name_en)); zhNames.add(a.name_zh); fresh.push(a.id)
  }
}
const traits = existsSync(`${R}/traits_singles.json`) ? read('traits_singles.json') : {}
for (const id of ids) {
  const t = traits[id]
  if (!t) { errors.push(`${id}: sin rasgos`); continue }
  if (t.verified !== true) errors.push(`${id}: rasgos sin verificar`)
  if (!(t.traits.length >= 2 && t.traits.length <= 3)) errors.push(`${id}: ${t.traits.length} rasgos`)
  if (new Set(t.traits).size !== t.traits.length) errors.push(`${id}: rasgos repetidos`)
  for (const x of t.traits) if (!TRAITS.includes(x)) errors.push(`${id}: rasgo ${x}`)
  if (!t.sources?.length) errors.push(`${id}: rasgos sin fuentes`)
}
const tr = existsSync(`${R}/translations_es.json`) ? read('translations_es.json') : {}
for (const id of fresh) if (!tr[id]?.highlights || !tr[id]?.desc) errors.push(`${id}: sin traducción`)
console.log(`nuevos verificados: ${fresh.length}; total: ${ids.size}`)
if (errors.length) { console.error(errors.join('\n')); process.exit(1) }
console.log('OK')
