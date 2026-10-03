# v3: más jugadores, 12 preguntas de gustos y rasgos en el espejo — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir unos 45 jugadores conocidos de individual: leyendas y jugadores del top 30 actual. Añadir 6 preguntas a 球风偏好 y un vocabulario de 8 rasgos. El 🎯 espejo de estilo pasa a elegir al jugador que comparte tus rasgos.

**Architecture:**
- El motor sigue siendo puro: `src/engine`.
- `prefs.ts` amplía las preguntas y los puntos de estilo.
- `traits.ts` (nuevo) convierte las respuestas en un vector de rasgos y mide la similitud con el vector de cada jugador.
- `mirror.ts` añade a la distancia del espejo de estilo un término `0,6·(1 − sim)`.
- Los rasgos de cada jugador se investigan y verifican con agentes, viven en `docs/superpowers/research/` y `scripts/import-athletes.mjs` los lleva a `src/data/athletes-singles.json`.
- La interfaz solo añade textos (zh/es) y una línea de rasgos en la tarjeta del espejo.

**Tech Stack:** Vite 8, React 19, TypeScript (strict), Vitest + Testing Library, Workflow tool para la investigación.

**Spec:** `docs/superpowers/specs/2026-09-25-badminton-app-design.md` §17 (y §16 para la v2 sobre la que se construye).

## Global Constraints

- **Idiomas:** la app está en chino con el español completo. TypeScript obliga a que `ui.es`/`talentEs` tengan las mismas claves, y `content.test.ts` obliga a que tengan los mismos marcadores.
- **Pronombres:** 她 para jugadoras y 他 para jugadores. `pronounErrors` en `src/data/athletes.ts` lo comprueba.
- **Medidas:**
  - Sin altura de fuente fiable (BWF, Olympedia, federación o Wikipedia con cita), el jugador no entra.
  - El peso nunca se adivina: si no hay fuente, `null`.
- **Nombres:** los países siguen la convención de los medios de China continental (中国, 中国台北, 印尼, 丹麦…) y el nombre chino es el de la Wikipedia china o el de los medios de China continental.
- **Español:** `desc.es` no puede tener caracteres chinos.
- **Motor:** `src/engine` no importa nada de `src/content`.
- **Almacenamiento:** la clave sigue siendo `yuqiu.v1`. Los registros v1 (sin gustos) y v2 (6 gustos) deben seguir cargando.
- **Commits:**
  - Terminan con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  - Se suben con `git -c credential.helper='!gh auth git-credential' push`. No hay clave SSH y no se toca la configuración global.
- **Comprobaciones:** `npx vitest run`, `npm run typecheck` y `npm run build` pasan al final de cada tarea. Única excepción: entre la Tarea 2 y la 3, `typecheck` falla en `src/content` hasta que existan los textos de las preguntas nuevas.
- **Rama de trabajo:** `feat/v3-rasgos`, que se fusiona en `main` al final.

## Review Focus

1. **Registro v2 guardado con 6 gustos que se abre desde 我的档案:** el informe se muestra sin errores, sin NaN y con «他/她的招牌» o «共同特点». El test va en la Tarea 6.
2. **Registro v1 sin gustos:** el espejo funciona igual que antes, sin línea de rasgos en común, y muestra el sello del jugador. El test va en la Tarea 6.
3. **Jugador duplicado por la investigación:** por ejemplo, Lin Dan con otro id. No puede haber dos fichas con el mismo `nameEn` normalizado. El test va en la Tarea 4.
4. **Usuario que responde las 6 preguntas antiguas y deja sin responder las nuevas:** el formulario marca cada pregunta nueva como obligatoria y lleva el foco a la primera que falta. El test va en la Tarea 3.
5. **Informe en español:** los rasgos salen en español, separados con `c.list.sep`, y sin caracteres chinos. El test va en la Tarea 6.

---

### Task 1: Investigación — jugadores nuevos, rasgos de todos los jugadores y traducciones

Tarea de datos, sin TDD. Se ejecuta con el Workflow tool en dos fases y se lanza en segundo plano mientras avanzan las Tareas 2 y 3.

**Files:**
- Create: `docs/superpowers/research/athletes_singles_v3_legends_m.json`, `athletes_singles_v3_legends_f.json`, `athletes_singles_v3_top_m.json`, `athletes_singles_v3_top_f.json`
- Create: `docs/superpowers/research/traits_singles.json`
- Create: `docs/superpowers/research/translations_es.json`
- Create: `scripts/check-research-v3.mjs`

**Interfaces:**
- Produces:
  - **Fichas de jugador:** cada `athletes_singles_v3_*.json` tiene la forma `{ "athletes": [ ... ] }` y el mismo esquema que `athletes_singles_new_m.json`: `id`, `name_en`, `name_zh`, `country_zh`, `gender`, `height_cm`, `weight_kg|null`, `handedness`, `birth_year`, `status`, `retired_year`, `highlights_zh`, `style_primary`, `style_tags_zh`, `style_desc_zh`, `signature_skills_zh`, `sources`, `confidence`, `notes`, `verified`, `verification_note`.
  - **`traits_singles.json`:** `{ "<id>": { "traits": ["deception","net"], "evidence_zh": "…", "sources": ["https://…"], "verified": true } }`. Cubre a todos los jugadores verificados, los 81 actuales y los nuevos.
  - **`translations_es.json`:** `{ "<id>": { "highlights": "…", "desc": "…" } }`, solo para los jugadores nuevos.

- [ ] **Step 1: Crear la rama**

```bash
git checkout -b feat/v3-rasgos
```

- [ ] **Step 2: Script de comprobación (antes de investigar, para saber qué exigir)**

Create `scripts/check-research-v3.mjs`:

```js
// Comprueba los archivos de investigación de la v3. Uso: node scripts/check-research-v3.mjs
import { existsSync, readFileSync } from 'node:fs'

const R = 'docs/superpowers/research'
const TRAITS = ['power', 'deception', 'net', 'defense', 'stamina', 'speed', 'placement', 'fight']
const STYLES = ['进攻压制型', '四方拉吊控制型', '防守反击型', '速度突击型', '全面型', '网前技巧型']
const read = (f) => JSON.parse(readFileSync(`${R}/${f}`, 'utf8'))
const norm = (x) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

const existing = JSON.parse(readFileSync('src/data/athletes-singles.json', 'utf8'))
const errors = []
const ids = new Set(existing.map((a) => a.id))
const names = new Set(existing.map((a) => norm(a.nameEn)))
const fresh = []
for (const f of ['legends_m', 'legends_f', 'top_m', 'top_f']) {
  const file = `athletes_singles_v3_${f}.json`
  if (!existsSync(`${R}/${file}`)) { errors.push(`falta ${file}`); continue }
  for (const a of read(file).athletes.filter((x) => x.verified === true)) {
    if (ids.has(a.id) || names.has(norm(a.name_en))) errors.push(`${file}: ${a.id} ya existe`)
    if (typeof a.height_cm !== 'number') errors.push(`${a.id}: sin altura`)
    if (!STYLES.includes(a.style_primary)) errors.push(`${a.id}: estilo ${a.style_primary}`)
    if (!['M', 'F'].includes(a.gender)) errors.push(`${a.id}: sexo`)
    if (!a.sources?.length) errors.push(`${a.id}: sin fuentes`)
    ids.add(a.id); names.add(norm(a.name_en)); fresh.push(a.id)
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
```

Run: `node scripts/check-research-v3.mjs`
Expected: FAIL. Lista «falta athletes_singles_v3_…» y «sin rasgos» para los 81 jugadores.

