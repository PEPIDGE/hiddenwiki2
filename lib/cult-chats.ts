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
}

export interface CultChatConversation {
  id: string
  title: string
  kind: "direct" | "group"
  participants: string[]
  lastActivity: string
  unread: number
  messages: CultChatMessage[]
}

export interface CultChatArchive {
  cultSlug: string
  owner: CultChatOwner
  conversations: CultChatConversation[]
}

const MEMBER_OVERRIDES: Record<string, Partial<CultChatMember>> = {
  RedFox: {
    password: "r3dfox!2025",
    displayName: "RedFox",
    role: "АРХИТЕКТ",
    statusLine: "основател / операторски достъп",
  },
  NightKiller: {
    password: "n1ght_k1ll",
    role: "ОПЕРАТОР",
    statusLine: "транспорт / маршрут",
  },
  GothGirl: {
    password: "g0th.g1rl!26",
    role: "ОПЕРАТОР",
    statusLine: "паролата е сменена след dump-а",
  },
  ToxicBabe: {
    password: "t0x1c_b@be",
    role: "ОПЕРАТОР",
    statusLine: "вербовка / покани",
  },
  "Black-Voyvoda": {
    password: "Bl@ck_V0jv0da",
    role: "ОПЕРАТОР",
    statusLine: "охрана / периметър",
  },
  DataCracker6: {
    password: "d4t@cr4ck6r",
    role: "АНАЛИТИК",
    statusLine: "логове / decoy следи",
  },
  OutsiderX: {
    password: "0uts1der_x",
    role: "ЛИДЕР",
    statusLine: "алибита / външен контакт",
  },
  NullSyn: {
    password: "n0llsyn!core",
    role: "АНАЛИТИК",
    statusLine: "компрометиран relay",
  },
}

function makeMemberPassword(username: string, cultSlug: string, index: number) {
  const cleanName = username.replace(/[^a-zA-Z0-9]/g, "").slice(0, 7) || "member"
  const cleanCult = cultSlug.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4) || "cult"
  return `${cleanName}_${cleanCult}${String(index + 17).padStart(2, "0")}`
}

export function getCultChatMembers(archive: CultChatArchive): CultChatMember[] {
  const usernames = new Set<string>()

  archive.conversations.forEach((conversation) => {
    conversation.participants.forEach((participant) => usernames.add(participant))
    conversation.messages.forEach((message) => usernames.add(message.author))
  })

  return Array.from(usernames)
    .sort((a, b) => a.localeCompare(b))
    .map((username, index) => {
      const override = MEMBER_OVERRIDES[username] ?? {}
      const isCoordinator = username === archive.owner.handle

      return {
        username,
        password: override.password ?? makeMemberPassword(username, archive.cultSlug, index),
        displayName: override.displayName ?? username,
        role: override.role ?? (isCoordinator ? "КООРДИНАТОР" : "ЧЛЕН"),
        statusLine: override.statusLine ?? (isCoordinator ? archive.owner.statusLine : "профил активен"),
      }
    })
}

