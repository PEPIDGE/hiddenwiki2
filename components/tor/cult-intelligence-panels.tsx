"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { GlitchText } from "@/components/tor/glitch-text"
import {
  getCultChatArchive,
  getCultChatMembers,
  type CultChatConversation,
  type CultChatMember,
  type CultChatMessage,
} from "@/lib/cult-chats"
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

interface CultChatSystemPanelProps extends CultPanelProps {
  cultSlug: string
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

export function CultChatSystemPanel({ cultName, sourceRoute, cultSlug }: CultChatSystemPanelProps) {
  const archive = getCultChatArchive(cultSlug)
  const members = getCultChatMembers(archive)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loggedIn, setLoggedIn] = useState<CultChatMember | null>(null)
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [activeConversationId, setActiveConversationId] = useState(archive.conversations[0]?.id ?? "")

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  useEffect(() => {
    setActiveConversationId(archive.conversations[0]?.id ?? "")
    setLoggedIn(null)
    setUsername("")
    setPassword("")
    setLoginError("")
  }, [cultSlug, archive.conversations])

  const handleLogin = () => {
    const trimUser = username.trim()
    const trimPass = password.trim()
    const member = members.find((profile) => profile.username.toLowerCase() === trimUser.toLowerCase())

    if (member && trimPass === member.password) {
      setLoggedIn(member)
      const firstConversation = archive.conversations.find((conversation) => conversation.participants.includes(member.username))
      setActiveConversationId(firstConversation?.id ?? "")
      setLoginError("")
      return
    }

    setLoginError("Невалидни данни за вход.")
  }

  const handleSave = (conversation: CultChatConversation, msg: CultChatMessage) => {
    const id = `chat-${cultSlug}-${conversation.id}-${msg.id}`
    if (savedClues.includes(id)) return

    saveGameState(addClue(getGameState(), {
      id,
      title: `[CHAT] ${loggedIn?.username ?? "UNKNOWN"} // ${conversation.title}`,
      text: `[${conversation.title}] [${msg.time}] ${msg.author}: ${msg.text}`,
      sourceRoute,
      confidence: msg.highlighted ? 5 : conversation.kind === "group" ? 4 : 3,
      status: "unverified",
    }))
    setSavedClues((prev) => [...prev, id])
  }

  const visibleConversations = loggedIn
    ? archive.conversations.filter((conversation) => conversation.participants.includes(loggedIn.username))
    : archive.conversations
  const activeConversation = visibleConversations.find((conversation) => conversation.id === activeConversationId) ?? visibleConversations[0]
  const activeParticipants = activeConversation?.participants.filter((participant) => participant !== loggedIn?.username) ?? []
  const activeSubtitle = activeConversation
    ? activeConversation.kind === "group"
      ? `${activeConversation.participants.length} участници`
      : activeParticipants[0] ?? "директен чат"
    : "няма разговор"