- [ ] **Step 3: Workflow A — jugadores (4 investigadores y 4 verificadores)**

Antes de escribir el script, cargar el skill `workflow-authoring`. El script se basa en `docs/superpowers/research/research-workflow.js` y reutiliza sus bloques `COMMON` y `ATHLETE_FIELDS`, con `args: { dir: '<ruta absoluta>/docs/superpowers/research', today: '2026-10-04' }`.

- **Fase Research (4 en paralelo).** Cada agente escribe su archivo `athletes_singles_v3_*.json`. A cada uno se le pasa la lista de los 81 `id` y `nameEn` actuales para que no los repita.
  - `legends_m`: Rudy Hartono, Liem Swie King, Morten Frost, Prakash Padukone, Zhao Jianhua, Yang Yang, Joko Supriyanto, Poul-Erik Høyer Larsen, Hendrawan, Sun Jun, Park Sung-hwan, Sony Dwi Kuncoro, Chen Jin, Du Pengyu, Son Wan-ho.
  - `legends_f`: Li Lingwei, Han Aiping, Tang Jiuhong, Bang Soo-hyun, Ye Zhaoying, Gong Zhichao, Camilla Martin, Mia Audina, Gong Ruina, Zhou Mi, Zhu Lin, Tine Baun, Wang Lin, Wang Xin, Sung Ji-hyun.
  - `top_m` / `top_f`: abrir el ranking BWF de individual vigente a 2026-10-04 (bwfbadminton.com) y añadir cada jugador del top 30 que no esté ya en la app.
  - Si una leyenda no tiene altura de fuente fiable, se queda fuera y se anota en `notes` del archivo.
- **Fase Verify (4 en paralelo, uno por archivo).** Cada verificador:
  - comprueba de forma adversarial altura, peso, estado, año de retirada, estilo, nombre chino y `highlights`;
  - corrige en el propio archivo y marca `verified: true/false` con `verification_note`.

- [ ] **Step 4: Workflow B — rasgos y traducciones (4 de rasgos, 2 verificadores y 1 traductor)**

- **Fase Tag (4 en paralelo):**
  - grupos: hombres actuales, mujeres actuales, hombres nuevos y mujeres nuevas;
  - cada jugador recibe 2–3 rasgos del vocabulario `power, deception, net, defense, stamina, speed, placement, fight`, ordenados de más a menos característico;
  - cada uno lleva `evidence_zh` (1–2 frases) y `sources`, que son URLs abiertas de verdad: perfiles de la BWF, Olympics.com, análisis o prensa especializada;
  - el agente lee también `desc.zh` y `signature_skills_zh`;
  - cada agente escribe `traits_part_<grupo>.json`.
- **Fase Verify (2: hombres y mujeres):**
  - revisa cada etiqueta contra las fuentes, la corrige si hace falta y pone `verified: true`;
  - comprueba que el primer rasgo sea de verdad el sello del jugador;
  - para jugadores del mismo estilo, que los rasgos los distingan (no todos `placement`).
- **Fase Translate (1):** traduce al español `highlights_zh` y `style_desc_zh` de los jugadores nuevos verificados y escribe `translations_es.json`. Mismo registro que `src/data/athletes-singles.json`: frases completas, nombres de torneos en español y nada de caracteres chinos.
- **Fusión (yo, al terminar):**

```bash
node -e '
const fs=require("fs");const R="docs/superpowers/research";const out={};
for (const f of fs.readdirSync(R).filter(f=>/^traits_part_.*\.json$/.test(f))) Object.assign(out, JSON.parse(fs.readFileSync(R+"/"+f,"utf8")));
fs.writeFileSync(R+"/traits_singles.json", JSON.stringify(out,null,2)+"\n"); console.log(Object.keys(out).length)'
```

- [ ] **Step 5: Comprobar**

Run: `node scripts/check-research-v3.mjs`
Expected:
- `OK`, con unos 40–50 jugadores nuevos verificados y unos 120–130 en total.
- Si sale algún error, corregir el archivo afectado: preguntar al verificador o quitar el jugador si no tiene fuente.
- No inventar datos.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/research scripts/check-research-v3.mjs
git commit -m "research(v3): legends + current top-30 singles, verified traits for every player, es translations

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Motor — 12 preguntas y vector de rasgos

**Files:**
- Modify: `src/engine/prefs.ts`
- Create: `src/engine/traits.ts`
- Test: `src/engine/prefs.test.ts` (modificar) y `src/engine/traits.test.ts` (nuevo)

**Interfaces:**
- Produces (en `prefs.ts`):
  - `CORE_PREF_KEYS` (las 6 de la v2) y `PREF_KEYS` (las 12);
  - `PrefKey`;
  - `Prefs`: las 6 core son obligatorias y las 6 nuevas opcionales;
  - `SINGLES_POINTS` (exportado);
  - `singlesPreference`, `preferredStyle`, `doublesPreference`;
  - `isPrefs`: acepta objetos v2 de 6 claves.
- Produces (en `traits.ts`):
  - `TRAIT_KEYS`, `Trait`, `TraitVector = Record<Trait, number>` y `TRAIT_POINTS`;
  - `userTraits(prefs: Prefs | undefined): TraitVector`;
  - `topTraits(v: TraitVector, n = 3): Trait[]`;
  - `athleteTraitVector(traits: readonly Trait[]): TraitVector`;
  - `traitSimilarity(u: TraitVector, a: TraitVector): number`;
  - `isTrait(x: unknown): x is Trait`.

- [ ] **Step 1: Tests que fallan — `src/engine/traits.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { PREF_KEYS, PREF_OPTIONS, type Prefs } from './prefs'
import { athleteTraitVector, isTrait, TRAIT_KEYS, TRAIT_POINTS, topTraits, traitSimilarity, userTraits } from './traits'

const CORE: Prefs = { scoring: 'rally', midcourt: 'push', tempo: 'adapt', underAttack: 'lift', rally: 'either', doublesSpot: 'none' }

describe('rasgos (球风特点)', () => {
  it('8 rasgos en orden fijo', () => {
    expect(TRAIT_KEYS).toEqual(['power', 'deception', 'net', 'defense', 'stamina', 'speed', 'placement', 'fight'])
    expect(isTrait('net')).toBe(true)
    expect(isTrait('smash')).toBe(false)
  })
  it('cada opción de cada pregunta tiene puntos de rasgo válidos', () => {
    for (const k of PREF_KEYS) {
      for (const o of PREF_OPTIONS[k]) {
        const pts = TRAIT_POINTS[k][o]
        expect(pts, `${k}.${o}`).toBeDefined()
        for (const t of Object.keys(pts)) expect(isTrait(t), `${k}.${o}.${t}`).toBe(true)
      }
    }
  })
  it('sin gustos: vector a cero y sin rasgos principales', () => {
    const v = userTraits(undefined)
    for (const t of TRAIT_KEYS) expect(v[t]).toBe(0)
    expect(topTraits(v)).toEqual([])
  })
  it('quien elige engaño y fintas frecuentes tiene el engaño como primer rasgo', () => {
    const v = userTraits({ ...CORE, signature: 'deception', feints: 'often' })
    expect(topTraits(v)[0]).toBe('deception')
  })
  it('un registro v2 (6 respuestas) da rasgos sin fallar', () => {
    const v = userTraits({ scoring: 'smash', midcourt: 'smash', tempo: 'fast', underAttack: 'drive', rally: 'short', doublesSpot: 'back' })
    expect(topTraits(v)[0]).toBe('power')
    for (const t of TRAIT_KEYS) expect(Number.isFinite(v[t])).toBe(true)
  })
  it('topTraits: como mucho n, solo > 0, empates por el orden del vocabulario', () => {
    const v = { power: 1, deception: 0, net: 1, defense: 0, stamina: 3, speed: 0, placement: 0, fight: 0 }
    expect(topTraits(v)).toEqual(['stamina', 'power', 'net'])
    expect(topTraits(v, 1)).toEqual(['stamina'])
  })
  it('vector del jugador: 1, 0.7 y 0.5 por orden', () => {
    const a = athleteTraitVector(['deception', 'net', 'speed'])
    expect(a.deception).toBe(1)
    expect(a.net).toBe(0.7)
    expect(a.speed).toBe(0.5)
    expect(a.power).toBe(0)
  })
  it('similitud coseno entre 0 y 1; 0 si el usuario no tiene puntos', () => {
    const a = athleteTraitVector(['deception', 'net'])
    expect(traitSimilarity(a, a)).toBeCloseTo(1)
    expect(traitSimilarity(athleteTraitVector(['power', 'fight']), a)).toBe(0)
    expect(traitSimilarity(userTraits(undefined), a)).toBe(0)
  })
})
```

