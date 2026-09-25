
---

### Task 9: Contenido del 天赋测评 — tipos y textos en chino

**Requiere:** `docs/superpowers/research/tactics_styles.md` y `sports_science.md` (verificado).

**Files:**
- Create: `src/content/types.ts`, `src/content/zh/talent.ts`, `src/content/es/talent.ts` (provisional: reexporta el chino hasta la Tarea 10), `src/content/index.ts`
- Test: `src/content/content.test.ts`

**Interfaces:**
- Consumes: tipos del motor (`AbilityKey`, `BodyType`, `SinglesStyle`, `DoublesRole`, `Flag`, `MixedNote`, `FitBand`, `DiagLevel`, `BmiBand`, `AgeBand`, `FieldTestKey`, `Sex`, `Hand`, `Freq`, `Preference`), `DrillId`, `FieldErrorCode`, `WarningCode`, `StyleMatch`, `PairEvent`, `Position`.
- Produces:
  - `TalentContent` y sus piezas, exactamente con los nombres de abajo (las tareas 11–13 y 19 leen estas rutas);
  - `talentZh`, `talentEs`;
  - `getTalentContent(lang)`, `useTalentContent()`, `joinList(c, items)`, `pick(l: Localized, lang)`.
- **Plantillas:** los textos con `{nombre}` se rellenan con `format()` de `I18nProvider`. Cada plantilla debe tener los mismos marcadores en zh y es (lo comprueba un test).

- [ ] **Step 1: Tipos del contenido**

`src/content/types.ts`:

```ts
import type { Localized, PairEvent, Position } from '../data/athletes'
import type { DrillId } from '../engine/drills'
import type { StyleMatch } from '../engine/mirror'
import type {
  AbilityKey, AgeBand, BmiBand, BodyType, DiagLevel, DoublesRole, FieldTestKey, FitBand, Flag, Freq, Hand,
  MixedNote, Preference, Sex, SinglesStyle,
} from '../engine/types'
import type { FieldErrorCode, WarningCode } from '../engine/validate'

export type Five = [string, string, string, string, string]

export interface AbilityText {
  /** Nombre corto para el radar: 爆发力 / Potencia */
  name: string
  /** Aclaración entre paréntesis: 杀球、起跳 / remate y salto */
  hint: string
  /** 5 niveles con conductas observables, del 1 (más bajo) al 5 */
  levels: Five
  /** Diagnóstico; plantilla con {score} */
  diag: Record<DiagLevel, string>
  /** 1–2 sugerencias concretas por nivel */
  tips: Record<DiagLevel, string>
}

export interface BodyTypeText {
  /** 矮快型（重心低 / 步频快） */
  name: string
  /** 1–2 frases sobre ventajas y desventajas naturales en pista */
  summary: string
}

export interface StyleText {
  name: string
  emoji: string
  tagline: string
  /** Por qué encaja; plantilla con {fit} */
  fitIntro: string
  coreTactic: string
  opening: string
  midgame: string
  keyPoints: string
  stamina: string
  pitfalls: string
  matchups: string
}

export interface RoleText {
  name: string
  emoji: string
  tagline: string
  fitIntro: string
  coreTactic: string
  rotation: string
  positioning: string
  positioningDont: string
  signals: string
  signalsDont: string
}

export interface DrillText {
  name: string
  how: string
  /** Series, repeticiones, duración y frecuencia semanal */
  dose: string
}

export interface Reference {
  id: string
  /** Autores (año). Título. Revista. */
  citation: string
  url: string
  /** Para qué lo usa el informe */
  usedFor: string
}

export interface TalentContent {
  list: { sep: string }
  form: {
    moduleLabel: string
    title: string
    subtitle: string
    fields: Record<'sex' | 'age' | 'heightCm' | 'weightKg' | 'wingspanCm' | 'yearsPlaying' | 'hand' | 'freq' | 'preference', string>
    wingspanHint: string
    abilitiesTitle: string
    abilitiesHint: string
    testsTitle: string
    testsHint: string
    choose: string
    submit: string
    confirmWarnings: string
    missingReport: string
    /** Plantillas: 'range' usa {min} y {max} */
    errors: Record<FieldErrorCode, string>
    warnings: Record<WarningCode, string>
  }
  options: {
    sex: Record<Sex, string>
    hand: Record<Hand, string>
    freq: Record<Freq, string>
    preference: Record<Preference, string>
  }
  abilities: Record<AbilityKey, AbilityText>
  tests: Record<FieldTestKey, { label: string; unit: string; hint: string }>
  bodyTypes: Record<BodyType, BodyTypeText>
  singles: Record<SinglesStyle, StyleText>
  doubles: Record<DoublesRole, RoleText>
  report: {
    title: string
    back: string
    retest: string
    share: string
    radarCurrent: string
    radarTendency: string
    radarNote: string
    physicalTitle: string
    /** {sex} {height} {weight} {bmi} {band} */
    bodyLine: string
    bmiBands: Record<BmiBand, string>
    /** {diff} {ratio} */
    wingspanLine: string
    wingspanAssumed: string
    /** {years} */
    yearsLine: string
    bodyTypeLabel: string
    /** Plantillas con {ability} y {score} */
    claimAdvantage: Record<DiagLevel, string>
    claimDisadvantage: Record<DiagLevel, string>
    ageBands: Record<AgeBand, { name: string; advice: string }>
    /** {strong} {strongScore} {weak} {weakScore} */
    strongWeak: string
    /** {score} */
    tacticsTitle: string
    mentalTitle: string
    singlesBand: string
    singlesIntro: string
    doublesBand: string
    doublesIntro: string
    fitBands: Record<FitBand, string>
    /** {fit} {band} */
    fitLine: string
    fitAnalysis: string
    /** {list} */
    driversLine: string
    gapsLine: string
    noDrivers: string
    noGaps: string
    /** {emoji} {name} {fit} */
    runnerUp: string
    singlesLabels: Record<'coreTactic' | 'opening' | 'midgame' | 'keyPoints' | 'stamina' | 'pitfalls' | 'matchups', string>
    doublesLabels: Record<'coreTactic' | 'rotation' | 'positioning' | 'positioningDont' | 'signals' | 'signalsDont' | 'partner' | 'mixed', string>
    /** Plantillas con {role} y {strength} */
    partner: Record<DoublesRole, string>
    mixedNotes: Record<MixedNote, string>
    mirrorTitle: string
    singlesMirror: string
    doublesMirror: string
    alternates: string
    you: string
    mirror: string
    height: string
    weight: string
    bmi: string
    /** {diff} */
    bmiDiffLine: string
    styleMatch: Record<StyleMatch, string>
    status: { active: string; retired: string; split: string }
    events: Record<PairEvent, string>
    positions: Record<Position, string>
    /** {name} {position} */
    matchedPlayer: string
    trainingTitle: string
    drills: Record<DrillId, DrillText>
    flagsTitle: string
    flags: Record<Flag, string>
    referencesTitle: string
    references: Reference[]
    disclaimer: string
  }
}

export type { Localized }
```

- [ ] **Step 2: Escribir el test que falla**

