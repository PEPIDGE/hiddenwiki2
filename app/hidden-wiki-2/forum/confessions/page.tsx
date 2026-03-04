"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { GlitchText, TypewriterText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF9F"

const CONFESSIONS = [
  {
    id: "CF-001",
    anon: "anon_7731",
    text: "Бях там. Видях черния автомобил. Не се осмелих да остана. Ако нещо ми се случи — апартамент 13B, 18:30.",
    timestamp: "2024-10-16 03:17",
    verified: true,
    clue: "Confessional: очевидец 13B, 18:30 — пише сам в 03:17",
  },
  {
    id: "CF-002",
    anon: "anon_????",
    text: "Бях оператор. Исках да изляза. Те не позволяват излизане без CIRCUIT-3 одобрение. calm_voice е реален.",
    timestamp: "2024-11-01 22:17",
    verified: true,
    clue: "Бивш оператор: излизането изисква CIRCUIT-3 одобрение — calm_voice верифициран",
  },
  {
    id: "CF-003",
    anon: "decoy_writer",
    text: "Пишете истории. Тук няма тайни. Всичко е игра.",
    timestamp: "2024-11-10 09:00",
    verified: false,
    clue: null,
  },
  {
    id: "CF-004",
    anon: "RF_witness",
    text: "RedFox = Р. Алексиев. Видях договора. Файлът беше A_lexiev_contract.pdf. Подписан с лично ЕГН.",
    timestamp: "2024-12-02 03:17",
    verified: true,
    clue: "RF_witness потвърждава: RedFox = Р. Алексиев — файл A_lexiev_contract.pdf с ЕГН",
  },
]

export default function ForumConfessionsPage() {
  const [revealed, setRevealed] = useState<string[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [countdown, setCountdown] = useState<Record<string, number>>({})

  const handleReveal = (id: string) => {
    if (revealed.includes(id)) return
    setCountdown((p) => ({ ...p, [id]: 5 }))
    const iv = setInterval(() => {
      setCountdown((p) => {
        const next = (p[id] ?? 0) - 1
        if (next <= 0) {
          clearInterval(iv)
          setRevealed((r) => [...r, id])
          return { ...p, [id]: 0 }
        }
        return { ...p, [id]: next }
      })
    }, 1000)
  }

  const handleSave = (cf: typeof CONFESSIONS[number]) => {
    if (!cf.clue) return
    const id = `confession-${cf.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    saveGameState(addClue(gs, { id, title: `[CONFESSION] ${cf.id}`, text: cf.clue, sourceRoute: "/forum/confessions", confidence: 3, status: "unverified" }))
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/forum" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>← FORUM</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="CONFESSIONS" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>Анонимни изповеди. Натисни за разкриване — всяка изисква 5 секунди потвърждение.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {CONFESSIONS.map((cf, i) => {
          const isRev = revealed.includes(cf.id)
          const isSaved = saved.includes(`confession-${cf.id}`)
          const cd = countdown[cf.id]
          return (
            <motion.div key={cf.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ border: `1px solid ${cf.verified ? `${ACCENT}20` : "#111"}`, background: "#040404", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #0e0e0e" }}>
                <div>
                  <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: cf.verified ? `${ACCENT}50` : "#2a2a2a", letterSpacing: "0.15em", marginBottom: 3 }}>{cf.id}</div>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333" }}>{cf.anon} // {cf.timestamp}</div>
                </div>
                {!isRev && (
                  <button onClick={() => handleReveal(cf.id)}
                    disabled={!!cd && cd > 0}
                    style={{ background: "transparent", border: `1px solid ${cf.verified ? `${ACCENT}35` : "#222"}`, color: cf.verified ? ACCENT : "#333", fontFamily: "var(--font-mono)", fontSize: 8, padding: "5px 12px", cursor: "pointer", letterSpacing: "0.1em" }}>
                    {cd && cd > 0 ? `WAIT ${cd}s` : "REVEAL"}
                  </button>
                )}
              </div>
              {/* Body */}
              <AnimatePresence>
                {isRev ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: cf.verified ? "#cccccc" : "#444", lineHeight: 1.8, fontStyle: "italic", marginBottom: cf.clue ? 12 : 0 }}>
                      <TypewriterText text={`"${cf.text}"`} speed={22} />
                    </div>
                    {cf.clue && (
                      <>
                        <div style={{ padding: "8px 12px", background: "#040c07", border: `1px solid ${ACCENT}20`, marginBottom: 8 }}>
                          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a2a", marginBottom: 3 }}>УЛИКА</div>
                          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT }}>{cf.clue}</div>
                        </div>
                        <button onClick={() => handleSave(cf)} disabled={isSaved}
                          style={{ background: "transparent", border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`, color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 9, padding: "6px 16px", cursor: isSaved ? "default" : "pointer" }}>
                          {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ УЛИКА"}
                        </button>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#1a1a1a", letterSpacing: "0.05em" }}>
                      {"█".repeat(48)}
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