- [ ] **Step 2: Añadir a `src/engine/prefs.test.ts`**

Sustituir el test `'6 preguntas con sus opciones'` y añadir los demás:

```ts
  it('12 preguntas: las 6 de la v2 primero', () => {
    expect(CORE_PREF_KEYS).toEqual(['scoring', 'midcourt', 'tempo', 'underAttack', 'rally', 'doublesSpot'])
    expect(PREF_KEYS).toEqual([...CORE_PREF_KEYS, 'signature', 'feints', 'footwork', 'decider', 'receive', 'behind'])
    for (const k of PREF_KEYS) expect(PREF_OPTIONS[k].length).toBeGreaterThanOrEqual(3)
  })
  it('scoring sigue siendo la pregunta de más peso (3); las demás dan como mucho 2', () => {
    for (const k of PREF_KEYS.filter((x) => x !== 'scoring')) {
      for (const pts of Object.values(SINGLES_POINTS[k])) for (const p of Object.values(pts)) expect(p).toBeLessThanOrEqual(2)
    }
  })
  it('las preguntas nuevas suman al estilo', () => {
    const wall: Prefs = { ...GRINDER, scoring: 'counter', signature: 'retrieve', feints: 'rarely', footwork: 'reach', decider: 'fight', receive: 'deep', behind: 'persist' }
    expect(preferredStyle(wall)).toBe('counter')
    const trick: Prefs = { ...ATTACKER, scoring: 'net', midcourt: 'drop', signature: 'netShot', feints: 'often', receive: 'netReply' }
    expect(preferredStyle(trick)).toBe('net')
  })
  it('isPrefs: acepta v2 (6) y v3 (12); rechaza respuestas inválidas', () => {
    expect(isPrefs(ATTACKER)).toBe(true)
    expect(isPrefs({ ...ATTACKER, signature: 'smash', feints: 'often', footwork: 'explosive', decider: 'finish', receive: 'rush', behind: 'attack' })).toBe(true)
    expect(isPrefs({ ...ATTACKER, signature: 'foo' })).toBe(false)
    const { tempo: _t, ...noTempo } = ATTACKER
    expect(isPrefs(noTempo)).toBe(false)
  })
```

Actualizar el import: `import { CORE_PREF_KEYS, doublesPreference, isPrefs, PREF_KEYS, PREF_OPTIONS, preferredStyle, SINGLES_POINTS, singlesPreference, type Prefs } from './prefs'`.

- [ ] **Step 3: Ejecutar y ver que fallan**

Run: `npx vitest run src/engine/prefs.test.ts src/engine/traits.test.ts`
Expected: FAIL. `traits.ts` no existe, ni `CORE_PREF_KEYS` ni `SINGLES_POINTS` exportado.

- [ ] **Step 4: Implementar `src/engine/prefs.ts`**

Cambia la cabecera de tipos, los puntos, el bucle y `isPrefs`; el resto se queda igual:

```ts
/** Preguntas de 球风偏好 (gustos de juego) y sus opciones. El texto vive en content/{zh,es}/talent.ts. */
export const PREF_OPTIONS = {
  scoring: ['smash', 'net', 'rally', 'counter'],
  midcourt: ['smash', 'drop', 'push'],
  tempo: ['fast', 'grind', 'adapt'],
  underAttack: ['drive', 'block', 'lift'],
  rally: ['short', 'long', 'either'],
  doublesSpot: ['front', 'back', 'rotate', 'none'],
  // v3 (spec §17.2)
  signature: ['smash', 'deception', 'netShot', 'retrieve', 'placement'],
  feints: ['often', 'sometimes', 'rarely'],
  footwork: ['explosive', 'reach', 'anticipate'],
  decider: ['steady', 'fight', 'finish'],
  receive: ['rush', 'netReply', 'deep'],
  behind: ['change', 'persist', 'attack'],
} as const
export type PrefKey = keyof typeof PREF_OPTIONS
/** Las 6 de la v2: obligatorias también en registros guardados. */
export const CORE_PREF_KEYS = ['scoring', 'midcourt', 'tempo', 'underAttack', 'rally', 'doublesSpot'] as const
type CorePrefKey = (typeof CORE_PREF_KEYS)[number]
type Answer<K extends PrefKey> = (typeof PREF_OPTIONS)[K][number]
/** Las 6 nuevas faltan en los registros de la v2: cuentan como sin responder. */
export type Prefs = { [K in CorePrefKey]: Answer<K> } & { [K in Exclude<PrefKey, CorePrefKey>]?: Answer<K> }
export const PREF_KEYS = Object.keys(PREF_OPTIONS) as PrefKey[]

// Puntos que cada respuesta da a cada estilo de individual.
export const SINGLES_POINTS: { [K in PrefKey]: Record<string, Partial<Record<SinglesStyle, number>>> } = {
  // La forma favorita de ganar el punto es la señal más directa del estilo: vale 3.
  scoring: { smash: { attack: 3 }, net: { net: 3 }, rally: { control: 3 }, counter: { counter: 3 } },
  midcourt: { smash: { attack: 1, speed: 1 }, drop: { net: 1, control: 1 }, push: { control: 1, counter: 1 } },
  tempo: { fast: { speed: 2, attack: 1 }, grind: { control: 2, counter: 1 }, adapt: { allround: 2 } },
  underAttack: { drive: { counter: 2, speed: 1 }, block: { net: 1, counter: 1 }, lift: { control: 1, allround: 1 } },
  rally: { short: { attack: 1, speed: 1 }, long: { control: 1, counter: 1 }, either: { allround: 2 } },
  doublesSpot: { front: {}, back: {}, rotate: {}, none: {} },
  signature: { smash: { attack: 2 }, deception: { allround: 1, net: 1 }, netShot: { net: 2 }, retrieve: { counter: 2 }, placement: { control: 2 } },
  feints: { often: { allround: 1, net: 1 }, sometimes: {}, rarely: {} },
  footwork: { explosive: { speed: 2 }, reach: { counter: 1, allround: 1 }, anticipate: { control: 1, allround: 1 } },
  decider: { steady: { control: 1, counter: 1 }, fight: { counter: 1 }, finish: { attack: 1 } },
  receive: { rush: { speed: 1, net: 1 }, netReply: { net: 1 }, deep: { control: 1 } },
  behind: { change: { allround: 2 }, persist: { control: 1, counter: 1 }, attack: { attack: 1 } },
}
```

En `singlesPreference` el bucle salta las preguntas sin responder:

