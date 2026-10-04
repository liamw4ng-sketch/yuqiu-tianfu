// Convierte la investigación verificada (docs/superpowers/research) al formato de la app (src/data).
// Uso: node scripts/import-athletes.mjs
// - Suma los archivos athletes_singles_new_*.json y athletes_singles_v3_*.json si existen.
// - Conserva las traducciones .es ya hechas (por id); si no hay, usa translations_es.json; si tampoco, "TRADUCIR".
// - Pone los rasgos verificados de traits_singles.json (obligatorios: falla si un jugador no los tiene).
// - Saca de las fuentes los enlaces a la ficha BWF y a Wikipedia (en/zh) del propio jugador.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const R = 'docs/superpowers/research'
const COUNTRY_ES = {
  中国: 'China', 中国台北: 'China Taipéi', 中国香港: 'Hong Kong (China)', 印尼: 'Indonesia', 马来西亚: 'Malasia',
  丹麦: 'Dinamarca', 日本: 'Japón', 韩国: 'Corea del Sur', 泰国: 'Tailandia', 印度: 'India', 西班牙: 'España',
  新加坡: 'Singapur', 法国: 'Francia', 加拿大: 'Canadá', 英格兰: 'Inglaterra', 美国: 'Estados Unidos',
  越南: 'Vietnam', 德国: 'Alemania', 爱尔兰: 'Irlanda', 苏格兰: 'Escocia',
  荷兰: 'Países Bajos', 瑞典: 'Suecia', 俄罗斯: 'Rusia', 乌克兰: 'Ucrania', 土耳其: 'Turquía', 保加利亚: 'Bulgaria',
  比利时: 'Bélgica', 芬兰: 'Finlandia', 挪威: 'Noruega', 瑞士: 'Suiza', 巴西: 'Brasil', 澳大利亚: 'Australia',
  中国澳门: 'Macao (China)', 斯里兰卡: 'Sri Lanka', 以色列: 'Israel', 波兰: 'Polonia', 捷克: 'República Checa',
  爱沙尼亚: 'Estonia', 葡萄牙: 'Portugal', 意大利: 'Italia', 威尔士: 'Gales', 苏联: 'Unión Soviética',
}
const STYLE = {
  进攻压制型: 'attack', 四方拉吊控制型: 'control', 防守反击型: 'counter',
  速度突击型: 'speed', 全面型: 'allround', 网前技巧型: 'net',
}
const TODO = 'TRADUCIR'
// Decisión del usuario (2026-10-05): fuera quien se retiró antes de 2010. Igual que RETIRED_CUTOFF_YEAR y
// RETIRED_BEFORE_CUTOFF_NO_YEAR en src/data/athletes.ts (el test de datos comprueba el resultado).
const RETIRED_CUTOFF_YEAR = 2010
const RETIRED_BEFORE_CUTOFF_NO_YEAR = ['icuk-sugiarto', 'ardy-wiranata', 'hariyanto-arbi', 'dong-jiong', 'chen-hong', 'bang-soo-hyun', 'huang-hua']
const retiredTooEarly = (a) =>
  a.status === 'retired' &&
  (typeof a.retired_year === 'number' ? a.retired_year < RETIRED_CUTOFF_YEAR : RETIRED_BEFORE_CUTOFF_NO_YEAR.includes(a.id))
const country = (zh) => {
  if (!COUNTRY_ES[zh]) throw new Error(`País sin traducción: ${zh}`)
  return { zh, es: COUNTRY_ES[zh] }
}

const readJson = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null)
const prevSingles = new Map((readJson('src/data/athletes-singles.json') ?? []).map((a) => [a.id, a]))
const prevPairs = new Map((readJson('src/data/athletes-doubles.json') ?? []).map((p) => [p.id, p]))
const keepEs = (prev, zh) => (prev && prev.zh === zh && prev.es && prev.es !== TODO ? prev.es : TODO)

