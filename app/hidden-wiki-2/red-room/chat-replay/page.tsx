"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF0033"

// DEMO chat replay messages
const CHAT_MESSAGES = [
  { id: 1, time: "22:04:11", user: "OPERATOR_7", text: "Всичко е наред. Продължавай по план.", hidden: false },
  { id: 2, time: "22:08:33", user: "NODE_ALPHA", text: "Потвърди локация.", hidden: false },
  { id: 3, time: "22:09:01", user: "OPERATOR_7", text: "Без локация. Само огледалото.", hidden: false },
  { id: 4, time: "22:11:44", user: "RF-NODE", text: "Огледалният преход е потвърден за утре.", hidden: false },
  { id: 5, time: "22:13:02", user: "NODE_ALPHA", text: "03:17 — не го забравяй.", hidden: false },
  { id: 6, time: "22:14:55", user: "OPERATOR_7", text: "Разбрано. Черното А3 е на позиция.", hidden: false },
  { id: 7, time: "22:16:08", user: "RF-NODE", text: "Следващата точка е покрита.", hidden: false },
  { id: 8, time: "22:17:02", user: "OPERATOR_7", text: "...", hidden: true, hiddenLine: "RF-GATE::PA" },
  { id: 9, time: "22:17:44", user: "SYSTEM", text: "[SIGNAL LOST — Запис прекъснат]", hidden: false },
]

// Keywords that trigger hidden lines
const TRIGGER_KEYWORDS = ["огледало", "03:17", "покана"]

