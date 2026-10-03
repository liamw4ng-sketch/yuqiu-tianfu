# 羽球天赋 — Especificación de diseño

Fecha: 2026-09-25 · Estado: pendiente de revisión

## 1. Propósito

Web app pública, pensada para el móvil, que la comunidad de jugadores de bádminton (sobre todo chinos que viven en España) usa para descubrir qué estilo de juego le conviene según su cuerpo y sus capacidades actuales, su nivel amateur y su "personalidad en pista". La interfaz reproduce la de las capturas de referencia (app en chino) y corrige sus errores.

**Éxito significa:**
- Un jugador rellena el formulario en menos de 3 minutos y recibe un informe coherente: ninguna sección contradice a otra.
- Todo dato de un profesional está verificado a 2026-09-25 (altura, peso si existe fuente, 现役/已退役).
- Toda cita científica existe y dice lo que el informe afirma.
- La app funciona entera en chino simplificado y en español (botón 中/ES).
- El resultado se puede compartir como imagen 3:4 (formato 小红书).

## 2. Decisiones tomadas con el usuario

| Tema | Decisión |
|---|---|
| Público | Jugadores en España; app publicada en internet |
| Alcance | 5 pestañas: 首页, 天赋测评, 业余评级, 羽球MBTI, 我的档案 |
| Datos | Sin cuentas ni servidor; perfil en `localStorage` del navegador |
| Idioma | Chino simplificado por defecto + español completo con botón 中/ES |
| Tecnología | React + TypeScript + Vite, web estática |
| Alojamiento | Vercel o Netlify (gratis); publicar solo con confirmación del usuario |

**Fuera de alcance:** cuentas, backend, rankings, analítica, pagos, apps nativas, versión específica para China continental (ICP).

## 3. Arquitectura

```
index.html · vite.config.ts · public/ (manifest, iconos)
src/
  main.tsx, App.tsx           → router (HashRouter), layout, barra de navegación
  styles/                     → tokens.css (colores, radios, sombras), global.css
  i18n/                       → I18nProvider, useT(), ui.zh.ts, ui.es.ts
  engine/                     → lógica pura, sin React ni textos
    types.ts  constants.ts
    body.ts        (IMC, índice de envergadura, altura relativa, 身材画像, franja de edad)
    abilities.ts   (8 capacidades: autoevaluación + pruebas reales + tendencia corporal)
    singles.ts     (6 estilos de individual con % de encaje)
    doubles.ts     (roles de dobles + pareja complementaria)
    mirror.ts      (jugadores y parejas espejo)
    talent.ts      (ensambla TalentResult)
    rating.ts      (业余评级)
    mbti.ts        (羽球MBTI)
  content/zh/, content/es/    → bancos de textos por clave (informes, preguntas, tipos)
  content/references.ts       → citas verificadas
  data/athletes-singles.json, data/athletes-doubles.json (verificados)
  components/                 → NavBar, Card, SectionHeader, RadarChart (SVG propio),
                                LevelSelect, CompareBar, ShareCard, LangToggle…
  pages/                      → Home, Talent (Form + Report), Rating, Mbti, Profile
  lib/storage.ts, lib/share.ts
```

**Regla central:** el motor devuelve **claves y números** (por ejemplo `{style: 'counter', fit: 82, reasons: ['lowCog', 'highReaction']}`), nunca frases. Las páginas combinan ese resultado con `content/<idioma>`. Así los dos idiomas dicen exactamente lo mismo y la coherencia se puede probar.

**Dependencias:** react, react-dom, react-router-dom, html-to-image. En desarrollo: vite, typescript, vitest, @testing-library/react, jsdom. Sin librería de gráficos: el radar es un SVG propio.

## 4. Diseño visual

