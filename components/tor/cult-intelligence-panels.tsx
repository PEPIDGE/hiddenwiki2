"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { GlitchText } from "@/components/tor/glitch-text"
import { addClue, getGameState, saveGameState } from "@/lib/game-state"

const ACCENT = "#00FF41"

const OPERATORS = [
  {
    id: "OP-001",
    callsign: "RedFox",
    level: "АРХИТЕКТ",
    cult: "Братството на третото пробуждане",
    status: "ACTIVE",
    lastSeen: "2025-10-16 03:14",
    relay: "HOPS=3",
    note: "Лидер и основател. Отговорен за ритуалите. Последна активност след изчезването.",
    anomaly: true,
    clue: "RedFox — АРХИТЕКТ на Братството. Активен в 03:14 на 16.10.2025 — след изчезването на Лора.",
  },
  {
    id: "OP-002",
    callsign: "NightKiller",
    level: "ОПЕРАТОР",
    cult: "Братство / Нощен сигнал",
    status: "ACTIVE",
    lastSeen: "2025-10-15 23:55",
    relay: "HOPS=3",
    note: "Транзит оператор. Черен Audi A3. Последно виден в кв. Бенковски.",
    anomaly: true,
    clue: "NightKiller — транзит с черен Audi A3. Последен сигнал 23:55 на 15.10.2025 — кв. Бенковски.",
  },
  {
    id: "OP-003",
    callsign: "GothGirl",
    level: "ОПЕРАТОР",
    cult: "Братство / Нощен сигнал",
    status: "ACTIVE",
    lastSeen: "2025-10-13 18:22",
    relay: "HOPS=3",
    note: "Паролата в чат системата е сменена. Стара парола: joko1132. Нова е неизвестна.",
    anomaly: true,
    clue: "GothGirl — стара парола joko1132 е сменена. Достъпът до чат архива изисква друг операторски акаунт.",
  },
  {
    id: "OP-004",
    callsign: "ToxicBabe",
    level: "ОПЕРАТОР",
    cult: "Братството на третото пробуждане",
    status: "ACTIVE",
    lastSeen: "2025-10-15 20:10",
    relay: "HOPS=3",
    note: "Отговаря за вербовка. Организатор на Огледален преход.",
    anomaly: false,
    clue: "ToxicBabe — вербовка и организация на Огледален преход. Relay: HOPS=3.",
  },
  {
    id: "OP-005",
    callsign: "Black-Voyvoda",
    level: "ОПЕРАТОР",
    cult: "Братството на третото пробуждане",
    status: "ACTIVE",
    lastSeen: "2025-10-15 22:30",
    relay: "HOPS=3",
    note: "Охрана и логистика. Обаждане към Д. Михайлов в 22:15.",
    anomaly: true,
    clue: "Black-Voyvoda — охрана. Обажда се в 22:15 на 15.10.2025 — 3 мин след изчезването.",
  },
  {
    id: "OP-006",
    callsign: "DataCracker6",
    level: "АНАЛИТИК",
    cult: "Братство / Архивът на сенките",
    status: "ACTIVE",
    lastSeen: "2025-10-14 11:00",
    relay: "HOPS=3",
    note: "Технически оператор. Отговорен за форум dump-а и decoy документи.",
    anomaly: false,
    clue: "DataCracker6 — технически оператор. Публикувал decoy GPS координати в leaks/docs.",
  },
  {
    id: "OP-007",
    callsign: "NullSyn",
    level: "АНАЛИТИК",
    cult: "Кръг / Архивът на сенките",
    status: "ACTIVE",
    lastSeen: "2025-10-15 19:00",
    relay: "HOPS=2",
    note: "HOPS=2 — decoy или компрометиран. Публикувал фалшиви GPS данни.",
    anomaly: false,
    clue: "NullSyn — HOPS=2. Decoy координатор с 3 фалшиви GPS изпращания.",
  },
  {
    id: "OP-008",
    callsign: "OutsiderX",
    level: "ЛИДЕР",
    cult: "Кръг на лунното затъмнение",
    status: "INACTIVE",
    lastSeen: "2025-09-30 09:00",
    relay: "N/A",
    note: "Неактивен от октомври. Кръгът е отделна секта — слаба връзка със случая.",
    anomaly: false,
    clue: "OutsiderX — лидер на Кръга. Неактивен от 30.09.2025.",
  },
]

