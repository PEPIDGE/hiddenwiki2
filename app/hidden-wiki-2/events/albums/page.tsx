"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF6B00"

const ALBUMS = [
  {
    id: "ALB-01", title: "Огледална нощ — Виена 2024", date: "2024-11-30", photos: 14,
    coverNote: "Групова снимка — лица заличени. Фон: интериор апартамент.",
    anomaly: true, clue: "Фон на ALB-01: интериор апартамент 13B — стена с огледала",
  },
  {
    id: "ALB-02", title: "ARS Quarterly — Oct 2024", date: "2024-10-15", photos: 7,
    coverNote: "Официален групов портрет. Всички лица размазани.",
    anomaly: false, clue: null,
  },
  {
    id: "ALB-03", title: "Venue Recon Photos", date: "2024-11-28", photos: 22,
    coverNote: "Exterior shots. GPS метаданните са изтрити.",
    anomaly: true, clue: "ALB-03 foto #11: регистрационна табела на черен Audi A3 — частично четима",
  },
  {
    id: "ALB-04", title: "CIRCUIT-3 Ceremony", date: "2024-12-01", photos: 3,
    coverNote: "Само 3 снимки. Времеви маркер: 03:17.",
    anomaly: true, clue: "ALB-04: 03:17 timestamp — само 3 снимки, всички с filter:redacted",
  },
]

export default function EventsAlbumsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])

  const handleSave = (alb: typeof ALBUMS[number]) => {
    if (!alb.clue) return
    const id = `albums-${alb.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, { id, title: `[ALBUMS] ${alb.title}`, text: alb.clue, sourceRoute: "/events/albums", confidence: 2, status: "unverified" })
    saveGameState(updated)
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/events" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none", letterSpacing: "0.1em" }}>← EVENTS</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="ALBUMS" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>Фото архив от 4 събития. 3 от тях с аномалии.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, marginBottom: 20 }}>
        {ALBUMS.map((alb) => {
          const id = `albums-${alb.id}`
          const isSaved = saved.includes(id)
          const isSelected = selected === alb.id
          return (
            <div key={alb.id}>
              <motion.div whileHover={{ scale: 1.01 }} onClick={() => setSelected(isSelected ? null : alb.id)} style={{
                background: isSelected ? `${ACCENT}08` : "#040404",
                border: `1px solid ${isSelected ? `${ACCENT}35` : alb.anomaly ? `${ACCENT}18` : "#111"}`,
                padding: "16px", cursor: "pointer",
              }}>
                {/* Fake album cover */}
                <div style={{ height: 90, background: alb.anomaly ? "repeating-linear-gradient(135deg,#140500,#140500 2px,#0a0300 2px,#0a0300 10px)" : "#060606", marginBottom: 12, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: alb.anomaly ? `${ACCENT}30` : "#0e0e0e", letterSpacing: "0.2em" }}>
                    {alb.anomaly ? "[ ANOMALY ]" : `${alb.photos} PHOTOS`}
                  </div>
                  <div style={{ position: "absolute", bottom: 4, right: 6, fontSize: 7, fontFamily: "var(--font-mono)", color: "#1a1a1a" }}>{alb.id}</div>
                </div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: isSelected ? ACCENT : "#888", fontWeight: 700, marginBottom: 4 }}>{alb.title}</div>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333" }}>{alb.date} — {alb.photos} снимки</div>
              </motion.div>

              <AnimatePresence>
                {isSelected && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", background: "#060200", border: `1px solid ${ACCENT}20`, borderTop: "none" }}>
                      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#555", lineHeight: 1.7, marginBottom: alb.clue ? 12 : 0 }}>{alb.coverNote}</div>
                      {alb.clue && (
                        <>
                          <div style={{ padding: "8px 12px", background: "#0a0300", border: `1px solid ${ACCENT}20`, marginBottom: 10 }}>
                            <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#3a2000", marginBottom: 4 }}>УЛИКА</div>
                            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT }}>{alb.clue}</div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleSave(alb) }} disabled={isSaved}
                            style={{ background: "transparent", border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`, color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 9, padding: "6px 16px", cursor: isSaved ? "default" : "pointer" }}>
                            {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ УЛИКА"}
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

      <Link href="/hidden-wiki-2/events" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: `${ACCENT}40`, textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)} onMouseLeave={(e) => (e.currentTarget.style.color = `${ACCENT}40`)}>← EVENTS INDEX</Link>
    </div>
  )
}