```ts
  for (const k of PREF_KEYS) {
    const answer = prefs[k]
    if (answer === undefined) continue
    const add = SINGLES_POINTS[k][answer] ?? {}
    for (const [s, p] of Object.entries(add)) pts[s as SinglesStyle] += p
  }
```

`isPrefs`:

```ts
export function isPrefs(x: unknown): x is Prefs {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  const valid = (k: PrefKey) => (PREF_OPTIONS[k] as readonly unknown[]).includes(o[k])
  return CORE_PREF_KEYS.every(valid) && PREF_KEYS.every((k) => o[k] === undefined || valid(k))
}
```

- [ ] **Step 5: Crear `src/engine/traits.ts`**

```ts
import { PREF_KEYS, type PrefKey, type Prefs } from './prefs'

/** Vocabulario fijo de rasgos (spec §17.3). El orden decide los empates. */
export const TRAIT_KEYS = ['power', 'deception', 'net', 'defense', 'stamina', 'speed', 'placement', 'fight'] as const
export type Trait = (typeof TRAIT_KEYS)[number]
export type TraitVector = Record<Trait, number>

// Puntos de rasgo de cada respuesta (spec §17.3). doublesSpot no dice nada del individual.
export const TRAIT_POINTS: { [K in PrefKey]: Record<string, Partial<TraitVector>> } = {
  scoring: { smash: { power: 2 }, net: { net: 2 }, rally: { stamina: 1, placement: 1 }, counter: { defense: 2 } },
  midcourt: { smash: { power: 1 }, drop: { placement: 1 }, push: { placement: 1 } },
  tempo: { fast: { speed: 1 }, grind: { stamina: 1 }, adapt: {} },
  underAttack: { drive: { speed: 1 }, block: { defense: 1 }, lift: { defense: 1 } },
  rally: { short: { power: 1 }, long: { stamina: 1 }, either: {} },
  doublesSpot: { front: {}, back: {}, rotate: {}, none: {} },
  signature: { smash: { power: 2 }, deception: { deception: 2 }, netShot: { net: 2 }, retrieve: { defense: 2 }, placement: { placement: 2 } },
  feints: { often: { deception: 2 }, sometimes: { deception: 1 }, rarely: {} },
  footwork: { explosive: { speed: 2 }, reach: { defense: 1, stamina: 1 }, anticipate: { placement: 1 } },
  decider: { steady: { stamina: 2 }, fight: { fight: 2 }, finish: { power: 1 } },
  receive: { rush: { speed: 1, net: 1 }, netReply: { net: 1 }, deep: { placement: 1 } },
  behind: { change: { deception: 1, placement: 1 }, persist: { stamina: 1 }, attack: { power: 1, fight: 1 } },
}

const ATHLETE_WEIGHTS = [1, 0.7, 0.5]

const zero = (): TraitVector => Object.fromEntries(TRAIT_KEYS.map((t) => [t, 0])) as TraitVector

export function isTrait(x: unknown): x is Trait {
  return (TRAIT_KEYS as readonly unknown[]).includes(x)
}

/** Puntos de rasgo del usuario. Las preguntas sin responder (registros antiguos) no suman. */
export function userTraits(prefs: Prefs | undefined): TraitVector {
  const v = zero()
  if (!prefs) return v
  for (const k of PREF_KEYS) {
    const answer = prefs[k]
    if (answer === undefined) continue
    for (const [t, p] of Object.entries(TRAIT_POINTS[k][answer] ?? {})) v[t as Trait] += p
  }
  return v
}

/** Los n rasgos con más puntos (> 0); los empates siguen el orden de TRAIT_KEYS. */
export function topTraits(v: TraitVector, n = 3): Trait[] {
  return TRAIT_KEYS.filter((t) => v[t] > 0)
    .sort((a, b) => v[b] - v[a] || TRAIT_KEYS.indexOf(a) - TRAIT_KEYS.indexOf(b))
    .slice(0, n)
}

/** El primer rasgo es el sello del jugador: pesa 1; el segundo 0,7; el tercero 0,5. */
export function athleteTraitVector(traits: readonly Trait[]): TraitVector {
  const v = zero()
  traits.forEach((t, i) => (v[t] = ATHLETE_WEIGHTS[i] ?? 0))
  return v
}

/** Similitud coseno (0–1). 0 si alguno de los dos vectores está a cero. */
export function traitSimilarity(u: TraitVector, a: TraitVector): number {
  let dot = 0
  let nu = 0
  let na = 0
  for (const t of TRAIT_KEYS) {
    dot += u[t] * a[t]
    nu += u[t] * u[t]
    na += a[t] * a[t]
  }
  return nu === 0 || na === 0 ? 0 : dot / Math.sqrt(nu * na)
}
```

- [ ] **Step 6: Ejecutar y ver que pasan**

Run: `npx vitest run src/engine && npm run typecheck`
Expected:
- Los tests nuevos pasan.
- `typecheck` puede fallar en `src/content/*/talent.ts` porque falta el texto de las 6 preguntas nuevas: es lo esperado y lo resuelve la Tarea 3.
- No puede fallar en `src/engine`.
- Los demás tests de `src/engine` siguen pasando, porque las 6 respuestas de la v2 dan los mismos puntos.

- [ ] **Step 7: Commit**

```bash
git add src/engine/prefs.ts src/engine/prefs.test.ts src/engine/traits.ts src/engine/traits.test.ts
git commit -m "feat(engine): 12 preference questions and trait vector (spec §17.2–17.3)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Textos zh/es de las preguntas y los rasgos, y formulario de 12 preguntas

**Files:**
- Modify: `src/content/types.ts`, `src/content/zh/talent.ts`, `src/content/es/talent.ts`
- Test: `src/pages/talent/TalentForm.test.tsx`, `src/engine/validate.test.ts`
- `TalentForm.tsx`, `validate.ts` y `storage.ts` no cambian, porque ya recorren `PREF_KEYS` y usan `isPrefs`. Lo confirman los tests.

**Interfaces:**
- Consumes: `PREF_KEYS`, `PREF_OPTIONS` y `Trait` (Tarea 2).
- Produces:
  - `TalentContent.traits: Record<Trait, string>`;
  - `TalentContent.report.sharedTraits: string`;
  - `TalentContent.report.signatureTraits: Record<Sex, string>`.

- [ ] **Step 1: Tests que fallan**

En `src/engine/validate.test.ts`, `goldenForm().prefs` pasa a tener las 12 respuestas:

```ts
  prefs: { scoring: 'rally', midcourt: 'push', tempo: 'grind', underAttack: 'lift', rally: 'long', doublesSpot: 'front', signature: 'placement', feints: 'sometimes', footwork: 'anticipate', decider: 'steady', receive: 'deep', behind: 'persist' },
```

Se actualiza el `toEqual` de la línea 29 con el mismo objeto y se añade:

```ts
  it('las 6 preguntas nuevas también son obligatorias', () => {
    const r = validateTalentForm({ ...goldenForm(), prefs: { ...goldenForm().prefs, signature: '', behind: '' } })
    expect(r.input).toBeNull()
    expect(r.errors.signature).toBe('required')
    expect(r.errors.behind).toBe('required')
  })
```

En `src/pages/talent/TalentForm.test.tsx`, `fillGolden` responde las 12 preguntas:

```ts
  const prefs = { scoring: 'rally', midcourt: 'push', tempo: 'grind', underAttack: 'lift', rally: 'long', doublesSpot: 'front', signature: 'placement', feints: 'sometimes', footwork: 'anticipate', decider: 'steady', receive: 'deep', behind: 'persist' } as const
