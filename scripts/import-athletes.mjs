// Convierte la investigación verificada (docs/superpowers/research) al formato de la app (src/data).
// Uso: node scripts/import-athletes.mjs
// Los campos .es quedan como "TRADUCIR" para traducirlos a mano (Tarea 5 del plan).
import { readFileSync, writeFileSync } from 'node:fs'

const R = 'docs/superpowers/research'
const COUNTRY_ES = {
  中国: 'China', 中国台北: 'China Taipéi', 中国香港: 'Hong Kong (China)', 印尼: 'Indonesia', 马来西亚: 'Malasia',
  丹麦: 'Dinamarca', 日本: 'Japón', 韩国: 'Corea del Sur', 泰国: 'Tailandia', 印度: 'India', 西班牙: 'España',
  新加坡: 'Singapur', 法国: 'Francia', 加拿大: 'Canadá', 英格兰: 'Inglaterra', 美国: 'Estados Unidos',
  越南: 'Vietnam', 德国: 'Alemania',
}
const STYLE = {
  进攻压制型: 'attack', 四方拉吊控制型: 'control', 防守反击型: 'counter',
  速度突击型: 'speed', 全面型: 'allround', 网前技巧型: 'net',
}
const TODO = 'TRADUCIR'
const country = (zh) => {
  if (!COUNTRY_ES[zh]) throw new Error(`País sin traducción: ${zh}`)
  return { zh, es: COUNTRY_ES[zh] }
}

const singles = JSON.parse(readFileSync(`${R}/athletes_singles.json`, 'utf8')).athletes
  .filter((a) => a.verified === true)
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
      highlights: { zh: a.highlights_zh, es: TODO },
      desc: { zh: a.style_desc_zh, es: TODO },
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
    highlights: { zh: p.highlights_zh, es: TODO },
    style: { zh: p.pair_style_zh, es: TODO },
    players: p.players.map((pl) => ({
      nameEn: pl.name_en,
      nameZh: pl.name_zh,
      sex: pl.gender,
      heightCm: pl.height_cm,
      weightKg: pl.weight_kg ?? null,
      hand: pl.handedness ?? null,
      position: pl.typical_position,
      role: { zh: pl.role_desc_zh, es: TODO },
    })),
  }))

writeFileSync('src/data/athletes-singles.json', JSON.stringify(singles, null, 2) + '\n')
writeFileSync('src/data/athletes-doubles.json', JSON.stringify(pairs, null, 2) + '\n')
console.log(`singles: ${singles.length}, pairs: ${pairs.length} (descartadas sin altura: ${allPairs.length - pairs.length})`)
