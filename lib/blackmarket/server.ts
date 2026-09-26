// Server-only operations. No browser state grants access or changes balances.
import { createHmac, randomUUID } from "node:crypto";
import { getPlayer, saveMarket } from "@/lib/hc/store";
import type { PlayerRecord } from "@/lib/hc/types";
import { MARKET_MISSION, getService } from "./catalog";
import { GAME_PAGES } from "./pages";
import type { MarketMessage, MarketState } from "./types";

export class MarketError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export const hasMarketAccess = (p: Pick<PlayerRecord, "completedTasks">) =>
  p.completedTasks.includes(MARKET_MISSION);

export function pageCodes(playerCode: string): Record<string, string> {
  return Object.fromEntries(
    GAME_PAGES.map((route) => [
      route,
      "HW2-" +
        createHmac("sha256", playerCode)
          .update(`page-v1:${route}`)
          .digest("hex")
          .slice(0, 12)
          .toUpperCase(),
    ]),
  );
}
function resolvePage(player: PlayerRecord, value: string) {
  return Object.entries(pageCodes(player.code)).find(
    ([, code]) => code === value.trim().toUpperCase(),
  )?.[0];
}

// Curated case evidence, never live lookups of devices or external accounts.
const ARCHIVES: Record<
  string,
  { title: string; columns: string[]; rows: string[][] }
> = {
  "/hidden-wiki-2/events/guestbook": {
    title: "Възстановен регистър / EV-OGL-02",
    columns: ["Организация / събитие", "Изтрито поле", "Възстановен запис"],
    rows: [
      ["Огледален преход", "Дата / вход", "15.10.2025 / служебен вход Б"],
      ["Примати", "Отговорник", "Silverback — периметър след 22:30"],
      ["Апекс", "Покани", "ShameBroker — посредник"],
      ["Братството", "Регистрация", "Лора Костова — поканена от GothGirl"],
    ],
  },
  "/hidden-wiki-2/forum/deadletters": {
    title: "Mailbox / фрагмент 06",
    columns: ["Поле", "Възстановено съдържание"],
    rows: [
      ["От", "relay_ash"],
      ["До", "PageGhost"],
      ["Час", "15.10.2025 / 22:17"],
      ["Текст", "Не местете списъка. Вход Б. Западно крило, стая 9."],
      ["Подпис", "MIRROR / 7D2A-0917"],
    ],
  },
  "/hidden-wiki-2/leaks/docs": {
    title: "Редакция / транспортен опис",
    columns: ["Поле", "Преди редакцията"],
    rows: [
      ["Превоз", "Черно Audi A3"],
      ["Час", "15.10.2025 / 22:09"],
      ["Изтрит получател", "Р. Алексиев"],
      [
        "Бележка",
        "Съпостави с vehicle archive; името само по себе си не е доказателство.",
      ],
    ],
  },
  "/hidden-wiki-2/events/tickets": {
    title: "Служебна квота / MIRROR",
    columns: ["Пропуск", "Роля", "Вход"],
    rows: [
      ["MR-09", "Регистрация — GothGirl", "Б / 21:45"],
      ["MR-14", "Транспорт — NightKiller", "Б / 22:09"],
    ],
  },
};

export function fingerprint(route: string) {
  if (
    [
      "/hidden-wiki-2/events/guestbook",
      "/hidden-wiki-2/forum/deadletters",
    ].includes(route)
  )
    return "7D2A-0917-MIRROR";
  return createHmac("sha256", "hw2-fictional-archive")
    .update(route)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
}

export function comparePages(player: PlayerRecord, a: string, b: string) {
  const left = resolvePage(player, a),
    right = resolvePage(player, b);
  if (!left || !right)
    throw new MarketError(
      "Невалиден персонален код. Копирай двата кода от страниците на твоя профил.",
    );
  return {
    left,
    right,
    first: fingerprint(left),
    second: fingerprint(right),
    match: fingerprint(left) === fingerprint(right),
    samePage: left === right,
  };
}

export type MarketAction =
  | { action: "purchase"; service: string }
  | { action: "message"; service: string; text: string; requestId: string }
  | { action: "read"; service: string; through: number }
  | { action: "reset" }
  | { action: "install"; patch: string };

