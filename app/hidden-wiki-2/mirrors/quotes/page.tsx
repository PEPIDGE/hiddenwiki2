"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00BFFF"

const QUOTES = [
  { id: "Q1", author: "Неизвестен // Братство", text: "Огледалото не показва лицето — показва намерението.", suspicious: false },
  { id: "Q2", author: "NullSyn // leaks/operators", text: "route-17-night е потвърден от мен. Доверявайте се на координатите.", suspicious: true, clue: "NullSyn потвърждава route-17-night — но NullSyn е компрометиран (HOPS=2). Decoy!" },
  { id: "Q3", author: "GothGirl // cult/chat-system", text: "Чат системата е затворена. Паролата е сменена. Не знам кой е влязъл.", suspicious: true, clue: "GothGirl потвърждава: паролата е сменена без нея — BruteForce в /blackmarket може да я разбие" },
  { id: "Q4", author: "Анонимен // forum/deadletters", text: "Черният автомобил паркира пред бл. 14 в 22:09. Запомних таблото.", suspicious: false },
  { id: "Q5", author: "RedFox // cult/operators", text: "Операцията е успешна. Лора е на сигурно място.", suspicious: true, clue: "RedFox счита Лора на 'сигурно място' — потвърждава задържането. Лора е в Захарна фабрика" },
  { id: "Q6", author: "system_leak // forum", text: "Телефонът на Лора беше намерен в стая 9. Западно крило. Жълто-черна лента.", suspicious: false },
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