`src/content/content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { talentEs } from './es/talent'
import { talentZh } from './zh/talent'

type Leaf = { path: string; value: string }
function leaves(node: unknown, path = ''): Leaf[] {
  if (typeof node === 'string') return [{ path, value: node }]
  if (Array.isArray(node)) return node.flatMap((v, i) => leaves(v, `${path}[${i}]`))
  if (node && typeof node === 'object') return Object.entries(node).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k))
  return []
}
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')

describe.each([
  ['zh', talentZh],
  ['es', talentEs],
])('contenido %s', (_lang, content) => {
  it('ningún texto vacío', () => {
    expect(leaves(content).filter((l) => l.value.trim() === '').map((l) => l.path)).toEqual([])
  })
  it('referencias con URL http(s)', () => {
    expect(content.report.references.length).toBeGreaterThanOrEqual(5)
    for (const r of content.report.references) expect(r.url).toMatch(/^https?:\/\//)
  })
})

describe('zh y es', () => {
  it('tienen exactamente las mismas rutas', () => {
    expect(leaves(talentEs).map((l) => l.path)).toEqual(leaves(talentZh).map((l) => l.path))
  })
  it('cada plantilla tiene los mismos marcadores en los dos idiomas', () => {
    const es = new Map(leaves(talentEs).map((l) => [l.path, l.value]))
    const mismatches = leaves(talentZh)
      .filter((l) => placeholders(l.value) !== placeholders(es.get(l.path) ?? ''))
      .map((l) => l.path)
    expect(mismatches).toEqual([])
  })
})

describe('chino', () => {
  it('los nombres de estilo y rol son los del informe', () => {
    expect(talentZh.singles.control.name).toContain('四方拉吊')
    expect(talentZh.doubles.front.name).toContain('封网')
    expect(talentZh.doubles.back.name).toContain('后场')
  })
  it('los 5 niveles de cada capacidad son distintos', () => {
    for (const a of Object.values(talentZh.abilities)) expect(new Set(a.levels).size).toBe(5)
  })
})
```

- [ ] **Step 3: Ejecutar y ver que falla**

Run: `npx vitest run src/content`
Expected: FAIL (`Failed to resolve import "./es/talent"`).

- [ ] **Step 4: Escribir `src/content/zh/talent.ts` a partir de la investigación**

Estructura (`export const talentZh: TalentContent = { ... }`); TypeScript obliga a completar todas las claves.

**Fuentes y reglas de redacción:**
- `abilities.*.levels`: 5 conductas **observables** por capacidad, en orden creciente. Nada de "一般/较好": frases como "高远球过不了半场" o "能稳定打到底线，但弧线偏高偏慢".
- `abilities.*.diag` y `tips`: de la sección 5 de `tactics_styles.md` (偏弱 / 中等 / 突出). `diag` usa `{score}`.
- `bodyTypes`: sección 1 de `tactics_styles.md`. Los 6 nombres son exactamente:
  - `compactQuick` 矮快型（重心低 / 步频快）
  - `lightAgile` 轻盈灵巧型
  - `balanced` 均衡型
  - `sturdyPower` 敦实力量型
  - `tallLean` 瘦高长臂型
  - `tallPower` 高大力量型
- `singles`: sección 2 de `tactics_styles.md`. Nombres exactos:
  - `attack` ⚔️ 进攻压制型
  - `control` 🎯 四方拉吊控制型
  - `counter` 🛡️ 防守反击型
  - `speed` ⚡ 速度突击型
  - `allround` 🧩 全面型
  - `net` 🪶 网前技巧型
  - Cada campo tiene 2–4 frases concretas, del mismo nivel de detalle que las capturas: 开局前 3 分…, "第 4 分起…".
- `doubles`: sección 3. Nombres exactos:
  - `front` 🗡️ 前场封网型
  - `back` 💥 后场攻击型
  - `rotation` 🔄 全能轮转型
  - `signals` da 3 señales de comunicación; `signalsDont` da los contraejemplos.
- `report.partner` (plantillas con `{role}` y `{strength}`), en estas formas:
  - front: `你是「前场封网型」→ 找{role}搭档（{strength} ≥ 7）…`
  - back: `你是「后场攻击型」→ 找{role}搭档（{strength} ≥ 7）…`
  - rotation: `你是「全能轮转型」→ 找同样会轮转、且{strength}比你强的搭档…`
  - **El rol nombrado en cada texto debe ser el de la clave.** Es el error de la app original.
- `report.mixedNotes`: `femaleBack` explica que en 混双 lo habitual es 女前男后 y qué hacer si tu perfil es de fondo. `maleFront` es el caso simétrico.
- `report.claimAdvantage` y `claimDisadvantage`: 3 plantillas cada una con `{ability}` y `{score}`. Ejemplos:
  - ventaja `weak`: `体型让你具备{ability}的先天优势，但目前{ability}只有 {score}/10，潜力还没有兑现。`
  - ventaja `strong`: `体型优势已经兑现：{ability} {score}/10。`
  - desventaja `strong`: `体型本不占{ability}优势，但你已练到 {score}/10，短板被补上了。`
- `report.ageBands`: consejos de sports_science.md por franja; 31–40, 41–50 y 51+ incluyen prevención de lesiones.
- `report.flags`: un texto por flag. `beginner` = "发展方向" y fundamentos primero; `selfRatingHigh` = aviso sobre la fiabilidad de la autoevaluación; `closeCall` = los dos estilos principales están muy cerca.
- `report.drills`: los 15 `DrillId`, con cómo se hace y la dosis (series × repeticiones o duración, veces por semana).
- `report.references`: **solo** citas marcadas como verificadas en `sports_science.md` (mínimo 5), cada una con `usedFor`.
- `report.status`: `{ active: '现役', retired: '已退役（{year}）', split: '已拆对' }`.
- `form.fields` como en la captura: `性别 GENDER`, `年龄 AGE`, `身高 HEIGHT(CM)`, `体重 WEIGHT(KG)`, `臂展 WINGSPAN(CM)`, `日常球龄 EXP(年)`, `惯用手 HAND`, `每周打球 FREQ`, `偏好 PREFER`.
- `form.moduleLabel`: `MODULE 01 | TALENT & BODY TYPE`. `form.title`: `羽球打法天赋测评`. `form.subtitle`: `体型与维度深度匹配｜单双打分流推荐｜镜像运动员参考`.
- `form.errors`: `{ required: '请填写此项', number: '请输入数字', range: '请输入 {min}–{max} 之间的数值' }`.
- `list.sep`: `'、'`.
- Usa 她 para jugadoras y 他 para jugadores; nunca "他" genérico para el usuario (usa 你).

`src/content/es/talent.ts` (provisional):

```ts
import type { TalentContent } from '../types'
import { talentZh } from '../zh/talent'

// Provisional hasta la Tarea 10.
export const talentEs: TalentContent = talentZh
```

`src/content/index.ts`:

```ts
import type { Localized } from '../data/athletes'
import { useI18n } from '../i18n/I18nProvider'
import type { Lang } from '../i18n/types'
import { talentEs } from './es/talent'
import type { TalentContent } from './types'
import { talentZh } from './zh/talent'

export function getTalentContent(lang: Lang): TalentContent {
  return lang === 'zh' ? talentZh : talentEs
}

export function useTalentContent(): TalentContent {
  return getTalentContent(useI18n().lang)
}

export function joinList(c: { list: { sep: string } }, items: string[]): string {
  return items.join(c.list.sep)
}

export function pick(l: Localized, lang: Lang): string {
  return l[lang]
}
```

- [ ] **Step 5: Ejecutar y ver que pasa**

