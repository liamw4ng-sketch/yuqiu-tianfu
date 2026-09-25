# 羽球天赋 — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** construir la web app pública 羽球天赋 (chino con botón de español): 天赋测评 con informe completo, 业余评级, 羽球MBTI, 我的档案 e imagen para compartir.

**Architecture:** SPA estática con React + TypeScript + Vite, sin servidor.
- Un **motor** puro (`src/engine/`) devuelve claves y números.
- El **contenido** (`src/content/{zh,es}/`) aporta los textos de cada idioma.
- Las **páginas** combinan motor y contenido.
- El perfil vive en `localStorage` (`yuqiu.v1`).

**Tech Stack:**
- Runtime: React 19, react-router-dom (HashRouter), html-to-image.
- Build y lenguaje: Vite, TypeScript strict.
- Tests: Vitest, Testing Library, jsdom.

**Spec:** `docs/superpowers/specs/2026-09-25-badminton-app-design.md`. Léela antes de empezar; este plan la implementa.

**Material de apoyo:**
- `docs/superpowers/prototype/engine.ts`: prototipo verificado del motor. Los números de los tests salen de ahí.
- `docs/superpowers/research/*`: investigación verificada. La consumen las tareas 5, 9, 10, 14 y 16.

## Global Constraints

- Node ≥ 20. Proyecto en la raíz del repo (`/Users/yijun/App badminton`).
- **Dependencias permitidas:**
  - runtime: `react`, `react-dom`, `react-router-dom`, `html-to-image`;
  - desarrollo: `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@types/react`, `@types/react-dom`.
  - Ninguna otra sin preguntar.
- `src/engine/` es puro: sin React, sin textos visibles, sin `Date.now()` ni `Math.random()`.
- Todo texto visible sale de `src/i18n/ui.{zh,es}.ts` o `src/content/{zh,es}/`. Excepción: las etiquetas decorativas en inglés y monoespaciada ("MODULE 01", "REPORT", "PHYSICAL ANALYSIS"…), iguales en los dos idiomas.
- Chino simplificado. Pronombre 她 para jugadoras y 他 para jugadores.
- Solo entran en `src/data/` jugadores con `verified: true` en la investigación.
- Clave de almacenamiento `yuqiu.v1`, como máximo 20 registros por módulo.
- **Rangos de validación:**
  - edad 8–80, altura 130–220 cm, peso 30–150 kg, envergadura 120–240 cm (opcional), años jugando 0–50;
  - salto vertical 5–120 cm, comba 1 min 10–350, Cooper 12 min 500–5000 m, test de la regla 0–40 cm.
- Pensada para móvil: contenido de 640px como máximo, probada a 375×812.
- Cada tarea termina con `npm test` en verde, `npm run typecheck` sin errores y un commit que acaba en `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

Entradas que la spec implica y que se fijan con un test en la tarea dueña del código:

1. **Coma decimal española** ("51,5" kg, "1,5" años) → se acepta como 51.5 / 1.5. Test en la Tarea 7 (`parseNumber`) y en la Tarea 12 (formulario).
2. **`localStorage` corrupto, de otra versión o bloqueado** (Safari privado) → la app arranca vacía y funciona sin guardar. Test en la Tarea 8.
3. **Informe con id inexistente** (datos borrados o enlace viejo) → vuelve al formulario con un aviso, sin romperse. Test en la Tarea 13.
4. **Jugador espejo con peso `null`** → la comparación muestra "—", nunca "NaN". Tests en las Tareas 6 y 11.
5. **Cambio de idioma con el informe abierto** → cambian todas las secciones, incluidas las descripciones de los jugadores. Test en la Tarea 13.

## Mapa de archivos

```
package.json, tsconfig.json, vite.config.ts, index.html, .gitignore, netlify.toml, README.md
public/manifest.webmanifest, public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png
scripts/make-icons.py
src/main.tsx                      arranque
src/App.tsx                       providers + rutas
src/styles/tokens.css, global.css sistema visual
src/i18n/types.ts                 Lang
src/i18n/ui.zh.ts, ui.es.ts       textos de interfaz (claves planas)
src/i18n/I18nProvider.tsx         contexto de idioma + format()
src/engine/types.ts               tipos compartidos del motor
src/engine/constants.ts           umbrales y coeficientes
src/engine/stats.ts               mean, sd, clamp, correlation, argBy
src/engine/body.ts                IMC, bandas, 身材画像, diagLevel, bodyClaims
src/engine/abilities.ts           normas de pruebas, puntuación actual, tendencia, mezcla
src/engine/singles.ts             6 estilos de individual
src/engine/doubles.ts             roles de dobles, pareja, nota de mixto
src/engine/mirror.ts              espejos de individual y dobles
src/engine/drills.ts              catálogo y selección de ejercicios
src/engine/validate.ts            formulario → TalentInput
src/engine/talent.ts              analyzeTalent → TalentResult
src/engine/rating.ts              业余评级 (preguntas, topes, reglas, puntuación)
src/engine/mbti.ts                羽球MBTI (preguntas, puntuación, parejas)
src/data/athletes.ts              tipos + validateAthlete + SINGLES + PAIRS
src/data/athletes-singles.json, athletes-doubles.json
src/content/types.ts              TalentContent, RatingContent, MbtiContent
src/content/zh/talent.ts, rating.ts, mbti.ts
src/content/es/talent.ts, rating.ts, mbti.ts
src/content/index.ts              getContent(lang) + useContent()
src/lib/storage.ts                estado persistente
src/lib/StoreProvider.tsx         contexto del perfil
src/lib/share.ts                  PNG + compartir/descargar
src/components/                   NavBar, LangToggle, BackToTop, Card, SectionHeader, RadarChart,
                                  CompareBars, FitMeter, fields.tsx, ShareCard
