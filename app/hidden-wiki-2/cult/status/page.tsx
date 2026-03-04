"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState } from "@/lib/game-state"

const ACCENT = "#CC44FF"

const LEVELS = [
  { id: "LVL-1", name: "ПОСВЕТЕН", count: 12, description: "Новоприетите. Нямат достъп до routing или токени." },
  { id: "LVL-2", name: "ОПЕРАТОР", count: 4, description: "Активни оператори. Комуникация само с HOPS=3." },
  { id: "LVL-3", name: "АРХИТЕКТ", count: 1, description: "CIRCUIT-3. Единствен достъп до TRACE-NODE." },
]

const PROGRESS_ITEMS = [
  { label: "Doctrine прочетена", key: "cult-D-01" },
  { label: "Ritual завършен", key: "cult-ritual-complete" },
  { label: "3 улики от CULT", key: null },
]

export default function CultStatusPage() {
  const [clueSavedIds, setClueSavedIds] = useState<string[]>([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const gs = getGameState()
    setClueSavedIds(gs.clues.map((c) => c.id))
    setProgress(gs.progress)
  }, [])

  const cultClues = clueSavedIds.filter((id) => id.startsWith("cult-"))

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/cult" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>← CULT</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="STATUS" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>Текущ статус на инициация и ниво в Кръга.</div>
      </div>

      {/* Overall progress */}
      <div style={{ padding: "16px 18px", border: `1px solid ${ACCENT}20`, background: "#060208", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em" }}>ОБЩ ПРОГРЕС</div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, fontWeight: 700 }}>{progress}%</div>
        </div>
        <div style={{ height: 3, background: "#111", position: "relative", overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
        </div>
      </div>

      {/* Hierarchy */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em", marginBottom: 10 }}>ЙЕРАРХИЯ</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {LEVELS.map((lvl, i) => (
            <motion.div key={lvl.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              style={{ padding: "12px 16px", background: "#040404", border: `1px solid ${lvl.id === "LVL-3" ? `${ACCENT}30` : "#111"}`, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ minWidth: 36, paddingTop: 2 }}>
                <div style={{ width: 10, height: 10, border: `1px solid ${ACCENT}`, background: lvl.id === "LVL-3" ? ACCENT : "transparent", boxShadow: lvl.id === "LVL-3" ? `0 0 8px ${ACCENT}` : "none" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: lvl.id === "LVL-3" ? ACCENT : "#888", fontWeight: 700, marginBottom: 3 }}>{lvl.name}</div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", lineHeight: 1.6 }}>{lvl.description}</div>
              </div>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#2a2a2a" }}>{lvl.count}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div style={{ padding: "14px 16px", border: "1px solid #181818", background: "#040404" }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em", marginBottom: 10 }}>CHECKLIST</div>
        {PROGRESS_ITEMS.map((item) => {
          const done = item.key
            ? clueSavedIds.includes(item.key)
            : cultClues.length >= 3
          return (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
              <div style={{ width: 8, height: 8, background: done ? ACCENT : "#0e0e0e", border: `1px solid ${done ? ACCENT : "#2a2a2a"}`, boxShadow: done ? `0 0 6px ${ACCENT}` : "none", flexShrink: 0 }} />
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: done ? "#888" : "#333" }}>{item.label}</div>
              <div style={{ marginLeft: "auto", fontSize: 8, fontFamily: "var(--font-mono)", color: done ? `${ACCENT}70` : "#2a2a2a" }}>{done ? "DONE" : "PENDING"}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