Run: `npx vitest run src/content && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content
git commit -m "feat(content): talent report content types and Chinese texts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Contenido del 天赋测评 en español

**Files:**
- Modify: `src/content/es/talent.ts` (traducción completa)
- Modify: `src/content/content.test.ts` (test de caracteres chinos)

**Interfaces:**
- Consumes: `TalentContent`, `talentZh`.
- Produces: `talentEs` definitivo.

- [ ] **Step 1: Escribir el test que falla**

Añadir a `src/content/content.test.ts`:

```ts
describe('español', () => {
  it('no contiene caracteres chinos ni es una copia del chino', () => {
    const han = /[一-鿿]/
    expect(leaves(talentEs).filter((l) => han.test(l.value)).map((l) => l.path)).toEqual([])
    expect(talentEs).not.toBe(talentZh)
  })
})
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npx vitest run src/content`
Expected: FAIL (la lista de rutas con caracteres chinos no está vacía).

- [ ] **Step 3: Traducir**

Reemplaza `src/content/es/talent.ts` por `export const talentEs: TalentContent = { ... }` completo. La traducción debe ser natural en español de España, no literal, y conservar los mismos `{marcadores}`.

**Glosario obligatorio:**

| 中文 | Español |
|---|---|
| 高远球 | clear |
| 平高球 | clear de ataque |
| 杀球 / 跳杀 / 点杀 | remate / remate en salto / remate corto |
| 吊球 / 劈吊 | dejada / dejada cortada |
| 搓球 / 放网 | red con efecto / dejada en la red |
| 勾对角 | red cruzada |
| 推后场 | empuje al fondo |
| 扑球 | matar en la red |
| 挑球 | globo |
| 平抽快挡 | drive y bloqueo |
| 接杀 | defensa del remate |
| 米字步 | footwork en 6 direcciones |
| 前三拍 | los tres primeros golpes |
| 轮转 | rotación |
| 封网 | cerrar la red |
| 四方拉吊 | mover al rival a las cuatro esquinas |
| 前场 / 后场 | zona de red / fondo de pista |
| 混双 / 男双 / 女双 | dobles mixtos / dobles masculinos / dobles femeninos |

**Nombres fijos:**
- Capacidades (cortos, para el radar): Potencia, Resistencia, Reacción, Toque de red, Velocidad, Fondo de pista, Lectura táctica, Mentalidad.
- Estilos:
  - `attack` Atacante dominante
  - `control` Controlador de las cuatro esquinas
  - `counter` Defensor contraatacante
  - `speed` Atacante veloz
  - `allround` Jugador completo
  - `net` Artista de la red
- Roles: `front` Especialista de red, `back` Atacante de fondo, `rotation` Rotador todoterreno.
- Tipos de cuerpo:
  - `compactQuick` Compacto y rápido (centro de gravedad bajo)
  - `lightAgile` Ligero y ágil
  - `balanced` Equilibrado
  - `sturdyPower` Robusto y potente
  - `tallLean` Alto y de brazos largos
  - `tallPower` Alto y potente
- Estados: `{ active: 'En activo', retired: 'Retirado/a ({year})', split: 'Pareja separada' }`.
- `list.sep`: `', '`.

Otras reglas:
- Las etiquetas decorativas de `form.fields` conservan la parte en inglés: `Sexo · GENDER`, `Edad · AGE`, `Altura · HEIGHT (CM)`, `Peso · WEIGHT (KG)`, `Envergadura · WINGSPAN (CM)`, `Años jugando · EXP`, `Mano · HAND`, `Frecuencia · FREQ`, `Preferencia · PREFER`.
- `form.moduleLabel` es igual que en chino.
- En `report.references`, `citation` y `url` son idénticos al chino; solo se traduce `usedFor`.

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `npx vitest run src/content && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content
git commit -m "feat(content): Spanish talent report texts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Componentes visuales compartidos

**Files:**
- Create: `src/components/RadarChart.tsx`, `src/components/SectionHeader.tsx`, `src/components/CompareBars.tsx`, `src/components/FitMeter.tsx`, `src/components/fields.tsx`
- Modify: `src/styles/global.css`
- Test: `src/components/RadarChart.test.tsx`, `src/components/CompareBars.test.tsx`

**Interfaces:**
- Produces:
  - `radarPoint(i, n, ratio, radius, cx, cy): [number, number]`;
  - `RadarChart({ axes: RadarAxis[]; max?: number; size?: number; primaryLabel?: string; secondaryLabel?: string })`, con `RadarAxis = { label: string; value: number; secondary?: number }`;
  - `SectionHeader({ mono: string; title: string; variant?: 'plain' | 'blue' | 'amber' })`;
  - `CompareBars({ rows: CompareRow[]; youLabel: string; themLabel: string })`, con `CompareRow = { label: string; you: number | null; them: number | null; unit?: string; digits?: number }`;
  - `FitMeter({ fit: number; label: string })`;
  - `TextField({ id, label, value, onChange, error?, hint?, inputMode? })` y `SelectField({ id, label, value, onChange, options: { value: string; label: string }[]; error?, placeholder? })`.

- [ ] **Step 1: Escribir los tests que fallan**

`src/components/RadarChart.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RadarChart, radarPoint } from './RadarChart'

describe('radarPoint', () => {
  it('el eje 0 apunta hacia arriba', () => {
    const [x, y] = radarPoint(0, 6, 1, 100, 170, 170)
    expect(x).toBeCloseTo(170, 6)
    expect(y).toBeCloseTo(70, 6)
  })
  it('ratio 0 cae en el centro', () => {
    expect(radarPoint(3, 6, 0, 100, 170, 170)).toEqual([170, 170])
  })
})

describe('RadarChart', () => {
  const axes = ['爆发力', '耐力', '反应速度', '网前手感', '移动速度', '后场高远'].map((label, i) => ({ label, value: i + 2, secondary: 5 }))
  it('dibuja las 6 etiquetas y las dos capas', () => {
    render(<RadarChart axes={axes} primaryLabel="当前" secondaryLabel="体型倾向" />)
    for (const a of axes) expect(screen.getByText(a.label)).toBeInTheDocument()
    expect(screen.getByTestId('radar-primary').getAttribute('points')!.split(' ')).toHaveLength(6)
    expect(screen.getByTestId('radar-secondary')).toBeInTheDocument()
    expect(screen.getByText('体型倾向')).toBeInTheDocument()
  })
  it('sin valores secundarios no dibuja la segunda capa', () => {
    render(<RadarChart axes={axes.map(({ label, value }) => ({ label, value }))} />)
    expect(screen.queryByTestId('radar-secondary')).toBeNull()
  })
})
```

`src/components/CompareBars.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { CompareBars } from './CompareBars'

it('muestra — cuando falta un dato y nunca NaN', () => {
  render(
    <CompareBars
      youLabel="你"
      themLabel="镜"
      rows={[
        { label: '身高', you: 163, them: 163, unit: 'cm' },
        { label: '体重', you: 51, them: null, unit: 'kg' },
        { label: 'BMI', you: 19.2, them: null, digits: 1 },
      ]}
    />,
  )
  expect(screen.getAllByText('—')).toHaveLength(2)
  expect(document.body.textContent).not.toContain('NaN')
  expect(screen.getByText('19.2')).toBeInTheDocument()
})
```

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npx vitest run src/components`
Expected: FAIL (`Failed to resolve import "./RadarChart"` / `"./CompareBars"`).

- [ ] **Step 3: Implementar**

`src/components/RadarChart.tsx`:

```tsx
export interface RadarAxis {
  label: string
  value: number
  secondary?: number
}

export function radarPoint(i: number, n: number, ratio: number, radius: number, cx: number, cy: number): [number, number] {
  if (ratio === 0) return [cx, cy]
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
  return [cx + radius * ratio * Math.cos(angle), cy + radius * ratio * Math.sin(angle)]
}

