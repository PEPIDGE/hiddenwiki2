"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00BFFF"

const CACHE_ENTRIES = [
  { id: "CACHE-001", path: "/cult/chat-system/logs/session_1015.log", size: "3.2 KB", modified: "2025-10-15 21:30", content: "CHAT SESSION 15.10.2025 — M-01: 'Операцията е потвърдена за 22:00'. M-06: 'route-17-night е примамка — реалното е Захарна фабрика'. M-09: 'Ритуалът е завършен. Изтрийте следите.'", anomaly: true },
  { id: "CACHE-002", path: "/events/calendar/2025-10-15.json", size: "1.1 KB", modified: "2025-10-14 20:00", content: "[Календарен запис. Събитие: 'Огледален преход 15.10'. Локация: неизвестна. Гост: Лора Костова. Статус: ПОТВЪРДЕН]", anomaly: false },
  { id: "CACHE-003", path: "/leaks/vehicles/audi_match.txt", size: "0.8 KB", modified: "2025-10-16 09:00", content: "VEHICLE MATCH: Черен Audi A3 2005 | Тел: +359 88 412 1221 | Д. Михайлов (NightKiller) | V-001, V-003, V-009 — 3 СЪВПАДЕНИЯ", anomaly: true },
  { id: "CACHE-004", path: "/leaks/passwords/gothgirl_changed.log", size: "0.3 KB", modified: "2025-10-12 03:14", content: "PASSWORD CHANGE: GothGirl | Стара: joko1132 | Нова: [ENCRYPTED] | IP: неизвестен | Дата: 12.10.2025 03:14", anomaly: true },
  { id: "CACHE-005", path: "/cult/operators/nullsyn_decoy.dat", size: "0.1 KB", modified: "2025-10-13 18:30", content: "NULLSYN | HOPS=2 | STATUS=COMPROMISED | route-17-night = DECOY COORDINATES | Не следвай", anomaly: false },
]

export default function MirrorsCachePage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    setTimeout(() => setScanning(false), 1800)
    const gs = getGameState()
    setSavedClues(gs.clues.map((c) => c.id))
  }, [])

  const handleSave = (entry: typeof CACHE_ENTRIES[number]) => {
    const id = `cache-${entry.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id,
      title: `[CACHE] ${entry.path}`,
      text: entry.content,
      sourceRoute: "/mirrors/cache",
      confidence: 3,
      status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.3em", marginBottom: 8 }}>
          MIRRORS / CACHE — RECOVERED FILE SYSTEM
        </div>
        <GlitchText text="CACHE" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
      </div>

      <AnimatePresence>
        {scanning && (
          <motion.div
            exit={{ opacity: 0 }}
            style={{ padding: "14px 18px", border: `1px solid ${ACCENT}20`, background: "#030810", marginBottom: 20 }}
          >
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.12em" }}>
              SCANNING CACHE... ████████░░ 80%
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!scanning && (
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333333", lineHeight: 1.8, marginBottom: 20, maxWidth: 540 }}>
          Възстановен кеш от ARS огледалните ноди. 3 файла съдържат аномалии.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 70px 140px", gap: 8, padding: "6px 12px", background: "#0a0a0a", borderBottom: "1px solid #181818" }}>
          {["ID", "PATH", "SIZE", "MODIFIED"].map((h) => (
            <div key={h} style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em" }}>{h}</div>
          ))}
        </div>

        {CACHE_ENTRIES.map((entry) => {
          const id = `cache-${entry.id}`
          const isSaved = savedClues.includes(id)
          const isExpanded = expanded === entry.id
          return (
            <div key={entry.id}>
              <motion.div
                whileHover={{ backgroundColor: entry.anomaly ? `${ACCENT}08` : "#080808" }}
                onClick={() => setExpanded(isExpanded ? null : entry.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px 1fr 70px 140px",
                  gap: 8,
                  padding: "10px 12px",
                  background: isExpanded ? `${ACCENT}08` : "#050505",
                  border: `1px solid ${isExpanded ? `${ACCENT}30` : entry.anomaly ? `${ACCENT}12` : "#0e0e0e"}`,
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
              >
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: entry.anomaly ? ACCENT : "#2a2a2a", letterSpacing: "0.08em" }}>
                  {entry.id}
                </div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: entry.anomaly ? "#aaaaaa" : "#444444" }}>
                  {entry.path}
                </div>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333333" }}>{entry.size}</div>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: entry.anomaly ? `${ACCENT}70` : "#333333" }}>{entry.modified}</div>
              </motion.div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "12px 16px", background: "#030810", border: `1px solid ${ACCENT}20`, borderTop: "none" }}>
                      <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a4a5a", letterSpacing: "0.12em", marginBottom: 8 }}>СЪДЪРЖАНИЕ</div>
                      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: entry.anomaly ? "#cccccc" : "#555555", lineHeight: 1.7, marginBottom: 10 }}>
                        {entry.content}
                      </div>
                      {entry.anomaly && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSave(entry) }}
                          disabled={isSaved}
                          style={{
                            background: "transparent", border: `1px solid ${isSaved ? "#222222" : `${ACCENT}40`}`,
                            color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)",
                            fontSize: 9, letterSpacing: "0.1em", padding: "7px 18px", cursor: isSaved ? "default" : "pointer",
                          }}
                        >
                          {isSaved ? "ЗАПИСАНО В EVIDENCE BOARD" : "ЗАПАЗИ УЛИКА"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