export const CULT_CHAT_ARCHIVES: Record<string, CultChatArchive> = {
  "zlatnia-predel": {
    cultSlug: "zlatnia-predel",
    owner: {
      handle: "Mira.Predel",
      displayName: "Мира П.",
      statusLine: "на 18 минути от сесията",
    },
    conversations: [
      {
        id: "silence-room",
        title: "Стая 4 / тишина",
        kind: "group",
        participants: ["Mira.Predel", "Ivo_17", "DariaQuiet", "Sasho.Sleep"],
        lastActivity: "2025-10-12 23:48",
        unread: 3,
        messages: [
          { id: "01", time: "23:31", author: "Ivo_17", text: "Мира, лампата пак премигна. Това нормално ли е?" },
          { id: "02", time: "23:33", author: "Mira.Predel", text: "Не гледай към нея. Брой дишанията и не пиши повече до сигнала." },
          { id: "03", time: "23:41", author: "DariaQuiet", text: "Сашо почука три пъти по стената. Нали не трябваше да има звук?" },
          { id: "04", time: "23:48", author: "Mira.Predel", text: "Това е частта, в която Пределът отговаря. Останете на местата си.", highlighted: true },
        ],
      },
      {
        id: "ivo-private",
        title: "Ivo_17",
        kind: "direct",
        participants: ["Mira.Predel", "Ivo_17"],
        lastActivity: "2025-10-13 07:12",
        unread: 1,
        messages: [
          { id: "01", time: "06:59", author: "Ivo_17", text: "Не съм спал. Чух името си, но беше с друг глас." },
          { id: "02", time: "07:03", author: "Mira.Predel", text: "Запиши го в дневника, но не го казвай на групата." },
          { id: "03", time: "07:08", author: "Ivo_17", text: "Ако се откажа, какво става?" },
          { id: "04", time: "07:12", author: "Mira.Predel", text: "Никой не се отказва след първия глас. Днес си по-близо." },
        ],
      },
      {
        id: "supplies",
        title: "Доставка / тапи / плат",
        kind: "group",
        participants: ["Mira.Predel", "NoraBox", "Medic_Zero"],
        lastActivity: "2025-10-13 15:04",
        unread: 0,
        messages: [
          { id: "01", time: "14:36", author: "NoraBox", text: "Взех тапите и черния плат. Да ги оставя ли до стария вход?" },
          { id: "02", time: "14:39", author: "Mira.Predel", text: "Не до входа. В шкафа с одеялата, без бележка." },
          { id: "03", time: "14:58", author: "Medic_Zero", text: "Някой пита защо няма вода вътре." },
          { id: "04", time: "15:04", author: "Mira.Predel", text: "Водата прекъсва тишината. Даваме след излизане." },
        ],
      },
      {
        id: "daria-after",
        title: "DariaQuiet",
        kind: "direct",
        participants: ["Mira.Predel", "DariaQuiet"],
        lastActivity: "2025-10-14 02:19",
        unread: 2,
        messages: [
          { id: "01", time: "01:52", author: "DariaQuiet", text: "Не мога да различа съня от стаята. Това ли чакахме?" },
          { id: "02", time: "01:57", author: "Mira.Predel", text: "Да. Не го разваляй с разговори. Мълчанието пази формата." },
          { id: "03", time: "02:12", author: "DariaQuiet", text: "Майка ми звъни. Да вдигна ли?" },
          { id: "04", time: "02:19", author: "Mira.Predel", text: "Не тази нощ. Утре ще говориш като нов човек.", highlighted: true },
        ],
      },
      {
        id: "dream-notes",
        title: "Дневници на съня",
        kind: "group",
        participants: ["Mira.Predel", "Sasho.Sleep", "KalinaInk", "Ivo_17"],
        lastActivity: "2025-10-14 11:26",
        unread: 0,
        messages: [
          { id: "01", time: "11:02", author: "KalinaInk", text: "Кой събира листовете от тази сутрин?" },
          { id: "02", time: "11:05", author: "Mira.Predel", text: "Аз. Снимайте само първата страница и скрийте имената." },
          { id: "03", time: "11:19", author: "Sasho.Sleep", text: "В моя лист има една дума, която не съм писал аз." },
          { id: "04", time: "11:26", author: "Mira.Predel", text: "Точно тези листове ми трябват отделно." },
        ],
      },
    ],
  },
  "krag-na-lunnoto-zatamenie": {
    cultSlug: "krag-na-lunnoto-zatamenie",
    owner: {
      handle: "Selena.13",
      displayName: "Селена",
      statusLine: "следи прозореца на затъмнението",
    },
    conversations: [
      {
        id: "observatory",
        title: "Стара обсерватория",
        kind: "group",
        participants: ["Selena.13", "Noctis", "VeraPhase", "OutsiderX"],
        lastActivity: "2025-10-08 21:44",
        unread: 4,
        messages: [
          { id: "01", time: "21:18", author: "Noctis", text: "Има хора на паркинга. Не са наши." },
          { id: "02", time: "21:20", author: "Selena.13", text: "Оставете ги да видят лекцията. Кръгът започва след като си тръгнат." },
          { id: "03", time: "21:32", author: "VeraPhase", text: "Имаме ли нови имена за списъка?" },
          { id: "04", time: "21:44", author: "Selena.13", text: "Само тези, които донесат старото си име на хартия.", highlighted: true },
        ],
      },
      {
        id: "rayan-direct",
        title: "Rayan_Moon",
        kind: "direct",
        participants: ["Selena.13", "Rayan_Moon"],
        lastActivity: "2025-10-09 00:17",
        unread: 0,
        messages: [
          { id: "01", time: "00:02", author: "Rayan_Moon", text: "Селена, тя плака след огледалото. Да я пусна ли?" },
          { id: "02", time: "00:05", author: "Selena.13", text: "Не веднага. Дай и вода и я дръж в светлата стая." },
          { id: "03", time: "00:11", author: "Rayan_Moon", text: "Пита дали новото име е задължително." },
          { id: "04", time: "00:17", author: "Selena.13", text: "Кажи и, че старото вече е написано на черния лист." },
        ],
      },
      {
        id: "tickets",
        title: "Билети / публична част",
        kind: "group",
        participants: ["Selena.13", "LunaDesk", "VeraPhase"],
        lastActivity: "2025-10-10 18:09",
        unread: 1,
        messages: [
          { id: "01", time: "17:42", author: "LunaDesk", text: "Продадени са 26 билета. Оставих 6 места без имена." },
          { id: "02", time: "17:50", author: "Selena.13", text: "Добре. Тези 6 не трябва да изглеждат поканени." },
          { id: "03", time: "18:01", author: "VeraPhase", text: "Да пусна ли календарната покана за 23:40?" },
          { id: "04", time: "18:09", author: "Selena.13", text: "Пусни я за 22:10. Истинският час остава устно." },
        ],
      },
      {
        id: "alibi",
        title: "OutsiderX",
        kind: "direct",
        participants: ["Selena.13", "OutsiderX"],
        lastActivity: "2025-10-12 09:38",
        unread: 0,
        messages: [
          { id: "01", time: "09:21", author: "OutsiderX", text: "Искаш пак да изглежда, че съм бил там?" },
          { id: "02", time: "09:24", author: "Selena.13", text: "Само билет и снимка от фоайето. Нищо повече." },
          { id: "03", time: "09:31", author: "OutsiderX", text: "После ме няма в списъците." },
          { id: "04", time: "09:38", author: "Selena.13", text: "Точно това е услугата.", highlighted: true },
        ],
      },
      {
        id: "mirror-circle",
        title: "Огледален кръг",
        kind: "group",
        participants: ["Selena.13", "Rayan_Moon", "Noctis", "LunaDesk"],
        lastActivity: "2025-10-14 23:58",
        unread: 2,
        messages: [
          { id: "01", time: "23:37", author: "Noctis", text: "Огледалата са покрити. Чакаме знак." },
          { id: "02", time: "23:42", author: "Selena.13", text: "Когато луната изчезне, никой не казва истинско име." },
          { id: "03", time: "23:49", author: "Rayan_Moon", text: "Един нов пита за телефоните." },
          { id: "04", time: "23:58", author: "Selena.13", text: "Телефоните остават при LunaDesk до края на сянката." },
        ],
      },
    ],
  },
  "devette-klyucha": {
    cultSlug: "devette-klyucha",
    owner: {
      handle: "Keykeeper",
      displayName: "Пазителят",
      statusLine: "проверява инвентар 09",
    },
    conversations: [
      {
        id: "inventory",
        title: "Инвентар / девет",
        kind: "group",
        participants: ["Keykeeper", "Archivist_9", "Latch", "NoraBox"],
        lastActivity: "2025-10-05 16:12",
        unread: 0,
        messages: [
          { id: "01", time: "15:49", author: "Archivist_9", text: "Ключ 04 липсва от кутията. Последно беше при Latch." },
          { id: "02", time: "15:55", author: "Keykeeper", text: "Не пишете номерата с локации в един чат." },
          { id: "03", time: "16:03", author: "Latch", text: "Не липсва. В мен е, защото вратата не държи." },
          { id: "04", time: "16:12", author: "Keykeeper", text: "Върни го преди деветия праг. Без него тестът няма смисъл.", highlighted: true },
        ],
      },
      {
        id: "lora-box",
        title: "NoraBox",
        kind: "direct",
        participants: ["Keykeeper", "NoraBox"],
        lastActivity: "2025-10-07 20:28",
        unread: 2,
        messages: [
          { id: "01", time: "20:02", author: "NoraBox", text: "Пликът е в шкафа. Не знам дали трябваше да го отварям." },
          { id: "02", time: "20:06", author: "Keykeeper", text: "Не отваряш пликове. Само потвърждаваш, че ключът влиза." },
          { id: "03", time: "20:20", author: "NoraBox", text: "Името вътре ми е познато." },
          { id: "04", time: "20:28", author: "Keykeeper", text: "Точно затова няма да го пишеш тук." },
        ],
      },
      {
        id: "locked-room",
        title: "Стая без прозорец",
        kind: "group",
        participants: ["Keykeeper", "Latch", "NineMouths"],
        lastActivity: "2025-10-09 01:13",
        unread: 1,
        messages: [
          { id: "01", time: "00:44", author: "Latch", text: "Кандидатът намери правилната врата твърде бързо." },
          { id: "02", time: "00:51", author: "Keykeeper", text: "Тогава сменете въпроса, не вратата." },
          { id: "03", time: "01:06", author: "NineMouths", text: "Иска да знае защо няма логичен отговор." },
          { id: "04", time: "01:13", author: "Keykeeper", text: "Защото логиката отключва само първата брава." },
        ],
      },
      {
        id: "archivist",
        title: "Archivist_9",
        kind: "direct",
        participants: ["Keykeeper", "Archivist_9"],
        lastActivity: "2025-10-11 13:47",
        unread: 0,
        messages: [
          { id: "01", time: "13:20", author: "Archivist_9", text: "В два различни архива се появява една и съща маркировка." },
          { id: "02", time: "13:25", author: "Keykeeper", text: "Кои два?" },
          { id: "03", time: "13:39", author: "Archivist_9", text: "Братството и Седмият праг. Съвпадението е прекалено чисто." },
          { id: "04", time: "13:47", author: "Keykeeper", text: "Заключи копията. Това вече не е колекция.", highlighted: true },
        ],
      },
      {
        id: "threshold-test",
        title: "Тест / праг 09",
        kind: "group",
        participants: ["Keykeeper", "Latch", "NoraBox", "Archivist_9"],
        lastActivity: "2025-10-15 19:33",
        unread: 3,
        messages: [
          { id: "01", time: "19:02", author: "NoraBox", text: "Новият донесе собствен ключ. Това проблем ли е?" },
          { id: "02", time: "19:08", author: "Keykeeper", text: "Не. Това е признание, че вече има врата." },
          { id: "03", time: "19:24", author: "Latch", text: "Да оставя ли светлината в коридора?" },
          { id: "04", time: "19:33", author: "Keykeeper", text: "Не. Седмата минута трябва да е тъмна." },
        ],
      },
    ],
  },
  "bratstvoto-na-tretoto-probuzhdane": {
    cultSlug: "bratstvoto-na-tretoto-probuzhdane",
    owner: {
      handle: "RedFox",
      displayName: "RedFox",
      statusLine: "архитект / активен",
    },
    conversations: [
      {
        id: "operation",
        title: "Операция 15.10",
        kind: "group",
        participants: ["RedFox", "NightKiller", "Black-Voyvoda", "ToxicBabe"],
        lastActivity: "2025-10-13 14:30",
        unread: 5,
        messages: [
          { id: "01", time: "14:22", author: "RedFox", text: "Операцията е потвърдена. Целта е подготвена за 15 окт, 22:00.", highlighted: true },
          { id: "02", time: "14:25", author: "NightKiller", text: "Потвърждавам. Маршрут 17 е готов." },
          { id: "03", time: "14:26", author: "Black-Voyvoda", text: "Охраната е на място. Западното крило е тихо." },
          { id: "04", time: "14:30", author: "ToxicBabe", text: "Поканата е изпратена като лична среща, не като събитие." },
        ],
      },
      {
        id: "gothgirl",
        title: "GothGirl",
        kind: "direct",
        participants: ["RedFox", "GothGirl"],
        lastActivity: "2025-10-13 18:24",
        unread: 1,
        messages: [
          { id: "01", time: "18:14", author: "GothGirl", text: "Старата парола още стои в dump-а. Да я сменя ли сега?" },
          { id: "02", time: "18:16", author: "RedFox", text: "Да. Преди някой да пробва от LEAKS." },
          { id: "03", time: "18:22", author: "GothGirl", text: "Готово. Ако ме питат, акаунтът е компрометиран." },
          { id: "04", time: "18:24", author: "RedFox", text: "Точно така. Старата парола трябва да води до задънена улица.", highlighted: true },
        ],
      },
      {
        id: "transport",
        title: "NightKiller",
        kind: "direct",
        participants: ["RedFox", "NightKiller"],
        lastActivity: "2025-10-15 20:07",
        unread: 0,
        messages: [
          { id: "01", time: "19:55", author: "NightKiller", text: "Колата е заредена. Не искам повече промени в часа." },
          { id: "02", time: "19:58", author: "RedFox", text: "Часът остава. Промяна има само в първата спирка." },
          { id: "03", time: "20:03", author: "NightKiller", text: "Кой потвърждава при пристигане?" },
          { id: "04", time: "20:07", author: "RedFox", text: "Black-Voyvoda. Не пишеш адреси тук." },
        ],
      },
      {
        id: "cleanup",
        title: "След 01:00",
        kind: "group",
        participants: ["RedFox", "DataCracker6", "ToxicBabe"],
        lastActivity: "2025-10-16 01:05",
        unread: 2,
        messages: [
          { id: "01", time: "01:00", author: "RedFox", text: "Фаза 3 е изпълнена. Изчистете следите и оставете публичната история да диша." },
          { id: "02", time: "01:02", author: "ToxicBabe", text: "Участниците получиха различни версии. Никой няма цялата картина." },
          { id: "03", time: "01:05", author: "DataCracker6", text: "Чистя логовете. NODE-7 ще изглежда празен." },
        ],
      },
      {
        id: "black-voyvoda",
        title: "Black-Voyvoda",
        kind: "direct",
        participants: ["RedFox", "Black-Voyvoda"],
        lastActivity: "2025-10-16 03:14",
        unread: 1,
        messages: [
          { id: "01", time: "22:15", author: "Black-Voyvoda", text: "Д.М. звъня. Каза, че има разминаване в часа." },
          { id: "02", time: "22:18", author: "RedFox", text: "Разминаването е полезно. Нека си остане така." },
          { id: "03", time: "03:09", author: "Black-Voyvoda", text: "Не ми харесва колко хора вече знаят за западното крило." },
          { id: "04", time: "03:14", author: "RedFox", text: "След тази нощ западното крило не съществува.", highlighted: true },
        ],
      },
    ],
  },
  "vechnia-krugovrat": {
    cultSlug: "vechnia-krugovrat",
    owner: {
      handle: "RayaCycle",
      displayName: "Рая",
      statusLine: "ден 12 от сезонния престой",
    },
    conversations: [
      {
        id: "farm-week",
        title: "Фермата / седмица 2",
        kind: "group",
        participants: ["RayaCycle", "SeedMother", "MartoLoop", "ElenaRain"],
        lastActivity: "2025-09-28 06:44",
        unread: 0,
        messages: [
          { id: "01", time: "06:12", author: "SeedMother", text: "Всички станаха в 06:00 без звънец. Рутината вече държи." },
          { id: "02", time: "06:20", author: "RayaCycle", text: "Добре. Днес пак същата пътека, същите песни, същият ред." },
          { id: "03", time: "06:31", author: "MartoLoop", text: "Елена пита защо не сменяме задачите." },
          { id: "04", time: "06:44", author: "RayaCycle", text: "Защото промяната започва, когато повторението стане по-силно от волята.", highlighted: true },
        ],
      },
      {
        id: "elena-direct",
        title: "ElenaRain",
        kind: "direct",
        participants: ["RayaCycle", "ElenaRain"],
        lastActivity: "2025-09-29 21:16",
        unread: 3,
        messages: [
          { id: "01", time: "20:58", author: "ElenaRain", text: "Не помня дали това беше днешният разговор или вчерашният." },
          { id: "02", time: "21:03", author: "RayaCycle", text: "Това е добър знак. Денят вече не те държи за датата." },
          { id: "03", time: "21:11", author: "ElenaRain", text: "Искам да се прибера за два дни." },
          { id: "04", time: "21:16", author: "RayaCycle", text: "Прибирането разваля цикъла. Изчакай до завръщането." },
        ],
      },
      {
        id: "mill-house",
        title: "Старата мелница",
        kind: "group",
        participants: ["RayaCycle", "MartoLoop", "QuietVan", "SeedMother"],
        lastActivity: "2025-10-01 19:22",
        unread: 1,
        messages: [
          { id: "01", time: "18:55", author: "QuietVan", text: "Мелницата е свободна за уикенда. Няма съседи наблизо." },
          { id: "02", time: "19:02", author: "RayaCycle", text: "Само тихи хора. Никакви гости, които питат за изход." },
          { id: "03", time: "19:18", author: "MartoLoop", text: "Да кажем ли, че е работилница за семена?" },
          { id: "04", time: "19:22", author: "RayaCycle", text: "Да. Това е език, който външните приемат." },
        ],
      },
      {
        id: "marto-direct",
        title: "MartoLoop",
        kind: "direct",
        participants: ["RayaCycle", "MartoLoop"],
        lastActivity: "2025-10-05 08:10",
        unread: 0,
        messages: [
          { id: "01", time: "07:41", author: "MartoLoop", text: "Един нов си отбелязва датите на ръката." },
          { id: "02", time: "07:46", author: "RayaCycle", text: "Дай му друга задача за ръцете. Нека меси хляба." },
          { id: "03", time: "08:02", author: "MartoLoop", text: "Той се смее, но изглежда изтощен." },
          { id: "04", time: "08:10", author: "RayaCycle", text: "Изтощението отваря място за навик." },
        ],
      },
      {
        id: "return",
        title: "Завръщане",
        kind: "group",
        participants: ["RayaCycle", "SeedMother", "ElenaRain", "MartoLoop"],
        lastActivity: "2025-10-12 05:55",
        unread: 2,
        messages: [
          { id: "01", time: "05:21", author: "SeedMother", text: "Трима искат да останат след края на лагера." },
          { id: "02", time: "05:27", author: "RayaCycle", text: "Не ги наричайте останали. Кажете, че се завръщат." },
          { id: "03", time: "05:49", author: "ElenaRain", text: "А ако някой пита семействата им?" },
          { id: "04", time: "05:55", author: "RayaCycle", text: "Всички писма казват едно и също: имам нужда от тишина.", highlighted: true },
        ],
      },
    ],
  },
  "parvichnia-pat": {
    cultSlug: "parvichnia-pat",
    owner: {
      handle: "TrailFather",
      displayName: "Боян",
      statusLine: "водач на нощен маршрут",
    },
    conversations: [
      {
        id: "night-route",
        title: "Маршрут без покритие",
        kind: "group",
        participants: ["TrailFather", "Bell_77", "Moss", "VeskoMap"],
        lastActivity: "2025-10-03 22:41",
        unread: 2,
        messages: [
          { id: "01", time: "22:10", author: "VeskoMap", text: "След третата чешма няма сигнал. Това устройва ли ни?" },
          { id: "02", time: "22:13", author: "TrailFather", text: "Точно там започва пътят. Преди това е разходка." },
          { id: "03", time: "22:28", author: "Bell_77", text: "Камбаната се чува до дерето." },
          { id: "04", time: "22:41", author: "TrailFather", text: "Който следва звука, не пита накъде отива.", highlighted: true },
        ],
      },
      {
        id: "moss-direct",
        title: "Moss",
        kind: "direct",
        participants: ["TrailFather", "Moss"],
        lastActivity: "2025-10-04 00:29",
        unread: 0,
        messages: [
          { id: "01", time: "00:03", author: "Moss", text: "Едно момче паникьоса при калта. Искаше телефон." },
          { id: "02", time: "00:08", author: "TrailFather", text: "Телефонът е стара посока. Върни го чак след водата." },
          { id: "03", time: "00:18", author: "Moss", text: "Той каза, че не е подписвал за това." },
          { id: "04", time: "00:29", author: "TrailFather", text: "Подписа, когато тръгна след водача." },
        ],
      },
      {
        id: "hut",
        title: "Изоставена хижа",
        kind: "group",
        participants: ["TrailFather", "VeskoMap", "KamenGate"],
        lastActivity: "2025-10-06 17:36",
        unread: 1,
        messages: [
          { id: "01", time: "17:04", author: "KamenGate", text: "Хижата е заключена, но прозорецът държи лошо." },
          { id: "02", time: "17:11", author: "TrailFather", text: "Не оставяйте следи, че е било удобно. Мястото трябва да плаши." },
          { id: "03", time: "17:24", author: "VeskoMap", text: "Да маркирам ли входа на картата?" },
          { id: "04", time: "17:36", author: "TrailFather", text: "Само с име, което външните няма да търсят." },
        ],
      },
      {
        id: "bell",
        title: "Bell_77",
        kind: "direct",
        participants: ["TrailFather", "Bell_77"],
        lastActivity: "2025-10-09 23:07",
        unread: 4,
        messages: [
          { id: "01", time: "22:39", author: "Bell_77", text: "Седемдесет и седем минути минаха. Двама още не се връщат." },
          { id: "02", time: "22:44", author: "TrailFather", text: "Не ги викай по име." },
          { id: "03", time: "22:58", author: "Bell_77", text: "Единият отговори на камбаната." },
          { id: "04", time: "23:07", author: "TrailFather", text: "Тогава вече знае кой звук да следва." },
        ],
      },
      {
        id: "transfer",
        title: "Преход / втори край",
        kind: "group",
        participants: ["TrailFather", "Moss", "QuietVan", "VeskoMap"],
        lastActivity: "2025-10-14 02:12",
        unread: 0,
        messages: [
          { id: "01", time: "01:33", author: "QuietVan", text: "Ще чакам при пътя след моста. Без фарове." },
          { id: "02", time: "01:38", author: "TrailFather", text: "Групата ще мисли, че маршрутът свършва при хижата." },
          { id: "03", time: "01:52", author: "Moss", text: "А ако някой брои хората?" },
          { id: "04", time: "02:12", author: "TrailFather", text: "В гората броенето никога не излиза точно.", highlighted: true },
        ],
      },
    ],
  },
  "sedmia-prag": {
    cultSlug: "sedmia-prag",
    owner: {
      handle: "Threshold.7",
      displayName: "Нора",
      statusLine: "карта на сервизни входове",
    },
    conversations: [
      {
        id: "seven-doors",
        title: "Седем врати",
        kind: "group",
        participants: ["Threshold.7", "BasementEye", "PhotoNull", "Keykeeper"],
        lastActivity: "2025-10-02 03:07",
        unread: 2,
        messages: [
          { id: "01", time: "02:41", author: "PhotoNull", text: "Снимах празния праг в 03:03, но кадърът е размазан." },
          { id: "02", time: "02:45", author: "Threshold.7", text: "Размазаният кадър е по-добър. Прагът не обича доказателства." },
          { id: "03", time: "02:58", author: "BasementEye", text: "Ключът за петата врата не пасва." },
          { id: "04", time: "03:07", author: "Threshold.7", text: "Тогава петата врата е друга. Не насилвайте старата." },
        ],
      },
      {
        id: "basement-eye",
        title: "BasementEye",
        kind: "direct",
        participants: ["Threshold.7", "BasementEye"],
        lastActivity: "2025-10-04 01:18",
        unread: 0,
        messages: [
          { id: "01", time: "00:53", author: "BasementEye", text: "Входът зад аптеката още е отворен. Камерата гледа надолу." },
          { id: "02", time: "00:59", author: "Threshold.7", text: "Не ми пращай снимки. Само потвърди дали стълбите водят до двора." },
          { id: "03", time: "01:10", author: "BasementEye", text: "Водят, но има куче." },
          { id: "04", time: "01:18", author: "Threshold.7", text: "Тогава маршрутът е жив. Живите маршрути имат пазачи." },
        ],
      },
      {
        id: "urbex",
        title: "Urbex чат",
        kind: "group",
        participants: ["Threshold.7", "PhotoNull", "Sasho.Sleep", "NoraBox"],
        lastActivity: "2025-10-07 22:11",
        unread: 1,
        messages: [
          { id: "01", time: "21:33", author: "PhotoNull", text: "Новите мислят, че е фоторазходка." },
          { id: "02", time: "21:39", author: "Threshold.7", text: "Нека мислят така до четвъртата врата." },
          { id: "03", time: "21:55", author: "NoraBox", text: "Да им кажем ли да не гледат назад?" },
          { id: "04", time: "22:11", author: "Threshold.7", text: "Не. Трябва сами да нарушат правилото, за да го усетят." },
        ],
      },
      {
        id: "keykeeper",
        title: "Keykeeper",
        kind: "direct",
        participants: ["Threshold.7", "Keykeeper"],
        lastActivity: "2025-10-11 13:52",
        unread: 2,
        messages: [
          { id: "01", time: "13:29", author: "Keykeeper", text: "Вашата маркировка се появява при нас. Това не беше договорено." },
          { id: "02", time: "13:33", author: "Threshold.7", text: "Прагът и ключът винаги се срещат някъде." },
          { id: "03", time: "13:45", author: "Keykeeper", text: "Не философствай. Кой използва входа?" },
          { id: "04", time: "13:52", author: "Threshold.7", text: "Някой, който не иска да бъде видян между две места.", highlighted: true },
        ],
      },
      {
        id: "service-corridor",
        title: "Сервизен коридор",
        kind: "group",
        participants: ["Threshold.7", "BasementEye", "PhotoNull", "Black-Voyvoda"],
        lastActivity: "2025-10-15 21:48",
        unread: 5,
        messages: [
          { id: "01", time: "21:02", author: "Black-Voyvoda", text: "Трябва ми тих вход и изход до 22:30." },
          { id: "02", time: "21:09", author: "Threshold.7", text: "Сервизният коридор има две слепи точки, но не чака никого." },
          { id: "03", time: "21:27", author: "BasementEye", text: "Вратата за двора скърца." },
          { id: "04", time: "21:48", author: "Threshold.7", text: "Скърцането е добре. Хората помнят звука, не лицата." },
        ],
      },
    ],
  },
  "apex": {
    cultSlug: "apex",
    owner: {
      handle: "Apex.V",
      displayName: "Виктория",
      statusLine: "ментор / затворен кръг",
    },
    conversations: [
      {
        id: "roof-session",
        title: "Покрив / 7 мин",
        kind: "group",
        participants: ["Apex.V", "MentorK", "GlassHR", "Investor_0"],
        lastActivity: "2025-10-06 22:17",
        unread: 0,
        messages: [
          { id: "01", time: "21:49", author: "GlassHR", text: "Кандидатът отказва да каже страха си пред групата." },
          { id: "02", time: "21:55", author: "Apex.V", text: "Тогава групата ще каже какво вижда в него." },
          { id: "03", time: "22:08", author: "MentorK", text: "Той трепери, но остана." },
          { id: "04", time: "22:17", author: "Apex.V", text: "Добре. Първо се чупи образът, после се продава новият.", highlighted: true },
        ],
      },
      {
        id: "investor",
        title: "Investor_0",
        kind: "direct",
        participants: ["Apex.V", "Investor_0"],
        lastActivity: "2025-10-08 10:42",
        unread: 1,
        messages: [
          { id: "01", time: "10:11", author: "Investor_0", text: "Защо плащаме за охрана през трета фирма?" },
          { id: "02", time: "10:16", author: "Apex.V", text: "Защото чистата фактура е по-важна от евтината." },
          { id: "03", time: "10:31", author: "Investor_0", text: "Името Примати да не се вижда никъде." },
          { id: "04", time: "10:42", author: "Apex.V", text: "Няма да се вижда. Те са услуга, не партньор." },
        ],
      },
      {
        id: "blank-paper",
        title: "Празен лист",
        kind: "group",
        participants: ["Apex.V", "MentorK", "LegalGrey"],
        lastActivity: "2025-10-09 19:03",
        unread: 2,
        messages: [
          { id: "01", time: "18:34", author: "LegalGrey", text: "Подписите са събрани, но листовете трябва да изглеждат като вътрешна игра." },
          { id: "02", time: "18:41", author: "Apex.V", text: "Точно това са. Игрите показват кой се подчинява без гаранции." },
          { id: "03", time: "18:57", author: "MentorK", text: "Един пита дали може да снима." },
          { id: "04", time: "19:03", author: "Apex.V", text: "Който снима, не е готов за върха." },
        ],
      },
      {
        id: "glasshr",
        title: "GlassHR",
        kind: "direct",
        participants: ["Apex.V", "GlassHR"],
        lastActivity: "2025-10-13 08:28",
        unread: 0,
        messages: [
          { id: "01", time: "08:05", author: "GlassHR", text: "Имаме профил, който може да се използва от Братството." },
          { id: "02", time: "08:09", author: "Apex.V", text: "Не използваме хора. Подреждаме възможности." },
          { id: "03", time: "08:21", author: "GlassHR", text: "Това звучи по-зле." },
          { id: "04", time: "08:28", author: "Apex.V", text: "Звучи по-чисто в протокол." },
        ],
      },
      {
        id: "private-salon",
        title: "Частен салон",
        kind: "group",
        participants: ["Apex.V", "Investor_0", "Black-Voyvoda", "ToxicBabe"],
        lastActivity: "2025-10-15 18:52",
        unread: 3,
        messages: [
          { id: "01", time: "18:11", author: "ToxicBabe", text: "Поканите за Огледален преход са готови. Някои имена са чувствителни." },
          { id: "02", time: "18:18", author: "Apex.V", text: "Чувствителните имена са най-ценни. Дайте им по-тих вход." },
          { id: "03", time: "18:39", author: "Black-Voyvoda", text: "Аз пазя задния коридор, ако плащането е потвърдено." },
          { id: "04", time: "18:52", author: "Apex.V", text: "Потвърдено. Няма директна връзка между нас.", highlighted: true },
        ],
      },
    ],
  },
  "primati": {
    cultSlug: "primati",
    owner: {
      handle: "KamenGate",
      displayName: "Камен",
      statusLine: "периметър / вход",
    },
    conversations: [
      {
        id: "gym",
        title: "Зала след 23",
        kind: "group",
        participants: ["KamenGate", "BruteForce", "MiroGrip", "Black-Voyvoda"],
        lastActivity: "2025-10-05 23:36",
        unread: 1,
        messages: [
          { id: "01", time: "23:05", author: "MiroGrip", text: "Новите оставиха телефоните в шкафчето. Един се опъва." },
          { id: "02", time: "23:12", author: "KamenGate", text: "Който се опъва, стои отпред. Да го виждат." },
          { id: "03", time: "23:24", author: "BruteForce", text: "Това мотивация ли е или наказание?" },
          { id: "04", time: "23:36", author: "KamenGate", text: "При нас е едно и също.", highlighted: true },
        ],
      },
      {
        id: "black-voyvoda",
        title: "Black-Voyvoda",
        kind: "direct",
        participants: ["KamenGate", "Black-Voyvoda"],
        lastActivity: "2025-10-10 17:22",
        unread: 0,
        messages: [
          { id: "01", time: "16:49", author: "Black-Voyvoda", text: "Ще ми трябват двама за вход. Без приказки." },
          { id: "02", time: "16:55", author: "KamenGate", text: "Имам двама, които слушат от първия път." },
          { id: "03", time: "17:11", author: "Black-Voyvoda", text: "Не искам символи, не искам ритуални глупости." },
          { id: "04", time: "17:22", author: "KamenGate", text: "Ние сме стената. Другите си носят символите." },
        ],
      },
      {
        id: "garage",
        title: "Гараж / мебели",
        kind: "group",
        participants: ["KamenGate", "MiroGrip", "BruteForce"],
        lastActivity: "2025-10-12 02:06",
        unread: 2,
        messages: [
          { id: "01", time: "01:31", author: "BruteForce", text: "Качихме масите. Има следи от восък." },
          { id: "02", time: "01:38", author: "KamenGate", text: "Не питаме от какво са следите. Местим и приключваме." },
          { id: "03", time: "01:52", author: "MiroGrip", text: "Съседът гледаше от балкона." },
          { id: "04", time: "02:06", author: "KamenGate", text: "Запомнил е камиона, не хората. Това стига." },
        ],
      },
      {
        id: "miro-direct",
        title: "MiroGrip",
        kind: "direct",
        participants: ["KamenGate", "MiroGrip"],
        lastActivity: "2025-10-14 20:14",
        unread: 0,
        messages: [
          { id: "01", time: "19:43", author: "MiroGrip", text: "Един от нашите пита защо работим за хора с маски." },
          { id: "02", time: "19:51", author: "KamenGate", text: "Кажи му, че парите нямат лице." },
          { id: "03", time: "20:04", author: "MiroGrip", text: "А ако пак пита?" },
          { id: "04", time: "20:14", author: "KamenGate", text: "Тогава още не е наш." },
        ],
      },
      {
        id: "perimeter",
        title: "Периметър",
        kind: "group",
        participants: ["KamenGate", "BruteForce", "Black-Voyvoda", "Threshold.7"],
        lastActivity: "2025-10-15 22:27",
        unread: 5,
        messages: [
          { id: "01", time: "21:56", author: "Threshold.7", text: "Сервизният вход е тих, но не е празен." },
          { id: "02", time: "22:03", author: "KamenGate", text: "Празно не ни трябва. Контролирано ни трябва." },
          { id: "03", time: "22:19", author: "Black-Voyvoda", text: "Никой да не влиза след 22:30 без знак." },
          { id: "04", time: "22:27", author: "KamenGate", text: "Разбрано. Стената се затваря.", highlighted: true },
        ],
      },
    ],
  },
  "poslednoto-videnie": {
    cultSlug: "poslednoto-videnie",
    owner: {
      handle: "FrameLast",
      displayName: "Ана",
      statusLine: "монтаж / повредена лента",
    },
    conversations: [
      {
        id: "screening",
        title: "Прожекция 04",
        kind: "group",
        participants: ["FrameLast", "TapeSaint", "PulseLog", "MirrorSeat"],
        lastActivity: "2025-10-02 00:26",
        unread: 3,
        messages: [
          { id: "01", time: "23:58", author: "TapeSaint", text: "Лентата прескача на същия кадър. Хората го забелязват." },
          { id: "02", time: "00:04", author: "FrameLast", text: "Нека го забележат. Повторението е куката." },
          { id: "03", time: "00:17", author: "PulseLog", text: "Двама отказаха да гледат след петата минута." },
          { id: "04", time: "00:26", author: "FrameLast", text: "Техните реакции са по-важни от тези, които издържат.", highlighted: true },
        ],
      },
      {
        id: "tapesaint",
        title: "TapeSaint",
        kind: "direct",
        participants: ["FrameLast", "TapeSaint"],
        lastActivity: "2025-10-03 14:48",
        unread: 0,
        messages: [
          { id: "01", time: "14:21", author: "TapeSaint", text: "Имам нов файл, но звукът е почти празен." },
          { id: "02", time: "14:27", author: "FrameLast", text: "Остави празното. Хората сами го пълнят." },
          { id: "03", time: "14:39", author: "TapeSaint", text: "Да добавя ли дата в поканата?" },
          { id: "04", time: "14:48", author: "FrameLast", text: "Само час. Датата прави страха обикновен." },
        ],
      },
      {
        id: "reaction-log",
        title: "Реакции",
        kind: "group",
        participants: ["FrameLast", "PulseLog", "DriftDoc"],
        lastActivity: "2025-10-07 01:41",
        unread: 2,
        messages: [
          { id: "01", time: "01:09", author: "PulseLog", text: "След светването първата дума беше майка." },
          { id: "02", time: "01:14", author: "FrameLast", text: "Запиши я отделно. Първата дума е новият център." },
          { id: "03", time: "01:30", author: "DriftDoc", text: "Това вече прилича на терапевтичен протокол." },
          { id: "04", time: "01:41", author: "FrameLast", text: "Не. Терапията връща човека. Ние гледаме как се отдалечава." },
        ],
      },
      {
        id: "mirrorseat",
        title: "MirrorSeat",
        kind: "direct",
        participants: ["FrameLast", "MirrorSeat"],
        lastActivity: "2025-10-10 20:33",
        unread: 1,
        messages: [
          { id: "01", time: "20:02", author: "MirrorSeat", text: "Огледалото пред екрана събира твърде много внимание." },
          { id: "02", time: "20:09", author: "FrameLast", text: "То трябва да краде вниманието. После образът се връща през него." },
          { id: "03", time: "20:26", author: "MirrorSeat", text: "Една жена каза, че е видяла себе си по-възрастна." },
          { id: "04", time: "20:33", author: "FrameLast", text: "Запази това. То е по-силно от всяка покана." },
        ],
      },
      {
        id: "handoff",
        title: "След прожекция",
        kind: "group",
        participants: ["FrameLast", "ToxicBabe", "PulseLog", "DriftDoc"],
        lastActivity: "2025-10-14 23:19",
        unread: 4,
        messages: [
          { id: "01", time: "22:44", author: "ToxicBabe", text: "Трябват ми двама, които вече са размекнати. Без паника, само търсят обяснение." },
          { id: "02", time: "22:52", author: "FrameLast", text: "Имам един профил след последната прожекция. Говори тихо и чака знак." },
          { id: "03", time: "23:06", author: "PulseLog", text: "Да пратя реакционния лист?" },
          { id: "04", time: "23:19", author: "FrameLast", text: "Само първата дума и часа. Останалото остава при нас.", highlighted: true },
        ],
      },
    ],
  },
}

const FALLBACK_ARCHIVE: CultChatArchive = {
  cultSlug: "unknown",
  owner: {
    handle: "Unknown.Profile",
    displayName: "Неизвестен профил",
    statusLine: "архивът е частично повреден",
  },
  conversations: [
    {
      id: "fallback-01",
      title: "Възстановен разговор",
      kind: "direct",
      participants: ["Unknown.Profile", "Recovered.Contact"],
      lastActivity: "2025-10-01 00:00",
      unread: 0,
      messages: [
        { id: "01", time: "00:00", author: "Recovered.Contact", text: "Архивът липсва. Останаха само фрагменти." },
        { id: "02", time: "00:01", author: "Unknown.Profile", text: "Пази фрагментите. Понякога те казват достатъчно." },
      ],
    },
  ],
}

export function getCultChatArchive(cultSlug: string): CultChatArchive {
  return CULT_CHAT_ARCHIVES[cultSlug] ?? FALLBACK_ARCHIVE
}