const ratioOf = (v: number, max: number) => Math.min(1, Math.max(0, v / max))
const pts = (list: [number, number][]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

export function RadarChart({
  axes,
  max = 10,
  size = 340,
  primaryLabel,
  secondaryLabel,
}: {
  axes: RadarAxis[]
  max?: number
  size?: number
  primaryLabel?: string
  secondaryLabel?: string
}) {
  const n = axes.length
  const c = size / 2
  const radius = size * 0.3
  const at = (i: number, ratio: number) => radarPoint(i, n, ratio, radius, c, c)
  const primary = axes.map((a, i) => at(i, ratioOf(a.value, max)))
  const hasSecondary = axes.every((a) => a.secondary !== undefined)
  const secondary = hasSecondary ? axes.map((a, i) => at(i, ratioOf(a.secondary!, max))) : []
  return (
    <figure className="radar">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={axes.map((a) => `${a.label} ${a.value.toFixed(1)}`).join('，')}>
        {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
          <polygon key={r} points={pts(axes.map((_, i) => at(i, r)))} className="radar-ring" />
        ))}
        {axes.map((_, i) => {
          const [x, y] = at(i, 1)
          return <line key={i} x1={c} y1={c} x2={x} y2={y} className="radar-spoke" />
        })}
        {[2, 4, 6, 8, 10].map((v) => {
          const [x, y] = at(0, v / max)
          return (
            <text key={v} x={x + 6} y={y + 4} className="radar-tick">
              {v}
            </text>
          )
        })}
        {hasSecondary && <polygon points={pts(secondary)} className="radar-secondary" data-testid="radar-secondary" />}
        <polygon points={pts(primary)} className="radar-primary" data-testid="radar-primary" />
        {primary.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={5} className="radar-dot" />
        ))}
        {axes.map((a, i) => {
          const [x, y] = at(i, 1.25)
          return (
            <text key={a.label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="radar-label">
              {a.label}
            </text>
          )
        })}
      </svg>
      {(primaryLabel || secondaryLabel) && (
        <figcaption className="radar-legend">
          {primaryLabel && <span className="legend-primary">{primaryLabel}</span>}
          {secondaryLabel && hasSecondary && <span className="legend-secondary">{secondaryLabel}</span>}
        </figcaption>
      )}
    </figure>
  )
}
```

`src/components/SectionHeader.tsx`:

```tsx
export function SectionHeader({ mono, title, variant = 'plain' }: { mono: string; title: string; variant?: 'plain' | 'blue' | 'amber' }) {
  if (variant === 'plain') {
    return (
      <h2 className="section-header">
        <span className="mono-label">{mono}</span>
        <span className="section-title">{title}</span>
      </h2>
    )
  }
  return (
    <h2 className={variant === 'blue' ? 'band-blue' : 'band-amber'}>
      <span className="mono-label">{mono}</span>
      <span className="band-title">{title}</span>
    </h2>
  )
}
```

`src/components/CompareBars.tsx`:

```tsx
export interface CompareRow {
  label: string
  you: number | null
  them: number | null
  unit?: string
  digits?: number
}

const show = (v: number | null, digits = 0) => (v === null || !Number.isFinite(v) ? '—' : v.toFixed(digits))

export function CompareBars({ rows, youLabel, themLabel }: { rows: CompareRow[]; youLabel: string; themLabel: string }) {
  return (
    <div className="compare">
      {rows.map((r) => {
        const max = Math.max(r.you ?? 0, r.them ?? 0) || 1
        return (
          <div key={r.label} className="compare-row">
            <span className="compare-label">{r.label}</span>
            <div className="compare-bars">
              <div className="compare-line">
                <span className="compare-who">{youLabel}</span>
                <span className="compare-bar you" style={{ width: `${((r.you ?? 0) / max) * 100}%` }} />
                <span className="compare-value">{show(r.you, r.digits)}</span>
              </div>
              <div className="compare-line">
                <span className="compare-who them">{themLabel}</span>
                <span className="compare-bar them" style={{ width: `${((r.them ?? 0) / max) * 100}%` }} />
                <span className="compare-value">{show(r.them, r.digits)}</span>
              </div>
            </div>
            {r.unit && <span className="compare-unit">{r.unit}</span>}
          </div>
        )
      })}
    </div>
  )
}
```

`src/components/FitMeter.tsx`:

```tsx
export function FitMeter({ fit, label }: { fit: number; label: string }) {
  return (
    <div className="fit">
      <div className="fit-track" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={fit} aria-label={label}>
        <div className="fit-bar" style={{ width: `${fit}%` }} />
      </div>
      <span className="fit-text">{label}</span>
    </div>
  )
}
```

`src/components/fields.tsx`:

```tsx
import type { HTMLAttributes } from 'react'

