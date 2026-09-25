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
