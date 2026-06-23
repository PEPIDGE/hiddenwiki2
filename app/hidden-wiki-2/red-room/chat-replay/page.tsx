"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF0033"

type FilterType = "ALL" | "EDITED" | "REMOVED" | "REPLIES" | "USERS"

const CHAT_MESSAGES = [
  { id: "M-001", user: "NightKiller", time: "2025-10-14 21:33", text: "Потвърдено за утре. 18:30. Знаеш кой.", edited: false, removed: false, replies: ["M-002"], replyTo: null, important: true, original: null },
  { id: "M-002", user: "GothGirl", time: "2025-10-14 21:34", text: "Разбрах. Тя е готова. Очаква покана.", edited: false, removed: false, replies: [], replyTo: "M-001", important: true, original: null },
  { id: "M-003", user: "anon_viewer_441", time: "2025-10-14 21:40", text: "Кога следващото?", edited: false, removed: false, replies: [], replyTo: null, important: false, original: null },
  { id: "M-004", user: "ToxicBabe", time: "2025-10-14 22:00", text: "Маршрут минава покрай парка. [РЕДАКТИРАНО]", edited: true, removed: false, replies: ["M-005"], replyTo: null, important: true, original: "Маршрут минава покрай Западен парк. Ще оставим вещта там." },
  { id: "M-005", user: "Black-Voyvoda", time: "2025-10-14 22:02", text: "Разбрах.", edited: false, removed: false, replies: [], replyTo: "M-004", important: false, original: null },
  { id: "M-006", user: "RedFox", time: "2025-10-14 22:17", text: "[ИЗТРИТО]", edited: false, removed: true, replies: [], replyTo: null, important: true, original: "DC6 — изчисти всичко след 22:17. Без следи." },
  { id: "M-007", user: "viewer_8812", time: "2025-10-14 22:20", text: "10/10 stream", edited: false, removed: false, replies: [], replyTo: null, important: false, original: null },
  { id: "M-008", user: "GothGirl", time: "2025-10-14 22:45", text: "Телефонът е изключен. Всичко е наред.", edited: false, removed: false, replies: ["M-009"], replyTo: null, important: true, original: null },
  { id: "M-009", user: "NightKiller", time: "2025-10-14 22:46", text: "✓", edited: false, removed: false, replies: [], replyTo: "M-008", important: false, original: null },
  { id: "M-010", user: "OutsiderX", time: "2025-10-14 23:00", text: "Чакайте — кой е DC6 и защо чисти след 22:17? Някой го ли знае?", edited: false, removed: false, replies: ["M-011"], replyTo: null, important: true, original: null },
  { id: "M-011", user: "DataCracker6", time: "2025-10-14 23:01", text: "[ИЗТРИТО]", edited: false, removed: true, replies: [], replyTo: "M-010", important: true, original: "Не питай. Изтривам и тебе." },
  { id: "M-012", user: "ToxicBabe", time: "2025-10-15 00:15", text: "Лора е тиха. Добре.", edited: false, removed: false, replies: [], replyTo: null, important: true, original: null },
  { id: "M-013", user: "RedFox", time: "2025-10-15 03:17", text: "[РЕДАКТИРАНО]", edited: true, removed: false, replies: [], replyTo: null, important: true, original: "Транзакцията е потвърдена. NODE-7. DC-0077." },
  { id: "M-014", user: "anon_patron", time: "2025-10-15 09:00", text: "Благодаря за снощи", edited: false, removed: false, replies: [], replyTo: null, important: false, original: null },
]

const AMBER = "#FFB000"
const USERS = ["NightKiller", "GothGirl", "ToxicBabe", "Black-Voyvoda", "RedFox", "DataCracker6", "OutsiderX"]
// Palette only: red = core perpetrators, amber = involved, green/gray = peripheral
const USER_COLORS: Record<string, string> = {
  "NightKiller": "#FF0033",
  "RedFox": "#FF0033",
  "GothGirl": AMBER,
  "ToxicBabe": AMBER,
  "DataCracker6": AMBER,
  "OutsiderX": "#00FF41",
  "Black-Voyvoda": "#bbbbbb",
}