export function TextField({
  id, label, value, onChange, error, hint, inputMode = 'decimal',
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  hint?: string
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="field-input"
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
      {hint && !error && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  )
}

export function SelectField({
  id, label, value, onChange, options, error, placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  error?: string
  placeholder?: string
}) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <select
        id={id}
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  )
}
```

Añadir a `src/styles/global.css`:

```css
.radar { margin: 0; }
.radar svg { width: 100%; max-width: 380px; display: block; margin: 0 auto; }
.radar-ring { fill: none; stroke: #e6e8ee; }
.radar-spoke { stroke: #eceef3; }
.radar-tick { font-size: 12px; fill: #b3b7c2; font-family: var(--font-mono); }
.radar-primary { fill: rgba(11, 11, 15, 0.06); stroke: var(--ink); stroke-width: 2.5; stroke-linejoin: round; }
.radar-secondary { fill: none; stroke: var(--accent); stroke-width: 2; stroke-dasharray: 6 5; }
.radar-dot { fill: var(--ink); }
.radar-label { font-size: 14px; font-weight: 700; fill: var(--ink); }
.radar-legend { display: flex; gap: 16px; justify-content: center; font-size: 13px; color: var(--ink-2); }
.legend-primary::before, .legend-secondary::before { content: ''; display: inline-block; width: 18px; margin-right: 6px; vertical-align: middle; }
.legend-primary::before { border-top: 3px solid var(--ink); }
.legend-secondary::before { border-top: 2px dashed var(--accent); }

.section-header { display: flex; gap: 14px; align-items: center; margin: 12px 0 8px; font-size: 20px; }
.section-header .mono-label { text-align: left; }
.section-header .section-title { font-weight: 900; border-left: 1px solid var(--line); padding-left: 14px; }
.band-title { font-weight: 900; font-size: 18px; line-height: 1.3; }

.fit { display: grid; gap: 6px; }
.fit-track { height: 10px; background: var(--field); border-radius: 999px; overflow: hidden; }
.fit-bar { height: 100%; background: linear-gradient(90deg, var(--blue-1), var(--accent)); }
.fit-text { font-weight: 700; font-size: 14px; }

.compare { display: grid; gap: 12px; }
.compare-row { display: grid; grid-template-columns: 48px 1fr auto; gap: 10px; align-items: center; }
.compare-label { font-weight: 700; font-size: 14px; }
.compare-bars { display: grid; gap: 4px; }
.compare-line { display: grid; grid-template-columns: 28px 1fr 44px; gap: 6px; align-items: center; font-size: 13px; }
.compare-bar { height: 8px; border-radius: 999px; background: var(--ink); min-width: 2px; }
.compare-bar.them { background: var(--accent); }
.compare-who.them { color: var(--accent); }
.compare-value { font-family: var(--font-mono); text-align: right; }
.compare-unit { color: var(--muted); font-size: 12px; }
```

- [ ] **Step 4: Ejecutar y ver que pasan**

Run: `npx vitest run src/components && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components src/styles
git commit -m "feat(ui): radar chart, section headers, compare bars, fit meter and form fields

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Formulario del 天赋测评

**Files:**
- Create: `src/pages/talent/TalentForm.tsx`, `src/pages/talent/ReportPage.tsx` (provisional, se completa en la Tarea 13), `src/test/renderApp.tsx`
- Modify: `src/pages/talent/TalentPage.tsx`, `src/App.tsx` (ruta `/talent/report/:id` y exportar `LangBridge`)
- Test: `src/pages/talent/TalentForm.test.tsx`

**Interfaces:**
- Consumes:
  - `emptyTalentForm`, `validateTalentForm`, `RANGES`, `TalentFormValues`, `FormField`;
  - `useStore().addTalent`, `useTalentContent()`, `format()`;
  - `TextField`, `SelectField`;
  - `ABILITY_KEYS`, `FIELD_TEST_KEYS`.
- Produces:
  - ruta `/talent` (formulario) y `/talent/report/:id`;
  - `renderApp(path: string)`, ayuda de test que monta toda la app en un `MemoryRouter`. La usan las tareas 13, 15, 17 y 18.
- El formulario navega a `/talent/report/<id>` tras guardar. Si llega con `location.state.missingReport`, muestra `form.missingReport`.

- [ ] **Step 1: Ayuda de test y exportaciones**

En `src/App.tsx`, exportar `LangBridge` (`export function LangBridge…`) y añadir la ruta:

```tsx
<Route path="/talent/report/:id" element={<ReportPage />} />
```

con `import ReportPage from './pages/talent/ReportPage'`.

`src/pages/talent/ReportPage.tsx` (provisional):

```tsx
import { useParams } from 'react-router-dom'

export default function ReportPage() {
  const { id } = useParams()
  return <p data-testid="report-id">{id}</p>
}
```

`src/test/renderApp.tsx`:

```tsx
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes, LangBridge } from '../App'
import { StoreProvider } from '../lib/StoreProvider'

export function renderApp(path: string) {
  return render(
    <StoreProvider>
      <LangBridge>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </LangBridge>
    </StoreProvider>,
  )
}
```

- [ ] **Step 2: Escribir el test que falla**

`src/pages/talent/TalentForm.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { talentZh as c } from '../../content/zh/talent'
import { STORAGE_KEY } from '../../lib/storage'
import { renderApp } from '../../test/renderApp'

async function fillGolden(weight = '51') {
  const u = userEvent.setup()
  await u.selectOptions(screen.getByLabelText(c.form.fields.sex), 'F')
  await u.type(screen.getByLabelText(c.form.fields.age), '24')
  await u.type(screen.getByLabelText(c.form.fields.heightCm), '163')
  await u.type(screen.getByLabelText(c.form.fields.weightKg), weight)
  await u.type(screen.getByLabelText(c.form.fields.wingspanCm), '164')
  await u.type(screen.getByLabelText(c.form.fields.yearsPlaying), '2')
  const levels = { power: 2, endurance: 3, reaction: 1, netTouch: 2, speed: 2, rearCourt: 2, tactics: 1, mental: 3 } as const
  for (const [k, v] of Object.entries(levels)) {
    // Anclado al inicio: la etiqueta empieza por el nombre y así no choca con las aclaraciones de otras capacidades.
    await u.selectOptions(screen.getByLabelText(new RegExp('^' + c.abilities[k as keyof typeof levels].name)), String(v))
  }
  return u
}

describe('TalentForm', () => {
  it('muestra los errores obligatorios al enviar vacío', async () => {
    renderApp('/talent')
    await userEvent.click(screen.getByRole('button', { name: c.form.submit }))
    expect(screen.getAllByText(c.form.errors.required).length).toBeGreaterThanOrEqual(13)
  })
  it('guarda el perfil y abre el informe', async () => {
    renderApp('/talent')
    const u = await fillGolden('51,5')
    await u.click(screen.getByRole('button', { name: c.form.submit }))
    const id = screen.getByTestId('report-id').textContent!
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.talent[0].id).toBe(id)
    expect(saved.talent[0].input.weightKg).toBe(51.5)
  })
  it('pide confirmación con envergadura anómala', async () => {
    renderApp('/talent')
    const u = await fillGolden()
    await u.clear(screen.getByLabelText(c.form.fields.wingspanCm))
    await u.type(screen.getByLabelText(c.form.fields.wingspanCm), '195')
    await u.click(screen.getByRole('button', { name: c.form.submit }))
    expect(screen.getByText(c.form.warnings.wingspanDiff)).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: c.form.confirmWarnings }))
    expect(screen.getByTestId('report-id')).toBeInTheDocument()
  })
  it('avisa si llega desde un informe inexistente', () => {
    renderApp('/talent/report/nope')
    expect(screen.queryByTestId('report-id')).not.toBeNull()
  })
})
```

(El último caso cambia en la Tarea 13, cuando `ReportPage` redirige; allí se reescribe.)

- [ ] **Step 3: Ejecutar y ver que falla**

Run: `npx vitest run src/pages/talent`
Expected: FAIL (no existe el botón `c.form.submit`).

- [ ] **Step 4: Implementar `TalentForm.tsx` y `TalentPage.tsx`**

`src/pages/talent/TalentForm.tsx`:

```tsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SelectField, TextField } from '../../components/fields'
import { useTalentContent } from '../../content'
import { ABILITY_KEYS, FIELD_TEST_KEYS, type AbilityKey, type FieldTestKey, type Level } from '../../engine/types'
import { emptyTalentForm, RANGES, validateTalentForm, type FormField, type TalentFormValues, type WarningCode } from '../../engine/validate'
import { format } from '../../i18n/I18nProvider'
import { useStore } from '../../lib/StoreProvider'

type NumericKey = 'age' | 'heightCm' | 'weightKg' | 'wingspanCm' | 'yearsPlaying'

export function TalentForm() {
  const c = useTalentContent()
  const { addTalent } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const missing = (location.state as { missingReport?: boolean } | null)?.missingReport === true
  const [values, setValues] = useState<TalentFormValues>(emptyTalentForm)
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({})
  const [pendingWarnings, setPendingWarnings] = useState<WarningCode[]>([])

  const errorText = (field: FormField, code: 'required' | 'number' | 'range') => {
    if (code !== 'range') return c.form.errors[code]
    const [min, max] = RANGES[field as keyof typeof RANGES]
    return format(c.form.errors.range, { min, max })
  }

  const submit = (confirmed: boolean) => {
    const r = validateTalentForm(values)
    const next: Partial<Record<FormField, string>> = {}
    for (const [f, code] of Object.entries(r.errors)) next[f as FormField] = errorText(f as FormField, code!)
    setErrors(next)
    if (!r.input) {
      setPendingWarnings([])
      return
    }
    if (r.warnings.length > 0 && !confirmed) {
      setPendingWarnings(r.warnings)
      return
    }
    const rec = addTalent(r.input)
    navigate(`/talent/report/${rec.id}`)
  }

  const setNum = (k: NumericKey) => (v: string) => setValues((s) => ({ ...s, [k]: v }))
  const setTest = (k: FieldTestKey) => (v: string) => setValues((s) => ({ ...s, tests: { ...s.tests, [k]: v } }))
  const setLevel = (k: AbilityKey) => (v: string) =>
    setValues((s) => ({ ...s, levels: { ...s.levels, [k]: Number(v) as Level | 0 } }))

  const numeric: NumericKey[] = ['age', 'heightCm', 'weightKg', 'wingspanCm', 'yearsPlaying']

  return (
    <form
      className="stack"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        submit(false)
      }}
    >
      {missing && <p className="notice" role="status">{c.form.missingReport}</p>}
      <SelectField
        id="sex"
        label={c.form.fields.sex}
        value={values.sex}
        placeholder={c.form.choose}
        options={(['M', 'F'] as const).map((v) => ({ value: v, label: c.options.sex[v] }))}
        onChange={(v) => setValues((s) => ({ ...s, sex: v as TalentFormValues['sex'] }))}
        error={errors.sex}
      />
      {numeric.map((k) => (
        <TextField
          key={k}
          id={k}
          label={c.form.fields[k]}
          value={values[k]}
          onChange={setNum(k)}
          error={errors[k]}
          hint={k === 'wingspanCm' ? c.form.wingspanHint : undefined}
        />
      ))}
      <SelectField
        id="hand"
        label={c.form.fields.hand}
        value={values.hand}
        options={(['R', 'L'] as const).map((v) => ({ value: v, label: c.options.hand[v] }))}
        onChange={(v) => setValues((s) => ({ ...s, hand: v as TalentFormValues['hand'] }))}
      />
      <SelectField
        id="freq"
        label={c.form.fields.freq}
        value={values.freq}
        options={(['lt1', '1', '2-3', '4+'] as const).map((v) => ({ value: v, label: c.options.freq[v] }))}
        onChange={(v) => setValues((s) => ({ ...s, freq: v as TalentFormValues['freq'] }))}
      />
      <SelectField
        id="preference"
        label={c.form.fields.preference}
        value={values.preference}
        options={(['all', 'singles', 'doubles', 'mixed'] as const).map((v) => ({ value: v, label: c.options.preference[v] }))}
        onChange={(v) => setValues((s) => ({ ...s, preference: v as TalentFormValues['preference'] }))}
      />

      <h2 className="form-section">{c.form.abilitiesTitle}</h2>
      <p className="field-hint">{c.form.abilitiesHint}</p>
      {ABILITY_KEYS.map((k) => (
        <SelectField
          key={k}
          id={`level-${k}`}
          label={`${c.abilities[k].name}（${c.abilities[k].hint}）`}
          value={values.levels[k] === 0 ? '' : String(values.levels[k])}
          placeholder={c.form.choose}
          options={c.abilities[k].levels.map((text, i) => ({ value: String(i + 1), label: `${i + 1} · ${text}` }))}
          onChange={setLevel(k)}
          error={errors[k]}
        />
      ))}

      <details className="tests">
        <summary>{c.form.testsTitle}</summary>
        <p className="field-hint">{c.form.testsHint}</p>
        {FIELD_TEST_KEYS.map((k) => (
          <TextField
            key={k}
            id={k}
            label={`${c.tests[k].label}（${c.tests[k].unit}）`}
            value={values.tests[k]}
            onChange={setTest(k)}
            error={errors[k]}
            hint={c.tests[k].hint}
          />
        ))}
      </details>

      {pendingWarnings.length > 0 && (
        <div className="notice" role="alert">
          {pendingWarnings.map((w) => (
            <p key={w}>{c.form.warnings[w]}</p>
          ))}
          <button type="button" className="btn" onClick={() => submit(true)}>
            {c.form.confirmWarnings}
          </button>
        </div>
      )}
      <button type="submit" className="btn btn-primary">
        {c.form.submit}
      </button>
    </form>
  )
}
```

Nota: si una prueba real tiene error y la sección `<details>` está cerrada, el usuario no lo vería. Abre `<details>` automáticamente cuando haya errores en pruebas: `open={FIELD_TEST_KEYS.some((k) => errors[k]) || undefined}`.

`src/pages/talent/TalentPage.tsx`:

```tsx
import { useTalentContent } from '../../content'
import { TalentForm } from './TalentForm'

export default function TalentPage() {
  const c = useTalentContent()
  return (
    <section className="card">
      <p className="mono-label">{c.form.moduleLabel}</p>
      <h1 className="page-title">{c.form.title}</h1>
      <p className="page-subtitle">{c.form.subtitle}</p>
      <TalentForm />
    </section>
  )
}
```

Añadir a `global.css`:

```css
.form-section { margin: 12px 0 0; font-size: 20px; font-weight: 900; }
.tests { background: var(--field); border-radius: var(--radius-field); padding: 12px 16px; }
.tests summary { font-weight: 700; cursor: pointer; }
.tests[open] { display: grid; gap: 12px; }
.tests .field-input { background: #fff; }
```

- [ ] **Step 5: Ejecutar y ver que pasa**

Run: `npx vitest run src/pages/talent && npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "feat(talent): assessment form with validation, warnings and save

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Informe del 天赋测评 — **primer hito**

**Files:**
- Modify: `src/pages/talent/ReportPage.tsx` (sustituye el provisional)
- Create: `src/pages/talent/report/RadarSection.tsx`, `PhysicalSection.tsx`, `SinglesSection.tsx`, `DoublesSection.tsx`, `MirrorSection.tsx`, `TrainingSection.tsx`, `NotesSection.tsx`, `ReferencesSection.tsx`
- Modify: `src/pages/talent/TalentForm.test.tsx` (último caso), `src/styles/global.css`
- Test: `src/pages/talent/ReportPage.test.tsx`

**Interfaces:**
- Consumes:
  - `analyzeTalent`, `TalentResult`, `TalentInput`;
  - `useTalentContent`, `joinList`, `pick`, `format`, `useI18n`, `useStore`;
  - componentes de la Tarea 11.
- Produces: la ruta `/talent/report/:id` completa. Cada sección es un componente con props `{ input: TalentInput; result: TalentResult }`. La Tarea 19 añade el botón de compartir al `ReportHeader` de esta página.

- [ ] **Step 1: Escribir el test que falla**

`src/pages/talent/ReportPage.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { talentEs } from '../../content/es/talent'
import { talentZh as c } from '../../content/zh/talent'
import { GOLDEN } from '../../engine/testkit'
import { emptyState, STORAGE_KEY } from '../../lib/storage'
import { renderApp } from '../../test/renderApp'

function seed() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...emptyState(), talent: [{ id: 'r1', createdAt: '2026-09-26T10:00:00.000Z', engineVersion: 1, input: GOLDEN }] }),
  )
}