const VALID_CREDENTIALS: Record<string, { pass: string; role: string; displayName: string }> = {
  RedFox: { pass: "r3dfox!2025", role: "АРХИТЕКТ", displayName: "RedFox [ARCHITECT]" },
  NightKiller: { pass: "n1ght_k1ll", role: "ОПЕРАТОР", displayName: "NightKiller" },
  ToxicBabe: { pass: "t0x1c_b@be", role: "ОПЕРАТОР", displayName: "ToxicBabe" },
  "Black-Voyvoda": { pass: "Bl@ck_V0jv0da", role: "ОПЕРАТОР", displayName: "Black-Voyvoda" },
  DataCracker6: { pass: "d4t@cr4ck6r", role: "АНАЛИТИК", displayName: "DataCracker6" },
}

const CHAT_MESSAGES = [
  { id: "M-01", time: "2025-10-13 14:22", from: "RedFox", to: "ALL", text: "Операцията е потвърдена. Цел е подготвена. 15 окт, 22:00.", highlighted: true },
  { id: "M-02", time: "2025-10-13 14:25", from: "NightKiller", to: "ALL", text: "Потвърждавам. Маршрут 17. Транспортът е готов.", highlighted: false },
  { id: "M-03", time: "2025-10-13 14:26", from: "Black-Voyvoda", to: "ALL", text: "Охраната е на място. Захарна фабрика, западно крило.", highlighted: false },
  { id: "M-04", time: "2025-10-13 14:30", from: "ToxicBabe", to: "GothGirl", text: "GG, смени паролата — стандартна процедура преди операция. Не отговаряй в общия чат.", highlighted: false },
  { id: "M-05", time: "2025-10-14 09:00", from: "DataCracker6", to: "ALL", text: "Публикувах decoy GPS данни. NullSyn ще ги разпространи. Сметката е чиста.", highlighted: false },
  { id: "M-06", time: "2025-10-14 10:15", from: "RedFox", to: "ALL", text: "Не забравяйте — route-17-night е само bait за любопитни. Реалният маршрут е в Захарна фабрика.", highlighted: false },
  { id: "M-07", time: "2025-10-15 20:00", from: "NightKiller", to: "Black-Voyvoda", text: "Тръгвам. 40 мин. Д.М. изпраща потвърждение.", highlighted: false },
  { id: "M-08", time: "2025-10-15 20:05", from: "Black-Voyvoda", to: "NightKiller", text: "Разбрано. Задната врата е отворена. Пазя.", highlighted: false },
  { id: "M-09", time: "2025-10-16 01:00", from: "RedFox", to: "ALL", text: "Ритуалът е завършен. Фаза 3 изпълнена. Изчистете следите.", highlighted: false },
  { id: "M-10", time: "2025-10-16 01:05", from: "DataCracker6", to: "ALL", text: "Чистя логовете. IP адресите са маскирани. NODE-7 е зачистен.", highlighted: false },
]

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: ACCENT,
  INACTIVE: "#555",
  UNKNOWN: ACCENT,
  DECOY: "#333",
}

interface CultPanelProps {
  cultName: string
  sourceRoute: string
}

