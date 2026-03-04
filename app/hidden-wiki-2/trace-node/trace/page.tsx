"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlitchText } from "@/components/tor/glitch-text"
import { getGameState, saveGameState, CANON_ANCHORS } from "@/lib/game-state"

const ACCENT = "#00FF41"

const TRACE_STEPS = [
  { id: "step-1", label: "RF-GATE scan", status: "complete", detail: "RED ROOM gate — token issued", node: "NODE-A" },
  { id: "step-2", label: "CIRCUIT-3 lock", status: "complete", detail: "MIRRORS circuit — shard collected", node: "NODE-B" },
  { id: "step-3", label: "Identity resolve", status: "complete", detail: "R. Алексиев // RedFox — confirmed", node: "NODE-C" },
  { id: "step-4", label: "Timeline match", status: "complete", detail: "03:17 → 22:17 — two anchor match", node: "NODE-D" },
  { id: "step-5", label: "Ritual log parse", status: "complete", detail: "Cult operator status — confirmed", node: "NODE-E" },
  { id: "step-6", label: "Confession extract", status: "complete", detail: "#4 — calm_voice lead", node: "NODE-F" },
  { id: "step-7", label: "Coordinate decrypt", status: "pending", detail: "LAT/LON hex strings pending crack", node: "TRACE" },
  { id: "step-8", label: "Final verification", status: "locked", detail: "Bundle → sluchayat.com/verify", node: "TRACE" },
]

export default function TraceTracePage() {
  const [active, setActive] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const gs = getGameState()
    setProgress(gs.progress)
  }, [])

  const complete = TRACE_STEPS.filter((s) => s.status === "complete").length

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.35em", marginBottom: 8 }}>
          TRACE-NODE // TRACE LOG
        </div>
        <GlitchText text="TRACE SEQUENCE" as="h1" intensity="low" color={ACCENT} className="text-2xl font-bold tracking-widest" />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}40, transparent)`, marginTop: 10 }} />
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 24, padding: "14px 16px", border: "1px solid #141414", background: "#030303" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.18em" }}>TRACE PROGRESS</span>
          <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: ACCENT }}>{complete}/{TRACE_STEPS.length} STEPS</span>
        </div>
        <div style={{ height: 2, background: "#0e0e0e" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(complete / TRACE_STEPS.length) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ height: "100%", background: ACCENT, boxShadow: `0 0 8px ${ACCENT}40` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {TRACE_STEPS.map((step, i) => {
          const isActive = active === step.id
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActive(isActive ? null : step.id)}
              style={{
                padding: "12px 16px",
                border: `1px solid ${isActive ? `${ACCENT}30` : "#111"}`,
                background: isActive ? `${ACCENT}05` : "#030303",
                cursor: "pointer",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              {/* Status indicator */}
              <div style={{ flexShrink: 0, paddingTop: 2 }}>
                {step.status === "complete" ? (
                  <div style={{ width: 8, height: 8, background: ACCENT, boxShadow: `0 0 6px ${ACCENT}60` }} />
                ) : step.status === "pending" ? (
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: 8, height: 8, background: "#FFD700", border: "1px solid #FFD700" }}
                  />
                ) : (
                  <div style={{ width: 8, height: 8, background: "#111", border: "1px solid #222" }} />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: step.status === "complete" ? "#ccc" : step.status === "pending" ? "#888" : "#333", letterSpacing: "0.06em", fontWeight: 600 }}>
                    {String(i + 1).padStart(2, "0")}. {step.label.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#222", letterSpacing: "0.15em" }}>
                    {step.node}
                  </span>
                </div>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#666", marginTop: 6, lineHeight: 1.7 }}>
                        {step.detail}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Canon anchors */}
      <div style={{ marginTop: 20, padding: "16px", border: "1px solid #141414", background: "#020202" }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.2em", marginBottom: 12 }}>
          CANON ANCHORS — 5/5 VERIFIED
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {CANON_ANCHORS.map((a) => (
            <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 4, height: 4, background: `${ACCENT}60`, flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: ACCENT, minWidth: 90 }}>{a.label}</span>
              <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#555" }}>{a.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
