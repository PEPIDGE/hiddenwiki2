"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00BFFF"

const QUOTES = [
  { id: "Q1", author: "Unknown // ARS-REFLECT", text: "Огледалото не лъже — лъже онзи, който го гледа.", suspicious: false },
  { id: "Q2", author: "Operator // NS-0", text: "Когато hops≠3, сигналът е фалшив. Не следвай.", suspicious: true, clue: "NS-0 оператор: hops=3 е критерий за реален сигнал" },
  { id: "Q3", author: "ARS Internal // Log-33", text: "Трансакцията е одобрена в 03:17. Документирайте.", suspicious: true, clue: "03:17 — ARS трансакция / времеви маркер" },
  { id: "Q4", author: "Анонимен // Thread #881", text: "Черният автомобил паркира пред входа в 18:30. Запомних.", suspicious: false },
  { id: "Q5", author: "B.ORC Handler", text: "Доставката е в петък. Адресът се предава по отделен канал.", suspicious: false },
  { id: "Q6", author: "ARS Archive // V-1831", text: "Огледалото беше последното нещо, което взех от апартамент 13B.", suspicious: true, clue: "Апартамент 13B — ARS архивна връзка" },
]

export default function MirrorsQuotesPage() {
  const [savedClues, setSavedClues] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    return getGameState().clues.map((c) => c.id)
  })

  const handleSave = (q: typeof QUOTES[number]) => {
    if (!q.suspicious || !q.clue) return
    const id = `quotes-${q.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id,
      title: `[QUOTES] ${q.author}`,
      text: q.clue,
      sourceRoute: "/mirrors/quotes",
      confidence: 3,
      status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.3em", marginBottom: 8 }}>
          MIRRORS / QUOTES — INTERCEPTED TRANSMISSIONS
        </div>
        <GlitchText text="QUOTES" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
      </div>

      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333333", lineHeight: 1.8, marginBottom: 28, maxWidth: 500 }}>
        Прихванати съобщения от различни оператори. Три съдържат верифицируеми препратки.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {QUOTES.map((q, i) => {
          const id = `quotes-${q.id}`
          const isSaved = savedClues.includes(id)
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                padding: "14px 18px",
                border: `1px solid ${q.suspicious ? `${ACCENT}20` : "#111111"}`,
                background: q.suspicious ? "#030810" : "#040404",
                position: "relative",
              }}
            >
              {q.suspicious && (
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: ACCENT, opacity: 0.4 }} />
              )}
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: q.suspicious ? `${ACCENT}60` : "#2a2a2a", letterSpacing: "0.12em", marginBottom: 6 }}>
                [{q.id}] {q.author}
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: q.suspicious ? "#cccccc" : "#555555", lineHeight: 1.7, fontStyle: "italic", marginBottom: q.suspicious ? 10 : 0 }}>
                &ldquo;{q.text}&rdquo;
              </div>
              {q.suspicious && (
                <button
                  onClick={() => handleSave(q)}
                  disabled={isSaved}
                  style={{
                    background: "transparent", border: `1px solid ${isSaved ? "#222222" : `${ACCENT}40`}`,
                    color: isSaved ? "#2a2a2a" : `${ACCENT}80`,
                    fontFamily: "var(--font-mono)", fontSize: 8,
                    letterSpacing: "0.1em", padding: "5px 14px", cursor: isSaved ? "default" : "pointer",
                  }}
                >
                  {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ УЛИКА"}
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/hidden-wiki-2/mirrors" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: `${ACCENT}40`, textDecoration: "none", letterSpacing: "0.1em" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = `${ACCENT}40`)}>
          ← MIRRORS INDEX
        </Link>
      </div>
    </div>
  )
}
