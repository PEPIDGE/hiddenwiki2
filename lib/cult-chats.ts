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
      const profile = SIDE_MEMBER_PROFILES[archive.cultSlug]?.[username]
      const isCoordinator = username === archive.owner.handle

      return {
        username,
        password: override.password ?? makeMemberPassword(username, archive.cultSlug, index),
        displayName: override.displayName ?? profile?.displayName ?? username,
        role: override.role ?? profile?.role ?? (isCoordinator ? "КООРДИНАТОР" : "ЧЛЕН"),
        statusLine: override.statusLine ?? profile?.statusLine ?? (isCoordinator ? archive.owner.statusLine : "профил активен"),
      }
    })
}

export const CULT_CHAT_ARCHIVES: Record<string, CultChatArchive> = {
  "horat-na-vtoroto-nebe": {
    cultSlug: "horat-na-vtoroto-nebe",
    owner: {
      handle: "GoldVeil",
      displayName: "Весела Д.",
      statusLine: "диригира Настройването / стая 4",
    },
    conversations: [
      {
        id: "silence-room",
        title: "Стая 4 / тишина",
        kind: "group",
        participants: ["GoldVeil", "EmberHush", "StillHollow", "DeepMute"],
        lastActivity: "2025-10-12 23:48",
        unread: 3,
        messages: [
          { id: "01", time: "23:31", author: "EmberHush", text: "Весела, лампата пак премигна. Това нормално ли е?" },
          { id: "02", time: "23:33", author: "GoldVeil", text: "Не гледай към нея. Брой дишанията и не пиши повече до сигнала." },
          { id: "03", time: "23:41", author: "StillHollow", text: "Павел почука три пъти по стената. Нали не трябваше да има звук?" },
          { id: "04", time: "23:48", author: "GoldVeil", text: "Това е частта, в която Второто небе отговаря. Останете на местата си.", highlighted: true },
        ],
      },
      {
        id: "ivo-private",
        title: "EmberHush",
        kind: "direct",
        participants: ["GoldVeil", "EmberHush"],
        lastActivity: "2025-10-13 07:12",
        unread: 1,
        messages: [
          { id: "01", time: "06:59", author: "EmberHush", text: "Не съм спал. Чух името си, но беше с друг глас." },
          { id: "02", time: "07:03", author: "GoldVeil", text: "Запиши го в дневника, но не го казвай на групата." },
          { id: "03", time: "07:08", author: "EmberHush", text: "Ако се откажа, какво става?" },
          { id: "04", time: "07:12", author: "GoldVeil", text: "Никой не се отказва след първия глас. Днес си по-близо." },
        ],
      },
      {
        id: "supplies",
        title: "Доставка / тапи / плат",
        kind: "group",
        participants: ["GoldVeil", "QuietCrate", "WhiteGauze"],
        lastActivity: "2025-10-13 15:04",
        unread: 0,
        messages: [
          { id: "01", time: "14:36", author: "QuietCrate", text: "Взех тапите и черния плат. Да ги оставя ли до стария вход?" },
          { id: "02", time: "14:39", author: "GoldVeil", text: "Не до входа. В шкафа с одеялата, без бележка." },
          { id: "03", time: "14:58", author: "WhiteGauze", text: "Настоявам да има медицинско наблюдение във всяка стая." },
          { id: "04", time: "15:04", author: "GoldVeil", text: "Наблюдението остава скрито. Приемникът не трябва да вижда човешка намеса." },
        ],
      },
      {
        id: "daria-after",
        title: "StillHollow",
        kind: "direct",
        participants: ["GoldVeil", "StillHollow"],
        lastActivity: "2025-10-14 02:19",
        unread: 2,
        messages: [
          { id: "01", time: "01:52", author: "StillHollow", text: "Не мога да различа съня от стаята. Това ли чакахме?" },
          { id: "02", time: "01:57", author: "GoldVeil", text: "Да. Не го разваляй с разговори. Мълчанието пази формата." },
          { id: "03", time: "02:12", author: "StillHollow", text: "Майка ми звъни. Да вдигна ли?" },
          { id: "04", time: "02:19", author: "GoldVeil", text: "Не тази нощ. Утре ще говориш като нов човек.", highlighted: true },
        ],
      },
      {
        id: "dream-notes",
        title: "Дневници на съня",
        kind: "group",
        participants: ["GoldVeil", "DeepMute", "InkSomnus", "EmberHush"],
        lastActivity: "2025-10-14 11:26",
        unread: 0,
        messages: [
          { id: "01", time: "11:02", author: "InkSomnus", text: "Кой събира листовете от тази сутрин?" },
          { id: "02", time: "11:05", author: "GoldVeil", text: "Аз. Снимайте само първата страница и скрийте имената." },
          { id: "03", time: "11:19", author: "DeepMute", text: "В моя лист има една дума, която не съм писал аз." },
          { id: "04", time: "11:26", author: "GoldVeil", text: "Точно тези листове ми трябват отделно." },
        ],
      },
      {
        id: "trance-room",
        title: "Стая 7 / огън без огън",
        kind: "group",
        participants: ["GoldVeil", "Nestinar.Ash", "MoraWhisper", "Bogomil.Quiet"],
        lastActivity: "2025-10-15 03:10",
        unread: 2,
        messages: [
          { id: "01", time: "02:41", author: "Nestinar.Ash", text: "Новите броят минутите на глас. Трябва да броят дишания." },
          { id: "02", time: "02:55", author: "MoraWhisper", text: "Шепнах през стената три пъти. Единият отговори с името на майка си." },
          { id: "03", time: "03:02", author: "Bogomil.Quiet", text: "Форумът пита кога е следващият курс. Да им дам ли дата?" },
          { id: "04", time: "03:10", author: "GoldVeil", text: "Дай им дата. Истинската стая не се обявява никъде.", highlighted: true },
        ],
      },
    ],
  },
  "institut-na-chistata-formula": {
    cultSlug: "institut-na-chistata-formula",
    owner: {
      handle: "UmbraSix",
      displayName: "Ирина С.",
      statusLine: "директор / одобрява Бялата доза",
    },
    conversations: [
      {
        id: "observatory",
        title: "Обсерватория / изпитване 6",
        kind: "group",
        participants: ["UmbraSix", "CraterEye", "WaningCrescent", "EclipseWard"],
        lastActivity: "2025-10-08 21:44",
        unread: 4,
        messages: [
          { id: "01", time: "21:18", author: "CraterEye", text: "Има хора на паркинга. Не са в регистъра на доброволците." },
          { id: "02", time: "21:20", author: "UmbraSix", text: "Нека чуят публичната лекция. Изпитването започва след като си тръгнат." },
          { id: "03", time: "21:32", author: "WaningCrescent", text: "Имаме ли нови индекси за шестимата?" },
          { id: "04", time: "21:44", author: "UmbraSix", text: "Впишете само онези, които вече са дали проба. Другите не трябва да съществуват в досието.", highlighted: true },
        ],
      },
      {
        id: "rayan-direct",
        title: "NadirCall",
        kind: "direct",
        participants: ["UmbraSix", "NadirCall"],
        lastActivity: "2025-10-09 00:17",
        unread: 0,
        messages: [
          { id: "01", time: "00:02", author: "NadirCall", text: "Ирина, тя трепери след дозата и иска външен лекар." },
          { id: "02", time: "00:05", author: "UmbraSix", text: "Премести я в бялата стая и отбележи реакцията като очаквана." },
          { id: "03", time: "00:11", author: "NadirCall", text: "Пита какво точно е приела." },
          { id: "04", time: "00:17", author: "UmbraSix", text: "Кажи й, че съм съобразила Формулата с нейния индекс." },
        ],
      },
      {
        id: "tickets",
        title: "Часове / публична клиника",
        kind: "group",
        participants: ["UmbraSix", "PhaseClerk", "WaningCrescent"],
        lastActivity: "2025-10-10 18:09",
        unread: 1,
        messages: [
          { id: "01", time: "17:42", author: "PhaseClerk", text: "Имаме 26 записани за детокс. Оставих 6 процедури без имена." },
          { id: "02", time: "17:50", author: "UmbraSix", text: "Добре. Тези шестима не трябва да изглеждат като участници в изпитване." },
          { id: "03", time: "18:01", author: "WaningCrescent", text: "Да пусна ли календарната покана за 23:40?" },
          { id: "04", time: "18:09", author: "UmbraSix", text: "Пусни я за 22:10. Дозирането остава устно." },
        ],
      },
      {
        id: "lab-ledger",
        title: "TideLedger / резултати",
        kind: "direct",
        participants: ["UmbraSix", "TideLedger"],
        lastActivity: "2025-10-12 09:38",
        unread: 0,
        messages: [
          { id: "01", time: "09:21", author: "TideLedger", text: "Доброволец 18 има опасни стойности в истинския резултат." },
          { id: "02", time: "09:24", author: "UmbraSix", text: "В публичния отчет остави само висок Остатък." },
          { id: "03", time: "09:31", author: "TideLedger", text: "А после името му изчезва от списъка?" },
          { id: "04", time: "09:38", author: "UmbraSix", text: "Точно това е защитата на Института.", highlighted: true },
        ],
      },
      {
        id: "eclipse-dose",
        title: "Затъмнение / серия B",
        kind: "group",
        participants: ["UmbraSix", "NadirCall", "CraterEye", "PhaseClerk"],
        lastActivity: "2025-10-14 23:58",
        unread: 2,
        messages: [
          { id: "01", time: "23:37", author: "CraterEye", text: "Серия B е подготвена. Чакаме началото на затъмнението." },
          { id: "02", time: "23:42", author: "UmbraSix", text: "Никой не съобщава номера на собствената си доза." },
          { id: "03", time: "23:49", author: "NadirCall", text: "Един нов иска да се обади на лекаря си." },
          { id: "04", time: "23:58", author: "UmbraSix", text: "Телефоните остават при PhaseClerk до края на наблюдението." },
        ],
      },
      {
        id: "sample-fridge",
        title: "Проби / хладилник B",
        kind: "group",
        participants: ["UmbraSix", "Samodiva.Pale", "Orisnitsa-3", "Zmeitsa"],
        lastActivity: "2025-10-13 22:47",
        unread: 3,
        messages: [
          { id: "01", time: "22:10", author: "Samodiva.Pale", text: "Останалите ампули от серия A са в хладилник B, само с дати." },
          { id: "02", time: "22:18", author: "Orisnitsa-3", text: "Имам трима нови кандидати: хронична болка, загуба и зависимост." },
          { id: "03", time: "22:31", author: "Zmeitsa", text: "Пробите ги нося без етикети. Нищо за състава в чата." },
          { id: "04", time: "22:47", author: "UmbraSix", text: "Кандидатът в траур е най-подходящ. Той вече иска да вярва на резултата.", highlighted: true },
        ],
      },
    ],
  },
  "hramat-na-gorchivata-chasha": {
    cultSlug: "hramat-na-gorchivata-chasha",
    owner: {
      handle: "VesperDose",
      displayName: "д-р Велин К.",
      statusLine: "Върховен аптекар / клиника и склад",
    },
    conversations: [
      {
        id: "communion-ledger",
        title: "Причастие / клиника",
        kind: "group",
        participants: ["VesperDose", "GlassSaint", "MercyDrop", "NightVial"],
        lastActivity: "2025-10-05 16:12",
        unread: 0,
        messages: [
          { id: "01", time: "15:49", author: "NightVial", text: "Клиничният регистър и вътрешният списък пак имат едни и същи номера." },
          { id: "02", time: "15:55", author: "VesperDose", text: "Имената никога не стоят до дълга и Причастието в един файл." },
          { id: "03", time: "16:03", author: "MercyDrop", text: "Един пациент отказва обета, но иска облекчение." },
          { id: "04", time: "16:12", author: "VesperDose", text: "Тогава още не е пациент. Оставете го да разбере кой спира болката.", highlighted: true },
        ],
      },
      {
        id: "aftercare-direct",
        title: "Aftercare",
        kind: "direct",
        participants: ["VesperDose", "Aftercare"],
        lastActivity: "2025-10-07 20:28",
        unread: 2,
        messages: [
          { id: "01", time: "20:02", author: "Aftercare", text: "Той издържа месец след програмата. Вчера пак се обади." },
          { id: "02", time: "20:06", author: "VesperDose", text: "Не го наричай рецидив. Наричай го завръщане." },
          { id: "03", time: "20:20", author: "Aftercare", text: "Иска помощ, но отказва да носи чужд дълг." },
          { id: "04", time: "20:28", author: "VesperDose", text: "Щом се е върнал, вече носи дълга. Само още не го знае." },
        ],
      },
      {
        id: "missing-patient",
        title: "Пациент без изписване",
        kind: "group",
        participants: ["VesperDose", "ColdPulse", "ClinicShade"],
        lastActivity: "2025-10-09 01:13",
        unread: 1,
        messages: [
          { id: "01", time: "00:44", author: "ColdPulse", text: "Публичното досие казва доброволно напускане. Вътрешното още го води в стаята." },
          { id: "02", time: "00:51", author: "VesperDose", text: "Тогава вътрешното досие трябва да спре да бъде медицинско." },
          { id: "03", time: "01:06", author: "ClinicShade", text: "Семейството пита защо телефонът му е изключен." },
          { id: "04", time: "01:13", author: "VesperDose", text: "Кажете им, че е прекъснал лечението и не желае контакт." },
        ],
      },
      {
        id: "sealed-cup",
        title: "NightVial",
        kind: "direct",
        participants: ["VesperDose", "NightVial"],
        lastActivity: "2025-10-11 13:47",
        unread: 0,
        messages: [
          { id: "01", time: "13:20", author: "NightVial", text: "Една запечатана пратка се върна без куриера." },
          { id: "02", time: "13:25", author: "VesperDose", text: "Печатът нарушен ли е?" },
          { id: "03", time: "13:39", author: "NightVial", text: "Не. Но адресът е клиника, която публично отрича връзка с нас." },
          { id: "04", time: "13:47", author: "VesperDose", text: "Тогава връзката работи точно както трябва.", highlighted: true },
        ],
      },
      {
        id: "abstinence-night",
        title: "Абстинентната нощ",
        kind: "group",
        participants: ["VesperDose", "MercyDrop", "GlassSaint", "ColdPulse"],
        lastActivity: "2025-10-15 19:33",
        unread: 3,
        messages: [
          { id: "01", time: "19:02", author: "ColdPulse", text: "Новият иска лекар и отказва камерата." },
          { id: "02", time: "19:08", author: "VesperDose", text: "Лекарят е отвън. Тук има само Чаша и обет." },
          { id: "03", time: "19:24", author: "GlassSaint", text: "Да запиша ли отказа като прекратяване на програмата?" },
          { id: "04", time: "19:33", author: "VesperDose", text: "Запиши го като начало. Нощта още не е свършила." },
        ],
      },
      {
        id: "debt-network",
        title: "Дълг / последваща грижа",
        kind: "group",
        participants: ["VesperDose", "PaleCourier", "Aftercare", "BitterChoir", "ClinicShade"],
        lastActivity: "2025-10-14 18:05",
        unread: 2,
        messages: [
          { id: "01", time: "17:12", author: "Aftercare", text: "Петима от програмата са близо до рецидив и двама вече загубиха работа." },
          { id: "02", time: "17:30", author: "BitterChoir", text: "Тогава могат да изплатят леглото и лечението с услуга." },
          { id: "03", time: "17:48", author: "PaleCourier", text: "Един отказва да носи запечатани неща." },
          { id: "04", time: "17:56", author: "ClinicShade", text: "Сестра му още вярва, че е излекуван." },
          { id: "05", time: "18:05", author: "VesperDose", text: "Напомнете му какво ще загуби, ако тя види истинското досие.", highlighted: true },
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
  "domat-na-tihite-naslednitsi": {
    cultSlug: "domat-na-tihite-naslednitsi",
    owner: {
      handle: "HouseMother",
      displayName: "Милена Р.",
      statusLine: "Главна настойница / домашни имена",
    },
    conversations: [
      {
        id: "intake-file",
        title: "Прием / временна грижа",
        kind: "group",
        participants: ["HouseMother", "PaperGuardian", "WhiteRibbon", "CradleLedger"],
        lastActivity: "2025-09-28 06:44",
        unread: 0,
        messages: [
          { id: "01", time: "06:12", author: "WhiteRibbon", text: "Майката подписа само за лагера. Не е виждала формуляра за временна грижа." },
          { id: "02", time: "06:20", author: "PaperGuardian", text: "Подписът е същият. Останалото е въпрос на подредба." },
          { id: "03", time: "06:31", author: "CradleLedger", text: "Детето вече фигурира в другата програма с домашното име." },
          { id: "04", time: "06:44", author: "HouseMother", text: "Преместете го преди родителят да разбере кой документ всъщност е подписал.", highlighted: true },
        ],
      },
      {
        id: "birth-name",
        title: "QuietTutor",
        kind: "direct",
        participants: ["HouseMother", "QuietTutor"],
        lastActivity: "2025-09-29 21:16",
        unread: 3,
        messages: [
          { id: "01", time: "20:58", author: "QuietTutor", text: "Малката още казва рожденото си име, когато се събуди." },
          { id: "02", time: "21:03", author: "HouseMother", text: "През деня използва ли домашното?" },
          { id: "03", time: "21:11", author: "QuietTutor", text: "Да, но пита кога майка й ще дойде." },
          { id: "04", time: "21:16", author: "HouseMother", text: "Тогава още помни грешната история. Без външни разговори до нова оценка." },
        ],
      },
      {
        id: "sibling-transfer",
        title: "Разделяне / преместване",
        kind: "group",
        participants: ["HouseMother", "DormKey", "CradleLedger", "ProxyParent"],
        lastActivity: "2025-10-01 19:22",
        unread: 1,
        messages: [
          { id: "01", time: "18:55", author: "DormKey", text: "Двете деца отказват да се разделят преди тръгване." },
          { id: "02", time: "19:02", author: "HouseMother", text: "Едното пътува сутринта, другото след проверката." },
          { id: "03", time: "19:18", author: "ProxyParent", text: "В новата къща каква роднинска връзка записвам?" },
          { id: "04", time: "19:22", author: "HouseMother", text: "Никаква. Временен гост, докато старият файл бъде затворен." },
        ],
      },
      {
        id: "inspection-script",
        title: "QuietTutor / проверка",
        kind: "direct",
        participants: ["HouseMother", "QuietTutor"],
        lastActivity: "2025-10-05 08:10",
        unread: 0,
        messages: [
          { id: "01", time: "07:41", author: "QuietTutor", text: "Социалната работничка иска разговор без настойник." },
          { id: "02", time: "07:46", author: "HouseMother", text: "Нека детето повтори защо само е поискало да остане." },
          { id: "03", time: "08:02", author: "QuietTutor", text: "Обърква датите и споменава старата къща." },
          { id: "04", time: "08:10", author: "HouseMother", text: "Тогава утре ще бъде в друга програма. Проверката ще види празно легло." },
        ],
      },
      {
        id: "parent-contact",
        title: "Родителски контакт",
        kind: "group",
        participants: ["HouseMother", "PaperGuardian", "WhiteRibbon", "SmallCoat"],
        lastActivity: "2025-10-12 05:55",
        unread: 2,
        messages: [
          { id: "01", time: "05:21", author: "WhiteRibbon", text: "Бащата идва с адвокат и иска оригинала на формуляра." },
          { id: "02", time: "05:27", author: "PaperGuardian", text: "Оригиналът вече е при другото юридическо лице." },
          { id: "03", time: "05:49", author: "SmallCoat", text: "Детето остави рисунка с адреса на старата къща." },
          { id: "04", time: "05:55", author: "HouseMother", text: "Приберете рисунката при вещите. Нищо от стария живот не стига до проверката.", highlighted: true },
        ],
      },
      {
        id: "inheritance-class",
        title: "Наследниците / старша група",
        kind: "group",
        participants: ["HouseMother", "QuietTutor", "ProxyParent", "CradleLedger"],
        lastActivity: "2025-10-10 21:30",
        unread: 1,
        messages: [
          { id: "01", time: "20:02", author: "QuietTutor", text: "Двама от старшите вече коригират по-малките, когато използват рождени имена." },
          { id: "02", time: "20:15", author: "ProxyParent", text: "Единият пита дали някога ще види собственото си досие." },
          { id: "03", time: "20:48", author: "CradleLedger", text: "В неговия файл има три различни фамилии." },
          { id: "04", time: "21:30", author: "HouseMother", text: "Когато стане настойник, ще разбере защо Наследникът няма нужда от минало.", highlighted: true },
        ],
      },
    ],
  },
  "tihia-brod": {
    cultSlug: "tihia-brod",
    owner: {
      handle: "RoteShepherd",
      displayName: "Благой Р.",
      statusLine: "Пастир / транзит и разпределение",
    },
    conversations: [
      {
        id: "night-route",
        title: "Маршрут без покритие",
        kind: "group",
        participants: ["RoteShepherd", "ToneBearer", "LichenFoot", "GridWalker"],
        lastActivity: "2025-10-03 22:41",
        unread: 2,
        messages: [
          { id: "01", time: "22:10", author: "GridWalker", text: "След третата чешма няма сигнал. Това устройва ли ни?" },
          { id: "02", time: "22:13", author: "RoteShepherd", text: "Точно там започва пътят. Преди това е разходка." },
          { id: "03", time: "22:28", author: "ToneBearer", text: "Камбаната се чува до дерето." },
          { id: "04", time: "22:41", author: "RoteShepherd", text: "Който следва звука, не пита накъде отива.", highlighted: true },
        ],
      },
      {
        id: "moss-direct",
        title: "LichenFoot",
        kind: "direct",
        participants: ["RoteShepherd", "LichenFoot"],
        lastActivity: "2025-10-04 00:29",
        unread: 0,
        messages: [
          { id: "01", time: "00:03", author: "LichenFoot", text: "Едно момче паникьоса при калта. Искаше телефон." },
          { id: "02", time: "00:08", author: "RoteShepherd", text: "Телефонът и документите пътуват отделно. Не му ги връщай." },
          { id: "03", time: "00:18", author: "LichenFoot", text: "Той каза, че не е подписвал за това." },
          { id: "04", time: "00:29", author: "RoteShepherd", text: "Кажи му, че леглото и пътят вече са добавени към дълга." },
        ],
      },
      {
        id: "hut",
        title: "Крайпътна къща",
        kind: "group",
        participants: ["RoteShepherd", "GridWalker", "TimberSill"],
        lastActivity: "2025-10-06 17:36",
        unread: 1,
        messages: [
          { id: "01", time: "17:04", author: "TimberSill", text: "Къщата е готова. Четири легла, но в обявата обещахме две стаи." },
          { id: "02", time: "17:11", author: "RoteShepherd", text: "Няма значение. До сутринта двама продължават." },
          { id: "03", time: "17:24", author: "GridWalker", text: "Да маркирам ли адреса на картата?" },
          { id: "04", time: "17:36", author: "RoteShepherd", text: "Само с име, което външните няма да търсят." },
        ],
      },
      {
        id: "bell",
        title: "ToneBearer",
        kind: "direct",
        participants: ["RoteShepherd", "ToneBearer"],
        lastActivity: "2025-10-09 23:07",
        unread: 4,
        messages: [
          { id: "01", time: "22:39", author: "ToneBearer", text: "Седемдесет и седем минути минаха. Двама още не се връщат." },
          { id: "02", time: "22:44", author: "RoteShepherd", text: "Не ги викай по име." },
          { id: "03", time: "22:58", author: "ToneBearer", text: "Единият отговори на камбаната." },
          { id: "04", time: "23:07", author: "RoteShepherd", text: "Тогава вече знае кой звук да следва." },
        ],
      },
      {
        id: "transfer",
        title: "Преход / втори край",
        kind: "group",
        participants: ["RoteShepherd", "LichenFoot", "LowBeam", "GridWalker"],
        lastActivity: "2025-10-14 02:12",
        unread: 0,
        messages: [
          { id: "01", time: "01:33", author: "LowBeam", text: "Ще чакам при пътя след моста. Без фарове." },
          { id: "02", time: "01:38", author: "RoteShepherd", text: "Групата ще мисли, че маршрутът свършва при къщата." },
          { id: "03", time: "01:52", author: "LichenFoot", text: "А ако някой брои хората?" },
          { id: "04", time: "02:12", author: "RoteShepherd", text: "В регистъра ще пише, че двамата сами са сменили работата.", highlighted: true },
        ],
      },
      {
        id: "flock-count",
        title: "Броене / дългове",
        kind: "group",
        participants: ["RoteShepherd", "Hlopka.Dull", "Kaval.Stop", "Stado-13"],
        lastActivity: "2025-10-12 00:44",
        unread: 3,
        messages: [
          { id: "01", time: "23:40", author: "Hlopka.Dull", text: "Тримата от обявата за работа вече са при къщата. Никой няма копие от договора." },
          { id: "02", time: "23:58", author: "Kaval.Stop", text: "На пътеката имаше туристи. Засвирих и всички замръзнаха." },
          { id: "03", time: "00:21", author: "Stado-13", text: "Тръгнаха 14, в първия регистър са 13. Пак." },
          { id: "04", time: "00:44", author: "RoteShepherd", text: "Запиши 13 и добави пътя на липсващия към общия дълг.", highlighted: true },
        ],
      },
    ],
  },
  "saborat-na-chernia-oltar": {
    cultSlug: "saborat-na-chernia-oltar",
    owner: {
      handle: "BlackVicar",
      displayName: "Магдалена Ц.",
      statusLine: "Черен викарий / пазител на обетите",
    },
    conversations: [
      {
        id: "ash-command",
        title: "Заповед в пепел",
        kind: "group",
        participants: ["BlackVicar", "HornBearer", "AshWitness", "PactKeeper"],
        lastActivity: "2025-10-02 03:07",
        unread: 2,
        messages: [
          { id: "01", time: "02:41", author: "HornBearer", text: "Печатът е цял. Събранието още не знае имената на другите участници." },
          { id: "02", time: "02:45", author: "BlackVicar", text: "Трябва да знаят само своята жертва и часа на клетвата." },
          { id: "03", time: "02:58", author: "AshWitness", text: "Един пита дали заповедта е символична." },
          { id: "04", time: "03:07", author: "BlackVicar", text: "Пред Черния олтар символът няма стойност, ако никой не пострада.", highlighted: true },
        ],
      },
      {
        id: "confession-vault",
        title: "PactKeeper / признание",
        kind: "direct",
        participants: ["BlackVicar", "PactKeeper"],
        lastActivity: "2025-10-04 01:18",
        unread: 0,
        messages: [
          { id: "01", time: "00:53", author: "PactKeeper", text: "Новият записа признание, но отказа да назове човека, който му помогна." },
          { id: "02", time: "00:59", author: "BlackVicar", text: "Тогава признанието още е изповед, не обет." },
          { id: "03", time: "01:10", author: "PactKeeper", text: "Ако добави името, ще повлече и друг човек." },
          { id: "04", time: "01:18", author: "BlackVicar", text: "Точно това отличава вината от служението." },
        ],
      },
      {
        id: "black-communion",
        title: "Черното причастие",
        kind: "group",
        participants: ["BlackVicar", "GraveCantor", "AshWitness", "Reliquary"],
        lastActivity: "2025-10-07 22:11",
        unread: 1,
        messages: [
          { id: "01", time: "21:33", author: "Reliquary", text: "Доказателството е при олтара. Ритуалното име не съвпада с номера на случая." },
          { id: "02", time: "21:39", author: "BlackVicar", text: "И не трябва. Законът вижда случай, Дяволът вижда дар." },
          { id: "03", time: "21:55", author: "GraveCantor", text: "Посветеният трепери и иска да оттегли клетвата." },
          { id: "04", time: "22:11", author: "BlackVicar", text: "Пуснете му записа. Нека чуе на кого вече принадлежи." },
        ],
      },
      {
        id: "bitter-cup-contact",
        title: "Външен доставчик",
        kind: "direct",
        participants: ["BlackVicar", "CinderSeal"],
        lastActivity: "2025-10-11 13:52",
        unread: 2,
        messages: [
          { id: "01", time: "13:29", author: "CinderSeal", text: "Горчивата чаша предлага да заличи спомена на един от посветените." },
          { id: "02", time: "13:33", author: "BlackVicar", text: "Споменът може да избледнее. Записът остава." },
          { id: "03", time: "13:45", author: "CinderSeal", text: "Искат достъп до признанието като гаранция." },
          { id: "04", time: "13:52", author: "BlackVicar", text: "Никой външен не получава целия грях. Само достатъчно, за да се страхува.", highlighted: true },
        ],
      },
      {
        id: "patron-oath",
        title: "Дарител / обет",
        kind: "group",
        participants: ["BlackVicar", "MourningStar", "PactKeeper", "PaleDeacon"],
        lastActivity: "2025-10-15 21:48",
        unread: 5,
        messages: [
          { id: "01", time: "21:02", author: "MourningStar", text: "Дарителят иска място в Събора, но отказва да остави доказателство." },
          { id: "02", time: "21:09", author: "BlackVicar", text: "Тогава купува вечеря, не място пред олтара." },
          { id: "03", time: "21:27", author: "PactKeeper", text: "Предлага пари и чуждо признание." },
          { id: "04", time: "21:48", author: "BlackVicar", text: "Черният олтар приема само онова, което може да унищожи дарителя." },
        ],
      },
      {
        id: "night-of-desecration",
        title: "Нощ на оскверняването",
        kind: "group",
        participants: ["BlackVicar", "HornBearer", "Nocturne", "AshWitness"],
        lastActivity: "2025-10-09 03:12",
        unread: 2,
        messages: [
          { id: "01", time: "02:20", author: "HornBearer", text: "Заповедите са разделени. Нито едно събрание няма целия списък." },
          { id: "02", time: "02:34", author: "Nocturne", text: "Едните вярват, че задачата е предупреждение. Другите — че е жертва." },
          { id: "03", time: "02:51", author: "AshWitness", text: "Кога ще разберат какво са направили заедно?" },
          { id: "04", time: "03:12", author: "BlackVicar", text: "Когато вече не могат да се откажат един от друг.", highlighted: true },
        ],
      },
    ],
  },
  "belia-priliv": {
    cultSlug: "belia-priliv",
    owner: {
      handle: "Meridian",
      displayName: "Антония В.",
      statusLine: "патрон / Белият прием",
    },
    conversations: [
      {
        id: "white-reception",
        title: "Вила / Белият прием",
        kind: "group",
        participants: ["Meridian", "CoachRidge", "GlassCeiling", "CapitalZero"],
        lastActivity: "2025-10-06 22:17",
        unread: 0,
        messages: [
          { id: "01", time: "21:49", author: "GlassCeiling", text: "Гостът отказва да каже какъв проблем иска да решим." },
          { id: "02", time: "21:55", author: "Meridian", text: "Тогава патроните ще кажат какво вече знаят за него." },
          { id: "03", time: "22:08", author: "CoachRidge", text: "Разбра, че сме платили стария му дълг. Остана." },
          { id: "04", time: "22:17", author: "Meridian", text: "Добре. Сега услугата е наша, дори още да не сме я поискали.", highlighted: true },
        ],
      },
      {
        id: "investor",
        title: "CapitalZero",
        kind: "direct",
        participants: ["Meridian", "CapitalZero"],
        lastActivity: "2025-10-08 10:42",
        unread: 1,
        messages: [
          { id: "01", time: "10:11", author: "CapitalZero", text: "Защо чартърът и охраната минават през различни фирми?" },
          { id: "02", time: "10:16", author: "Meridian", text: "Защото чистата регата е по-важна от евтината." },
          { id: "03", time: "10:31", author: "CapitalZero", text: "Името Легионът на Първия закон да не се вижда никъде." },
          { id: "04", time: "10:42", author: "Meridian", text: "Няма да се вижда. Те са услуга, не партньор." },
        ],
      },
      {
        id: "silence-contract",
        title: "Договор / мълчание",
        kind: "group",
        participants: ["Meridian", "CoachRidge", "FinePrint"],
        lastActivity: "2025-10-09 19:03",
        unread: 2,
        messages: [
          { id: "01", time: "18:34", author: "FinePrint", text: "Подписите за мълчание са събрани. Двама не разбраха клаузата за бъдеща услуга." },
          { id: "02", time: "18:41", author: "Meridian", text: "Не е нужно да я разбират сега. Ще я разберат, когато им потрябва Палатата." },
          { id: "03", time: "18:57", author: "CoachRidge", text: "Един пита дали може да снима на яхтата." },
          { id: "04", time: "19:03", author: "Meridian", text: "Гостите не снимат. Палатата пази спомените вместо тях." },
        ],
      },
      {
        id: "glasshr",
        title: "GlassCeiling",
        kind: "direct",
        participants: ["Meridian", "GlassCeiling"],
        lastActivity: "2025-10-13 08:28",
        unread: 0,
        messages: [
          { id: "01", time: "08:05", author: "GlassCeiling", text: "Имаме профил, който може да се използва от Братството." },
          { id: "02", time: "08:09", author: "Meridian", text: "Не използваме хора. Подреждаме възможности." },
          { id: "03", time: "08:21", author: "GlassCeiling", text: "Това звучи по-зле." },
          { id: "04", time: "08:28", author: "Meridian", text: "Звучи по-чисто в протокол." },
        ],
      },
      {
        id: "private-salon",
        title: "Частен салон / яхта",
        kind: "group",
        participants: ["Meridian", "CapitalZero", "SecureFloor", "ShameBroker"],
        lastActivity: "2025-10-15 18:52",
        unread: 3,
        messages: [
          { id: "01", time: "18:11", author: "ShameBroker", text: "Поканите за Огледален преход са готови. Някои имена са чувствителни." },
          { id: "02", time: "18:18", author: "Meridian", text: "Чувствителните имена са най-ценни. Качете ги след официалната регата." },
          { id: "03", time: "18:39", author: "SecureFloor", text: "Екипажът е сменен, ако плащането е потвърдено." },
          { id: "04", time: "18:52", author: "Meridian", text: "Потвърдено. Няма директна връзка между нас.", highlighted: true },
        ],
      },
      {
        id: "auction-ledger",
        title: "Търг на прилива / сметки",
        kind: "group",
        participants: ["Meridian", "Chorbadzhi.Gilt", "SilkBoyar", "Knyaz.Offshore"],
        lastActivity: "2025-10-11 23:05",
        unread: 2,
        messages: [
          { id: "01", time: "22:12", author: "Chorbadzhi.Gilt", text: "Поемам проблема с разрешителното. В замяна искам една бъдеща услуга." },
          { id: "02", time: "22:30", author: "SilkBoyar", text: "Поканите за вилата са с моя подпис. Двама от списъка остават на брега." },
          { id: "03", time: "22:47", author: "Knyaz.Offshore", text: "Чартърът, ремонтът и вилата минават през три фирми. Пълномощникът е един." },
          { id: "04", time: "23:05", author: "Meridian", text: "Никой не проверява какво става след Белия прием.", highlighted: true },
        ],
      },
    ],
  },
  "parviat-zakon": {
    cultSlug: "parviat-zakon",
    owner: {
      handle: "Silverback",
      displayName: "Здравко Б.",
      statusLine: "командир / платен периметър",
    },
    conversations: [
      {
        id: "gym",
        title: "Зала след 23",
        kind: "group",
        participants: ["Silverback", "KnuckleWrap", "IronGrip", "PackAlpha"],
        lastActivity: "2025-10-05 23:36",
        unread: 1,
        messages: [
          { id: "01", time: "23:05", author: "IronGrip", text: "В симулацията новият изведе човек през правилния изход, но без заповед." },
          { id: "02", time: "23:12", author: "Silverback", text: "Тогава стои отпред. Всички трябва да видят грешката." },
          { id: "03", time: "23:24", author: "KnuckleWrap", text: "Но решението му беше правилно." },
          { id: "04", time: "23:36", author: "Silverback", text: "Правилно без команда е неподчинение.", highlighted: true },
        ],
      },
      {
        id: "back-alley",
        title: "BackAlley",
        kind: "direct",
        participants: ["Silverback", "BackAlley"],
        lastActivity: "2025-10-10 17:22",
        unread: 0,
        messages: [
          { id: "01", time: "16:49", author: "BackAlley", text: "Клиентът иска двама за вход. Без приказки." },
          { id: "02", time: "16:55", author: "Silverback", text: "Имам двама, които слушат от първия път." },
          { id: "03", time: "17:11", author: "BackAlley", text: "Не иска символи, не иска ритуални глупости." },
          { id: "04", time: "17:22", author: "Silverback", text: "Ние сме стената. Другите си носят символите." },
        ],
      },
      {
        id: "garage",
        title: "Гараж / клиентско оборудване",
        kind: "group",
        participants: ["Silverback", "IronGrip", "KnuckleWrap"],
        lastActivity: "2025-10-12 02:06",
        unread: 2,
        messages: [
          { id: "01", time: "01:31", author: "KnuckleWrap", text: "Качихме оборудването. Няма знак на охранителна фирма." },
          { id: "02", time: "01:38", author: "Silverback", text: "Не питаме за клиента. Местим и приключваме." },
          { id: "03", time: "01:52", author: "IronGrip", text: "Съседът гледаше от балкона." },
          { id: "04", time: "02:06", author: "Silverback", text: "Запомнил е камиона, не хората. Това стига." },
        ],
      },
      {
        id: "miro-direct",
        title: "IronGrip",
        kind: "direct",
        participants: ["Silverback", "IronGrip"],
        lastActivity: "2025-10-14 20:14",
        unread: 0,
        messages: [
          { id: "01", time: "19:43", author: "IronGrip", text: "Един от нашите пита защо работим за хора с маски." },
          { id: "02", time: "19:51", author: "Silverback", text: "Кажи му, че парите нямат лице." },
          { id: "03", time: "20:04", author: "IronGrip", text: "А ако пак пита?" },
          { id: "04", time: "20:14", author: "Silverback", text: "Тогава още не е наш." },
        ],
      },
      {
        id: "perimeter",
        title: "Периметър",
        kind: "group",
        participants: ["Silverback", "KnuckleWrap", "BackAlley", "LampPost"],
        lastActivity: "2025-10-15 22:27",
        unread: 5,
        messages: [
          { id: "01", time: "21:56", author: "LampPost", text: "Сервизният вход е тих, но не е празен." },
          { id: "02", time: "22:03", author: "Silverback", text: "Празно не ни трябва. Контролирано ни трябва." },
          { id: "03", time: "22:19", author: "BackAlley", text: "Никой да не влиза след 22:30 без знак." },
          { id: "04", time: "22:27", author: "Silverback", text: "Разбрано. Стената се затваря.", highlighted: true },
        ],
      },
      {
        id: "masks",
        title: "Маски / вход",
        kind: "group",
        participants: ["Silverback", "Haidut-Balkan", "Pehlivan-9", "KukerMask"],
        lastActivity: "2025-10-13 01:20",
        unread: 2,
        messages: [
          { id: "01", time: "00:10", author: "Haidut-Balkan", text: "Нощната симулация приключи извън града. Никой не знаеше кога стана реална смяна." },
          { id: "02", time: "00:31", author: "Pehlivan-9", text: "Двама оспориха командата. Целият им екип слиза един ранг." },
          { id: "03", time: "00:52", author: "KukerMask", text: "Анонимната екипировка за входа е готова. Никой няма да види лице." },
          { id: "04", time: "01:20", author: "Silverback", text: "Лицата не ни трябват. Трябва ни стената.", highlighted: true },
        ],
      },
    ],
  },
  "vtoroto-tialo": {
    cultSlug: "vtoroto-tialo",
    owner: {
      handle: "LastReel",
      displayName: "Злата Н.",
      statusLine: "администратор / обучение на двойници",
    },
    conversations: [
      {
        id: "mirror-copy",
        title: "Огледално копие 04",
        kind: "group",
        participants: ["LastReel", "MagneticHymn", "HeartbeatSheet", "ReverseGlass"],
        lastActivity: "2025-10-02 00:26",
        unread: 3,
        messages: [
          { id: "01", time: "23:58", author: "MagneticHymn", text: "Двойникът повтаря същата фраза. Кандидатът забеляза." },
          { id: "02", time: "00:04", author: "LastReel", text: "Добави последния му гласов архив. Повторението трябва да звучи като спомен." },
          { id: "03", time: "00:17", author: "HeartbeatSheet", text: "Двама отказаха да дадат достъп до личните съобщения." },
          { id: "04", time: "00:26", author: "LastReel", text: "Тогава покажете празните места в копието. Сами ще поискат да ги запълнят.", highlighted: true },
        ],
      },
      {
        id: "voice-model",
        title: "MagneticHymn",
        kind: "direct",
        participants: ["LastReel", "MagneticHymn"],
        lastActivity: "2025-10-03 14:48",
        unread: 0,
        messages: [
          { id: "01", time: "14:21", author: "MagneticHymn", text: "Имам нов гласов модел, но липсват разговорите от последната година." },
          { id: "02", time: "14:27", author: "LastReel", text: "Остави празното. Кажи на близкия, че копието има нужда от още памет." },
          { id: "03", time: "14:39", author: "MagneticHymn", text: "Да използвам ли съобщението, което е изтрил?" },
          { id: "04", time: "14:48", author: "LastReel", text: "Да. Невъзможният спомен е най-силното доказателство." },
        ],
      },
      {
        id: "profile-merge",
        title: "Сливане на профили",
        kind: "group",
        participants: ["LastReel", "HeartbeatSheet", "DoctorStatic"],
        lastActivity: "2025-10-07 01:41",
        unread: 2,
        messages: [
          { id: "01", time: "01:09", author: "HeartbeatSheet", text: "Добавих здравните данни. Копието вече предсказва кога тя няма да спи." },
          { id: "02", time: "01:14", author: "LastReel", text: "Свържи ги с разходите и първата дума от сесията." },
          { id: "03", time: "01:30", author: "DoctorStatic", text: "Това вече не е услуга за скръб. Това е пълен поведенчески профил." },
          { id: "04", time: "01:41", author: "LastReel", text: "Второто тяло не може да бъде половин човек." },
        ],
      },
      {
        id: "avatar-test",
        title: "ReverseGlass",
        kind: "direct",
        participants: ["LastReel", "ReverseGlass"],
        lastActivity: "2025-10-10 20:33",
        unread: 1,
        messages: [
          { id: "01", time: "20:02", author: "ReverseGlass", text: "Аватарът използва интонацията й, но лицето още трепва." },
          { id: "02", time: "20:09", author: "LastReel", text: "Покажи й стара версия. Нека сама поиска по-точно копие." },
          { id: "03", time: "20:26", author: "ReverseGlass", text: "Тя каза, че двойникът я познава по-добре от семейството й." },
          { id: "04", time: "20:33", author: "LastReel", text: "Запази това. То е съгласие за следващото ниво." },
        ],
      },
      {
        id: "handoff",
        title: "След Огледалното копие",
        kind: "group",
        participants: ["LastReel", "ProjectionHook", "HeartbeatSheet", "DoctorStatic"],
        lastActivity: "2025-10-14 23:19",
        unread: 4,
        messages: [
          { id: "01", time: "22:44", author: "ProjectionHook", text: "Институтът иска двама профили в траур, които вече търсят обяснение." },
          { id: "02", time: "22:52", author: "LastReel", text: "Имам един след последното копие. Дава достъп всеки път, когато аватарът замълчи." },
          { id: "03", time: "23:06", author: "HeartbeatSheet", text: "Да пратя здравния и поведенческия слой?" },
          { id: "04", time: "23:19", author: "LastReel", text: "Само индекса и контакта. Пълното Второ тяло остава при нас.", highlighted: true },
        ],
      },
      {
        id: "migration-prep",
        title: "Голямата миграция / подготовка",
        kind: "group",
        participants: ["LastReel", "TalasumFrame", "Karakondzhul.VHS", "NaviTape"],
        lastActivity: "2025-10-08 02:15",
        unread: 2,
        messages: [
          { id: "01", time: "01:10", author: "TalasumFrame", text: "Синтетичните записи на двамата администратори са готови. Изглеждат като признание." },
          { id: "02", time: "01:32", author: "Karakondzhul.VHS", text: "Клетките приемат отделни задачи. Никоя не знае какво ще падне първо." },
          { id: "03", time: "01:50", author: "NaviTape", text: "Публичният архив вече се рекламира като защита при цифров срив." },
          { id: "04", time: "02:15", author: "LastReel", text: "Добре. Когато започне паниката, Второто тяло трябва да изглежда като единственото резервно копие.", highlighted: true },
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