describe('ReportPage', () => {
  it('muestra el informe coherente del perfil de referencia', () => {
    seed()
    renderApp('/talent/report/r1')
    // getAllByText: el mismo nombre puede aparecer en varias secciones.
    expect(screen.getAllByText(new RegExp(c.singles.control.name)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(new RegExp(c.doubles.back.name)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(new RegExp(c.bodyTypes.lightAgile.name.replace(/[()（）]/g, '.'))).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/19\.2/).length).toBeGreaterThan(0)
    // El consejo de pareja nombra el rol complementario (前场), nunca el propio.
    const partner = screen.getByTestId('partner-advice').textContent!
    expect(partner).toContain(c.doubles.front.name)
    expect(document.body.textContent).not.toContain('NaN')
    expect(document.body.textContent).not.toContain('undefined')
  })
  it('id inexistente → vuelve al formulario con aviso', () => {
    renderApp('/talent/report/nope')
    expect(screen.getByText(c.form.missingReport)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: c.form.submit })).toBeInTheDocument()
  })
  it('cambiar de idioma traduce todo el informe', async () => {
    seed()
    renderApp('/talent/report/r1')
    await userEvent.click(screen.getByRole('button', { name: '切换到西班牙语' }))
    expect(screen.getAllByText(new RegExp(talentEs.singles.control.name)).length).toBeGreaterThan(0)
    expect(document.body.textContent).not.toMatch(new RegExp(c.singles.control.name))
  })
})
```

Actualiza el último caso de `TalentForm.test.tsx`:

```tsx
it('avisa si llega desde un informe inexistente', () => {
  renderApp('/talent/report/nope')
  expect(screen.getByText(c.form.missingReport)).toBeInTheDocument()
})
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npx vitest run src/pages/talent`
Expected: FAIL (el informe provisional no muestra el estilo).

- [ ] **Step 3: Implementar la página y las secciones**

`src/pages/talent/ReportPage.tsx`:

```tsx
import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTalentContent } from '../../content'
import { analyzeTalent } from '../../engine/talent'
import { useStore } from '../../lib/StoreProvider'
import { DoublesSection } from './report/DoublesSection'
import { MirrorSection } from './report/MirrorSection'
import { NotesSection } from './report/NotesSection'
import { PhysicalSection } from './report/PhysicalSection'
import { RadarSection } from './report/RadarSection'
import { ReferencesSection } from './report/ReferencesSection'
import { SinglesSection } from './report/SinglesSection'
import { TrainingSection } from './report/TrainingSection'