function applyAction(
  player: PlayerRecord,
  action: MarketAction,
): { market: MarketState; cost: number } {
  const market = structuredClone(player.blackmarket);
  let cost = 0;
  const now = Date.now();
  if (action.action === "purchase") {
    const service = getService(action.service);
    if (!service) throw new MarketError("Няма такъв изпълнител.", 404);
    if (market.orders.some((o) => o.service === service.id))
      return { market, cost };
    cost = service.price;
    market.orders.push({
      service: service.id,
      paid: cost,
      purchasedAt: now,
      readAt: 0,
      fulfilled: [],
      messages: [
        {
          id: randomUUID(),
          from: "operator",
          text: service.instructions,
          at: now,
        },
      ],
    });
  } else if (action.action === "message") {
    const order = market.orders.find((o) => o.service === action.service);
    if (!order) throw new MarketError("Първо закупи услугата.", 403);
    if (order.messages.some((m) => m.id === action.requestId))
      return { market, cost };
    if (order.messages.length >= 200)
      throw new MarketError("Архивът на тази поръчка е пълен.");
    const route = resolvePage(player, action.text);
    let text = "",
      key = route ?? "",
      artifact: MarketMessage["artifact"];
    const expect = (path: string) => {
      if (route !== path)
        throw new MarketError(
          `Изпрати PAGE CODE от ${path.replace("/hidden-wiki-2", "")}. Кодът е в долната част на страницата.`,
        );
    };
    if (action.service === "pageghost") {
      if (!route)
        throw new MarketError("Това не е персонален PAGE CODE от твоя профил.");
      const archive = ARCHIVES[route];
      text = archive
        ? "Възстанових четимите полета. Свери резултата с още един източник. Patch mailbox-v1 е добавен към инструментите ти; изтегли го от началната страница на Blackmarket и го инсталирай в терминала."
        : "Кодът е валиден, но за тази страница няма запазен четим фрагмент. Опитай регистъра /events/guestbook, /forum/deadletters, /leaks/docs или /events/tickets. Няма допълнителна такса.";
      if (archive) {
        artifact = { ...archive, route };
        if (!market.patches.includes("mailbox-v1"))
          market.patches.push("mailbox-v1");
      }
    } else if (action.service === "cardforge") {
      expect("/hidden-wiki-2/events/tickets");
      market.membership = true;
      text = `Членската карта MIRROR е издадена на ${player.handle}. Отвори /events/tickets — служебният регистър вече те разпознава.`;
      artifact = {
        title: "Членска карта / MIRROR",
        columns: ["Профил", "Достъп"],
        rows: [[player.handle, "Служебен регистър EV-OGL-02"]],
        route: route!,
      };
    } else if (action.service === "celltrace") {
      const number = action.text.replace(/[\s()-]/g, "");
      if (
        ![
          "+359884121221",
          "0884121221",
          "+35988***1221",
          "0888***1221",
        ].includes(number)
      )
        throw new MarketError(
          "Номерът не е в архива на случая. Виж повтарящия се номер за Audi A3 в /leaks/vehicles. Няма начислена такса.",
        );
      key = "phone:1221";
      if (!order.fulfilled.includes(key)) cost = 10;
      text =
        "Архивът е обработен. Адресите са игрови записи, не GPS координати. Сравни последната сесия с mailbox фрагмента. Повторната справка за този номер е безплатна.";
      artifact = {
        title: "CellTrace / номер …1221",
        columns: ["Дата", "Час (UTC+3)", "IP адрес", "Архивен възел"],
        rows: [
          ["15.10.2025", "21:56:04", "192.0.2.14", "relay / вход Б"],
          ["15.10.2025", "22:09:18", "198.51.100.23", "transit / A3"],
          ["15.10.2025", "22:12:06", "198.51.100.23", "повторна сесия"],
          ["15.10.2025", "22:17:31", "203.0.113.9", "mailbox / MIRROR"],
        ],
        route: "/hidden-wiki-2/leaks/vehicles",
      };
    } else if (action.service === "live-eye") {
      expect("/hidden-wiki-2/red-room/signal-log");
      text =
        "Сигналът е „локализиран“. Прилагам кадър LE-001. [Системна проверка: времето в кадъра е 14.10.2025, а заявката е за 15.10.2025. Същият fingerprint се среща в няколко пакета. Това е повторение, не livestream. Платените 100 HC не се възстановяват.]";
      artifact = {
        title: "LE-001 / повторен кадър",
        columns: ["Твърдение", "Проверка"],
        rows: [
          ["Живо излъчване", "Архив от 14.10.2025 / 03:17"],
          ["Точна локация", "Няма проверими координати"],
          ["Fingerprint", "DECOY-001 / използван повторно"],
        ],
        route: route!,
        suspicious: true,
      };
    } else if (action.service === "bruteforce") {
      expect("/hidden-wiki-2/leaks/passwords");
      if (!market.patches.includes("password-v1"))
        market.patches.push("password-v1");
      text =
        "Patch password-v1 е активиран за този dump. В /leaks/passwords вече има бутон „Анализирай GothGirl“. Резултатът работи в игровия чат на Братството.";
    }
    if (!order.fulfilled.includes(key)) order.fulfilled.push(key);
    order.paid += cost;
    order.messages.push(
      { id: action.requestId, from: "player", text: action.text, at: now },
      { id: randomUUID(), from: "operator", text, at: now + 1, artifact },
    );
  } else if (action.action === "read") {
    const order = market.orders.find((o) => o.service === action.service);
    if (!order) throw new MarketError("Поръчката не е намерена.", 404);
    order.readAt = Math.max(order.readAt, Math.min(action.through, now + 1));
  } else if (action.action === "install") {
    if (!market.patches.includes(action.patch))
      throw new MarketError(
        "Patch-ът не е получен. Свържи се с PageGhost.",
        403,
      );
    if (!market.installed.includes(action.patch))
      market.installed.push(action.patch);
  } else if (action.action === "reset") {
    market.installed = [];
    market.resetCount++;
  }
  if (player.coins < cost)
    throw new MarketError(
      `Недостатъчно HC. Нужни са ${cost} HC, налични: ${player.coins}.`,
      409,
    );
  market.revision++;
  return { market, cost };
}

export async function mutateMarket(code: string, action: MarketAction) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const player = await getPlayer(code);
    if (!player) throw new MarketError("Сесията е невалидна.", 401);
    if (!hasMarketAccess(player))
      throw new MarketError(
        "Blackmarket е заключен. Изпълни специалната MONEYTASKS мисия.",
        403,
      );
    const { market, cost } = applyAction(player, action);
    if (market.revision === player.blackmarket.revision) return player;
    if (await saveMarket(player, market, cost)) return (await getPlayer(code))!;
  }
  throw new MarketError("Има друга активна операция. Опитай отново.", 409);
}
