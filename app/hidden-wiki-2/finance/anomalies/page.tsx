"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GlitchText } from "@/components/tor/glitch-text"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF3366"

const ANOMALIES = [
  {
    id: "anom-1",
    code: "ANM-019",
    type: "TIME PATTERN",
    description: "TX-0019 и TX-0025 — и двете в 03:17. Нетипично съвпадение.",
    evidence: "03:17 е Canon котва #3 — телефонът пада в 03:17",
    confidence: 5,
    clue: "Двойна транзакция в 03:17 — TX-0019 и TX-0025. Canon котва потвърдена.",
  },
  {
    id: "anom-2",
    code: "ANM-021",
    type: "ROUTE OVERLAP",
    description: "B.ORC → CIRCUIT-3 в 18:30. CIRCUIT-3 е токен от MIRRORS.",
    evidence: "18:30 е Canon котва #1 — час на излизане",
    confidence: 4,
    clue: "B.ORC изпраща към CIRCUIT-3 в 18:30 — Canon котва #1 потвърдена.",
  },
  {
    id: "anom-3",
    code: "ANM-023",
    type: "IDENTITY LINK",
    description: "ARS-REFLECT-01 → calm_voice в 22:17. calm_voice е псевдоним от FORUM.",
    evidence: "22:17 е Canon котва #4 — двойна поява на часа",
    confidence: 5,
    clue: "ARS → calm_voice в 22:17 — идентичност потвърдена с Forum Confession #4.",
  },
]

export default function FinanceAnomaliesPage() {
  const [saved, setSaved] = useState<string[]>([])

  useEffect(() => {
    setSaved(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (a: typeof ANOMALIES[0]) => {
    const id = `finance-anom-${a.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[ANOMALY] ${a.code}`,
      text: a.clue, sourceRoute: "/hidden-wiki-2/finance",
      confidence: a.confidence, status: "confirmed",
    })
    saveGameState(updated)
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a0015", letterSpacing: "0.35em", marginBottom: 8 }}>FINANCE // ANOMALIES</div>
        <GlitchText text="ANOMALY REPORT" as="h1" intensity="medium" color={ACCENT} className="text-2xl font-bold tracking-widest" />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}40, transparent)`, marginTop: 10 }} />
      </div>
      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", lineHeight: 1.8, marginBottom: 24, borderLeft: "2px solid #2a0010", paddingLeft: 14 }}>
        3 транзакции показват аномалии свързани с Canon котвите. Всяка потвърдена аномалия носи clue с confidence 4-5.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {ANOMALIES.map((a, i) => {
          const id = `finance-anom-${a.id}`
          const isSaved = saved.includes(id)
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ padding: "16px 20px", border: `1px solid ${isSaved ? `${ACCENT}30` : "#141414"}`, background: isSaved ? `${ACCENT}05` : "#030303" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.15em", marginBottom: 4 }}>{a.type}</div>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, fontWeight: 700, letterSpacing: "0.06em" }}>{a.code}</div>
                </div>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.1em" }}>
                  CONF: {a.confidence}/5
                </div>
              </div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#666", lineHeight: 1.7, marginBottom: 8 }}>{a.description}</div>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", borderLeft: `2px solid ${ACCENT}30`, paddingLeft: 10, marginBottom: 12 }}>{a.evidence}</div>
              <button onClick={() => handleSave(a)} disabled={isSaved} style={{
                background: "transparent", border: `1px solid ${isSaved ? "#1a1a1a" : `${ACCENT}40`}`,
                color: isSaved ? "#2a2a2a" : ACCENT,
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em",
                padding: "6px 16px", cursor: isSaved ? "default" : "pointer",
              }}>
                {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ УЛИКА"}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