export default function ReportPage() {
  const { id } = useParams()
  const { state } = useStore()
  const c = useTalentContent()
  const record = state.talent.find((r) => r.id === id)
  const result = useMemo(() => (record ? analyzeTalent(record.input) : null), [record])
  if (!record || !result) return <Navigate to="/talent" replace state={{ missingReport: true }} />
  const props = { input: record.input, result }
  const doublesFirst = record.input.preference === 'doubles' || record.input.preference === 'mixed'
  return (
    <article className="card report stack">
      <div className="row">
        <Link to="/" className="btn btn-ghost">← {c.report.back}</Link>
        <Link to="/talent" className="btn">🔄 {c.report.retest}</Link>
      </div>
      <p className="mono-label report-mono">REPORT</p>
      <h1 className="report-title">🏸 {c.report.title}</h1>
      <RadarSection {...props} />
      <PhysicalSection {...props} />
      {doublesFirst ? (
        <>
          <DoublesSection {...props} />
          <SinglesSection {...props} />
        </>
      ) : (
        <>
          <SinglesSection {...props} />
          <DoublesSection {...props} />
        </>
      )}
      <MirrorSection {...props} />
      <TrainingSection {...props} />
      <NotesSection {...props} />
      <ReferencesSection />
    </article>
  )
}
```

`src/pages/talent/report/RadarSection.tsx`:

```tsx
import { RadarChart } from '../../../components/RadarChart'
import { useTalentContent } from '../../../content'
import type { TalentResult } from '../../../engine/talent'
import { RADAR_KEYS, type TalentInput } from '../../../engine/types'

