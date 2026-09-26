"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Download,
  Fingerprint,
  LockKeyhole,
  Mail,
  RotateCcw,
  Send,
} from "lucide-react";
import { usePlayer } from "@/lib/hc/client";
import { useMarket } from "@/lib/blackmarket/client";
import {
  CONTRABAND,
  MARKET_MISSION_PATH,
  MARKET_ROOT,
  SERVICES,
  getService,
} from "@/lib/blackmarket/catalog";
import { addClue, getGameState, saveGameState } from "@/lib/game-state";
import type { MarketMessage } from "@/lib/blackmarket/types";
import s from "./market.module.css";

export function MarketLocked() {
  return (
    <div className={s.market}>
      <div className={s.locked}>
        <div className={s.row}>
          <span className={s.eyebrow}>BM / ВЪЗЕЛ 07</span>
          <LockKeyhole size={25} color="#d5e78b" />
        </div>
        <h1 className={s.title}>
          Входът е<br />
          <em>по покана.</em>
        </h1>
        <p className={s.intro}>
          BLACKMARKET е затворена мрежа за достъп, изгубени архиви и услуги. Тук
          никой не приема непознати — първо докажи, че можеш да прочетеш
          оставената следа.
        </p>
        <div className={s.notice}>
          Специална мисия: „Некро пощенско клеймо“
          <br />
          <span className={s.muted}>
            Намери писмото от relay_ash. Разчети клеймото. Получи достъп и 50
            HC.
          </span>
        </div>
        <Link className={s.button} href={MARKET_MISSION_PATH}>
          ОТВОРИ МИСИЯТА <ArrowUpRight size={15} />
        </Link>
        <div className={s.footer}>
          <span>НУЖНА Е ЕДНА ПОКАНА</span>
          <span>ДОСТЪПЪТ ОСТАВА В ПРОФИЛА ТИ</span>
        </div>
      </div>
    </div>
  );
}

function Head({
  index,
  title,
  text,
}: {
  index: string;
  title: ReactNode;
  text: string;
}) {
  return (
    <header className={s.hero}>
      <div>
        <div className={s.eyebrow}>BLACKMARKET / {index}</div>
        <h1 className={s.title}>{title}</h1>
        <p className={s.intro}>{text}</p>
      </div>
    </header>
  );
}