const decode = (u) => {
  try {
    return decodeURIComponent(u)
  } catch {
    return u
  }
}
const norm = (x) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\u4e00-\u9fff]/g, '')
function linksOf(a) {
  const src = a.sources ?? []
  const bwf = src.find((u) => /bwfbadminton\.com\/player\/\d+\//.test(u))
  const last = norm(a.name_en.split(/[\s-]+/).at(-1) ?? '')
  const first = norm(a.name_en.split(/[\s-]+/)[0] ?? '')
  const wikiEn = src.find((u) => {
    const m = u.match(/^https:\/\/en\.wikipedia\.org\/wiki\/([^#?]+)$/)
    if (!m) return false
    const t = norm(decode(m[1]))
    return t.includes(last) && t.includes(first)
  })
  const zhName = norm(a.name_zh)
  const wikiZh = src.find((u) => {
    const m = u.match(/^https:\/\/zh\.wikipedia\.org\/wiki\/([^#?]+)$/)
    return m ? norm(decode(m[1])).includes(zhName.slice(0, 2)) : false
  })
  const links = {}
  if (bwf) links.bwf = bwf
  if (wikiEn) links.wikiEn = wikiEn
  if (wikiZh) links.wikiZh = wikiZh
  return Object.keys(links).length ? links : undefined
}

const v3Files = ['legends_m', 'legends_f', 'top_m', 'top_f'].map((f) => `${R}/athletes_singles_v3_${f}.json`)
const singlesRaw = [
  ...JSON.parse(readFileSync(`${R}/athletes_singles.json`, 'utf8')).athletes,
  ...(readJson(`${R}/athletes_singles_new_m.json`)?.athletes ?? []),
  ...(readJson(`${R}/athletes_singles_new_f.json`)?.athletes ?? []),
  ...v3Files.flatMap((f) => readJson(f)?.athletes ?? []),
]
const TRAITS = readJson(`${R}/traits_singles.json`) ?? {}
const TR_ES = readJson(`${R}/translations_es.json`) ?? {}
const esOf = (prev, zh, id, field) => {
  const kept = keepEs(prev, zh)
  return kept !== TODO ? kept : (TR_ES[id]?.[field] ?? TODO)
}
const traitsOf = (id) => {
  const t = TRAITS[id]
  if (!t || t.verified !== true) throw new Error(`Sin rasgos verificados: ${id}`)
  return t.traits
}
const seenIds = new Set()
const singles = singlesRaw
  .filter((a) => a.verified === true && !retiredTooEarly(a) && !seenIds.has(a.id) && seenIds.add(a.id))
  .map((a) => {
    if (!STYLE[a.style_primary]) throw new Error(`Estilo desconocido: ${a.style_primary}`)
    return {
      id: a.id,
      nameEn: a.name_en,
      nameZh: a.name_zh,
      sex: a.gender,
      country: country(a.country_zh),
      heightCm: a.height_cm,
      weightKg: a.weight_kg ?? null,
      hand: a.handedness ?? null,
      birthYear: a.birth_year ?? null,
      status: a.status,
      retiredYear: a.status === 'retired' ? a.retired_year : null,
      style: STYLE[a.style_primary],
      traits: traitsOf(a.id),
      highlights: { zh: a.highlights_zh, es: esOf(prevSingles.get(a.id)?.highlights, a.highlights_zh, a.id, 'highlights') },
      desc: { zh: a.style_desc_zh, es: esOf(prevSingles.get(a.id)?.desc, a.style_desc_zh, a.id, 'desc') },
      ...(linksOf(a) ? { links: linksOf(a) } : {}),
    }
  })

const allPairs = JSON.parse(readFileSync(`${R}/athletes_doubles.json`, 'utf8')).pairs.filter((p) => p.verified === true)
// Sin altura no hay comparación corporal posible: esas parejas se quedan fuera.
const pairs = allPairs
  .filter((p) => p.players.every((pl) => typeof pl.height_cm === 'number'))
  .map((p) => ({
    id: p.id,
    event: p.event,
    pairZh: p.pair_name_zh,
    pairEn: p.pair_name_en,
    country: country(p.country_zh),
    status: p.status,
    highlights: { zh: p.highlights_zh, es: keepEs(prevPairs.get(p.id)?.highlights, p.highlights_zh) },
    style: { zh: p.pair_style_zh, es: keepEs(prevPairs.get(p.id)?.style, p.pair_style_zh) },
    players: p.players.map((pl, i) => ({
      nameEn: pl.name_en,
      nameZh: pl.name_zh,
      sex: pl.gender,
      heightCm: pl.height_cm,
      weightKg: pl.weight_kg ?? null,
      hand: pl.handedness ?? null,
      position: pl.typical_position,
      role: { zh: pl.role_desc_zh, es: keepEs(prevPairs.get(p.id)?.players?.[i]?.role, pl.role_desc_zh) },
    })),
  }))

writeFileSync('src/data/athletes-singles.json', JSON.stringify(singles, null, 2) + '\n')
writeFileSync('src/data/athletes-doubles.json', JSON.stringify(pairs, null, 2) + '\n')
console.log(`singles: ${singles.length}, pairs: ${pairs.length} (descartadas sin altura: ${allPairs.length - pairs.length})`)
