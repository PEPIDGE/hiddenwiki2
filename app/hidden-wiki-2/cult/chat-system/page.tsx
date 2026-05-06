"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#CC44FF"

// Chat logs visible once logged in as someone else — GothGirl's password is changed
// Correct credentials are ANY operator except GothGirl (whose password was changed)
// NightKiller / n1ght_k1ll works, BlackVoyvoda / Bl@ck_V0jv0da works etc.
// GothGirl / joko1132 gives "Password changed 3 days ago" → drives to BruteForce

const VALID_CREDENTIALS: Record<string, { pass: string; role: string; displayName: string }> = {
  "RedFox": { pass: "r3dfox!2025", role: "АРХИТЕКТ", displayName: "RedFox [ARCHITECT]" },
  "NightKiller": { pass: "n1ght_k1ll", role: "ОПЕРАТОР", displayName: "NightKiller" },
  "ToxicBabe": { pass: "t0x1c_b@be", role: "ОПЕРАТОР", displayName: "ToxicBabe" },
  "Black-Voyvoda": { pass: "Bl@ck_V0jv0da", role: "ОПЕРАТОР", displayName: "Black-Voyvoda" },
  "DataCracker6": { pass: "d4t@cr4ck6r", role: "АНАЛИТИК", displayName: "DataCracker6" },
}

// These messages are visible to logged-in operators (not GothGirl)
const CHAT_MESSAGES = [
  { id: "M-01", time: "2025-10-13 14:22", from: "RedFox", to: "ALL", text: "Операцията е потвърдена. Цел е подготвена. 15 окт, 22:00.", highlighted: true },
  { id: "M-02", time: "2025-10-13 14:25", from: "NightKiller", to: "ALL", text: "Потвърждавам. Маршрут 17. Транспортът е готов." },
  { id: "M-03", time: "2025-10-13 14:26", from: "Black-Voyvoda", to: "ALL", text: "Охраната е на място. Захарна фабрика, западно крило." },
  { id: "M-04", time: "2025-10-13 14:30", from: "ToxicBabe", to: "GothGirl", text: "GG, смени паролата — стандартна процедура преди операция. Не отговаряй в общия чат." },
  { id: "M-05", time: "2025-10-14 09:00", from: "DataCracker6", to: "ALL", text: "Публикувах decoy GPS данни. NullSyn ще ги разпространи. Сметката е чиста." },
  { id: "M-06", time: "2025-10-14 10:15", from: "RedFox", to: "ALL", text: "Не забравяйте — route-17-night е само bait за любопитни. Реалният маршрут е в Захарна фабрика." },
  { id: "M-07", time: "2025-10-15 20:00", from: "NightKiller", to: "Black-Voyvoda", text: "Тргвам. 40 мин. Д.М. изпраща потвърждение." },
  { id: "M-08", time: "2025-10-15 20:05", from: "Black-Voyvoda", to: "NightKiller", text: "Разбрано. Задната врата е отворена. Пазя." },
  { id: "M-09", time: "2025-10-16 01:00", from: "RedFox", to: "ALL", text: "Ритуалът е завършен. Фаза 3 изпълнена. Изчистете следите." },
  { id: "M-10", time: "2025-10-16 01:05", from: "DataCracker6", to: "ALL", text: "Чистя логовете. IP адресите са маскирани. NODE-7 е зачистен." },
]