export function MarketView({ segments }: { segments: string[] }) {
  const section = segments[0] ?? "";
  const { market, error, reload } = useMarket();
  const unread = market.orders.filter((o) =>
    o.messages.some((m) => m.from === "operator" && m.at > o.readAt),
  ).length;
  const links = [
    ["", "Начало"],
    ["services", "Услуги"],
    ["inbox", `Поща${unread ? ` · ${unread}` : ""}`],
    ["weapons", "Оръжия"],
    ["substances", "Вещества"],
    ["policy", "Правила"],
  ];
  return (
    <div className={s.market}>
      <div className={s.masthead}>
        <Link href={MARKET_ROOT} className={s.brand}>
          <b>BM</b> BLACKMARKET
        </Link>
        <span className={s.micro}>PRIVATE EXCHANGE / EST. 2009</span>
      </div>
      <nav className={s.nav} aria-label="Blackmarket">
        {links.map(([path, label]) => (
          <Link
            key={path}
            href={`${MARKET_ROOT}/${path}`}
            data-active={path === section}
            aria-current={path === section ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      {error && (
        <div className={s.error} role="alert">
          {error}{" "}
          <button className={s.secondary} onClick={() => void reload()}>
            Опитай отново
          </button>
        </div>
      )}
      {!section && <MarketHome />}
      {section === "services" &&
        (segments[1] ? (
          <ServiceDetail id={segments[1]} />
        ) : (
          <ServiceDirectory />
        ))}
      {section === "inbox" && <Inbox />}
      {(section === "weapons" || section === "substances") && (
        <Archive kind={section} />
      )}
      {section === "policy" && <Policy />}
      <footer className={s.footer}>
        <span>BM / НЯКОИ ВРАТИ СЕ ОТВАРЯТ С ИНФОРМАЦИЯ.</span>
        <span>ИЗМИСЛЕНА МРЕЖА · HIDDEN WIKI 2</span>
      </footer>
    </div>
  );
}

function MarketHome() {
  return (
    <>
      <header className={s.hero}>
        <div>
          <div className={s.eyebrow}>ДОСТЪПЪТ Е ПРИЕТ / RELAY 07</div>
          <h1 className={s.title}>
            Липсващото
            <br />
            има <em>цена.</em>
          </h1>
          <p className={s.intro}>
            Blackmarket е мястото между заключената врата и следващата улика.
            Купи услуга, предай код на страница и получи онова, което някой е
            опитал да заличи.
          </p>
          <Link className={s.button} href={`${MARKET_ROOT}/services`}>
            НАМЕРИ ИЗПЪЛНИТЕЛ <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className={s.seal} aria-hidden>
          <span>PRIVATE ACCESS</span>
          <b>07</b>
          <span>TRUST NO SIGNAL</span>
        </div>
      </header>
      <div className={s.strip}>
        <div>
          <b>01 / Избери човек</b>
          <span>Прочети условията и отзивите.</span>
        </div>
        <div>
          <b>02 / Изпрати следа</b>
          <span>Кодът на страницата е твоят ключ.</span>
        </div>
        <div>
          <b>03 / Провери резултата</b>
          <span>Платеното не значи достоверно.</span>
        </div>
      </div>
      <div className={s.heading}>
        <h2>Хора с достъп</h2>
        <Link href={`${MARKET_ROOT}/services`}>Всички 5 услуги ↗</Link>
      </div>
      <div className={s.cards}>
        {SERVICES.slice(0, 2).map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
      <div className={s.heading}>
        <h2>Работна станция</h2>
        <span className={s.micro}>ACCESS / RECOVERY</span>
      </div>
      <Workbench />
      <div className={s.notice}>
        Всяка страница има персонален PAGE CODE в долната част. Изпрати го на
        изпълнителя в пощата — код от друг профил няма да бъде разпознат.
      </div>
    </>
  );
}

function ServiceCard({ service }: { service: (typeof SERVICES)[number] }) {
  const { market } = useMarket();
  const owned = market.orders.some((o) => o.service === service.id);
  return (
    <Link className={s.card} href={`${MARKET_ROOT}/services/${service.id}`}>
      <div className={s.row}>
        <span className={s.monogram}>{service.monogram}</span>
        <span className={s.micro}>{service.role}</span>
      </div>
      <h3>{service.name}</h3>
      <p>{service.short}</p>
      <div className={s.cardFoot}>
        <span>
          ★ {service.rating} · {service.jobs} поръчки
        </span>
        <span className={s.price}>
          {owned ? (
            "ПЛАТЕНО"
          ) : (
            <>
              {service.price} <small>HC</small>
            </>
          )}{" "}
          ↗
        </span>
      </div>
    </Link>
  );
}
function ServiceDirectory() {
  return (
    <>
      <Head
        index="01 / ИЗПЪЛНИТЕЛИ"
        title={
          <>
            Достъпът е<br />
            <em>лична работа.</em>
          </>
        }
        text="Пет профила. Различни умения. Различна репутация. Провери какво точно купуваш — връщането на HC не е част от сделката."
      />
      <div className={s.cards}>
        {SERVICES.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </>
  );
}

function ServiceDetail({ id }: { id: string }) {
  const service = getService(id)!;
  const { market, act, loading } = useMarket();
  const { coins } = usePlayer();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const order = market.orders.find((o) => o.service === id);
  async function buy() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await act({ action: "purchase", service: id });
      router.push(`${MARKET_ROOT}/inbox?thread=${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Плащането не успя.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className={s.heading}>
        <Link href={`${MARKET_ROOT}/services`}>← Изпълнители</Link>
        <span className={s.micro}>{service.role}</span>
      </div>
      <div className={s.split}>
        <div>
          <div className={s.row}>
            <span className={s.monogram}>{service.monogram}</span>
            <span className={s.stars}>★ {service.rating}</span>
          </div>
          <h1 className={s.title} style={{ marginTop: 25 }}>
            {service.name}
          </h1>
          <h2 style={{ fontSize: 16, fontWeight: 400 }}>{service.title}</h2>
          <p className={s.intro} style={{ marginTop: 20 }}>
            {service.brief}
          </p>
          <div className={s.notice}>
            ПОЛУЧАВАШ
            <br />
            {service.delivery}
          </div>
          <div className={s.heading}>
            <h2>Отзиви от мрежата</h2>
          </div>
          <p className={s.micro}>Архивни мнения на игрови персонажи</p>
          {service.reviews.map((review) => (
            <div className={s.review} key={review.user}>
              <div className={s.row}>
                <span>{review.user}</span>
                <span className={s.stars}>
                  {"★".repeat(review.score)}
                  {"☆".repeat(5 - review.score)}
                </span>
              </div>
              <p>{review.text}</p>
            </div>
          ))}
        </div>
        <aside className={s.purchase}>
          <span className={s.micro}>ЕДНОКРАТНА ПОРЪЧКА</span>
          <span className={s.price}>
            {service.price} <small>HC</small>
          </span>
          <p>
            {id === "celltrace"
              ? "+ 10 HC за всеки нов номер от игровия архив."
              : "Без допълнителна такса за съобщения."}
          </p>
          <p>
            Наличност: <strong>{coins} HC</strong>
          </p>
          {order ? (
            <Link
              href={`${MARKET_ROOT}/inbox?thread=${id}`}
              className={s.button}
            >
              ОТВОРИ РАЗГОВОРА <Mail size={14} />
            </Link>
          ) : (
            <button
              className={s.button}
              onClick={buy}
              disabled={busy || loading || coins < service.price}
            >
              {busy ? "ПЛАЩАНЕ…" : `ПЛАТИ ${service.price} HC`}{" "}
              <ArrowUpRight size={14} />
            </button>
          )}
          {!order && coins < service.price && (
            <p>
              Не достигат {service.price - coins} HC.{" "}
              <Link href="/hidden-wiki-2/moneytasks">Изпълни задача ↗</Link>
            </p>
          )}
          <p>
            След плащане изпълнителят пише в личната ти поща. Поръчката остава в
            профила ти.
          </p>
          <Link href={`${MARKET_ROOT}/policy`} className={s.micro}>
            Условия на обмена ↗
          </Link>
          {error && (
            <div className={s.error} role="alert">
              {error}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

function Workbench() {
  const { market, act } = useMarket();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function run(action: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const data = await act(action);
      if (data.comparison) {
        const c = data.comparison;
        setResult(
          `${c.left}\n${c.first}\n\n${c.right}\n${c.second}\n\n${c.samePage ? "Една и съща страница. Избери два различни източника." : c.match ? "СЪВПАДЕНИЕ — двата архива споделят подпис MIRROR. Това е връзка между източниците." : "РАЗЛИЧНИ ПОДПИСИ — няма потвърдена обща архивна следа."}`,
        );
      } else
        setResult(
          "Терминалният достъп е нулиран. Получените patches, поръчки и улики са запазени. Инсталирай patch отново, когато ти потрябва.",
        );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Операцията не успя.");
    } finally {
      setBusy(false);
    }
  }
  function download(patch: string) {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            game: "HIDDEN WIKI 2",
            patch,
            command: `patch install ${patch}`,
            purpose: "Fictional terminal module; no executable code",
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${patch}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className={s.workbench}>
      <details>
        <summary>
          <Fingerprint
            size={15}
            style={{ display: "inline", marginRight: 10 }}
          />
          Сравни fingerprints / patches / reset
        </summary>
        <div className={s.toolGrid}>
          <section>
            <h3>Два източника. Един подпис?</h3>
            <p className={s.muted}>
              Сравни PAGE CODE на /events/guestbook и /forum/deadletters. Кодът
              идентифицира страницата; fingerprint-ът — нейния архивен източник.
            </p>
            <label className={s.label} htmlFor="fingerprint-a">
              Първи персонален код
            </label>
            <input
              id="fingerprint-a"
              className={s.input}
              value={a}
              onChange={(e) => setA(e.target.value)}
              maxLength={40}
            />
            <label className={s.label} htmlFor="fingerprint-b">
              Втори персонален код
            </label>
            <input
              id="fingerprint-b"
              className={s.input}
              value={b}
              onChange={(e) => setB(e.target.value)}
              maxLength={40}
            />
            <button
              className={s.secondary}
              style={{ marginTop: 14 }}
              disabled={busy || !a || !b}
              onClick={() => void run({ action: "compare", a, b })}
            >
              СРАВНИ ПОДПИСИТЕ
            </button>
          </section>
          <section>
            <h3>Получени patches</h3>
            {market.patches.length ? (
              market.patches.map((patch) => (
                <div key={patch} className={s.review}>
                  <div className={s.row}>
                    <span>{patch}</span>
                    <button
                      className={s.secondary}
                      onClick={() => download(patch)}
                      aria-label={`Изтегли ${patch}`}
                    >
                      <Download size={14} />
                    </button>
                  </div>
                  <p>
                    В терминала: <code>patch install {patch}</code>
                  </p>
                </div>
              ))
            ) : (
              <p className={s.muted}>
                Още нямаш модули. PageGhost доставя mailbox-v1 след успешно
                възстановяване.
              </p>
            )}
            <Link
              href="/hidden-wiki-2/trace-node/terminal"
              className={s.secondary}
            >
              КЪМ ТЕРМИНАЛА ↗
            </Link>
            <h3 style={{ marginTop: 28 }}>Reset на терминалния достъп</h3>
            <p className={s.muted}>
              Деактивира инсталираните модули. Поръчките, монетите и уликите
              остават. Безплатно.
            </p>
            <button
              className={s.secondary}
              disabled={busy}
              onClick={() => void run({ action: "reset" })}
            >
              <RotateCcw size={13} /> RESET ДОСТЪП
            </button>
          </section>
        </div>
      </details>
      {result && (
        <div className={s.result} role="status">
          {result}
        </div>
      )}
      {error && (
        <div className={s.error} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

function Artifact({ message }: { message: MarketMessage }) {
  const artifact = message.artifact!;
  const id = `bm-artifact-${message.id}`;
  const [saved, setSaved] = useState(() =>
    getGameState().clues.some((c) => c.id === id),
  );
  return (
    <>
      <b>{artifact.title}</b>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              {artifact.columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {artifact.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={s.actions}>
        <button
          className={s.secondary}
          disabled={saved}
          onClick={() => {
            saveGameState(
              addClue(getGameState(), {
                id,
                title: artifact.title,
                text: artifact.rows.map((row) => row.join(" | ")).join("\n"),
                sourceRoute: artifact.route,
                confidence: artifact.suspicious ? 1 : 4,
                status: artifact.suspicious ? "suspicious" : "unverified",
              }),
            );
            setSaved(true);
          }}
        >
          {saved ? "ЗАПАЗЕНО В ДОСИЕТО" : "ЗАПАЗИ КАТО УЛИКА"}
        </button>
        <Link href={artifact.route} className={s.muted}>
          Към източника ↗
        </Link>
      </div>
    </>
  );
}

function Inbox() {
  const { market, act, loading } = useMarket();
  const search = useSearchParams();
  const router = useRouter();
  const selected = search.get("thread");
  const order =
    market.orders.find((o) => o.service === selected) ?? market.orders[0];
  const service = order ? getService(order.service)! : null;
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef<{
    text: string;
    service: string;
    requestId: string;
  } | null>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const lastAt = order?.messages.at(-1)?.at ?? 0;
  useEffect(() => {
    setText("");
    setError("");
  }, [order?.service]);
  useEffect(() => {
    if (order && lastAt > order.readAt)
      void act({
        action: "read",
        service: order.service,
        through: lastAt,
      }).catch(() => {});
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [order?.service, order?.readAt, lastAt, act]);
  async function send() {
    if (!order || busy || !text.trim()) return;
    setBusy(true);
    setError("");
    if (
      pending.current?.text !== text.trim() ||
      pending.current?.service !== order.service
    )
      pending.current = {
        text: text.trim(),
        service: order.service,
        requestId: crypto.randomUUID(),
      };
    try {
      await act({ action: "message", ...pending.current });
      setText("");
      pending.current = null;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Съобщението не е изпратено.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Head
        index="02 / ЛИЧЕН КАНАЛ"
        title={
          <>
            Само ти.
            <br />
            <em>И другата страна.</em>
          </>
        }
        text="Тук пристигат инструкциите и резултатите от поръчките. Кодът на страницата насочва изпълнителя към правилния архив."
      />
      {loading ? (
        <p role="status">Свързване с пощата…</p>
      ) : !order ? (
        <div className={s.empty}>
          <Mail size={30} style={{ margin: "0 auto", color: "#d5e78b" }} />
          <h2>Няма отворени канали.</h2>
          <p>След първата покупка изпълнителят ще се свърже с теб тук.</p>
          <Link className={s.button} href={`${MARKET_ROOT}/services`}>
            РАЗГЛЕДАЙ УСЛУГИТЕ ↗
          </Link>
        </div>
      ) : (
        <div className={s.inbox}>
          <nav className={s.threads} aria-label="Разговори">
            {market.orders.map((o) => (
              <button
                key={o.service}
                className={s.thread}
                data-active={o.service === order.service}
                onClick={() =>
                  router.replace(`${MARKET_ROOT}/inbox?thread=${o.service}`, {
                    scroll: false,
                  })
                }
              >
                <b>
                  {getService(o.service)?.name}{" "}
                  {o.messages.some(
                    (m) => m.from === "operator" && m.at > o.readAt,
                  )
                    ? "●"
                    : ""}
                </b>
                <small>
                  {o.paid} HC ·{" "}
                  {o.fulfilled.length ? "ИМА РЕЗУЛТАТ" : "ОЧАКВА ЗАДАНИЕ"}
                </small>
              </button>
            ))}
          </nav>
          <div className={s.conversation}>
            <div className={s.chatHead}>
              <b>{service?.name}</b>
              <span className={s.micro}> / ЛИЧНА ПОРЪЧКА</span>
            </div>
            <div
              ref={scroll}
              className={s.messages}
              role="log"
              aria-live="polite"
            >
              {order.messages.map((message) => (
                <article
                  key={message.id}
                  className={s.message}
                  data-from={message.from}
                >
                  <div className={s.row}>
                    <span className={s.micro}>
                      {message.from === "player" ? "ТИ" : service?.name}
                    </span>
                    <time
                      className={s.micro}
                      dateTime={new Date(message.at).toISOString()}
                    >
                      {new Date(message.at).toLocaleTimeString("bg-BG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <p>{message.text}</p>
                  {message.artifact && <Artifact message={message} />}
                </article>
              ))}
            </div>
            <div className={s.composer}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
              >
                <input
                  className={s.input}
                  aria-label="Задание до изпълнителя"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={service?.placeholder}
                  maxLength={200}
                  disabled={busy}
                />
                <button
                  className={s.button}
                  disabled={busy || !text.trim()}
                  type="submit"
                >
                  <Send size={14} />
                  {busy ? "ИЗПРАЩАНЕ…" : "ИЗПРАТИ"}
                </button>
              </form>
              {order.service === "celltrace" && (
                <p className={s.micro}>
                  10 HC за нов номер · повторна справка безплатно
                </p>
              )}
              {error && (
                <p className={s.error} role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Archive({ kind }: { kind: "weapons" | "substances" }) {
  const [saved, setSaved] = useState<string[]>(() =>
    getGameState().clues.map((c) => c.id),
  );
  return (
    <>
      <Head
        index={kind === "weapons" ? "03 / ОРЪЖИЯ" : "04 / ЗАБРАНЕНИ ВЕЩЕСТВА"}
        title={
          kind === "weapons" ? (
            <>
              Предметите
              <br />
              <em>имат памет.</em>
            </>
          ) : (
            <>
              Етикетът
              <br />
              <em>не е съдържанието.</em>
            </>
          )
        }
        text="Затворен каталог от случая. Обявите са свалени; останали са архивни копия, чужди имена и детайли за сравняване. Тук събираш улики."
      />
      <div className={s.micro}>
        АРХИВНИ ИГРОВИ ЗАПИСИ / ПРОДАЖБИТЕ СА ПРЕКРАТЕНИ
      </div>
      {CONTRABAND[kind].map((item) => (
        <article className={s.listing} key={item.id}>
          <div className={s.specimen} aria-hidden>
            {item.mark}
          </div>
          <div>
            <span className={s.micro}>
              {item.id} / {item.kind}
            </span>
            <h2>{item.name}</h2>
            <p>{item.text}</p>
            <details>
              <summary style={{ cursor: "pointer", color: "#d5e78b" }}>
                Прочети архивната бележка
              </summary>
              <p>{item.clue}</p>
            </details>
            <div className={s.row} style={{ marginTop: 20, flexWrap: "wrap" }}>
              <span className={s.micro}>{item.status}</span>
              <button
                className={s.secondary}
                disabled={saved.includes(`bm-${item.id}`)}
                onClick={() => {
                  const id = `bm-${item.id}`;
                  saveGameState(
                    addClue(getGameState(), {
                      id,
                      title: `[BLACKMARKET] ${item.name}`,
                      text: item.clue,
                      sourceRoute: `${MARKET_ROOT}/${kind}`,
                      confidence: 2,
                      status:
                        "suspicious" in item ? "suspicious" : "unverified",
                    }),
                  );
                  setSaved((v) => [...v, id]);
                }}
              >
                {saved.includes(`bm-${item.id}`)
                  ? "ЗАПАЗЕНО"
                  : "ЗАПАЗИ СЛЕДАТА"}
              </button>
            </div>
          </div>
        </article>
      ))}
    </>
  );
}
function Policy() {
  const rules = [
    [
      "Само псевдоними.",
      "Изпращай кодове на страници и данни от игровото досие. Истински имена, адреси и документи не са валидно задание. Изпълнителят вижда само съобщенията в своя канал.",
    ],
    [
      "Достъпът не е гаранция.",
      "Оценките са мнения на персонажи. Изтритото може да е невъзстановимо, а доставеният запис — подменен. Съпоставяй дата, произход и fingerprint, преди да потвърдиш улика.",
    ],
    [
      "Плащането приключва сделката.",
      "Цената е в игрови Hidden Coins. HC се отнемат при успешно отваряне на поръчката, която остава достъпна в пощата. Повторно натискане не купува услугата втори път. Няма автоматично възстановяване при лош резултат.",
    ],
    [
      "Никакво разкриване на канала.",
      "В света на случая публикуването на чужд псевдоним или препращането на личен разговор нарушава договора. Записвай нужните следи в собственото досие; не представяй непроверени твърдения за факти.",
    ],
    [
      "Сигналът може да е примамка.",
      "Обещание за жива локация, липсваща дата и еднакви кадри са предупредителни знаци. LiveEye носи особено ниска репутация. Купувачът поема риска да плати за безполезен архив.",
    ],
    [
      "Reset не изтрива миналото.",
      "Reset деактивира терминалните модули. Купените услуги, получените patches, личните разговори и уликите остават в профила. Тази мрежа е част от HIDDEN WIKI 2; всички услуги и резултати са игрова симулация.",
    ],
  ];
  return (
    <>
      <Head
        index="05 / ПРАВИЛА НА ОБМЕНА"
        title={
          <>
            Няма доверие.
            <br />
            <em>Има условия.</em>
          </>
        }
        text="Прочети ги преди първата сделка. Мрежата помни плащанията, но не обещава истината."
      />
      <div className={s.policy}>
        {rules.map(([title, text]) => (
          <section key={title}>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
