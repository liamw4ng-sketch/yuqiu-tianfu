# 羽球天赋 · Badminton Talent Lab

Web app para jugadores de bádminton, en chino con botón de español. A partir de tu cuerpo, tus capacidades y 12 preguntas sobre cómo te gusta jugar, te recomienda:
- un estilo de individual;
- un rol en dobles;
- jugadores profesionales parecidos a ti ("espejo"): uno por estilo, que comparte tus rasgos de juego, y otro por cuerpo. Hay 116 jugadores de individual, entre actuales y leyendas, y 36 parejas.

También incluye un test de nivel amateur (L1–L8), un test tipo MBTI de personalidad en pista y un perfil con historial.

Los datos de cada persona se guardan **solo en su navegador** (`localStorage`). No hay cuentas ni servidor.

## Arrancar en local

```bash
npm install
npm run dev -- --host
```

Abre la dirección `Local` en el ordenador. En el móvil, conectado a la misma wifi, abre la dirección `Network`.

## Tests y compilación

```bash
npm test
npm run typecheck
npm run build
```

`npm run build` genera la web estática en `dist/`.

## Publicar

Con **Netlify**:
1. Crea una cuenta.
2. Pulsa "Add new site → Import an existing project" y conecta el repositorio. `netlify.toml` ya indica `npm run build` y la carpeta `dist`.
3. Para probar sin repositorio, arrastra la carpeta `dist/` a https://app.netlify.com/drop.

Con **Vercel**:
1. Importa el repositorio.
2. Vercel detecta Vite solo: comando `npm run build`, salida `dist`.

La app usa `HashRouter` (`#/talent`…), así que no necesita reglas de reescritura en el servidor.

## De dónde salen los datos

- `docs/superpowers/research/`: investigación verificada. Contiene jugadores y parejas con altura, peso y estado 现役/已退役, estudios científicos, tácticas por estilo, sistemas de nivel amateur y el diseño del MBTI.
- `src/data/athletes-*.json`: jugadores que usa la app. Para actualizarlos:
  1. Cambia los JSON de la investigación.
  2. Ejecuta `node scripts/import-athletes.mjs`.
  3. Comprueba la investigación de la v3 con `node scripts/check-research-v3.mjs`. Cada jugador necesita sus rasgos verificados en `traits_singles.json`; si no, el importador falla.
  4. Traduce los campos que queden como `"TRADUCIR"`.
  5. Pasa los tests: `npx vitest run src/data`.
- `src/content/{zh,es}/`: todos los textos. Los tests comprueban que chino y español tengan las mismas claves y los mismos marcadores.

## Estructura

- `src/engine/`: cálculo puro, sin interfaz: cuerpo, capacidades, estilos, roles, espejos, nivel y MBTI.
- `src/content/`: textos por idioma.
- `src/pages/`: pantallas.
- `src/components/`: radar, barras comparativas, campos, imagen para compartir.
- `src/lib/`: almacenamiento y compartir.

Diseño: `docs/superpowers/specs/2026-09-25-badminton-app-design.md`. Plan: `docs/superpowers/plans/2026-09-26-yuqiu-tianfu.md`.

## Aviso

Los resultados son orientativos para jugadores amateurs. No sustituyen a un entrenador ni son consejo médico. El test MBTI es de entretenimiento.
