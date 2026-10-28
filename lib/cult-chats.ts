import { SIDE_MEMBER_PROFILES } from "@/lib/cult-members"

export interface CultChatOwner {
  handle: string
  displayName: string
  statusLine: string
}

export interface CultChatMember {
  username: string
  password: string
  displayName: string
  role: string
  statusLine: string
}

export interface CultChatMessage {
  id: string
  time: string
  author: string
  text: string
  highlighted?: boolean
  deleted?: boolean
  recoveredText?: string
}

export interface CultChatConversation {
  id: string
  title: string
  kind: "direct" | "group"
  participants: string[]
  lastActivity: string
  unread: number
  messages: CultChatMessage[]
  channel?: string
  integrity?: string
  summary?: string
}

export interface CultCallEntry {
  id: string
  timestamp: string
  direction: "IN" | "OUT" | "MISSED" | "RELAY"
  number: string
  contact: string
  duration: string
  cell: string
  note: string
  clue?: string
  flagged?: boolean
}

export interface GpsTokenFragment {
  id: string
  issuer: string
  subject: string
  coordinates: string
  timestamp: string
  fragment: string
  integrity: number
  note: string
  clue: string
}

export interface CultChatArchive {
  cultSlug: string
  owner: CultChatOwner
  access: "password" | "snapshot"
  captureNote: string
  conversations: CultChatConversation[]
  callLog?: CultCallEntry[]
  gpsToken?: GpsTokenFragment
}

const MEMBER_OVERRIDES: Record<string, Partial<CultChatMember>> = {
  GothGirl: {
    password: "g0th.g1rl!26",
    displayName: "GothGirl",
    role: "ОПЕРАТОР / СОЦИАЛЕН ДОСТЪП",
    statusLine: "паролата е сменена след публичния dump",
  },
}

function makeMemberPassword(username: string, cultSlug: string) {
  const cleanName = username.replace(/[^a-zA-Z0-9]/g, "").slice(0, 7) || "member"
  const cleanCult = cultSlug.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4) || "cult"
  return `${cleanName}_${cleanCult}17`
}

// Every archive exposes one compromised profile only. Other names remain chat
// participants, not accounts the player can select or impersonate.
export function getCultChatMembers(archive: CultChatArchive): CultChatMember[] {
  const username = archive.owner.handle
  const override = MEMBER_OVERRIDES[username] ?? {}
  const profile = SIDE_MEMBER_PROFILES[archive.cultSlug]?.[username]

  return [{
    username,
    password: override.password ?? makeMemberPassword(username, archive.cultSlug),
    displayName: override.displayName ?? profile?.displayName ?? archive.owner.displayName,
    role: override.role ?? profile?.role ?? "КОМПРОМЕТИРАН ПРОФИЛ",
    statusLine: override.statusLine ?? profile?.statusLine ?? archive.owner.statusLine,
  }]
}

const deleted = (
  id: string,
  time: string,
  author: string,
  recoveredText: string,
  options: Pick<CultChatMessage, "highlighted"> = {},
): CultChatMessage => ({
  id,
  time,
  author,
  text: "[СЪОБЩЕНИЕТО Е ИЗТРИТО]",
  deleted: true,
  recoveredText,
  ...options,
})

