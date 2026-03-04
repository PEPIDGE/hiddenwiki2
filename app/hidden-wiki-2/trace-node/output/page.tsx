"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlitchText } from "@/components/tor/glitch-text"
import { getGameState } from "@/lib/game-state"

const ACCENT = "#00FF41"
const REAL_LAT = "42.6977"
const REAL_LON = "23.3219"

const OUTPUT_BLOCKS = [
  {
    id: "identity",
    label: "SUSPECT IDENTITY",
    color: "#FF0033",
    lines: [
      "Name:    Румен Алексиев",
      "Handle:  RedFox",
      "Role:    Primary operator",
      "Source:  LEAKS // R_alexiev_id.enc",
    ],
  },
  {
    id: "coordinates",
    label: "FINAL COORDINATES",
    color: "#00FF41",
    lines: [
      `LAT:     ${REAL_LAT}°N`,
      `LON:     ${REAL_LON}°E`,
      "Method:  HEX → ASCII decode",
      "Verify:  TRACE TERMINAL 'verify coords'",
    ],
  },
  {
    id: "tokens",
    label: "TOKEN CHAIN",
    color: "#00BFFF",
    lines: [
      "Token 1: RF-GATE-7X9K",
      "Token 2: CIRCUIT-3-M1R",
      "Token 3: RF-TRACE::NODE7",
      "Chain:   VALID — 3/3",
    ],
  },
  {
    id: "anchors",
    label: "CANON ANCHORS",
    color: "#FFD700",
    lines: [
      "Anchor 1: 18:30 — час на излизане",
      "Anchor 2: Черен Audi A3",
      "Anchor 3: 22:17 — телефонът пада",
      "Match:    3/3 CONFIRMED",
    ],
  },
]

export default function TraceOutputPage() {
  const [gameState, setGameState] = useState(getGameState())
  const [revealed, setRevealed] = useState<string[]>([])

  useEffect(() => {
    setGameState(getGameState())
    // Staggered reveal
    OUTPUT_BLOCKS.forEach((b, i) => {
      setTimeout(() => setRevealed((r) => [...r, b.id]), 200 + i * 300)
    })
  }, [])

  const isComplete = gameState.solvedPuzzles.includes("trace-verified")

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.35em", marginBottom: 8 }}>
          TRACE-NODE // CASE OUTPUT
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 10, height: 10, background: ACCENT, boxShadow: `0 0 14px ${ACCENT}` }}
          />
          <GlitchText text="CASE OUTPUT" as="h1" intensity="low" color={ACCENT} className="text-2xl font-bold tracking-widest" />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}40, transparent)`, marginTop: 10 }} />
      </div>

      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: "14px 18px",
          border: `1px solid ${isComplete ? `${ACCENT}40` : "#222"}`,
          background: isComplete ? "#020a02" : "#050505",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.25em", marginBottom: 4 }}>
            STATUS
          </div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: isComplete ? ACCENT : "#444", fontWeight: 700, letterSpacing: "0.12em" }}>
            {isComplete ? "CASE CLOSED — VERIFIED" : "INVESTIGATION IN PROGRESS"}
          </div>
        </div>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#222", textAlign: "right", lineHeight: 2 }}>
          <div>PROGRESS: {gameState.progress}%</div>
          <div>PUZZLES: {gameState.solvedPuzzles.length}</div>
        </div>
      </motion.div>

      {/* Output blocks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 20 }}>
        {OUTPUT_BLOCKS.map((block) => {
          const show = revealed.includes(block.id)
          return (
            <AnimatePresence key={block.id}>
              {show ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ padding: "16px", border: `1px solid ${block.color}20`, background: "#030303" }}
                >
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: block.color, letterSpacing: "0.2em", marginBottom: 12, borderBottom: `1px solid ${block.color}15`, paddingBottom: 6 }}>
                    {block.label}
                  </div>
                  {block.lines.map((line, i) => (
                    <div key={i} style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#666", lineHeight: 1.9 }}>
                      {line}
                    </div>
                  ))}
                </motion.div>
              ) : (
                <div style={{ padding: "16px", border: "1px solid #111", background: "#020202" }}>
                  <motion.div
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#222", letterSpacing: "0.2em" }}
                  >
                    LOADING...
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          )
        })}
      </div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        style={{ padding: "20px 24px", border: `1px solid ${ACCENT}20`, background: "#020a02" }}
      >
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.25em", marginBottom: 12 }}>
          ФИНАЛНА СТЪПКА
        </div>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#555", lineHeight: 1.8, marginBottom: 16 }}>
          Предай координатите и вердикта на официалната страница за верификация.
        </div>
        <a
          href="https://sluchayat.com/verify"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block", padding: "12px 28px",
            background: `${ACCENT}10`, border: `1px solid ${ACCENT}40`,
            color: ACCENT, fontFamily: "var(--font-mono)",
            fontSize: 10, letterSpacing: "0.18em", textDecoration: "none",
            fontWeight: 700,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = `${ACCENT}20` }}
          onMouseLeave={(e) => { e.currentTarget.style.background = `${ACCENT}10` }}
        >
          → sluchayat.com/verify
        </a>
      </motion.div>
    </div>
  )
}
