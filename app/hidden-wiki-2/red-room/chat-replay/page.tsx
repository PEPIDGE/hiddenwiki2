"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
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

const USERS = ["NightKiller", "GothGirl", "ToxicBabe", "Black-Voyvoda", "RedFox", "DataCracker6", "OutsiderX"]
const USER_COLORS: Record<string, string> = {
  "NightKiller": "#FF0033",
  "GothGirl": "#CC44FF",
  "ToxicBabe": "#FF6B00",
  "Black-Voyvoda": "#bbbbbb",
  "RedFox": "#FF3366",
  "DataCracker6": "#00BFFF",
  "OutsiderX": "#00FF9F",
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
        <Link href="/hidden-wiki-2/red-room" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", textDecoration: "none" }}>
          ← RED ROOM
        </Link>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="CHAT REPLAY" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {(["ALL", "EDITED", "REMOVED", "REPLIES", "USERS"] as FilterType[]).map((f) => (
          <button key={f} onClick={() => { setFilter(f); setUserFilter(null) }}
            style={{ padding: "5px 12px", fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", background: filter === f ? `${ACCENT}22` : "#0d0d0d", color: filter === f ? ACCENT : "#999999", border: `1px solid ${filter === f ? ACCENT + "50" : "#1e1e1e"}`, cursor: "pointer" }}>
            {f}
          </button>
        ))}
        <div style={{ marginLeft: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {USERS.map((u) => (
            <button key={u} onClick={() => { setUserFilter(userFilter === u ? null : u); setFilter("ALL") }}
              style={{ padding: "4px 8px", fontSize: 7, fontFamily: "var(--font-mono)", background: userFilter === u ? `${USER_COLORS[u]}22` : "#0a0a0a", color: userFilter === u ? USER_COLORS[u] : "#909090", border: `1px solid ${userFilter === u ? USER_COLORS[u] + "40" : "#1a1a1a"}`, cursor: "pointer" }}>
              {u}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        {/* Messages list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {filtered.map((msg) => {
            const isSelected = selected === msg.id
            const userColor = USER_COLORS[msg.user] ?? "#bbbbbb"
            const showOrig = showOriginal[msg.id]
            return (
              <div key={msg.id}
                onClick={() => setSelected(isSelected ? null : msg.id)}
                style={{
                  padding: "10px 14px", background: isSelected ? "#0e0a0a" : msg.important ? "#0a0808" : "#080808",
                  border: `1px solid ${isSelected ? ACCENT + "30" : msg.important ? "#2a1a1a" : "#111"}`,
                  cursor: "pointer", position: "relative",
                }}>
                {msg.removed && (
                  <div style={{ position: "absolute", top: 0, right: 0, padding: "2px 7px", background: "#1a0000", fontSize: 7, fontFamily: "var(--font-mono)", color: ACCENT + "80", letterSpacing: "0.1em" }}>
                    REMOVED
                  </div>
                )}
                {msg.edited && !msg.removed && (
                  <div style={{ position: "absolute", top: 0, right: 0, padding: "2px 7px", background: "#1a0d00", fontSize: 7, fontFamily: "var(--font-mono)", color: "#FF6B00", letterSpacing: "0.1em" }}>
                    EDITED
                  </div>
                )}
                {msg.replyTo && (
                  <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginBottom: 4, letterSpacing: "0.08em" }}>
                    ↳ reply to {CHAT_MESSAGES.find((m) => m.id === msg.replyTo)?.user ?? "?"}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 5 }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: userColor, fontWeight: 700, letterSpacing: "0.05em" }}>
                    {msg.user}
                  </span>
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444" }}>{msg.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: msg.removed ? "#444" : "#c0c0c0", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
                  {msg.removed && showOrig && msg.original ? (
                    <span style={{ color: "#FF6B00" }}>[RESTORED]: {msg.original}</span>
                  ) : msg.edited && showOrig && msg.original ? (
                    <span style={{ color: "#FFD700" }}>[ORIGINAL]: {msg.original}</span>
                  ) : msg.text}
                </p>
                {(msg.removed || msg.edited) && msg.original && (
                  <button onClick={(e) => { e.stopPropagation(); setShowOriginal((s) => ({ ...s, [msg.id]: !s[msg.id] })) }}
                    style={{ marginTop: 6, padding: "2px 8px", fontSize: 7, fontFamily: "var(--font-mono)", background: "none", color: msg.removed ? ACCENT : "#FF6B00", border: `1px solid ${msg.removed ? ACCENT + "30" : "#FF6B0030"}`, cursor: "pointer" }}>
                    {showOrig ? "СКРИЙ ОРИГИНАЛ" : "ПОКАЖИ ОРИГИНАЛ"}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Detail panel */}
        <div style={{ background: "#080808", border: "1px solid #1e1e1e", padding: 16, height: "fit-content", position: "sticky", top: 0 }}>
          {selectedMsg ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={selectedMsg.id}>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.2em", marginBottom: 12 }}>MESSAGE DETAIL</div>
              <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: USER_COLORS[selectedMsg.user] ?? "#e0e0e0", fontWeight: 700, marginBottom: 6 }}>{selectedMsg.user}</div>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", marginBottom: 14 }}>{selectedMsg.time}</div>
              <p style={{ fontSize: 11, color: "#c0c0c0", lineHeight: 1.7, fontFamily: "var(--font-mono)", marginBottom: 12 }}>
                {showOriginal[selectedMsg.id] && selectedMsg.original ? selectedMsg.original : selectedMsg.text}
              </p>
              {selectedMsg.original && (
                <div style={{ padding: "8px 10px", background: "#0d0d0d", border: "1px solid #222", marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: "#909090", fontFamily: "var(--font-mono)", marginBottom: 4 }}>ОРИГИНАЛ:</div>
                  <p style={{ fontSize: 10, color: "#FF6B00", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>{selectedMsg.original}</p>
                </div>
              )}
              {selectedMsg.replies.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: "#444", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", marginBottom: 6 }}>REPLIES: {selectedMsg.replies.length}</div>
                  {selectedMsg.replies.map((rid: string) => {
                    const reply = CHAT_MESSAGES.find((m) => m.id === rid)
                    return reply ? (
                      <div key={rid} style={{ padding: "4px 8px", background: "#0a0a0a", border: "1px solid #161616", marginBottom: 4, fontSize: 10, color: "#bbbbbb", fontFamily: "var(--font-mono)" }}>
                        <span style={{ color: USER_COLORS[reply.user] ?? "#999999" }}>{reply.user}:</span> {reply.text}
                      </div>
                    ) : null
                  })}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <button onClick={() => handleSave(selectedMsg, "msg", `${selectedMsg.user} @ ${selectedMsg.time}: ${selectedMsg.original ?? selectedMsg.text}`)}
                  style={{ padding: "5px 10px", fontSize: 9, fontFamily: "var(--font-mono)", background: savedClues.includes(`chat-${selectedMsg.id}-msg`) ? `${ACCENT}18` : "#0d0d0d", color: savedClues.includes(`chat-${selectedMsg.id}-msg`) ? ACCENT : "#aaaaaa", border: `1px solid ${savedClues.includes(`chat-${selectedMsg.id}-msg`) ? ACCENT + "40" : "#222"}`, cursor: "pointer", textAlign: "left" }}>
                  {savedClues.includes(`chat-${selectedMsg.id}-msg`) ? "✓ SAVED" : "SAVE MESSAGE"}
                </button>
                <button onClick={() => handleSave(selectedMsg, "user", `User in chat: ${selectedMsg.user}`)}
                  style={{ padding: "5px 10px", fontSize: 9, fontFamily: "var(--font-mono)", background: savedClues.includes(`chat-${selectedMsg.id}-user`) ? `${ACCENT}18` : "#0d0d0d", color: savedClues.includes(`chat-${selectedMsg.id}-user`) ? ACCENT : "#aaaaaa", border: `1px solid ${savedClues.includes(`chat-${selectedMsg.id}-user`) ? ACCENT + "40" : "#222"}`, cursor: "pointer", textAlign: "left" }}>
                  {savedClues.includes(`chat-${selectedMsg.id}-user`) ? "✓ SAVED" : "SAVE USER"}
                </button>
              </div>
            </motion.div>
          ) : (
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#333", textAlign: "center", padding: "30px 0" }}>
              Цъкни съобщение за детайли
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