Fiel a las capturas:
- Barra superior blanca translúcida con el logo 🏸 y 5 pestañas; la activa es una píldora negra. En móvil las pestañas se desplazan horizontalmente.
- Fondo gris azulado claro (#E9EDF7 aprox.) y tarjetas blancas con radio grande (~28px) y sombra suave.
- Etiquetas en monoespaciada gris con espaciado amplio ("MODULE 01 | TALENT & BODY TYPE"). Títulos chinos en peso 900.
- Campos de formulario grises rellenos (#F3F4F6) con radio ~18px.
- Cabeceras de sección: SINGLE STRATEGY en banda azul con degradado, DOUBLE TACTICS en banda naranja/ámbar con degradado.
- Fuentes: pila del sistema para chino (PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans SC) e Inter y JetBrains Mono desde Google Fonts, con respaldo del sistema.
- Ancho máximo del contenido: 640px, centrado en escritorio.
- Botón flotante "subir arriba".
- Accesibilidad: todos los campos con `<label>`, contraste AA y foco visible.

## 5. Módulo 天赋测评

### 5.1 Entrada (`TalentInput`)

| Campo | Tipo / rango | Notas |
|---|---|---|
| 性别 sex | `M` / `F` | |
| 年龄 age | 8–80 | Menores de 16: aviso de que el informe es orientativo |
| 身高 heightCm | 130–220 | |
| 体重 weightKg | 30–150 | |
| 臂展 wingspanCm | 120–240, opcional | Vacío → se asume = altura y el informe lo indica. Si \|envergadura − altura\| > 20, pide confirmación |
| 球龄 yearsPlaying | 0–50 (admite decimales, p. ej. 0.5) | |
| 惯用手 hand | `R` / `L` | |
| 每周频率 freq | `<1`, `1`, `2-3`, `4+` | |
| 偏好 preference | `singles`, `doubles`, `mixed`, `all` | Ordena qué sección del informe va primero |
| 8 capacidades | nivel 1–5 cada una | Etiquetas con hechos observables (§5.2) |
| Pruebas reales (opcional) | salto vertical (cm), comba en 1 min (saltos), test de Cooper 12 min (m), test de la regla (cm) | Ajustan 爆发力, 移动速度 (步频), 耐力 y 反应速度 |

### 5.2 Las 8 capacidades

`power` 爆发力 (remate y salto) · `endurance` 耐力 · `reaction` 反应速度 · `netTouch` 网前手感 · `speed` 移动速度 · `rearCourt` 后场高远 · `tactics` 球路意识 · `mental` 心态.

- Cada una se elige entre 5 niveles que describen conductas observables. Ejemplo para `rearCourt`: 1 = "el clear no pasa de media pista", 3 = "llega al fondo, pero alto y lento", 5 = "clear de ataque plano al fondo desde cualquier esquina".
- Los niveles 1–5 se convierten en puntuación 2 / 4 / 6 / 8 / 10.
- Si hay prueba real, la puntuación final es la media entre la autoevaluación y la nota de la prueba (0–10). Las tablas de normas por sexo salen de la investigación (`sports_science.md`).

### 5.3 Cálculos

1. **Cuerpo (`body.ts`)**
   - IMC.
   - Índice de envergadura = envergadura − altura, y su ratio.
   - Altura relativa: puntuación z frente a la referencia de adultos de su sexo (constantes en `constants.ts`, de la investigación).
   - Franja de edad: ≤17, 18–30, 31–40, 41–50, 51+.
   - **身材画像:** una de 6 categorías fijas (矮快型, 轻盈灵巧型, 均衡型, 敦实力量型, 瘦高长臂型, 高大力量型) según umbrales explícitos de z-altura, IMC e índice de envergadura, definidos en `constants.ts` y cubiertos por tests.
2. **Tendencia corporal por capacidad** (0–10, solo las 6 físicas):
   - Fórmulas heurísticas documentadas: altura, IMC, envergadura y edad empujan cada capacidad arriba o abajo desde 5.
   - Ejemplos: más altura y envergadura → `rearCourt` +; IMC > 25 → `speed` y `endurance` −; más de 30 años → `speed` y `endurance` − progresivo.
   - Se muestra como segunda capa discontinua del radar ("体型倾向") y se explica como tendencia, no como capacidad.
3. **Puntuación combinada para recomendar** = `a·actual + (1−a)·tendencia`, con `a` según experiencia: 0.5 si < 1 año, 0.65 entre 1 y 3 años, 0.8 si > 3 años.
4. **Estilo de individual (`singles.ts`)**
   - 6 estilos: `attack` 进攻压制型, `control` 四方拉吊控制型, `counter` 防守反击型, `speed` 速度突击型, `allround` 全面型, `net` 网前技巧型.
   - Cada estilo tiene un vector de pesos sobre las 8 capacidades (suma 1) y una preferencia corporal (z-altura, IMC).
   - Encaje 0–100 = suma ponderada normalizada + término corporal.
   - `allround` se puntúa por media alta con poca dispersión (penaliza la desviación típica).
   - Se devuelven el ganador, el segundo y las razones (claves de las capacidades que más aportan y de las que faltan).
5. **Rol de dobles (`doubles.ts`)**
   - `front` 前场封网型 (reacción, red, velocidad), `back` 后场攻击型 (potencia, fondo, resistencia, altura) y `rotation` 全能轮转型 (si front y back distan menos de 8 puntos y la media es ≥ 5).
   - En mixto se anota la convención 女前男后 y qué implica si el rol del usuario va en contra.
   - **La pareja recomendada se deriva del rol:** `front` → busca `back`; `back` → busca `front`; `rotation` → busca a alguien fuerte en tu capacidad más débil. Nunca se escribe a mano.
6. **Espejos (`mirror.ts`)**
   - Individual: jugadores del mismo sexo. Distancia = |Δaltura|/6 + |ΔIMC|/1.5 + penalización de estilo (0 si coincide con el estilo principal, 0.5 si con el secundario, 1 si no). Se muestran el mejor y 2 alternativas.
   - Dobles: jugadores del mismo sexo dentro de parejas (en mixto, el miembro del sexo del usuario) cuya posición habitual coincide con el rol del usuario. Se muestra la pareja y cuál de los dos te espeja.
   - Siempre se etiqueta 现役 o 已退役 (año) y se usa 她/他 según el sexo.
   - Un peso `null` en los datos hace que la comparación de IMC se omita para ese jugador.
7. **Diagnósticos:** cada capacidad cae en 偏弱 (≤ 3), 中等 (4–6) o 突出 (≥ 7), con una frase y 1–2 ejercicios.
8. **Ajustes:**
   - Menos de 1 año jugando: el estilo se presenta como "发展方向" y el primer consejo es de técnica básica.
   - Franjas 31–40, 41–50 y 51+: bloque de prevención de lesiones.
   - 16 años o menos: bloque de desarrollo juvenil.

> **Nota de implementación (2026-09-28).** Tras la revisión final:
> - El encaje es `round(100·(0.7·m + 0.3·bodyFit))` con `m = 0.6·forma + 0.4·nivel`. La forma es la correlación entre el perfil y los pesos del estilo, amortiguada si el perfil es plano. El nivel es la suma ponderada normalizada de las capacidades del estilo.
> - La banda "高度契合" exige al menos una capacidad clave ≥ 6. Si todas las capacidades clave son ≤ 4, la banda es "初步倾向".
> - El 身材画像 solo afirma ventajas o desventajas que la capa de tendencia corporal respalda (> 5 o < 5).

### 5.4 Informe (orden de secciones)

1. Radar con dos capas (actual continuo + tendencia corporal discontinua). Leyenda.
2. **PHYSICAL ANALYSIS · 基础体能与维度**:
   - Forma corporal e IMC, envergadura, años jugando.
   - 身材画像 con frase coherente con el radar: si la tendencia es alta pero la capacidad actual es baja, lo dice explícitamente.
   - Franja de edad.
   - Capacidad más fuerte y más débil.
   - 球路意识 y 心态 con diagnóstico.
3. **SINGLE STRATEGY · 单打专属**: estilo y % de encaje, 契合度分析, 核心战术, 开局策略, 中局控制, 关键分处理, 体能分配, errores típicos, estilo secundario.
4. **DOUBLE TACTICS · 双打专属**: rol y % de encaje, 核心战术, 轮转时机, 站位原则 y 禁忌, 沟通暗号, 搭档互补, nota de mixto.
5. **PRO MIRROR · 运动员镜像**: tarjetas de espejos con barras comparativas (altura, peso, IMC).
6. **TRAINING · 训练建议**: 3 ejercicios con series, repeticiones y duración, elegidos por las capacidades más débiles relevantes para el estilo recomendado.
7. **REFERENCES · 参考文献**: solo citas verificadas y aviso de que el informe es orientativo.

Botones: ← 首页, 🔄 重新测评, 保存到档案 (automático), 生成分享图.

## 6. Módulo 业余评级

- 18 preguntas de opción múltiple sobre conductas observables: saque, clear al fondo, remate, dejada, red, defensa del remate, footwork, bloqueo y drive, rotación en dobles, lectura táctica, experiencia en torneos, frecuencia y entrenamiento sistemático, aguante físico.
- Cada opción tiene puntos. **Topes duros:** por ejemplo, si el clear no llega al fondo, el nivel máximo es 3.
- **8 niveles** con nombre en chino y español, código (L1–L8), lema, "qué haces a este nivel", resultados típicos y qué entrenar para subir.
- **Comprobaciones de coherencia:** reglas del tipo "si A y no B → aviso", mostradas en el resultado.
- La escala se basa en sistemas reales (investigación en `amateur_rating.md`) y lo dice.

## 7. Módulo 羽球MBTI

- 4 ejes con las letras MBTI estándar y significado de bádminton: E/I 外放 vs 内敛, S/N 实感·基本功 vs 直觉·假动作, T/F 理性 vs 感性, J/P 计划 vs 随性 (decidido con el usuario el 2026-09-26). Cada eje tiene **5 preguntas binarias**: número impar, así que nunca hay empates. 20 situaciones en pista en total, en orden intercalado.
- Resultado: código de 4 letras, apodo, emoji, lema, descripción, 3 fortalezas, 2 debilidades, mejor y peor pareja (con motivo), un profesional con esa vibra (verificado) y 2 consejos. Se muestra el porcentaje por eje.
- Aviso visible: entretenimiento, no psicometría.

## 8. 首页 y 我的档案

- **首页:** portada, 3 tarjetas de módulos ("MODULE 01/02/03") y un resumen del perfil si existe.
- **我的档案:**
  - Tarjetas "Style & Role Recommendation" (Single Style / Double Role).
  - "Athlete Mirror Comparison" con barras tú frente al espejo.
  - Nivel amateur y tipo MBTI.
  - **Historial** del 天赋测评: lista con fecha y radar superpuesto del primero frente al último.
  - Botones: generar imagen para compartir y borrar todos mis datos (con confirmación).
  - Si no hay datos: estado vacío con enlaces a los tests.

## 9. Almacenamiento

- Clave `yuqiu.v1` en `localStorage`: `{ version: 1, lang, talent: TalentRecord[], rating: RatingRecord[], mbti: MbtiRecord[] }`.
- Cada registro guarda la **entrada**, la fecha y la versión del motor. El resultado se recalcula al mostrarlo, así que las mejoras del motor llegan a los perfiles antiguos.
- Todas las lecturas y escrituras van en try/catch. Si falla, la app funciona sin guardar y muestra un aviso discreto.
- Con JSON corrupto se descarta y se empieza de cero. Se conservan como máximo 20 registros por módulo.

## 10. Compartir

- `ShareCard` oculto de 1080×1440 que se renderiza a PNG con html-to-image.
- Incluye: título, radar, 身材画像, estilo, rol, espejos, nivel y MBTI (si existen), y la URL de la app.
- En móvil usa Web Share API con archivo si está disponible; si no, lo descarga. Si falla, muestra un mensaje de error.

## 11. Idiomas

- UI y contenido en `zh` y `es`. El idioma se guarda en `localStorage` y el botón 中/ES está en la barra.
- Las etiquetas decorativas en inglés/monoespaciada (MODULE 01, REPORT…) se mantienen en los dos idiomas.
- Español con terminología de bádminton: clear, remate, dejada, dejada cortada, red, globo, drive, empuje, defensa de remate, footwork, rotación. Nombres de jugadores en ambos alfabetos.
- Un test comprueba que cada clave existe en los dos idiomas.

## 12. Datos y contenido

- La investigación (en curso) produce `athletes_singles.json`, `athletes_doubles.json`, `sports_science.md`, `tactics_styles.md`, `amateur_rating.md` y `badminton_mbti.md`, verificados por un segundo agente adversarial.
- En la implementación se convierten en `src/data/*.json` y `src/content/{zh,es}/*.ts`. Solo entran registros marcados como verificados.

## 13. Errores y validación

- Validación en el formulario con mensajes por campo, en el idioma activo. No se puede enviar con errores.
- Avisos no bloqueantes para valores raros: envergadura, IMC < 16 o > 35, edad < 16.
- Registros de datos incompletos (peso `null`): se omite la parte afectada, nunca se muestra "NaN".

## 14. Pruebas

- **Unitarias (Vitest)** de cada función del motor, con casos de referencia. Incluye el perfil de las capturas: mujer, 24 años, 163 cm, 51 kg, envergadura 164, 2 años.
- **Invariantes** sobre una rejilla determinista de ~1.000 entradas sintéticas:
  - el rol de la pareja complementa el propio;
  - el 身材画像 no afirma una capacidad que el radar contradice;
  - los espejos son del mismo sexo;
  - todo jugador retirado se etiqueta 已退役;
  - los % de encaje están en 0–100;
  - no hay NaN;
  - el MBTI nunca empata;
  - el nivel respeta los topes.
- **Contenido:** mismas claves en `zh` y `es`; pronombres según sexo en los textos de jugadores; ninguna referencia sin DOI/URL.
- **Componentes:** validación del formulario y render del informe.
- **Navegador:** recorrido completo en tamaño móvil (375×812) y escritorio, en los dos idiomas, con capturas.

## 15. Publicación

- `npm run build` → carpeta `dist/` estática.
- Se incluyen `vercel.json` / `netlify.toml` mínimos y PWA básica (manifest e iconos) para "añadir a pantalla de inicio".
- La publicación en Vercel o Netlify la hace el usuario o se hace con su confirmación explícita.

## 16. v2 (2026-10-03): gustos de juego, espejos con variedad y medios

Aprobado por el usuario el 2026-10-03, tras observar que la recomendación dependía demasiado del físico y que casi todos los hombres de ~175 cm / 70 kg recibían el mismo espejo (Loh Kean Yew).

- **球风偏好 (6 preguntas obligatorias):**
  - Preguntas: cómo te gusta ganar el punto (vale 3), bola alta a media pista, ritmo, respuesta al ataque, longitud de los peloteos y posición favorita en dobles.
  - Cada respuesta suma puntos a los estilos. El estilo con más puntos vale 1 y los demás en proporción. Sin respuestas (registros antiguos), todos valen 0,5.
- **Encaje:** `100 · (0,5 · capacidades + 0,3 · gustos + 0,2 · cuerpo)`.
  - En dobles, la posición favorita pesa como gusto. Quien prefiere rotar acepta 全能轮转 con una diferencia de hasta 15 puntos entre red y fondo.
  - El informe dice si el gusto y la recomendación coinciden ("你最喜欢的是X，但目前更适合Y…").
- **Espejos:**
  - 🎯 **打法镜像:** estilo primero, mano dominante después y cuerpo como desempate.
  - 📏 **体型镜像:** cuerpo primero; nunca repite al jugador del espejo de estilo.
  - Sin peso fiable se compara por altura más una diferencia típica (0,35), sin castigo.
  - Entre candidatos casi igual de parecidos, una semilla estable derivada de todas las respuestas elige. Así la misma persona ve siempre lo mismo y dos personas con el mismo cuerpo pueden ver jugadores distintos.
  - Test: en cuerpos típicos, ningún jugador supera el 12 % (espejo de estilo) ni el 18 % (espejo de cuerpo).
- **Datos:** 81 jugadores de individual (41 hombres y 40 mujeres) y 36 parejas. Se completaron 31 pesos con fuente verificada. Cada jugador tiene enlaces a su ficha BWF y Wikipedia sacados de las fuentes.
- **Medios:**
  - Foto de Wikipedia (Wikimedia Commons, con crédito), cargada en vivo; si falla, se oculta.
  - Enlaces a la ficha oficial y a búsquedas de vídeo: YouTube siempre y Bilibili en chino. Al ser búsquedas, no se rompen.

## 17. v3 (2026-10-04): más jugadores, 12 preguntas de gustos y rasgos en el espejo

Aprobado por el usuario el 2026-10-04. Pidió dos cosas:
- más jugadores conocidos: leyendas y top 30 actual;
- más preguntas en el test, para afinar el estilo y elegir un jugador espejo más parecido.

### 17.1 Jugadores nuevos (solo individual; los dobles no cambian)

- **Leyendas:** unas 15 por sexo.
  - Hombres, por ejemplo: Rudy Hartono, Liem Swie King, Morten Frost, Prakash Padukone, Zhao Jianhua, Yang Yang, Joko Supriyanto, Poul-Erik Høyer Larsen, Hendrawan, Sun Jun, Park Sung-hwan, Sony Dwi Kuncoro, Chen Jin, Du Pengyu y Son Wan-ho.
  - Mujeres, por ejemplo: Li Lingwei, Han Aiping, Tang Jiuhong, Bang Soo-hyun, Ye Zhaoying, Gong Zhichao, Camilla Martin, Mia Audina, Gong Ruina, Zhou Mi, Zhu Lin, Tine Baun, Wang Lin, Wang Xin y Sung Ji-hyun.
- **Actuales:** los que estén en el top 30 de la BWF a 2026-10-04 y todavía no estén en la app, según el ranking de bwfbadminton.com.
- **Reglas de entrada:** las mismas que en la v1.
  - Un agente investiga y otro verifica de forma adversarial.
  - **Sin altura de fuente fiable** (BWF, Olympedia, federación o Wikipedia con cita), **el jugador no entra**.
  - El peso solo se pone si hay fuente; si no, `null`.
  - También llevan estado 现役/已退役 con año, estilo (uno de los 6), `highlights` y `desc` en chino, y enlaces BWF/Wikipedia.
  - El nombre chino sigue la Wikipedia china o los medios de China continental.
- **Archivos:** la investigación queda en `docs/superpowers/research/athletes_singles_v3_{legends,top}_{m,f}.json`, con el mismo esquema que `athletes_singles_new_{m,f}.json`. `scripts/import-athletes.mjs` los fusiona. El español va en `translations_es.json` (`id → { highlights, desc }`).
- **Objetivo:** unos 120–130 jugadores, con los 6 estilos representados en cada sexo.

### 17.2 Seis preguntas nuevas en 球风偏好 (de 6 a 12)

Las 12 son obligatorias en el formulario. Ids de pregunta y de opción:

| Pregunta | Opciones |
|---|---|
| `signature` 你最想拥有哪一拍武器？ | `smash` 重杀跳杀 · `deception` 假动作骗过对手 · `netShot` 网前搓放勾对角 · `retrieve` 接住所有杀球 · `placement` 吊劈压线打四角 |
| `feints` 打球时你会故意做假动作吗？ | `often` 经常 · `sometimes` 偶尔 · `rarely` 很少，打实在的球 |
| `footwork` 你的步法更像… | `explosive` 启动快、抢点早 · `reach` 步子大、覆盖面广 · `anticipate` 跑得不多，靠预判站位 |
| `decider` 决胜局体力下降时，你通常… | `steady` 越打越稳、少失误 · `fight` 咬牙拼每一分 · `finish` 抓机会尽快结束 |
| `receive` 接发球时你更想… | `rush` 抢网扑球 · `netReply` 放网或搓网 · `deep` 推挑后场先稳住 |
| `behind` 比分落后时你会… | `change` 改变节奏和打法 · `persist` 坚持打法慢慢磨 · `attack` 加强进攻主动冒险 |

**Puntos de estilo**, que suman a los de §16 con la misma normalización (el estilo con más puntos vale 1):
- signature:
  - smash {attack 2}
  - deception {allround 1, net 1}
  - netShot {net 2}
  - retrieve {counter 2}
  - placement {control 2}
- feints: often {allround 1, net 1}; sometimes {}; rarely {}.
- footwork: explosive {speed 2}; reach {counter 1, allround 1}; anticipate {control 1, allround 1}.
- decider: steady {control 1, counter 1}; fight {counter 1}; finish {attack 1}.
- receive: rush {speed 1, net 1}; netReply {net 1}; deep {control 1}.
- behind: change {allround 2}; persist {control 1, counter 1}; attack {attack 1}.

La pregunta `scoring` sigue valiendo 3. El encaje no cambia: `100 · (0,5 · capacidades + 0,3 · gustos + 0,2 · cuerpo)`.

### 17.3 Rasgos (球风特点)

**Vocabulario fijo de 8 rasgos:**

| Id | Chino | Español |
|---|---|---|
| `power` | 重杀 | Remate potente |
| `deception` | 假动作 | Engaño |
| `net` | 网前手感 | Toque de red |
| `defense` | 防守 | Defensa |
| `stamina` | 体能相持 | Resistencia |
| `speed` | 速度步法 | Velocidad |
| `placement` | 落点控制 | Colocación |
| `fight` | 斗志 | Garra |

**Puntos de rasgo del usuario** (las 12 preguntas; `doublesSpot` no suma nada):
- scoring: smash {power 2}; net {net 2}; rally {stamina 1, placement 1}; counter {defense 2}.
- midcourt: smash {power 1}; drop {placement 1}; push {placement 1}.
- tempo: fast {speed 1}; grind {stamina 1}; adapt {}.
- underAttack: drive {speed 1}; block {defense 1}; lift {defense 1}.
- rally: short {power 1}; long {stamina 1}; either {}.
- signature:
  - smash {power 2}
  - deception {deception 2}
  - netShot {net 2}
  - retrieve {defense 2}
  - placement {placement 2}
- feints: often {deception 2}; sometimes {deception 1}; rarely {}.
- footwork: explosive {speed 2}; reach {defense 1, stamina 1}; anticipate {placement 1}.
- decider: steady {stamina 2}; fight {fight 2}; finish {power 1}.
- receive: rush {speed 1, net 1}; netReply {net 1}; deep {placement 1}.
- behind: change {deception 1, placement 1}; persist {stamina 1}; attack {power 1, fight 1}.

**Rasgos principales del usuario:** los 3 con más puntos y más de 0; los empates se deciden por el orden del vocabulario.

**Rasgos de cada jugador:**
- Campo `traits: Trait[]` con 2–3 rasgos sin repetir; el primero es su seña de identidad. Es obligatorio en todos los jugadores de individual y la validación de datos lo comprueba.
- Los asigna un agente con evidencia y fuentes (análisis, perfiles de la BWF, prensa especializada) y lo revisa un verificador.
- Las evidencias y fuentes quedan en `docs/superpowers/research/traits_singles.json`, con el formato `id → { traits, evidence, sources }`.

### 17.4 Espejo de estilo con rasgos

- **Vector del jugador:** traits[0] = 1, traits[1] = 0,7 y traits[2] = 0,5. El vector del usuario son sus puntos de rasgo.
- **Similitud:** `sim` es el coseno entre los dos vectores (0–1). Si el usuario no tiene puntos, `sim` es 0 para todos y el orden no cambia.
- **Distancia del 🎯 打法镜像:**
  - `estilo (0 / 0,6 / 1,5) + 0,6 · (1 − sim) + 0,35 · cuerpo + 0,2 si no está en activo − 0,4 si ambos son zurdos`.
  - Con el peso 0,6, un jugador del estilo principal sin rasgos en común empata con uno del segundo estilo con los mismos rasgos, y el cuerpo desempata. El estilo sigue mandando.
- **Ventana de variedad del espejo de estilo:** baja de 0,5 a 0,2 para que los rasgos se noten.
- **Sin cambios:** el 📏 espejo de cuerpo y los dobles.

### 17.5 Informe

- La tarjeta del espejo de estilo muestra **共同特点 / En común: …** con los rasgos principales del usuario que también tiene el jugador.
- Si no comparten ninguno, muestra **他/她的招牌 / Su sello: …** con los rasgos del jugador.

### 17.6 Compatibilidad

- `ENGINE_VERSION` pasa a 3.
- Los registros guardados con las 6 preguntas de la v2 cargan y se calculan igual: las preguntas nuevas que falten no suman puntos.
- `isPrefs` exige las 6 originales y, si las nuevas existen, que sean válidas.
- Los registros de la v1, sin gustos, siguen como en §16.

### 17.7 Pruebas

- **Gustos:** puntos de estilo y de rasgo de cada respuesta nueva. `scoring` sigue siendo la pregunta de más peso.
- **Datos:** todos los jugadores de individual tienen 2–3 rasgos válidos y sin repetir, y los 6 estilos tienen jugadores en cada sexo.
- **Espejo, caso controlado:** con el mismo estilo y cuerpo, gana el jugador con más rasgos en común.
- **Espejo, población:**
  - en una muestra de usuarios típicos, el espejo de estilo comparte al menos un rasgo principal en ≥ 70 % de los casos y siempre es del estilo principal o del segundo;
  - se mantienen los umbrales de variedad de §16 (≤ 12 % y ≥ 25 jugadores distintos por sexo).
- **Formulario:** exige las 12 preguntas.
- **Contenido:** los 8 rasgos y las 6 preguntas tienen texto en chino y en español con las mismas claves.
- **Compatibilidad:** un registro v2 con 6 gustos carga y da un informe sin errores.