export default function CultChatSystemPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loggedIn, setLoggedIn] = useState<{ user: string; role: string; displayName: string } | null>(null)
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [highlighted, setHighlighted] = useState(false)

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleLogin = () => {
    const trimUser = username.trim()
    const trimPass = password.trim()

    // GothGirl with old password
    if (trimUser === "GothGirl" && trimPass === "joko1132") {
      setLoginError("⚠ Паролата на този акаунт е сменена преди 3 дни. Свържи се с BruteForce в /blackmarket за нова парола.")
      return
    }

    // GothGirl with wrong password
    if (trimUser === "GothGirl") {
      setLoginError("Невалидни данни за вход.")
      return
    }

    const cred = VALID_CREDENTIALS[trimUser]
    if (cred && trimPass === cred.pass) {
      setLoggedIn({ user: trimUser, role: cred.role, displayName: cred.displayName })
      setLoginError("")
    } else {
      setLoginError("Невалидни данни за вход.")
    }
  }

  const handleSave = (msg: typeof CHAT_MESSAGES[number]) => {
    const id = `chat-${msg.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[CHAT] ${msg.from} → ${msg.to}`,
      text: `[${msg.time}] ${msg.from}: ${msg.text}`,
      sourceRoute: "/cult/chat-system",
      confidence: msg.highlighted ? 5 : 3, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/hidden-wiki-2/cult" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.15em", textDecoration: "none" }}>← CULT</Link>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="CHAT SYSTEM" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <AnimatePresence mode="wait">
        {!loggedIn ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ padding: "10px 14px", background: "#0d000d", border: `1px solid ${ACCENT}20`, marginBottom: 24 }}>
              <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
                Вход в закрития чат на Братството. Нужен акаунт на оператор. Credentials можеш да намериш в <Link href="/hidden-wiki-2/leaks/passwords" style={{ color: ACCENT }}>LEAKS/PASSWORDS</Link>.
              </p>
            </div>

            <div style={{ maxWidth: 400, margin: "0 auto", padding: "28px 24px", background: "#080808", border: "1px solid #1e1e1e" }}>
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.2em", marginBottom: 20 }}>
                BROTHERHOOD INTERNAL CHAT — LOGIN
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 8, color: "#555", fontFamily: "var(--font-mono)", marginBottom: 5 }}>USERNAME</div>
                <input value={username} onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  style={{ width: "100%", padding: "7px 10px", background: "#111", border: "1px solid #222", color: "#e0e0e0", fontSize: 12, fontFamily: "var(--font-mono)", outline: "none" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 8, color: "#555", fontFamily: "var(--font-mono)", marginBottom: 5 }}>PASSWORD</div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  style={{ width: "100%", padding: "7px 10px", background: "#111", border: "1px solid #222", color: "#e0e0e0", fontSize: 12, fontFamily: "var(--font-mono)", outline: "none" }} />
              </div>
              {loginError && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: "8px 12px", background: "#1a0000", border: "1px solid #FF003330", marginBottom: 12, fontSize: 10, color: loginError.includes("BruteForce") ? ACCENT : "#FF0033", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
                  {loginError}
                  {loginError.includes("BruteForce") && (
                    <div style={{ marginTop: 6 }}>
                      <Link href="/hidden-wiki-2/blackmarket" style={{ color: ACCENT, fontSize: 9 }}>→ Отиди в /blackmarket</Link>
                    </div>
                  )}
                </motion.div>
              )}
              <button onClick={handleLogin}
                style={{ width: "100%", padding: "8px 0", background: `${ACCENT}22`, border: `1px solid ${ACCENT}50`, color: ACCENT, fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.15em", cursor: "pointer" }}>
                LOGIN →
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "#0a000a", border: `1px solid ${ACCENT}20`, marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#888" }}>
                Влязъл като: <span style={{ color: ACCENT }}>{loggedIn.displayName}</span>
                <span style={{ marginLeft: 10, fontSize: 8, color: "#555" }}>[{loggedIn.role}]</span>
              </div>
              <button onClick={() => { setLoggedIn(null); setUsername(""); setPassword("") }}
                style={{ background: "none", border: "1px solid #222", color: "#555", fontSize: 8, fontFamily: "var(--font-mono)", padding: "3px 8px", cursor: "pointer" }}>
                LOGOUT
              </button>
            </div>

            <div style={{ padding: "10px 14px", background: "#080808", border: "1px solid #1a1a1a", marginBottom: 16 }}>
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.15em", marginBottom: 6 }}>АРХИВ — ОКТОМВРИ 2025</div>
              <p style={{ fontSize: 10, color: "#888", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
                Показани само съобщения до теб или до ALL. Съобщенията между GothGirl и ToxicBabe са скрити — паролата е сменена.
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
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 5 }}>
                          <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444" }}>{msg.time}</span>
                          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: msg.from === "RedFox" ? "#FF0033" : ACCENT, fontWeight: 600 }}>{msg.from}</span>
                          <span style={{ fontSize: 8, color: "#333", fontFamily: "var(--font-mono)" }}>→ {msg.to}</span>
                          {msg.highlighted && <span style={{ fontSize: 7, color: "#FF0033", border: "1px solid #FF003330", padding: "1px 5px", fontFamily: "var(--font-mono)" }}>⚠ KEY</span>}
                        </div>
                        <div style={{ fontSize: 11, color: "#d0d0d0", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>{msg.text}</div>
                      </div>
                      <button onClick={() => handleSave(msg)}
                        style={{ padding: "3px 10px", fontSize: 8, fontFamily: "var(--font-mono)", background: isSaved ? `${ACCENT}18` : "#0d0d0d", color: isSaved ? ACCENT : "#555", border: `1px solid ${isSaved ? ACCENT + "40" : "#1e1e1e"}`, cursor: "pointer", flexShrink: 0 }}>
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
    </div>
  )
}
