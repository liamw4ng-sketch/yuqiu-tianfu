
---

### Task 5: Datos verificados de jugadores (individual y parejas)

**Requiere:** que la investigación haya generado `docs/superpowers/research/athletes_singles.json` y `athletes_doubles.json`, y que su verificación haya terminado (cada registro con `verified` y `verification_note`). Si faltan, relanza el workflow de `docs/superpowers/research/research-workflow.js` (ver `CONTINUAR.md`) antes de empezar.

**Files:**
- Create: `src/data/athletes.ts`, `src/data/athletes-singles.json`, `src/data/athletes-doubles.json`
- Create: `scripts/import-athletes.mjs` (conversión de un solo uso)
- Test: `src/data/athletes.test.ts`

**Interfaces:**
- Consumes: `Sex`, `Hand`, `SinglesStyle`, `SINGLES_STYLES` de `src/engine/types.ts`.
- Produces:
  - tipos `Localized`, `Athlete`, `Position`, `DoublesPlayer`, `PairEvent`, `DoublesPair`;
  - `athleteErrors(a: Athlete): string[]` y `pairErrors(p: DoublesPair): string[]`;
  - `SINGLES: Athlete[]` y `PAIRS: DoublesPair[]`.

- [ ] **Step 1: Tipos y validación**

`src/data/athletes.ts`:

```ts
import { SINGLES_STYLES, type Hand, type Sex, type SinglesStyle } from '../engine/types'
import doublesRaw from './athletes-doubles.json'
import singlesRaw from './athletes-singles.json'

export interface Localized {
  zh: string
  es: string
}

export interface Athlete {
  id: string
  nameEn: string
  nameZh: string
  sex: Sex
  country: Localized
  heightCm: number
  weightKg: number | null
  hand: Hand | null
  birthYear: number | null
  status: 'active' | 'retired'
  retiredYear: number | null
  style: SinglesStyle
  highlights: Localized
  desc: Localized
}

export type Position = 'front' | 'back' | 'both'
export type PairEvent = 'MD' | 'WD' | 'XD'

export interface DoublesPlayer {
  nameEn: string
  nameZh: string
  sex: Sex
  heightCm: number
  weightKg: number | null
  hand: Hand | null
  position: Position
  role: Localized
}

export interface DoublesPair {
  id: string
  event: PairEvent
  pairZh: string
  pairEn: string
  country: Localized
  status: 'active' | 'retired' | 'split'
  highlights: Localized
  style: Localized
  players: [DoublesPlayer, DoublesPlayer]
}

const filled = (l: Localized | undefined) => !!l && l.zh.trim().length > 0 && l.es.trim().length > 0
const HAN = /[一-鿿]/
// "其他" contiene 他 pero no es un pronombre.
const HE = /(?<!其)他/
const SHE = /她/

function pronounErrors(sex: Sex, zh: string, where: string): string[] {
  if (sex === 'F' && HE.test(zh)) return [`${where}: usa 他 para una jugadora`]
  if (sex === 'M' && SHE.test(zh)) return [`${where}: usa 她 para un jugador`]
  return []
}

function bodyErrors(heightCm: number, weightKg: number | null, where: string): string[] {
  const e: string[] = []
  if (!(heightCm >= 145 && heightCm <= 215)) e.push(`${where}: altura fuera de rango`)
  if (weightKg !== null && !(weightKg >= 40 && weightKg <= 110)) e.push(`${where}: peso fuera de rango`)
  return e
}

export function athleteErrors(a: Athlete): string[] {
  const e: string[] = []
  if (!a.id || !a.nameEn || !a.nameZh) e.push(`${a.id}: faltan id o nombres`)
  if (a.sex !== 'M' && a.sex !== 'F') e.push(`${a.id}: sexo inválido`)
  if (!(SINGLES_STYLES as readonly string[]).includes(a.style)) e.push(`${a.id}: estilo inválido`)
  if (a.status === 'retired' && !(typeof a.retiredYear === 'number' && a.retiredYear <= 2026)) e.push(`${a.id}: retirado sin año`)
  if (a.status === 'active' && a.retiredYear !== null) e.push(`${a.id}: activo con año de retirada`)
  for (const [k, v] of Object.entries({ country: a.country, highlights: a.highlights, desc: a.desc })) {
    if (!filled(v)) e.push(`${a.id}: ${k} incompleto`)
  }
  if (a.desc && HAN.test(a.desc.es)) e.push(`${a.id}: desc.es contiene caracteres chinos`)
  e.push(...bodyErrors(a.heightCm, a.weightKg, a.id))
  if (a.desc) e.push(...pronounErrors(a.sex, a.desc.zh, a.id))
  return e
}

export function pairErrors(p: DoublesPair): string[] {
  const e: string[] = []
  if (!['MD', 'WD', 'XD'].includes(p.event)) e.push(`${p.id}: prueba inválida`)
  if (!['active', 'retired', 'split'].includes(p.status)) e.push(`${p.id}: estado inválido`)
  if (p.players.length !== 2) e.push(`${p.id}: no tiene 2 jugadores`)
  const sexes = p.players.map((x) => x.sex).sort().join('')
  const expected = { MD: 'MM', WD: 'FF', XD: 'FM' }[p.event]
  if (sexes !== expected) e.push(`${p.id}: sexos ${sexes} no cuadran con ${p.event}`)
  for (const [k, v] of Object.entries({ country: p.country, highlights: p.highlights, style: p.style })) {
    if (!filled(v)) e.push(`${p.id}: ${k} incompleto`)
  }
  p.players.forEach((x, i) => {
    const where = `${p.id}#${i}`
    if (!['front', 'back', 'both'].includes(x.position)) e.push(`${where}: posición inválida`)
    if (!filled(x.role)) e.push(`${where}: role incompleto`)
    e.push(...bodyErrors(x.heightCm, x.weightKg, where))
    e.push(...pronounErrors(x.sex, x.role.zh, where))
  })
  return e
}

export const SINGLES = singlesRaw as unknown as Athlete[]
export const PAIRS = doublesRaw as unknown as DoublesPair[]
```

- [ ] **Step 2: Escribir el test que falla**

`src/data/athletes.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { athleteErrors, pairErrors, PAIRS, SINGLES } from './athletes'

describe('jugadores de individual', () => {
  it('todos los registros son válidos', () => {
    expect(SINGLES.flatMap(athleteErrors)).toEqual([])
  })
  it('hay al menos 20 por sexo y los ids son únicos', () => {
    expect(SINGLES.filter((a) => a.sex === 'M').length).toBeGreaterThanOrEqual(20)
    expect(SINGLES.filter((a) => a.sex === 'F').length).toBeGreaterThanOrEqual(20)
    expect(new Set(SINGLES.map((a) => a.id)).size).toBe(SINGLES.length)
  })
  it('cubre cuerpos bajos y altos de cada sexo', () => {
    const f = SINGLES.filter((a) => a.sex === 'F').map((a) => a.heightCm)
    const m = SINGLES.filter((a) => a.sex === 'M').map((a) => a.heightCm)
    expect(Math.min(...f)).toBeLessThanOrEqual(163)
    expect(Math.max(...f)).toBeGreaterThanOrEqual(174)
    expect(Math.min(...m)).toBeLessThanOrEqual(175)
    expect(Math.max(...m)).toBeGreaterThanOrEqual(188)
  })
  it('los 6 estilos tienen al menos un representante', () => {
    expect(new Set(SINGLES.map((a) => a.style)).size).toBe(6)
  })
})