export default function ChatReplayPage() {
  const [search, setSearch] = useState("")
  const [triggeredKeywords, setTriggeredKeywords] = useState<string[]>([])
  const [revealedHidden, setRevealedHidden] = useState(false)
  const [tokenPartA, setTokenPartA] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (val: string) => {
    setSearch(val)
    const lower = val.toLowerCase()
    const found = TRIGGER_KEYWORDS.filter((kw) => lower.includes(kw))
    if (found.length > 0) {
      setTriggeredKeywords((prev) => Array.from(new Set([...prev, ...found])))
    }
  }

  useEffect(() => {
    if (triggeredKeywords.length === 3 && !revealedHidden) {
      setTimeout(() => setRevealedHidden(true), 600)
    }
  }, [triggeredKeywords, revealedHidden])

  const handleSaveToken = () => {
    if (saved) return
    const gs = getGameState()
    let updated = addClue(gs, {
      id: "rr3-chat-token",
      title: "Токен RF-GATE (частичен) — RF-GATE::PA",
      text: "В chat replay на 22:17 е скрит ред. Съдържа частичен токен: RF-GATE::PA. Необходима е втора половина от друг сайт.",
      sourceRoute: "/red-room/chat-replay",
      confidence: 3,
      status: "unverified",
    })
    updated = {
      ...updated,
      tokens: { ...updated.tokens, "RF-GATE::PA": true },
    }
    saveGameState(updated)
    setSaved(true)
  }

  const highlightText = (text: string) => {
    if (!search) return text
    const lower = search.toLowerCase()
    const matchedKw = TRIGGER_KEYWORDS.find((kw) => lower.includes(kw) && text.toLowerCase().includes(kw))
    if (!matchedKw) return text
    const idx = text.toLowerCase().indexOf(matchedKw)
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ color: ACCENT, background: `${ACCENT}20`, padding: "0 2px" }}>
          {text.slice(idx, idx + matchedKw.length)}
        </span>
        {text.slice(idx + matchedKw.length)}
      </>
    )
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/red-room" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333333", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← RED ROOM
        </Link>
        <div style={{ height: "1px", background: "#111111", margin: "10px 0" }} />
        <GlitchText text="CHAT REPLAY" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", marginTop: 6 }}>
          PUZZLE RR3 — Търси ключови думи в чата. Открий скритото.
        </div>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333333", letterSpacing: "0.1em", marginBottom: 6 }}>
          KEYWORD SEARCH
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Въведи ключова дума..."
            style={{
              flex: 1, background: "#050505", border: "1px solid #1a1a1a",
              color: ACCENT, fontFamily: "var(--font-mono)", fontSize: 12,
              padding: "8px 12px", outline: "none", letterSpacing: "0.1em",
              caretColor: ACCENT,
            }}
            onFocus={(e) => { e.target.style.borderColor = `${ACCENT}60` }}
            onBlur={(e) => { e.target.style.borderColor = "#1a1a1a" }}
          />
        </div>
        {/* Keyword progress */}
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {TRIGGER_KEYWORDS.map((kw) => (
            <span key={kw} style={{
              fontSize: 9, fontFamily: "var(--font-mono)",
              padding: "2px 8px", border: `1px solid ${triggeredKeywords.includes(kw) ? `${ACCENT}60` : "#1a1a1a"}`,
              color: triggeredKeywords.includes(kw) ? ACCENT : "#222222",
              letterSpacing: "0.1em", transition: "all 0.2s",
              boxShadow: triggeredKeywords.includes(kw) ? `0 0 6px ${ACCENT}30` : "none",
            }}>
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Chat log */}
      <div style={{ border: "1px solid #1a1a1a", background: "#080303" }}>
        <div style={{ padding: "8px 14px", borderBottom: "1px solid #111111", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333333", letterSpacing: "0.1em" }}>ENCRYPTED CHANNEL :: RF-BROADCAST</span>
          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#1a1a1a" }}>22:04 — 22:17</span>
        </div>
        <div style={{ padding: "12px 0" }}>
          {CHAT_MESSAGES.map((msg) => {
            const isHidden = msg.hidden
            const showHidden = isHidden && revealedHidden
            if (isHidden && !revealedHidden) return null
            return (
              <div key={msg.id}
                style={{
                  padding: "6px 14px",
                  display: "flex", gap: 12, alignItems: "flex-start",
                  background: showHidden ? `${ACCENT}08` : "transparent",
                  borderLeft: showHidden ? `2px solid ${ACCENT}` : "2px solid transparent",
                  animation: showHidden ? "fade-up 0.4s ease" : undefined,
                }}
              >
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#222222", minWidth: 64, flexShrink: 0 }}>{msg.time}</span>
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: msg.user === "SYSTEM" ? "#333333" : ACCENT, minWidth: 100, flexShrink: 0, letterSpacing: "0.05em" }}>
                  {msg.user}
                </span>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: msg.user === "SYSTEM" ? "#222222" : "var(--muted-foreground)", lineHeight: 1.6, flex: 1 }}>
                  {showHidden ? (
                    <span style={{ color: ACCENT, letterSpacing: "0.15em", fontWeight: 700 }}>
                      {msg.hiddenLine}
                    </span>
                  ) : (
                    highlightText(msg.text)
                  )}
                </span>
              </div>
            )
          })}

          {revealedHidden && (
            <div style={{ padding: "10px 14px", borderTop: "1px solid #111111", marginTop: 8, animation: "fade-up 0.3s ease" }}>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333333", letterSpacing: "0.1em", marginBottom: 8 }}>
                [HIDDEN LINE DISCOVERED — 22:17]
              </div>
              <button
                onClick={handleSaveToken}
                disabled={saved}
                style={{
                  background: "transparent", border: `1px solid ${ACCENT}60`,
                  color: saved ? "#333333" : ACCENT, fontFamily: "var(--font-mono)",
                  fontSize: 10, letterSpacing: "0.1em", padding: "8px 20px",
                  cursor: saved ? "not-allowed" : "pointer",
                }}
              >
                {saved ? "ТОКЕН ЗАПИСАН ВЪВ EVIDENCE BOARD" : "ЗАПАЗИ ТОКЕН → RF-GATE::PA"}
              </button>
            </div>
          )}
        </div>
      </div>

      {!revealedHidden && triggeredKeywords.length < 3 && (
        <div style={{ marginTop: 12, fontSize: 9, fontFamily: "var(--font-mono)", color: "#1a1a1a", letterSpacing: "0.05em" }}>
          [Открити: {triggeredKeywords.length}/3 ключови думи]
        </div>
      )}
    </div>
  )
}