export default function ChatReplayPage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [filter, setFilter] = useState<FilterType>("ALL")
  const [selected, setSelected] = useState<string | null>(null)
  const [userFilter, setUserFilter] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const filtered = CHAT_MESSAGES.filter((m) => {
    if (userFilter && m.user !== userFilter) return false
    if (filter === "EDITED") return m.edited
    if (filter === "REMOVED") return m.removed
    if (filter === "REPLIES") return !!m.replyTo
    if (filter === "USERS") return USERS.includes(m.user)
    return true
  })

  const handleSave = (msg: typeof CHAT_MESSAGES[number], suffix: string, text: string) => {
    const id = `chat-${msg.id}-${suffix}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[CHAT REPLAY] ${msg.user} — ${suffix}`,
      text, sourceRoute: "/red-room/chat-replay", confidence: 4, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  const selectedMsg = selected ? CHAT_MESSAGES.find((m) => m.id === selected) : null

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/hidden-wiki-2/red-room" style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#bdbdbd", letterSpacing: "0.12em", textDecoration: "none" }}>
          ← RED ROOM
        </Link>
        <div style={{ marginTop: 12 }}>
          <GlitchText text="CHAT REPLAY" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 10 }} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {(["ALL", "EDITED", "REMOVED", "REPLIES", "USERS"] as FilterType[]).map((f) => (
          <button key={f} onClick={() => { setFilter(f); setUserFilter(null) }}
            style={{ padding: "6px 14px", fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", background: filter === f ? `${ACCENT}22` : "#111", color: filter === f ? ACCENT : "#c0c0c0", border: `1px solid ${filter === f ? ACCENT + "55" : "#2a2a2a"}`, cursor: "pointer", fontWeight: 700 }}>
            {f}
          </button>
        ))}
        <div style={{ marginLeft: 8, display: "flex", gap: 5, flexWrap: "wrap" }}>
          {USERS.map((u) => (
            <button key={u} onClick={() => { setUserFilter(userFilter === u ? null : u); setFilter("ALL") }}
              style={{ padding: "5px 10px", fontSize: 9, fontFamily: "var(--font-mono)", background: userFilter === u ? `${USER_COLORS[u]}22` : "#0d0d0d", color: userFilter === u ? USER_COLORS[u] : "#b0b0b0", border: `1px solid ${userFilter === u ? USER_COLORS[u] + "55" : "#222"}`, cursor: "pointer" }}>
              {u}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedMsg ? "1fr 340px" : "1fr", gap: 16, transition: "grid-template-columns 0.2s" }}>
        {/* Messages list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {filtered.map((msg) => {
            const isSelected = selected === msg.id
            const userColor = USER_COLORS[msg.user] ?? "#bbbbbb"
            const showOrig = showOriginal[msg.id]
            return (
              <div key={msg.id}
                onClick={() => setSelected(isSelected ? null : msg.id)}
                style={{
                  padding: "12px 16px", background: isSelected ? "#100a0a" : msg.important ? "#0b0808" : "#0a0a0a",
                  border: `1px solid ${isSelected ? ACCENT + "44" : msg.important ? "#2e1a1a" : "#181818"}`,
                  cursor: "pointer", position: "relative",
                }}>
                {msg.removed && (
                  <div style={{ position: "absolute", top: 0, right: 0, padding: "3px 9px", background: `${ACCENT}1a`, fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.1em" }}>
                    REMOVED
                  </div>
                )}
                {msg.edited && !msg.removed && (
                  <div style={{ position: "absolute", top: 0, right: 0, padding: "3px 9px", background: `${AMBER}1a`, fontSize: 9, fontFamily: "var(--font-mono)", color: AMBER, letterSpacing: "0.1em" }}>
                    EDITED
                  </div>
                )}
                {msg.replyTo && (
                  <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#8a8a8a", marginBottom: 5, letterSpacing: "0.06em" }}>
                    ↳ reply to {CHAT_MESSAGES.find((m) => m.id === msg.replyTo)?.user ?? "?"}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: userColor, fontWeight: 700, letterSpacing: "0.04em" }}>
                    {msg.user}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#8a8a8a" }}>{msg.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: msg.removed ? "#888" : "#d4d4d4", fontFamily: "var(--font-mono)", lineHeight: 1.65 }}>
                  {msg.removed && showOrig && msg.original ? (
                    <span style={{ color: AMBER }}>[RESTORED]: {msg.original}</span>
                  ) : msg.edited && showOrig && msg.original ? (
                    <span style={{ color: AMBER }}>[ORIGINAL]: {msg.original}</span>
                  ) : msg.text}
                </p>
                {(msg.removed || msg.edited) && msg.original && (
                  <button onClick={(e) => { e.stopPropagation(); setShowOriginal((s) => ({ ...s, [msg.id]: !s[msg.id] })) }}
                    style={{ marginTop: 8, padding: "4px 10px", fontSize: 10, fontFamily: "var(--font-mono)", background: "none", color: msg.removed ? ACCENT : AMBER, border: `1px solid ${msg.removed ? ACCENT + "44" : AMBER + "44"}`, cursor: "pointer", letterSpacing: "0.06em" }}>
                    {showOrig ? "СКРИЙ ОРИГИНАЛ" : "ПОКАЖИ ОРИГИНАЛ"}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Detail panel — only when a message is selected */}
        {selectedMsg && (
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} key={selectedMsg.id}
            style={{ background: "#0a0a0a", border: `1px solid ${ACCENT}33`, padding: 16, height: "fit-content", position: "sticky", top: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#9a9a9a", letterSpacing: "0.18em" }}>MESSAGE DETAIL</span>
              <button onClick={() => setSelected(null)} aria-label="Затвори"
                style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
            </div>
            <div style={{ fontSize: 15, fontFamily: "var(--font-mono)", color: USER_COLORS[selectedMsg.user] ?? "#e0e0e0", fontWeight: 700, marginBottom: 6 }}>{selectedMsg.user}</div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#9a9a9a", marginBottom: 14 }}>{selectedMsg.time}</div>
            <p style={{ fontSize: 13, color: "#d4d4d4", lineHeight: 1.7, fontFamily: "var(--font-mono)", marginBottom: 12 }}>
              {showOriginal[selectedMsg.id] && selectedMsg.original ? selectedMsg.original : selectedMsg.text}
            </p>
            {selectedMsg.original && (
              <div style={{ padding: "9px 11px", background: `${AMBER}0d`, border: `1px solid ${AMBER}33`, marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "#b0b0b0", fontFamily: "var(--font-mono)", marginBottom: 5, letterSpacing: "0.08em" }}>ОРИГИНАЛ:</div>
                <p style={{ fontSize: 12, color: AMBER, margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>{selectedMsg.original}</p>
              </div>
            )}
            {selectedMsg.replies.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "#9a9a9a", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", marginBottom: 6 }}>REPLIES: {selectedMsg.replies.length}</div>
                {selectedMsg.replies.map((rid: string) => {
                  const reply = CHAT_MESSAGES.find((m) => m.id === rid)
                  return reply ? (
                    <div key={rid} style={{ padding: "6px 9px", background: "#0d0d0d", border: "1px solid #1c1c1c", marginBottom: 4, fontSize: 12, color: "#cccccc", fontFamily: "var(--font-mono)" }}>
                      <span style={{ color: USER_COLORS[reply.user] ?? "#bbbbbb" }}>{reply.user}:</span> {reply.text}
                    </div>
                  ) : null
                })}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button onClick={() => handleSave(selectedMsg, "msg", `${selectedMsg.user} @ ${selectedMsg.time}: ${selectedMsg.original ?? selectedMsg.text}`)}
                style={{ padding: "7px 11px", fontSize: 11, fontFamily: "var(--font-mono)", background: savedClues.includes(`chat-${selectedMsg.id}-msg`) ? `${ACCENT}18` : "#111", color: savedClues.includes(`chat-${selectedMsg.id}-msg`) ? ACCENT : "#cccccc", border: `1px solid ${savedClues.includes(`chat-${selectedMsg.id}-msg`) ? ACCENT + "55" : "#333"}`, cursor: "pointer", textAlign: "left", letterSpacing: "0.06em" }}>
                {savedClues.includes(`chat-${selectedMsg.id}-msg`) ? "✓ ЗАПАЗЕНО" : "ЗАПАЗИ СЪОБЩЕНИЕ"}
              </button>
              <button onClick={() => handleSave(selectedMsg, "user", `User in chat: ${selectedMsg.user}`)}
                style={{ padding: "7px 11px", fontSize: 11, fontFamily: "var(--font-mono)", background: savedClues.includes(`chat-${selectedMsg.id}-user`) ? `${ACCENT}18` : "#111", color: savedClues.includes(`chat-${selectedMsg.id}-user`) ? ACCENT : "#cccccc", border: `1px solid ${savedClues.includes(`chat-${selectedMsg.id}-user`) ? ACCENT + "55" : "#333"}`, cursor: "pointer", textAlign: "left", letterSpacing: "0.06em" }}>
                {savedClues.includes(`chat-${selectedMsg.id}-user`) ? "✓ ЗАПАЗЕН" : "ЗАПАЗИ ПОТРЕБИТЕЛ"}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