```

El umbral del test de envío vacío pasa de `toBeGreaterThanOrEqual(19)` a `toBeGreaterThanOrEqual(25)`.

El objeto de 12 respuestas de arriba pasa a ser una constante de módulo, `PREFS_12`, y `fillGolden` gana un parámetro: `fillGolden(weight = '51', prefKeys: readonly string[] = Object.keys(PREFS_12))`. Test nuevo:

```ts
  it('con solo las 6 preguntas antiguas, marca las nuevas y lleva el foco a la primera', async () => {
    renderApp('/talent')
    const u = await fillGolden('51', ['scoring', 'midcourt', 'tempo', 'underAttack', 'rally', 'doublesSpot'])
    await u.click(screen.getByRole('button', { name: c.form.submit }))
    expect(screen.getAllByText(c.form.errors.required)).toHaveLength(6)
    expect(document.activeElement?.closest('#pref-signature')).not.toBeNull()
  })
```

Dentro de `fillGolden`, el bucle solo recorre `prefKeys`: `for (const k of prefKeys) { const v = PREFS_12[k as keyof typeof PREFS_12]; … }`.

En `src/content/content.test.ts`, dentro de `describe('chino')`, se añade:

```ts
  it('los 8 rasgos tienen nombre en los dos idiomas y el español no lleva chino', () => {
    for (const t of TRAIT_KEYS) {
      expect(talentZh.traits[t]).toMatch(HAN)
      expect(talentEs.traits[t]).not.toMatch(HAN)
    }
  })
```

Con `import { TRAIT_KEYS } from '../engine/traits'`.

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npx vitest run src/engine/validate.test.ts src/pages/talent/TalentForm.test.tsx src/content`
Expected: FAIL. `c.prefs.signature` y `talentZh.traits` no existen.

- [ ] **Step 3: Tipos — `src/content/types.ts`**

`prefs` ya se tipa sobre `PrefKey`, así que TypeScript exigirá las 6 entradas nuevas. Hay que añadir:

```ts
import type { Trait } from '../engine/traits'
// …dentro de TalentContent, después de prefs:
  /** Nombre corto de cada rasgo (球风特点) */
  traits: Record<Trait, string>
// …dentro de report, después de bodyMirror:
    /** Etiqueta de los rasgos que comparten el usuario y su espejo de estilo */
    sharedTraits: string
    /** Etiqueta de los rasgos del jugador cuando no comparten ninguno */
    signatureTraits: Record<Sex, string>
```

- [ ] **Step 4: Textos — `src/content/zh/talent.ts`**

Dentro de `prefs`, después de `doublesSpot`:

```ts
    signature: { question: '你最想拥有哪一拍武器？', options: { smash: '重杀跳杀', deception: '假动作骗过对手', netShot: '网前搓放勾对角', retrieve: '接住所有杀球', placement: '吊劈压线打四角' } },
    feints: { question: '打球时你会故意做假动作吗？', options: { often: '经常，骗到对手很爽', sometimes: '偶尔', rarely: '很少，打实在的球' } },
    footwork: { question: '你的步法更像…', options: { explosive: '启动快、抢点早', reach: '步子大、覆盖面广', anticipate: '跑得不多，靠预判站位' } },
    decider: { question: '决胜局体力下降时，你通常…', options: { steady: '越打越稳、少失误', fight: '咬牙拼每一分', finish: '抓机会尽快结束' } },
    receive: { question: '接发球时你更想…', options: { rush: '抢网扑球', netReply: '放网或搓网', deep: '推挑后场先稳住' } },
    behind: { question: '比分落后时你会…', options: { change: '改变节奏和打法', persist: '坚持打法慢慢磨', attack: '加强进攻主动冒险' } },
```

Después de `prefs`:

```ts
  traits: { power: '重杀', deception: '假动作', net: '网前手感', defense: '防守', stamina: '体能相持', speed: '速度步法', placement: '落点控制', fight: '斗志' },
```

En `report`, después de `bodyMirror`:

```ts
    sharedTraits: '共同特点',
    signatureTraits: { M: '他的招牌', F: '她的招牌' },
```

- [ ] **Step 5: Textos — `src/content/es/talent.ts`**

```ts
    signature: { question: '¿Qué golpe te gustaría tener como arma?', options: { smash: 'Remate potente o en salto', deception: 'Fintas que engañan al rival', netShot: 'Toque de red: dejada, cortada y cruzado', retrieve: 'Devolver todos los remates', placement: 'Dejadas y cortados a las líneas y a las cuatro esquinas' } },
    feints: { question: '¿Haces fintas a propósito cuando juegas?', options: { often: 'A menudo: engañar al rival me encanta', sometimes: 'A veces', rarely: 'Casi nunca: juego golpes directos' } },
    footwork: { question: 'Tu forma de moverte se parece más a…', options: { explosive: 'Salida explosiva: llego pronto al volante', reach: 'Zancada amplia: cubro mucha pista', anticipate: 'Corro poco: me anticipo y me coloco bien' } },
    decider: { question: 'En el set decisivo, cuando te fallan las fuerzas, sueles…', options: { steady: 'Jugar más seguro, con menos errores', fight: 'Apretar los dientes y pelear cada punto', finish: 'Buscar la ocasión de acabar cuanto antes' } },
    receive: { question: 'Al restar el saque prefieres…', options: { rush: 'Atacar en la red y matar', netReply: 'Responder con una dejada o un toque de red', deep: 'Mandarla al fondo y asegurar' } },
    behind: { question: 'Cuando vas perdiendo…', options: { change: 'Cambio de ritmo y de plan', persist: 'Sigo con mi juego y desgasto', attack: 'Ataco más y arriesgo' } },
```

```ts
  traits: { power: 'Remate potente', deception: 'Engaño', net: 'Toque de red', defense: 'Defensa', stamina: 'Resistencia', speed: 'Velocidad', placement: 'Colocación', fight: 'Garra' },
```

```ts
    sharedTraits: 'En común',
    signatureTraits: { M: 'Su sello', F: 'Su sello' },
```

- [ ] **Step 6: Ejecutar todo**

Run: `npx vitest run && npm run typecheck`
Expected: todo pasa. Si el test del foco falla porque el foco va a otro elemento, revisar cómo `TalentForm.tsx` construye `FOCUS_ORDER` (línea 27, `pref-${k}`). Ya recorre `PREF_KEYS`, así que debería apuntar a `#pref-signature`.

- [ ] **Step 7: Commit**

```bash
git add src/content src/engine/validate.test.ts src/pages/talent/TalentForm.test.tsx
git commit -m "feat(content): zh/es text for the 6 new questions and the 8 traits; form requires all 12

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Datos — rasgos en cada jugador y jugadores nuevos en la app

Depende de la Tarea 1.

**Files:**
- Modify: `src/data/athletes.ts` (tipo y validación), `scripts/import-athletes.mjs`, `src/data/athletes-singles.json` (regenerado)
- Modify (fixtures): `src/engine/mirror.test.ts`, `src/engine/mirror-v2.test.ts`
- Test: `src/data/athletes.test.ts`

**Interfaces:**
- Consumes: `Trait` e `isTrait` (Tarea 2) y los archivos de la Tarea 1.
- Produces: `Athlete.traits: Trait[]`, con 2–3 rasgos y el primero como sello.

- [ ] **Step 1: Tests que fallan — `src/data/athletes.test.ts`**

```ts
  it('cada jugador tiene 2–3 rasgos válidos y sin repetir', () => {
    for (const a of SINGLES) {
      expect(a.traits.length, a.id).toBeGreaterThanOrEqual(2)
      expect(a.traits.length, a.id).toBeLessThanOrEqual(3)
      expect(new Set(a.traits).size, a.id).toBe(a.traits.length)
      for (const t of a.traits) expect(isTrait(t), `${a.id}: ${t}`).toBe(true)
    }
  })
  it('no hay jugadores duplicados con otro id', () => {
    const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
    const names = SINGLES.map((a) => norm(a.nameEn))
    expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual([])
  })
  it('v3: al menos 55 por sexo y los 6 estilos en cada sexo', () => {
    for (const sex of ['M', 'F'] as const) {
      const xs = SINGLES.filter((a) => a.sex === sex)
      expect(xs.length).toBeGreaterThanOrEqual(55)
      expect(new Set(xs.map((a) => a.style)).size).toBe(6)
    }
  })
  it('incluye leyendas (spec §17.1)', () => {
    const ids = new Set(SINGLES.map((a) => a.id))
    expect(['morten-frost', 'ye-zhaoying'].filter((id) => ids.has(id))).toHaveLength(2)
  })
