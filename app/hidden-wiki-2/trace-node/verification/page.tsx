"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlitchText } from "@/components/tor/glitch-text"
import { PuzzleGate } from "@/components/tor/puzzle-gate"
import { getGameState, saveGameState, addClue, type GameState } from "@/lib/game-state"
import Link from "next/link"

const ACCENT = "#00FF41"
const REAL_LAT = "42.6977"
const REAL_LON = "23.3219"

export default function TraceVerificationPage() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [lat, setLat] = useState("")
  const [lon, setLon] = useState("")
  const [verdict, setVerdict] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [caseId, setCaseId] = useState("")

  useEffect(() => {
    setGameState(getGameState())
  }, [])

  const handleVerify = () => {
    if (lat.trim() !== REAL_LAT) { setError("Невалидна географска ширина — провери TRACE TERMINAL"); return }
    if (lon.trim() !== REAL_LON) { setError("Невалидна географска дължина — провери TRACE TERMINAL"); return }
    if (verdict.trim().length < 20) { setError("Вердиктът е твърде кратък (мин. 20 символа)"); return }
    const gs = gameState ?? getGameState()
    const id = `CASE-${Date.now().toString(36).toUpperCase()}`
    const updated: GameState = {
      ...gs,
      solvedPuzzles: gs.solvedPuzzles.includes("trace-verified") ? gs.solvedPuzzles : [...gs.solvedPuzzles, "trace-verified"],
      progress: 100,
    }
    saveGameState(updated)
    setGameState(updated)
    setCaseId(id)
    setSubmitted(true)
    setError("")
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.35em", marginBottom: 8 }}>
          TRACE-NODE // FINAL VERIFICATION
        </div>
        <GlitchText text="VERIFICATION" as="h1" intensity="medium" color={ACCENT} className="text-2xl font-bold tracking-widest" />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}40, transparent)`, marginTop: 10 }} />
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ padding: "28px 24px", border: `1px solid ${ACCENT}40`, background: "#020a02" }}>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.3em", marginBottom: 12 }}>
                ВЕРИФИКАЦИЯ УСПЕШНА
              </div>
              <GlitchText text="CASE CLOSED" intensity="high" color={ACCENT} className="text-3xl font-bold tracking-widest" />
              <div style={{ marginTop: 20, fontFamily: "var(--font-mono)", fontSize: 9, color: "#333", lineHeight: 2.2 }}>
                <div>CASE ID: <span style={{ color: ACCENT }}>{caseId}</span></div>
                <div>COORDINATES: <span style={{ color: ACCENT }}>{REAL_LAT}°N, {REAL_LON}°E</span></div>
                <div>SUSPECT: <span style={{ color: ACCENT }}>Румен Алексиев (RedFox)</span></div>
              </div>
              <div style={{ marginTop: 24 }}>
                <a href="https://sluchayat.com/verify" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-block", padding: "12px 32px",
                    background: `${ACCENT}10`, border: `1px solid ${ACCENT}50`,
                    color: ACCENT, fontFamily: "var(--font-mono)",
                    fontSize: 11, letterSpacing: "0.2em", textDecoration: "none",
                  }}
                >
                  → ОФИЦИАЛНА ВЕРИФИКАЦИЯ
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#909090", lineHeight: 1.8, marginBottom: 24, borderLeft: "2px solid #1a3a1a", paddingLeft: 14 }}>
              Въведи координатите, намерени в TRACE TERMINAL, и твоя финален вердикт.
              Трябват ти резултатите от командата <span style={{ color: ACCENT }}>'verify coords'</span>.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Lat */}
              <div>
                <label style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.2em", display: "block", marginBottom: 6 }}>
                  ГЕОГРАФСКА ШИРИНА (LAT)
                </label>
                <input
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="xx.xxxx"
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: "#050505", border: "1px solid #181818",
                    color: ACCENT, fontFamily: "var(--font-mono)", fontSize: 12,
                    letterSpacing: "0.1em", outline: "none", caretColor: ACCENT,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = `${ACCENT}50` }}
                  onBlur={(e) => { e.target.style.borderColor = "#181818" }}
                />
              </div>

              {/* Lon */}
              <div>
                <label style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.2em", display: "block", marginBottom: 6 }}>
                  ГЕОГРАФСКА ДЪЛЖИНА (LON)
                </label>
                <input
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  placeholder="xx.xxxx"
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: "#050505", border: "1px solid #181818",
                    color: ACCENT, fontFamily: "var(--font-mono)", fontSize: 12,
                    letterSpacing: "0.1em", outline: "none", caretColor: ACCENT,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = `${ACCENT}50` }}
                  onBlur={(e) => { e.target.style.borderColor = "#181818" }}
                />
              </div>

              {/* Verdict */}
              <div>
                <label style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.2em", display: "block", marginBottom: 6 }}>
                  ФИНАЛЕН ВЕРДИКТ
                </label>
                <textarea
                  value={verdict}
                  onChange={(e) => setVerdict(e.target.value)}
                  rows={4}
                  placeholder="Опиши твоите заключения..."
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: "#050505", border: "1px solid #181818",
                    color: "#ccc", fontFamily: "var(--font-mono)", fontSize: 11,
                    letterSpacing: "0.04em", outline: "none", resize: "vertical",
                    lineHeight: 1.7,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = `${ACCENT}50` }}
                  onBlur={(e) => { e.target.style.borderColor = "#181818" }}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#FF3333", letterSpacing: "0.08em" }}>
                    [!] {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleVerify}
                style={{
                  padding: "14px 0", background: `${ACCENT}10`,
                  border: `1px solid ${ACCENT}40`, color: ACCENT,
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  letterSpacing: "0.2em", cursor: "pointer", fontWeight: 700,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${ACCENT}20` }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `${ACCENT}10` }}
              >
                VERIFY CASE
              </button>
            </div>

            <div style={{ marginTop: 20, padding: "12px 16px", border: "1px solid #141414", background: "#020202" }}>
              <Link href="/hidden-wiki-2/trace-node/terminal" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", textDecoration: "none", letterSpacing: "0.1em" }}>
                → Отиди в TRACE TERMINAL за командите 'crack' и 'verify coords'
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