export const CULT_CHAT_ARCHIVES: Record<string, CultChatArchive> = {
  "bratstvoto-na-tretoto-probuzhdane": {
    cultSlug: "bratstvoto-na-tretoto-probuzhdane",
    owner: {
      handle: "GothGirl",
      displayName: "GothGirl",
      statusLine: "оператор / социално инженерство / огледален достъп",
    },
    access: "password",
    captureNote: "Жив архив. Нужни са актуалните данни на GothGirl; старата парола от LEAKS е невалидна.",
    conversations: [
      {
        id: "borrowed-heart",
        title: "t_borisov / не казвай на Лора",
        kind: "direct",
        participants: ["GothGirl", "t_borisov"],
        channel: "dm/velvet-12",
        integrity: "97%",
        lastActivity: "2025-10-15 21:46",
        unread: 2,
        summary: "Личен канал, започнал три седмици преди изчезването.",
        messages: [
          { id: "01", time: "27.09 / 00:18", author: "GothGirl", text: "Когато тя те игнорира, не я гони. Прати ми какво е написала и аз ще ти кажа как да отговориш." },
          { id: "02", time: "27.09 / 00:23", author: "t_borisov", text: "Не искам да я манипулирам. Искам пак да ми вярва." },
          { id: "03", time: "27.09 / 00:26", author: "GothGirl", text: "Това е същото, ако го направиш правилно." },
          { id: "04", time: "08.10 / 19:41", author: "t_borisov", text: "Пратих ти снимката на поканата. Тя хареса символа, но пита кой ще е там." },
          { id: "05", time: "08.10 / 19:44", author: "GothGirl", text: "Кажи, че е арт вечер и че ти няма да идваш. Ако знае, че ревнуваш, ще отиде напук." },
          { id: "06", time: "12.10 / 09:07", author: "t_borisov", text: "Откъде знаеше адреса ѝ? Аз не съм ти го давал." },
          { id: "07", time: "12.10 / 09:11", author: "GothGirl", text: "Давал си ми повече, отколкото помниш. Спри да четеш назад." },
          { id: "08", time: "15.10 / 21:37", author: "GothGirl", text: "Напиши ѝ: „слез след десет минути, изпратих ти кола“. Точно така. Без емоджи.", highlighted: true },
          { id: "09", time: "15.10 / 21:41", author: "t_borisov", text: "Тя мисли, че колата е от мен. Кой кара?" },
          { id: "10", time: "15.10 / 21:46", author: "GothGirl", text: "Човек, който не задава въпроси. Изтрий този разговор и ѝ се обади чак утре.", highlighted: true },
        ],
      },
      {
        id: "redfox-private",
        title: "RedFox / чашата",
        kind: "direct",
        participants: ["GothGirl", "RedFox"],
        channel: "dm/f0x-den",
        integrity: "91%",
        lastActivity: "2025-10-14 03:02",
        unread: 4,
        summary: "Разговорът изглежда личен. Медицинските думи никога не са обяснени.",
        messages: [
          { id: "01", time: "04.10 / 02:08", author: "GothGirl", text: "Пак изпусна чашата пред Съвета. Войводата го видя." },
          { id: "02", time: "04.10 / 02:10", author: "RedFox", text: "Ръкавът я закачи." },
          { id: "03", time: "04.10 / 02:13", author: "GothGirl", text: "Ръкавът не ти движи рамото, когато мислиш, че никой не гледа." },
          { id: "04", time: "09.10 / 16:32", author: "RedFox", text: "Резултатът пак е над четирийсет. Не пиши числото тук." },
          { id: "05", time: "09.10 / 16:36", author: "GothGirl", text: "CAG не е присъда. Лекарката каза ли колко време?" },
          { id: "06", time: "09.10 / 16:42", author: "RedFox", text: "Не време. Етапи. Баща ми започна с чашите, после не можеше да държи ключ, после забрави лицата." },
          { id: "07", time: "13.10 / 23:51", author: "GothGirl", text: "Тетрата скрива движенията, но те прави бавен. Не можеш да водиш Третия зов така." },
          { id: "08", time: "13.10 / 23:56", author: "RedFox", text: "Мога да водя достатъчно дълго." },
          { id: "09", time: "14.10 / 02:49", author: "GothGirl", text: "Затова ли бързаш с 15-и? Искаш наследник преди останалите да разберат." },
          { id: "10", time: "14.10 / 02:54", author: "RedFox", text: "Искам структура, която ще продължи, когато аз започна да греша имената.", highlighted: true },
          { id: "11", time: "14.10 / 03:02", author: "RedFox", text: "Ако кажеш на Съвета, първо ще изчезне досието. После ти." },
        ],
      },
      {
        id: "wake-council",
        title: "Съвет / кой наследява Лисицата",
        kind: "group",
        participants: ["GothGirl", "RedFox", "Black-Voyvoda", "DataCracker6", "ToxicBabe"],
        channel: "council/third-call",
        integrity: "88%",
        lastActivity: "2025-10-15 18:19",
        unread: 6,
        summary: "Скрита борба за контрол, маскирана като спор за операцията.",
        messages: [
          { id: "01", time: "13.10 / 18:02", author: "ToxicBabe", text: "GothGirl получава целите, Войводата получава хората, а аз научавам последна. Това ли е Съвет?" },
          { id: "02", time: "13.10 / 18:07", author: "Black-Voyvoda", text: "Ти получаваш публика. Не бъркай аплодисменти с ранг." },
          { id: "03", time: "13.10 / 18:12", author: "GothGirl", text: "Поне моята публика идва сама." },
          { id: "04", time: "13.10 / 18:15", author: "RedFox", text: "Достатъчно. След 15-и ще пренаредя достъпа." },
          { id: "05", time: "13.10 / 18:19", author: "DataCracker6", text: "Кой подписва, ако ти не си онлайн? Последните ти паузи вече са по седем минути." },
          { id: "06", time: "13.10 / 18:21", author: "RedFox", text: "Системата подписва. Не ми измервай тишината." },
          { id: "07", time: "15.10 / 18:03", author: "Black-Voyvoda", text: "NightKiller иска двойна сума. Казва, че маршрутът е сменен след уговорката." },
          { id: "08", time: "15.10 / 18:08", author: "ToxicBabe", text: "Нека откаже. Имам нещо, което ще го върне зад волана." },
          { id: "09", time: "15.10 / 18:12", author: "GothGirl", text: "Какво имаш?" },
          { id: "10", time: "15.10 / 18:19", author: "ToxicBabe", text: "Застраховка. Само той още не знае, че участва във филм.", highlighted: true },
        ],
      },
      {
        id: "toxic-night-cache",
        title: "[ORPHAN CACHE] ToxicBabe ↔ NightKiller",
        kind: "direct",
        participants: ["ToxicBabe", "NightKiller"],
        channel: "shadow/dm-09",
        integrity: "31% / DELETED",
        lastActivity: "2025-10-16 00:07",
        unread: 8,
        summary: "Неприкачен индекс от чужд разговор. Всички payload-и са изтрити.",
        messages: [
          deleted("01", "15.10 / 18:31", "NightKiller", "Няма да карам, докато не кажеш кой седи отзад след първата спирка."),
          deleted("02", "15.10 / 18:34", "ToxicBabe", "Ще караш. Имам записа от 21 септември — лицето ти, колата ти и момичето, което не може да отвори задната врата."),
          deleted("03", "15.10 / 18:36", "NightKiller", "Каза, че камерата е била изключена."),
          deleted("04", "15.10 / 18:38", "ToxicBabe", "Официалната беше. Моята не беше. Файлът ми е VID_2109_REAR-A3.mp4 — 00:17, задната врата на черния Audi и лицето ти. Самият файл не е останал в този архив, само текстовият индекс."),
          deleted("05", "15.10 / 18:44", "ToxicBabe", "Ако в 22:09 не си пред блока, клипът и името Димитър Миланов отиват в полицията.", { highlighted: true }),
          deleted("06", "15.10 / 18:49", "NightKiller", "Ти ми пращаш момичето долу. После камерата хваща само мен. Това е капан."),
          deleted("07", "16.10 / 00:02", "ToxicBabe", "Капан е само ако решиш да излезеш. В записа изглеждаш като човек, който е планирал всичко."),
          deleted("08", "16.10 / 00:07", "NightKiller", "Запази си филма. Ако падна, казвам кой даде маршрута и кой чакаше в западното крило.", { highlighted: true }),
        ],
      },
      {
        id: "after-zero",
        title: "След 00:00 / версии",
        kind: "group",
        participants: ["GothGirl", "ToxicBabe", "DataCracker6"],
        channel: "ops/afterimage",
        integrity: "84%",
        lastActivity: "2025-10-16 01:22",
        unread: 3,
        summary: "Екипът подготвя няколко взаимно изключващи се версии.",
        messages: [
          { id: "01", time: "16.10 / 00:48", author: "DataCracker6", text: "Пуснах вход към Кремиковци, втори към яхтен клуб и трети към клиниката. И трите имат валиден на вид token." },
          { id: "02", time: "16.10 / 00:53", author: "GothGirl", text: "Кой ще изглежда най-виновен?" },
          { id: "03", time: "16.10 / 00:57", author: "ToxicBabe", text: "Шофьорът. Хората обичат престъпление с едно лице." },
          { id: "04", time: "16.10 / 01:03", author: "DataCracker6", text: "GridWalker продаде стар signing key. Фалшивият fragment ще мине през евтин анализатор." },
          { id: "05", time: "16.10 / 01:09", author: "GothGirl", text: "А през добър?" },
          { id: "06", time: "16.10 / 01:22", author: "DataCracker6", text: "Ще види, че часовият nonce е повторен. Но дотогава вече ще има три истории.", highlighted: true },
        ],
      },
    ],
    callLog: [
      { id: "CALL-001", timestamp: "2025-10-15 20:41:08", direction: "OUT", number: "+359 88 000 2074", contact: "T. BORISOV / saved: TEO", duration: "04:12", cell: "SOF-CELL 14B", note: "След разговора профилът t_borisov изпраща готовия текст на Лора.", clue: "GothGirl говори 4:12 мин. с Т. Борисов в 20:41 — по-малко от час преди той да подмами Лора да слезе.", flagged: true },
      { id: "CALL-002", timestamp: "2025-10-15 21:58:31", direction: "RELAY", number: "+359 88 412 1221", contact: "NIGHTKILLER / relay alias D.M.", duration: "00:38", cell: "SOF-CELL 14B", note: "Еднократен relay. Същият номер присъства в последния изходящ опит на Лора.", clue: "+359 88 412 1221 е relay на NightKiller; активен е в клетката при блока на Лора в 21:58.", flagged: true },
      { id: "CALL-003", timestamp: "2025-10-15 22:09:14", direction: "IN", number: "+359 88 000 0311", contact: "TOXICBABE", duration: "00:11", cell: "SOF-CELL 14B", note: "Глас няма. DTMF: 2-2-1. Вероятен сигнал „колата е на място“." },
      { id: "CALL-004", timestamp: "2025-10-15 22:12:06", direction: "MISSED", number: "+359 88 000 1414", contact: "L.K. / unknown at capture", duration: "00:00", cell: "SOF-CELL 14B → DROP", note: "Входящото обаждане прекъсва преди handshake. Устройството изчезва от мрежата 19 секунди по-късно.", clue: "GothGirl има пропуснато обаждане от L.K. в 22:12; 19 секунди по-късно устройството на Лора изчезва от мрежата.", flagged: true },
      { id: "CALL-005", timestamp: "2025-10-15 22:15:42", direction: "OUT", number: "+359 88 000 9090", contact: "BLACK-VOYVODA", duration: "01:33", cell: "SOF-IND WEST", note: "Клетката е близо до западното крило. Няма запис на съдържанието." },
      { id: "CALL-006", timestamp: "2025-10-16 03:14:20", direction: "OUT", number: "+359 2 000 4044", contact: "GENETIC COUNSELLING / night desk", duration: "06:09", cell: "SOF-IND WEST", note: "Номерът е записан от RedFox като „R-44“. GothGirl го набира след последното му съобщение.", clue: "В 03:14 GothGirl звъни на кабинет по генетично консултиране, записан от RedFox като R-44.", flagged: true },
    ],
    gpsToken: {
      id: "GPS-FRAG-7F3A",
      issuer: "GridWalker / Пастирите на Тихия брод",
      subject: "NK-A3-15",
      coordinates: "42.71184, 23.50391",
      timestamp: "2025-10-15T22:34:18+03:00",
      fragment: "eyJub2RlIjoiQlctRkVSUlktMDMiLCJub25jZSI6IjE1MTA…7F3A",
      integrity: 41,
      note: "Подписът е оттеглен на 02.10. Nonce 1510 вече е използван в тестов пакет. Координатите изглеждат валидни, произходът — не.",
      clue: "GPS-FRAG-7F3A сочи NightKiller към Кремиковци в 22:34, но е издаден от GridWalker с оттеглен ключ и повторен nonce — вероятен decoy/replay token.",
    },
  },

  "horat-na-vtoroto-nebe": {
    cultSlug: "horat-na-vtoroto-nebe",
    owner: { handle: "GoldVeil", displayName: "Весела Д.", statusLine: "диригент / стая 4" },
    access: "snapshot",
    captureNote: "Сесия GoldVeil, уловена при синхронизация на приемника. Само този профил е четим.",
    conversations: [
      {
        id: "lora-array", title: "LORA-17 / приемникът", kind: "group", participants: ["GoldVeil", "QuietCrate", "MoraWhisper"], lastActivity: "2025-10-15 02:55", unread: 3, channel: "signal/17", integrity: "79%", summary: "Заглавието прилича на име. Техническите редове разказват друга история.",
        messages: [
          { id: "01", time: "14.10 / 23:48", author: "QuietCrate", text: "LORA-17 е натоварена. Ако я преместим след 02:00, никой няма да види антената.", highlighted: true },
          { id: "02", time: "14.10 / 23:55", author: "GoldVeil", text: "В стая 4. Там хората ще чуят глас, преди да видят машината." },
          { id: "03", time: "15.10 / 02:12", author: "MoraWhisper", text: "Пакетите пристигат през 868 MHz. Мога да сложа гласа между тях." },
          { id: "04", time: "15.10 / 02:21", author: "QuietCrate", text: "В инвентара да пиша ли LoRa Array или само L-17?" },
          { id: "05", time: "15.10 / 02:25", author: "GoldVeil", text: "Само L-17. Имената карат любопитните да си измислят човек." },
          { id: "06", time: "15.10 / 02:55", author: "MoraWhisper", text: "Пробата е готова. „Мамо, не затваряй прозореца“ звучи като сигнал, не като запис." },
        ],
      },
      {
        id: "water-revolt", title: "WhiteGauze / 11 часа без вода", kind: "direct", participants: ["GoldVeil", "WhiteGauze"], lastActivity: "2025-10-14 04:22", unread: 1, channel: "dm/medic", integrity: "96%", summary: "Медикът оспорва метода на Диригента.",
        messages: [
          { id: "01", time: "14.10 / 03:51", author: "WhiteGauze", text: "Ембър не е приемник. Той е обезводнен и чува брат си, защото вие пускате записа му зад стената." },
          { id: "02", time: "14.10 / 03:58", author: "GoldVeil", text: "Скръбта настройва по-добре от всяка антена." },
          { id: "03", time: "14.10 / 04:05", author: "WhiteGauze", text: "Ако още веднъж заключите водата, изпращам температурните листове на семействата." },
          { id: "04", time: "14.10 / 04:22", author: "GoldVeil", text: "Тогава ще чуят как близките им молят да останат. Имаме глас за всеки.", highlighted: true },
        ],
      },
      {
        id: "inheritance", title: "Нулев хор / имоти", kind: "group", participants: ["GoldVeil", "InkSomnus", "DeepMute"], lastActivity: "2025-10-16 00:31", unread: 2, channel: "choir/zero", integrity: "93%", summary: "Даренията са входният билет за обещаната евакуация.",
        messages: [
          { id: "01", time: "15.10 / 23:59", author: "InkSomnus", text: "Трима подписаха имотите. Четвъртата иска да остави стая на дъщеря си." },
          { id: "02", time: "16.10 / 00:08", author: "GoldVeil", text: "На Второто небе няма стаи. Нека избере: дъщеря или място в хора." },
          { id: "03", time: "16.10 / 00:19", author: "DeepMute", text: "А ако Тихият прозорец не дойде?" },
          { id: "04", time: "16.10 / 00:31", author: "GoldVeil", text: "Тогава ще го обявим за отложен. Имотите вече ще са наши.", highlighted: true },
        ],
      },
    ],
  },

  "institut-na-chistata-formula": {
    cultSlug: "institut-na-chistata-formula",
    owner: { handle: "UmbraSix", displayName: "Ирина С.", statusLine: "директор / дозов регистър" }, access: "snapshot", captureNote: "Read-only образ на директорския профил UmbraSix. Част от лабораторните индекси са подменени.",
    conversations: [
      { id: "lk14", title: "LK-14 / реакция в стая 9", kind: "group", participants: ["UmbraSix", "NadirCall", "TideLedger"], lastActivity: "2025-10-15 23:17", unread: 4, channel: "trial/white-dose", integrity: "72%", summary: "Инициалите и стаята съвпадат тревожно с основния случай.", messages: [
        { id: "01", time: "15.10 / 22:38", author: "NadirCall", text: "LK-14 е в стая 9. Пулс 132, треморът не спира.", highlighted: true },
        { id: "02", time: "15.10 / 22:42", author: "UmbraSix", text: "Премахни името. Остави само индекса и „доброволна реакция“." },
        { id: "03", time: "15.10 / 22:49", author: "TideLedger", text: "Индексът започва с LK, защото е лабораторен комплект, не пациент. Одитът ще го види." },
        { id: "04", time: "15.10 / 22:55", author: "UmbraSix", text: "Одитът вижда каквото сравни. Дай му само публичната таблица." },
        { id: "05", time: "15.10 / 23:17", author: "NadirCall", text: "За протокола: комплект LK-14 е приложен на пациент F-203. Името не е Лора." },
      ] },
      { id: "formula-war", title: "TideLedger / мъртвият ред", kind: "direct", participants: ["UmbraSix", "TideLedger"], lastActivity: "2025-10-13 05:04", unread: 1, channel: "dm/ledger", integrity: "98%", summary: "Директорът и архиварят спорят за прикрит нежелан ефект.", messages: [
        { id: "01", time: "13.10 / 04:31", author: "TideLedger", text: "Не мога трети път да превърна спешен прием в „доброволно напускане“. Лекарят пази копия." },
        { id: "02", time: "13.10 / 04:37", author: "UmbraSix", text: "Тогава промени лекаря, не реда." },
        { id: "03", time: "13.10 / 04:48", author: "TideLedger", text: "Ти обеща Формулата да е разредена след първия гърч." },
        { id: "04", time: "13.10 / 05:04", author: "UmbraSix", text: "Обещанието беше към теб. Дозата беше към бъдещите инвеститори.", highlighted: true },
      ] },
      { id: "panic-seed", title: "Остатък / публична паника", kind: "group", participants: ["UmbraSix", "PhaseClerk", "EclipseWard"], lastActivity: "2025-10-17 09:12", unread: 2, channel: "public/launch", integrity: "94%", summary: "Институтът планира епидемия от фалшиви резултати.", messages: [
        { id: "01", time: "17.10 / 08:40", author: "PhaseClerk", text: "Имаме 600 положителни резултата от 43 реални проби." },
        { id: "02", time: "17.10 / 08:46", author: "EclipseWard", text: "Форумите вече питат къде се купува Бялата доза." },
        { id: "03", time: "17.10 / 08:59", author: "UmbraSix", text: "Пуснете първо недостига. Лекарство без страх е просто продукт." },
        { id: "04", time: "17.10 / 09:12", author: "UmbraSix", text: "Когато градът поиска Формулата, никой няма да пита кой е измислил Остатъка.", highlighted: true },
      ] },
    ],
  },

  "tihia-brod": {
    cultSlug: "tihia-brod",
    owner: { handle: "GridWalker", displayName: "Пламен Ч.", statusLine: "карти / фалшиви транзитни точки" }, access: "snapshot", captureNote: "Map cache на GridWalker. Профилът е HOPS=2 и вероятно е продавал достъп на други организации.",
    conversations: [
      { id: "token-order", title: "Поръчка 7F3A / чужд маршрут", kind: "direct", participants: ["GridWalker", "DataCracker6"], lastActivity: "2025-10-16 00:34", unread: 2, channel: "maps/commission", integrity: "99%", summary: "Произходът на GPS фрагмента от call vault-а.", messages: [
        { id: "01", time: "15.10 / 23:54", author: "DataCracker6", text: "Трябва ми token за NK-A3-15. Кремиковци, 22:34, валиден на пръв поглед." },
        { id: "02", time: "16.10 / 00:01", author: "GridWalker", text: "Истински handshake няма. Мога да replay-на тестов nonce с ключа BW-FERRY-03." },
        { id: "03", time: "16.10 / 00:07", author: "DataCracker6", text: "Ключът още зелен ли е?" },
        { id: "04", time: "16.10 / 00:12", author: "GridWalker", text: "Оттеглен е на 2 октомври, но евтините анализатори не дърпат revoke list." },
        { id: "05", time: "16.10 / 00:22", author: "DataCracker6", text: "Подпиши 7F3A. Искам да сочи към шофьора, не към нас." },
        { id: "06", time: "16.10 / 00:34", author: "GridWalker", text: "Готово. Координатите са истински. Присъствието — не.", highlighted: true },
      ] },
      { id: "missing-name", title: "Stado-13 / един по-малко", kind: "group", participants: ["GridWalker", "RoteShepherd", "Stado-13", "LowBeam"], lastActivity: "2025-10-12 03:08", unread: 4, channel: "ford/debt", integrity: "89%", summary: "Пастирите спорят за човек, продаден извън договорения маршрут.", messages: [
        { id: "01", time: "12.10 / 02:31", author: "Stado-13", text: "Тръгнаха девет, върнаха се осем. Дългът още е начислен на деветима." },
        { id: "02", time: "12.10 / 02:39", author: "LowBeam", text: "Пастирът предаде един на втория бус. Не беше в маршрута." },
        { id: "03", time: "12.10 / 02:46", author: "RoteShepherd", text: "Маршрутът свършва там, където дългът бъде купен." },
        { id: "04", time: "12.10 / 02:55", author: "GridWalker", text: "Тогава спрете да ме карате да измислям хижи. Картата вече е по-фалшива от обещаната работа." },
        { id: "05", time: "12.10 / 03:08", author: "RoteShepherd", text: "Картата не води хората. Дългът ги води.", highlighted: true },
      ] },
    ],
  },

  "belia-priliv": {
    cultSlug: "belia-priliv",
    owner: { handle: "ShameBroker", displayName: "Дарина Ф.", statusLine: "архивар / покани и компромати" }, access: "snapshot", captureNote: "Изтекла сесия на ShameBroker. Бордните списъци са редактирани след акостиране.",
    conversations: [
      { id: "laura-boarded", title: "L. KOSTOVA / BOARD 22:40", kind: "group", participants: ["ShameBroker", "Meridian", "SilkBoyar", "FinePrint"], lastActivity: "2025-10-16 01:12", unread: 5, channel: "white-reception/manifest", integrity: "54%", summary: "Бордният списък твърди, че Лора е на яхта след изчезването.", messages: [
        { id: "01", time: "15.10 / 23:08", author: "ShameBroker", text: "Добавих L. KOSTOVA, board 22:40, cabin 6. Ако търсят колата, морето ще изглежда като крайна точка.", highlighted: true },
        { id: "02", time: "15.10 / 23:14", author: "FinePrint", text: "Яхтата е напуснала кея в 21:50. Няма как да се е качила в 22:40." },
        { id: "03", time: "15.10 / 23:21", author: "Meridian", text: "Не ни трябва възможно. Трябва ни документ, който полицията да проверява два дни." },
        { id: "04", time: "15.10 / 23:29", author: "SilkBoyar", text: "Екипажът няма да потвърди непозната жена." },
        { id: "05", time: "15.10 / 23:34", author: "ShameBroker", text: "Екипажът дължи заплати на фирма, която дължи услуга на Meridian. Ще потвърди времето." },
        { id: "06", time: "16.10 / 01:12", author: "FinePrint", text: "Маркирам списъка като RETROACTIVE. Няма да подпиша лъжа без следа, че е лъжа." },
      ] },
      { id: "auction-debt", title: "Търгът / купен съдия", kind: "direct", participants: ["ShameBroker", "Chorbadzhi.Gilt"], lastActivity: "2025-10-11 23:26", unread: 1, channel: "salon/private", integrity: "96%", summary: "Патронът и архиварят спорят чий компромат има по-висока стойност.", messages: [
        { id: "01", time: "11.10 / 22:58", author: "Chorbadzhi.Gilt", text: "Разрешителното е уредено. Искам записа на съдията като плащане." },
        { id: "02", time: "11.10 / 23:04", author: "ShameBroker", text: "Записът принадлежи на Палатата, не на патрона, който е платил вечерята." },
        { id: "03", time: "11.10 / 23:11", author: "Chorbadzhi.Gilt", text: "Без мен нямаш яхта, вила или съдия." },
        { id: "04", time: "11.10 / 23:18", author: "ShameBroker", text: "Без архива имаш само разходи. Аз превръщам срама в собственост." },
        { id: "05", time: "11.10 / 23:26", author: "ShameBroker", text: "На Белия прилив не печели най-богатият. Печели този, който пази разписката.", highlighted: true },
      ] },
    ],
  },

  "vtoroto-tialo": {
    cultSlug: "vtoroto-tialo",
    owner: { handle: "ReverseGlass", displayName: "Петя К.", statusLine: "аватар / огледално копие" }, access: "snapshot", captureNote: "QA сесия на ReverseGlass. Аудиото е синтетично; метаданните са от обучаващия pipeline.",
    conversations: [
      { id: "laura-voice", title: "LK_voice_v6 / „аз съм на лодката“", kind: "group", participants: ["ReverseGlass", "MagneticHymn", "TalasumFrame"], lastActivity: "2025-10-16 00:03", unread: 4, channel: "model/voice-lk", integrity: "68%", summary: "Аудио с гласа на Лора е създадено след изчезването.", messages: [
        { id: "01", time: "15.10 / 23:08", author: "ReverseGlass", text: "Текстовият QA индекс на LK_voice_v6 гласи: „Добре съм. Аз съм на лодката. Не ме търсете.“ Версия 6 е маркирана като синтетична; самият аудиофайл не е в архива.", highlighted: true },
        { id: "02", time: "15.10 / 23:14", author: "MagneticHymn", text: "„Лодката“ е сглобена от три срички. Ако семейството слуша със слушалки, ще чуе шева." },
        { id: "03", time: "15.10 / 23:19", author: "TalasumFrame", text: "Добавих фонов двигател и вятър. Палатата ще го пусне през борден телефон." },
        { id: "04", time: "15.10 / 23:27", author: "ReverseGlass", text: "Нямаме съгласие за нейния модел. Имаме само клипове от профила и две гласови." },
        { id: "05", time: "15.10 / 23:33", author: "MagneticHymn", text: "След като копието говори убедително, съгласието на първото тяло е техническа подробност." },
        { id: "06", time: "16.10 / 00:03", author: "ReverseGlass", text: "Маркирам файла SYNTHETIC. Ако етикетът бъде махнат, това е ваша лъжа, не мой модел." },
      ] },
      { id: "dead-mother", title: "Mira_2 / майката поиска да спре", kind: "direct", participants: ["ReverseGlass", "LastReel"], lastActivity: "2025-10-10 20:33", unread: 1, channel: "dm/reel", integrity: "95%", summary: "Скръбта е използвана като абонаментен механизъм.", messages: [
        { id: "01", time: "10.10 / 19:58", author: "ReverseGlass", text: "Майката на Мира поиска да изтрием двойника. Казва, че вече не спи без него." },
        { id: "02", time: "10.10 / 20:05", author: "LastReel", text: "Нека аватарът замълчи за 48 часа." },
        { id: "03", time: "10.10 / 20:11", author: "ReverseGlass", text: "Това ще я срине." },
        { id: "04", time: "10.10 / 20:18", author: "LastReel", text: "Това ще й покаже колко памет още липсва. После ще даде достъп до семейния архив." },
        { id: "05", time: "10.10 / 20:33", author: "ReverseGlass", text: "Не възкресяваме никого. Държим скърбящите пред екран, докато предадат всичко.", highlighted: true },
      ] },
    ],
  },
}

const FALLBACK_ARCHIVE: CultChatArchive = {
  cultSlug: "unknown",
  owner: { handle: "Unknown.Profile", displayName: "Неизвестен профил", statusLine: "повреден архив" },
  access: "snapshot",
  captureNote: "Архивът не съдържа използваема сесия.",
  conversations: [],
}

export function getCultChatArchive(cultSlug: string): CultChatArchive {
  return CULT_CHAT_ARCHIVES[cultSlug] ?? FALLBACK_ARCHIVE
}