src/pages/HomePage.tsx, ProfilePage.tsx
src/pages/talent/TalentPage.tsx, TalentForm.tsx, ReportPage.tsx, report/*.tsx
src/pages/rating/RatingPage.tsx, RatingResultPage.tsx
src/pages/mbti/MbtiPage.tsx, MbtiResultPage.tsx
```

Los tests van junto a cada archivo: `*.test.ts` / `*.test.tsx`.

**Orden y dependencias:**
- Las tareas 1–4 y 6–8 son de código base.
- La 5 (datos de jugadores) necesita la investigación terminada; la 6 puede hacerse con fixtures antes.
- La 9 (contenido zh) necesita `tactics_styles.md` y `sports_science.md`. La 10 (es) necesita la 9.
- Las 11–13 dan el 天赋测评 usable: **primer hito, se enseña al usuario**.
- Las 14–21 completan el resto.

---

### Task 1: Esqueleto del proyecto, sistema visual, navegación e idioma

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore` (añadir líneas)
- Create: `src/main.tsx`, `src/App.tsx`, `src/App.test.tsx`, `src/test/setup.ts`
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Create: `src/i18n/types.ts`, `src/i18n/ui.zh.ts`, `src/i18n/ui.es.ts`, `src/i18n/I18nProvider.tsx`
- Create: `src/components/NavBar.tsx`, `src/components/LangToggle.tsx`, `src/components/BackToTop.tsx`
- Create: `src/pages/HomePage.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/talent/TalentPage.tsx`, `src/pages/rating/RatingPage.tsx`, `src/pages/mbti/MbtiPage.tsx` (provisionales; se sustituyen en tareas posteriores)

**Interfaces:**
- Produces:
  - `type Lang = 'zh' | 'es'`;
  - `uiZh` (objeto `as const`) y `type UiKey = keyof typeof uiZh`; `uiEs: Record<UiKey, string>`;
  - `format(template: string, params?: Params): string`, con `Params = Record<string, string | number>`;
  - `I18nProvider({ lang?, onLangChange?, children })`;
  - `useI18n(): { lang: Lang; setLang(l: Lang): void; t(key: UiKey, params?: Params): string }`;
  - `AppRoutes` (componente con NavBar + rutas) y `App` por defecto.
  - Clases CSS: `.card`, `.mono-label`, `.page-title`, `.page-subtitle`, `.field`, `.field-label`, `.field-input`, `.field-error`, `.btn`, `.btn-primary`, `.btn-ghost`, `.band-blue`, `.band-amber`, `.muted`, `.stack`, `.row`.
- Regla para tareas posteriores: toda clave nueva de UI se añade a la vez a `ui.zh.ts` y `ui.es.ts`. TypeScript falla si falta en español.

- [ ] **Step 1: Crear `package.json` e instalar dependencias**

```json
{
  "name": "yuqiu-tianfu",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

Run:

```bash
npm install react react-dom react-router-dom html-to-image
npm install -D vite @vitejs/plugin-react typescript vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/react @types/react-dom
```

Expected: `added N packages`, sin errores `ERR!`.

- [ ] **Step 2: Configuración**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

`vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  localStorage.clear()
})
```

Añadir a `.gitignore`:

```
node_modules/
dist/
.DS_Store
```

`index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#E9EDF7" />
    <meta name="description" content="羽球打法天赋测评：根据体型与能力推荐单打风格、双打站位和镜像运动员。" />
    <title>羽球天赋 · Badminton Talent Lab</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=JetBrains+Mono:wght@500;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Escribir el test que falla**

`src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import App from './App'

it('muestra las 5 pestañas en chino y cambia a español', async () => {
  render(<App />)
  for (const label of ['首页', '天赋测评', '业余评级', '羽球MBTI', '我的档案']) {
    expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
  }
  await userEvent.click(screen.getByRole('button', { name: '切换到西班牙语' }))
  expect(screen.getByRole('link', { name: 'Test de talento' })).toBeInTheDocument()
  expect(document.documentElement.lang).toBe('es')
})
```

- [ ] **Step 4: Ejecutar y ver que falla**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL (`Failed to resolve import "./App"`).

- [ ] **Step 5: Implementar i18n**

`src/i18n/types.ts`:

```ts
export type Lang = 'zh' | 'es'
```

`src/i18n/ui.zh.ts`:

```ts
export const uiZh = {
  'app.name': '羽球天赋',
  'app.tagline': '体型 × 能力 × 打法：找到最适合你的羽球风格',
  'nav.home': '首页',
  'nav.talent': '天赋测评',
  'nav.rating': '业余评级',
  'nav.mbti': '羽球MBTI',
  'nav.profile': '我的档案',
  'lang.switch': 'ES',
  'lang.switchLabel': '切换到西班牙语',
  'common.backTop': '回到顶部',
} as const

export type UiKey = keyof typeof uiZh
```

`src/i18n/ui.es.ts`:

```ts
import type { UiKey } from './ui.zh'

export const uiEs: Record<UiKey, string> = {
  'app.name': 'Talento Bádminton',
  'app.tagline': 'Cuerpo × capacidades × estilo: descubre tu forma ideal de jugar',
  'nav.home': 'Inicio',
  'nav.talent': 'Test de talento',
  'nav.rating': 'Nivel amateur',
  'nav.mbti': 'MBTI bádminton',
  'nav.profile': 'Mi perfil',
  'lang.switch': '中',
  'lang.switchLabel': 'Cambiar a chino',
  'common.backTop': 'Volver arriba',
}
```

`src/i18n/I18nProvider.tsx`:

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Lang } from './types'
import { uiZh, type UiKey } from './ui.zh'
import { uiEs } from './ui.es'

export type Params = Record<string, string | number>

export function format(template: string, params?: Params): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match))
}

interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: UiKey, params?: Params) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({
  lang: controlled,
  onLangChange,
  children,
}: {
  lang?: Lang
  onLangChange?: (lang: Lang) => void
  children: ReactNode
}) {
  const [inner, setInner] = useState<Lang>(controlled ?? 'zh')
  const lang = controlled ?? inner
  const setLang = useCallback(
    (next: Lang) => {
      setInner(next)
      onLangChange?.(next)
    },
    [onLangChange],
  )
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'es'
  }, [lang])
  const value = useMemo<I18nValue>(() => {
    const dict: Record<UiKey, string> = lang === 'zh' ? uiZh : uiEs
    return { lang, setLang, t: (key, params) => format(dict[key], params) }
  }, [lang, setLang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}
```

- [ ] **Step 6: Implementar navegación, páginas provisionales y App**

`src/components/LangToggle.tsx`:

```tsx
import { useI18n } from '../i18n/I18nProvider'

export function LangToggle() {
  const { lang, setLang, t } = useI18n()
  return (
    <button
      type="button"
      className="lang-toggle"
      aria-label={t('lang.switchLabel')}
      onClick={() => setLang(lang === 'zh' ? 'es' : 'zh')}
    >
      {t('lang.switch')}
    </button>
  )
}
```

`src/components/NavBar.tsx`:

```tsx
import { NavLink } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import type { UiKey } from '../i18n/ui.zh'
import { LangToggle } from './LangToggle'

const TABS: { to: string; key: UiKey; end: boolean }[] = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/talent', key: 'nav.talent', end: false },
  { to: '/rating', key: 'nav.rating', end: false },
  { to: '/mbti', key: 'nav.mbti', end: false },
  { to: '/profile', key: 'nav.profile', end: false },
]

export function NavBar() {
  const { t } = useI18n()
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo" aria-label={t('app.name')}>
          🏸
        </NavLink>
        <nav className="navbar-tabs">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => 'navbar-tab' + (isActive ? ' is-active' : '')}
            >
              {t(tab.key)}
            </NavLink>
          ))}
        </nav>
        <LangToggle />
      </div>
    </header>
  )
}
```

`src/components/BackToTop.tsx`:

```tsx
import { useI18n } from '../i18n/I18nProvider'

export function BackToTop() {
  const { t } = useI18n()
  return (
    <button
      type="button"
      className="back-to-top"
      aria-label={t('common.backTop')}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  )
}
```

Páginas provisionales, todas con este mismo patrón. Ejemplo `src/pages/HomePage.tsx`:

```tsx
import { useI18n } from '../i18n/I18nProvider'

export default function HomePage() {
  const { t } = useI18n()
  return (
    <section className="card">
      <p className="mono-label">BADMINTON TALENT LAB</p>
      <h1 className="page-title">{t('app.name')}</h1>
      <p className="page-subtitle">{t('app.tagline')}</p>
    </section>
  )
}
```

Las demás son iguales con su etiqueta y título:
- `src/pages/talent/TalentPage.tsx`: `MODULE 01 | TALENT & BODY TYPE` y `t('nav.talent')`.
- `src/pages/rating/RatingPage.tsx`: `MODULE 02 | AMATEUR LEVEL` y `t('nav.rating')`.
- `src/pages/mbti/MbtiPage.tsx`: `MODULE 03 | COURT PERSONALITY` y `t('nav.mbti')`.
- `src/pages/ProfilePage.tsx`: `MY PROFILE` y `t('nav.profile')`.

Cada una exporta `default function XxxPage()` e importa `useI18n` con la ruta relativa correcta (`../../i18n/I18nProvider` en subcarpetas).

`src/App.tsx`:

```tsx
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BackToTop } from './components/BackToTop'
import { NavBar } from './components/NavBar'
import { I18nProvider } from './i18n/I18nProvider'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import MbtiPage from './pages/mbti/MbtiPage'
import RatingPage from './pages/rating/RatingPage'
import TalentPage from './pages/talent/TalentPage'

export function AppRoutes() {
  return (
    <>
      <NavBar />
      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/talent" element={<TalentPage />} />
          <Route path="/rating" element={<RatingPage />} />
          <Route path="/mbti" element={<MbtiPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BackToTop />
    </>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </I18nProvider>
  )
}
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tokens.css'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 7: Sistema visual**

`src/styles/tokens.css`:

```css
:root {
  --bg: #e9edf7;
  --card: #ffffff;
  --ink: #0b0b0f;
  --ink-2: #3a3d46;
  --muted: #8a8f9c;
  --line: #eceef3;
  --field: #f3f4f6;
  --accent: #2f6bff;
  --blue-1: #2447c9;
  --blue-2: #3d6df2;
  --amber-1: #b8610f;
  --amber-2: #e39a33;
  --good: #1f9d55;
  --warn: #c2700a;
  --bad: #d12f2f;
  --radius-card: 28px;
  --radius-field: 18px;
  --radius-pill: 999px;
  --shadow-card: 0 10px 30px rgba(20, 30, 60, 0.08);
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
    'Noto Sans SC', sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  --maxw: 640px;
}
```

`src/styles/global.css`:

```css
*,
*::before,
*::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: linear-gradient(180deg, #eef1f9 0%, var(--bg) 100%) fixed;
  color: var(--ink);
  font-family: var(--font-sans);
  line-height: 1.6;
}
a { color: inherit; }
button { font: inherit; cursor: pointer; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }

.navbar {
  position: sticky; top: 0; z-index: 20;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: saturate(160%) blur(12px);
  border-bottom: 1px solid var(--line);
}
.navbar-inner {
  max-width: var(--maxw); margin: 0 auto; padding: 10px 16px;
  display: flex; align-items: center; gap: 8px;
}
.navbar-logo { font-size: 28px; text-decoration: none; flex: none; }
.navbar-tabs {
  display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; flex: 1; min-width: 0;
}
.navbar-tabs::-webkit-scrollbar { display: none; }
.navbar-tab {
  flex: none; padding: 8px 14px; border-radius: var(--radius-pill);
  text-decoration: none; font-weight: 600; color: var(--ink-2); white-space: nowrap;
}
.navbar-tab.is-active { background: var(--ink); color: #fff; }
.lang-toggle {
  flex: none; border: 1px solid var(--line); background: #fff; border-radius: var(--radius-pill);
  padding: 6px 12px; font-weight: 700; font-family: var(--font-mono);
}

.page { max-width: var(--maxw); margin: 0 auto; padding: 16px 16px 96px; display: grid; gap: 16px; }
.card {
  background: var(--card); border-radius: var(--radius-card); box-shadow: var(--shadow-card);
  padding: 28px 20px;
}
.mono-label {
  margin: 0; font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.18em;
  color: var(--muted); text-transform: uppercase; text-align: center;
}
.page-title { margin: 6px 0 4px; font-size: clamp(28px, 8vw, 40px); font-weight: 900; text-align: center; line-height: 1.2; }
.page-subtitle { margin: 0; color: var(--muted); text-align: center; }
.muted { color: var(--muted); }
.stack { display: grid; gap: 14px; }
.row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

.field { display: grid; gap: 8px; }
.field-label { font-weight: 700; letter-spacing: 0.04em; }
.field-input {
  width: 100%; border: 1px solid transparent; background: var(--field); border-radius: var(--radius-field);
  padding: 16px 18px; font-size: 16px; color: var(--ink); appearance: none;
}
select.field-input {
  background-image: linear-gradient(45deg, transparent 50%, var(--ink) 50%), linear-gradient(135deg, var(--ink) 50%, transparent 50%);
  background-position: calc(100% - 22px) 50%, calc(100% - 16px) 50%;
  background-size: 6px 6px; background-repeat: no-repeat; padding-right: 40px;
}
.field-input[aria-invalid='true'] { border-color: var(--bad); }
.field-error { color: var(--bad); font-size: 14px; margin: 0; }
.field-hint { color: var(--muted); font-size: 13px; margin: 0; }

.btn {
  border: 1px solid var(--line); background: #fff; color: var(--ink); border-radius: var(--radius-pill);
  padding: 12px 20px; font-weight: 700; text-decoration: none; display: inline-flex; gap: 6px; align-items: center;
}
.btn-primary { background: var(--ink); color: #fff; border-color: var(--ink); width: 100%; justify-content: center; padding: 16px; font-size: 17px; }
.btn-ghost { background: #f3f4f6; border-color: transparent; }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }

.band-blue, .band-amber {
  display: flex; gap: 12px; align-items: center; color: #fff; padding: 12px 16px; border-radius: 6px;
}
.band-blue { background: linear-gradient(90deg, var(--blue-1), var(--blue-2)); }
.band-amber { background: linear-gradient(90deg, var(--amber-1), var(--amber-2)); }
.band-blue .mono-label, .band-amber .mono-label { color: rgba(255, 255, 255, 0.9); text-align: left; }

.back-to-top {
  position: fixed; right: 16px; bottom: 20px; width: 52px; height: 52px; border-radius: 50%;
  border: 1px solid var(--line); background: #fff; box-shadow: var(--shadow-card); font-size: 22px; font-weight: 800;
}
```

- [ ] **Step 8: Ejecutar tests y typecheck**

Run: `npm test && npm run typecheck`
Expected: `1 passed`, typecheck sin salida.

- [ ] **Step 9: Comprobar el arranque**

Run: `npm run build`
Expected: `dist/index.html` generado sin errores.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold app shell with nav, design tokens and zh/es toggle

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Motor — tipos, constantes, estadística y cuerpo

**Files:**
- Create: `src/engine/types.ts`, `src/engine/constants.ts`, `src/engine/stats.ts`, `src/engine/body.ts`
- Test: `src/engine/stats.test.ts`, `src/engine/body.test.ts`

**Interfaces:**
- Produces:
  - Todos los tipos de `types.ts`, más abajo. Las tareas posteriores los importan tal cual.
  - `mean`, `sd`, `clamp`, `correlation`, `argBy`.
  - `bmiOf`, `bmiBandOf`, `ageBandOf`, `heightZOf`, `heightBandOf`, `bodyTypeOf`, `analyzeBody`, `diagLevel`, `bodyClaims`.

- [ ] **Step 1: Tipos (sin lógica; no necesitan test propio)**

`src/engine/types.ts`:

```ts
export type Sex = 'M' | 'F'
export type Hand = 'R' | 'L'
export type Freq = 'lt1' | '1' | '2-3' | '4+'
export type Preference = 'singles' | 'doubles' | 'mixed' | 'all'

export const ABILITY_KEYS = ['power', 'endurance', 'reaction', 'netTouch', 'speed', 'rearCourt', 'tactics', 'mental'] as const
export type AbilityKey = (typeof ABILITY_KEYS)[number]
export const RADAR_KEYS = ['power', 'endurance', 'reaction', 'netTouch', 'speed', 'rearCourt'] as const
export type RadarKey = (typeof RADAR_KEYS)[number]

export type Level = 1 | 2 | 3 | 4 | 5
export type Scores = Record<AbilityKey, number>
export type RadarScores = Record<RadarKey, number>

export const FIELD_TEST_KEYS = ['verticalJumpCm', 'ropeSkip1Min', 'cooper12MinM', 'rulerDropCm'] as const
export type FieldTestKey = (typeof FIELD_TEST_KEYS)[number]
export type FieldTests = Record<FieldTestKey, number | null>

export interface TalentInput {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  wingspanCm: number | null
  yearsPlaying: number
  hand: Hand
  freq: Freq
  preference: Preference
  levels: Record<AbilityKey, Level>
  tests: FieldTests
}

export type BmiBand = 'under' | 'lean' | 'normal' | 'solid' | 'heavy'
export type AgeBand = 'youth' | 'prime' | 'thirties' | 'forties' | 'fiftyPlus'
export type HeightBand = 'short' | 'average' | 'tall'
export const BODY_TYPES = ['compactQuick', 'lightAgile', 'balanced', 'sturdyPower', 'tallLean', 'tallPower'] as const
export type BodyType = (typeof BODY_TYPES)[number]

export interface BodyProfile {
  bmi: number
  bmiBand: BmiBand
  heightZ: number
  heightBand: HeightBand
  wingspanCm: number
  wingspanAssumed: boolean
  apeIndexCm: number
  apeRatio: number
  ageBand: AgeBand
  bodyType: BodyType
}

export type DiagLevel = 'weak' | 'medium' | 'strong'
export interface BodyClaim {
  key: RadarKey
  kind: 'advantage' | 'disadvantage'
  level: DiagLevel
}

export const SINGLES_STYLES = ['attack', 'control', 'counter', 'speed', 'allround', 'net'] as const
export type SinglesStyle = (typeof SINGLES_STYLES)[number]
export const DOUBLES_ROLES = ['front', 'back', 'rotation'] as const
export type DoublesRole = (typeof DOUBLES_ROLES)[number]
export type MixedNote = 'conventional' | 'femaleBack' | 'maleFront' | 'rotation'
export type FitBand = 'high' | 'good' | 'lean'

export interface StyleFit {
  style: SinglesStyle
  fit: number
}
export interface SinglesResult {
  ranking: StyleFit[]
  top: SinglesStyle
  runnerUp: SinglesStyle
  margin: number
  fitBand: FitBand
  drivers: AbilityKey[]
  gaps: AbilityKey[]
}
export interface PartnerAdvice {
  role: DoublesRole
  strength: RadarKey
}
export interface DoublesResult {
  role: DoublesRole
  fit: number
  fitBand: FitBand
  frontFit: number
  backFit: number
  partner: PartnerAdvice
  mixedNote: MixedNote
  drivers: AbilityKey[]
  gaps: AbilityKey[]
}

export const FLAGS = [
  'beginner',
  'youth',
  'injury30',
  'injury40',
  'injury50',
  'wingspanAssumed',
  'closeCall',
  'selfRatingHigh',
  'bmiHigh',
  'bmiLow',
] as const
export type Flag = (typeof FLAGS)[number]
```

- [ ] **Step 2: Escribir los tests que fallan**

`src/engine/stats.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { argBy, clamp, correlation, mean, sd } from './stats'

describe('stats', () => {
  it('mean y sd poblacional', () => {
    expect(mean([2, 4, 6])).toBe(4)
    expect(sd([2, 4, 4, 4, 5, 5, 7, 9])).toBe(2)
  })
  it('clamp', () => {
    expect(clamp(12, 0, 10)).toBe(10)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(5, 0, 10)).toBe(5)
  })
  it('correlation: perfecta, inversa y 0 si una serie es plana', () => {
    expect(correlation([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 10)
    expect(correlation([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1, 10)
    expect(correlation([5, 5, 5], [1, 2, 3])).toBe(0)
  })
  it('argBy devuelve la primera clave en caso de empate', () => {
    const s = { a: 3, b: 7, c: 7 }
    expect(argBy(['a', 'b', 'c'] as const, (k) => s[k], (x, y) => x > y)).toBe('b')
    expect(argBy(['a', 'b', 'c'] as const, (k) => s[k], (x, y) => x < y)).toBe('a')
  })
})
```

`src/engine/body.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { ageBandOf, analyzeBody, bmiBandOf, bmiOf, bodyClaims, bodyTypeOf, diagLevel, heightBandOf, heightZOf } from './body'
import type { BmiBand, BodyType, HeightBand, Scores } from './types'

describe('analyzeBody', () => {
  it('reproduce el perfil de las capturas de referencia', () => {
    expect(analyzeBody({ sex: 'F', age: 24, heightCm: 163, weightKg: 51, wingspanCm: 164 })).toEqual({
      bmi: 19.2,
      bmiBand: 'lean',
      heightZ: 0.5,
      heightBand: 'average',
      wingspanCm: 164,
      wingspanAssumed: false,
      apeIndexCm: 1,
      apeRatio: 1.006,
      ageBand: 'prime',
      bodyType: 'lightAgile',
    })
  })
  it('sin envergadura asume la altura', () => {
    const b = analyzeBody({ sex: 'M', age: 30, heightCm: 180, weightKg: 75, wingspanCm: null })
    expect(b.wingspanAssumed).toBe(true)
    expect(b.wingspanCm).toBe(180)
    expect(b.apeIndexCm).toBe(0)
    expect(b.apeRatio).toBe(1)
  })
})

describe('bandas', () => {
  it('IMC redondeado a 1 decimal', () => {
    expect(bmiOf(163, 51)).toBe(19.2)
    expect(bmiOf(180, 75)).toBe(23.1)
  })
  it('límites de IMC', () => {
    expect(bmiBandOf(18.4)).toBe('under')
    expect(bmiBandOf(18.5)).toBe('lean')
    expect(bmiBandOf(20.5)).toBe('normal')
    expect(bmiBandOf(23.5)).toBe('solid')
    expect(bmiBandOf(26)).toBe('heavy')
  })
  it('límites de edad', () => {
    expect([17, 18, 30, 31, 40, 41, 50, 51].map(ageBandOf)).toEqual([
      'youth', 'prime', 'prime', 'thirties', 'thirties', 'forties', 'forties', 'fiftyPlus',
    ])
  })
  it('altura relativa por sexo', () => {
    expect(heightZOf('M', 172)).toBe(0)
    expect(heightZOf('F', 155.5)).toBe(-0.75)
    expect(heightBandOf(-0.75)).toBe('short')
    expect(heightBandOf(0.74)).toBe('average')
    expect(heightBandOf(0.75)).toBe('tall')
  })
  it('身材画像 para las 15 combinaciones', () => {
    const table: [HeightBand, BmiBand, BodyType][] = [
      ['short', 'under', 'compactQuick'], ['short', 'lean', 'compactQuick'], ['short', 'normal', 'compactQuick'],
      ['short', 'solid', 'sturdyPower'], ['short', 'heavy', 'sturdyPower'],
      ['average', 'under', 'lightAgile'], ['average', 'lean', 'lightAgile'], ['average', 'normal', 'balanced'],
      ['average', 'solid', 'sturdyPower'], ['average', 'heavy', 'sturdyPower'],
      ['tall', 'under', 'tallLean'], ['tall', 'lean', 'tallLean'], ['tall', 'normal', 'tallPower'],
      ['tall', 'solid', 'tallPower'], ['tall', 'heavy', 'tallPower'],
    ]
    for (const [h, b, expected] of table) expect(bodyTypeOf(h, b)).toBe(expected)
  })
})

describe('diagnóstico y claims', () => {
  it('diagLevel', () => {
    expect([3.4, 3.5, 6.4, 6.5].map(diagLevel)).toEqual(['weak', 'medium', 'medium', 'strong'])
  })
  it('bodyClaims refleja el nivel actual, no el potencial', () => {
    const current: Scores = { power: 4, endurance: 6, reaction: 2, netTouch: 4, speed: 8, rearCourt: 4, tactics: 2, mental: 6 }
    expect(bodyClaims('compactQuick', current)).toEqual([
      { key: 'speed', kind: 'advantage', level: 'strong' },
      { key: 'reaction', kind: 'advantage', level: 'weak' },
      { key: 'rearCourt', kind: 'disadvantage', level: 'medium' },
    ])
    expect(bodyClaims('balanced', current)).toEqual([])
  })
})
```

- [ ] **Step 3: Ejecutar y ver que fallan**

Run: `npx vitest run src/engine`
Expected: FAIL (`Failed to resolve import "./stats"` y `"./body"`).

- [ ] **Step 4: Implementar**

`src/engine/constants.ts`:

```ts
import type { AgeBand, BmiBand, BodyType, Level, RadarKey, Sex } from './types'

export const ENGINE_VERSION = 1

// Referencia aproximada de adultos jóvenes chinos. La altura del usuario se compara con su sexo.
export const HEIGHT_REF: Record<Sex, { mean: number; sd: number }> = {
  M: { mean: 172, sd: 6.5 },
  F: { mean: 160, sd: 6 },
}
export const HEIGHT_BAND_Z = 0.75

export const BMI_LIMITS: { band: BmiBand; below: number }[] = [
  { band: 'under', below: 18.5 },
  { band: 'lean', below: 20.5 },
  { band: 'normal', below: 23.5 },
  { band: 'solid', below: 26 },
]

export const LEVEL_SCORE: Record<Level, number> = { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 }

export const DIAG_WEAK_BELOW = 3.5
export const DIAG_STRONG_FROM = 6.5

export const BODY_TRAITS: Record<BodyType, { advantages: RadarKey[]; disadvantages: RadarKey[] }> = {
  compactQuick: { advantages: ['speed', 'reaction'], disadvantages: ['rearCourt'] },
  lightAgile: { advantages: ['speed', 'endurance'], disadvantages: ['power'] },
  balanced: { advantages: [], disadvantages: [] },
  sturdyPower: { advantages: ['power'], disadvantages: ['speed', 'endurance'] },
  tallLean: { advantages: ['rearCourt'], disadvantages: ['power', 'speed'] },
  tallPower: { advantages: ['power', 'rearCourt'], disadvantages: ['speed'] },
}

// Tendencia corporal (heurística documentada en la spec §5.3.2). Base 5, límites [1, 9.5].
export const TENDENCY_HEIGHT_COEF: Record<RadarKey, number> = {
  power: 0.8, endurance: 0, reaction: 0, netTouch: 0, speed: -0.6, rearCourt: 0.9,
}
export const TENDENCY_APE_COEF: Record<RadarKey, number> = {
  power: 0, endurance: 0, reaction: 0.1, netTouch: 0.05, speed: 0, rearCourt: 0.12,
}
export const TENDENCY_BMI_ADJ: Record<RadarKey, Record<BmiBand, number>> = {
  power: { under: -1.2, lean: -0.3, normal: 0.5, solid: 0.8, heavy: 0.3 },
  endurance: { under: -0.5, lean: 0.5, normal: 0.5, solid: -0.5, heavy: -1.5 },
  reaction: { under: 0, lean: 0, normal: 0, solid: 0, heavy: -0.5 },
  netTouch: { under: 0, lean: 0, normal: 0, solid: 0, heavy: 0 },
  speed: { under: -0.3, lean: 0.8, normal: 0.3, solid: -0.5, heavy: -1.5 },
  rearCourt: { under: -0.8, lean: -0.2, normal: 0.4, solid: 0.5, heavy: 0 },
}
const NO_AGE_ADJ: Record<RadarKey, number> = { power: 0, endurance: 0, reaction: 0, netTouch: 0, speed: 0, rearCourt: 0 }
export const TENDENCY_AGE_ADJ: Record<AgeBand, Record<RadarKey, number>> = {
  youth: { ...NO_AGE_ADJ, power: -0.5, rearCourt: -0.3 },
  prime: NO_AGE_ADJ,
  thirties: { ...NO_AGE_ADJ, power: -0.3, endurance: -0.3, reaction: -0.2, speed: -0.5 },
  forties: { ...NO_AGE_ADJ, power: -0.7, endurance: -0.8, reaction: -0.5, speed: -1.0, rearCourt: -0.3 },
  fiftyPlus: { ...NO_AGE_ADJ, power: -1.0, endurance: -1.2, reaction: -0.8, speed: -1.5, rearCourt: -0.6 },
}
```

`src/engine/stats.ts`:

```ts
export const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length

export const sd = (xs: readonly number[]): number => {
  const m = mean(xs)
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)))
}

export const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x))

export function correlation(xs: readonly number[], ys: readonly number[]): number {
  const mx = mean(xs)
  const my = mean(ys)
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - mx
    const b = ys[i] - my
    num += a * b
    dx += a * a
    dy += b * b
  }
  if (dx === 0 || dy === 0) return 0
  return num / Math.sqrt(dx * dy)
}

/** Devuelve la clave cuyo valor gana según `better`; en empate conserva la primera. */
export function argBy<K extends string>(keys: readonly K[], value: (k: K) => number, better: (a: number, b: number) => boolean): K {
  let best = keys[0]
  for (const k of keys.slice(1)) if (better(value(k), value(best))) best = k
  return best
}
```

`src/engine/body.ts`:

```ts
import { BMI_LIMITS, BODY_TRAITS, DIAG_STRONG_FROM, DIAG_WEAK_BELOW, HEIGHT_BAND_Z, HEIGHT_REF } from './constants'
import type { AgeBand, BmiBand, BodyClaim, BodyProfile, BodyType, DiagLevel, HeightBand, Scores, Sex, TalentInput } from './types'

