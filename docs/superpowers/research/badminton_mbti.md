# 羽球MBTI — Investigación y diseño del módulo

> Fecha de corte: 2026-09-26. Todo el texto que ve el usuario está en chino simplificado. Las notas de diseño van en español.
> Spec: `docs/superpowers/specs/2026-09-25-badminton-app-design.md` §7. Hay 20 preguntas binarias, 5 por eje, y nunca hay empate.

---

## 0. Resumen

- **Ejes:** usamos las letras estándar **E/I · S/N · T/F · J/P**. Cada letra tiene un significado propio de bádminton que se puede observar en pista (ver §2 para el porqué).
- **Preguntas:** 20 situaciones en pista, 5 por eje, intercaladas (EI→SN→TF→JP ×5). Hay además 4 preguntas de reserva.
- **Tipos:** 16 tipos en 4 familias: 磐石派 SJ, 实战派 SP, 谋略派 NT y 灵感派 NF.
- **Espejos:** cada tipo tiene un jugador profesional de estilo parecido. Son 8 mujeres y 8 hombres de 7 federaciones, con los hechos y el estado a fecha de hoy verificados (ver §7).
- **Parejas:** la mejor y la peor pareja salen de una regla fija, simétrica y fácil de probar (ver §5).

---

## 1. Qué existe en el internet chino (inspiración y tono)