```

Con `import { isTrait } from '../engine/traits'`.

Para el test de leyendas, comprobar antes con `grep -o '"id": "[^"]*frost[^"]*"\|"id": "[^"]*zhaoying[^"]*"' docs/superpowers/research/athletes_singles_v3_*.json` qué ids reales salieron de la investigación y usar esos dos. Si Frost o Ye no pasaron la verificación, elegir otra leyenda que sí esté de cada sexo.

En `athleteErrors`, añadir una línea que también comprueba la validación de la ficha:

```ts
  if (!Array.isArray(a.traits) || a.traits.length < 2 || a.traits.length > 3 || new Set(a.traits).size !== a.traits.length || !a.traits.every(isTrait)) e.push(`${a.id}: rasgos inválidos`)
```

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npx vitest run src/data`
Expected: FAIL. `traits` es `undefined` y hay menos de 55 jugadores por sexo.

- [ ] **Step 3: Tipo — `src/data/athletes.ts`**

```ts
import type { Trait } from '../engine/traits'
import { isTrait } from '../engine/traits'
// en interface Athlete, después de style:
  /** 2–3 rasgos verificados; el primero es su sello (spec §17.3) */
  traits: Trait[]
```

Más la línea de `athleteErrors` del Step 1.

- [ ] **Step 4: Importador — `scripts/import-athletes.mjs`**

1. Leer los archivos v3 y las traducciones:

```js
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
```

2. En el `map` de individual:
   - `highlights` pasa a ser `{ zh: a.highlights_zh, es: esOf(prevSingles.get(a.id)?.highlights, a.highlights_zh, a.id, 'highlights') }`;
   - `desc` pasa a ser `{ zh: a.style_desc_zh, es: esOf(prevSingles.get(a.id)?.desc, a.style_desc_zh, a.id, 'desc') }`;
   - se añade `traits: traitsOf(a.id),` después de `style`.
3. Añadir a `COUNTRY_ES` los países que puedan salir con las leyendas:

```js
  荷兰: 'Países Bajos', 瑞典: 'Suecia', 俄罗斯: 'Rusia', 乌克兰: 'Ucrania', 土耳其: 'Turquía', 保加利亚: 'Bulgaria',
  比利时: 'Bélgica', 芬兰: 'Finlandia', 挪威: 'Noruega', 瑞士: 'Suiza', 巴西: 'Brasil', 澳大利亚: 'Australia',
  中国澳门: 'Macao (China)', 斯里兰卡: 'Sri Lanka', 以色列: 'Israel', 波兰: 'Polonia', 捷克: 'República Checa',
  爱沙尼亚: 'Estonia', 葡萄牙: 'Portugal', 意大利: 'Italia', 威尔士: 'Gales', 苏联: 'Unión Soviética',
```

4. Cambiar el comentario de cabecera: «Suma los archivos athletes_singles_new_*.json y athletes_singles_v3_*.json si existen. Pone los rasgos de traits_singles.json y el español de translations_es.json cuando no hay traducción previa.»

Run: `node scripts/import-athletes.mjs`
Expected:
- `singles: ~125, pairs: 36`.
- Si sale «País sin traducción: X», añadir X a `COUNTRY_ES` y repetir.
- Si sale «Sin rasgos verificados», volver a la Tarea 1, Step 4.

Run: `grep -c TRADUCIR src/data/athletes-singles.json`
Expected: `0`. Si no es 0, completar `translations_es.json` y repetir el import.

- [ ] **Step 5: Fixtures de tests que construyen jugadores**

En `src/engine/mirror.test.ts` y `src/engine/mirror-v2.test.ts`, la función `athlete(...)` devuelve también `traits: ['placement', 'stamina']`. En `mirror-v2.test.ts` se añade un parámetro final opcional `traits: Trait[] = ['placement', 'stamina']`, que usará la Tarea 5.

- [ ] **Step 6: Ejecutar todo**

Run: `npx vitest run && npm run typecheck`
Expected:
- Todo pasa.
- El test de variedad de `mirror-v2.test.ts` sigue cumpliendo los umbrales: con más jugadores, la variedad solo puede mejorar.
- Si algún test dorado cambia porque cambia el espejo, revisar que el nuevo espejo sea razonable y actualizar el valor esperado con un comentario.

- [ ] **Step 7: Commit**

```bash
git add src/data scripts/import-athletes.mjs src/engine/mirror.test.ts src/engine/mirror-v2.test.ts
git commit -m "feat(data): ~45 more singles players (legends + top 30) and verified traits for all

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Espejo de estilo con rasgos

**Files:**
- Modify: `src/engine/mirror.ts`, `src/engine/talent.ts`, `src/engine/constants.ts`
- Modify: `src/engine/talent.test.ts:8` y `src/engine/prefs.test.ts:46`: `engineVersion` pasa a 3
- Test: `src/engine/mirror-v3.test.ts` (nuevo)

**Interfaces:**
- Consumes: `userTraits`, `topTraits`, `athleteTraitVector`, `traitSimilarity`, `Trait` y `TraitVector` (Tarea 2); `Athlete.traits` (Tarea 4).
- Produces:
  - `MirrorUser.traits?: TraitVector`;
  - `SinglesMirror.shared: Trait[]`: rasgos principales del usuario que el jugador también tiene, en el orden del usuario;
  - `ENGINE_VERSION = 3`.

- [ ] **Step 1: Tests que fallan — `src/engine/mirror-v3.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import type { Athlete } from '../data/athletes'
import { findStyleMirrors, type MirrorUser } from './mirror'
import type { Prefs } from './prefs'
import { analyzeTalent } from './talent'
import { makeInput } from './testkit'
import { topTraits, userTraits, type Trait } from './traits'
import type { Level, Sex, SinglesStyle } from './types'

const L = { zh: 'x', es: 'x' }
const athlete = (id: string, style: SinglesStyle, traits: Trait[], h = 175, w: number | null = 70): Athlete => ({
  id, nameEn: id, nameZh: id, sex: 'M', country: L, heightCm: h, weightKg: w, hand: 'R', birthYear: 1995,
  status: 'active', retiredYear: null, style, traits, highlights: L, desc: L,
})
const CORE: Prefs = { scoring: 'net', midcourt: 'drop', tempo: 'adapt', underAttack: 'block', rally: 'either', doublesSpot: 'none' }
const user = (prefs?: Prefs): MirrorUser => ({ sex: 'M', heightCm: 175, bmi: 22.9, preference: 'all', hand: 'R', seed: 0, traits: userTraits(prefs) })
const STYLE = { top: 'net', runnerUp: 'control' } as const