export function bmiOf(heightCm: number, weightKg: number): number {
  const m = heightCm / 100
  return Math.round((weightKg / (m * m)) * 10) / 10
}

export function bmiBandOf(bmi: number): BmiBand {
  for (const { band, below } of BMI_LIMITS) if (bmi < below) return band
  return 'heavy'
}

export function ageBandOf(age: number): AgeBand {
  if (age <= 17) return 'youth'
  if (age <= 30) return 'prime'
  if (age <= 40) return 'thirties'
  if (age <= 50) return 'forties'
  return 'fiftyPlus'
}

export function heightZOf(sex: Sex, heightCm: number): number {
  const ref = HEIGHT_REF[sex]
  return (heightCm - ref.mean) / ref.sd
}

export function heightBandOf(z: number): HeightBand {
  if (z <= -HEIGHT_BAND_Z) return 'short'
  if (z >= HEIGHT_BAND_Z) return 'tall'
  return 'average'
}

export function bodyTypeOf(heightBand: HeightBand, bmiBand: BmiBand): BodyType {
  const heavyish = bmiBand === 'solid' || bmiBand === 'heavy'
  const light = bmiBand === 'under' || bmiBand === 'lean'
  if (heightBand === 'short') return heavyish ? 'sturdyPower' : 'compactQuick'
  if (heightBand === 'tall') return light ? 'tallLean' : 'tallPower'
  if (heavyish) return 'sturdyPower'
  return light ? 'lightAgile' : 'balanced'
}

export function analyzeBody(input: Pick<TalentInput, 'sex' | 'age' | 'heightCm' | 'weightKg' | 'wingspanCm'>): BodyProfile {
  const bmi = bmiOf(input.heightCm, input.weightKg)
  const bmiBand = bmiBandOf(bmi)
  const heightZ = heightZOf(input.sex, input.heightCm)
  const heightBand = heightBandOf(heightZ)
  const wingspanCm = input.wingspanCm ?? input.heightCm
  return {
    bmi,
    bmiBand,
    heightZ,
    heightBand,
    wingspanCm,
    wingspanAssumed: input.wingspanCm == null,
    apeIndexCm: wingspanCm - input.heightCm,
    apeRatio: Math.round((wingspanCm / input.heightCm) * 1000) / 1000,
    ageBand: ageBandOf(input.age),
    bodyType: bodyTypeOf(heightBand, bmiBand),
  }
}

export function diagLevel(score: number): DiagLevel {
  if (score < DIAG_WEAK_BELOW) return 'weak'
  if (score < DIAG_STRONG_FROM) return 'medium'
  return 'strong'
}

export function bodyClaims(bodyType: BodyType, current: Scores): BodyClaim[] {
  const traits = BODY_TRAITS[bodyType]
  return [
    ...traits.advantages.map((key) => ({ key, kind: 'advantage' as const, level: diagLevel(current[key]) })),
    ...traits.disadvantages.map((key) => ({ key, kind: 'disadvantage' as const, level: diagLevel(current[key]) })),
  ]
}
```

- [ ] **Step 5: Ejecutar y ver que pasan**

Run: `npx vitest run src/engine && npm run typecheck`
Expected: todos PASS.

- [ ] **Step 6: Commit**

```bash
git add src/engine
git commit -m "feat(engine): body profile, bands, body type and diagnostics

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Motor — capacidades actuales, pruebas reales, tendencia corporal y mezcla

**Files:**
- Create: `src/engine/abilities.ts`
- Test: `src/engine/abilities.test.ts`

**Interfaces:**
- Consumes: `types.ts`, `constants.ts` (`LEVEL_SCORE`, `TENDENCY_*`), `stats.ts` (`clamp`).
- Produces:
  - `TEST_TARGET: Record<FieldTestKey, RadarKey>`;
  - `TEST_NORMS`;
  - `interpolate(curve: [number, number][], x: number): number`;
  - `testScore(key: FieldTestKey, value: number, sex: Sex): number`;
  - `currentScores(input: Pick<TalentInput, 'sex' | 'levels' | 'tests'>): Scores`;
  - `bodyTendency(body: BodyProfile): RadarScores`;
  - `blendFactor(years: number): number`;
  - `blendScores(current: Scores, tendency: RadarScores, years: number): Scores`.

- [ ] **Step 1: Escribir los tests que fallan**

`src/engine/abilities.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { blendFactor, blendScores, bodyTendency, currentScores, interpolate, testScore } from './abilities'
import { analyzeBody } from './body'
import type { AbilityKey, FieldTests, Level } from './types'

const NO_TESTS: FieldTests = { verticalJumpCm: null, ropeSkip1Min: null, cooper12MinM: null, rulerDropCm: null }
const GOLDEN_LEVELS: Record<AbilityKey, Level> = {
  power: 2, endurance: 3, reaction: 1, netTouch: 2, speed: 2, rearCourt: 2, tactics: 1, mental: 3,
}
const goldenBody = analyzeBody({ sex: 'F', age: 24, heightCm: 163, weightKg: 51, wingspanCm: 164 })

describe('pruebas reales', () => {
  it('interpolate limita en los extremos e interpola en medio', () => {
    const curve: [number, number][] = [[20, 2], [30, 4], [40, 6], [50, 8], [60, 10]]
    expect(interpolate(curve, 10)).toBe(2)
    expect(interpolate(curve, 70)).toBe(10)
    expect(interpolate(curve, 25)).toBe(3)
  })
  it('la regla puntúa mejor cuanto menos cae', () => {
    expect(testScore('rulerDropCm', 12.5, 'M')).toBe(7)
    expect(testScore('rulerDropCm', 30, 'F')).toBe(2)
  })
  it('normas por sexo en el salto', () => {
    expect(testScore('verticalJumpCm', 30, 'F')).toBe(6)
    expect(testScore('verticalJumpCm', 30, 'M')).toBe(4)
  })
})

describe('currentScores', () => {
  it('convierte niveles 1–5 en 2–10', () => {
    expect(currentScores({ sex: 'F', levels: GOLDEN_LEVELS, tests: NO_TESTS })).toEqual({
      power: 4, endurance: 6, reaction: 2, netTouch: 4, speed: 4, rearCourt: 4, tactics: 2, mental: 6,
    })
  })
  it('promedia autoevaluación y prueba cuando existe', () => {
    const s = currentScores({ sex: 'F', levels: GOLDEN_LEVELS, tests: { ...NO_TESTS, verticalJumpCm: 30, ropeSkip1Min: 140 } })
    expect(s.power).toBe(5) // (4 + 6) / 2
    expect(s.speed).toBe(5) // (4 + 6) / 2 — la comba ajusta 移动速度
  })
})

describe('tendencia corporal y mezcla', () => {
  it('tendencia del perfil de referencia', () => {
    const t = bodyTendency(goldenBody)
    expect(t.power).toBeCloseTo(5.1, 6)
    expect(t.endurance).toBeCloseTo(5.5, 6)
    expect(t.reaction).toBeCloseTo(5.1, 6)
    expect(t.netTouch).toBeCloseTo(5.05, 6)
    expect(t.speed).toBeCloseTo(5.5, 6)
    expect(t.rearCourt).toBeCloseTo(5.37, 6)
  })
  it('la tendencia se mantiene en [1, 9.5] con cuerpos extremos', () => {
    const extreme = analyzeBody({ sex: 'F', age: 70, heightCm: 215, weightKg: 150, wingspanCm: 240 })
    for (const v of Object.values(bodyTendency(extreme))) {
      expect(v).toBeGreaterThanOrEqual(1)
      expect(v).toBeLessThanOrEqual(9.5)
    }
  })
  it('blendFactor por años de juego', () => {
    expect([0.5, 1, 3, 3.5].map(blendFactor)).toEqual([0.5, 0.65, 0.65, 0.8])
  })
  it('mezcla del perfil de referencia (tactics y mental tiran hacia 5)', () => {
    const current = currentScores({ sex: 'F', levels: GOLDEN_LEVELS, tests: NO_TESTS })
    const b = blendScores(current, bodyTendency(goldenBody), 2)
    const expected = { power: 4.385, endurance: 5.825, reaction: 3.085, netTouch: 4.3675, speed: 4.525, rearCourt: 4.4795, tactics: 3.05, mental: 5.65 }
    for (const [k, v] of Object.entries(expected)) expect(b[k as AbilityKey]).toBeCloseTo(v, 6)
  })
})
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npx vitest run src/engine/abilities.test.ts`
Expected: FAIL (`Failed to resolve import "./abilities"`).

- [ ] **Step 3: Implementar**

`src/engine/abilities.ts`:

```ts
import { LEVEL_SCORE, TENDENCY_AGE_ADJ, TENDENCY_APE_COEF, TENDENCY_BMI_ADJ, TENDENCY_HEIGHT_COEF } from './constants'
import { clamp } from './stats'
import {
  ABILITY_KEYS,
  FIELD_TEST_KEYS,
  RADAR_KEYS,
  type BodyProfile,
  type FieldTestKey,
  type RadarKey,
  type RadarScores,
  type Scores,
  type Sex,
  type TalentInput,
} from './types'

type Curve = [number, number][]

export const TEST_TARGET: Record<FieldTestKey, RadarKey> = {
  verticalJumpCm: 'power',
  ropeSkip1Min: 'speed',
  cooper12MinM: 'endurance',
  rulerDropCm: 'reaction',
}

// Curvas (valor → nota 0–10), ordenadas por valor ascendente. Ver sports_science.md para la procedencia.
export const TEST_NORMS: Record<FieldTestKey, Record<Sex, Curve>> = {
  verticalJumpCm: {
    M: [[20, 2], [30, 4], [40, 6], [50, 8], [60, 10]],
    F: [[14, 2], [22, 4], [30, 6], [38, 8], [46, 10]],
  },
  ropeSkip1Min: {
    M: [[80, 2], [110, 4], [140, 6], [170, 8], [200, 10]],
    F: [[80, 2], [110, 4], [140, 6], [170, 8], [200, 10]],
  },
  cooper12MinM: {
    M: [[1600, 2], [2000, 4], [2300, 6], [2600, 8], [2900, 10]],
    F: [[1500, 2], [1800, 4], [2100, 6], [2400, 8], [2700, 10]],
  },
  rulerDropCm: {
    M: [[5, 10], [10, 8], [15, 6], [20, 4], [25, 2]],
    F: [[5, 10], [10, 8], [15, 6], [20, 4], [25, 2]],
  },
}

export function interpolate(curve: Curve, x: number): number {
  if (x <= curve[0][0]) return curve[0][1]
  const last = curve[curve.length - 1]
  if (x >= last[0]) return last[1]
  for (let i = 1; i < curve.length; i++) {
    const [x1, y1] = curve[i]
    if (x <= x1) {
      const [x0, y0] = curve[i - 1]
      return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
    }
  }
  return last[1]
}

export function testScore(key: FieldTestKey, value: number, sex: Sex): number {
  return interpolate(TEST_NORMS[key][sex], value)
}

export function currentScores(input: Pick<TalentInput, 'sex' | 'levels' | 'tests'>): Scores {
  const out = {} as Scores
  for (const k of ABILITY_KEYS) out[k] = LEVEL_SCORE[input.levels[k]]
  for (const t of FIELD_TEST_KEYS) {
    const value = input.tests[t]
    if (value == null || !Number.isFinite(value)) continue
    const target = TEST_TARGET[t]
    out[target] = (out[target] + testScore(t, value, input.sex)) / 2
  }
  return out
}

export function bodyTendency(body: BodyProfile): RadarScores {
  const out = {} as RadarScores
  for (const k of RADAR_KEYS) {
    const raw =
      5 +
      TENDENCY_HEIGHT_COEF[k] * clamp(body.heightZ, -2, 2) +
      TENDENCY_APE_COEF[k] * clamp(body.apeIndexCm, -8, 8) +
      TENDENCY_BMI_ADJ[k][body.bmiBand] +
      TENDENCY_AGE_ADJ[body.ageBand][k]
    out[k] = clamp(raw, 1, 9.5)
  }
  return out
}

export function blendFactor(years: number): number {
  if (years < 1) return 0.5
  if (years <= 3) return 0.65
  return 0.8
}

/** Mezcla capacidad actual y tendencia corporal. tactics y mental se mezclan con un 5 neutro. */
export function blendScores(current: Scores, tendency: RadarScores, years: number): Scores {
  const a = blendFactor(years)
  const out = {} as Scores
  for (const k of ABILITY_KEYS) {
    const t = (RADAR_KEYS as readonly string[]).includes(k) ? tendency[k as RadarKey] : 5
    out[k] = a * current[k] + (1 - a) * t
  }
  return out
}
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `npx vitest run src/engine && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): current scores, field-test norms, body tendency and blend

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Motor — estilo de individual y rol de dobles

**Files:**
- Create: `src/engine/singles.ts`, `src/engine/doubles.ts`
- Test: `src/engine/singles.test.ts`, `src/engine/doubles.test.ts`, `src/engine/testkit.ts` (ayudas compartidas por los tests)

**Interfaces:**
- Consumes: `analyzeBody`, `currentScores`, `bodyTendency`, `blendScores`, `mean`, `sd`, `correlation`, `clamp`, `argBy`.
- Produces (`singles.ts`):
  - `type Weights = Record<AbilityKey, number>` y `makeWeights(p: Partial<Weights>): Weights`;
  - `SINGLES_WEIGHTS: Record<Exclude<SinglesStyle, 'allround'>, Weights>`;
  - `toVector(s: Scores): number[]`, `spreadOf(u)`, `fitFrom(score01, body01)`, `fitBandOf(fit)`;
  - `profileMatch(u, weights)`, `allroundMatch(u)`, `singlesBodyFit(style, body)`;
  - `keyAbilities(weights): AbilityKey[]`;
  - `rankSingles(blended: Scores, current: Scores, body: BodyProfile): SinglesResult`.
- Produces (`doubles.ts`):
  - `FRONT_WEIGHTS`, `BACK_WEIGHTS`;
  - `mixedNoteFor(sex, role)`, `partnerFor(role, current)`;
  - `pickDoublesRole(blended: Scores, current: Scores, body: BodyProfile, sex: Sex): DoublesResult`.

- [ ] **Step 1: Ayudas de test**

`src/engine/testkit.ts` (solo lo usan los tests):

```ts
import { blendScores, bodyTendency, currentScores } from './abilities'
import { analyzeBody } from './body'
import { ABILITY_KEYS, type AbilityKey, type Level, type Sex, type TalentInput } from './types'

/** Patrón de 8 niveles en el orden de ABILITY_KEYS. */
export function levelsOf(pattern: Level[]): Record<AbilityKey, Level> {
  const out = {} as Record<AbilityKey, Level>
  ABILITY_KEYS.forEach((k, i) => (out[k] = pattern[i]))
  return out
}

export function makeInput(
  sex: Sex, age: number, heightCm: number, weightKg: number, wingspanCm: number | null, yearsPlaying: number, pattern: Level[],
): TalentInput {
  return {
    sex, age, heightCm, weightKg, wingspanCm, yearsPlaying,
    hand: 'R', freq: '2-3', preference: 'all',
    levels: levelsOf(pattern),
    tests: { verticalJumpCm: null, ropeSkip1Min: null, cooper12MinM: null, rulerDropCm: null },
  }
}

export function prepare(input: TalentInput) {
  const body = analyzeBody(input)
  const current = currentScores(input)
  const blended = blendScores(current, bodyTendency(body), input.yearsPlaying)
  return { body, current, blended }
}

// Casos verificados con el prototipo (docs/superpowers/prototype/cases.ts)
export const GOLDEN = makeInput('F', 24, 163, 51, 164, 2, [2, 3, 1, 2, 2, 2, 1, 3])
export const SMASHER = makeInput('M', 25, 188, 80, null, 6, [5, 3, 2, 2, 3, 5, 2, 3])
export const NET_PLAYER = makeInput('F', 25, 160, 52, null, 4, [2, 2, 4, 5, 3, 2, 4, 3])
export const COUNTER = makeInput('M', 28, 170, 62, null, 5, [2, 4, 5, 3, 4, 2, 3, 5])
export const THINKER = makeInput('M', 35, 175, 70, null, 8, [2, 4, 2, 4, 3, 4, 5, 4])
export const SPEEDSTER = makeInput('F', 22, 158, 48, null, 3, [4, 3, 4, 3, 5, 2, 2, 3])
export const FLAT_HIGH = makeInput('M', 26, 172, 66, null, 6, [4, 4, 4, 4, 4, 4, 4, 4])
```

- [ ] **Step 2: Escribir los tests que fallan**

