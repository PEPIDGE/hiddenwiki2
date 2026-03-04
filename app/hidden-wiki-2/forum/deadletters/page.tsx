"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF9F"

const DEAD_LETTERS = [
  {
    id: "DL-001",
    to: "[НЕИЗВЕСТЕН]",
    from: "anon_7731",
    subject: "Ако не се върна",
    body: "Ако прочетеш това — значи нещо се е случило. Виена. 13B. 18:30. Audi. Те знаят адреса ми.",
    date: "2024-10-14",
    clue: "Dead letter DL-001: Виена 13B 18:30 Audi — писмо 'ако не се върна'",
    hasClue: true,
  },
  {
    id: "DL-002",
    to: "TRACE-NODE",
    from: "system_leak",
    subject: "Координатите",
    body: "Latitude: зашифровано в hex. Longitude: зашифровано в hex. Виж leaks/trace. Не питай имена — питай числа.",
    date: "2024-10-16",
    clue: "Координатите са в hex в leaks/trace — не имена, а числа",
    hasClue: true,
  },
  {
    id: "DL-003",
    to: "[DECOY TARGET]",
    from: "decoy_writer",
    subject: "Nothing",
    body: "This is an automated decoy letter. Discard.",
    date: "2024-11-10",
    clue: null,
    hasClue: false,
  },
  {
    id: "DL-004",
    to: "Разследващия",
    from: "RF_witness",
    subject: "A_lexiev_contract — пълното ЕГН",
    body: "Файлът съдържа всичко. Р. Алексиев. Договорът е в LEAKS/docs. Датата е 12.09.2024. Парчетата се събират в TRACE-NODE.",
    date: "2024-12-02",
    clue: "DL-004: Р. Алексиев — A_lexiev_contract в LEAKS/docs, 12.09.2024",
    hasClue: true,
  },
]

// PUZZLE: Arrange 3 real letters in correct order → unlock cipher
const CORRECT_ORDER = ["DL-001", "DL-002", "DL-004"]

export default function ForumDeadLettersPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])
  const [order, setOrder] = useState<string[]>([])
  const [orderSolved, setOrderSolved] = useState(false)

  const toggleOrder = (id: string) => {
    if (order.includes(id)) {
      setOrder((p) => p.filter((x) => x !== id))
    } else if (order.length < 3) {
      const next = [...order, id]
      setOrder(next)
      if (next.length === 3 && JSON.stringify(next) === JSON.stringify(CORRECT_ORDER)) {
        setOrderSolved(true)
        const gs = getGameState()
        saveGameState(addClue(gs, {
          id: "deadletter-order",
          title: "[DEAD LETTERS] Правилна последователност",
          text: "DL-001→DL-002→DL-004: Очевидец 13B → Координати в hex → Р. Алексиев = CIRCUIT-3",
          sourceRoute: "/forum/deadletters",
          confidence: 4,
          status: "confirmed",
        }))
      }
    }
  }

  const handleSave = (dl: typeof DEAD_LETTERS[number]) => {
    if (!dl.clue) return
    const id = `dl-${dl.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    saveGameState(addClue(gs, { id, title: `[DEADLETTER] ${dl.id}`, text: dl.clue, sourceRoute: "/forum/deadletters", confidence: 2, status: "unverified" }))
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/forum" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>← FORUM</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="DEAD LETTERS" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>4 писма намерени в изтрита папка. Подреди 3-те реални в хронологичен ред.</div>
      </div>

      {/* ORDER PUZZLE */}
      <div style={{ padding: "14px 16px", border: `1px solid ${orderSolved ? `${ACCENT}40` : "#181818"}`, background: "#030803", marginBottom: 20 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.15em", marginBottom: 10 }}>
          PUZZLE: ПОДРЕДИ ПИСМАТА
        </div>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", marginBottom: 10 }}>
          Избери 3-те реални в правилния ред (хронологично):
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
          {DEAD_LETTERS.filter((dl) => dl.hasClue).map((dl) => {
            const pos = order.indexOf(dl.id) + 1
            return (
              <button key={dl.id} onClick={() => toggleOrder(dl.id)}
                style={{ background: pos > 0 ? `${ACCENT}12` : "transparent", border: `1px solid ${pos > 0 ? `${ACCENT}50` : "#2a2a2a"}`, color: pos > 0 ? ACCENT : "#444", fontFamily: "var(--font-mono)", fontSize: 9, padding: "5px 12px", cursor: "pointer", letterSpacing: "0.1em" }}>
                {pos > 0 ? `#${pos} ` : ""}{dl.id}
              </button>
            )
          })}
        </div>
        <AnimatePresence>
          {orderSolved && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.12em" }}>
              [PUZZLE SOLVED] — SEQUENCE: DL-001 → DL-002 → DL-004 → TRACE-NODE
            </motion.div>
          )}
          {order.length === 3 && !orderSolved && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#FF0033" }}>
              INCORRECT ORDER — опитай отново
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Letters */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {DEAD_LETTERS.map((dl, i) => {
          const id = `dl-${dl.id}`
          const isSaved = saved.includes(id)
          const isExp = expanded === dl.id
          return (
            <div key={dl.id}>
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                onClick={() => setExpanded(isExp ? null : dl.id)}
                style={{ padding: "12px 14px", background: isExp ? `${ACCENT}06` : "#040404", border: `1px solid ${isExp ? `${ACCENT}28` : dl.hasClue ? `${ACCENT}10` : "#0e0e0e"}`, cursor: "pointer" }}>
                <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: dl.hasClue ? `${ACCENT}50` : "#2a2a2a", marginBottom: 4 }}>{dl.id} // {dl.date}</div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: isExp ? ACCENT : "#888", fontWeight: dl.hasClue ? 700 : 400, marginBottom: 3 }}>{dl.subject}</div>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333" }}>TO: {dl.to} / FROM: {dl.from}</div>
              </motion.div>
              <AnimatePresence>
                {isExp && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.17 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", background: "#030903", border: `1px solid ${ACCENT}16`, borderTop: "none" }}>
                      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#666", lineHeight: 1.8, marginBottom: dl.clue ? 12 : 0 }}>{dl.body}</div>
                      {dl.clue && (
                        <>
                          <div style={{ padding: "7px 12px", background: "#040c05", border: `1px solid ${ACCENT}20`, marginBottom: 8 }}>
                            <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a", marginBottom: 3 }}>УЛИКА</div>
                            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT }}>{dl.clue}</div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleSave(dl) }} disabled={isSaved}
                            style={{ background: "transparent", border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`, color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 9, padding: "6px 16px", cursor: isSaved ? "default" : "pointer" }}>
                            {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ"}
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