  return (
    <section id="chat-system" style={{ marginTop: 32, scrollMarginTop: 24 }}>
      <SectionHeading label="CHAT SYSTEM" detail={`${cultName} // member accounts`} />

      <AnimatePresence mode="wait">
        {!loggedIn ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ padding: "10px 14px", background: "#0d000d", border: `1px solid ${ACCENT}20`, marginBottom: 18 }}>
              <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
                Вътрешният чат пази отделни акаунти за членовете на тази секта. Всеки профил има собствен username и password.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 12, alignItems: "start" }}>
              <div style={{ padding: "24px", background: "#080808", border: "1px solid #1e1e1e" }}>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.2em", marginBottom: 20 }}>
                  MEMBER CHAT // LOGIN
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
                    style={{ padding: "8px 12px", background: "#1a0000", border: "1px solid #FF003330", marginBottom: 12, fontSize: 10, color: "#FF0033", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}
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

              <div style={{ padding: "12px", background: "#050505", border: "1px solid #181818" }}>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.18em", marginBottom: 10 }}>
                  MEMBER PROFILES // {members.length}
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  {members.map((member) => (
                    <div key={member.username} style={{ padding: "9px 10px", background: "#090909", border: "1px solid #151515" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#e0e0e0", fontWeight: 700, overflowWrap: "anywhere" }}>
                            {member.displayName}
                          </div>
                          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#777", marginTop: 3, overflowWrap: "anywhere" }}>
                            {member.role} / {member.statusLine}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUsername(member.username)
                            setPassword(member.password)
                            setLoginError("")
                          }}
                          style={{ padding: "3px 8px", border: `1px solid ${ACCENT}35`, background: `${ACCENT}12`, color: ACCENT, fontSize: 8, fontFamily: "var(--font-mono)", cursor: "pointer", flexShrink: 0 }}
                        >
                          USE
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "76px minmax(0, 1fr)", gap: 5, alignItems: "center" }}>
                        <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#555" }}>USERNAME</span>
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: ACCENT, overflowWrap: "anywhere" }}>{member.username}</span>
                        <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#555" }}>PASSWORD</span>
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#cfcfcf", overflowWrap: "anywhere" }}>{member.password}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0a000a", border: `1px solid ${ACCENT}20`, marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
              <div style={{ minWidth: 220 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#bbbbbb", marginBottom: 4 }}>
                  Влязъл като: <span style={{ color: ACCENT }}>{loggedIn.displayName}</span>
                  <span style={{ marginLeft: 10, fontSize: 9, color: "#909090" }}>[{loggedIn.role}]</span>
                </div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#707070", lineHeight: 1.5 }}>
                  Членски акаунт: <span style={{ color: "#d8d8d8" }}>{loggedIn.username}</span> / {loggedIn.statusLine}
                </div>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12, alignItems: "stretch" }}>
              <aside style={{ minWidth: 0, border: "1px solid #181818", background: "#050505", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "12px 14px", borderBottom: "1px solid #151515" }}>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#4a4a4a", letterSpacing: "0.18em", marginBottom: 10 }}>
                    АКТИВЕН ПРОФИЛ
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 18, border: `1px solid ${ACCENT}50`, background: `${ACCENT}14`, color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700, flexShrink: 0 }}>
                      {loggedIn.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#e5e5e5", fontWeight: 700, overflowWrap: "anywhere" }}>
                        {loggedIn.username}
                      </div>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#777", lineHeight: 1.5, overflowWrap: "anywhere" }}>
                        {visibleConversations.length} чата / {loggedIn.statusLine}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: 4 }}>
                  {visibleConversations.map((conversation) => {
                    const isActive = conversation.id === activeConversation?.id
                    const lastMessage = conversation.messages[conversation.messages.length - 1]
                    const participants = conversation.participants.filter((participant) => participant !== loggedIn.username)
                    const label = conversation.kind === "group" ? `${conversation.participants.length} участници` : participants[0] ?? "direct"

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => setActiveConversationId(conversation.id)}
                        style={{
                          width: "100%",
                          padding: "10px 11px",
                          background: isActive ? `${ACCENT}10` : "#070707",
                          border: `1px solid ${isActive ? `${ACCENT}35` : "#111"}`,
                          color: "#d8d8d8",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 14, border: `1px solid ${conversation.kind === "group" ? "#FFB00055" : `${ACCENT}35`}`, background: conversation.kind === "group" ? "#160f00" : "#061006", color: conversation.kind === "group" ? "#FFB000" : ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                            {conversation.kind === "group" ? "G" : "D"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ flex: 1, minWidth: 0, fontSize: 11, fontFamily: "var(--font-mono)", color: isActive ? ACCENT : "#dcdcdc", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {conversation.title}
                              </span>
                              <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#555", flexShrink: 0 }}>{conversation.lastActivity.slice(11)}</span>
                            </div>
                            <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#666", marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {label}
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={{ flex: 1, minWidth: 0, fontSize: 9, fontFamily: "var(--font-mono)", color: "#8f8f8f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {lastMessage ? `${lastMessage.author}: ${lastMessage.text}` : "няма съобщения"}
                              </span>
                              {conversation.unread > 0 && (
                                <span style={{ minWidth: 18, height: 18, borderRadius: 9, padding: "0 5px", background: `${ACCENT}20`, border: `1px solid ${ACCENT}55`, color: ACCENT, fontSize: 9, lineHeight: "16px", textAlign: "center", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                                  {conversation.unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </aside>

              <div style={{ minWidth: 0, border: "1px solid #181818", background: "#070707", display: "flex", flexDirection: "column", minHeight: 520 }}>
                {activeConversation && (
                  <>
                    <div style={{ padding: "12px 14px", borderBottom: "1px solid #151515", background: "#090909", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "#f0f0f0", fontWeight: 700, marginBottom: 4, overflowWrap: "anywhere" }}>
                          {activeConversation.title}
                        </div>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#777", lineHeight: 1.5, overflowWrap: "anywhere" }}>
                          {activeSubtitle} / {activeConversation.lastActivity}
                        </div>
                      </div>
                      <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: activeConversation.kind === "group" ? "#FFB000" : ACCENT, border: `1px solid ${activeConversation.kind === "group" ? "#FFB00044" : `${ACCENT}44`}`, padding: "3px 7px", letterSpacing: "0.08em", flexShrink: 0 }}>
                        {activeConversation.kind === "group" ? "GROUP" : "DIRECT"}
                      </div>
                    </div>

                    <div style={{ flex: 1, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10, background: "linear-gradient(180deg, #050505, #080808)" }}>
                      {activeConversation.messages.map((msg) => {
                        const isMine = msg.author === loggedIn.username
                        const clueId = `chat-${cultSlug}-${activeConversation.id}-${msg.id}`
                        const isSaved = savedClues.includes(clueId)

                        return (
                          <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                            <div
                              style={{
                                maxWidth: "min(78%, 620px)",
                                padding: "9px 11px",
                                background: msg.highlighted ? "#170303" : isMine ? "#06180c" : "#101010",
                                border: `1px solid ${msg.highlighted ? "#FF003355" : isMine ? `${ACCENT}35` : "#222"}`,
                                color: "#dcdcdc",
                                boxShadow: msg.highlighted ? "0 0 18px #FF003314" : "none",
                              }}
                            >
                              {!isMine && activeConversation.kind === "group" && (
                                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: msg.highlighted ? "#FF6B6B" : "#FFB000", marginBottom: 4, fontWeight: 700, overflowWrap: "anywhere" }}>
                                  {msg.author}
                                </div>
                              )}
                              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: msg.highlighted ? "#f2d0d0" : "#d6d6d6", lineHeight: 1.65, overflowWrap: "anywhere" }}>
                                {msg.text}
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 8 }}>
                                <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#606060" }}>
                                  {msg.time}{isMine ? " / ти" : ` / ${msg.author}`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleSave(activeConversation, msg)}
                                  disabled={isSaved}
                                  style={{ padding: "2px 7px", fontSize: 8, fontFamily: "var(--font-mono)", background: isSaved ? `${ACCENT}18` : "#0a0a0a", color: isSaved ? ACCENT : "#8f8f8f", border: `1px solid ${isSaved ? ACCENT + "40" : "#242424"}`, cursor: isSaved ? "default" : "pointer", flexShrink: 0 }}
                                >
                                  {isSaved ? "✓" : "SAVE"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div style={{ padding: "10px 12px", borderTop: "1px solid #151515", background: "#060606", display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0, padding: "8px 10px", border: "1px solid #181818", background: "#0b0b0b", color: "#555", fontSize: 10, fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        encrypted archive: write access revoked
                      </div>
                      <button type="button" disabled style={{ padding: "8px 10px", border: "1px solid #222", background: "#101010", color: "#444", fontSize: 9, fontFamily: "var(--font-mono)", cursor: "default", flexShrink: 0 }}>
                        LOCKED
                      </button>
                    </div>
                  </>
                )}
              </div>
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