`src/engine/singles.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { fitBandOf, keyAbilities, rankSingles, SINGLES_WEIGHTS } from './singles'
import { COUNTER, FLAT_HIGH, GOLDEN, NET_PLAYER, prepare, SMASHER, SPEEDSTER, THINKER } from './testkit'
import type { TalentInput } from './types'

const rank = (input: TalentInput) => {
  const { body, current, blended } = prepare(input)
  return rankSingles(blended, current, body)
}

describe('rankSingles', () => {
  it('perfil de referencia: 四方拉吊控制型 63', () => {
    const r = rank(GOLDEN)
    expect(r.ranking).toEqual([
      { style: 'control', fit: 63 },
      { style: 'attack', fit: 54 },
      { style: 'speed', fit: 52 },
      { style: 'counter', fit: 51 },
      { style: 'allround', fit: 49 },
      { style: 'net', fit: 38 },
    ])
    expect(r.top).toBe('control')
    expect(r.runnerUp).toBe('attack')
    expect(r.margin).toBe(9)
    expect(r.fitBand).toBe('good')
    expect(r.drivers).toEqual(['endurance'])
    expect(r.gaps).toEqual(['tactics', 'netTouch', 'rearCourt'])
  })
  it.each([
    ['rematador alto', SMASHER, 'attack'],
    ['jugador de red', NET_PLAYER, 'net'],
    ['defensor', COUNTER, 'counter'],
    ['táctico', THINKER, 'control'],
    ['rápido', SPEEDSTER, 'speed'],
    ['perfil plano alto', FLAT_HIGH, 'allround'],
  ])('%s → %s', (_name, input, style) => {
    expect(rank(input).top).toBe(style)
  })
  it('los encajes son enteros en [0, 100] y la lista está ordenada', () => {
    const r = rank(SMASHER)
    for (const s of r.ranking) {
      expect(Number.isInteger(s.fit)).toBe(true)
      expect(s.fit).toBeGreaterThanOrEqual(0)
      expect(s.fit).toBeLessThanOrEqual(100)
    }
    for (let i = 1; i < r.ranking.length; i++) expect(r.ranking[i - 1].fit).toBeGreaterThanOrEqual(r.ranking[i].fit)
  })
})

describe('utilidades', () => {
  it('fitBandOf', () => {
    expect([70, 69, 55, 54].map(fitBandOf)).toEqual(['high', 'good', 'good', 'lean'])
  })
  it('keyAbilities ordena por peso y luego por orden canónico', () => {
    expect(keyAbilities(SINGLES_WEIGHTS.control)).toEqual(['endurance', 'tactics', 'netTouch', 'rearCourt'])
  })
  it('los pesos de cada estilo suman 1', () => {
    for (const w of Object.values(SINGLES_WEIGHTS)) {
      expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10)
    }
  })
})
```

`src/engine/doubles.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { mixedNoteFor, partnerFor, pickDoublesRole } from './doubles'
import { COUNTER, FLAT_HIGH, GOLDEN, NET_PLAYER, prepare, SMASHER, SPEEDSTER, THINKER } from './testkit'
import type { Scores, TalentInput } from './types'

const role = (input: TalentInput) => {
  const { body, current, blended } = prepare(input)
  return pickDoublesRole(blended, current, body, input.sex)
}

describe('pickDoublesRole', () => {
  it('perfil de referencia: 后场 62 con pareja de red', () => {
    expect(role(GOLDEN)).toEqual({
      role: 'back',
      fit: 62,
      fitBand: 'good',
      frontFit: 36,
      backFit: 62,
      partner: { role: 'front', strength: 'reaction' },
      mixedNote: 'femaleBack',
      drivers: ['endurance'],
      gaps: ['power', 'rearCourt'],
    })
  })
  it.each([
    ['rematador alto', SMASHER, 'back'],
    ['jugador de red', NET_PLAYER, 'front'],
    ['defensor', COUNTER, 'front'],
    ['rápido', SPEEDSTER, 'front'],
    ['táctico', THINKER, 'rotation'],
    ['perfil plano alto', FLAT_HIGH, 'rotation'],
  ])('%s → %s', (_name, input, expected) => {
    expect(role(input).role).toBe(expected)
  })
})

describe('pareja y mixto', () => {
  const current: Scores = { power: 8, endurance: 6, reaction: 2, netTouch: 4, speed: 6, rearCourt: 8, tactics: 4, mental: 6 }
  it('la pareja siempre complementa el rol', () => {
    expect(partnerFor('front', current)).toEqual({ role: 'back', strength: 'power' })
    expect(partnerFor('back', current)).toEqual({ role: 'front', strength: 'reaction' })
    expect(partnerFor('rotation', current)).toEqual({ role: 'rotation', strength: 'reaction' })
  })
  it('nota de mixto', () => {
    expect(mixedNoteFor('F', 'back')).toBe('femaleBack')
    expect(mixedNoteFor('M', 'front')).toBe('maleFront')
    expect(mixedNoteFor('F', 'front')).toBe('conventional')
    expect(mixedNoteFor('M', 'back')).toBe('conventional')
    expect(mixedNoteFor('F', 'rotation')).toBe('rotation')
  })
})
```

- [ ] **Step 3: Ejecutar y ver que fallan**

Run: `npx vitest run src/engine/singles.test.ts src/engine/doubles.test.ts`
Expected: FAIL (`Failed to resolve import "./singles"` / `"./doubles"`).

- [ ] **Step 4: Implementar `singles.ts`**

```ts
import { clamp, correlation, mean, sd } from './stats'
import {
  ABILITY_KEYS,
  SINGLES_STYLES,
  type AbilityKey,
  type BmiBand,
  type BodyProfile,
  type FitBand,
  type Scores,
  type SinglesResult,
  type SinglesStyle,
} from './types'

export type Weights = Record<AbilityKey, number>

export const makeWeights = (p: Partial<Weights>): Weights => ({
  power: 0, endurance: 0, reaction: 0, netTouch: 0, speed: 0, rearCourt: 0, tactics: 0, mental: 0, ...p,
})

export const SINGLES_WEIGHTS: Record<Exclude<SinglesStyle, 'allround'>, Weights> = {
  attack: makeWeights({ power: 0.3, rearCourt: 0.25, speed: 0.15, endurance: 0.1, reaction: 0.05, netTouch: 0.05, tactics: 0.05, mental: 0.05 }),
  control: makeWeights({ endurance: 0.25, tactics: 0.25, rearCourt: 0.15, netTouch: 0.15, speed: 0.1, mental: 0.1 }),
  counter: makeWeights({ reaction: 0.25, speed: 0.2, endurance: 0.2, mental: 0.15, netTouch: 0.1, tactics: 0.1 }),
  speed: makeWeights({ speed: 0.3, reaction: 0.2, power: 0.2, netTouch: 0.15, endurance: 0.15 }),
  net: makeWeights({ netTouch: 0.35, tactics: 0.2, reaction: 0.15, speed: 0.1, mental: 0.1, rearCourt: 0.1 }),
}

export const toVector = (s: Scores): number[] => ABILITY_KEYS.map((k) => s[k])

/** Cuánto se diferencia el perfil (0–1). Un perfil casi plano no debe dar encajes extremos. */
export const spreadOf = (u: readonly number[]): number => Math.min(1, sd(u) / 1.0)

export const fitFrom = (score01: number, body01: number): number => Math.round(100 * (0.7 * score01 + 0.3 * body01))

export function fitBandOf(fit: number): FitBand {
  if (fit >= 70) return 'high'
  if (fit >= 55) return 'good'
  return 'lean'
}

export function profileMatch(u: readonly number[], weights: Weights): number {
  return (correlation(u, toVector(weights)) * spreadOf(u) + 1) / 2
}

export function allroundMatch(u: readonly number[]): number {
  return (1 - Math.min(sd(u) / 2.5, 1)) * Math.min(1, mean(u) / 6.5)
}

const olderBand = (b: BodyProfile) => b.ageBand === 'forties' || b.ageBand === 'fiftyPlus'
const byBmi = (b: BmiBand, table: Record<BmiBand, number>) => table[b]

export function singlesBodyFit(style: SinglesStyle, body: BodyProfile): number {
  const z = clamp(body.heightZ, -1.5, 1.5)
  const b = body.bmiBand
  let v = 0.6
  switch (style) {
    case 'attack':
      v = 0.5 + 0.2 * z + byBmi(b, { under: -0.25, lean: -0.1, normal: 0.1, solid: 0.15, heavy: -0.05 }) + (body.apeIndexCm >= 5 ? 0.05 : 0)
      break
    case 'control':
      v = 0.6 + byBmi(b, { under: -0.1, lean: 0.1, normal: 0.1, solid: -0.05, heavy: -0.2 }) + (olderBand(body) ? 0.1 : 0)
      break
    case 'counter':
      v = 0.5 - 0.15 * z + byBmi(b, { under: 0, lean: 0.1, normal: 0.05, solid: -0.1, heavy: -0.25 }) + (body.apeIndexCm >= 3 ? 0.1 : 0)
      break
    case 'speed':
      v =
        0.5 -
        0.15 * z +
        byBmi(b, { under: -0.05, lean: 0.2, normal: 0.1, solid: -0.15, heavy: -0.3 }) +
        { youth: 0, prime: 0, thirties: -0.05, forties: -0.15, fiftyPlus: -0.25 }[body.ageBand]
      break
    case 'net':
      v = 0.6 + (olderBand(body) ? 0.05 : 0)
      break
    case 'allround':
      v = 0.6 + (b === 'lean' || b === 'normal' ? 0.05 : 0)
      break
  }
  return clamp(v, 0, 1)
}

/** Capacidades con peso ≥ 0.15, ordenadas por peso y luego por orden canónico. */
export function keyAbilities(weights: Weights): AbilityKey[] {
  return ABILITY_KEYS.filter((k) => weights[k] >= 0.15).sort(
    (a, b) => weights[b] - weights[a] || ABILITY_KEYS.indexOf(a) - ABILITY_KEYS.indexOf(b),
  )
}

const DRIVER_FROM = 6
const GAP_UP_TO = 4

export function driversAndGaps(keys: AbilityKey[], current: Scores) {
  return {
    drivers: keys.filter((k) => current[k] >= DRIVER_FROM),
    gaps: keys.filter((k) => current[k] <= GAP_UP_TO),
  }
}

export function rankSingles(blended: Scores, current: Scores, body: BodyProfile): SinglesResult {
  const u = toVector(blended)
  const ranking = SINGLES_STYLES.map((style) => {
    const match = style === 'allround' ? allroundMatch(u) : profileMatch(u, SINGLES_WEIGHTS[style])
    return { style, fit: fitFrom(match, singlesBodyFit(style, body)) }
  }).sort((a, b) => b.fit - a.fit || SINGLES_STYLES.indexOf(a.style) - SINGLES_STYLES.indexOf(b.style))
  const top = ranking[0].style
  let drivers: AbilityKey[]
  let gaps: AbilityKey[]
  if (top === 'allround') {
    const byCurrent = [...ABILITY_KEYS].sort((a, b) => current[b] - current[a] || ABILITY_KEYS.indexOf(a) - ABILITY_KEYS.indexOf(b))
    const dg = driversAndGaps(byCurrent, current)
    drivers = dg.drivers.slice(0, 2)
    gaps = dg.gaps.slice(-2)
  } else {
    ;({ drivers, gaps } = driversAndGaps(keyAbilities(SINGLES_WEIGHTS[top]), current))
  }
  return {
    ranking,
    top,
    runnerUp: ranking[1].style,
    margin: ranking[0].fit - ranking[1].fit,
    fitBand: fitBandOf(ranking[0].fit),
    drivers,
    gaps,
  }
}
```

- [ ] **Step 5: Implementar `doubles.ts`**

```ts
import { driversAndGaps, fitBandOf, fitFrom, keyAbilities, makeWeights, profileMatch, toVector, type Weights } from './singles'
import { argBy, clamp, mean } from './stats'
import { ABILITY_KEYS, RADAR_KEYS, type BodyProfile, type DoublesResult, type DoublesRole, type MixedNote, type PartnerAdvice, type Scores, type Sex } from './types'

export const FRONT_WEIGHTS: Weights = makeWeights({ endurance: 0.05, reaction: 0.3, netTouch: 0.3, speed: 0.2, tactics: 0.1, mental: 0.05 })
export const BACK_WEIGHTS: Weights = makeWeights({ power: 0.35, endurance: 0.2, reaction: 0.05, speed: 0.1, rearCourt: 0.25, mental: 0.05 })
const ROTATION_WEIGHTS: Weights = Object.fromEntries(
  ABILITY_KEYS.map((k) => [k, (FRONT_WEIGHTS[k] + BACK_WEIGHTS[k]) / 2]),
) as Weights

const ROTATION_GAP = 8
const ROTATION_MIN_MEAN = 5

export function frontBodyFit(body: BodyProfile): number {
  const z = clamp(body.heightZ, -1.5, 1.5)
  return clamp(0.5 - 0.15 * z + { under: 0, lean: 0.1, normal: 0.05, solid: -0.05, heavy: -0.2 }[body.bmiBand], 0, 1)
}

export function backBodyFit(body: BodyProfile): number {
  const z = clamp(body.heightZ, -1.5, 1.5)
  return clamp(
    0.5 + 0.2 * z + (body.apeIndexCm >= 3 ? 0.1 : 0) + { under: -0.2, lean: -0.05, normal: 0.1, solid: 0.15, heavy: 0 }[body.bmiBand],
    0,
    1,
  )
}

export function mixedNoteFor(sex: Sex, role: DoublesRole): MixedNote {
  if (role === 'rotation') return 'rotation'
  if (sex === 'F' && role === 'back') return 'femaleBack'
  if (sex === 'M' && role === 'front') return 'maleFront'
  return 'conventional'
}

/** La pareja se deriva del rol propio: nunca se escribe a mano. */
export function partnerFor(role: DoublesRole, current: Scores): PartnerAdvice {
  if (role === 'front') return { role: 'back', strength: 'power' }
  if (role === 'back') return { role: 'front', strength: 'reaction' }
  return { role: 'rotation', strength: argBy(RADAR_KEYS, (k) => current[k], (a, b) => a < b) }
}

export function pickDoublesRole(blended: Scores, current: Scores, body: BodyProfile, sex: Sex): DoublesResult {
  const u = toVector(blended)
  const frontFit = fitFrom(profileMatch(u, FRONT_WEIGHTS), frontBodyFit(body))
  const backFit = fitFrom(profileMatch(u, BACK_WEIGHTS), backBodyFit(body))
  const diff = frontFit - backFit
  const role: DoublesRole =
    Math.abs(diff) < ROTATION_GAP && mean(u) >= ROTATION_MIN_MEAN ? 'rotation' : diff >= 0 ? 'front' : 'back'
  const fit = role === 'rotation' ? Math.min(100, Math.round((frontFit + backFit) / 2) + 5) : Math.max(frontFit, backFit)
  const weights = role === 'front' ? FRONT_WEIGHTS : role === 'back' ? BACK_WEIGHTS : ROTATION_WEIGHTS
  const { drivers, gaps } = driversAndGaps(keyAbilities(weights), current)
  return {
    role,
    fit,
    fitBand: fitBandOf(fit),
    frontFit,
    backFit,
    partner: partnerFor(role, current),
    mixedNote: mixedNoteFor(sex, role),
    drivers,
    gaps,
  }
}
```

- [ ] **Step 6: Ejecutar y ver que pasan**

Run: `npx vitest run src/engine && npm run typecheck`
Expected: PASS. Si algún número del caso de referencia no coincide, compara con `node docs/superpowers/prototype/cases.ts` y `run.ts` antes de tocar nada: el prototipo es la referencia.

- [ ] **Step 7: Commit**

```bash
git add src/engine
git commit -m "feat(engine): singles style ranking and doubles role with complementary partner

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

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

---

### Task 14: 业余评级 — motor y contenido (zh/es)

**Requiere:** `docs/superpowers/research/amateur_rating.md` para refinar los textos.

**Files:**
- Create: `src/engine/rating.ts`, `src/content/zh/rating.ts`, `src/content/es/rating.ts`
- Modify: `src/content/types.ts` (añadir `RatingContent`), `src/content/index.ts` (añadir `useRatingContent`)
- Test: `src/engine/rating.test.ts`, `src/content/rating-content.test.ts`

**Interfaces:**
- Produces (`rating.ts`):
  - `RATING_QUESTION_IDS` (18, en este orden), `RatingQuestionId`, `RATING_OPTIONS = ['a','b','c','d','e']`, `RatingOption`, `RatingAnswers`;
  - `RatingLevel` (1–8), `RATING_LEVELS`, `LEVEL_MIN_PERCENT`, `RATING_CAPS`, `RatingRuleId`, `RATING_RULES`;
  - `RatingResult`, `isRatingComplete(a)`, `levelFromPercent(p)`, `scoreRating(a)`.
- Produces (contenido): `RatingContent`, `ratingZh`, `ratingEs`, `useRatingContent()`.
- Puntos: opción a = 0 … e = 4. Máximo 72. Todas las preguntas pesan igual.

- [ ] **Step 1: Escribir el test que falla**

`src/engine/rating.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { isRatingComplete, levelFromPercent, RATING_QUESTION_IDS, scoreRating, type RatingOption, type RatingQuestionId } from './rating'

const all = (o: RatingOption) => Object.fromEntries(RATING_QUESTION_IDS.map((id) => [id, o])) as Record<RatingQuestionId, RatingOption>

describe('scoreRating', () => {
  it('todo a → L1 con topes', () => {
    const r = scoreRating(all('a'))
    expect(r.points).toBe(0)
    expect(r.level).toBe(1)
    expect(r.caps.map((c) => c.question)).toEqual(['clear', 'footwork', 'defense', 'serve', 'grip', 'match', 'training'])
  })
  it('todo e → L8 sin topes ni avisos', () => {
    const r = scoreRating(all('e'))
    expect(r).toMatchObject({ points: 72, maxPoints: 72, percent: 100, rawLevel: 8, level: 8, caps: [], warnings: [] })
  })
  it('todo c → 50% → L4', () => {
    expect(scoreRating(all('c'))).toMatchObject({ percent: 50, level: 4 })
  })
  it('clear que no llega al fondo limita a L3 y dispara avisos de coherencia', () => {
    const r = scoreRating({ ...all('e'), clear: 'b' })
    expect(r.rawLevel).toBe(8)
    expect(r.level).toBe(3)
    expect(r.warnings).toEqual(['smashNoClear', 'dropNoClear', 'benchmarkMismatch'])
  })
  it('sin torneos reales el máximo es L6', () => {
    expect(scoreRating({ ...all('e'), match: 'b' }).level).toBe(6)
  })
})