describe('espejo de estilo con rasgos (spec §17.4)', () => {
  it('mismo estilo y cuerpo: gana quien comparte tus rasgos', () => {
    const pool = [athlete('basher', 'net', ['power', 'fight']), athlete('faker', 'net', ['deception', 'net'])]
    const trick = findStyleMirrors(user({ ...CORE, signature: 'deception', feints: 'often' }), STYLE, pool)
    expect(trick[0].athlete.id).toBe('faker')
    expect(trick[0].shared).toContain('deception')
    const power = findStyleMirrors(user({ ...CORE, scoring: 'smash', signature: 'smash', decider: 'finish', behind: 'attack' }), STYLE, pool)
    expect(power[0].athlete.id).toBe('basher')
  })
  it('el estilo manda: un jugador de otro estilo con tus mismos rasgos no gana al de tu estilo', () => {
    const pool = [athlete('same-style', 'net', ['power', 'fight']), athlete('other-style', 'attack', ['deception', 'net'])]
    const r = findStyleMirrors(user({ ...CORE, signature: 'deception', feints: 'often' }), STYLE, pool)
    expect(r[0].athlete.id).toBe('same-style')
    expect(r[0].shared).toEqual([])
  })
  it('sin gustos, los rasgos no cambian el orden y shared está vacío', () => {
    const pool = [athlete('far', 'net', ['deception', 'net'], 185, 80), athlete('near', 'net', ['power', 'fight'], 175, 70)]
    const r = findStyleMirrors({ ...user(), traits: undefined }, STYLE, pool)
    expect(r[0].athlete.id).toBe('near')
    expect(r[0].shared).toEqual([])
  })
})

describe('población (spec §17.7)', () => {
  const PERSONAS: Prefs[] = [
    { scoring: 'smash', midcourt: 'smash', tempo: 'fast', underAttack: 'drive', rally: 'short', doublesSpot: 'back', signature: 'smash', feints: 'rarely', footwork: 'explosive', decider: 'finish', receive: 'rush', behind: 'attack' },
    { scoring: 'net', midcourt: 'drop', tempo: 'adapt', underAttack: 'block', rally: 'either', doublesSpot: 'front', signature: 'deception', feints: 'often', footwork: 'anticipate', decider: 'steady', receive: 'netReply', behind: 'change' },
    { scoring: 'counter', midcourt: 'push', tempo: 'grind', underAttack: 'lift', rally: 'long', doublesSpot: 'none', signature: 'retrieve', feints: 'rarely', footwork: 'reach', decider: 'fight', receive: 'deep', behind: 'persist' },
    { scoring: 'rally', midcourt: 'drop', tempo: 'grind', underAttack: 'block', rally: 'long', doublesSpot: 'rotate', signature: 'placement', feints: 'sometimes', footwork: 'anticipate', decider: 'steady', receive: 'deep', behind: 'change' },
    { scoring: 'smash', midcourt: 'push', tempo: 'fast', underAttack: 'drive', rally: 'short', doublesSpot: 'front', signature: 'netShot', feints: 'sometimes', footwork: 'explosive', decider: 'fight', receive: 'rush', behind: 'attack' },
    { scoring: 'net', midcourt: 'drop', tempo: 'fast', underAttack: 'block', rally: 'short', doublesSpot: 'front', signature: 'netShot', feints: 'often', footwork: 'explosive', decider: 'finish', receive: 'netReply', behind: 'change' },
  ]
  const PATTERNS: Level[][] = [[3, 3, 3, 3, 3, 3, 3, 3], [4, 3, 2, 2, 3, 4, 2, 3], [2, 2, 4, 4, 3, 2, 4, 3], [2, 4, 4, 3, 4, 2, 3, 4], [3, 2, 3, 3, 4, 2, 2, 3]]
  const BODIES: Record<Sex, { h: number[]; w: number[] }> = {
    M: { h: [170, 173, 175, 178, 180], w: [64, 68, 72, 76] },
    F: { h: [156, 160, 163, 166, 170], w: [48, 52, 56, 60] },
  }
  it.each(['M', 'F'] as const)('%s: estilo principal o segundo, rasgos en común ≥ 70 %%, variedad', (sex) => {
    const count: Record<string, number> = {}
    let n = 0
    let withShared = 0
    for (const h of BODIES[sex].h) for (const w of BODIES[sex].w) for (const p of PATTERNS) for (const prefs of PERSONAS) {
      const r = analyzeTalent({ ...makeInput(sex, 28, h, w, null, 3, p), prefs })
      const m = r.mirrors.style[0]
      expect(m.styleMatch, `${h}/${w}`).not.toBe('none')
      if (m.shared.length > 0) withShared++
      expect(m.shared).toEqual(topTraits(userTraits(prefs)).filter((t) => m.athlete.traits.includes(t)))
      count[m.athlete.id] = (count[m.athlete.id] ?? 0) + 1
      n++
    }
    expect(withShared / n).toBeGreaterThanOrEqual(0.7)
    expect(Math.max(...Object.values(count)) / n).toBeLessThanOrEqual(0.12)
    expect(Object.keys(count).length).toBeGreaterThanOrEqual(25)
  })
})
```

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npx vitest run src/engine/mirror-v3.test.ts`
Expected: FAIL. `shared` es `undefined` y `MirrorUser` no tiene `traits`.

- [ ] **Step 3: Implementar — `src/engine/mirror.ts`**

```ts
import { athleteTraitVector, topTraits, traitSimilarity, type Trait, type TraitVector } from './traits'

export interface MirrorUser {
  // …campos actuales…
  /** Puntos de rasgo del usuario (spec §17.3). Sin gustos, undefined. */
  traits?: TraitVector
}
export interface SinglesMirror {
  // …campos actuales…
  /** Rasgos principales del usuario que el jugador también tiene, en el orden del usuario */
  shared: Trait[]
}

// Rasgos (spec §17.4): con 0,6 un jugador de tu estilo sin rasgos en común empata con uno del segundo estilo con tus rasgos.
const TRAIT_WEIGHT = 0.6
// Ventana de variedad del espejo de estilo: estrecha para que los rasgos se noten (antes 0,5).
const STYLE_WINDOW = 0.2

function sharedTraits(user: MirrorUser, athlete: Athlete): Trait[] {
  return user.traits ? topTraits(user.traits).filter((t) => athlete.traits.includes(t)) : []
}
```

En `findStyleMirrors`, dentro del `map`:

```ts
      const sim = user.traits ? traitSimilarity(user.traits, athleteTraitVector(athlete.traits)) : 0
      const distance =
        STYLE_DISTANCE[styleMatch] + TRAIT_WEIGHT * (1 - sim) + 0.35 * d + (athlete.status === 'active' ? 0 : INACTIVE_PENALTY) - lefty
      return { athlete, distance, heightDiff, bmiDiff, styleMatch, shared: sharedTraits(user, athlete) }
```

En `findBodyMirrors`, la distancia no cambia; solo se añade `shared: sharedTraits(user, athlete)` al objeto devuelto.

- [ ] **Step 4: Conectar — `src/engine/talent.ts` y `constants.ts`**

```ts
import { userTraits } from './traits'
// …
  const user = { sex: input.sex, heightCm: input.heightCm, bmi: body.bmi, preference: input.preference, hand: input.hand, seed: seedOf(input), traits: input.prefs ? userTraits(input.prefs) : undefined }
```

`constants.ts`: `export const ENGINE_VERSION = 3`. En `talent.test.ts:8` y `prefs.test.ts:46`, `toBe(2)` pasa a `toBe(3)`.