describe('parejas de dobles', () => {
  it('todas las parejas son válidas', () => {
    expect(PAIRS.flatMap(pairErrors)).toEqual([])
  })
  it('hay al menos 6 parejas por prueba y ids únicos', () => {
    for (const ev of ['MD', 'WD', 'XD'] as const) {
      expect(PAIRS.filter((p) => p.event === ev).length).toBeGreaterThanOrEqual(6)
    }
    expect(new Set(PAIRS.map((p) => p.id)).size).toBe(PAIRS.length)
  })
  it('hay jugadoras y jugadores de red y de fondo', () => {
    const players = PAIRS.flatMap((p) => p.players)
    for (const sex of ['M', 'F'] as const) {
      for (const pos of ['front', 'back'] as const) {
        expect(players.some((x) => x.sex === sex && x.position === pos)).toBe(true)
      }
    }
  })
})
```

- [ ] **Step 3: Ejecutar y ver que falla**

Run: `npx vitest run src/data`
Expected: FAIL (`Failed to resolve import "./athletes-doubles.json"`).

- [ ] **Step 4: Convertir la investigación**

Crea `scripts/import-athletes.mjs`. Lee los dos JSON de la investigación, se queda solo con los registros `verified === true` y escribe los dos archivos de `src/data/` con estas reglas:

| Investigación | App |
|---|---|
| `name_en`, `name_zh`, `gender` | `nameEn`, `nameZh`, `sex` |
| `country_zh` | `country.zh` (y `country.es` con la tabla de abajo) |
| `height_cm`, `weight_kg`, `handedness`, `birth_year` | `heightCm`, `weightKg` (null si falta), `hand` (null si falta), `birthYear` |
| `status`, `retired_year` | `status`, `retiredYear` (null si activo) |
| `style_primary` | `style`: 进攻压制型→`attack`, 四方拉吊控制型→`control`, 防守反击型→`counter`, 速度突击型→`speed`, 全面型→`allround`, 网前技巧型→`net` |
| `highlights_zh`, `style_desc_zh` | `highlights.zh`, `desc.zh` |
| parejas: `pair_name_zh`, `pair_name_en`, `pair_style_zh` | `pairZh`, `pairEn`, `style.zh` |
| jugadores: `typical_position`, `role_desc_zh` | `position`, `role.zh` |

Tabla de países (`country.es`): 中国→China, 中国台北→China Taipéi, 中国香港→Hong Kong (China), 印尼→Indonesia, 马来西亚→Malasia, 丹麦→Dinamarca, 日本→Japón, 韩国→Corea del Sur, 泰国→Tailandia, 印度→India, 西班牙→España, 新加坡→Singapur, 法国→Francia, 加拿大→Canadá, 英格兰→Inglaterra, 美国→Estados Unidos, 越南→Vietnam, 德国→Alemania.

El script deja los campos `.es` de `highlights`, `desc`, `style` y `role` con el valor `"TRADUCIR"`. Ejecútalo con `node scripts/import-athletes.mjs`.

Después **traduce a mano cada `"TRADUCIR"`** al español de España. Reglas:
- Mismo contenido que el chino.
- Terminología de bádminton: remate, clear, dejada, dejada cortada, red, drive, globo, defensa de remate, rotación, jugar en la red / en el fondo.
- Títulos como "campeona olímpica de Tokio 2020", "campeón del mundo 2023".

Comprueba que no queda ninguno con `grep -c TRADUCIR src/data/*.json`. Expected: `0` en los dos.

- [ ] **Step 5: Ejecutar y ver que pasa**

Run: `npx vitest run src/data && npm run typecheck`
Expected: PASS. Si un registro falla la validación (pronombre, rango, estado), corrígelo usando la investigación como fuente; nunca relajes el test.

- [ ] **Step 6: Commit**

```bash
git add src/data scripts/import-athletes.mjs
git commit -m "feat(data): verified singles players and doubles pairs (zh/es)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Motor — jugadores espejo

**Files:**
- Create: `src/engine/mirror.ts`
- Test: `src/engine/mirror.test.ts`

**Interfaces:**
- Consumes: tipos `Athlete`, `DoublesPair`, `PairEvent`, `Position` de `src/data/athletes.ts` (solo tipos: el test usa fixtures, así que esta tarea no depende de los datos reales); `bmiOf`.
- Produces:
  - `MirrorUser = { sex: Sex; heightCm: number; bmi: number; preference: Preference }` y `StyleMatch`;
  - `SinglesMirror = { athlete; distance; heightDiff; bmiDiff: number | null; styleMatch }`;
  - `DoublesMirror = { pair; playerIndex: 0 | 1; distance; heightDiff; bmiDiff: number | null }`;
  - `athleteBmi(heightCm, weightKg | null): number | null`;
  - `findSinglesMirrors(user, style: { top; runnerUp }, athletes, n = 3): SinglesMirror[]`;
  - `findDoublesMirrors(user, role: DoublesRole, pairs, n = 3): DoublesMirror[]`.
  - `heightDiff` y `bmiDiff` son **usuario − jugador**; la interfaz muestra el valor absoluto.

- [ ] **Step 1: Escribir el test que falla**

`src/engine/mirror.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { Athlete, DoublesPair, DoublesPlayer, Position } from '../data/athletes'
import { athleteBmi, findDoublesMirrors, findSinglesMirrors, type MirrorUser } from './mirror'
import type { Sex, SinglesStyle } from './types'

const L = { zh: 'x', es: 'x' }
const athlete = (id: string, sex: Sex, h: number, w: number | null, style: SinglesStyle, status: 'active' | 'retired' = 'active'): Athlete => ({
  id, nameEn: id, nameZh: id, sex, country: L, heightCm: h, weightKg: w, hand: 'R', birthYear: 1995,
  status, retiredYear: status === 'retired' ? 2024 : null, style, highlights: L, desc: L,
})
const player = (sex: Sex, h: number, w: number | null, position: Position): DoublesPlayer => ({
  nameEn: `${sex}${h}`, nameZh: `${sex}${h}`, sex, heightCm: h, weightKg: w, hand: 'R', position, role: L,
})
const pair = (id: string, event: DoublesPair['event'], a: DoublesPlayer, b: DoublesPlayer): DoublesPair => ({
  id, event, pairZh: id, pairEn: id, country: L, status: 'active', highlights: L, style: L, players: [a, b],
})

const user: MirrorUser = { sex: 'F', heightCm: 163, bmi: 19.2, preference: 'all' }

describe('findSinglesMirrors', () => {
  const list = [
    athlete('f-same-body-other-style', 'F', 163, 51, 'attack'),
    athlete('m-same-body', 'M', 163, 51, 'control'),
    athlete('f-taller', 'F', 170, 60, 'control'),
    athlete('f-twin', 'F', 163, 51, 'control'),
  ]
  it('solo mismo sexo, ordenados por cuerpo + estilo', () => {
    const r = findSinglesMirrors(user, { top: 'control', runnerUp: 'speed' }, list)
    expect(r.map((m) => m.athlete.id)).toEqual(['f-twin', 'f-same-body-other-style', 'f-taller'])
    expect(r[0].distance).toBeCloseTo(0, 6)
    expect(r[0].styleMatch).toBe('primary')
    expect(r[2].heightDiff).toBe(-7)
    expect(r[2].bmiDiff).toBe(-1.6)
  })
  it('peso desconocido → bmiDiff null y penalización fija de 1', () => {
    const r = findSinglesMirrors(user, { top: 'control', runnerUp: 'speed' }, [athlete('f-noweight', 'F', 163, null, 'control')])
    expect(r[0].bmiDiff).toBeNull()
    expect(r[0].distance).toBeCloseTo(1, 6)
  })
  it('a igualdad de cuerpo prefiere a quien sigue en activo', () => {
    const r = findSinglesMirrors(user, { top: 'control', runnerUp: 'speed' }, [
      athlete('a-retired', 'F', 163, 51, 'control', 'retired'),
      athlete('b-active', 'F', 163, 51, 'control'),
    ])
    expect(r[0].athlete.id).toBe('b-active')
  })
  it('athleteBmi', () => {
    expect(athleteBmi(163, 51)).toBe(19.2)
    expect(athleteBmi(163, null)).toBeNull()
  })
})

describe('findDoublesMirrors', () => {
  const wd = pair('wd', 'WD', player('F', 160, 50, 'front'), player('F', 170, 62, 'back'))
  const xd = pair('xd', 'XD', player('F', 163, 51, 'front'), player('M', 180, 75, 'back'))
  it('elige a la jugadora del mismo sexo cuya posición coincide con el rol', () => {
    const r = findDoublesMirrors(user, 'front', [wd, xd])
    expect(r[0].pair.id).toBe('xd')
    expect(r[0].playerIndex).toBe(0)
    expect(r.every((m) => m.pair.players[m.playerIndex].sex === 'F')).toBe(true)
  })
  it('con preferencia de dobles del mismo sexo, penaliza el mixto', () => {
    const r = findDoublesMirrors({ ...user, preference: 'doubles' }, 'front', [wd, xd])
    expect(r[0].pair.id).toBe('wd')
  })
  it('cada pareja aparece una sola vez', () => {
    const r = findDoublesMirrors(user, 'rotation', [wd])
    expect(r).toHaveLength(1)
  })
})
```

Notas de cálculo para el primer test de dobles:
- xd, jugadora 0: altura 0, IMC 0, posición 0, prueba 0 → distancia 0.
- wd, jugadora 0 (160/50, IMC 19.5): 3/6 + 0.3/1.5 = 0.7.

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npx vitest run src/engine/mirror.test.ts`
Expected: FAIL (`Failed to resolve import "./mirror"`).

- [ ] **Step 3: Implementar**

`src/engine/mirror.ts`:

```ts
import type { Athlete, DoublesPair, PairEvent, Position } from '../data/athletes'
import { bmiOf } from './body'
import type { DoublesRole, Preference, Sex, SinglesStyle } from './types'

export interface MirrorUser {
  sex: Sex
  heightCm: number
  bmi: number
  preference: Preference
}
export type StyleMatch = 'primary' | 'secondary' | 'none'
export interface SinglesMirror {
  athlete: Athlete
  distance: number
  heightDiff: number
  bmiDiff: number | null
  styleMatch: StyleMatch
}
export interface DoublesMirror {
  pair: DoublesPair
  playerIndex: 0 | 1
  distance: number
  heightDiff: number
  bmiDiff: number | null
}

const UNKNOWN_BMI_PENALTY = 1
const INACTIVE_PENALTY = 0.2
const STYLE_PENALTY: Record<StyleMatch, number> = { primary: 0, secondary: 0.5, none: 1 }
const POSITION_PENALTY: Record<DoublesRole, Record<Position, number>> = {
  front: { front: 0, both: 0.5, back: 2 },
  back: { back: 0, both: 0.5, front: 2 },
  rotation: { both: 0, front: 0.3, back: 0.3 },
}

export function athleteBmi(heightCm: number, weightKg: number | null): number | null {
  return weightKg == null ? null : bmiOf(heightCm, weightKg)
}

function bodyDistance(user: MirrorUser, heightCm: number, weightKg: number | null) {
  const bmi = athleteBmi(heightCm, weightKg)
  const heightDiff = user.heightCm - heightCm
  const bmiDiff = bmi == null ? null : Math.round((user.bmi - bmi) * 10) / 10
  const d = Math.abs(heightDiff) / 6 + (bmiDiff == null ? UNKNOWN_BMI_PENALTY : Math.abs(bmiDiff) / 1.5)
  return { heightDiff, bmiDiff, d }
}

function eventPenalty(event: PairEvent, user: MirrorUser): number {
  if (user.preference === 'mixed') return event === 'XD' ? 0 : 0.5
  if (user.preference === 'doubles') {
    const same: PairEvent = user.sex === 'M' ? 'MD' : 'WD'
    if (event === same) return 0
    return event === 'XD' ? 0.3 : 0.5
  }
  return 0
}

export function findSinglesMirrors(
  user: MirrorUser,
  style: { top: SinglesStyle; runnerUp: SinglesStyle },
  athletes: Athlete[],
  n = 3,
): SinglesMirror[] {
  return athletes
    .filter((a) => a.sex === user.sex)
    .map((athlete) => {
      const { heightDiff, bmiDiff, d } = bodyDistance(user, athlete.heightCm, athlete.weightKg)
      const styleMatch: StyleMatch = athlete.style === style.top ? 'primary' : athlete.style === style.runnerUp ? 'secondary' : 'none'
      const distance = d + STYLE_PENALTY[styleMatch] + (athlete.status === 'active' ? 0 : INACTIVE_PENALTY)
      return { athlete, distance, heightDiff, bmiDiff, styleMatch }
    })
    .sort((x, y) => x.distance - y.distance || x.athlete.id.localeCompare(y.athlete.id))
    .slice(0, n)
}

export function findDoublesMirrors(user: MirrorUser, role: DoublesRole, pairs: DoublesPair[], n = 3): DoublesMirror[] {
  const candidates: DoublesMirror[] = []
  for (const pair of pairs) {
    pair.players.forEach((p, i) => {
      if (p.sex !== user.sex) return
      const { heightDiff, bmiDiff, d } = bodyDistance(user, p.heightCm, p.weightKg)
      const distance =
        d + POSITION_PENALTY[role][p.position] + eventPenalty(pair.event, user) + (pair.status === 'active' ? 0 : INACTIVE_PENALTY)
      candidates.push({ pair, playerIndex: i as 0 | 1, distance, heightDiff, bmiDiff })
    })
  }
  candidates.sort((x, y) => x.distance - y.distance || x.pair.id.localeCompare(y.pair.id) || x.playerIndex - y.playerIndex)
  const seen = new Set<string>()
  const out: DoublesMirror[] = []
  for (const c of candidates) {
    if (seen.has(c.pair.id)) continue
    seen.add(c.pair.id)
    out.push(c)
    if (out.length === n) break
  }
  return out
}
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `npx vitest run src/engine/mirror.test.ts && npm run typecheck`
Expected: PASS. El typecheck necesita que exista `src/data/athletes.ts`. Si haces esta tarea antes que la 5, crea `src/data/athletes.ts` completo (Tarea 5, Step 1) y dos JSON con `[]`; los tests de datos fallarán hasta la Tarea 5, y es lo esperado.

- [ ] **Step 5: Commit**

```bash
git add src/engine/mirror.ts src/engine/mirror.test.ts
git commit -m "feat(engine): singles and doubles athlete mirrors

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Motor — ejercicios, validación del formulario y ensamblado del informe

**Files:**
- Create: `src/engine/drills.ts`, `src/engine/validate.ts`, `src/engine/talent.ts`
- Test: `src/engine/drills.test.ts`, `src/engine/validate.test.ts`, `src/engine/talent.test.ts`, `src/engine/talent.invariants.test.ts`

**Interfaces:**
- Consumes: todo lo anterior del motor; `SINGLES`, `PAIRS`, `Athlete`, `DoublesPair`.
- Produces:
  - `DRILLS`, `type DrillId`, `pickDrills(style, current): DrillId[]` (siempre 3, sin repetir);
  - `TalentFormValues`, `FormField`, `FieldErrorCode`, `WarningCode`, `RANGES`;
  - `emptyTalentForm(): TalentFormValues`, `parseNumber(raw: string): number | null` (NaN si es inválido);
  - `validateTalentForm(v): { input: TalentInput | null; errors: Partial<Record<FormField, FieldErrorCode>>; warnings: WarningCode[] }`;
  - `TalentResult`, `AthleteData`, `collectFlags(...)`;
  - `analyzeTalent(input: TalentInput, data?: AthleteData): TalentResult`.

- [ ] **Step 1: Escribir los tests que fallan**

`src/engine/drills.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DRILLS, pickDrills } from './drills'
import { ABILITY_KEYS, SINGLES_STYLES, type Scores } from './types'

const golden: Scores = { power: 4, endurance: 6, reaction: 2, netTouch: 4, speed: 4, rearCourt: 4, tactics: 2, mental: 6 }

describe('pickDrills', () => {
  it('perfil de referencia con estilo control', () => {
    expect(pickDrills('control', golden)).toEqual(['rallyControl', 'netSpinning', 'shadowFootwork'])
  })
  it('siempre 3 ejercicios distintos para cualquier estilo', () => {
    for (const style of SINGLES_STYLES) {
      const d = pickDrills(style, golden)
      expect(d).toHaveLength(3)
      expect(new Set(d).size).toBe(3)
    }
  })
  it('cada capacidad tiene al menos un ejercicio', () => {
    for (const k of ABILITY_KEYS) expect(DRILLS.some((d) => (d.targets as readonly string[]).includes(k))).toBe(true)
  })
})
```

`src/engine/validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { emptyTalentForm, parseNumber, validateTalentForm, type TalentFormValues } from './validate'

const goldenForm = (): TalentFormValues => ({
  ...emptyTalentForm(),
  sex: 'F', age: '24', heightCm: '163', weightKg: '51', wingspanCm: '164', yearsPlaying: '2',
  levels: { power: 2, endurance: 3, reaction: 1, netTouch: 2, speed: 2, rearCourt: 2, tactics: 1, mental: 3 },
})

describe('parseNumber', () => {
  it('acepta coma decimal española y espacios', () => {
    expect(parseNumber(' 51,5 ')).toBe(51.5)
    expect(parseNumber('1.5')).toBe(1.5)
  })
  it('vacío → null, texto → NaN', () => {
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('abc')).toBeNaN()
  })
})

describe('validateTalentForm', () => {
  it('formulario válido → TalentInput', () => {
    const r = validateTalentForm(goldenForm())
    expect(r.errors).toEqual({})
    expect(r.warnings).toEqual([])
    expect(r.input).toMatchObject({ sex: 'F', age: 24, heightCm: 163, weightKg: 51, wingspanCm: 164, yearsPlaying: 2 })
    expect(r.input?.tests).toEqual({ verticalJumpCm: null, ropeSkip1Min: null, cooper12MinM: null, rulerDropCm: null })
  })
  it('vacío → required en todos los obligatorios', () => {
    const r = validateTalentForm(emptyTalentForm())
    expect(r.input).toBeNull()
    for (const f of ['sex', 'age', 'heightCm', 'weightKg', 'yearsPlaying', 'power', 'mental'] as const) {
      expect(r.errors[f]).toBe('required')
    }
    expect(r.errors.wingspanCm).toBeUndefined()
  })
  it('números inválidos y fuera de rango', () => {
    const r = validateTalentForm({ ...goldenForm(), age: 'veinte', heightCm: '250', tests: { ...emptyTalentForm().tests, rulerDropCm: '60' } })
    expect(r.errors.age).toBe('number')
    expect(r.errors.heightCm).toBe('range')
    expect(r.errors.rulerDropCm).toBe('range')
  })
  it('coma decimal en peso y años', () => {
    const r = validateTalentForm({ ...goldenForm(), weightKg: '51,5', yearsPlaying: '1,5' })
    expect(r.input?.weightKg).toBe(51.5)
    expect(r.input?.yearsPlaying).toBe(1.5)
  })
  it('avisos no bloqueantes', () => {
    expect(validateTalentForm({ ...goldenForm(), wingspanCm: '190' }).warnings).toEqual(['wingspanDiff'])
    expect(validateTalentForm({ ...goldenForm(), age: '14' }).warnings).toEqual(['minor'])
    expect(validateTalentForm({ ...goldenForm(), weightKg: '40' }).warnings).toEqual(['bmiExtreme'])
  })
})
```

`src/engine/talent.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { analyzeTalent } from './talent'
import { GOLDEN } from './testkit'

describe('analyzeTalent', () => {
  it('perfil de referencia completo', () => {
    const r = analyzeTalent(GOLDEN)
    expect(r.engineVersion).toBe(1)
    expect(r.body.bodyType).toBe('lightAgile')
    expect(r.strongest).toBe('endurance')
    expect(r.weakest).toBe('reaction')
    expect(r.singles.top).toBe('control')
    expect(r.doubles.role).toBe('back')
    expect(r.doubles.partner.role).toBe('front')
    expect(r.drills).toEqual(['rallyControl', 'netSpinning', 'shadowFootwork'])
    expect(r.flags).toEqual([])
    expect(r.diagnosis.reaction).toBe('weak')
    expect(r.diagnosis.endurance).toBe('medium')
    expect(r.bodyClaims).toEqual([
      { key: 'speed', kind: 'advantage', level: 'medium' },
      { key: 'endurance', kind: 'advantage', level: 'medium' },
      { key: 'power', kind: 'disadvantage', level: 'medium' },
    ])
    expect(r.mirrors.singles.length).toBeGreaterThan(0)
    expect(r.mirrors.singles.every((m) => m.athlete.sex === 'F')).toBe(true)
  })
  it('flags de principiante, edad y envergadura', () => {
    const r = analyzeTalent({ ...GOLDEN, age: 45, yearsPlaying: 0.5, wingspanCm: null })
    expect(r.flags).toEqual(expect.arrayContaining(['beginner', 'injury40', 'wingspanAssumed']))
  })
})
```

`src/engine/talent.invariants.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { analyzeTalent } from './talent'
import { makeInput } from './testkit'
import { ABILITY_KEYS, RADAR_KEYS, type Level, type TalentInput } from './types'

const PATTERNS: Level[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1], [3, 3, 3, 3, 3, 3, 3, 3], [5, 5, 5, 5, 5, 5, 5, 5],
  [5, 3, 2, 2, 3, 5, 2, 3], [2, 2, 4, 5, 3, 2, 4, 3], [2, 4, 5, 3, 4, 2, 3, 5],
]

function* grid(): Generator<TalentInput> {
  for (const sex of ['M', 'F'] as const)
    for (const h of [150, 160, 170, 180, 190, 200])
      for (const w of [45, 60, 75, 90])
        for (const age of [15, 25, 35, 45, 60])
          for (const years of [0.5, 2, 6])
            for (const p of PATTERNS)
              for (const ws of [null, h + 8]) yield makeInput(sex, age, h, w, ws, years, p)
}

describe('invariantes sobre ~8.600 perfiles', () => {
  it('se cumplen para todos', () => {
    const partnerOf = { front: 'back', back: 'front', rotation: 'rotation' } as const
    for (const input of grid()) {
      const r = analyzeTalent(input)
      const tag = JSON.stringify({ s: input.sex, h: input.heightCm, w: input.weightKg, a: input.age, y: input.yearsPlaying, l: input.levels })
      for (const s of r.singles.ranking) expect(Number.isInteger(s.fit) && s.fit >= 0 && s.fit <= 100, tag).toBe(true)
      expect(r.singles.top, tag).toBe(r.singles.ranking[0].style)
      expect(r.doubles.partner.role, tag).toBe(partnerOf[r.doubles.role])
      expect(r.doubles.fit >= 0 && r.doubles.fit <= 100, tag).toBe(true)
      for (const m of r.mirrors.singles) expect(m.athlete.sex, tag).toBe(input.sex)
      for (const m of r.mirrors.doubles) expect(m.pair.players[m.playerIndex].sex, tag).toBe(input.sex)
      for (const c of r.bodyClaims) {
        if (r.current[c.key] < 3.5) expect(c.level, tag).toBe('weak')
      }
      for (const k of ABILITY_KEYS) expect(Number.isFinite(r.blended[k]), tag).toBe(true)
      for (const k of RADAR_KEYS) expect(r.tendency[k] >= 1 && r.tendency[k] <= 9.5, tag).toBe(true)
      expect(new Set(r.drills).size, tag).toBe(3)
    }
  })
})
```

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npx vitest run src/engine`
Expected: FAIL (`Failed to resolve import "./drills"`, `"./validate"` y `"./talent"`).

- [ ] **Step 3: Implementar `drills.ts`**

```ts
import { SINGLES_WEIGHTS } from './singles'
import { ABILITY_KEYS, type AbilityKey, type Scores, type SinglesStyle } from './types'

export const DRILLS = [
  { id: 'shadowFootwork', targets: ['speed', 'endurance'] },
  { id: 'fourCornerMulti', targets: ['speed', 'endurance'] },
  { id: 'plyoJump', targets: ['power', 'speed'] },
  { id: 'smashMulti', targets: ['power', 'rearCourt'] },
  { id: 'clearToBaseline', targets: ['rearCourt'] },
  { id: 'netSpinning', targets: ['netTouch'] },
  { id: 'netKillRush', targets: ['netTouch', 'reaction'] },
  { id: 'defenseBlock', targets: ['reaction'] },
  { id: 'driveExchange', targets: ['reaction', 'speed'] },
  { id: 'intervalCourtSprints', targets: ['endurance'] },
  { id: 'rallyControl', targets: ['tactics', 'endurance'] },
  { id: 'threeShotPatterns', targets: ['tactics'] },
  { id: 'matchReview', targets: ['tactics', 'mental'] },
  { id: 'pressurePoints', targets: ['mental'] },
  { id: 'serveRoutine', targets: ['mental', 'netTouch'] },
] as const satisfies readonly { id: string; targets: readonly AbilityKey[] }[]

export type DrillId = (typeof DRILLS)[number]['id']

const idx = (k: AbilityKey) => ABILITY_KEYS.indexOf(k)

/** 3 ejercicios para las capacidades clave del estilo en las que el usuario está más flojo. */
export function pickDrills(style: SinglesStyle, current: Scores): DrillId[] {
  const focus =
    style === 'allround'
      ? [...ABILITY_KEYS]
      : [...ABILITY_KEYS]
          .filter((k) => SINGLES_WEIGHTS[style][k] > 0)
          .sort((a, b) => SINGLES_WEIGHTS[style][b] - SINGLES_WEIGHTS[style][a] || idx(a) - idx(b))
          .slice(0, 5)
  focus.sort((a, b) => current[a] - current[b] || idx(a) - idx(b))
  const fallback = [...ABILITY_KEYS].sort((a, b) => current[a] - current[b] || idx(a) - idx(b))
  const chosen: DrillId[] = []
  for (const k of [...focus, ...fallback]) {
    if (chosen.length === 3) break
    const drill = DRILLS.find((d) => (d.targets as readonly AbilityKey[]).includes(k) && !chosen.includes(d.id))
    if (drill) chosen.push(drill.id)
  }
  return chosen
}
```

- [ ] **Step 4: Implementar `validate.ts`**

```ts
import { bmiOf } from './body'
import { ABILITY_KEYS, FIELD_TEST_KEYS, type AbilityKey, type FieldTestKey, type Freq, type Hand, type Level, type Preference, type Sex, type TalentInput } from './types'