describe('utilidades', () => {
  it('levelFromPercent', () => {
    expect([0, 14, 15, 41, 42, 91, 92, 100].map(levelFromPercent)).toEqual([1, 1, 2, 3, 4, 7, 8, 8])
  })
  it('isRatingComplete', () => {
    expect(isRatingComplete(all('c'))).toBe(true)
    const { clear: _omit, ...rest } = all('c')
    expect(isRatingComplete(rest)).toBe(false)
  })
})
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npx vitest run src/engine/rating.test.ts`
Expected: FAIL (`Failed to resolve import "./rating"`).

- [ ] **Step 3: Implementar `src/engine/rating.ts`**

```ts
export const RATING_QUESTION_IDS = [
  'clear', 'smash', 'drop', 'net', 'serve', 'defense', 'footwork', 'drive', 'backhand',
  'grip', 'doubles', 'tactics', 'consistency', 'fitness', 'match', 'training', 'years', 'benchmark',
] as const
export type RatingQuestionId = (typeof RATING_QUESTION_IDS)[number]
export const RATING_OPTIONS = ['a', 'b', 'c', 'd', 'e'] as const
export type RatingOption = (typeof RATING_OPTIONS)[number]
export type RatingAnswers = Partial<Record<RatingQuestionId, RatingOption>>
export type RatingLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export const RATING_LEVELS: RatingLevel[] = [1, 2, 3, 4, 5, 6, 7, 8]

export const LEVEL_MIN_PERCENT: Record<RatingLevel, number> = { 1: 0, 2: 15, 3: 28, 4: 42, 5: 56, 6: 70, 7: 82, 8: 92 }

export const RATING_CAPS: { question: RatingQuestionId; options: RatingOption[]; maxLevel: RatingLevel }[] = [
  { question: 'clear', options: ['a'], maxLevel: 2 },
  { question: 'clear', options: ['b'], maxLevel: 3 },
  { question: 'footwork', options: ['a'], maxLevel: 3 },
  { question: 'defense', options: ['a'], maxLevel: 3 },
  { question: 'serve', options: ['a'], maxLevel: 3 },
  { question: 'grip', options: ['a'], maxLevel: 3 },
  { question: 'match', options: ['a', 'b'], maxLevel: 6 },
  { question: 'training', options: ['a'], maxLevel: 6 },
]

export type RatingRuleId =
  | 'smashNoClear' | 'dropNoClear' | 'doublesNoDrive' | 'consistencyNoFitness'
  | 'tacticsNoFootwork' | 'newbieExpert' | 'benchmarkMismatch'

type Complete = Record<RatingQuestionId, RatingOption>
const pts = (o: RatingOption) => RATING_OPTIONS.indexOf(o)

export const RATING_RULES: { id: RatingRuleId; when: (a: Complete) => boolean }[] = [
  { id: 'smashNoClear', when: (a) => pts(a.smash) >= 3 && pts(a.clear) <= 1 },
  { id: 'dropNoClear', when: (a) => pts(a.drop) >= 3 && pts(a.clear) <= 1 },
  { id: 'doublesNoDrive', when: (a) => pts(a.doubles) >= 3 && pts(a.drive) === 0 },
  { id: 'consistencyNoFitness', when: (a) => pts(a.consistency) >= 3 && pts(a.fitness) === 0 },
  { id: 'tacticsNoFootwork', when: (a) => pts(a.tactics) === 4 && pts(a.footwork) <= 1 },
  { id: 'newbieExpert', when: (a) => pts(a.years) === 0 && pts(a.smash) === 4 && pts(a.net) === 4 },
  { id: 'benchmarkMismatch', when: (a) => pts(a.benchmark) >= 3 && (pts(a.clear) <= 1 || pts(a.footwork) <= 1) },
]

export interface RatingResult {
  points: number
  maxPoints: number
  percent: number
  rawLevel: RatingLevel
  level: RatingLevel
  caps: { question: RatingQuestionId; maxLevel: RatingLevel }[]
  warnings: RatingRuleId[]
}

/** Acepta respuestas guardadas (Record<string, string>) y comprueba que las 18 son opciones válidas. */
export function isRatingComplete(a: Partial<Record<string, string>>): a is Complete {
  return RATING_QUESTION_IDS.every((id) => a[id] !== undefined && (RATING_OPTIONS as readonly string[]).includes(a[id]!))
}

export function levelFromPercent(p: number): RatingLevel {
  let level: RatingLevel = 1
  for (const l of RATING_LEVELS) if (p >= LEVEL_MIN_PERCENT[l]) level = l
  return level
}

export function scoreRating(a: Complete): RatingResult {
  const points = RATING_QUESTION_IDS.reduce((s, id) => s + pts(a[id]), 0)
  const maxPoints = RATING_QUESTION_IDS.length * 4
  const percent = Math.round((points / maxPoints) * 100)
  const rawLevel = levelFromPercent(percent)
  const caps = RATING_CAPS.filter((c) => c.options.includes(a[c.question])).map(({ question, maxLevel }) => ({ question, maxLevel }))
  const level = Math.min(rawLevel, ...caps.map((c) => c.maxLevel)) as RatingLevel
  const warnings = RATING_RULES.filter((r) => r.when(a)).map((r) => r.id)
  return { points, maxPoints, percent, rawLevel, level, caps, warnings }
}
```

- [ ] **Step 4: Tipos y contenido**

Añadir a `src/content/types.ts`:

```ts
import type { RatingLevel, RatingQuestionId, RatingRuleId } from '../engine/rating'

export interface RatingContent {
  moduleLabel: string
  title: string
  subtitle: string
  intro: string
  /** {done} {total} */
  progress: string
  submit: string
  /** {n} */
  incomplete: string
  questions: Record<RatingQuestionId, { title: string; options: Five }>
  levels: Record<RatingLevel, { code: string; name: string; tagline: string; can: string[]; typical: string; next: string[] }>
  rules: Record<RatingRuleId, string>
  result: {
    title: string
    /** {points} {max} {percent} */
    scoreLine: string
    capsTitle: string
    /** {question} {level} */
    cap: string
    warningsTitle: string
    canTitle: string
    typicalTitle: string
    nextTitle: string
    basis: string
    retake: string
    disclaimer: string
    missing: string
  }
}
```

**`src/content/zh/rating.ts`** (`export const ratingZh: RatingContent`):
- `moduleLabel`: `MODULE 02 | AMATEUR LEVEL`.
- Preguntas (título; opciones a→e), a completar y afinar con `amateur_rating.md` manteniendo el orden de dificultad:
  1. `clear` 后场高远球：过不了半场 / 能到后场中段 / 能到底线但弧线低、不稳定 / 稳定到底线，正手随意 / 头顶和反手都能到底线，还能打平高压制
  2. `smash` 杀球：基本不会杀或经常下网 / 能杀但速度慢、没威胁 / 中场能杀出威胁 / 后场能连续杀且有落点 / 能跳杀、点杀、劈杀，后场重杀对手难接
  3. `drop` 吊球：不会吊或经常下网 / 能吊但偏高偏远 / 能稳定吊到前场 / 会劈吊、滑板，动作有一致性 / 高远、杀、吊同一动作，对手难以判断
  4. `net` 网前：只会挑球 / 能放网但质量不稳 / 能搓、放，偶尔勾对角 / 搓勾推扑都会，能抢高点 / 网前有假动作，能主导网前
  5. `serve` 发球：经常失误 / 只会一种发球 / 正手高远和反手网前都稳定 / 有落点变化，很少被抢攻 / 节奏、落点、假动作结合，能衔接第三拍
  6. `defense` 接杀：基本接不住 / 能挡回但经常挑浅 / 能挡网或挑到后场 / 能挡直线、对角，也能抽 / 能主动反抽、勾对角直接反击
  7. `footwork` 步法：没学过，靠跨步 / 知道米字步但不熟练 / 能到位，回中心偶尔慢 / 启动快、回位及时，后退有交叉步和并步 / 步法自动化，起跳、蹬跨、垫步随意切换
  8. `drive` 平抽快挡：平球接不住 / 能挡但很被动 / 能对抽几拍 / 平抽有速度，能压住对手 / 快速平抽中能变线、下压抢攻
  9. `backhand` 反手：基本不会 / 只能反手挡网前 / 反手能打到中场 / 反手能过渡到后场 / 反手高远、反手吊、反手杀都会
  10. `grip` 握拍：一直一种握法 / 知道正反手握拍但不会转换 / 能转换但慢 / 转换自然，会用手指发力 / 能根据来球细微调整握拍和发力
  11. `doubles` 双打轮转：不清楚站位 / 只知道攻前后、守左右 / 能按规律轮转，偶尔撞拍或漏空档 / 轮转流畅，会补位 / 能主动封网、调动轮转，有战术配合
  12. `tactics` 战术意识：只想把球打回去 / 知道打对方空档 / 会四方拉吊调动对手 / 能针对对手弱点调整 / 能设计多拍组合，比赛中随时调整
  13. `consistency` 多拍稳定：一个回合不到 5 拍 / 5–10 拍 / 10–20 拍 / 20 拍以上 / 高强度下也能长回合不失误
  14. `fitness` 体能（单打）：一局都吃力 / 能打一局 / 能打两局 / 三局不明显降速 / 连续多场比赛仍保持强度
  15. `match` 比赛经验：没打过比赛 / 只打过球馆或俱乐部内部赛 / 打过市、区级业余赛 / 业余赛进过前八或有名次 / 省级以上业余赛前列，或体校、专业队经历
  16. `training` 训练背景：自学、打野球 / 上过少量课 / 系统上课半年以上 / 长期系统训练 1 年以上 / 体校、专业队或高水平队训练经历
  17. `years` 球龄与频率：不到 1 年 / 1–2 年 / 3–5 年，每周 1–2 次 / 3–5 年每周 3 次以上，或 5 年以上 / 10 年以上且规律训练
  18. `benchmark` 对阵俱乐部公认高手（单打）：基本得不了分 / 能得 5 分以下 / 能得 10 分左右 / 互有胜负 / 基本能赢
- Niveles:
  - `1` L1 入门萌新
  - `2` L2 初级球友
  - `3` L3 进阶初级
  - `4` L4 中级球友
  - `5` L5 中高级
  - `6` L6 高级业余
  - `7` L7 业余顶尖
  - `8` L8 准专业
  - Cada nivel lleva `can` (3–5 conductas observables), `typical` (resultados típicos) y `next` (2–3 cosas que entrenar).
- `rules`: un texto por regla que explique la incoherencia sin acusar, por ejemplo "你选择了能在后场连续重杀，但高远球还到不了底线——这两项通常是一起进步的，建议再确认一下高远球的真实水平。"
- `result.basis`: explica en qué escalas reales se basa según `amateur_rating.md` (nombra solo sistemas verificados).
- `result.missing`: aviso de resultado inexistente.

**`src/content/es/rating.ts`**:
- Traducción completa con el glosario de la Tarea 10.
- Niveles:
  - L1 Iniciación
  - L2 Principiante
  - L3 Principiante avanzado
  - L4 Intermedio
  - L5 Intermedio alto
  - L6 Avanzado
  - L7 Amateur de élite
  - L8 Casi profesional

Añadir a `src/content/index.ts`:

```ts
import { ratingEs } from './es/rating'
import { ratingZh } from './zh/rating'
import type { RatingContent } from './types'

export function useRatingContent(): RatingContent {
  return useI18n().lang === 'zh' ? ratingZh : ratingEs
}
```

- [ ] **Step 5: Test de contenido**

`src/content/rating-content.test.ts`: aplica las mismas comprobaciones que `content.test.ts` a `ratingZh`/`ratingEs`:
- ningún texto vacío;
- mismas rutas;
- mismos marcadores;
- nada de caracteres chinos en español.

Comprueba además que las 5 opciones de cada pregunta son distintas. Para no duplicar código, mueve `leaves` y `placeholders` a `src/content/testUtils.ts` y úsalos desde los dos tests:

```ts
export type Leaf = { path: string; value: string }
export function leaves(node: unknown, path = ''): Leaf[] {
  if (typeof node === 'string') return [{ path, value: node }]
  if (Array.isArray(node)) return node.flatMap((v, i) => leaves(v, `${path}[${i}]`))
  if (node && typeof node === 'object') return Object.entries(node).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k))
  return []
}
export const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')
export const HAN = /[一-鿿]/
```

`src/content/rating-content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { ratingEs } from './es/rating'
import { HAN, leaves, placeholders } from './testUtils'
import { ratingZh } from './zh/rating'

describe('contenido de 业余评级', () => {
  it('sin vacíos, mismas rutas y mismos marcadores', () => {
    const zh = leaves(ratingZh)
    const es = leaves(ratingEs)
    expect(zh.filter((l) => !l.value.trim())).toEqual([])
    expect(es.filter((l) => !l.value.trim())).toEqual([])
    expect(es.map((l) => l.path)).toEqual(zh.map((l) => l.path))
    const esMap = new Map(es.map((l) => [l.path, l.value]))
    expect(zh.filter((l) => placeholders(l.value) !== placeholders(esMap.get(l.path)!)).map((l) => l.path)).toEqual([])
  })
  it('español sin caracteres chinos', () => {
    expect(leaves(ratingEs).filter((l) => HAN.test(l.value)).map((l) => l.path)).toEqual([])
  })
  it('opciones distintas en cada pregunta', () => {
    for (const q of Object.values(ratingZh.questions)) expect(new Set(q.options).size).toBe(5)
  })
})
```

- [ ] **Step 6: Ejecutar y ver que pasa**

Run: `npx vitest run src/engine/rating.test.ts src/content && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/engine/rating.ts src/engine/rating.test.ts src/content
git commit -m "feat(rating): amateur level engine with caps, consistency rules and zh/es content

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: 业余评级 — páginas

**Files:**
- Modify: `src/pages/rating/RatingPage.tsx` (sustituye el provisional), `src/App.tsx` (ruta `/rating/result/:id`)
- Create: `src/pages/rating/RatingResultPage.tsx`, `src/components/ChoiceGroup.tsx`
- Test: `src/pages/rating/RatingPage.test.tsx`

**Interfaces:**
- Consumes: `RATING_QUESTION_IDS`, `RATING_OPTIONS`, `isRatingComplete`, `scoreRating`, `useRatingContent`, `useStore().addRating`, `format`.
- Produces:
  - `ChoiceGroup({ name, legend, options: { value: string; label: string }[], value?: string, onChange })`: un `fieldset` con radios. Lo reutiliza el MBTI.
  - Rutas `/rating` y `/rating/result/:id`.

- [ ] **Step 1: Escribir el test que falla**

`src/pages/rating/RatingPage.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ratingZh as c } from '../../content/zh/rating'
import { RATING_QUESTION_IDS } from '../../engine/rating'
import { renderApp } from '../../test/renderApp'

describe('业余评级', () => {
  it('el botón no envía hasta responder las 18 preguntas', async () => {
    renderApp('/rating')
    await userEvent.click(screen.getByRole('button', { name: c.submit }))
    expect(screen.getByText(c.incomplete.replace('{n}', '18'))).toBeInTheDocument()
  })
  it('responder todo "c" da L4 y lo guarda', async () => {
    renderApp('/rating')
    const u = userEvent.setup()
    for (const id of RATING_QUESTION_IDS) {
      const group = screen.getByRole('group', { name: c.questions[id].title })
      await u.click(within(group).getByLabelText(c.questions[id].options[2]))
    }
    await u.click(screen.getByRole('button', { name: c.submit }))
    expect(screen.getAllByText(new RegExp(c.levels[4].name)).length).toBeGreaterThan(0)
    expect(JSON.parse(localStorage.getItem('yuqiu.v1')!).rating).toHaveLength(1)
  })
  it('resultado inexistente → vuelve al test con aviso', () => {
    renderApp('/rating/result/nope')
    expect(screen.getByText(c.result.missing)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npx vitest run src/pages/rating`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/components/ChoiceGroup.tsx`:

```tsx
export function ChoiceGroup({
  name, legend, options, value, onChange,
}: {
  name: string
  legend: string
  options: { value: string; label: string }[]
  value?: string
  onChange: (v: string) => void
}) {
  return (
    <fieldset className="choice">
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o.value} className={'choice-option' + (value === o.value ? ' is-selected' : '')}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  )
}
```

`src/pages/rating/RatingPage.tsx`:

```tsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChoiceGroup } from '../../components/ChoiceGroup'
import { useRatingContent } from '../../content'
import { isRatingComplete, RATING_OPTIONS, RATING_QUESTION_IDS, type RatingAnswers, type RatingOption } from '../../engine/rating'
import { format } from '../../i18n/I18nProvider'
import { useStore } from '../../lib/StoreProvider'

export default function RatingPage() {
  const c = useRatingContent()
  const { addRating } = useStore()
  const navigate = useNavigate()
  const missing = (useLocation().state as { missing?: boolean } | null)?.missing === true
  const [answers, setAnswers] = useState<RatingAnswers>({})
  const [showIncomplete, setShowIncomplete] = useState(false)
  const done = RATING_QUESTION_IDS.filter((id) => answers[id]).length
  const submit = () => {
    if (!isRatingComplete(answers)) {
      setShowIncomplete(true)
      return
    }
    const rec = addRating(answers)
    navigate(`/rating/result/${rec.id}`)
  }
  return (
    <section className="card stack">
      <p className="mono-label">{c.moduleLabel}</p>
      <h1 className="page-title">{c.title}</h1>
      <p className="page-subtitle">{c.subtitle}</p>
      {missing && <p className="notice" role="status">{c.result.missing}</p>}
      <p>{c.intro}</p>
      <p className="progress" aria-live="polite">{format(c.progress, { done, total: RATING_QUESTION_IDS.length })}</p>
      {RATING_QUESTION_IDS.map((id) => (
        <ChoiceGroup
          key={id}
          name={id}
          legend={c.questions[id].title}
          value={answers[id]}
          options={RATING_OPTIONS.map((o, j) => ({ value: o, label: c.questions[id].options[j] }))}
          onChange={(v) => setAnswers((a) => ({ ...a, [id]: v as RatingOption }))}
        />
      ))}
      {showIncomplete && done < RATING_QUESTION_IDS.length && (
        <p className="field-error" role="alert">{format(c.incomplete, { n: RATING_QUESTION_IDS.length - done })}</p>
      )}
      <button type="button" className="btn btn-primary" onClick={submit}>{c.submit}</button>
    </section>
  )
}
```

`src/pages/rating/RatingResultPage.tsx`:

```tsx
import { Link, Navigate, useParams } from 'react-router-dom'
import { useRatingContent } from '../../content'
import { isRatingComplete, scoreRating } from '../../engine/rating'
import { format } from '../../i18n/I18nProvider'
import { useStore } from '../../lib/StoreProvider'