- [ ] **Step 5: Ejecutar y calibrar**

Run: `npx vitest run src/engine`
Expected: todo pasa. Si falla el test de población:
- Si falla «≥ 70 %»: subir `TRAIT_WEIGHT` de 0,1 en 0,1, hasta 0,9.
- Si falla «≤ 12 %» o «≥ 25»: subir `STYLE_WINDOW` de 0,05 en 0,05, hasta 0,35.
- Si falla `not.toBe('none')`: bajar `TRAIT_WEIGHT`.

Si hay que tocar alguno de los dos valores:
- anotar los valores finales en el comentario de la constante y en spec §17.4, con una línea «Calibrado: …»;
- nunca bajar los umbrales del test.

- [ ] **Step 6: Todo y commit**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

```bash
git add src/engine docs/superpowers/specs/2026-09-25-badminton-app-design.md
git commit -m "feat(mirror): style mirror weighs shared traits (spec §17.4); engine v3

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Informe — rasgos en la tarjeta del espejo

**Files:**
- Modify: `src/pages/talent/report/MirrorSection.tsx`, `src/styles/global.css`
- Test: `src/pages/talent/ReportPage.test.tsx`

**Interfaces:**
- Consumes: `SinglesMirror.shared` (Tarea 5), `c.traits`, `c.report.sharedTraits` y `c.report.signatureTraits` (Tarea 3).

- [ ] **Step 1: Tests que fallan — `src/pages/talent/ReportPage.test.tsx`**

```ts
describe('rasgos en el espejo de estilo (spec §17.5)', () => {
  const TRICK = { scoring: 'net', midcourt: 'drop', tempo: 'adapt', underAttack: 'block', rally: 'either', doublesSpot: 'front', signature: 'deception', feints: 'often', footwork: 'anticipate', decider: 'steady', receive: 'netReply', behind: 'change' } as const
  const seedRecord = (input: object, engineVersion = 3) =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...emptyState(), talent: [{ id: 't', createdAt: '2026-10-04T10:00:00.000Z', engineVersion, input }] }))

  it('muestra los rasgos en común o el sello del jugador', () => {
    seedRecord({ ...GOLDEN, prefs: TRICK })
    renderApp('/talent/report/t')
    const r = analyzeTalent({ ...GOLDEN, prefs: TRICK })
    const m = r.mirrors.style[0]
    const line = screen.getByTestId('mirror-traits').textContent!
    if (m.shared.length > 0) {
      expect(line).toContain(c.report.sharedTraits)
      for (const t of m.shared) expect(line).toContain(c.traits[t])
    } else {
      expect(line).toContain(c.report.signatureTraits[m.athlete.sex])
    }
    expect(document.body.textContent).not.toMatch(/NaN|undefined/)
  })
  it('registro v2 (6 gustos) y v1 (sin gustos) se abren sin errores', () => {
    for (const [input, v] of [[{ ...GOLDEN, prefs: { scoring: 'net', midcourt: 'drop', tempo: 'adapt', underAttack: 'block', rally: 'either', doublesSpot: 'back' } }, 2], [GOLDEN, 1]] as const) {
      seedRecord(input, v)
      const { unmount } = renderApp('/talent/report/t')
      expect(screen.getByTestId('mirror-traits')).toBeInTheDocument()
      expect(document.body.textContent).not.toMatch(/NaN|undefined/)
      unmount()
    }
  })
  it('en español los rasgos salen en español', async () => {
    seedRecord({ ...GOLDEN, prefs: TRICK })
    renderApp('/talent/report/t')
    await userEvent.click(screen.getByRole('button', { name: /ES|Español/ }))
    const line = screen.getByTestId('mirror-traits').textContent!
    expect(line).not.toMatch(/[一-鿿]/)
    expect(line.includes(talentEs.report.sharedTraits) || line.includes(talentEs.report.signatureTraits.F)).toBe(true)
  })
})
```

Antes de escribir el test, comprobar con `grep -n "ES\|Español" src/components/LanguageToggle.tsx src/components/*.tsx | head` el nombre accesible real del botón de idioma, y usar el mismo patrón que ya usen otros tests de `ReportPage.test.tsx` para cambiar de idioma. Comprobar también que `renderApp` devuelve `unmount`; si no lo devuelve, usar `cleanup()` de Testing Library.

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npx vitest run src/pages/talent/ReportPage.test.tsx`
Expected: FAIL. No existe el test id `mirror-traits`.

- [ ] **Step 3: Implementar — `MirrorSection.tsx`**

`SinglesMirrorCard` recibe una prop nueva, `showTraits: boolean`. Es `true` para el espejo de estilo y `false` para el de cuerpo. Después de `<AthleteMedia …/>`:

```tsx
      {showTraits && (
        <p className="trait-line" data-testid="mirror-traits">
          <strong>{mirror.shared.length > 0 ? r.sharedTraits : r.signatureTraits[a.sex]}</strong>
          {c.list.colon}
          {(mirror.shared.length > 0 ? mirror.shared : a.traits).map((t) => c.traits[t]).join(c.list.sep)}
        </p>
      )}
```

Las llamadas quedan así:

```tsx
      {styleTop && <SinglesMirrorCard mirror={styleTop} label={`🎯 ${r.singlesMirror}`} input={input} result={result} showTraits />}
      {bodyTop && <SinglesMirrorCard mirror={bodyTop} label={`📏 ${r.bodyMirror}`} input={input} result={result} showTraits={false} />}
```

`global.css`, junto a `.pref-note`:

```css
.trait-line { background: #f1f5ff; border-radius: 14px; padding: 8px 12px; margin: 0; }
```

- [ ] **Step 4: Ejecutar todo**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/talent/report/MirrorSection.tsx src/styles/global.css src/pages/talent/ReportPage.test.tsx
git commit -m "feat(report): style mirror card shows shared traits or the player's signature

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Verificación en el navegador, documentación y fusión

**Files:**
- Modify: `README.md` (número de jugadores), `CONTINUAR.md` (estado v3), spec §17 (números finales)
- Memoria: `badminton-app-status.md`

- [ ] **Step 1: Navegador.** Abrir el servidor de desarrollo con `preview_start` (configuración de `.claude/launch.json`) en una pestaña propia, a 375×812.
  1. Rellenar el test en zh con un perfil «engañador»: `signature = deception` y `feints = often`.
  2. Comprobar que:
     - salen 12 preguntas;
     - la tarjeta 🎯 muestra 共同特点 con 假动作;
     - no hay scroll horizontal;
     - no hay errores en la consola.
  3. Cambiar a es y repetir la comprobación.
  4. Repetir con un perfil «atacante» y ver que el espejo cambia.
  5. Hacer una captura como prueba y volver a `desktop`.
- [ ] **Step 2: Documentación.**
  - README: actualizar «81 jugadores» al total real.
  - CONTINUAR.md: añadir una línea de estado «v3 en `main` (N tests): 12 preguntas, 8 rasgos, N jugadores».
  - Spec §17.1: anotar el número real de jugadores nuevos.
  - Memoria: actualizar el estado.
- [ ] **Step 3: Revisión final.** Un revisor nuevo (agente) revisa toda la rama contra spec §17 y este plan. Antes de fusionar, se arregla lo que encuentre, cada arreglo con su test.
- [ ] **Step 4: Fusionar y subir**

```bash
npx vitest run && npm run typecheck && npm run build
git checkout main && git merge --no-ff feat/v3-rasgos -m "Merge v3: more players, 12 preference questions, traits in the style mirror

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git -c credential.helper='!gh auth git-credential' push origin main
git branch -d feat/v3-rasgos
```
