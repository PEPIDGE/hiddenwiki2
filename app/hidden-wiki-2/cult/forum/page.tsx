"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF41"

// Internal cult forum — encrypted discussions among operators
const MESSAGES = [
  {
    id: "CF-001",
    codename: "OPERATOR-Λ",
    time: "03:16",
    level: "АРХИТЕКТ",
    text: "Следващата сесия е 15.10 в 18:30. Локация не се споменава публично. Транспортът е потвърден. CIRCUIT-3 ще присъства.",
    flagged: true,
    clue: "CULT FORUM: CIRCUIT-3 присъства — 15.10 в 18:30. Транспортът потвърден.",
  },
  {
    id: "CF-002",
    codename: "DataCracker6",
    time: "03:17",
    level: "ОПЕРАТОР",
    text: "RF-GATE::NODE7 е онлайн. Токенът е активиран. Relay потвърден с HOPS=3.",
    flagged: true,
    clue: "RF-GATE::NODE7 активиран @ 03:17 — DataCracker6 / Р.Алексиев",
  },
  {
    id: "CF-003",
    codename: "NS-0",
    time: "03:18",
    level: "ПОСВЕТЕН",
    text: "Получих покана. Без адрес. Ще очаквам контакт чрез стандартен канал.",
    flagged: false,
    clue: null,
  },
  {
    id: "CF-004",
    codename: "calm_voice",
    time: "03:19",
    level: "ОПЕРАТОР",
    text: "Протоколът е активен. Всички съобщения след 03:17 се логват. Не сменяй криптиращ ключ до финалния преход.",
    flagged: true,
    clue: "calm_voice — активен оператор, 03:17 лог старт. Финален преход предстои.",
  },
  {
    id: "CF-005",
    codename: "DECOY-BOT",
    time: "09:00",
    level: "SYSTEM",
    text: "[AUTOMATED] Тази нишка не е валидна. Не я следвайте. Всичко е симулация.",
    flagged: false,
    clue: null,
  },
]

export default function CultForumPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])

  const handleSave = (m: typeof MESSAGES[number]) => {
    if (!m.clue) return
    const id = `cult-forum-${m.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    saveGameState(addClue(gs, {
      id,
      title: `[CULT FORUM] ${m.codename} // ${m.time}`,
      text: m.clue,
      sourceRoute: "/cult/forum",
      confidence: 4,
      status: "unverified",
    }))
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/cult" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>
          ← CULT
        </Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="CULT FORUM" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>
          Вътрешен форум на Кръга — само за оператори. 3 от 5 съобщения съдържат улики.
        </div>
      </div>

      {/* Access badge */}
      <div
        style={{
          padding: "8px 14px",
          border: `1px solid ${ACCENT}20`,
          background: "#060208",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 6, height: 6, background: ACCENT, boxShadow: `0 0 6px ${ACCENT}` }}
        />
        <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.15em" }}>
          ENCRYPTED SESSION — HOPS=3 — READ-ONLY ACCESS
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {MESSAGES.map((msg, i) => {
          const id = `cult-forum-${msg.id}`
          const isSaved = saved.includes(id)
          const isExp = expanded === msg.id

          const isDecoy = msg.codename === "DECOY-BOT"
          const levelColor =
            msg.level === "АРХИТЕКТ"
              ? ACCENT
              : msg.level === "ОПЕРАТОР"
              ? "#8844CC"
              : msg.level === "SYSTEM"
              ? "#222222"
              : "#909090"

          return (
            <div key={msg.id}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => !isDecoy && setExpanded(isExp ? null : msg.id)}
                style={{
                  padding: "12px 16px",
                  background: isExp ? `${ACCENT}07` : isDecoy ? "#030303" : "#050505",
                  border: `1px solid ${
                    isExp ? `${ACCENT}35` : msg.flagged ? `${ACCENT}15` : "#0e0e0e"
                  }`,
                  cursor: isDecoy ? "default" : "pointer",
                  opacity: isDecoy ? 0.4 : 1,
                  position: "relative",
                }}
              >
                {msg.flagged && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: ACCENT,
                      opacity: 0.4,
                    }}
                  />
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div
                      style={{
                        fontSize: 7,
                        fontFamily: "var(--font-mono)",
                        color: levelColor,
                        letterSpacing: "0.15em",
                        marginBottom: 4,
                      }}
                    >
                      {msg.id} // {msg.codename} // {msg.level}
                    </div>
                    <div
                      style={{
                        fontSize: isExp ? 11 : 10,
                        fontFamily: "var(--font-mono)",
                        color: isExp ? "#cccccc" : isDecoy ? "#2a2a2a" : "#aaaaaa",
                        lineHeight: 1.6,
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      fontFamily: "var(--font-mono)",
                      color: msg.flagged ? `${ACCENT}60` : "#1a1a1a",
                      marginLeft: 16,
                      flexShrink: 0,
                    }}
                  >
                    {msg.time}
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {isExp && msg.clue && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        padding: "10px 16px",
                        background: "#060208",
                        border: `1px solid ${ACCENT}18`,
                        borderTop: "none",
                      }}
                    >
                      <div
                        style={{
                          padding: "8px 10px",
                          background: "#080312",
                          border: `1px solid ${ACCENT}20`,
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            fontFamily: "var(--font-mono)",
                            color: "#2a1040",
                            letterSpacing: "0.12em",
                            marginBottom: 3,
                          }}
                        >
                          УЛИКА
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                            color: ACCENT,
                            lineHeight: 1.6,
                          }}
                        >
                          {msg.clue}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSave(msg)
                        }}
                        disabled={isSaved}
                        style={{
                          background: "transparent",
                          border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`,
                          color: isSaved ? "#2a2a2a" : ACCENT,
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          padding: "6px 16px",
                          cursor: isSaved ? "default" : "pointer",
                          letterSpacing: "0.1em",
                        }}
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

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 16,
          padding: "8px 0",
          borderTop: "1px solid #0e0e0e",
        }}
      >
        {[
          { color: ACCENT, label: "АРХИТЕКТ" },
          { color: "#8844CC", label: "ОПЕРАТОР" },
          { color: "#909090", label: "ПОСВЕТЕН" },
          { color: "#222", label: "DECOY" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, background: color }} />
            <span
              style={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                color: "#333",
                letterSpacing: "0.1em",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