export function RadarSection({ result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  return (
    <section>
      <RadarChart
        axes={RADAR_KEYS.map((k) => ({ label: c.abilities[k].name, value: result.current[k], secondary: result.tendency[k] }))}
        primaryLabel={c.report.radarCurrent}
        secondaryLabel={c.report.radarTendency}
      />
      <p className="field-hint">{c.report.radarNote}</p>
    </section>
  )
}
```

`src/pages/talent/report/PhysicalSection.tsx`:

```tsx
import { SectionHeader } from '../../../components/SectionHeader'
import { useTalentContent } from '../../../content'
import type { TalentResult } from '../../../engine/talent'
import type { TalentInput } from '../../../engine/types'
import { format } from '../../../i18n/I18nProvider'

const one = (n: number) => n.toFixed(1)

export function PhysicalSection({ input, result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  const r = c.report
  const { body } = result
  const diag = (k: 'tactics' | 'mental', title: string) => (
    <div className="diag">
      <h3>{format(title, { score: one(result.current[k]) })}</h3>
      <p>{format(c.abilities[k].diag[result.diagnosis[k]], { score: one(result.current[k]) })}</p>
      <p className="muted">{c.abilities[k].tips[result.diagnosis[k]]}</p>
    </div>
  )
  return (
    <section className="stack">
      <SectionHeader mono="PHYSICAL ANALYSIS" title={r.physicalTitle} />
      <p>{format(r.bodyLine, { sex: c.options.sex[input.sex], height: input.heightCm, weight: input.weightKg, bmi: one(body.bmi), band: r.bmiBands[body.bmiBand] })}</p>
      <p>
        {format(r.wingspanLine, { diff: body.apeIndexCm, ratio: body.apeRatio.toFixed(3) })}
        {body.wingspanAssumed && <span className="muted"> {r.wingspanAssumed}</span>}
      </p>
      <p>{format(r.yearsLine, { years: input.yearsPlaying })}</p>
      <p>
        <strong>{r.bodyTypeLabel}：{c.bodyTypes[body.bodyType].name}</strong> — {c.bodyTypes[body.bodyType].summary}
      </p>
      {result.bodyClaims.map((claim) => (
        <p key={`${claim.kind}-${claim.key}`} className="claim">
          {format((claim.kind === 'advantage' ? r.claimAdvantage : r.claimDisadvantage)[claim.level], {
            ability: c.abilities[claim.key].name,
            score: one(result.current[claim.key]),
          })}
        </p>
      ))}
      <p>
        <strong>{r.ageBands[body.ageBand].name}</strong>：{r.ageBands[body.ageBand].advice}
      </p>
      <p>
        {format(r.strongWeak, {
          strong: c.abilities[result.strongest].name,
          strongScore: one(result.current[result.strongest]),
          weak: c.abilities[result.weakest].name,
          weakScore: one(result.current[result.weakest]),
        })}
      </p>
      {diag('tactics', r.tacticsTitle)}
      {diag('mental', r.mentalTitle)}
    </section>
  )
}
```

`src/pages/talent/report/SinglesSection.tsx`:

```tsx
import { FitMeter } from '../../../components/FitMeter'
import { SectionHeader } from '../../../components/SectionHeader'
import { joinList, useTalentContent } from '../../../content'
import type { TalentResult } from '../../../engine/talent'
import type { TalentInput } from '../../../engine/types'
import { format } from '../../../i18n/I18nProvider'

export function SinglesSection({ result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  const r = c.report
  const s = result.singles
  const style = c.singles[s.top]
  const runner = s.ranking[1]
  const names = (keys: typeof s.drivers) => joinList(c, keys.map((k) => c.abilities[k].name))
  return (
    <section className="stack">
      <SectionHeader variant="blue" mono="SINGLE STRATEGY · 单打专属" title={r.singlesBand} />
      <p className="small">{r.singlesIntro}</p>
      <h3 className="style-name">{style.emoji} {style.name}</h3>
      <p className="muted">{style.tagline}</p>
      <FitMeter fit={s.ranking[0].fit} label={format(r.fitLine, { fit: s.ranking[0].fit, band: r.fitBands[s.fitBand] })} />
      <p><strong>{r.fitAnalysis}：</strong>{format(style.fitIntro, { fit: s.ranking[0].fit })}</p>
      <p>{s.drivers.length ? format(r.driversLine, { list: names(s.drivers) }) : r.noDrivers}</p>
      <p>{s.gaps.length ? format(r.gapsLine, { list: names(s.gaps) }) : r.noGaps}</p>
      {(['coreTactic', 'opening', 'midgame', 'keyPoints', 'stamina', 'pitfalls', 'matchups'] as const).map((k) => (
        <p key={k}><strong>{r.singlesLabels[k]}：</strong>{style[k]}</p>
      ))}
      <p className="muted">{format(r.runnerUp, { emoji: c.singles[runner.style].emoji, name: c.singles[runner.style].name, fit: runner.fit })}</p>
    </section>
  )
}
```

`src/pages/talent/report/DoublesSection.tsx`:

```tsx
import { FitMeter } from '../../../components/FitMeter'
import { SectionHeader } from '../../../components/SectionHeader'
import { joinList, useTalentContent } from '../../../content'
import type { TalentResult } from '../../../engine/talent'
import type { TalentInput } from '../../../engine/types'
import { format } from '../../../i18n/I18nProvider'

export function DoublesSection({ result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  const r = c.report
  const d = result.doubles
  const role = c.doubles[d.role]
  const names = (keys: typeof d.drivers) => joinList(c, keys.map((k) => c.abilities[k].name))
  return (
    <section className="stack">
      <SectionHeader variant="amber" mono="DOUBLE TACTICS · 双打专属" title={r.doublesBand} />
      <p className="small">{r.doublesIntro}</p>
      <h3 className="style-name">{role.emoji} {role.name}</h3>
      <p className="muted">{role.tagline}</p>
      <FitMeter fit={d.fit} label={format(r.fitLine, { fit: d.fit, band: r.fitBands[d.fitBand] })} />
      <p><strong>{r.fitAnalysis}：</strong>{format(role.fitIntro, { fit: d.fit })}</p>
      <p>{d.drivers.length ? format(r.driversLine, { list: names(d.drivers) }) : r.noDrivers}</p>
      <p>{d.gaps.length ? format(r.gapsLine, { list: names(d.gaps) }) : r.noGaps}</p>
      {(['coreTactic', 'rotation', 'positioning', 'positioningDont', 'signals', 'signalsDont'] as const).map((k) => (
        <p key={k}><strong>{r.doublesLabels[k]}：</strong>{role[k]}</p>
      ))}
      <p data-testid="partner-advice">
        <strong>{r.doublesLabels.partner}：</strong>
        {format(r.partner[d.role], { role: c.doubles[d.partner.role].name, strength: c.abilities[d.partner.strength].name })}
      </p>
      <p><strong>{r.doublesLabels.mixed}：</strong>{r.mixedNotes[d.mixedNote]}</p>
    </section>
  )
}
```

`src/pages/talent/report/MirrorSection.tsx`:

```tsx
import { CompareBars } from '../../../components/CompareBars'
import { SectionHeader } from '../../../components/SectionHeader'
import { pick, useTalentContent } from '../../../content'
import { athleteBmi } from '../../../engine/mirror'
import type { TalentResult } from '../../../engine/talent'
import type { TalentInput } from '../../../engine/types'
import { format, useI18n } from '../../../i18n/I18nProvider'

export function MirrorSection({ input, result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  const { lang } = useI18n()
  const r = c.report
  const [top, ...alternates] = result.mirrors.singles
  const pairMirror = result.mirrors.doubles[0]
  const statusText = (status: 'active' | 'retired' | 'split', year?: number | null) =>
    status === 'retired' ? format(r.status.retired, { year: year ?? '' }) : r.status[status]
  return (
    <section className="stack">
      <SectionHeader mono="PRO MIRROR" title={r.mirrorTitle} />
      {top && (
        <div className="mirror-card">
          <p className="mono-label left">🎯 {r.singlesMirror}</p>
          <h3>
            {top.athlete.nameEn} {top.athlete.nameZh}
          </h3>
          <p className="muted">
            {pick(top.athlete.country, lang)} · {top.athlete.heightCm}cm
            {top.athlete.weightKg !== null && ` / ${top.athlete.weightKg}kg`} · {statusText(top.athlete.status, top.athlete.retiredYear)}
          </p>
          <p>{pick(top.athlete.highlights, lang)}</p>
          <p>{pick(top.athlete.desc, lang)}</p>
          <p className="muted">
            {r.styleMatch[top.styleMatch]}
            {top.bmiDiff !== null && ` · ${format(r.bmiDiffLine, { diff: Math.abs(top.bmiDiff).toFixed(1) })}`}
          </p>
          <CompareBars
            youLabel={r.you}
            themLabel={r.mirror}
            rows={[
              { label: r.height, you: input.heightCm, them: top.athlete.heightCm, unit: 'cm' },
              { label: r.weight, you: input.weightKg, them: top.athlete.weightKg, unit: 'kg' },
              { label: r.bmi, you: result.body.bmi, them: athleteBmi(top.athlete.heightCm, top.athlete.weightKg), digits: 1 },
            ]}
          />
          {alternates.length > 0 && (
            <p className="muted">
              {r.alternates}：{alternates.map((m) => `${m.athlete.nameZh}（${m.athlete.heightCm}cm）`).join(c.list.sep)}
            </p>
          )}
        </div>
      )}
      {pairMirror && (
        <div className="mirror-card">
          <p className="mono-label left">🤝 {r.doublesMirror}</p>
          <h3>{pairMirror.pair.pairEn}</h3>
          <p className="muted">
            {pairMirror.pair.pairZh} · {r.events[pairMirror.pair.event]} · {pick(pairMirror.pair.country, lang)} · {statusText(pairMirror.pair.status)}
          </p>
          <p>{pick(pairMirror.pair.style, lang)}</p>
          <p>
            <strong>
              {format(r.matchedPlayer, {
                name: pairMirror.pair.players[pairMirror.playerIndex].nameZh,
                position: r.positions[pairMirror.pair.players[pairMirror.playerIndex].position],
              })}
            </strong>{' '}
            {pick(pairMirror.pair.players[pairMirror.playerIndex].role, lang)}
          </p>
          <CompareBars
            youLabel={r.you}
            themLabel={r.mirror}
            rows={[
              { label: r.height, you: input.heightCm, them: pairMirror.pair.players[pairMirror.playerIndex].heightCm, unit: 'cm' },
              { label: r.weight, you: input.weightKg, them: pairMirror.pair.players[pairMirror.playerIndex].weightKg, unit: 'kg' },
            ]}
          />
        </div>
      )}
    </section>
  )
}
```

`src/pages/talent/report/TrainingSection.tsx`:

```tsx
import { SectionHeader } from '../../../components/SectionHeader'
import { useTalentContent } from '../../../content'
import type { TalentResult } from '../../../engine/talent'
import type { TalentInput } from '../../../engine/types'

export function TrainingSection({ result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  return (
    <section className="stack">
      <SectionHeader mono="TRAINING" title={c.report.trainingTitle} />
      <ol className="drills">
        {result.drills.map((id) => (
          <li key={id}>
            <strong>{c.report.drills[id].name}</strong>
            <p>{c.report.drills[id].how}</p>
            <p className="muted">{c.report.drills[id].dose}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
```

`src/pages/talent/report/NotesSection.tsx`:

```tsx
import { useTalentContent } from '../../../content'
import type { TalentResult } from '../../../engine/talent'
import type { TalentInput } from '../../../engine/types'

export function NotesSection({ result }: { input: TalentInput; result: TalentResult }) {
  const c = useTalentContent()
  if (result.flags.length === 0) return null
  return (
    <section className="notice stack">
      <strong>{c.report.flagsTitle}</strong>
      {result.flags.map((f) => (
        <p key={f}>{c.report.flags[f]}</p>
      ))}
    </section>
  )
}
```

`src/pages/talent/report/ReferencesSection.tsx`:

```tsx
import { SectionHeader } from '../../../components/SectionHeader'
import { useTalentContent } from '../../../content'

export function ReferencesSection() {
  const c = useTalentContent()
  return (
    <section className="stack">
      <SectionHeader mono="REFERENCES" title={c.report.referencesTitle} />
      <ol className="refs">
        {c.report.references.map((ref) => (
          <li key={ref.id}>
            <a href={ref.url} target="_blank" rel="noreferrer">{ref.citation}</a>
            <span className="muted"> — {ref.usedFor}</span>
          </li>
        ))}
      </ol>
      <p className="field-hint">{c.report.disclaimer}</p>
    </section>
  )
}
```

Añadir a `global.css`:

```css
.report-mono { text-align: right; }
.report-title { margin: 0; font-size: 26px; font-weight: 900; padding-bottom: 16px; border-bottom: 1px solid var(--line); }
.report p { margin: 0; }
.small { font-size: 14px; color: var(--ink-2); }
.style-name { margin: 8px 0 0; font-size: 24px; font-weight: 900; }
.diag h3 { margin: 8px 0 4px; font-size: 16px; }
.claim { padding-left: 12px; border-left: 3px solid var(--line); }
.mirror-card { border: 1px solid var(--line); border-radius: 22px; padding: 18px; display: grid; gap: 8px; }
.mirror-card h3 { margin: 0; font-size: 22px; font-weight: 900; }
.mono-label.left { text-align: left; }
.drills, .refs { margin: 0; padding-left: 20px; display: grid; gap: 12px; }
.refs { font-size: 14px; }
.refs a { word-break: break-word; }
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `npm test && npm run typecheck && npm run build`
Expected: PASS y build sin errores.

- [ ] **Step 5: Revisión visual rápida del hito**

Crea `.claude/launch.json`:

```json
{ "version": "0.0.1", "configurations": [{ "name": "dev", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev", "--", "--port", "5173"], "port": 5173 }] }
```

Arranca con `preview_start` (nombre `dev`) y configura el viewport a 375×812. Rellena el perfil de referencia y comprueba:
- el radar cabe sin cortar etiquetas en chino ni en español;
- no hay scroll horizontal;
- las bandas azul y ámbar se ven como en las capturas.

Haz una captura para el usuario. Corrige el CSS si hace falta.

- [ ] **Step 6: Commit**

```bash
git add src .claude/launch.json
git commit -m "feat(talent): full coherent report with radar, analysis, singles, doubles, mirrors and training

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

**Hito 1 completado:** enseña al usuario el 天赋测评 funcionando (captura en móvil, chino y español) antes de seguir.
