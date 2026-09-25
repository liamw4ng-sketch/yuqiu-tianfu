export const meta = {
  name: 'badminton-domain-research',
  description: 'Research verified badminton domain knowledge (pro athletes, sports science, tactics, amateur rating, MBTI) for a Chinese talent-assessment app',
  phases: [
    { title: 'Research', detail: 'six parallel domain researchers write notes/data files' },
    { title: 'Verify', detail: 'adversarial fact-check of athlete data and scientific citations' },
  ],
}

const DIR = args.dir
const TODAY = args.today

const COMMON = `
Context: We are building a mobile-first web app, UI in simplified Chinese (zh-CN), that takes a user's body data (gender, age, height, weight, wingspan, years playing) plus self-rated abilities and recommends a badminton playing style (singles style + doubles role), with pro-athlete "mirrors" (镜像运动员), tactical playbooks, an amateur level rating and a playful "羽球MBTI" quiz. Today is ${TODAY}. Everything must be factually correct as of today.
Tools: load web tools with ToolSearch query "select:WebSearch,WebFetch" and use them heavily. Prefer primary sources (BWF / bwfbadminton.com, Olympics.com, national federations, PubMed/DOI pages, reputable media). Never invent facts, numbers or citations; if you cannot confirm something, mark it as unconfirmed or leave it null.
Write your output file(s) with the Write tool into the directory ${DIR} (it exists). All app-facing text must be natural simplified Chinese using correct Chinese badminton terminology (e.g. 高远球, 杀球, 劈吊, 搓球, 勾对角, 推后场, 扑球, 平抽快挡, 接杀, 米字步, 前三拍, 轮转, 封网). Use she/her (她) for female athletes and he/him (他) for male athletes. Country names use mainland-Chinese media convention (中国, 中国台北, 中国香港, 印尼, 马来西亚, 丹麦, 日本, 韩国, 泰国, 印度, 西班牙, 新加坡, 法国, 加拿大, 英格兰...).
`

const REF_APP = `
Reference app we are improving on (from screenshots; it has errors we must NOT repeat):
- Radar six dims: 爆发力, 耐力, 反应速度, 网前手感, 移动速度, 后场高远 (0-10). Also 球路意识 (tactical awareness) and 心态 (mentality) diagnoses.
- For a 24y female, 163cm/51kg, wingspan 164, 2 years: body profile "矮快型（重心低/步频快）", singles style "⚡防守反击/连贯快速型", doubles role "🗡️网前刺客/前三拍平抽专家".
- Errors seen: doubles section says 网前刺客 but partner advice says "你是后场攻击型→找前场封网型搭档"; doubles mirror recommends 后场 while role is 网前; female athlete Tai Tzu Ying written with 他 and labeled 现役 although retired; claims "身材画像: 矮快型…移动敏捷" while the radar gives 移动速度 low (inconsistent); cites "Stelmach et al. 2024 波兰精英 n=10", "Ibrahim et al. 2024 国家队 BMI 22.8±1.7", "Bidil et al. 2022 国家队体能组成研究", "Zhang & Leng 2023 单打战术差异分析", "Hamdani et al. 2022 4-7-8 呼吸法" without verification.
`

const SUMMARY = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    item_count: { type: 'number' },
    summary: { type: 'string' },
    open_questions: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'summary'],
}

const VERIFY = {
  type: 'object',
  properties: {
    checked: { type: 'number' },
    corrections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: { type: 'string' }, field: { type: 'string' },
          old: { type: 'string' }, new: { type: 'string' }, source: { type: 'string' },
        },
        required: ['item', 'field', 'new'],
      },
    },
    removed_or_unverifiable: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['checked', 'corrections', 'notes'],
}

const ATHLETE_FIELDS = `Each athlete record fields: id (kebab-case latin), name_en, name_zh (the name used by mainland Chinese media, e.g. 安赛龙, 石宇奇, 安洗莹, 陈雨菲, 山口茜, 戴资颖), country_zh, gender ("M"/"F"), height_cm (number), weight_kg (number or null — NEVER guess), handedness ("R"/"L"/null), birth_year, status ("active"/"retired") as of ${TODAY}, retired_year (if retired), highlights_zh (one short line: e.g. 奥运冠军/世锦赛冠军/前世界第一 with years), style_primary (one of: 进攻压制型, 四方拉吊控制型, 防守反击型, 速度突击型, 全面型, 网前技巧型), style_tags_zh (2-4 short tags), style_desc_zh (50-90 字, accurate description of how they actually play, their weapons and weaknesses), signature_skills_zh (2-4 items), sources (URLs actually opened), confidence ({height:"high|medium|low", weight:..., status:...}), notes (discrepancies between sources).`

