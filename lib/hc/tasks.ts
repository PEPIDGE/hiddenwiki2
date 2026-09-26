// NOTE: import only from server code (route handlers). `answers` must never
// reach the client bundle.
import type { PublicTask, TaskKind } from "./types"

// ============================================================
// HIDDEN COIN — server-side task catalog.
// The `answers` array lives ONLY on the server and is never sent
// to the client. Rewards are granted by /api/hc/claim after a
// server-side answer check, so a player cannot mint coins from
// the browser.
// ============================================================

interface ServerTask extends PublicTask {
  kind: TaskKind
  answers: string[] // accepted, already-normalized answers
}

// Normalise any answer the same way on both sides of the check.
export function normalizeAnswer(raw: string): string {
  return (raw ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.–—]/g, (m) => (m === "." ? "" : "-"))
}

const TASKS: ServerTask[] = [
  // ── MISSIONS (services) — dark-web "contracts" for the side sects ──
  {
    id: "ms-01",
    kind: "mission",
    category: "services",
    title: "Договор: изтеглена карта",
    brief:
      "Посредник, свързан с Примати, иска обратно една дебитна карта, преди Апекс да замрази акаунта. В /leaks/cards има точно една блокирана карта с повтарящи се международни преводи към неустановен получател. Намери я и подай последните 4 цифри.",
    reward: 100,
    difficulty: "MEDIUM",
    requires: ["/hidden-wiki-2/leaks/cards"],
    answerHint: "Последните 4 цифри на блокираната карта с повтарящи се GlobalRemit преводи.",
    answerLabel: "**** ____",
    answers: ["9912"],
  },
  {
    id: "ms-02",
    kind: "mission",
    category: "services",
    title: "Договор: проследяване на дезертьор",
    brief:
      "Страничен кръг търси свой напуснал член. Ще ти трябват три неща от /leaks: сервизен акаунт, който още е активен, паролата му и услугата зад него. В /leaks/passwords намери SERVICE акаунта на призрачния профил (front за фалшиви страници) и подай паролата му.",
    reward: 100,
    difficulty: "HARD",
    requires: ["/hidden-wiki-2/leaks/passwords", "/hidden-wiki-2/leaks/archive"],
    answerHint: "Паролата на SERVICE акаунта 'PageGhost' от /leaks/passwords.",
    answerLabel: "парола",
    answers: ["p@geGh0st2024", "p@geghost2024"],
  },
  {
    id: "ms-03",
    kind: "mission",
    category: "services",
    title: "Договор: чисти следи за крадците",
    brief:
      "Банда крадци на автомобили е обрала автокъща и иска следите ѝ да изчезнат. В /leaks/vehicles три обяви за черно Audi A3 споделят един и същ телефон — това е връзката, която ги издава. Подай споделения телефон, за да маркираш следите за изтриване.",
    reward: 100,
    difficulty: "HARD",
    requires: ["/hidden-wiki-2/leaks/vehicles"],
    answerHint: "Телефонът, който се повтаря на трите обяви за Audi A3.",
    answerLabel: "+359 ...",
    answers: ["+359 88 *** 1221", "+35988***1221", "0888***1221"],
  },
  {
    id: "ms-04",
    kind: "mission",
    category: "services",
    title: "Договор: двойникът в даренията",
    brief:
      "Финансов посредник иска да разбере кой донор крие най-едрото си дарение зад повтарящ се код. В /red-room/donors сортирай по сума — един donor код се появява при най-голямото единично дарение. Подай този код.",
    reward: 90,
    difficulty: "MEDIUM",
    requires: ["/hidden-wiki-2/red-room/donors"],
    answerHint: "Donor кодът при най-високото единично дарение (PRIORITY).",
    answerLabel: "DC-____",
    answers: ["dc-0077", "dc0077"],
  },

  // ── PUZZLES (puzzels) — ciphers & logic ──
  {
    id: "pz-01",
    kind: "puzzle",
    category: "puzzels",
    title: "HEX координата",
    brief:
      "Отвори TRACE-NODE / terminal и декодирай: `decode hex 34322e36393737`. Резултатът е половината от координата. Подай декодираната стойност.",
    reward: 60,
    difficulty: "EASY",
    requires: ["/hidden-wiki-2/trace-node/terminal"],
    answerHint: "ASCII резултатът от hex 34322e36393737.",
    answerLabel: "42.____",
    answers: ["42.6977"],
  },
  {
    id: "pz-02",
    kind: "puzzle",
    category: "puzzels",
    title: "Огледална дума",
    brief:
      "В терминала: `decode reverse RORRIM`. Думата, която получаваш, е ключът към CIRCUIT-3. Подай я.",
    reward: 50,
    difficulty: "EASY",
    requires: ["/hidden-wiki-2/trace-node/terminal"],
    answerHint: "Обърни низа RORRIM.",
    answerLabel: "дума",
    answers: ["mirror"],
  },
  {
    id: "pz-03",
    kind: "puzzle",
    category: "puzzels",
    title: "Повтарящият се телефон",
    brief:
      "В /leaks/vehicles един телефон се появява на повече от една обява и издава връзка. Колко обяви общо споделят този телефон? Подай число.",
    reward: 70,
    difficulty: "MEDIUM",
    requires: ["/hidden-wiki-2/leaks/vehicles"],
    answerHint: "Преброй обявите със същия телефон като черното Audi A3.",
    answerLabel: "число",
    answers: ["3", "три"],
  },
  {
    id: "pz-04",
    kind: "puzzle",
    category: "puzzels",
    title: "ROT-13 подпис",
    brief:
      "В терминала декодирай ROT-13: `decode rot13 ERQSBK`. Резултатът е handle на архитект. Подай го.",
    reward: 55,
    difficulty: "MEDIUM",
    requires: ["/hidden-wiki-2/trace-node/terminal"],
    answerHint: "ROT-13 на ERQSBK.",
    answerLabel: "handle",
    answers: ["redfox"],
  },

  // ── TRIVIA (trivia) — lore quiz about the side sects ──
  {
    id: "tv-01",
    kind: "quiz",
    category: "trivia",
    title: "Сигналът в гората",
    brief:
      "Коя секта приучва членовете си да следват звук на камбана през нощния маршрут, вместо да вземат собствени решения? Подай името на кръга.",
    reward: 30,
    difficulty: "EASY",
    requires: ["/hidden-wiki-2/cult/privichnia-pat"],
    answerHint: "Култ №06 — свободната воля е илюзия.",
    answerLabel: "име на секта",
    answers: [
      "privichnia-pat",
      "кръг на привичния път",
      "привичния път",
      "кръга на привичния път",
    ],
  },
  {
    id: "tv-02",
    kind: "quiz",
    category: "trivia",
    title: "Търгът на срама",
    brief:
      "В коя секта членовете наддават с пари и услуги за правото да 'притежават' срама на кандидата? Подай името.",
    reward: 30,
    difficulty: "EASY",
    requires: ["/hidden-wiki-2/cult/apex"],
    answerHint: "Култ №08 — корпоративен, студен, работи с компромати.",
    answerLabel: "име на секта",
    answers: ["apex", "апекс"],
  },
  {
    id: "tv-03",
    kind: "quiz",
    category: "trivia",
    title: "Седемте врати",
    brief:
      "Коя секта отнема на посветения по нещо на всеки праг — ключове, документи, накрая името му? Подай името.",
    reward: 35,
    difficulty: "MEDIUM",
    requires: ["/hidden-wiki-2/cult/sedmia-prag"],
    answerHint: "Култ №07 — градски маршрути, urbex прикритие.",
    answerLabel: "име на секта",
    answers: [
      "sedmia-prag",
      "братството на седмия праг",
      "седмия праг",
      "седмият праг",
    ],
  },
  {
    id: "tv-04",
    kind: "quiz",
    category: "trivia",
    title: "Последният кадър",
    brief:
      "Коя секта тайно записва зрителите седмици по-рано и им показва самите тях в края на лентата? Подай името.",
    reward: 35,
    difficulty: "MEDIUM",
    requires: ["/hidden-wiki-2/cult/poslednoto-videnie"],
    answerHint: "Култ №10 — повредени ленти, огледала.",
    answerLabel: "име на секта",
    answers: ["poslednoto-videnie", "последното видение"],
  },
]

const TASK_MAP = new Map(TASKS.map((t) => [t.id, t]))

export function getServerTask(id: string): ServerTask | undefined {
  return TASK_MAP.get(id)
}

export function checkAnswer(task: ServerTask, submitted: string): boolean {
  const norm = normalizeAnswer(submitted)
  if (!norm) return false
  return task.answers.some((a) => normalizeAnswer(a) === norm)
}

// Strip the answers before anything reaches the client.
export function toPublicTask(t: ServerTask): PublicTask {
  const { answers: _omit, ...pub } = t
  void _omit
  return pub
}

export function getPublicTasks(): PublicTask[] {
  return TASKS.map(toPublicTask)
}

export function getPublicTasksByCategory(category: PublicTask["category"]): PublicTask[] {
  return TASKS.filter((t) => t.category === category).map(toPublicTask)
}