export type FormField = 'sex' | 'age' | 'heightCm' | 'weightKg' | 'wingspanCm' | 'yearsPlaying' | AbilityKey | FieldTestKey
export type FieldErrorCode = 'required' | 'number' | 'range'
export type WarningCode = 'wingspanDiff' | 'bmiExtreme' | 'minor'

export interface TalentFormValues {
  sex: '' | Sex
  age: string
  heightCm: string
  weightKg: string
  wingspanCm: string
  yearsPlaying: string
  hand: Hand
  freq: Freq
  preference: Preference
  levels: Record<AbilityKey, Level | 0>
  tests: Record<FieldTestKey, string>
}

type NumericField = 'age' | 'heightCm' | 'weightKg' | 'wingspanCm' | 'yearsPlaying' | FieldTestKey
export const RANGES: Record<NumericField, [number, number]> = {
  age: [8, 80],
  heightCm: [130, 220],
  weightKg: [30, 150],
  wingspanCm: [120, 240],
  yearsPlaying: [0, 50],
  verticalJumpCm: [5, 120],
  ropeSkip1Min: [10, 350],
  cooper12MinM: [500, 5000],
  rulerDropCm: [0, 40],
}

export function emptyTalentForm(): TalentFormValues {
  const levels = {} as Record<AbilityKey, Level | 0>
  for (const k of ABILITY_KEYS) levels[k] = 0
  const tests = {} as Record<FieldTestKey, string>
  for (const k of FIELD_TEST_KEYS) tests[k] = ''
  return { sex: '', age: '', heightCm: '', weightKg: '', wingspanCm: '', yearsPlaying: '', hand: 'R', freq: '1', preference: 'all', levels, tests }
}