const TASKS = [
  {
    key: 'singles',
    prompt: `${COMMON}
Task: Build a verified reference database of SINGLES players used as athlete mirrors (the app matches the user by sex, height, BMI and playing style).
Coverage: at least 24 men's singles and 24 women's singles players:
 - the current BWF world top ~15 in MS and WS (as of ${TODAY}; check the latest BWF ranking you can find),
 - plus iconic retired / legendary players who are clear style archetypes (e.g. 林丹, 李宗伟, 陶菲克, 谌龙, 戴资颖, 马林 Carolina Marín, 李雪芮, 王仪涵, 桃田贤斗… verify each one's status),
 - make sure the body range is diverse so any amateur can find a close mirror: short & fast (women ~155-165cm, men ~168-175cm), average, tall & powerful (men 190cm+, women 175cm+), lighter and heavier builds, left-handers.
${ATHLETE_FIELDS}
Cross-check height between at least two sources where possible (BWF profile, Olympics.com, Wikipedia zh/en, federation). Retirement status is critical: search recent 2025-2026 news for EVERY player (e.g. Tai Tzu Ying, Carolina Marín, Kento Momota, Viktor Axelsen, Chen Long, Lee Zii Jia, Ratchanok...).
Write a JSON object {"updated": "${TODAY}", "athletes": [...]} (UTF-8, pretty printed) to ${DIR}/athletes_singles.json.
Return files, item_count, a short summary, and open_questions (anything you could not confirm).`,
    verify: `${COMMON}
You are an adversarial fact-checker. Open ${DIR}/athletes_singles.json. Assume every record may contain an error. For EACH athlete independently re-verify with fresh web searches (do not trust the listed sources blindly): Chinese name as used by mainland media, nationality, sex, height, weight, handedness, birth year, active/retired status as of ${TODAY} (search 2025-2026 retirement news), highlights (titles/years), and whether style_desc_zh is a fair description (pronoun 她 for women, 他 for men).
Fix errors IN PLACE in the JSON file (keep the same structure). Set weight_kg to null when no reliable source exists. Remove any athlete whose identity/key facts cannot be confirmed. Add to each record "verified": true/false and "verification_note".
Return the list of corrections you made.`,
  },
  {
    key: 'doubles',
    prompt: `${COMMON}
Task: Build a verified reference database of DOUBLES pairs (MD, WD, XD) used as doubles mirrors. The app tells the user whether they suit 前场(网前) or 后场 in doubles and shows a pair plus which member of the pair matches the user.
Coverage: at least 10 men's doubles, 10 women's doubles and 10 mixed doubles pairs: the current top pairs by BWF ranking as of ${TODAY} (pairings change often — verify each pairing is current, e.g. Korean and Chinese pairs have been reshuffled), plus a few legendary pairs useful as archetypes (e.g. 傅海峰/蔡赟, 张楠/赵芸蕾, 郑思维/黄雅琼, Kevin Sukamuljo/Marcus Gideon, 陈清晨/贾一凡 — verify statuses).
For each pair: id, event ("MD"/"WD"/"XD"), pair_name_zh (e.g. 梁伟铿/王昶), pair_name_en, country_zh, status ("active"/"retired"/"split") as of ${TODAY}, highlights_zh, pair_style_zh (60-100 字: how they win, how front/back duties are split), and players: [ two player records with fields: name_en, name_zh, gender, height_cm, weight_kg (or null — never guess), handedness, birth_year, typical_position ("front"|"back"|"both" — who usually plays 网前 vs 后场 in attack rotation; justify in position_note_zh), role_desc_zh (40-70 字) ], sources (URLs actually opened), confidence, notes.
Write {"updated": "${TODAY}", "pairs": [...]} to ${DIR}/athletes_doubles.json (UTF-8, pretty printed).
Return files, item_count, summary, open_questions.`,
    verify: `${COMMON}
You are an adversarial fact-checker. Open ${DIR}/athletes_doubles.json. Assume every record may contain an error. For EACH pair independently re-verify with fresh web searches: that the pairing exists and its status as of ${TODAY} (active / split / retired — check 2025-2026 news), Chinese names, nationality, each player's height/weight/handedness/birth year, highlights (titles/years), and whether the front/back position assignment matches how they actually play (commentary, match analysis).
Fix errors IN PLACE (same structure). Set weight_kg null if unreliable. Remove pairs whose key facts cannot be confirmed. Add "verified": true/false and "verification_note" to each pair.
Return the corrections you made.`,
  },
  {
    key: 'science',
    prompt: `${COMMON}
${REF_APP}
Task: Sports-science evidence base for the app.
1) Verify each citation used by the reference app (Stelmach 2024, Ibrahim 2024, Bidil 2022, Zhang & Leng 2023, Hamdani 2022): does it exist? exact authors, title, journal, year, DOI/URL, sample, what it actually found, and whether the reference app's usage is accurate.
2) Collect 15-25 REAL, opened-and-confirmed peer-reviewed sources on: elite badminton anthropometrics (height, weight, BMI, body fat by sex and by event singles vs doubles), wingspan/arm span and reach, singles vs doubles physiological demands (rally duration, work:rest ratio, shots per rally, heart rate, energy systems), movement/footwork demands and lunges, reaction/anticipation in badminton, jump & explosive power (smash, jump smash, CMJ values of elite players), age and performance peak / masters players, injury risk factors (age, BMI, training load), doubles front/back court differences, psychological skills (breathing techniques, pre-performance routines, cue words, self-talk).
3) Benchmark norms usable to convert amateur self-tests into 1-10 scores, by sex (and age band when available): countermovement jump / vertical jump, standing long jump, 20 m shuttle run (beep test) or 12-min run, 1-min rope skipping (跳绳), badminton-specific agility (e.g. 四角/六点米字步 timing), simple reaction time (ruler drop test). Give numeric tables with the source for each.
4) Evidence-based rules for the app: typical elite BMI ranges by sex, what "ape index" (arm span − height) values mean, how age bands (≤17, 18-30, 31-40, 41-50, 51+) affect trainability/injury advice.
Write everything to ${DIR}/sports_science.md with a citation table (authors, year, title, journal, DOI/URL, verified yes/no, key finding in Chinese, how the app can use it). Only include citations you actually opened and confirmed.
Return files, item_count (number of confirmed citations), summary, open_questions.`,
    verify: `${COMMON}
You are an adversarial citation checker. Open ${DIR}/sports_science.md. For EVERY citation in it, independently search (PubMed, Google Scholar, DOI resolver, journal site) and confirm: it exists, authors/year/title/journal/DOI are exact, and the "key finding" statement matches the actual abstract/results (numbers included). Also re-check the numeric norm tables against their sources.
Fix errors IN PLACE; delete citations that do not exist or cannot be confirmed; soften any overstated claims. Append a section "## 核查记录" listing what you changed.
Return the corrections you made.`,
  },
  {
    key: 'tactics',
    prompt: `${COMMON}
${REF_APP}
You are a veteran badminton coach and match analyst with national-team-level tactical knowledge who has studied thousands of professional and amateur matches. Produce the knowledge base for the style-recommendation engine, in simplified Chinese, concrete and practical (no fluff):
1) 身材画像 body archetypes (6-8): e.g. 高大力量型, 瘦高长臂型, 矮快型(重心低/步频快), 均衡型, 敦实力量型, 轻盈灵巧型… Give measurable definitions (height relative to sex-specific norms, BMI bands, ape index = 臂展−身高), and their natural on-court advantages and disadvantages grounded in biomechanics (lever length, reach, first-step, center of gravity, recovery). Also age-band notes and experience-band notes (新手<1年 should focus on fundamentals).
2) Singles style taxonomy (6 archetypes): 进攻压制型, 四方拉吊控制型, 防守反击型, 速度突击型, 全面型, 网前技巧型 (rename/adjust if a better taxonomy exists). For each: emoji, tagline, prerequisites on the six dims (爆发力, 耐力, 反应速度, 网前手感, 移动速度, 后场高远) + 球路意识 + 心态 + body, 契合度 reasoning templates, 核心战术, 开局策略, 中局控制, 关键分处理, 体能分配, 技术重点 (key strokes), 常见误区, 克制关系 (what beats it / what it beats), 3-5 training drills with concrete sets/reps/duration, representative players (men and women).
3) Doubles roles: 前场封网型(网前), 后场攻击型, 全能轮转型, 防守反击型 (adjust if needed), for 男双/女双/混双 (混双 conventions: 女前男后, when it flips). For each: prerequisites, 契合度 reasoning, 核心战术, 轮转时机, 站位原则 and 站位禁忌, 沟通暗号, 搭档互补 (ideal partner profile — MUST be consistent with the user's own role), training drills, representative players.
4) Mapping rules: how to go from (sex, age, height, weight/BMI, wingspan/ape index, years played, six dims 1-10, 球路意识, 心态, handedness, preferred format) to (a) body archetype, (b) singles style with a fit score and top-2 alternatives, (c) doubles role with fit score. Write it as explicit weighted formulas or if-then rules with thresholds, plus how to resolve contradictions (e.g. short but big rear-court power; tall but slow). Ensure the chosen body archetype text never contradicts the radar values (e.g. do not say "移动敏捷" when 移动速度 is low — instead say "身材有利于…但目前移动速度未兑现").
5) Diagnosis text banks: for each of the six dims, 球路意识 and 心态, give 3 levels (偏弱 1-3, 中等 4-6, 突出 7-10) with a diagnosis sentence and 1-2 concrete training suggestions each.
6) List every error/inconsistency you see in the reference app output and how our app should avoid it.
Write to ${DIR}/tactics_styles.md.
Return files, item_count, summary, open_questions.`,
  },
  {
    key: 'rating',
    prompt: `${COMMON}
Task: "业余评级" (amateur level rating) module research + design.
1) Research real amateur level systems: whether 中国羽毛球协会 has an official amateur grading standard (e.g. 《羽毛球运动水平等级标准》/ 业余等级 / 社会体育等级评定 — verify names, year, levels), the common Chinese community scales (e.g. 业余1-10级 / 小白→入门→初级→中级→中高级→高级→准专业 / "业余一二三级"), and international analogues (Badminton England / Badminton Canada / USA grading, Japanese 級/段位, BWF Shuttle Time levels, club rating systems like BadmintonRating, Playtomic-style ratings). Summarize with sources.
2) Design our level scale (7-9 levels, each with Chinese name, short code, 1-line tagline, detailed "该水平能做到什么" (stroke-by-stroke checkable behaviours), typical match results, what to train next).
3) Design a self-assessment question bank of 16-20 multiple-choice questions (each 4-5 options, each option scored), covering: 发球(正反手、发球质量), 高远球能否到底线, 杀球力量/角度, 吊球/劈吊, 网前(搓/勾/推/扑), 接杀防守, 步法(米字步/启动回位), 平抽快挡, 双打轮转意识, 战术意识(调动/线路), 比赛经验(参赛级别/成绩), 球龄与训练频率(是否接受过系统训练), 体能(一场能打几局). Include the scoring → level mapping, plus consistency checks (e.g. claims "can smash to floor from baseline" but "cannot clear to baseline" → flag). Options must be observable behaviours, not vague self-praise.
Write to ${DIR}/amateur_rating.md (all app-facing text in simplified Chinese).
Return files, item_count, summary, open_questions.`,
  },
  {
    key: 'mbti',
    prompt: `${COMMON}
Task: "羽球MBTI" module design. Look at what 羽毛球MBTI / 羽球人格 content exists on the Chinese internet (小红书, 知乎, 抖音, B站) for inspiration and tone (cite what you find), then design our own original version:
1) Four badminton dichotomies (either adapted E/I, S/N, T/F, J/P with badminton meaning, or badminton-native axes like 攻A/守D, 快Q/控C, 网前N/后场B, 直觉I/计划P — choose the better, explain why), each with clear definition.
2) 20-28 scenario questions set on court (e.g. "20:20 关键分, 对手发网前球, 你会…"), each with 2 options (or 4 options with weights) mapping to an axis, balanced across axes, fun and specific to badminton culture in China (球馆, 约球, 打野球, 混双, 球友群...).
3) 16 types: 4-letter code, Chinese nickname (catchy, e.g. 网前刺客, 底线炮台, 拉吊艺术家…), emoji, 1-line tagline, 80-120 字 personality-on-court description, 3 strengths, 2 weaknesses, best partner type and worst partner type (with reason), a pro player whose style matches (verify the player facts you mention; use 她 for women), and 2 growth tips.
4) A disclaimer line (entertainment, not psychometrics).
Write to ${DIR}/badminton_mbti.md (app-facing text in simplified Chinese).
Return files, item_count, summary, open_questions.`,
  },
]

const results = await pipeline(
  TASKS,
  t => agent(t.prompt, { label: `research:${t.key}`, phase: 'Research', schema: SUMMARY }),
  (r, t) => t.verify
    ? agent(t.verify, { label: `verify:${t.key}`, phase: 'Verify', schema: VERIFY }).then(v => ({ key: t.key, research: r, verification: v }))
    : ({ key: t.key, research: r }),
)

return results.map((r, i) => r || { key: TASKS[i].key, failed: true })