| # | Contenido | Plataforma / autor | Fecha | Qué aporta |
|---|---|---|---|---|
| 1 | **《羽毛球 12 型人格测试》 "BMTI 羽毛球版"**. Tiene 32 preguntas de 4 opciones y 7 dimensiones: 上头指数, 控场欲, 手感/装备敏感度, 球商/老油条指数, 社交/表达模式, 身体自信/基础功底感 y 场外存在感. Los 12 tipos son 无情重炮手, 道歉机器, 装备信徒, 嘴强王者, 全场王者, 大漏勺, 打杆仙人, 诡异老登, 养生选手, 赛后总结专家, 童子功 y 功夫熊猫. El resultado da un retrato en una frase, rasgos en pista, una "frase típica" y la mejor/peor pareja. Aviso: "友情提示：本测试仅供娱乐。" | Web; "制作者：小红书 @正直球场" · [demo](https://bmti-badminton-12type-test-gq0opb.leapi.cc/) · recogido en [awesome-mbti](https://github.com/HenryLau7/awesome-mbti) | Repo creado el 2026-04-11 | Es el precedente directo. Confirma que el formato "mejor/peor pareja" y las escenas de dobles son el gancho. Su tono es de roast duro (大漏勺, 诡异老登). |
| 2 | **SBTI**, test paródico que se hizo viral en China el 9–10 de abril de 2026 (30 preguntas, 15 dimensiones, etiquetas absurdas) | [Baidu Baike](https://baike.baidu.com/item/SBTI%E6%B5%8B%E8%AF%95/67598800) · [腾讯新闻 2026-04-17](https://news.qq.com/rain/a/20260417A02BYO00) | 2026-04 | Explica la moda de los "XBTI" derivados: moneda social, autoironía y cero riesgo. |
| 3 | **《羽球人的SBTI》**: vídeo que asigna tipos SBTI a profesionales (etiquetas: 林丹, 石宇奇, 安洗莹, 桃田贤斗…). ≈2,5万 reproducciones. | B站 · 九月的光明之门 · [BV1XfDSBXEwk](https://www.bilibili.com/video/BV1XfDSBXEwk/) | 2026-04-12 | Al público le divierte comparar su tipo con el de los profesionales, lo que avala la idea del espejo. |
| 4 | **《羽毛球场上的26种性格，你属于哪几种？》**: 26 arquetipos de club (装备党, 隐藏的扫地僧, 战术大师, 键盘运动员, 每分必争…) | 羽毛球部落 · [新浪看点](https://k.sina.cn/article_3286030503_c3dcd8a7001001ioq.html) | 2017-11-22 | Es el vocabulario clásico del club (扫地僧, 老司机, 装备党). Lo evitamos para ser originales. |
| 5 | **《小心了，你的羽毛球习惯暴露了你的性格特征！》**: test por hábitos (qué comes después, cómo publicas en 朋友圈, a qué hora juegas) | 打球吧 · [搜狐](https://www.sohu.com/a/449515167_492732) | 2021-02-08 | Tono ligero; las escenas fuera de pista (朋友圈, cena) también funcionan. |
| 6 | **《【陈清晨/贾一凡】——i人与e人的天作之合》**: fans que aplican i/e a una pareja de dobles. Llaman **i人** a 陈清晨 y **e人** a 贾一凡 por su carácter fuera de pista. | 豆瓣 · momo · [topic/310762976](https://www.douban.com/group/topic/310762976/) | 2024-09-01 | Las parejas complementarias i/e son un tema muy querido. Además muestra que la **personalidad fuera de pista ≠ el estilo en pista**: la prensa describe a 陈清晨 como "火爆激情，场上怒吼" ([新浪 2026-09-25](https://k.sina.com.cn/article_7879995911_1d5af320706802lm1o.html)). Por eso nuestro test mide solo el estilo en pista. |
| 7 | Listas de fans con el "MBTI de deportistas" en 知乎, por ejemplo [p/508082716](https://zhuanlan.zhihu.com/p/508082716) (林丹 = ESTP según el extracto del buscador) y [p/1968812041306342485](https://zhuanlan.zhihu.com/p/1968812041306342485) (林丹, 王懿律 y 黄东萍 = ENFP según el extracto) | 知乎 | — | **No se pudieron abrir (HTTP 403).** Solo vimos los extractos del buscador. Son especulación de fans y además se contradicen, así que **nunca atribuimos un MBTI a un jugador real**. |
| 8 | Otros tests deportivos derivados: PPTY (乒乓球人格测试), RCTI (攀岩), RDTI (骑行) | [awesome-mbti](https://github.com/HenryLau7/awesome-mbti) | 2026 | Hay un género "XBTI por deporte"; el nuestro se diferencia por estar ligado a un informe de estilo real. |
| 9 | La moda i人/e人 y "报出你的MBTI" | B站 [话题](https://www.bilibili.com/v/topic/detail/?topic_id=13613); [搜狐 科普 i人e人j人p人](https://m.sohu.com/a/768124252_121124287/) | — | Las 4 letras ya son un lenguaje social. Que el código se pueda comparar con el MBTI real del usuario tiene valor para compartir. |

**Límites de la búsqueda.** 小红书 y 抖音 piden iniciar sesión, así que no se pudieron abrir notas ni vídeos concretos. El contenido de 小红书 se cubre con el test BMTI (autor de 小红书) y las menciones anteriores. En B站, la búsqueda "羽毛球MBTI / 羽毛球人格 / 羽毛球 i人 e人" solo devolvió los vídeos SBTI citados.

**Lo que tomamos del tono:**
- Escenas muy concretas, como el volante al centro en dobles, 接龙 en el grupo, pedir o prestar raqueta y la cena después.
- La relación de pareja como plato fuerte.
- Una frase-lema compartible.

**Lo que evitamos:**
- Etiquetas humillantes (大漏勺, 老登). La nuestra es una app de entrenamiento: el tono es **损而不伤** y cada debilidad viene con un consejo para mejorar.
- Copiar nombres o dimensiones del BMTI o de la lista de 26 tipos.

**Contexto científico (para el aviso):**
- El MBTI no está validado como instrumento psicométrico: Pittenger, D. J. (2005). *Cautionary comments regarding the Myers-Briggs Type Indicator.* Consulting Psychology Journal: Practice and Research, 57(3), 210–221. [doi:10.1037/1065-9293.57.3.210](https://doi.org/10.1037/1065-9293.57.3.210) (verificado en Crossref).
- 许燕 (北师大, psicología de la personalidad): "MBTI的'火'在于它的形式，不完全是科学的指标" ([腾讯新闻/封面新闻, 2024-07-04](https://news.qq.com/rain/a/20240704A03XK400)).

**Dato de reglas que afecta a los textos.** La AGM de la BWF aprobó el 25-04-2026 el sistema **3×15**, vigente **desde el 4 de enero de 2027**:
- a 15 puntos, con ventaja de dos desde 14-14 y tope de 21;
- descanso de 60 s cuando el que va delante llega a 8;
- el 3×21 queda como sistema alternativo, y los clubes y ligas nacionales pueden elegir.

Fuente: [BWF, 2026-04-26](https://bwfbadminton.com/news-single/2026/04/26/key-changes-under-the-3x15-scoring-system). → **Ninguna pregunta usa marcadores concretos** ("20:20", "11分间歇"); decimos "局末平分", "关键分" o "局间", que valen con los dos sistemas.

---

## 2. Decisión: letras MBTI con significado de bádminton

**Elegido:** E/I, S/N, T/F, J/P, redefinidos en términos de pista. Motivos:

1. **Se comparte más.** "我打球是 ESTP" se entiende al instante y se puede comparar con el MBTI real ("我MBTI是INFP，打球却是ESTP"). El éxito de SBTI/BMTI muestra que un formato reconocible impulsa que la gente comparta.
2. **No choca con el 天赋测评.** Ese módulo ya recomienda el estilo (ataque/defensa/red/fondo/control) a partir del cuerpo y las capacidades. Unos ejes 攻/守 o 网前/后场 serían un segundo test de estilo más débil y podrían **contradecir** el informe ("天赋说你适合网前，MBTI说你是后场型"). Nuestros ejes miden temperamento y decisión: cómo te comunicas, cómo eliges el golpe, cómo decides y cómo te organizas. Son ortogonales al estilo técnico.
3. **Ejes más independientes.** Las alternativas 攻/守 y 快/控 están correlacionadas (quien ataca suele jugar rápido). Con ejes correlacionados las 16 combinaciones no están bien repartidas.
4. **Cada letra es observable en pista**, como muestra la tabla de abajo.

| Eje | Nombre del eje | Polo | Nombre corto | Definición en pista (texto de la app) |
|---|---|---|---|---|
| E/I | 能量方向 | **E** | 外放 | 能量向外：喊球、击掌、主动组局，用声音和情绪带动节奏。 |
| | | **I** | 内敛 | 能量向内：安静专注、自我调节，更靠默契而不是喊话。 |
| S/N | 击球取向 | **S** | 实打 | 相信基本功和高质量重复，偏好清楚、可靠、成功率高的线路。 |
| | | **N** | 灵变 | 相信变化和想象：假动作、变线、变节奏，喜欢出其不意。 |
| T/F | 决策方式 | **T** | 理性 | 按比分、成功率和对手弱点做决定，就事论事。 |
| | | **F** | 感性 | 按手感、气势和搭档情绪做决定，重视打球的感受。 |
| J/P | 节奏风格 | **J** | 计划 | 提前订场、固定热身、赛前有战术、练球有计划。 |
| | | **P** | 随性 | 打野球、临场即兴、见招拆招，享受不确定。 |

Texto de la app para introducir los ejes:
> 这里的四个字母借用了MBTI的写法，但含义全部换成了球场行为：你怎么喊球、怎么选球路、怎么做决定、怎么安排打球。它只描述你在球场上的样子，和你生活中的性格不一定一样。

---

## 3. Puntuación

- Cada eje tiene 5 preguntas binarias. Sea `countX` el número de respuestas al polo X; la letra es X si `countX ≥ 3`. **No puede haber empate.**
- Porcentaje por eje: `pct = count / 5 × 100` → siempre 60/40, 80/20 o 100/0.
- Intensidad (se muestra junto a la barra):
  - 3/5 → `轻度偏向`
  - 4/5 → `明显偏向`
  - 5/5 → `非常鲜明`
- Orden: intercalado Q1 EI, Q2 SN, Q3 TF, Q4 JP, … Q20 JP. La opción A no siempre es el mismo polo (ver la columna "Polo"). Además se recomienda **barajar el orden A/B** en cada sesión.
- Reservas: si se usa una pregunta de reserva, sustituye a una del **mismo eje**, para mantener 5 por eje.
- Texto de la barra de cada eje (ejemplo): `E 外放 80% ｜ I 内敛 20% · 明显偏向`.

---

## 4. Banco de preguntas (20 + 4 de reserva)

Formato: `id · eje · enunciado`, y luego las opciones con su polo.

**Q1 · E/I** 双打时，一个平球正好朝你和搭档中间飞来，你会？
- A. 大喊一声“我的！”，直接抢上去 → **E**
- B. 不出声，看谁顺手谁接，靠默契 → **I**

**Q2 · S/N** 如果只能练成一项绝活，你选？
- A. 网前一个假动作，把对手晃得原地转圈 → **N**
- B. 一拍接一拍都能稳稳打到底线的高远球 → **S**

**Q3 · T/F** 局末平分，轮到你发球。你怎么决定发什么球？
- A. 想想对手接发哪里最弱，选成功率最高的那一种 → **T**
- B. 跟着此刻的手感和气势走，哪个感觉对就发哪个 → **F**

**Q4 · J/P** 周末想打球，你通常是？
- A. 看群里哪儿有空场、哪儿缺人，说走就走 → **P**
- B. 提前几天在小程序订好场，时间和球友都约定好 → **J**

**Q5 · E/I** 球友群里有人问“周六谁打？”，你一般是？
- A. 默默在接龙里加上自己的名字 → **I**
- B. 直接发起接龙、订场、拉人，顺便@几个老球友 → **E**

**Q6 · S/N** 对手站位很好，一时找不到破绽，你会？
- A. 继续拉吊四角，靠质量和耐心慢慢磨出机会 → **S**
- B. 突然换个节奏或线路：劈个对角、晃一下，看对手怎么反应 → **N**

**Q7 · T/F** 双打搭档连续两个失误，你第一反应是？
- A. 拍拍对方：“没事，下一个！”先把情绪稳住 → **F**
- B. 直接说：“你站得有点靠后，下个球我们换一下。” → **T**

**Q8 · J/P** 上场前的热身，你一般？
- A. 随便活动两下，打着打着就热了 → **P**
- B. 走固定流程：拉伸、步法、先对拉高远再练吊杀 → **J**

**Q9 · E/I** 你一记重杀直接得分，你的反应是？
- A. 攥拳吼一声“来！”，再和搭档击个掌 → **E**
- B. 平静回位，心里默默给自己点个赞 → **I**

**Q10 · S/N** 看完一场顶尖比赛，你最想去模仿的是？
- A. 球员那一下反手劈吊、网前假动作的手法 → **N**
- B. 球员的步法节奏和每一拍的回位 → **S**

**Q11 · T/F** 球友群约双打，你挑搭档最看重什么？
- A. 技术和打法是否互补，能不能赢球 → **T**
- B. 打得开不开心、聊不聊得来，输赢其次 → **F**

**Q12 · J/P** 下午要和一个熟悉的球友打比赛，你会？
- A. 提前想好战术：他反手弱，就一直压他反手后场 → **J**
- B. 上场先打几拍再说，见招拆招 → **P**

**Q13 · E/I** 第一次去陌生球馆打野球，场边都是生面孔，你会？
- A. 先在场边热身观察，等有人来叫再上 → **I**
- B. 主动上前问：“还差人吗？带我一个！” → **E**

**Q14 · S/N** 你网前一拍搓得很好，对手勉强挑起一个半场高球，你会？
- A. 老老实实一板下压，用最稳的方式拿分 → **S**
- B. 摆出重杀的架势，然后轻轻一吊，骗他一下 → **N**

**Q15 · T/F** 打输一场很胶着的球，回家路上你在想？
- A. 那几个多拍来回真过瘾（或者真憋屈），心情还留在球场上 → **F**
- B. 复盘哪几个球线路选错了，下次怎么改 → **T**

**Q16 · J/P** 打开你的球包，更可能看到的是？
- A. 断线的拍子还没去穿，护腕找不到了，缺啥就借 → **P**
- B. 两支拍子磅数固定，手胶按时换，水和备用球都带齐 → **J**

**Q17 · E/I** 连丢三分，局面很被动，你更习惯怎么把自己拉回来？
- A. 大声给自己和搭档打气，用声音把气势喊回来 → **E**
- B. 整理一下拍线、深呼吸，在心里把节奏重新摆好 → **I**

**Q18 · S/N** 球友评价你的球路，你更可能被吐槽的是？
- A. “太老实了，一看就知道你要打哪儿” → **S**
- B. “花活太多，简单球也要变一下” → **N**

**Q19 · T/F** 对手明显比你弱，但打得很拼、很认真，你会？
- A. 适当放慢节奏，多打几个回合，让大家都打得开心 → **F**
- B. 该怎么打就怎么打，认真对待就是尊重 → **T**

**Q20 · J/P** 打了一局发现原来的打法不灵，第二局你会？
- A. 按赛前想好的“B计划”切换打法 → **J**
- B. 临场凭感觉调整，想到什么打什么 → **P**

**Equilibrio de la opción A:**

| Eje | Polo 1 | Veces en A | Polo 2 | Veces en A |
|---|---|---|---|---|
| E/I | E | 3 | I | 2 |
| S/N | S | 3 | N | 2 |
| T/F | T | 2 | F | 3 |
| J/P | J | 2 | P | 3 |

### Reservas (sustituyen a una del mismo eje)

**R1 · E/I** 打完球，大家张罗去吃夜宵，你？
- A. 必须去，还要在群里发合照 → **E**
- B. 看情况，更想回家洗个澡躺平 → **I**

**R2 · S/N** 双打发球，你的习惯是？
- A. 基本都发网前小球，稳定第一 → **S**
- B. 时不时突然发个平快球或后场球，打对手一个措手不及 → **N**

**R3 · T/F** 野球局里，对手发球明显过高（按规则已经违例），你会？
- A. 算了，别为这个影响气氛 → **F**
- B. 当场指出，规则就是规则 → **T**

**R4 · J/P** 你平时练球更像哪种？
- A. 有计划：这周练步法，下周练网前 → **J**
- B. 想练啥练啥，今天手感好就多杀几个 → **P**

---

## 5. Regla de parejas (determinista y simétrica)

- **Mejor pareja:** se invierten E/I y S/N y se mantienen T/F y J/P.
  - Por qué: uno habla y otro sostiene; uno es estable y otro crea. Con la misma forma de decidir y de organizarse hay menos discusiones.
- **Peor pareja:** se mantienen E/I y S/N y se invierten T/F y J/P.
  - Por qué: dos E se pisan la pelota y dos I se la ceden; dos S no rematan y dos N no sostienen. Encima deciden y se organizan de forma opuesta.
- Las dos relaciones son **involutivas**: si B es la mejor pareja de A, A es la mejor pareja de B. Así se puede probar con un test de invariantes.
- En el texto de la app, la pareja se nombra con **对方** (sin género).

| Tipo | Mejor | Peor |
|---|---|---|
| ISTJ | ENTJ | ISFP |
| ISFJ | ENFJ | ISTP |
| ESTJ | INTJ | ESFP |
| ESFJ | INFJ | ESTP |
| ISTP | ENTP | ISFJ |
| ESTP | INTP | ESFJ |
| ISFP | ENFP | ISTJ |
| ESFP | INFP | ESTJ |
| INTJ | ESTJ | INFP |
| INTP | ESTP | INFJ |
| ENTJ | ISTJ | ENFP |
| ENTP | ISTP | ENFJ |
| INFJ | ESFJ | INTP |
| INFP | ESFP | INTJ |
| ENFJ | ISFJ | ENTP |
| ENFP | ISFP | ENTJ |

Guiño: ENFJ (镜像 陈清晨) tiene como mejor pareja a ISFJ (镜像 贾一凡), que fueron campeonas olímpicas de dobles femenino en París 2024.

---

## 6. Los 16 tipos (texto de la app)

### 6.0 Cuatro familias (派系)

| Familia | Letras | Emoji | Texto |
|---|---|---|---|
| 磐石派 | SJ | 🧱 | 稳字当头。你们相信基本功和计划，是球馆里最让人放心的一群人。 |
| 实战派 | SP | ⚡ | 临场为王。你们靠身体本能和手感打球，越打越有感觉。 |
| 谋略派 | NT | 🧠 | 用脑子打球。你们爱布局、爱变化，把每一分都当成一道题。 |
| 灵感派 | NF | ✨ | 用心打球。你们在乎感受、默契和美感，球里有情绪，也有想象力。 |

Campos de cada tipo:
- código, 昵称, emoji, familia y 一句话;
- 场上画像 (80–120 字);
- 3 优势 y 2 短板;
- 最佳搭档 y 最怕搭档, cada uno con su motivo;
- 球风镜像: jugador, motivo del parecido, hechos verificados y estado;
- 2 成长建议;
- opcional: 口头禅 para la ShareCard.

---

### ISTJ · 人形城墙 🧱（磐石派）
**一句话：** 你尽管杀，我负责一直接。
**场上画像：** 你是球馆里最让人头疼的对手：不急不躁，高远球打到底线，吊球贴着网走，接杀一拍一拍往回挡。你相信基本功，不信运气，能打十拍的球绝不冒险打三拍。对手往往不是被你打死，而是被你磨到失误。你的比赛像一份写好的计划书，稳得让人安心。
**优势：** ① 失误率低，关键分也不手软 ② 接杀防守扎实，能把多拍拖成自己的节奏 ③ 训练自律，技术动作规范
**短板：** ① 变化偏少，被熟悉的对手摸透后容易被针对 ② 落后时不太敢主动冒险，追分偏慢
**最佳搭档：** ENTJ 战术总指挥：你稳住回合，对方喊战术、用变化终结；你们都讲道理、按计划打，攻守分工清清楚楚。
**最怕搭档：** ISFP 救球灵猫：两个人都不爱出声，中路球容易互相让；你要按套路稳打，对方跟着感觉走，节奏总对不上。
**球风镜像：安洗莹**（韩国 · 女单 · 现役）
- 为什么像：她以滴水不漏的防守、速度和耐力著称，常把多拍回合变成对手的压力，和你“磨到对手失误”的打法一脉相承。
- 核实信息：巴黎奥运会女单金牌；2023年、2026年两夺世锦赛女单冠军（2026年决赛2:0胜山口茜）。
**成长建议：** ① 每次练球留10分钟专门练一个“变化球”，比如劈对角或假动作放网，给稳定加一点意外 ② 打练习赛时给自己定规则：落后3分以上，必须主动变一次节奏
**口头禅（可选）：** “再来，我接得住。”

---

### ISFJ · 补位天使 😇（磐石派）
**一句话：** 你放心往前冲，身后有我。
**场上画像：** 双打里你是那个默默补位的人：搭档扑网失位，你已经退到后场；搭档失误，你第一时间说“没事”。你不追求高光，只求每一拍都接得住、回得稳，把搭档的漏洞一个个补上。球友群里最抢手的搭档往往就是你，因为和你打球，心里踏实。
**优势：** ① 补位意识强，中路球和身后球很少漏 ② 情绪稳定，是搭档的“定心丸” ③ 基本功扎实，防守和过渡球质量高
**短板：** ① 太照顾别人，机会球也常常让给搭档 ② 不爱表达，需要改战术时不好意思开口
**最佳搭档：** ENFJ 燃魂队长：对方负责喊声和带节奏，你负责稳住和补位；你们都在乎彼此的感受，也都喜欢有章法地打。
**最怕搭档：** ISTP 冷面重炮：你们都不爱说话，一个在乎感受、一个只看结果，配合出了问题没人开口，越打越闷。
**球风镜像：贾一凡**（中国 · 女双 · 现役）
- 为什么像：媒体形容她“细腻沉稳，关键时刻以沉默坚韧稳住大局”，这正是补位天使的样子。
- 核实信息：与陈清晨搭档获巴黎奥运会女双金牌；2026年与张殊贤搭档参赛。
**成长建议：** ① 给自己定一个“抢球指标”：每局至少主动封网或下压3次 ② 每个局间主动说一句战术（比如“打他反手”），练习把想法说出口
**口头禅（可选）：** “没事，我来补。”

---

### ESTJ · 场上CEO 📋（磐石派）
**一句话：** 站位、轮转、战术，开打前我已经安排好了。
**场上画像：** 你打球像在管一个项目：先看对手哪里弱，再定好谁前谁后，然后严格执行。双打时你会大声喊“你的”“我的”，一出现混乱马上纠正。你相信扎实的基本功和清楚的分工，最受不了“打到哪算哪”。和你搭档不一定轻松，但通常能赢。
**优势：** ① 战术执行力强，说到做到 ② 沟通清晰，双打分工明确 ③ 训练有规律，技术全面稳定
**短板：** ① 控制欲偏强，容易让搭档觉得被“指挥” ② 计划被打乱时调整慢，容易急躁
**最佳搭档：** INTJ 棋盘大师：对方在脑子里布局，你在场上执行和喊话；你们都讲逻辑、按计划打，配合效率极高。
**最怕搭档：** ESFP 野球场C位：两个人都想当场上主角；你要按战术来，对方只想打得痛快，很容易在场上争起来。
**球风镜像：安赛龙**（丹麦 · 男单 · 已退役）
- 为什么像：他身高1.94米，以高点陡峭的下压进攻和稳定的执行力著称，打法清晰、强势、有章法。
- 核实信息：东京、巴黎两届奥运会男单金牌；2017年、2022年世锦赛男单冠军；2026年4月14日因背伤宣布退役。
**成长建议：** ① 双打时每局只给搭档一条最关键的建议，其余留到赛后复盘 ② 每周安排一次“无计划练习赛”，专门练临场应变
**口头禅（可选）：** “按刚才说的打！”

---

### ESFJ · 热血领队 📣（磐石派）
**一句话：** 喊声最大的那个，永远是我。
**场上画像：** 你是球场上的气氛发动机：得分要喊，失分也要喊，喊的是给自己和搭档打气。你打球认真、守规矩，热身和训练一样不落；你也是球友群里张罗约球、拉新人进群的那个人。你的能量能点燃整片场地，只是情绪一上头，手也会跟着发紧。
**优势：** ① 气势足，能把搭档的状态带起来 ② 自律，训练和热身都很规范 ③ 团队意识强，擅长双打沟通
**短板：** ① 情绪起伏会直接影响动作，一急就容易发力过猛 ② 太在意场上气氛，被对手挑衅时容易分心
**最佳搭档：** INFJ 网前读心师：对方安静地读球、封网，你在外面用喊声带节奏；你们都在乎搭档的感受，也都喜欢按计划打。
**最怕搭档：** ESTP 大心脏炮台：两个人都爱喊、都想主导；你讲规矩也讲感受，对方只管临场硬打，谁也不服谁。
**球风镜像：马林**（西班牙 · 女单 · 左手 · 已退役）
- 为什么像：她以高速压迫的进攻和场上标志性的呐喊闻名，这正是热血领队的能量来源。
- 核实信息：里约奥运会女单金牌；2014、2015、2018年三夺世锦赛冠军；2026年3月26日因膝伤宣布退役。
**成长建议：** ① 练一个“关键分呼吸法”：发球前深呼吸两次再出手 ② 把喊声留在得分之后，回合中专注步法和回位
**口头禅（可选）：** “来！再来一个！”

---

### ISTP · 冷面重炮 🧊（实战派）
**一句话：** 话不多，杀球说话。
**场上画像：** 你在场上几乎不出声，但每一板杀球都很有分量。你不爱想复杂的套路，看到半场高球就起跳，看到机会就下压，干净利落。你相信身体的本能和练出来的手感，临场反应快，被逼到角落也能冷静找出一拍。赛后别人问你战术，你只会说：“看到了就杀。”
**优势：** ① 进攻果断，下压质量高 ② 心态冷静，关键分不慌 ③ 临场反应快，处理突发来球干净利落
**短板：** ① 沟通太少，双打时搭档常常猜不到你的想法 ② 太依赖杀球，拉吊变化不够
**最佳搭档：** ENTP 网前戏精：对方在网前晃人、制造机会，你在后场一锤定音；你们都爱临场发挥，一前一后正好互补。
**最怕搭档：** ISFJ 补位天使：你们都不爱说话，你只看结果、对方在乎感受，配合失误时谁都不开口，问题一直在。
**球风镜像：傅海峰**（中国 · 男双 · 左手 · 已退役）
- 为什么像：他是公认的后场重炮手，杀球曾在2005年苏迪曼杯上被测到332公里/小时，以力量为搭档的速度提供火力。
- 核实信息：与蔡赟获伦敦奥运会男双金牌，与张楠获里约奥运会男双金牌；2017年全运会后退役。
**成长建议：** ① 双打时练习喊球：每个中路球都喊出“我的”或“你的” ② 每次练习加一组“杀吊结合”：连续两拍杀球后，必须接一拍吊球或劈吊
**口头禅（可选）：** “……（直接起跳）”

---

### ESTP · 大心脏炮台 🔥（实战派）
**一句话：** 越是关键分，我越想起跳。
**场上画像：** 你是为比赛而生的人：比分越紧，你越兴奋。你喜欢主动进攻，逮到机会就重杀，打出好球还要攥拳吼一声。你不爱提前规划，擅长在对抗里找感觉，对手一露破绽你就扑上去。你的球打得痛快、好看，也最容易把比赛打成一场对攻大战。
**优势：** ① 大赛型心态，关键分敢打敢拼 ② 进攻火力强，抓机会能力一流 ③ 临场反应快，适应对手快
**短板：** ① 容易打急，连续强攻后体能下降、失误增加 ② 不耐烦拉吊，被拖进多拍时容易乱
**最佳搭档：** INTP 怪球研究员：对方用怪线路和假动作制造机会，你负责一板打死；你们都理性看球、临场应变，配合又野又准。
**最怕搭档：** ESFJ 热血领队：两个人都想主导节奏；你想临场硬打，对方想按计划来、还在乎气氛，容易互相较劲。
**球风镜像：林丹**（中国 · 男单 · 左手 · 已退役）
- 为什么像：BWF称他是以爆发力为招牌的进攻型男单，起跳后的直线、斜线重杀和各种劈吊都能打，而且越是大赛越有状态。
- 核实信息：北京、伦敦两届奥运会男单金牌；5次世锦赛男单冠军（2006、2007、2009、2011、2013）；2020年7月4日宣布退役。
**成长建议：** ① 练“耐心三拍”：机会不够好时，先用三拍拉吊调动，再起跳 ② 记录每局失误数，找出自己最容易冒进的场景
**口头禅（可选）：** “给我起高球！”

---

### ISFP · 救球灵猫 🐈（实战派）
**一句话：** 你以为这球死了？它还能回来。
**场上画像：** 你话不多，却总能让对手意外：一个看似必死的球，你一个跨步、一个甩腕就救了回来。你靠身体的感觉打球，脚步轻快、反应敏锐，不喜欢被固定套路束缚。状态好的时候你满场飞；状态一般时，也能靠一股韧劲一分一分咬住对手。
**优势：** ① 防守覆盖面大，救球能力强 ② 步法灵活，启动快 ③ 韧性好，不轻易放弃任何一球
**短板：** ① 缺少主动进攻的计划，常常陷入被动救球 ② 状态容易受心情影响，起伏较大
**最佳搭档：** ENFP 快乐花活王：对方在前面变花样，你在后面把球都救回来；你们都靠感觉打球，享受临场发挥。
**最怕搭档：** ISTJ 人形城墙：两个人都安静，中路球容易互相让；对方要按套路稳打，你想跟着感觉走，节奏总是对不上。
**球风镜像：山口茜**（日本 · 女单 · 现役）
- 为什么像：她身高1.56米，对手评价她速度快、救球能力出众、耐心稳定，是靠步法和韧劲把球“捡”回来的代表。
- 核实信息：2021、2022、2025年三夺世锦赛女单冠军，2026年世锦赛女单亚军。
**成长建议：** ① 救起球后练“反攻第一拍”：防守后主动抽压或推后场，而不是继续挑高 ② 赛前写下3个简单目标，别让状态全凭心情
**口头禅（可选）：** “还没落地呢！”

---

### ESFP · 野球场C位 🎉（实战派）
**一句话：** 打野球不为别的，就图个痛快！
**场上画像：** 只要有你在，球馆就不会冷场。你喜欢和陌生人打野球，打得痛快、笑得大声，一记漂亮的扣杀能让你开心一整晚。你的球风火辣直接，手感来了谁也挡不住。你不太在意战术和计划，更在意这一局好不好玩，所以和你打过球的人总说：“下次还约！”
**优势：** ① 感染力强，能带动全场气氛 ② 进攻有激情，手感来了火力惊人 ③ 适应力强，和谁都能搭
**短板：** ① 注意力容易分散，领先时常常打飘 ② 很少针对性训练，技术短板长期不补
**最佳搭档：** INFP 灵感艺术家：对方安静地打出漂亮的球，你在前面热闹地冲；你们都跟着感觉走，享受打球本身。
**最怕搭档：** ESTJ 场上CEO：两个人都想当场上主角；对方要严格按战术执行，你只想打得开心，很容易起冲突。
**球风镜像：黄东萍**（中国 · 混双 · 现役）
- 为什么像：《羽毛球》杂志形容她“性格直率，球风火爆”，身高1.65米却有“气场2米的激情”。
- 核实信息：与王懿律搭档获东京奥运会混双金牌；现与冯彦哲搭档，2026年仍在参赛。
**成长建议：** ① 给每次打球设一个小目标（比如“今天练反手过渡”），让快乐也带来进步 ② 领先时提醒自己“再稳三拍”，别在大比分领先时被追上
**口头禅（可选）：** “再来一局！”

---

### INTJ · 棋盘大师 ♟️（谋略派）
**一句话：** 第三拍的落点，第一拍就想好了。
**场上画像：** 你把每一分都当成一盘棋：发球时就想好第三拍打哪儿，拉吊时一步步把对手调离中心，等空当出现再出手。你安静、耐心，很少情绪化，失误后也会冷静分析原因。你的假动作不是为了好看，而是整套计划的一部分。对手常常输了，还不知道是从哪一拍开始的。
**优势：** ① 战术规划能力强，擅长布局调动 ② 情绪稳定，关键分冷静 ③ 善于观察总结，进步快
**短板：** ① 计划被打乱时容易卡住 ② 太理性，有时显得冷淡，搭档不知道你在想什么
**最佳搭档：** ESTJ 场上CEO：你负责设计战术，对方负责在场上执行和指挥；你们都讲逻辑、按计划打，效率很高。
**最怕搭档：** INFP 灵感艺术家：两个人都安静、都爱变化；你要严格按计划，对方全凭灵感临场发挥，配合容易脱节。
**球风镜像：桃田贤斗**（日本 · 男单 · 左手 · 已退出国际赛场）
- 为什么像：他以防守、步法、耐心和球的质量著称，擅长用一拍拍高质量的控制把对手拖进自己的节奏。
- 核实信息：2018、2019年世锦赛男单冠军；2019年单赛季夺得11个冠军，获吉尼斯世界纪录认证；2024年4月宣布退出日本国家队，此后只参加日本国内比赛。
**成长建议：** ① 练“计划B”：每场准备两套打法，一套不灵就立刻切换 ② 双打时把你看到的对手弱点说出来，别只放在心里
**口头禅（可选）：** “别急，还没到时候。”

---

### INTP · 怪球研究员 🧪（谋略派）
**一句话：** 这个球教科书上没有，但我想试试。
**场上画像：** 你对“为什么这样打”有无穷的好奇。别人在练高远球，你在研究反手劈吊的角度和网前假动作的拍面。你常常打出让对手愣住的怪球，也常常为了试新东西丢掉简单的分。你不爱固定套路，喜欢在比赛里做实验：赢球当然好，搞懂一个新球路更让你开心。
**优势：** ① 创造力强，球路难以预判 ② 善于分析技术细节 ③ 临场应变快，敢于尝试
**短板：** ① 基本功不够稳，简单球也会想复杂 ② 容易钻牛角尖，比赛中实验过度
**最佳搭档：** ESTP 大心脏炮台：你用怪球和假动作制造机会，对方负责一板打死；你们都理性看球、临场应变，配合又野又准。
**最怕搭档：** INFJ 网前读心师：两个人都安静、都爱变化；你只讲道理和实验，对方在乎感受和计划，默契很难建立。
**球风镜像：盖德**（丹麦 · 男单 · 已退役）
- 为什么像：他以富有创意的假动作著称，招牌的“二次动作”和反向击球常让对手判断失误，是出了名的“怪球”专家。
- 核实信息：1999年全英公开赛男单冠军，曾位列世界第一；2012年退出国际赛场。
**成长建议：** ① 设一个“实验配额”：每局最多试3个新球，其余打高成功率的球 ② 每周练一次基础多球，把高远、吊、杀的稳定性补上
**口头禅（可选）：** “等等，我再试一个。”

---

### ENTJ · 战术总指挥 🧭（谋略派）
**一句话：** 听我的，打他反手。
**场上画像：** 你是天生的场上指挥官：开局几拍就看出对手的漏洞，马上安排搭档怎么站、球往哪儿打。你善用变化，发接发时推、搓、放反复切换，把对手逼进你设计好的局面。你目标明确，想赢，也相信计划能赢。只是你的“指导”有时太多，会让搭档压力山大。
**优势：** ① 读比赛快，能迅速找到对手弱点 ② 领导力强，双打时能统一战术 ③ 进攻组织有层次，变化多
**短板：** ① 对搭档要求高，容易给人压力 ② 太在意输赢，打得不顺时容易急躁
**最佳搭档：** ISTJ 人形城墙：对方用稳定的防守和基本功兜底，你来指挥和变化；你们都讲逻辑、按计划打，攻守分工清楚。
**最怕搭档：** ENFP 快乐花活王：两个人都爱说、都爱变；你要按计划赢球，对方只想打得开心，一个喊战术、一个玩花活，场上容易吵起来。
**球风镜像：郑思维**（中国 · 混双 · 已退役）
- 为什么像：混双里他负责后场进攻输出，在发接发环节率先举拍，以“快推底线+搓放网前”反复切换，把对手带进他设计的节奏。
- 核实信息：与黄雅琼搭档获巴黎奥运会混双金牌、东京奥运会混双银牌，三夺世锦赛混双冠军（2018、2019、2022）；2024年底退役。
**成长建议：** ① 双打时先肯定搭档一次，再提一条建议 ② 练习落后时只调整一个点，避免战术变来变去
**口头禅（可选）：** “听我的，打他反手！”

---

### ENTP · 网前戏精 🎭（谋略派）
**一句话：** 网前那一下，是我给你的惊喜。
**场上画像：** 你是网前的魔术师：推、搓、勾、扑都带着假动作，对手总是慢半拍。你喜欢挑战高手，更喜欢用对手想不到的方式得分，偶尔还会隔着网冲对面挑挑眉。你脑子转得快、嘴也快，场上点子一个接一个。只是花活一多，简单球也会被你“玩”丢。
**优势：** ① 网前手法细腻，假动作丰富 ② 反应快、手速快，擅长抢网 ③ 点子多，能打乱对手节奏
**短板：** ① 容易为了炫技而冒险，失误率不稳定 ② 耐心不足，不喜欢长时间拉吊和防守
**最佳搭档：** ISTP 冷面重炮：你在网前晃人造机会，对方在后场一锤定音；你们都爱临场发挥，一前一后正好互补。
**最怕搭档：** ENFJ 燃魂队长：两个人都爱说、都爱变化；你想即兴玩花活，对方想按计划带节奏、还在乎搭档感受，谁也带不动谁。
**球风镜像：凯文·桑贾亚**（印尼 · 男双 · 已退役）
- 为什么像：他身高1.70米，以网前极快的手速和灵动的跑跳著称，把男双带进了更快的节奏。
- 核实信息：与吉迪恩组成的“小黄人”组合自2017年3月起连续215周排名世界第一；2017、2018年全英公开赛男双冠军，2018年亚运会男双金牌；2024年5月宣布退役。
**成长建议：** ① 给假动作设“使用场景”：只在对手重心已经移动时才用 ② 每周练一次防守多球，补上被动时的耐心
**口头禅（可选）：** “猜猜这球去哪儿？”

---

### INFJ · 网前读心师 🔮（灵感派）
**一句话：** 你还没出手，我已经在那儿等你了。
**场上画像：** 你擅长“读”人：对手的站位和拍面，搭档的习惯和情绪，你都看在眼里。你话不多，却总在最合适的位置出现，网前一拍封死，让对手怀疑你会读心术。你打球有自己的节奏和计划，也很在意和搭档的默契。你最享受的不是扣杀，而是两个人配合得行云流水的那一刻。
**优势：** ① 预判和阅读比赛能力强 ② 网前封网意识好，出手时机准 ③ 懂搭档，擅长营造默契
**短板：** ① 不爱表达，想法常常只留在心里 ② 太在意别人感受，遇到强势搭档容易压抑自己
**最佳搭档：** ESFJ 热血领队：对方在外面喊声带节奏，你安静地读球、封网；你们都在乎彼此的感受，也都喜欢有计划地打。
**最怕搭档：** INTP 怪球研究员：两个人都安静、都爱变化；你在乎默契和计划，对方只顾做实验，你很难“读”懂对方。
**球风镜像：黄雅琼**（中国 · 混双 · 已退役）
- 为什么像：她是“雅思组合”的网前封网核心，预判出色、连贯性极强，回球落点精准，常常为搭档送出扣杀机会。
- 核实信息：与郑思维搭档获巴黎奥运会混双金牌、东京奥运会混双银牌，三夺世锦赛混双冠军（2018、2019、2022）；2025年1月退出国家队。
**成长建议：** ① 每局主动跟搭档说一次你看到的东西（比如“他喜欢放直线”） ② 练网前主动扑杀，把预判变成得分
**口头禅（可选）：** “我就知道你会放这儿。”

---

### INFP · 灵感艺术家 🎨（灵感派）
**一句话：** 赢球很好，打出一拍漂亮的球更好。
**场上画像：** 你打球像在创作：一个轻巧的反手、一记出人意料的劈吊，是你最在意的“作品”。你不喜欢死板的套路，常常跟着灵感出手，状态好时球路变幻莫测，连对手都想为你鼓掌。你很在意打球的感受，心情会写在球上：开心时行云流水，低落时也会连连失误。
**优势：** ① 手感细腻，球路富有想象力 ② 假动作多，出手难以预判 ③ 真心享受打球，热爱持久
**短板：** ① 稳定性不足，状态起伏大 ② 不喜欢对抗和体能训练，身体素质容易成为短板
**最佳搭档：** ESFP 野球场C位：对方负责热闹和冲劲，你负责安静地打出漂亮的球；你们都跟着感觉走，享受打球本身。
**最怕搭档：** INTJ 棋盘大师：两个人都安静、都爱变化；对方要严格按计划，你全凭灵感，配合容易变成各打各的。
**球风镜像：戴资颖**（中国台北 · 女单 · 已退役）
- 为什么像：她的球路多变、假动作丰富、出手难以预判，打法灵动随性，是公认最具观赏性的女单之一。
- 核实信息：东京奥运会女单银牌；累计214周世界第一，为女单历史最长；2025年11月7日宣布退役。
**成长建议：** ① 固定一个赛前小仪式（热身顺序、呼吸节奏），减少情绪对状态的影响 ② 每周安排一次体能训练，给灵感配上跑得动的身体
**口头禅（可选）：** “这球打得真好看。”

---

### ENFJ · 燃魂队长 🦁（灵感派）
**一句话：** 我喊一声，全队都醒了。
**场上画像：** 你是双打里的精神领袖：一声怒吼既能点燃搭档，也能压住对手的气势。你擅长在网前抢点、组织进攻，看得见搭档的情绪，知道什么时候该鼓励、什么时候该提醒。你喜欢有目标、有计划地打球，更喜欢带着大家一起变强。队伍里有你，大家就不会轻易放弃。
**优势：** ① 感染力强，能带动搭档和团队 ② 网前组织意识好 ③ 善于沟通，懂得照顾搭档情绪
**短板：** ① 情绪投入太多，输球时容易自责 ② 太在意搭档的状态，有时忽略了自己的技术细节
**最佳搭档：** ISFJ 补位天使：你在前面喊、带节奏，对方在后面稳稳补位；你们都在乎彼此的感受，也都喜欢按计划打。
**最怕搭档：** ENTP 网前戏精：两个人都爱说、都爱变化；你想按计划带动团队，对方只想即兴玩花活，谁也带不动谁。
**球风镜像：陈清晨**（中国 · 女双 · 已退役）
- 为什么像：媒体形容她在场上“火爆激情，场上怒吼输出压力”，她的喊声既能带动搭档的激情，也能压制对手的士气。
- 核实信息：与贾一凡搭档获巴黎奥运会女双金牌、东京奥运会女双银牌，四夺世锦赛女双冠军（2017、2021、2022、2023）；2025年退役。
- 小彩蛋：燃魂队长的最佳搭档是补位天使，而陈清晨和贾一凡正是巴黎奥运会女双冠军组合。
**成长建议：** ① 把情绪能量用在得分后和局间，回合中专注技术 ② 每周给自己留一次单独训练，补自己的技术短板
**口头禅（可选）：** “醒醒！这分拿下！”

---

### ENFP · 快乐花活王 🌈（灵感派）
**一句话：** 今天也要打出一个让全场“哇”的球！
**场上画像：** 你是球馆里的快乐源泉：反手杀、背后接、网前假动作，什么花活都想试。你打球全凭兴致和灵感，心情好时连高手都拿你没办法，心情差时也可能连丢好几分。你喜欢认识新球友，哪里有局就去哪里。对你来说，羽毛球最重要的不是输赢，而是那一声“哇”。
**优势：** ① 创造力和表现力强，能打出惊喜球 ② 热情高，能快速融入任何球局 ③ 手感好，敢于尝试高难度技术
**短板：** ① 稳定性差，容易在简单球上失误 ② 不喜欢重复训练，基本功漏洞多
**最佳搭档：** ISFP 救球灵猫：你在前面玩花样，对方在后面把球都救回来；你们都靠感觉打球，享受临场发挥。
**最怕搭档：** ENTJ 战术总指挥：两个人都爱说、都爱变；对方要按计划赢球，你只想打得开心，一个喊战术、一个玩花活，场上容易吵起来。
**球风镜像：陶菲克**（印尼 · 男单 · 已退役）
- 为什么像：他人称“反手之王”，反手杀球威力惊人，网前假动作丰富，“武器库”极其多样，是天赋型花活的代表。
- 核实信息：雅典奥运会男单金牌；2005年世锦赛男单冠军；2013年6月退役。
**成长建议：** ① 每练一个新花活，就同步练一组对应的基本功（比如练反手杀，也练反手高远） ② 比赛中先把开局几分打稳，再考虑“表演”
**口头禅（可选）：** “看我这个！”

---

## 7. Verificación de los espejos (a 2026-09-26)

Regla: el espejo se refiere al **estilo en pista** del jugador, **nunca a su MBTI real ni a su carácter fuera de pista** (ver fila 6 de §1). Pronombres: 她 para las mujeres y 他 para los hombres.

| Tipo | Jugador | Sexo | País | Prueba | Estado | Fuentes |
|---|---|---|---|---|---|---|
| ISTJ | 安洗莹 An Se-young | F | 韩国 | WS | 现役 (n.º 1 el 2026-09-01) | [Wikipedia](https://en.wikipedia.org/wiki/An_Se-young); [Korea JoongAng Daily 2026-08-24](https://www.koreajoongangdaily.com/sports/an-seyoung-conquers-herself-and-the-world/12839347) (título mundial 2026, 21-17 21-14 ante Yamaguchi); estilo: [Strings and Paddles](https://stringsandpaddles.com/an-se-young/) |
| ISFJ | 贾一凡 Jia Yifan | F | 中国 | WD | 现役 (2026 con 张殊贤) | Cita de estilo: [新浪 2026-09-25](https://k.sina.com.cn/article_7879995911_1d5af320706802lm1o.html); oro París: [Wikipedia Chen Qingchen](https://en.wikipedia.org/wiki/Chen_Qingchen); 2026: [腾讯 2026-09-05](https://news.qq.com/rain/a/20260905V07JVN00) |
| ESTJ | 安赛龙 Viktor Axelsen | M | 丹麦 | MS | 已退役 (2026-04-14) | [Wikipedia](https://en.wikipedia.org/wiki/Viktor_Axelsen) (cita su [anuncio en Instagram](https://www.instagram.com/p/DXI8CAgDY_z)); estilo: [Get Good At Badminton](https://getgoodatbadminton.com/viktor-axelsen-badminton-a-player-study) |
| ESFJ | 马林 Carolina Marín | F | 西班牙 | WS | 已退役 (2026-03-26) | [ESPN](https://www.espn.com/espn/story/_/id/48312317/carolina-marin-olympic-world-badminton-champion-retires); los gritos: [Malay Mail 2018-08-03](https://www.malaymail.com/news/sports/2018/08/03/marin-shouts-her-way-into-semis-as-no.1-tai-suffers-shock-loss/1658869); zurda: [Wikipedia](https://en.wikipedia.org/wiki/Carolina_Mar%C3%ADn) |
| ISTP | 傅海峰 Fu Haifeng | M | 中国 | MD | 已退役 (2017, tras los 全运会) | [Wikipedia](https://en.wikipedia.org/wiki/Fu_Haifeng) (332 km/h en la Sudirman 2005, zurdo); [人民网 2017-09-08](http://sports.people.com.cn/n1/2017/0908/c411824-29523230.html) |
| ESTP | 林丹 Lin Dan | M | 中国 | MS | 已退役 (2020-07-04) | [BWF "Lin Dan – An Appreciation" 2020-07-09](https://olympics.bwfbadminton.com/news-single/2020/07/09/lin-dan-an-appreciation); [Wikipedia](https://en.wikipedia.org/wiki/Lin_Dan) |
| ISFP | 山口茜 Akane Yamaguchi | F | 日本 | WS | 现役 | [Wikipedia](https://en.wikipedia.org/wiki/Akane_Yamaguchi) (títulos mundiales 2021/2022/2025, 1,56 m, citas de rivales); subcampeona 2026: JoongAng Daily (arriba) |
| ESFP | 黄东萍 Huang Dongping | F | 中国 | XD | 现役 | Cita de estilo: [《羽毛球》杂志 vía 腾讯 2023-08-30](https://news.qq.com/rain/a/20230830A05R6F00); [Wikipedia](https://en.wikipedia.org/wiki/Huang_Dongping); 2026: [腾讯 2026-09-07](https://news.qq.com/rain/a/20260907V092L000) |
| INTJ | 桃田贤斗 Kento Momota | M | 日本 | MS | Retirado de la selección el 2024-04-18; sigue en el circuito nacional | [Wikipedia](https://en.wikipedia.org/wiki/Kento_Momota) ("strong defence, footwork, patience, and shot quality"; 11 títulos en 2019, Guinness) |
| INTP | 盖德 Peter Gade | M | 丹麦 | MS | 已退役 (2012) | [Wikipedia](https://en.wikipedia.org/wiki/Peter_Gade) ("double action", golpes invertidos; All England 1999; n.º 1 mundial) |
| ENTJ | 郑思维 Zheng Siwei | M | 中国 | XD | 已退役 (anuncio en nov. de 2024; último torneo las WTF de 2024) | [Wikipedia](https://en.wikipedia.org/wiki/Zheng_Siwei); estilo: [新浪 2026-09-22](https://k.sina.com.cn/article_7879995911_1d5af320706802kle2.html) |
| ENTP | 凯文·桑贾亚 Kevin Sanjaya Sukamuljo | M | 印尼 | MD | 已退役 (2024-05-16) | [Wikipedia](https://en.wikipedia.org/wiki/Kevin_Sanjaya_Sukamuljo) (215 semanas seguidas n.º 1 con Gideon; All England 2017/2018; oro en los Juegos Asiáticos 2018; 1,70 m) |
| INFJ | 黄雅琼 Huang Yaqiong | F | 中国 | XD | 已退役 (2025-01-01) | [Wikipedia](https://en.wikipedia.org/wiki/Huang_Yaqiong); estilo: [新浪 2026-09-22](https://k.sina.com.cn/article_7879995911_1d5af320706802kle2.html) |
| INFP | 戴资颖 Tai Tzu-ying | F | 中国台北 | WS | 已退役 (2025-11-07) | [Wikipedia](https://en.wikipedia.org/wiki/Tai_Tzu-ying) (engaño e imprevisibilidad; 214 semanas n.º 1); [zh.Wikipedia](https://zh.wikipedia.org/zh-cn/%E6%88%B4%E8%B3%87%E7%A9%8E) ("2025年11月7日，戴资颖在脸书宣布退役") |
| ENFJ | 陈清晨 Chen Qingchen | F | 中国 | WD | 已退役 (2025) | [Wikipedia](https://en.wikipedia.org/wiki/Chen_Qingchen) (retirada el 26-10-2025; 4 títulos mundiales); estilo: [新浪 2026-09-25](https://k.sina.com.cn/article_7879995911_1d5af320706802lm1o.html) y [爱羽客](https://quanzi.tiyushe.com/article/view.html?id=58245) |
| ENFP | 陶菲克 Taufik Hidayat | M | 印尼 | MS | 已退役 (2013-06-16) | [Wikipedia](https://en.wikipedia.org/wiki/Taufik_Hidayat) ("Mr Backhand"; oro en Atenas 2004; campeón mundial 2005) |

**Balance:**
- 8 mujeres y 8 hombres.
- Países: 中国 7, 丹麦 2, 日本 2, 印尼 2, 韩国 1, 西班牙 1, 中国台北 1.
- Pruebas: individual 9 y dobles 7 (WD 2, MD 2, XD 3).
- Estado: 5 en activo (安洗莹, 贾一凡, 山口茜, 黄东萍 y, fuera del circuito internacional, 桃田贤斗) y el resto retirados.

**Correcciones detectadas al verificar** (errores fáciles de cometer):
- El oro de dobles mixtos de **París 2024** fue para **郑思维/黄雅琼**, no para 黄东萍. 黄东萍 ganó el de **Tokio 2020** con 王懿律.
- **安赛龙** (14-04-2026) y **马林** (26-03-2026) ya están retirados, y **戴资颖** también (07-11-2025).
- 桃田贤斗 dejó la selección japonesa en abril de 2024, pero sigue en competiciones nacionales. Por eso decimos "已退出国际赛场" y no "已退役".

---

## 8. Aviso (texto de la app)

Aviso visible en la portada del test y en el resultado:
> **本测试仅供娱乐，不是心理测评，也不代表你的真实MBTI。结果只描述你此刻在球场上的偏好，多打、多练，你的球场人格也会变。**

Aviso de los espejos, debajo de la tarjeta del jugador:
> 球风镜像只对照职业球员公开可见的场上风格，不代表球员本人的性格或MBTI类型。

Nota de marca (pie de página; ver pregunta abierta 1):
> MBTI® 是 Myers & Briggs Foundation 的注册商标。本测试与其无关，也未获其授权。

---

## 9. Notas de implementación (`src/engine/mbti.ts` y `content/zh/mbti.ts`)

- **Esquema de las preguntas:**
  ```ts
  { id: 'q1', axis: 'EI', options: [{ key: 'a', pole: 'E' }, { key: 'b', pole: 'I' }] }
  ```
  El texto va en `content/zh`, con las claves `mbti.q1.stem`, `mbti.q1.a` y `mbti.q1.b`.
- **Esquema de los tipos:**
  ```ts
  {
    code, group: 'SJ' | 'SP' | 'NT' | 'NF', emoji,
    pro: { id, gender: 'F' | 'M', status: 'active' | 'retired' | 'intlRetired' }
  }
  ```
  El texto va en `content/zh` con las claves `mbti.type.ISTJ.nickname|tagline|desc|strengths[3]|weaknesses[2]|best|worst|proWhy|proFacts|tips[2]|catchphrase`.
- **Parejas:** se calculan con la regla de §5, sin tabla a mano. Solo el motivo es texto.
- **Invariantes para Vitest:**
  1. Cada eje tiene 5 preguntas activas.
  2. No hay empate con ninguna de las 2^20 combinaciones; basta probar que `count ∈ {0..5}` y que el umbral es ≥ 3.
  3. `best(best(x)) == x` y `worst(worst(x)) == x`.
  4. `best(x) != worst(x)`.
  5. Cada código aparece exactamente una vez.
  6. El texto `proWhy`/`proFacts` usa 她 si `gender == 'F'` y 他 si es `'M'`.
  7. Toda descripción tiene entre 80 y 120 caracteres (ver §10).
- **ShareCard:** código + 昵称 + emoji + 一句话 + 4 barras + espejo + mejor pareja. El 口头禅 va si cabe.
- **Guardado:** `MbtiRecord` guarda las 20 respuestas (y qué reservas se usaron), la fecha y la versión del motor. El tipo se recalcula al mostrarlo, como dice la spec §9.

---

## 10. Control de calidad del texto

- Longitud de las descripciones (场上画像): se mide con un script sobre este archivo, contando todos los caracteres sin espacios. Deben quedar en 80–120. Medición del 2026-09-26: las 16 están entre 103 y 119. Con el mismo script se comprobó que las 16 parejas cumplen la regla de §5 y que cada bloque de espejo usa solo el pronombre de su sexo.
- Terminología usada: 高远球, 杀球/重杀, 劈吊, 劈对角, 吊球, 搓球, 勾对角, 推后场, 扑球/封网, 平抽, 接杀, 拉吊, 过渡球, 发接发, 半场高球, 中路球, 轮转 y 回位.
- Cultura de club: 球馆, 约球, 打野球, 球友群, 接龙, 小程序订场, 夜宵, 混双, 借拍 y 穿线/磅数.