export default function RatingResultPage() {
  const { id } = useParams()
  const { state } = useStore()
  const c = useRatingContent()
  const rec = state.rating.find((r) => r.id === id)
  if (!rec || !isRatingComplete(rec.answers)) return <Navigate to="/rating" replace state={{ missing: true }} />
  const r = scoreRating(rec.answers)
  const lv = c.levels[r.level]
  return (
    <article className="card stack">
      <p className="mono-label">LEVEL REPORT</p>
      <h1 className="page-title">{c.result.title}</h1>
      <div className="level-badge">
        <span className="level-code">{lv.code}</span>
        <span className="level-name">{lv.name}</span>
      </div>
      <p className="page-subtitle">{lv.tagline}</p>
      <p className="muted">{format(c.result.scoreLine, { points: r.points, max: r.maxPoints, percent: r.percent })}</p>
      {r.caps.length > 0 && (
        <div className="notice">
          <strong>{c.result.capsTitle}</strong>
          {r.caps.map((cap) => (
            <p key={`${cap.question}-${cap.maxLevel}`}>
              {format(c.result.cap, { question: c.questions[cap.question].title, level: c.levels[cap.maxLevel].code })}
            </p>
          ))}
        </div>
      )}
      {r.warnings.length > 0 && (
        <div className="notice">
          <strong>{c.result.warningsTitle}</strong>
          {r.warnings.map((w) => <p key={w}>{c.rules[w]}</p>)}
        </div>
      )}
      <h2 className="form-section">{c.result.canTitle}</h2>
      <ul>{lv.can.map((x) => <li key={x}>{x}</li>)}</ul>
      <h2 className="form-section">{c.result.typicalTitle}</h2>
      <p>{lv.typical}</p>
      <h2 className="form-section">{c.result.nextTitle}</h2>
      <ul>{lv.next.map((x) => <li key={x}>{x}</li>)}</ul>
      <p className="field-hint">{c.result.basis}</p>
      <p className="field-hint">{c.result.disclaimer}</p>
      <Link to="/rating" className="btn">🔄 {c.result.retake}</Link>
    </article>
  )
}
```

Añadir la ruta `<Route path="/rating/result/:id" element={<RatingResultPage />} />` en `AppRoutes`, y a `global.css`:

```css
.choice { border: 0; margin: 0; padding: 16px; background: var(--field); border-radius: var(--radius-field); display: grid; gap: 8px; }
.choice legend { font-weight: 800; padding: 0; margin-bottom: 8px; float: left; width: 100%; }
.choice-option { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; background: #fff; border-radius: 14px; border: 2px solid transparent; cursor: pointer; }
.choice-option.is-selected { border-color: var(--ink); }
.choice-option input { margin-top: 4px; accent-color: var(--ink); }
.progress { font-family: var(--font-mono); color: var(--muted); margin: 0; }
.level-badge { display: flex; gap: 12px; justify-content: center; align-items: baseline; }
.level-code { font-family: var(--font-mono); font-size: 44px; font-weight: 700; }
.level-name { font-size: 28px; font-weight: 900; }
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat(rating): questionnaire and level result pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: 羽球MBTI — motor y contenido (zh/es)

**Requiere:** `docs/superpowers/research/badminton_mbti.md` como inspiración de tono y tipos. Los ejes están fijados: letras MBTI estándar.

**Files:**
- Create: `src/engine/mbti.ts`, `src/content/zh/mbti.ts`, `src/content/es/mbti.ts`
- Modify: `src/content/types.ts` (añadir `MbtiContent`), `src/content/index.ts` (añadir `useMbtiContent`)
- Test: `src/engine/mbti.test.ts`, `src/content/mbti-content.test.ts`

**Interfaces:**
- Produces:
  - `MBTI_AXES`, `MbtiAxis`, `MbtiLetter`, `POLES`;
  - `MBTI_QUESTION_IDS` (m01–m20), `MbtiQuestionId`, `MBTI_QUESTIONS: { id; axis; aPole }[]`;
  - `MBTI_CODES` (16), `MbtiCode`, `MbtiAnswers`;
  - `isMbtiComplete(a)`, `scoreMbti(a): MbtiResult`, `bestPartner(code)`, `worstPartner(code)`;
  - contenido: `MbtiContent`, `mbtiZh`, `mbtiEs`, `useMbtiContent()`.

**Tabla de polos: la opción `a` de cada pregunta DEBE expresar este polo, y la `b` el opuesto.**

| id | eje | a = | id | eje | a = | id | eje | a = | id | eje | a = |
|---|---|---|---|---|---|---|---|---|---|---|---|
| m01 | EI | E | m02 | SN | S | m03 | TF | T | m04 | JP | J |
| m05 | EI | I | m06 | SN | N | m07 | TF | F | m08 | JP | P |
| m09 | EI | E | m10 | SN | S | m11 | TF | T | m12 | JP | J |
| m13 | EI | I | m14 | SN | N | m15 | TF | F | m16 | JP | P |
| m17 | EI | E | m18 | SN | S | m19 | TF | T | m20 | JP | J |

Significado en pista:
- **E 外放 / I 内敛:** de dónde saca la energía, si grita y celebra, si organiza quedadas o se concentra en silencio.
- **S 实感 / N 直觉:** fundamentos, porcentajes y lo que ve, frente a creatividad, engaño y anticipación.
- **T 理性 / F 感性:** ganar analizando debilidades, frente a disfrutar, el ambiente y cuidar a la pareja.
- **J 计划 / P 随性:** plan de partido y rutinas, frente a improvisación y adaptarse sobre la marcha.

- [ ] **Step 1: Escribir el test que falla**

`src/engine/mbti.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { bestPartner, isMbtiComplete, MBTI_CODES, MBTI_QUESTION_IDS, MBTI_QUESTIONS, scoreMbti, worstPartner, type MbtiQuestionId } from './mbti'

const all = (o: 'a' | 'b') => Object.fromEntries(MBTI_QUESTION_IDS.map((id) => [id, o])) as Record<MbtiQuestionId, 'a' | 'b'>

describe('羽球MBTI', () => {
  it('5 preguntas por eje, con la tabla de polos fijada', () => {
    for (const axis of ['EI', 'SN', 'TF', 'JP'] as const) expect(MBTI_QUESTIONS.filter((q) => q.axis === axis)).toHaveLength(5)
    expect(MBTI_QUESTIONS.slice(0, 8).map((q) => q.aPole).join('')).toBe('ESTJINFP')
  })
  it('todo a → ESTJ al 60%, todo b → INFP al 60%', () => {
    const a = scoreMbti(all('a'))
    expect(a.code).toBe('ESTJ')
    expect(a.axes.EI).toEqual({ first: 3, second: 2, winner: 'E', percent: 60 })
    expect(scoreMbti(all('b')).code).toBe('INFP')
  })
  it('un eje unánime da 100%', () => {
    const answers = { ...all('a'), m05: 'b', m13: 'b' } as Record<MbtiQuestionId, 'a' | 'b'>
    expect(scoreMbti(answers).axes.EI).toEqual({ first: 5, second: 0, winner: 'E', percent: 100 })
  })
  it('nunca hay empate: el código es siempre uno de los 16 en una muestra amplia de combinaciones', () => {
    for (let mask = 0; mask < 4096; mask += 7) {
      const answers = Object.fromEntries(MBTI_QUESTION_IDS.map((id, i) => [id, (mask >> (i % 12)) & 1 ? 'a' : 'b'])) as Record<MbtiQuestionId, 'a' | 'b'>
      expect(MBTI_CODES).toContain(scoreMbti(answers).code)
    }
  })
  it('parejas', () => {
    expect(bestPartner('ESTJ')).toBe('ISTP')
    expect(worstPartner('ESTJ')).toBe('ENFJ')
  })
  it('isMbtiComplete', () => {
    expect(isMbtiComplete(all('a'))).toBe(true)
    const { m01: _omit, ...rest } = all('a')
    expect(isMbtiComplete(rest)).toBe(false)
  })
})
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npx vitest run src/engine/mbti.test.ts`
Expected: FAIL (`Failed to resolve import "./mbti"`).

- [ ] **Step 3: Implementar `src/engine/mbti.ts`**

```ts
export const MBTI_AXES = ['EI', 'SN', 'TF', 'JP'] as const
export type MbtiAxis = (typeof MBTI_AXES)[number]
export type MbtiLetter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'
export const POLES: Record<MbtiAxis, [MbtiLetter, MbtiLetter]> = { EI: ['E', 'I'], SN: ['S', 'N'], TF: ['T', 'F'], JP: ['J', 'P'] }

export const MBTI_QUESTION_IDS = [
  'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10',
  'm11', 'm12', 'm13', 'm14', 'm15', 'm16', 'm17', 'm18', 'm19', 'm20',
] as const
export type MbtiQuestionId = (typeof MBTI_QUESTION_IDS)[number]
export type MbtiAnswers = Partial<Record<MbtiQuestionId, 'a' | 'b'>>

export const MBTI_QUESTIONS: { id: MbtiQuestionId; axis: MbtiAxis; aPole: MbtiLetter }[] = MBTI_QUESTION_IDS.map((id, i) => {
  const axis = MBTI_AXES[i % 4]
  const [first, second] = POLES[axis]
  return { id, axis, aPole: Math.floor(i / 4) % 2 === 0 ? first : second }
})

export const MBTI_CODES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
] as const
export type MbtiCode = (typeof MBTI_CODES)[number]

export interface MbtiAxisResult {
  first: number
  second: number
  winner: MbtiLetter
  percent: number
}
export interface MbtiResult {
  code: MbtiCode
  axes: Record<MbtiAxis, MbtiAxisResult>
}

export function isMbtiComplete(a: Partial<Record<string, string>>): a is Record<MbtiQuestionId, 'a' | 'b'> {
  return MBTI_QUESTION_IDS.every((id) => a[id] === 'a' || a[id] === 'b')
}

export function scoreMbti(answers: Record<MbtiQuestionId, 'a' | 'b'>): MbtiResult {
  const axes = {} as Record<MbtiAxis, MbtiAxisResult>
  for (const axis of MBTI_AXES) {
    const [first, second] = POLES[axis]
    let nFirst = 0
    let nSecond = 0
    for (const q of MBTI_QUESTIONS.filter((x) => x.axis === axis)) {
      const pole = answers[q.id] === 'a' ? q.aPole : q.aPole === first ? second : first
      if (pole === first) nFirst++
      else nSecond++
    }
    const winner = nFirst > nSecond ? first : second
    axes[axis] = { first: nFirst, second: nSecond, winner, percent: Math.round((Math.max(nFirst, nSecond) / (nFirst + nSecond)) * 100) }
  }
  const code = MBTI_AXES.map((a) => axes[a].winner).join('') as MbtiCode
  return { code, axes }
}

const flip = (code: MbtiCode, axes: MbtiAxis[]): MbtiCode =>
  MBTI_AXES.map((axis, i) => {
    const letter = code[i] as MbtiLetter
    if (!axes.includes(axis)) return letter
    const [a, b] = POLES[axis]
    return letter === a ? b : a
  }).join('') as MbtiCode

/** Pareja ideal: energía y estructura complementarias (E/I y J/P opuestos), misma forma de leer el juego y mismos valores. */
export const bestPartner = (code: MbtiCode): MbtiCode => flip(code, ['EI', 'JP'])
/** Choque típico: misma energía y estructura, pero lectura del juego y valores opuestos (S/N y T/F). */
export const worstPartner = (code: MbtiCode): MbtiCode => flip(code, ['SN', 'TF'])
```

- [ ] **Step 4: Tipos y contenido**

Añadir a `src/content/types.ts`:

```ts
import type { MbtiAxis, MbtiCode, MbtiQuestionId } from '../engine/mbti'

export interface MbtiTypeText {
  nickname: string
  emoji: string
  tagline: string
  desc: string
  strengths: [string, string, string]
  weaknesses: [string, string]
  partnerWhy: string
  clashWhy: string
  pro: string
  tips: [string, string]
}

export interface MbtiContent {
  moduleLabel: string
  title: string
  subtitle: string
  disclaimer: string
  /** {done} {total} */
  progress: string
  submit: string
  /** {n} */
  incomplete: string
  axes: Record<MbtiAxis, { name: string; first: string; second: string }>
  questions: Record<MbtiQuestionId, { text: string; a: string; b: string }>
  types: Record<MbtiCode, MbtiTypeText>
  result: {
    title: string
    strengthsTitle: string
    weaknessesTitle: string
    bestPartnerTitle: string
    worstPartnerTitle: string
    proTitle: string
    tipsTitle: string
    retake: string
    missing: string
  }
}
```

**`src/content/zh/mbti.ts`** (`export const mbtiZh: MbtiContent`):
- `moduleLabel`: `MODULE 03 | COURT PERSONALITY`.
- 20 situaciones de pista concretas y con humor de 球馆 (约球, 打野球, 混双, 球友群, 20:20 关键分, 被对手连续压后场, 搭档连续失误…).
  - Cada `a` expresa el polo de la tabla y `b` el opuesto.
  - Ninguna opción debe ser claramente "la buena".
- 16 tipos: apodo pegadizo y único, emoji, lema, descripción de 80–120 字, 3 fortalezas, 2 debilidades, `partnerWhy`, `clashWhy`, 2 consejos.
  - `pro` es una frase sobre un profesional con esa vibra. Usa solo jugadores de `src/data/athletes-*.json` o de la investigación verificada, con 她/他 correctos.
- `disclaimer`: 仅供娱乐，不是心理测评。

**`src/content/es/mbti.ts`**: traducción completa y natural. Los apodos se adaptan con gracia en español, no se calcan; por ejemplo 网前刺客 → "Asesino de la red".

`src/content/index.ts`:

```ts
import { mbtiEs } from './es/mbti'
import { mbtiZh } from './zh/mbti'
import type { MbtiContent } from './types'

export function useMbtiContent(): MbtiContent {
  return useI18n().lang === 'zh' ? mbtiZh : mbtiEs
}
```

- [ ] **Step 5: Test de contenido**

`src/content/mbti-content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { mbtiEs } from './es/mbti'
import { HAN, leaves, placeholders } from './testUtils'
import { mbtiZh } from './zh/mbti'

describe('contenido de 羽球MBTI', () => {
  it('sin vacíos, mismas rutas y mismos marcadores', () => {
    const zh = leaves(mbtiZh)
    const es = leaves(mbtiEs)
    expect(zh.filter((l) => !l.value.trim())).toEqual([])
    expect(es.filter((l) => !l.value.trim())).toEqual([])
    expect(es.map((l) => l.path)).toEqual(zh.map((l) => l.path))
    const esMap = new Map(es.map((l) => [l.path, l.value]))
    expect(zh.filter((l) => placeholders(l.value) !== placeholders(esMap.get(l.path)!)).map((l) => l.path)).toEqual([])
  })
  it('español sin caracteres chinos', () => {
    expect(leaves(mbtiEs).filter((l) => HAN.test(l.value)).map((l) => l.path)).toEqual([])
  })
  it('apodos únicos en cada idioma', () => {
    for (const c of [mbtiZh, mbtiEs]) {
      const names = Object.values(c.types).map((t) => t.nickname)
      expect(new Set(names).size).toBe(16)
    }
  })
})
```

- [ ] **Step 6: Ejecutar y ver que pasa**

Run: `npx vitest run src/engine/mbti.test.ts src/content && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/engine/mbti.ts src/engine/mbti.test.ts src/content
git commit -m "feat(mbti): badminton MBTI engine with fixed poles and zh/es content

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: 羽球MBTI — páginas

**Files:**
- Modify: `src/pages/mbti/MbtiPage.tsx`, `src/App.tsx` (ruta `/mbti/result/:id`)
- Create: `src/pages/mbti/MbtiResultPage.tsx`
- Test: `src/pages/mbti/MbtiPage.test.tsx`

**Interfaces:**
- Consumes: `ChoiceGroup`, `MBTI_QUESTION_IDS`, `MBTI_AXES`, `POLES`, `isMbtiComplete`, `scoreMbti`, `bestPartner`, `worstPartner`, `useMbtiContent`, `useStore().addMbti`.
- Produces: rutas `/mbti` y `/mbti/result/:id`.

- [ ] **Step 1: Escribir el test que falla**

`src/pages/mbti/MbtiPage.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { mbtiZh as c } from '../../content/zh/mbti'
import { MBTI_QUESTION_IDS } from '../../engine/mbti'
import { renderApp } from '../../test/renderApp'

describe('羽球MBTI', () => {
  it('responder todo "a" da ESTJ, muestra pareja ideal y lo guarda', async () => {
    renderApp('/mbti')
    const u = userEvent.setup()
    for (const id of MBTI_QUESTION_IDS) {
      const group = screen.getByRole('group', { name: c.questions[id].text })
      await u.click(within(group).getByLabelText(c.questions[id].a))
    }
    await u.click(screen.getByRole('button', { name: c.submit }))
    expect(screen.getAllByText(new RegExp(c.types.ESTJ.nickname)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(new RegExp(c.types.ISTP.nickname)).length).toBeGreaterThan(0)
    expect(screen.getByText(c.disclaimer)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('yuqiu.v1')!).mbti).toHaveLength(1)
  })
  it('resultado inexistente → vuelve al test con aviso', () => {
    renderApp('/mbti/result/nope')
    expect(screen.getByText(c.result.missing)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npx vitest run src/pages/mbti`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/pages/mbti/MbtiPage.tsx`:

```tsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChoiceGroup } from '../../components/ChoiceGroup'
import { useMbtiContent } from '../../content'
import { isMbtiComplete, MBTI_QUESTION_IDS, type MbtiAnswers } from '../../engine/mbti'
import { format } from '../../i18n/I18nProvider'
import { useStore } from '../../lib/StoreProvider'

export default function MbtiPage() {
  const c = useMbtiContent()
  const { addMbti } = useStore()
  const navigate = useNavigate()
  const missing = (useLocation().state as { missing?: boolean } | null)?.missing === true
  const [answers, setAnswers] = useState<MbtiAnswers>({})
  const [showIncomplete, setShowIncomplete] = useState(false)
  const done = MBTI_QUESTION_IDS.filter((id) => answers[id]).length
  const submit = () => {
    if (!isMbtiComplete(answers)) {
      setShowIncomplete(true)
      return
    }
    navigate(`/mbti/result/${addMbti(answers).id}`)
  }
  return (
    <section className="card stack">
      <p className="mono-label">{c.moduleLabel}</p>
      <h1 className="page-title">{c.title}</h1>
      <p className="page-subtitle">{c.subtitle}</p>
      {missing && <p className="notice" role="status">{c.result.missing}</p>}
      <p className="field-hint">{c.disclaimer}</p>
      <p className="progress" aria-live="polite">{format(c.progress, { done, total: MBTI_QUESTION_IDS.length })}</p>
      {MBTI_QUESTION_IDS.map((id) => (
        <ChoiceGroup
          key={id}
          name={id}
          legend={c.questions[id].text}
          value={answers[id]}
          options={[
            { value: 'a', label: c.questions[id].a },
            { value: 'b', label: c.questions[id].b },
          ]}
          onChange={(v) => setAnswers((a) => ({ ...a, [id]: v as 'a' | 'b' }))}
        />
      ))}
      {showIncomplete && done < MBTI_QUESTION_IDS.length && (
        <p className="field-error" role="alert">{format(c.incomplete, { n: MBTI_QUESTION_IDS.length - done })}</p>
      )}
      <button type="button" className="btn btn-primary" onClick={submit}>{c.submit}</button>
    </section>
  )
}
```

`src/pages/mbti/MbtiResultPage.tsx`:

```tsx
import { Link, Navigate, useParams } from 'react-router-dom'
import { useMbtiContent } from '../../content'
import { bestPartner, isMbtiComplete, MBTI_AXES, POLES, scoreMbti, worstPartner } from '../../engine/mbti'
import { useStore } from '../../lib/StoreProvider'

export default function MbtiResultPage() {
  const { id } = useParams()
  const { state } = useStore()
  const c = useMbtiContent()
  const rec = state.mbti.find((r) => r.id === id)
  if (!rec || !isMbtiComplete(rec.answers)) return <Navigate to="/mbti" replace state={{ missing: true }} />
  const r = scoreMbti(rec.answers)
  const t = c.types[r.code]
  const best = bestPartner(r.code)
  const worst = worstPartner(r.code)
  return (
    <article className="card stack">
      <p className="mono-label">COURT PERSONALITY</p>
      <h1 className="page-title">{t.emoji} {t.nickname}</h1>
      <p className="mbti-code">{r.code}</p>
      <p className="page-subtitle">{t.tagline}</p>
      <div className="axes">
        {MBTI_AXES.map((axis) => {
          const a = r.axes[axis]
          const [first] = POLES[axis]
          const firstShare = Math.round((a.first / (a.first + a.second)) * 100)
          return (
            <div key={axis} className="axis">
              <span>{c.axes[axis].first}</span>
              <div className="axis-track" aria-label={`${c.axes[axis].name} ${a.winner} ${a.percent}%`}>
                <div className="axis-fill" style={{ width: `${firstShare}%` }} data-pole={first} />
              </div>
              <span>{c.axes[axis].second}</span>
            </div>
          )
        })}
      </div>
      <p>{t.desc}</p>
      <h2 className="form-section">{c.result.strengthsTitle}</h2>
      <ul>{t.strengths.map((x) => <li key={x}>{x}</li>)}</ul>
      <h2 className="form-section">{c.result.weaknessesTitle}</h2>
      <ul>{t.weaknesses.map((x) => <li key={x}>{x}</li>)}</ul>
      <h2 className="form-section">{c.result.bestPartnerTitle}</h2>
      <p>{c.types[best].emoji} {best} · {c.types[best].nickname} — {t.partnerWhy}</p>
      <h2 className="form-section">{c.result.worstPartnerTitle}</h2>
      <p>{c.types[worst].emoji} {worst} · {c.types[worst].nickname} — {t.clashWhy}</p>
      <h2 className="form-section">{c.result.proTitle}</h2>
      <p>{t.pro}</p>
      <h2 className="form-section">{c.result.tipsTitle}</h2>
      <ul>{t.tips.map((x) => <li key={x}>{x}</li>)}</ul>
      <p className="field-hint">{c.disclaimer}</p>
      <Link to="/mbti" className="btn">🔄 {c.result.retake}</Link>
    </article>
  )
}
```

Añadir la ruta `<Route path="/mbti/result/:id" element={<MbtiResultPage />} />` y a `global.css`:

```css
.mbti-code { margin: 0; text-align: center; font-family: var(--font-mono); font-size: 32px; font-weight: 700; letter-spacing: 0.2em; }
.axes { display: grid; gap: 10px; }
.axis { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 8px; align-items: center; font-size: 13px; }
.axis span:last-child { text-align: right; }
.axis-track { height: 10px; border-radius: 999px; background: #dfe6ff; overflow: hidden; }
.axis-fill { height: 100%; background: var(--ink); }
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat(mbti): quiz and personality result pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 18: 首页 y 我的档案

**Files:**
- Modify: `src/pages/HomePage.tsx`, `src/pages/ProfilePage.tsx`, `src/i18n/ui.zh.ts`, `src/i18n/ui.es.ts`, `src/styles/global.css`
- Create: `src/lib/latest.ts`
- Test: `src/pages/HomePage.test.tsx`, `src/pages/ProfilePage.test.tsx`

**Interfaces:**
- Consumes: `useStore`, `analyzeTalent`, `scoreRating`, `scoreMbti`, `isRatingComplete`, `isMbtiComplete`, los tres hooks de contenido, `RadarChart`, `CompareBars`, `SectionHeader`.
- Produces: `latestProfile(state): { talent: { record; result } | null; rating: { record; result } | null; mbti: { record; result } | null }` en `src/lib/latest.ts`. La reutiliza la Tarea 19.

Claves de UI nuevas (añádelas a los dos idiomas):

```ts
// ui.zh.ts
'home.hero': '找到最适合你身体的羽球打法',
'home.start': '开始测评',
'home.m1.title': '天赋测评', 'home.m1.desc': '体型 + 六维能力 → 单打风格、双打站位、镜像运动员',
'home.m2.title': '业余评级', 'home.m2.desc': '18 道可观察的技术题 → L1–L8 业余等级',
'home.m3.title': '羽球MBTI', 'home.m3.desc': '20 个球场情景 → 你的球场人格与最佳搭档',
'home.yourProfile': '你的档案',
'profile.empty': '还没有测评记录，先做一个测评吧。',
'profile.styleRole': '风格与站位推荐',
'profile.mirrors': '运动员镜像对比',
'profile.level': '业余等级',
'profile.mbti': '球场人格',
'profile.history': '测评历史',
'profile.progress': '能力变化（首次 vs 最近）',
'profile.first': '首次',
'profile.latest': '最近',
'profile.clear': '清除我的全部数据',
'profile.clearConfirm': '确定要删除本机保存的全部测评记录吗？此操作无法撤销。',
'profile.open': '查看',
```

```ts
// ui.es.ts
'home.hero': 'Descubre el estilo de bádminton que mejor encaja con tu cuerpo',
'home.start': 'Empezar',
'home.m1.title': 'Test de talento', 'home.m1.desc': 'Cuerpo + 6 capacidades → estilo de individual, posición en dobles y jugadores espejo',
'home.m2.title': 'Nivel amateur', 'home.m2.desc': '18 preguntas técnicas observables → nivel amateur L1–L8',
'home.m3.title': 'MBTI bádminton', 'home.m3.desc': '20 situaciones de pista → tu personalidad en pista y tu pareja ideal',
'home.yourProfile': 'Tu perfil',
'profile.empty': 'Aún no tienes resultados. Empieza por un test.',
'profile.styleRole': 'Estilo y posición recomendados',
'profile.mirrors': 'Comparación con jugadores espejo',
'profile.level': 'Nivel amateur',
'profile.mbti': 'Personalidad en pista',
'profile.history': 'Historial de tests',
'profile.progress': 'Evolución (primer test vs último)',
'profile.first': 'Primero',
'profile.latest': 'Último',
'profile.clear': 'Borrar todos mis datos',
'profile.clearConfirm': '¿Seguro que quieres borrar todos los resultados guardados en este dispositivo? No se puede deshacer.',
'profile.open': 'Ver',
```

- [ ] **Step 1: Escribir los tests que fallan**

`src/pages/HomePage.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { renderApp } from '../test/renderApp'

it('portada con los tres módulos enlazados', () => {
  renderApp('/')
  expect(screen.getByRole('link', { name: /体型 \+ 六维能力/ })).toHaveAttribute('href', '/talent')
  expect(screen.getByRole('link', { name: /18 道可观察/ })).toHaveAttribute('href', '/rating')
  expect(screen.getByRole('link', { name: /20 个球场情景/ })).toHaveAttribute('href', '/mbti')
})
```

`src/pages/ProfilePage.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { talentZh } from '../content/zh/talent'
import { GOLDEN } from '../engine/testkit'
import { emptyState, STORAGE_KEY } from '../lib/storage'
import { renderApp } from '../test/renderApp'

const rec = (id: string, createdAt: string) => ({ id, createdAt, engineVersion: 1, input: GOLDEN })

describe('我的档案', () => {
  it('estado vacío', () => {
    renderApp('/profile')
    expect(screen.getByText('还没有测评记录，先做一个测评吧。')).toBeInTheDocument()
  })
  it('muestra estilo, rol, historial y la comparación primero/último', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...emptyState(), talent: [rec('r1', '2026-06-01T10:00:00.000Z'), rec('r2', '2026-09-26T10:00:00.000Z')] }),
    )
    renderApp('/profile')
    expect(screen.getAllByText(new RegExp(talentZh.singles.control.name)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(new RegExp(talentZh.doubles.back.name)).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /查看/ })).toHaveLength(2)
    expect(screen.getByText('能力变化（首次 vs 最近）')).toBeInTheDocument()
  })
  it('borrar datos pide confirmación', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...emptyState(), talent: [rec('r1', '2026-06-01T10:00:00.000Z')] }))
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderApp('/profile')
    await userEvent.click(screen.getByRole('button', { name: '清除我的全部数据' }))
    expect(confirm).toHaveBeenCalled()
    expect(screen.getByText('还没有测评记录，先做一个测评吧。')).toBeInTheDocument()
    confirm.mockRestore()
  })
})
```

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npx vitest run src/pages/HomePage.test.tsx src/pages/ProfilePage.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/lib/latest.ts`:

```ts
import { isMbtiComplete, scoreMbti, type MbtiResult } from '../engine/mbti'
import { isRatingComplete, scoreRating, type RatingResult } from '../engine/rating'
import { analyzeTalent, type TalentResult } from '../engine/talent'
import type { MbtiRecord, RatingRecord, StoredState, TalentRecord } from './storage'

export function latestProfile(state: StoredState) {
  const t = state.talent.at(-1)
  const r = [...state.rating].reverse().find((x) => isRatingComplete(x.answers))
  const m = [...state.mbti].reverse().find((x) => isMbtiComplete(x.answers))
  return {
    talent: t ? { record: t as TalentRecord, result: analyzeTalent(t.input) as TalentResult } : null,
    rating: r && isRatingComplete(r.answers) ? { record: r as RatingRecord, result: scoreRating(r.answers) as RatingResult } : null,
    mbti: m && isMbtiComplete(m.answers) ? { record: m as MbtiRecord, result: scoreMbti(m.answers) as MbtiResult } : null,
  }
}
```

`src/pages/HomePage.tsx`:

```tsx
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMbtiContent, useRatingContent, useTalentContent } from '../content'
import { useI18n } from '../i18n/I18nProvider'
import { latestProfile } from '../lib/latest'
import { useStore } from '../lib/StoreProvider'

export default function HomePage() {
  const { t } = useI18n()
  const { state } = useStore()
  const tc = useTalentContent()
  const rc = useRatingContent()
  const mc = useMbtiContent()
  const p = useMemo(() => latestProfile(state), [state])
  const modules = [
    { to: '/talent', mono: 'MODULE 01', title: t('home.m1.title'), desc: t('home.m1.desc'), emoji: '🏸' },
    { to: '/rating', mono: 'MODULE 02', title: t('home.m2.title'), desc: t('home.m2.desc'), emoji: '📈' },
    { to: '/mbti', mono: 'MODULE 03', title: t('home.m3.title'), desc: t('home.m3.desc'), emoji: '🧠' },
  ]
  return (
    <>
      <section className="card hero">
        <p className="mono-label">BADMINTON TALENT LAB</p>
        <h1 className="page-title">{t('app.name')}</h1>
        <p className="page-subtitle">{t('home.hero')}</p>
        <Link to="/talent" className="btn btn-primary">{t('home.start')}</Link>
      </section>
      {modules.map((m) => (
        <Link key={m.to} to={m.to} className="card module-card">
          <span className="module-emoji" aria-hidden>{m.emoji}</span>
          <span className="module-text">
            <span className="mono-label left">{m.mono}</span>
            <strong>{m.title}</strong>
            <span className="muted">{m.desc}</span>
          </span>
        </Link>
      ))}
      {(p.talent || p.rating || p.mbti) && (
        <Link to="/profile" className="card module-card">
          <span className="module-text">
            <span className="mono-label left">{t('home.yourProfile')}</span>
            {p.talent && (
              <strong>
                {tc.singles[p.talent.result.singles.top].emoji} {tc.singles[p.talent.result.singles.top].name} ·{' '}
                {tc.doubles[p.talent.result.doubles.role].emoji} {tc.doubles[p.talent.result.doubles.role].name}
              </strong>
            )}
            <span className="muted">
              {p.rating && `${rc.levels[p.rating.result.level].code} ${rc.levels[p.rating.result.level].name}`}
              {p.rating && p.mbti && ' · '}
              {p.mbti && `${p.mbti.result.code} ${mc.types[p.mbti.result.code].nickname}`}
            </span>
          </span>
        </Link>
      )}
    </>
  )
}
```

Nota para el test de la portada: el nombre accesible del enlace incluye título y descripción, así que `/体型 \+ 六维能力/` lo encuentra.

`src/pages/ProfilePage.tsx`:

