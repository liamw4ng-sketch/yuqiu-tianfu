# Cómo continuar — 羽球天赋 (app de bádminton)

Última sesión: 2026-09-25. Pausado a petición del usuario (tokens semanales agotándose).

## Estado

| Paso | Estado |
|---|---|
| Brainstorming y decisiones con el usuario | ✅ Hecho |
| Especificación de diseño | ✅ Aprobada: `docs/superpowers/specs/2026-09-25-badminton-app-design.md` |
| Prototipo del motor de cálculo | ✅ Verificado: `docs/superpowers/prototype/` |
| Investigación del dominio (jugadores, estudios, tácticas, nivel, MBTI) | ⏸️ Parada antes de terminar; hay que relanzarla |
| Plan de implementación | ⏳ Pendiente (skill `superpowers:writing-plans`) |
| Programación | ⏳ Pendiente |

## Prompt para retomar (copiar y pegar)

> Lee `CONTINUAR.md` y la especificación aprobada. Relanza la investigación con el script de `docs/superpowers/research/research-workflow.js`, cambiando `args.dir` a `docs/superpowers/research`. Mientras corre, escribe el plan de implementación con la skill writing-plans en `docs/superpowers/plans/`, usando el prototipo verificado de `docs/superpowers/prototype/engine.ts` como código del motor. Prioriza que el 天赋测评 funcione primero.

## Qué hay en el prototipo (`docs/superpowers/prototype/`)

- `engine.ts`: cuerpo (IMC, 身材画像), tendencia corporal, mezcla con la autoevaluación, ranking de los 6 estilos de individual y rol de dobles. Es la base del motor real (`src/engine/`) descrito en la spec §5.3.
- `run.ts`: caso de referencia de las capturas. Ejecutar con `node docs/superpowers/prototype/run.ts` (Node 26 ejecuta TypeScript directamente).
  - Datos: mujer, 24 años, 163 cm, 51 kg, envergadura 164, 2 años jugando.
  - Niveles: power 2, endurance 3, reaction 1, netTouch 2, speed 2, rearCourt 2, tactics 1, mental 3.
  - Resultado verificado:
    - Cuerpo: IMC 19.2 (`lean`), z-altura 0.5 (`average`), 身材画像 `lightAgile` (轻盈灵巧型), ratio de envergadura 1.006.
    - Individual: `control` 63 > `attack` 54 > `speed` 52 > `counter` 51 > `allround` 49 > `net` 38.
    - Dobles: `back` 63 (frontFit 35).
- `grid.ts` y `flat.ts`: 9.720 perfiles sintéticos. Cada patrón de capacidades cae en el estilo esperado (smasher → attack/back, netPlayer → net/front, thinker → control, counterPro → counter/front). Ningún encaje sale de 0–100 ni da NaN.

### Decisiones tomadas al prototipar (aplicar en el plan)

1. **Fórmula de encaje:** `fit = round(100·(0.7·(corr+1)/2 + 0.3·bodyFit))`.
   - `corr` es la correlación de Pearson entre el perfil mezclado del usuario (8 capacidades) y el vector de pesos del estilo.
   - `allround` usa `(1 − min(sd/2.5, 1)) · min(1, media/6.5)` en lugar de la correlación.
2. **Mezcla:** `tactics` y `mental` también se mezclan con una tendencia neutra de 5. Sin esto, los perfiles planos salían sesgados hacia `attack`.
3. **Rol de dobles:** `rotation` si |frontFit − backFit| < 8 y la media ≥ 5. Si no, el mayor de los dos. La pareja siempre es la complementaria (front → back, back → front, rotation → fuerte en tu capacidad más débil).
4. **Mostrar el % con palabras:** ≥ 70 高度契合, 55–69 较为契合, < 55 初步倾向. Si la diferencia entre los dos primeros estilos es < 3, marcar `closeCall`.
5. **Ajuste pendiente (menor):** principiantes planos con cuerpo `sturdyPower` salen sobre todo `net`. Es aceptable, pero se puede revisar al calibrar con la investigación.

### Propuestas que hay que confirmar con el usuario antes del plan

- **Pruebas reales:** la comba de 1 min pasa a ajustar **移动速度** (步频) y se añade el **test de Cooper (12 min)** para **耐力**. La spec §5.1 dice que la comba ajusta 耐力.
- **羽球MBTI:** usar las letras estándar E/I, S/N, T/F, J/P con significado de bádminton, para que la gente pueda compararlo con su MBTI real:
  - E/I: 外放 vs 内敛
  - S/N: 实感/基本功 vs 直觉/假动作
  - T/F: 理性 vs 感性
  - J/P: 计划 vs 随性
- **业余评级:** 18 preguntas con 5 opciones (a–e = 0–4 puntos).
  - Temas: clear, remate, dejada, red, saque, defensa, footwork, drive, revés, rotación en dobles, táctica, regularidad, torneos, entrenamiento, años, físico, contra un rival de referencia y empuñadura.
  - Topes: clear a→L2 y b→L3; footwork/defensa/saque/empuñadura a→L3; torneos a–b→L6; entrenamiento a→L6.
  - Umbrales en % para L1–L8: 0/15/28/42/56/70/82/92.

## Investigación

- `docs/superpowers/research/research-workflow.js`: script del workflow, con 6 investigadores más 3 verificadores adversariales.
- Genera:
  - `athletes_singles.json` y `athletes_doubles.json`: altura, peso, 现役/已退役 a la fecha y estilo.
  - `sports_science.md`: estudios citables verificados.
  - `tactics_styles.md`: tácticas por estilo y rol, y textos de diagnóstico.
  - `amateur_rating.md` y `badminton_mbti.md`.
- Relanzarlo con `args: { dir: "<ruta absoluta>/docs/superpowers/research", today: "<fecha>" }`.
- La sesión anterior se paró antes de que terminara ningún archivo, así que no hay resultados guardados.
