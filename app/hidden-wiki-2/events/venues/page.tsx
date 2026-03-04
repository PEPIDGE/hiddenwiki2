"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF6B00"

const VENUES = [
  { id: "VEN-01", name: "Апартамент 13B, Виена", type: "RESIDENTIAL", access: "PRIVATE", visits: 3, lat: "48.2082", lon: "16.3738", anomaly: true, clue: "VEN-01: Апартамент 13B Виена — 3 посещения, последно 2024-11-30 18:30" },
  { id: "VEN-02", name: "Relay Node — Online", type: "VIRTUAL", access: "ENCRYPTED", visits: 1, lat: "N/A", lon: "N/A", anomaly: false, clue: null },
  { id: "VEN-03", name: "Parkhaus Wien-Mitte", type: "PARKING", access: "PUBLIC", visits: 2, lat: "48.2050", lon: "16.3820", anomaly: true, clue: "VEN-03: Паркинг Wien-Mitte — Audi A3 регистриран 2× в 18:30 и 22:17" },
  { id: "VEN-04", name: "[REDACTED] — Forum venue", type: "COMMERCIAL", access: "REMOVED", visits: 0, lat: "[R]", lon: "[R]", anomaly: false, clue: null },
]

export default function EventsVenuesPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])

  const handleSave = (v: typeof VENUES[number]) => {
    if (!v.clue) return
    const id = `venue-${v.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    saveGameState(addClue(gs, { id, title: `[VENUES] ${v.name}`, text: v.clue, sourceRoute: "/events/venues", confidence: 3, status: "unverified" }))
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/events" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>← EVENTS</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="VENUES" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>4 локации — 2 с потвърдени аномалии.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
        {VENUES.map((v, i) => {
          const id = `venue-${v.id}`
          const isSaved = saved.includes(id)
          const isSelected = selected === v.id
          return (
            <motion.div key={v.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(isSelected ? null : v.id)}
              style={{ background: isSelected ? `${ACCENT}08` : "#040404", border: `1px solid ${isSelected ? `${ACCENT}35` : v.anomaly ? `${ACCENT}18` : "#111"}`, padding: "16px", cursor: "pointer" }}>
              <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", marginBottom: 6 }}>{v.id}</div>
              <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: isSelected ? ACCENT : "#888", fontWeight: 700, marginBottom: 8 }}>{v.name}</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                {[v.type, v.access].map((tag) => (
                  <span key={tag} style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", border: "1px solid #181818", padding: "1px 5px" }}>{tag}</span>
                ))}
              </div>
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a" }}>VISITS: {v.visits} | {v.lat !== "N/A" && v.lat !== "[R]" ? `${v.lat}, ${v.lon}` : v.lat}</div>

              {isSelected && v.clue && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ padding: "8px 12px", background: "#0a0300", border: `1px solid ${ACCENT}20`, marginBottom: 8 }}>
                    <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#3a2000", marginBottom: 3 }}>УЛИКА</div>
                    <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: ACCENT }}>{v.clue}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleSave(v) }} disabled={isSaved}
                    style={{ background: "transparent", border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`, color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 9, padding: "6px 16px", cursor: isSaved ? "default" : "pointer" }}>
                    {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ"}
                  </button>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