/** '' → null; admite coma decimal; texto no numérico → NaN. */
export function parseNumber(raw: string): number | null {
  const s = raw.trim().replace(',', '.')
  if (s === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

export function validateTalentForm(v: TalentFormValues): {
  input: TalentInput | null
  errors: Partial<Record<FormField, FieldErrorCode>>
  warnings: WarningCode[]
} {
  const errors: Partial<Record<FormField, FieldErrorCode>> = {}
  const read = (field: NumericField, raw: string, required: boolean): number | null => {
    const n = parseNumber(raw)
    if (n === null) {
      if (required) errors[field] = 'required'
      return null
    }
    if (Number.isNaN(n)) {
      errors[field] = 'number'
      return null
    }
    const [lo, hi] = RANGES[field]
    if (n < lo || n > hi) {
      errors[field] = 'range'
      return null
    }
    return n
  }
  if (v.sex === '') errors.sex = 'required'
  const age = read('age', v.age, true)
  const heightCm = read('heightCm', v.heightCm, true)
  const weightKg = read('weightKg', v.weightKg, true)
  const wingspanCm = read('wingspanCm', v.wingspanCm, false)
  const yearsPlaying = read('yearsPlaying', v.yearsPlaying, true)
  const tests = {} as TalentInput['tests']
  for (const k of FIELD_TEST_KEYS) tests[k] = read(k, v.tests[k], false)
  for (const k of ABILITY_KEYS) if (v.levels[k] === 0) errors[k] = 'required'

  if (Object.keys(errors).length > 0 || v.sex === '' || age === null || heightCm === null || weightKg === null || yearsPlaying === null) {
    return { input: null, errors, warnings: [] }
  }
  const warnings: WarningCode[] = []
  if (wingspanCm !== null && Math.abs(wingspanCm - heightCm) > 20) warnings.push('wingspanDiff')
  const bmi = bmiOf(heightCm, weightKg)
  if (bmi < 16 || bmi > 35) warnings.push('bmiExtreme')
  if (age < 16) warnings.push('minor')
  return {
    input: {
      sex: v.sex, age, heightCm, weightKg, wingspanCm, yearsPlaying,
      hand: v.hand, freq: v.freq, preference: v.preference,
      levels: v.levels as Record<AbilityKey, Level>,
      tests,
    },
    errors,
    warnings,
  }
}
```

(Comprobación del test de IMC: 163 cm y 40 kg dan IMC 15.1 < 16 → `bmiExtreme`.)

- [ ] **Step 5: Implementar `talent.ts`**

```ts
import { PAIRS, SINGLES, type Athlete, type DoublesPair } from '../data/athletes'
import { blendScores, bodyTendency, currentScores } from './abilities'
import { analyzeBody, bodyClaims, diagLevel } from './body'
import { ENGINE_VERSION } from './constants'
import { pickDoublesRole } from './doubles'
import { pickDrills, type DrillId } from './drills'
import { findDoublesMirrors, findSinglesMirrors, type DoublesMirror, type SinglesMirror } from './mirror'
import { rankSingles } from './singles'
import { argBy, mean } from './stats'
import {
  ABILITY_KEYS,
  RADAR_KEYS,
  type AbilityKey,
  type BodyClaim,
  type BodyProfile,
  type DiagLevel,
  type DoublesResult,
  type Flag,
  type RadarKey,
  type RadarScores,
  type Scores,
  type SinglesResult,
  type TalentInput,
} from './types'

export interface AthleteData {
  singles: Athlete[]
  pairs: DoublesPair[]
}

export interface TalentResult {
  engineVersion: number
  body: BodyProfile
  current: Scores
  tendency: RadarScores
  blended: Scores
  diagnosis: Record<AbilityKey, DiagLevel>
  strongest: RadarKey
  weakest: RadarKey
  bodyClaims: BodyClaim[]
  singles: SinglesResult
  doubles: DoublesResult
  mirrors: { singles: SinglesMirror[]; doubles: DoublesMirror[] }
  drills: DrillId[]
  flags: Flag[]
}

export function collectFlags(input: TalentInput, body: BodyProfile, current: Scores, singles: SinglesResult): Flag[] {
  const flags: Flag[] = []
  if (input.yearsPlaying < 1) flags.push('beginner')
  if (input.age <= 16) flags.push('youth')
  if (body.ageBand === 'thirties') flags.push('injury30')
  if (body.ageBand === 'forties') flags.push('injury40')
  if (body.ageBand === 'fiftyPlus') flags.push('injury50')
  if (body.wingspanAssumed) flags.push('wingspanAssumed')
  if (singles.margin < 3) flags.push('closeCall')
  if (input.yearsPlaying < 1 && mean(ABILITY_KEYS.map((k) => current[k])) >= 7) flags.push('selfRatingHigh')
  if (body.bmi >= 28) flags.push('bmiHigh')
  if (body.bmi < 17) flags.push('bmiLow')
  return flags
}

export function analyzeTalent(input: TalentInput, data: AthleteData = { singles: SINGLES, pairs: PAIRS }): TalentResult {
  const body = analyzeBody(input)
  const current = currentScores(input)
  const tendency = bodyTendency(body)
  const blended = blendScores(current, tendency, input.yearsPlaying)
  const diagnosis = {} as Record<AbilityKey, DiagLevel>
  for (const k of ABILITY_KEYS) diagnosis[k] = diagLevel(current[k])
  const singles = rankSingles(blended, current, body)
  const doubles = pickDoublesRole(blended, current, body, input.sex)
  const user = { sex: input.sex, heightCm: input.heightCm, bmi: body.bmi, preference: input.preference }
  return {
    engineVersion: ENGINE_VERSION,
    body,
    current,
    tendency,
    blended,
    diagnosis,
    strongest: argBy(RADAR_KEYS, (k) => current[k], (a, b) => a > b),
    weakest: argBy(RADAR_KEYS, (k) => current[k], (a, b) => a < b),
    bodyClaims: bodyClaims(body.bodyType, current),
    singles,
    doubles,
    mirrors: {
      singles: findSinglesMirrors(user, singles, data.singles),
      doubles: findDoublesMirrors(user, doubles.role, data.pairs),
    },
    drills: pickDrills(singles.top, current),
    flags: collectFlags(input, body, current, singles),
  }
}
```

- [ ] **Step 6: Ejecutar y ver que pasan**

Run: `npx vitest run src/engine && npm run typecheck`
Expected: PASS. El test de invariantes debe tardar menos de 10 s. Si falla, el mensaje incluye el perfil (`tag`) que lo rompe: arregla el motor, no el test.

- [ ] **Step 7: Commit**

```bash
git add src/engine
git commit -m "feat(engine): drills, form validation, talent assembly and invariant grid

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Almacenamiento del perfil e idioma persistente

**Files:**
- Create: `src/lib/storage.ts`, `src/lib/StoreProvider.tsx`
- Modify: `src/App.tsx` (envolver con `StoreProvider` y conectar el idioma), `src/i18n/ui.zh.ts`, `src/i18n/ui.es.ts` (clave `storage.unavailable`)
- Test: `src/lib/storage.test.ts`, `src/lib/StoreProvider.test.tsx`, ampliar `src/App.test.tsx`

**Interfaces:**
- Consumes: `TalentInput`, `ABILITY_KEYS`, `FIELD_TEST_KEYS`, `Lang`, `I18nProvider`, `AppRoutes`.
- Produces:
  - `STORAGE_KEY = 'yuqiu.v1'`, `MAX_RECORDS = 20`;
  - `TalentRecord`, `RatingRecord`, `MbtiRecord`, `StoredState`, `KeyValueStore`;
  - `emptyState()`, `browserStore(): KeyValueStore | null`, `loadState(store)`, `saveState(store, state): boolean`;
  - `appendRecord<T>(list: T[], rec: T): T[]`, `isTalentInput(x: unknown): x is TalentInput`, `newId(): string`;
  - `StoreProvider({ children, store? })`;
  - `useStore(): { state; persistent; setLang; addTalent(input): TalentRecord; addRating(answers): RatingRecord; addMbti(answers): MbtiRecord; clearAll() }`.
- `RatingRecord.answers: Record<string, string>` y `MbtiRecord.answers: Record<string, 'a' | 'b'>`. Las tareas 14–17 los usan tal cual.

- [ ] **Step 1: Escribir los tests que fallan**

`src/lib/storage.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { GOLDEN } from '../engine/testkit'
import { appendRecord, emptyState, isTalentInput, loadState, MAX_RECORDS, saveState, STORAGE_KEY, type KeyValueStore } from './storage'

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => void (data[k] = v),
    removeItem: (k) => void delete data[k],
  }
}

describe('loadState', () => {
  it('sin almacenamiento disponible → estado vacío', () => {
    expect(loadState(null)).toEqual(emptyState())
  })
  it('JSON corrupto o de otra versión → estado vacío', () => {
    expect(loadState(memoryStore({ [STORAGE_KEY]: '{oops' }))).toEqual(emptyState())
    expect(loadState(memoryStore({ [STORAGE_KEY]: JSON.stringify({ version: 99 }) }))).toEqual(emptyState())
  })
  it('descarta registros de talento con forma inválida y conserva los buenos', () => {
    const good = { id: 'a', createdAt: '2026-09-26T10:00:00.000Z', engineVersion: 1, input: GOLDEN }
    const bad = { id: 'b', createdAt: 'x', engineVersion: 1, input: { sex: 'X' } }
    const store = memoryStore({ [STORAGE_KEY]: JSON.stringify({ ...emptyState(), lang: 'es', talent: [good, bad] }) })
    const s = loadState(store)
    expect(s.lang).toBe('es')
    expect(s.talent.map((r) => r.id)).toEqual(['a'])
  })
  it('ida y vuelta', () => {
    const store = memoryStore()
    const state = { ...emptyState(), lang: 'es' as const }
    expect(saveState(store, state)).toBe(true)
    expect(loadState(store)).toEqual(state)
  })
})

describe('utilidades', () => {
  it('appendRecord conserva los últimos 20', () => {
    const list = Array.from({ length: MAX_RECORDS }, (_, i) => i)
    expect(appendRecord(list, 99)).toHaveLength(MAX_RECORDS)
    expect(appendRecord(list, 99)[0]).toBe(1)
    expect(appendRecord(list, 99).at(-1)).toBe(99)
  })
  it('isTalentInput', () => {
    expect(isTalentInput(GOLDEN)).toBe(true)
    expect(isTalentInput({ ...GOLDEN, levels: { ...GOLDEN.levels, power: 7 } })).toBe(false)
    expect(isTalentInput(null)).toBe(false)
  })
  it('saveState devuelve false si el almacenamiento lanza', () => {
    const throwing: KeyValueStore = {
      getItem: () => null,
      setItem: () => { throw new Error('QuotaExceeded') },
      removeItem: () => {},
    }
    expect(saveState(throwing, emptyState())).toBe(false)
  })
})
```

`src/lib/StoreProvider.test.tsx`:

```tsx
import { act, render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { GOLDEN } from '../engine/testkit'
import { STORAGE_KEY } from './storage'
import { StoreProvider, useStore } from './StoreProvider'

it('addTalent guarda en localStorage y devuelve el registro', () => {
  // Objeto contenedor: TypeScript no estrecha `ref.current` a null como haría con un `let`.
  const ref: { current: ReturnType<typeof useStore> | null } = { current: null }
  function Probe() {
    ref.current = useStore()
    return null
  }
  render(
    <StoreProvider>
      <Probe />
    </StoreProvider>,
  )
  let id = ''
  act(() => {
    id = ref.current!.addTalent(GOLDEN).id
  })
  expect(ref.current!.state.talent.map((r) => r.id)).toEqual([id])
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).talent[0].input.heightCm).toBe(163)
  act(() => ref.current!.clearAll())
  expect(ref.current!.state.talent).toEqual([])
})
```

Añadir a `src/App.test.tsx`:

```tsx
it('recuerda el idioma elegido al volver a abrir la app', async () => {
  const first = render(<App />)
  await userEvent.click(screen.getByRole('button', { name: '切换到西班牙语' }))
  first.unmount()
  render(<App />)
  expect(screen.getByRole('link', { name: 'Test de talento' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npx vitest run src/lib src/App.test.tsx`
Expected: FAIL (`Failed to resolve import "./storage"`; el test nuevo de App falla porque el idioma no persiste).

- [ ] **Step 3: Implementar `storage.ts`**

```ts
import { ABILITY_KEYS, FIELD_TEST_KEYS, type TalentInput } from '../engine/types'
import type { Lang } from '../i18n/types'

export const STORAGE_KEY = 'yuqiu.v1'
export const MAX_RECORDS = 20

export interface TalentRecord {
  id: string
  createdAt: string
  engineVersion: number
  input: TalentInput
}
export interface RatingRecord {
  id: string
  createdAt: string
  answers: Record<string, string>
}
export interface MbtiRecord {
  id: string
  createdAt: string
  answers: Record<string, 'a' | 'b'>
}
export interface StoredState {
  version: 1
  lang: Lang
  talent: TalentRecord[]
  rating: RatingRecord[]
  mbti: MbtiRecord[]
}
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const emptyState = (): StoredState => ({ version: 1, lang: 'zh', talent: [], rating: [], mbti: [] })

export function browserStore(): KeyValueStore | null {
  try {
    const s = window.localStorage
    const probe = '__yuqiu_probe__'
    s.setItem(probe, '1')
    s.removeItem(probe)
    return s
  } catch {
    return null
  }
}

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null
const hasMeta = (r: Record<string, unknown>) => typeof r.id === 'string' && typeof r.createdAt === 'string'

export function isTalentInput(x: unknown): x is TalentInput {
  if (!isObj(x)) return false
  const levels = x.levels
  const tests = x.tests
  return (
    (x.sex === 'M' || x.sex === 'F') &&
    isNum(x.age) && isNum(x.heightCm) && isNum(x.weightKg) && isNum(x.yearsPlaying) &&
    (x.wingspanCm === null || isNum(x.wingspanCm)) &&
    (x.hand === 'R' || x.hand === 'L') &&
    ['lt1', '1', '2-3', '4+'].includes(x.freq as string) &&
    ['singles', 'doubles', 'mixed', 'all'].includes(x.preference as string) &&
    isObj(levels) && ABILITY_KEYS.every((k) => [1, 2, 3, 4, 5].includes(levels[k] as number)) &&
    isObj(tests) && FIELD_TEST_KEYS.every((k) => tests[k] === null || isNum(tests[k]))
  )
}

const isAnswers = (x: unknown): x is Record<string, string> =>
  isObj(x) && Object.values(x).every((v) => typeof v === 'string')

export function loadState(store: KeyValueStore | null): StoredState {
  if (!store) return emptyState()
  try {
    const raw = store.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const data: unknown = JSON.parse(raw)
    if (!isObj(data) || data.version !== 1) return emptyState()
    const list = (x: unknown) => (Array.isArray(x) ? x.filter(isObj) : [])
    return {
      version: 1,
      lang: data.lang === 'es' ? 'es' : 'zh',
      talent: list(data.talent).filter((r) => hasMeta(r) && isNum(r.engineVersion) && isTalentInput(r.input)) as unknown as TalentRecord[],
      rating: list(data.rating).filter((r) => hasMeta(r) && isAnswers(r.answers)) as unknown as RatingRecord[],
      mbti: list(data.mbti).filter(
        (r) => hasMeta(r) && isAnswers(r.answers) && Object.values(r.answers).every((v) => v === 'a' || v === 'b'),
      ) as unknown as MbtiRecord[],
    }
  } catch {
    return emptyState()
  }
}

export function saveState(store: KeyValueStore | null, state: StoredState): boolean {
  if (!store) return false
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function appendRecord<T>(list: T[], rec: T): T[] {
  return [...list, rec].slice(-MAX_RECORDS)
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
```

- [ ] **Step 4: Implementar `StoreProvider.tsx`**

```tsx
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { ENGINE_VERSION } from '../engine/constants'
import type { TalentInput } from '../engine/types'
import type { Lang } from '../i18n/types'
import {
  appendRecord,
  browserStore,
  emptyState,
  loadState,
  newId,
  saveState,
  type KeyValueStore,
  type MbtiRecord,
  type RatingRecord,
  type StoredState,
  type TalentRecord,
} from './storage'

interface StoreValue {
  state: StoredState
  persistent: boolean
  setLang: (lang: Lang) => void
  addTalent: (input: TalentInput) => TalentRecord
  addRating: (answers: Record<string, string>) => RatingRecord
  addMbti: (answers: Record<string, 'a' | 'b'>) => MbtiRecord
  clearAll: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children, store }: { children: ReactNode; store?: KeyValueStore | null }) {
  const [kv] = useState<KeyValueStore | null>(() => (store === undefined ? browserStore() : store))
  const [state, setState] = useState<StoredState>(() => loadState(kv))
  const [persistent, setPersistent] = useState<boolean>(kv !== null)
  // Copia síncrona del estado: así dos acciones seguidas en el mismo evento no se pisan
  // y el guardado queda fuera del updater de React.
  const stateRef = useRef(state)

  const update = useCallback(
    (f: (prev: StoredState) => StoredState) => {
      const next = f(stateRef.current)
      stateRef.current = next
      setState(next)
      setPersistent(saveState(kv, next))
    },
    [kv],
  )

  const value = useMemo<StoreValue>(() => {
    const stamp = () => ({ id: newId(), createdAt: new Date().toISOString() })
    return {
      state,
      persistent,
      setLang: (lang) => update((s) => ({ ...s, lang })),
      addTalent: (input) => {
        const rec: TalentRecord = { ...stamp(), engineVersion: ENGINE_VERSION, input }
        update((s) => ({ ...s, talent: appendRecord(s.talent, rec) }))
        return rec
      },
      addRating: (answers) => {
        const rec: RatingRecord = { ...stamp(), answers }
        update((s) => ({ ...s, rating: appendRecord(s.rating, rec) }))
        return rec
      },
      addMbti: (answers) => {
        const rec: MbtiRecord = { ...stamp(), answers }
        update((s) => ({ ...s, mbti: appendRecord(s.mbti, rec) }))
        return rec
      },
      clearAll: () => update((s) => ({ ...emptyState(), lang: s.lang })),
    }
  }, [state, persistent, update])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useStore must be used inside StoreProvider')
  return value
}
```

- [ ] **Step 5: Conectar en `App.tsx` y avisar si no se puede guardar**

Claves nuevas:
- `ui.zh.ts`: `'storage.unavailable': '当前浏览器无法保存数据（可能是无痕模式），测评结果不会被保存。',`
- `ui.es.ts`: `'storage.unavailable': 'Este navegador no permite guardar datos (¿modo privado?). Tus resultados no se guardarán.',`

Sustituir `App` y añadir el aviso en `AppRoutes`:

```tsx
import { StoreProvider, useStore } from './lib/StoreProvider'
import { useI18n } from './i18n/I18nProvider'
import type { ReactNode } from 'react'

function LangBridge({ children }: { children: ReactNode }) {
  const { state, setLang } = useStore()
  return (
    <I18nProvider lang={state.lang} onLangChange={setLang}>
      {children}
    </I18nProvider>
  )
}

function StorageNotice() {
  const { persistent } = useStore()
  const { t } = useI18n()
  if (persistent) return null
  return <p className="notice" role="status">{t('storage.unavailable')}</p>
}

// En AppRoutes, justo después de <main className="page">: <StorageNotice />

export default function App() {
  return (
    <StoreProvider>
      <LangBridge>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </LangBridge>
    </StoreProvider>
  )
}
```

Añadir a `global.css`:

```css
.notice { margin: 0; padding: 12px 16px; border-radius: 16px; background: #fff7e6; color: #8a5300; font-size: 14px; }
```

- [ ] **Step 6: Ejecutar y ver que pasan**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib src/App.tsx src/App.test.tsx src/i18n src/styles
git commit -m "feat: persistent profile store with safe localStorage and remembered language

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