export function CultOperatorsPanel({ cultName, sourceRoute }: CultPanelProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])

  useEffect(() => {
    setSaved(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (op: typeof OPERATORS[number]) => {
    const id = `cult-op-${op.id}`
    if (saved.includes(id)) return

    saveGameState(addClue(getGameState(), {
      id,
      title: `[OPERATORS] ${op.callsign}`,
      text: op.clue,
      sourceRoute,
      confidence: op.anomaly ? 4 : 3,
      status: "unverified",
    }))
    setSaved((prev) => [...prev, id])
  }

  return (
    <section id="operators" style={{ marginTop: 32, scrollMarginTop: 24 }}>
      <SectionHeading label="OPERATORS" detail={`${cultName} // embedded intelligence`} />

      <div style={{ marginBottom: 16, padding: "10px 14px", border: "1px solid #1a1a1a", background: "#040404", fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", lineHeight: 1.7 }}>
        Правило: реален оператор = HOPS=3. HOPS != 3 = decoy или компрометиран.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {OPERATORS.map((op, index) => {
          const id = `cult-op-${op.id}`
          const isSaved = saved.includes(id)
          const isSelected = selected === op.id

          return (
            <div key={op.id}>
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => setSelected(isSelected ? null : op.id)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: isSelected ? `${ACCENT}07` : "#040404",
                  border: `1px solid ${isSelected ? `${ACCENT}30` : op.anomaly ? `${ACCENT}14` : "#111"}`,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", marginBottom: 5 }}>
                      {op.id} // {op.level} // {op.cult}
                    </div>
                    <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: isSelected ? ACCENT : op.anomaly ? "#cccccc" : "#909090", fontWeight: 700 }}>
                      {op.callsign}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: STATUS_COLOR[op.status] ?? "#333" }}>{op.status}</div>
                    <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: op.relay === "HOPS=3" ? `${ACCENT}70` : "#FF003370", marginTop: 3 }}>{op.relay}</div>
                  </div>
                </div>
              </motion.button>
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "12px 16px", background: "#060208", border: `1px solid ${ACCENT}18`, borderTop: "none" }}>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", marginBottom: 4 }}>LAST SEEN: {op.lastSeen}</div>
                      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#999999", lineHeight: 1.7, marginBottom: 12 }}>{op.note}</div>
                      <div style={{ padding: "8px 12px", background: "#080310", border: `1px solid ${ACCENT}20`, marginBottom: 10 }}>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#3a1050", marginBottom: 3 }}>УЛИКА</div>
                        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, lineHeight: 1.6 }}>{op.clue}</div>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleSave(op)
                        }}
                        disabled={isSaved}
                        style={{ background: "transparent", border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`, color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 9, padding: "6px 16px", cursor: isSaved ? "default" : "pointer" }}
                      >
                        {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ УЛИКА"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function CultChatSystemPanel({ cultName, sourceRoute }: CultPanelProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loggedIn, setLoggedIn] = useState<{ user: string; role: string; displayName: string } | null>(null)
  const [savedClues, setSavedClues] = useState<string[]>([])

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleLogin = () => {
    const trimUser = username.trim()
    const trimPass = password.trim()

    if (trimUser === "GothGirl" && trimPass === "joko1132") {
      setLoginError("Паролата на този акаунт е сменена преди 3 дни. Потърси друг операторски акаунт в LEAKS/PASSWORDS.")
      return
    }

    if (trimUser === "GothGirl") {
      setLoginError("Невалидни данни за вход.")
      return
    }

    const cred = VALID_CREDENTIALS[trimUser]
    if (cred && trimPass === cred.pass) {
      setLoggedIn({ user: trimUser, role: cred.role, displayName: cred.displayName })
      setLoginError("")
      return
    }

    setLoginError("Невалидни данни за вход.")
  }

  const handleSave = (msg: typeof CHAT_MESSAGES[number]) => {
    const id = `chat-${msg.id}`
    if (savedClues.includes(id)) return

    saveGameState(addClue(getGameState(), {
      id,
      title: `[CHAT] ${msg.from} -> ${msg.to}`,
      text: `[${msg.time}] ${msg.from}: ${msg.text}`,
      sourceRoute,
      confidence: msg.highlighted ? 5 : 3,
      status: "unverified",
    }))
    setSavedClues((prev) => [...prev, id])
  }

  return (
    <section id="chat-system" style={{ marginTop: 32, scrollMarginTop: 24 }}>
      <SectionHeading label="CHAT SYSTEM" detail={`${cultName} // operator relay`} />

      <AnimatePresence mode="wait">
        {!loggedIn ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ padding: "10px 14px", background: "#0d000d", border: `1px solid ${ACCENT}20`, marginBottom: 18 }}>
              <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
                Вход в затворения чат на операторите. Credentials можеш да намериш в{" "}
                <Link href="/hidden-wiki-2/leaks/passwords" style={{ color: ACCENT }}>LEAKS/PASSWORDS</Link>.
              </p>
            </div>

            <div style={{ maxWidth: 430, padding: "24px", background: "#080808", border: "1px solid #1e1e1e" }}>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.2em", marginBottom: 20 }}>
                INTERNAL CHAT // LOGIN
              </div>
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 9, color: "#909090", fontFamily: "var(--font-mono)", marginBottom: 5 }}>USERNAME</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleLogin()}
                  style={{ width: "100%", padding: "7px 10px", background: "#111", border: "1px solid #222", color: "#e0e0e0", fontSize: 12, fontFamily: "var(--font-mono)", outline: "none" }}
                />
              </label>
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ display: "block", fontSize: 9, color: "#909090", fontFamily: "var(--font-mono)", marginBottom: 5 }}>PASSWORD</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleLogin()}
                  style={{ width: "100%", padding: "7px 10px", background: "#111", border: "1px solid #222", color: "#e0e0e0", fontSize: 12, fontFamily: "var(--font-mono)", outline: "none" }}
                />
              </label>
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ padding: "8px 12px", background: "#1a0000", border: "1px solid #FF003330", marginBottom: 12, fontSize: 10, color: loginError.includes("LEAKS") ? ACCENT : "#FF0033", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}
                >
                  {loginError}
                </motion.div>
              )}
              <button
                type="button"
                onClick={handleLogin}
                style={{ width: "100%", padding: "8px 0", background: `${ACCENT}22`, border: `1px solid ${ACCENT}50`, color: ACCENT, fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.15em", cursor: "pointer" }}
              >
                LOGIN
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "#0a000a", border: `1px solid ${ACCENT}20`, marginBottom: 16, gap: 12 }}>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#bbbbbb" }}>
                Влязъл като: <span style={{ color: ACCENT }}>{loggedIn.displayName}</span>
                <span style={{ marginLeft: 10, fontSize: 9, color: "#909090" }}>[{loggedIn.role}]</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoggedIn(null)
                  setUsername("")
                  setPassword("")
                }}
                style={{ background: "none", border: "1px solid #222", color: "#909090", fontSize: 9, fontFamily: "var(--font-mono)", padding: "3px 8px", cursor: "pointer" }}
              >
                LOGOUT
              </button>
            </div>

            <div style={{ padding: "10px 14px", background: "#080808", border: "1px solid #1a1a1a", marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", marginBottom: 6 }}>АРХИВ // ОКТОМВРИ 2025</div>
              <p style={{ fontSize: 10, color: "#bbbbbb", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
                Показани са само съобщения до теб или до ALL. Съобщенията между GothGirl и ToxicBabe са скрити.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {CHAT_MESSAGES.map((msg) => {
                const isSaved = savedClues.includes(`chat-${msg.id}`)
                const isToMe = msg.to === "ALL" || msg.to === loggedIn.user || msg.from === loggedIn.user
                if (!isToMe) return null

                return (
                  <div key={msg.id} style={{ padding: "10px 14px", background: msg.highlighted ? "#0d0000" : "#090909", border: `1px solid ${msg.highlighted ? "#FF000030" : "#141414"}` }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 5 }}>
                          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444" }}>{msg.time}</span>
                          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: msg.from === "RedFox" ? "#FF0033" : ACCENT, fontWeight: 600 }}>{msg.from}</span>
                          <span style={{ fontSize: 9, color: "#333", fontFamily: "var(--font-mono)" }}>-&gt; {msg.to}</span>
                          {msg.highlighted && <span style={{ fontSize: 7, color: "#FF0033", border: "1px solid #FF003330", padding: "1px 5px", fontFamily: "var(--font-mono)" }}>KEY</span>}
                        </div>
                        <div style={{ fontSize: 11, color: "#d0d0d0", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>{msg.text}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSave(msg)}
                        disabled={isSaved}
                        style={{ padding: "3px 10px", fontSize: 9, fontFamily: "var(--font-mono)", background: isSaved ? `${ACCENT}18` : "#0d0d0d", color: isSaved ? ACCENT : "#909090", border: `1px solid ${isSaved ? ACCENT + "40" : "#1e1e1e"}`, cursor: isSaved ? "default" : "pointer", flexShrink: 0 }}
                      >
                        {isSaved ? "✓" : "SAVE"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function SectionHeading({ label, detail }: { label: string; detail: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <GlitchText text={label} as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
      <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8, marginBottom: 8 }} />
      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.12em" }}>
        {detail}
      </div>
    </div>
  )
}
