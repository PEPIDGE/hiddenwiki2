"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMarket } from "@/lib/blackmarket/client";
import { MARKET_ROOT } from "@/lib/blackmarket/catalog";
import { addClue, getGameState, saveGameState } from "@/lib/game-state";
import s from "./market.module.css";

export function PageIdentity() {
  const pathname = usePathname() ?? "";
  const { codes } = useMarket();
  const [copied, setCopied] = useState(false);
  useEffect(() => setCopied(false), [pathname]);
  const code = codes[pathname.replace(/\/$/, "") || "/"];
  if (!code) return null;
  return (
    <div className={s.pageCode}>
      <span>PAGE CODE / ЛИЧЕН АРХИВ</span>
      <button
        title="Копирай кода за Blackmarket"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "КОПИРАНО ✓" : code}
      </button>
      <span>Изпрати на изпълнител в Blackmarket.</span>
    </div>
  );
}
export function MarketNotifications() {
  const { market, unlocked } = useMarket();
  const path = usePathname();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const unread = market.orders
    .flatMap((order) =>
      order.messages
        .filter((m) => m.from === "operator" && m.at > order.readAt)
        .map((m) => ({ ...m, service: order.service })),
    )
    .sort((a, b) => b.at - a.at);
  const latest = unread.find((m) => !dismissed.includes(m.id));
  if (!unlocked || !latest || path?.startsWith(`${MARKET_ROOT}/inbox`))
    return null;
  return (
    <aside className={s.notification} role="status">
      <button
        aria-label="Затвори известието"
        onClick={() => setDismissed(unread.map((m) => m.id))}
      >
        ×
      </button>
      <Link href={`${MARKET_ROOT}/inbox?thread=${latest.service}`}>
        НОВО СЪОБЩЕНИЕ / {latest.service}
        <small>{latest.text.slice(0, 100)}…</small>
        <small>ОТВОРИ ЛИЧНИЯ КАНАЛ ↗</small>
      </Link>
    </aside>
  );
}
export function InboxBadge() {
  const { market, unlocked } = useMarket();
  const unread = market.orders.filter((o) =>
    o.messages.some((m) => m.from === "operator" && m.at > o.readAt),
  ).length;
  return unlocked ? (
    <Link
      className={s.inboxBadge}
      href={`${MARKET_ROOT}/inbox`}
      aria-label={`Blackmarket поща: ${unread} непрочетени разговора`}
    >
      BM / {unread ? `● ${unread}` : "ПОЩА"}
    </Link>
  ) : null;
}
export function PasswordTool() {
  const { market, unlocked, act } = useMarket();
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function analyze() {
    setBusy(true);
    setError("");
    try {
      const data = await act({ action: "password" });
      const text = `${data.username} / ${data.password} — ${data.source}`;
      setResult(text);
      saveGameState(
        addClue(getGameState(), {
          id: "bm-password-gothgirl",
          title: "Възстановен достъп / GothGirl",
          text,
          sourceRoute: "/hidden-wiki-2/leaks/passwords",
          confidence: 4,
          status: "unverified",
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Анализът не успя.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={s.market}>
      <div className={s.notice}>
        <div className={s.row}>
          <span>BRUTEFORCE / ОФЛАЙН МОДУЛ</span>
          {unlocked && market.patches.includes("password-v1") ? (
            <button className={s.secondary} disabled={busy} onClick={analyze}>
              {busy ? "АНАЛИЗ…" : "АНАЛИЗИРАЙ GOTHGIRL"}
            </button>
          ) : (
            <Link href={`${MARKET_ROOT}/services/bruteforce`}>
              Придобий лиценз ↗
            </Link>
          )}
        </div>
        <p>
          Старата парола в dump-а е невалидна. Модулът възстановява последната
          редакция на игровия запис.
        </p>
        {result && (
          <div className={s.result} role="status">
            {result}
            <br />
            Записано в досието.{" "}
            <Link href="/hidden-wiki-2/cult/chat-system">
              Към чат архива ↗
            </Link>
          </div>
        )}
        {error && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
export function MembershipRegister() {
  const { market, unlocked } = useMarket();
  return (
    <div className={s.market}>
      <div className={s.notice}>
        <span className={s.micro}>MIRROR / СЛУЖЕБЕН РЕГИСТЪР</span>
        {unlocked && market.membership ? (
          <>
            <h2 style={{ fontSize: 18 }}>Картата е приета.</h2>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Пропуск</th>
                    <th>Име</th>
                    <th>Достъп / 15.10.2025</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>MR-09</td>
                    <td>GothGirl</td>
                    <td>Регистрация / вход Б / 21:45</td>
                  </tr>
                  <tr>
                    <td>MR-14</td>
                    <td>NightKiller</td>
                    <td>Транспорт / вход Б / 22:09</td>
                  </tr>
                  <tr>
                    <td>MR-17</td>
                    <td>RedFox</td>
                    <td>Западно крило / стая 9</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              className={s.secondary}
              onClick={() =>
                saveGameState(
                  addClue(getGameState(), {
                    id: "bm-mirror-register",
                    title: "MIRROR / служебен регистър",
                    text: "15.10.2025: GothGirl — регистрация 21:45; NightKiller — транспорт 22:09; RedFox — западно крило, стая 9.",
                    sourceRoute: "/hidden-wiki-2/events/tickets",
                    confidence: 4,
                    status: "unverified",
                  }),
                )
              }
            >
              ЗАПАЗИ РЕГИСТЪРА
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 18 }}>Нужна е членска карта.</h2>
            <p>
              Служебните пропуски за „Огледален преход“ са в затворен регистър.
              CardForge може да осигури игрова карта.
            </p>
            <Link
              className={s.secondary}
              href={`${MARKET_ROOT}/services/cardforge`}
            >
              КЪМ CARDFORGE ↗
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