```tsx
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CompareBars } from '../components/CompareBars'
import { RadarChart } from '../components/RadarChart'
import { SectionHeader } from '../components/SectionHeader'
import { pick, useMbtiContent, useRatingContent, useTalentContent } from '../content'
import { athleteBmi } from '../engine/mirror'
import { currentScores } from '../engine/abilities'
import { RADAR_KEYS } from '../engine/types'
import { useI18n } from '../i18n/I18nProvider'
import { latestProfile } from '../lib/latest'
import { useStore } from '../lib/StoreProvider'

export default function ProfilePage() {
  const { t, lang } = useI18n()
  const { state, clearAll } = useStore()
  const tc = useTalentContent()
  const rc = useRatingContent()
  const mc = useMbtiContent()
  const p = useMemo(() => latestProfile(state), [state])
  const dateFmt = new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'es-ES', { dateStyle: 'medium' })

  if (!p.talent && !p.rating && !p.mbti) {
    return (
      <section className="card stack">
        <p className="mono-label">MY PROFILE</p>
        <h1 className="page-title">{t('nav.profile')}</h1>
        <p className="page-subtitle">{t('profile.empty')}</p>
        <Link to="/talent" className="btn btn-primary">{t('home.start')}</Link>
      </section>
    )
  }

  const first = state.talent[0]
  const talent = p.talent
  return (
    <>
      {talent && (
        <section className="stack">
          <SectionHeader mono="SINGLE / DOUBLE" title={t('profile.styleRole')} />
          <div className="two-cols">
            <div className="card mini">
              <p className="mono-label left">Single Style</p>
              <h3>{tc.singles[talent.result.singles.top].emoji} {tc.singles[talent.result.singles.top].name}</h3>
              <p className="muted">{tc.singles[talent.result.singles.top].tagline}</p>
            </div>
            <div className="card mini">
              <p className="mono-label left">Double Role</p>
              <h3>{tc.doubles[talent.result.doubles.role].emoji} {tc.doubles[talent.result.doubles.role].name}</h3>
              <p className="muted">{tc.doubles[talent.result.doubles.role].tagline}</p>
            </div>
          </div>
          {talent.result.mirrors.singles[0] && (
            <>
              <SectionHeader mono="SINGLE + DOUBLE" title={t('profile.mirrors')} />
              <div className="card mini">
                <p className="mono-label left">Single Mirror</p>
                <h3>{talent.result.mirrors.singles[0].athlete.nameEn} {talent.result.mirrors.singles[0].athlete.nameZh}</h3>
                <p className="muted">{pick(talent.result.mirrors.singles[0].athlete.country, lang)}</p>
                <CompareBars
                  youLabel={tc.report.you}
                  themLabel={tc.report.mirror}
                  rows={[
                    { label: tc.report.height, you: talent.record.input.heightCm, them: talent.result.mirrors.singles[0].athlete.heightCm, unit: 'cm' },
                    { label: tc.report.weight, you: talent.record.input.weightKg, them: talent.result.mirrors.singles[0].athlete.weightKg, unit: 'kg' },
                    {
                      label: tc.report.bmi,
                      you: talent.result.body.bmi,
                      them: athleteBmi(talent.result.mirrors.singles[0].athlete.heightCm, talent.result.mirrors.singles[0].athlete.weightKg),
                      digits: 1,
                    },
                  ]}
                />
              </div>
            </>
          )}
          {first && state.talent.length >= 2 && (
            <div className="card mini">
              <h3>{t('profile.progress')}</h3>
              <RadarChart
                axes={RADAR_KEYS.map((k) => ({
                  label: tc.abilities[k].name,
                  value: talent.result.current[k],
                  secondary: currentScores(first.input)[k],
                }))}
                primaryLabel={t('profile.latest')}
                secondaryLabel={t('profile.first')}
              />
            </div>
          )}
        </section>
      )}
      {p.rating && (
        <Link to={`/rating/result/${p.rating.record.id}`} className="card module-card">
          <span className="module-text">
            <span className="mono-label left">{t('profile.level')}</span>
            <strong>{rc.levels[p.rating.result.level].code} · {rc.levels[p.rating.result.level].name}</strong>
          </span>
        </Link>
      )}
      {p.mbti && (
        <Link to={`/mbti/result/${p.mbti.record.id}`} className="card module-card">
          <span className="module-text">
            <span className="mono-label left">{t('profile.mbti')}</span>
            <strong>{p.mbti.result.code} · {mc.types[p.mbti.result.code].emoji} {mc.types[p.mbti.result.code].nickname}</strong>
          </span>
        </Link>
      )}
      {state.talent.length > 0 && (
        <section className="card stack">
          <h2 className="form-section">{t('profile.history')}</h2>
          <ul className="history">
            {[...state.talent].reverse().map((r) => (
              <li key={r.id}>
                <span>{dateFmt.format(new Date(r.createdAt))}</span>
                <Link to={`/talent/report/${r.id}`}>{t('profile.open')} →</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <button
        type="button"
        className="btn btn-ghost danger"
        onClick={() => {
          if (window.confirm(t('profile.clearConfirm'))) clearAll()
        }}
      >
        {t('profile.clear')}
      </button>
    </>
  )
}
```

Añadir a `global.css`:

```css
.hero { display: grid; gap: 14px; }
.module-card { display: flex; gap: 16px; align-items: center; text-decoration: none; }
.module-emoji { font-size: 34px; }
.module-text { display: grid; gap: 4px; }
.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 420px) { .two-cols { grid-template-columns: 1fr; } }
.card.mini { padding: 18px; display: grid; gap: 8px; }
.card.mini h3 { margin: 0; font-size: 20px; font-weight: 900; }
.history { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.history li { display: flex; justify-content: space-between; border-bottom: 1px solid var(--line); padding: 8px 0; }
.danger { color: var(--bad); justify-self: center; }
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat: home page with modules and profile page with history, mirrors and data reset

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 19: Imagen para compartir (3:4)

**Files:**
- Create: `src/lib/share.ts`, `src/components/ShareCard.tsx`, `src/components/ShareButton.tsx`
- Modify: `src/pages/talent/ReportPage.tsx` y `src/pages/ProfilePage.tsx` (añadir `<ShareButton />`), `src/i18n/ui.zh.ts` y `ui.es.ts`, `global.css`
- Test: `src/lib/share.test.ts`, `src/components/ShareButton.test.tsx`

**Interfaces:**
- Consumes: `latestProfile`, `RadarChart`, los hooks de contenido y `html-to-image`.
- Produces:
  - `renderPng(node: HTMLElement): Promise<Blob>`;
  - `shareOrDownload(blob, filename, title): Promise<'shared' | 'downloaded' | 'cancelled'>`;
  - `ShareCard` (1080×1440, fuera de pantalla);
  - `ShareButton()`: comparte el perfil más reciente y no renderiza nada si no hay 天赋测评.

Claves de UI:
- `share.button`: 生成分享图 / Crear imagen para compartir
- `share.working`: 生成中… / Generando…
- `share.error`: 生成图片失败，请重试或直接截图。 / No se pudo crear la imagen. Inténtalo de nuevo o haz una captura.
- `share.footer`: 扫码或访问：{url} / Pruébalo en: {url}

- [ ] **Step 1: Escribir los tests que fallan**

`src/lib/share.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { shareOrDownload } from './share'

afterEach(() => vi.restoreAllMocks())

describe('shareOrDownload', () => {
  const blob = new Blob(['x'], { type: 'image/png' })
  it('usa Web Share con archivo si está disponible', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { canShare: () => true, share })
    expect(await shareOrDownload(blob, 'a.png', 't')).toBe('shared')
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: 't' }))
  })
  it('si el usuario cancela, no es un error', async () => {
    Object.assign(navigator, { canShare: () => true, share: vi.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' })) })
    expect(await shareOrDownload(blob, 'a.png', 't')).toBe('cancelled')
  })
  it('si no hay Web Share, descarga', async () => {
    Object.assign(navigator, { canShare: undefined, share: undefined })
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    expect(await shareOrDownload(blob, 'a.png', 't')).toBe('downloaded')
    expect(click).toHaveBeenCalled()
  })
})
```

`src/components/ShareButton.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { GOLDEN } from '../engine/testkit'
import { emptyState, STORAGE_KEY } from '../lib/storage'
import { renderApp } from '../test/renderApp'

vi.mock('../lib/share', () => ({
  renderPng: vi.fn().mockRejectedValue(new Error('canvas')),
  shareOrDownload: vi.fn(),
}))

it('muestra un error comprensible si no se puede generar la imagen', async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...emptyState(), talent: [{ id: 'r1', createdAt: '2026-09-26T10:00:00.000Z', engineVersion: 1, input: GOLDEN }] }))
  renderApp('/talent/report/r1')
  await userEvent.click(screen.getByRole('button', { name: '生成分享图' }))
  expect(await screen.findByText('生成图片失败，请重试或直接截图。')).toBeInTheDocument()
})
```

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npx vitest run src/lib/share.test.ts src/components/ShareButton.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/lib/share.ts`:

```ts
import { toBlob } from 'html-to-image'

export async function renderPng(node: HTMLElement): Promise<Blob> {
  const blob = await toBlob(node, { pixelRatio: 1, width: 1080, height: 1440, cacheBust: true })
  if (!blob) throw new Error('empty image')
  return blob
}

export async function shareOrDownload(blob: Blob, filename: string, title: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([blob], filename, { type: 'image/png' })
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] }) && typeof navigator.share === 'function') {
    try {
      await navigator.share({ files: [file], title })
      return 'shared'
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return 'cancelled'
      throw e
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'downloaded'
}
```

`src/components/ShareCard.tsx`:

```tsx
import { forwardRef } from 'react'
import { useMbtiContent, useRatingContent, useTalentContent } from '../content'
import { RADAR_KEYS } from '../engine/types'
import { format, useI18n } from '../i18n/I18nProvider'
import type { latestProfile } from '../lib/latest'
import { RadarChart } from './RadarChart'

type Profile = ReturnType<typeof latestProfile>

export const ShareCard = forwardRef<HTMLDivElement, { profile: Profile }>(function ShareCard({ profile }, ref) {
  const { t } = useI18n()
  const tc = useTalentContent()
  const rc = useRatingContent()
  const mc = useMbtiContent()
  const talent = profile.talent!
  const s = tc.singles[talent.result.singles.top]
  const d = tc.doubles[talent.result.doubles.role]
  const mirror = talent.result.mirrors.singles[0]
  return (
    <div ref={ref} className="share-card" aria-hidden>
      <p className="share-mono">BADMINTON TALENT LAB · {t('app.name')}</p>
      <h1 className="share-title">{tc.bodyTypes[talent.result.body.bodyType].name}</h1>
      <RadarChart size={620} axes={RADAR_KEYS.map((k) => ({ label: tc.abilities[k].name, value: talent.result.current[k] }))} />
      <div className="share-grid">
        <div><small>Single Style</small><strong>{s.emoji} {s.name}</strong><span>{talent.result.singles.ranking[0].fit}%</span></div>
        <div><small>Double Role</small><strong>{d.emoji} {d.name}</strong><span>{talent.result.doubles.fit}%</span></div>
        {mirror && <div><small>Pro Mirror</small><strong>{mirror.athlete.nameZh}</strong><span>{mirror.athlete.nameEn}</span></div>}
        {profile.rating && <div><small>Level</small><strong>{rc.levels[profile.rating.result.level].code}</strong><span>{rc.levels[profile.rating.result.level].name}</span></div>}
        {profile.mbti && <div><small>MBTI</small><strong>{profile.mbti.result.code}</strong><span>{mc.types[profile.mbti.result.code].nickname}</span></div>}
      </div>
      <p className="share-footer">{format(t('share.footer'), { url: window.location.origin + window.location.pathname })}</p>
    </div>
  )
})
```

`src/components/ShareButton.tsx`:

```tsx
import { useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { latestProfile } from '../lib/latest'
import { renderPng, shareOrDownload } from '../lib/share'
import { useStore } from '../lib/StoreProvider'
import { ShareCard } from './ShareCard'

export function ShareButton() {
  const { t } = useI18n()
  const { state } = useStore()
  const profile = useMemo(() => latestProfile(state), [state])
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  if (!profile.talent) return null
  const run = async () => {
    setBusy(true)
    setError(false)
    try {
      const blob = await renderPng(ref.current!)
      await shareOrDownload(blob, 'yuqiu-tianfu.png', t('app.name'))
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <button type="button" className="btn" onClick={run} disabled={busy}>
        📤 {busy ? t('share.working') : t('share.button')}
      </button>
      {error && <p className="field-error" role="alert">{t('share.error')}</p>}
      <div className="share-offscreen">
        <ShareCard ref={ref} profile={profile} />
      </div>
    </>
  )
}
```

Coloca `<ShareButton />` en la fila de botones de `ReportPage` y al final de `ProfilePage` (antes del botón de borrar). Estilos:

```css
.share-offscreen { position: fixed; left: -20000px; top: 0; pointer-events: none; }
.share-card { width: 1080px; height: 1440px; background: linear-gradient(180deg, #f4f6fb, #e4e9f5); padding: 80px; display: flex; flex-direction: column; gap: 32px; font-family: var(--font-sans); color: var(--ink); }
.share-mono { margin: 0; font-family: var(--font-mono); letter-spacing: 0.2em; color: var(--muted); font-size: 26px; }
.share-title { margin: 0; font-size: 72px; font-weight: 900; }
.share-card .radar svg { max-width: 620px; }
.share-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.share-grid div { background: #fff; border-radius: 32px; padding: 28px; display: grid; gap: 6px; }
.share-grid small { font-family: var(--font-mono); color: var(--muted); font-size: 22px; }
.share-grid strong { font-size: 38px; font-weight: 900; }
.share-grid span { font-size: 26px; color: var(--ink-2); }
.share-footer { margin-top: auto; font-size: 24px; color: var(--muted); }
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Probar en el navegador**

Con el servidor de desarrollo, genera la imagen desde el informe y abre el PNG descargado. Comprueba que el texto chino se ve (no cuadrados) y que el radar aparece. Si Google Fonts rompe la captura, pasa `skipFonts: true` a `toBlob` y confía en las fuentes del sistema.

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "feat: 3:4 share image with Web Share and download fallback

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 20: Instalable, configuración de publicación y README

**Files:**
- Create: `public/manifest.webmanifest`, `scripts/make-icons.py`, `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`, `netlify.toml`, `README.md`
- Modify: `index.html`

- [ ] **Step 1: Iconos**

`scripts/make-icons.py` (usa Pillow; instálalo con `python3 -m pip install pillow` si falta):

```python
from PIL import Image, ImageDraw

def icon(size: int, path: str) -> None:
    img = Image.new("RGB", (size, size), (11, 11, 15))
    d = ImageDraw.Draw(img)
    s = size / 512
    # Volante: base (corcho) y faldón en abanico.
    d.ellipse([196 * s, 330 * s, 316 * s, 450 * s], fill=(255, 255, 255))
    d.polygon([(210 * s, 350 * s), (302 * s, 350 * s), (390 * s, 90 * s), (122 * s, 90 * s)], fill=(233, 237, 247))
    for x in (160, 222, 290, 352):
        d.line([(256 * s, 350 * s), (x * s, 96 * s)], fill=(47, 107, 255), width=max(2, int(8 * s)))
    img.save(path)

icon(192, "public/icon-192.png")
icon(512, "public/icon-512.png")
icon(180, "public/apple-touch-icon.png")
```

Run: `python3 scripts/make-icons.py`
Expected: tres PNG en `public/`.

- [ ] **Step 2: Manifest e `index.html`**

`public/manifest.webmanifest`:

```json
{
  "name": "羽球天赋 · Badminton Talent Lab",
  "short_name": "羽球天赋",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#E9EDF7",
  "theme_color": "#0B0B0F",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

En `<head>` de `index.html`:

```html
<link rel="manifest" href="./manifest.webmanifest" />
<link rel="apple-touch-icon" href="./apple-touch-icon.png" />
```

- [ ] **Step 3: Publicación**

`netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

(Vercel detecta Vite solo; no necesita archivo. HashRouter no requiere reglas de reescritura.)

`README.md` (en español), con:
- qué es;
- cómo arrancar (`npm install`, `npm run dev`);
- tests (`npm test`);
- cómo publicar en Netlify o Vercel paso a paso;
- de dónde salen los datos (`docs/superpowers/research/`);
- cómo actualizar jugadores (`scripts/import-athletes.mjs` y la Tarea 5);
- aviso de privacidad: los datos se quedan en el navegador de cada usuario.

- [ ] **Step 4: Verificar**

Run: `npm test && npm run typecheck && npm run build && ls dist`
Expected: todo PASS; `dist` contiene `index.html`, `manifest.webmanifest` y los iconos.

- [ ] **Step 5: Commit**

```bash
git add public scripts/make-icons.py netlify.toml README.md index.html
git commit -m "chore: PWA manifest, icons, Netlify config and README

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 21: Verificación final en navegador y revisión

- [ ] **Step 1: Todo en verde**

Run: `npm test && npm run typecheck && npm run build`
Expected: PASS y build sin avisos de error.

- [ ] **Step 2: Recorrido en el navegador**

Arranca `dev` con `preview_start` y recorre a 375×812 y en escritorio, en chino y en español:
- 首页;
- 天赋测评: perfil de referencia y dos perfiles distintos (hombre alto y rematador; persona de 50 años principiante);
- informe completo;
- 业余评级 completo;
- 羽球MBTI completo;
- 我的档案 con historial;
- imagen para compartir;
- borrar datos.

Comprueba:
- sin scroll horizontal;
- sin textos cortados en el radar;
- sin "NaN", "undefined" ni claves sin traducir;
- sin errores en la consola (`read_console_messages` con `onlyErrors`).

Haz capturas de cada pantalla.

- [ ] **Step 3: Revisión de código**

Usa la skill `superpowers:requesting-code-review` sobre toda la rama. Corrige lo confirmado con tests.

- [ ] **Step 4: Actualizar `CONTINUAR.md` y memoria**

Marca la implementación como terminada, anota cómo publicar y lo que quede pendiente.

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "chore: final verification pass

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Publicación (con confirmación)**

Pregunta al usuario si quiere publicarla y con qué servicio (Netlify o Vercel). Publicar es una acción visible: no la hagas sin su "sí" explícito. La cuenta es suya.

---

## Autorrevisión del plan

**Cobertura de la spec:**

| Sección de la spec | Tareas |
|---|---|
| §3 Arquitectura | 1–8 |
| §4 Visual | 1, 11, 13, 18 |
| §5.1–5.2 Entrada y capacidades | 3, 7, 9, 12 |
| §5.3 Cálculos: cuerpo, tendencia y mezcla | 2, 3 |
| §5.3 Cálculos: estilo y rol | 4 |
| §5.3 Cálculos: espejos | 5, 6 |
| §5.3 Cálculos: diagnóstico, ajustes y ejercicios | 7 |
| §5.4 Informe | 9, 10, 13 |
| §6 业余评级 | 14, 15 |
| §7 羽球MBTI | 16, 17 |
| §8 首页 y 我的档案 | 18 |
| §9 Almacenamiento | 8 |
| §10 Compartir | 19 |
| §11 Idiomas | 1, 8, 10, 14, 16 |
| §12 Datos | 5, 9 |
| §13 Errores | 7, 8, 12, 13, 15, 17 |
| §14 Pruebas | todas, más 21 |
| §15 Publicación | 20, 21 |

**Cambios respecto a la spec, acordados con el usuario el 2026-09-26:**
- 4 pruebas reales (la comba ajusta 移动速度 y se añade Cooper para 耐力).
- MBTI con letras estándar.
- Encaje escalado por la dispersión del perfil, validado con el prototipo.
- Penalización de 0.2 a retirados y parejas separadas en los espejos, para preferir jugadores en activo cuando el parecido es similar.

**Review Focus:** las 5 entradas tienen su test:
1. Coma decimal: Tareas 7 y 12.
2. `localStorage` corrupto o bloqueado: Tarea 8.
3. Informe inexistente: Tareas 13, 15 y 17.
4. Peso `null`: Tareas 6 y 11.
5. Cambio de idioma con el informe abierto: Tarea 13.
