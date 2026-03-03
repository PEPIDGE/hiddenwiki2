"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF6B00"

const SUBLINKS = [
  { label: "/ INDEX", href: "/hidden-wiki-2/events" },
  { label: "/ CALENDAR", href: "/hidden-wiki-2/events/calendar" },
  { label: "/ ALBUMS", href: "/hidden-wiki-2/events/albums" },
  { label: "/ TICKETS", href: "/hidden-wiki-2/events/tickets" },
  { label: "/ VENUES", href: "/hidden-wiki-2/events/venues" },
]

const EVENTS = [
  {
    id: "EV-001",
    title: "ОГЛЕДАЛНА НОЩ — Виена",
    date: "2024-11-30",
    time: "18:30",
    venue: "Апартамент 13B, Wien",
    status: "COMPLETED",
    notes: "Последно потвърдено присъствие на всички членове.",
    anomaly: true,
    clue: "18:30 — Огледална нощ, Виена, апартамент 13B. Всички членове.",
  },
  {
    id: "EV-002",
    title: "ARS Quarterly Meeting",
    date: "2024-10-15",
    time: "14:00",
    venue: "[REDACTED]",
    status: "COMPLETED",
    notes: "Стандартна среща. Без инциденти.",
    anomaly: false,
    clue: null,
  },
  {
    id: "EV-003",
    title: "CIRCUIT-3 Initiation",
    date: "2024-12-01",
    time: "03:17",
    venue: "Relay Node — Online",
    status: "COMPLETED",
    notes: "Инициация на новия оператор. Токен активиран в relay node.",
    anomaly: true,
    clue: "03:17 — CIRCUIT-3 инициация. Токен активиран в relay node.",
  },
  {
    id: "EV-004",
    title: "B.ORC Transfer Event",
    date: "2024-12-06",
    time: "22:17",
    venue: "TBD",
    status: "PLANNED",
    notes: "Черен Audi A3 потвърден като транспорт. Маршрут: неизвестен.",
    anomaly: true,
    clue: "22:17 — B.ORC трансфер, Черен Audi A3, локация TBD",
  },
  {
    id: "EV-005",
    title: "Forum Debrief #12",
    date: "2024-11-08",
    time: "20:00",
    venue: "[REMOVED]",
    status: "CANCELLED",
    notes: "Отменено — причина неизвестна.",
    anomaly: false,
    clue: null,
  },
]

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#00FF41",
  PLANNED: ACCENT,
  CANCELLED: "#333333",
}

export default function EventsPage() {
  const pathname = usePathname()
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (ev: typeof EVENTS[number]) => {
    if (!ev.clue) return
    const id = `events-${ev.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id,
      title: `[EVENTS] ${ev.title}`,
      text: ev.clue,
      sourceRoute: "/events",
      confidence: 3,
      status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.35em", marginBottom: 8 }}>
            EVENTS — ACTIVITY LOG // NODE: EV-TRACK
          </div>
          <GlitchText text="EVENTS" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ padding: "8px 14px", border: `1px solid ${ACCENT}20`, background: "#0d0500", fontSize: 9, fontFamily: "var(--font-mono)", color: `${ACCENT}60`, letterSpacing: "0.1em" }}>
          {EVENTS.filter((e) => e.anomaly).length} ANOMALIES / {EVENTS.length} TOTAL
        </div>
      </div>

      <div style={{ display: "flex", gap: 1, marginBottom: 28, flexWrap: "wrap" }}>
        {SUBLINKS.map((link) => {
          const isCurrent = pathname === link.href
          return (
            <Link key={link.label} href={link.href} style={{
              padding: "7px 14px", fontSize: 9, fontFamily: "var(--font-mono)",
              color: isCurrent ? ACCENT : "#333333", letterSpacing: "0.12em",
              textDecoration: "none", background: isCurrent ? `${ACCENT}10` : "#070707",
              border: `1px solid ${isCurrent ? `${ACCENT}40` : "#181818"}`,
              borderBottom: isCurrent ? `2px solid ${ACCENT}` : "1px solid #181818",
            }}
              onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.color = ACCENT }}
              onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.color = "#333333" }}>
              {link.label}
            </Link>
          )
        })}
      </div>

      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333333", lineHeight: 1.8, marginBottom: 24, maxWidth: 540, paddingLeft: 12, borderLeft: "2px solid #1a0d00" }}>
        Хронологичен лог на активностите. Три записа съдържат критични времеви маркери
        и локационни данни. Кликни за детайли.
      </div>

      <div style={{ position: "relative", paddingLeft: 22 }}>
        <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 1, background: "#181818" }} />

        {EVENTS.map((ev, i) => {
          const id = `events-${ev.id}`
          const isSaved = savedClues.includes(id)
          const isSelected = selected === ev.id
          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{ position: "relative", marginBottom: 4 }}
            >
              <div style={{
                position: "absolute", left: -18, top: 13,
                width: 7, height: 7,
                background: ev.anomaly ? ACCENT : "#181818",
                boxShadow: ev.anomaly ? `0 0 8px ${ACCENT}50` : "none",
              }} />

              <div onClick={() => setSelected(isSelected ? null : ev.id)} style={{
                padding: "12px 14px",
                background: isSelected ? `${ACCENT}08` : "#040404",
                border: `1px solid ${isSelected ? `${ACCENT}35` : ev.anomaly ? `${ACCENT}15` : "#111111"}`,
                cursor: "pointer",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                      <span style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.12em" }}>{ev.id}</span>
                      <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: STATUS_COLORS[ev.status], letterSpacing: "0.1em" }}>{ev.status}</span>
                    </div>
                    <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: isSelected ? ACCENT : "#888888", fontWeight: 700, marginBottom: 5 }}>{ev.title}</div>
                    <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444444" }}>
                      {ev.date} / <span style={{ color: ev.anomaly ? `${ACCENT}90` : "#333333" }}>{ev.time}</span> — {ev.venue}
                    </div>
                  </div>
                  {isSaved && <span style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a4a2a", border: "1px solid #1a3a1a", padding: "2px 6px", flexShrink: 0 }}>SAVED</span>}
                </div>
              </div>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "12px 16px", background: "#060300", border: `1px solid ${ACCENT}20`, borderTop: "none" }}>
                      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#555555", lineHeight: 1.7, marginBottom: ev.clue ? 12 : 0 }}>{ev.notes}</div>
                      {ev.clue && (
                        <>
                          <div style={{ padding: "8px 12px", background: "#0a0500", border: `1px solid ${ACCENT}20`, marginBottom: 10 }}>
                            <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#3a2000", letterSpacing: "0.12em", marginBottom: 4 }}>УЛИКА</div>
                            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT }}>{ev.clue}</div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSave(ev) }}
                            disabled={isSaved}
                            style={{
                              background: "transparent", border: `1px solid ${isSaved ? "#222222" : `${ACCENT}40`}`,
                              color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)",
                              fontSize: 9, letterSpacing: "0.1em", padding: "7px 18px", cursor: isSaved ? "default" : "pointer",
                            }}
                          >
                            {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ УЛИКА"}
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
