"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF0033"

const SIGNALS = [
  {
    id: "SIG-001",
    timestamp: "2025-10-15 20:11",
    freq: "144.625 MHz",
    duration: "0:12",
    decoded: "BRATSTVO :: CONFIRM :: 15-10 :: 22:00",
    anomaly: true,
    clue: "SIG-001: Братство потвърди операция 15.10 за 22:00 — прихванато на 144.625 MHz",
  },
  {
    id: "SIG-002",
    timestamp: "2025-10-15 21:03",
    freq: "433.920 MHz",
    duration: "0:04",
    decoded: "NIGHTKILLER :: ROUTE-CONFIRM :: BL14 :: 22:09",
    anomaly: true,
    clue: "SIG-002: NightKiller потвърди маршрут пред бл. 14 в 22:09",
  },
  {
    id: "SIG-003",
    timestamp: "2025-10-15 21:45",
    freq: "433.920 MHz",
    duration: "0:07",
    decoded: "REDFOX :: STANDBY :: ZAHARNA :: WEST-WING",
    anomaly: true,
    clue: "SIG-003: RedFox на готовност в Захарна фабрика — западно крило",
  },
  {
    id: "SIG-004",
    timestamp: "2025-10-15 22:14",
    freq: "144.625 MHz",
    duration: "0:02",
    decoded: "PACKAGE :: SECURED :: STAYA-9 :: BLACKVOYVODA-CONFIRM",
    anomaly: true,
    clue: "SIG-004: 'Пакетът' (Лора) е осигурен в стая 9 — потвърдено от Black-Voyvoda",
  },
  {
    id: "SIG-005",
    timestamp: "2025-10-15 22:20",
    freq: "868.000 MHz",
    duration: "0:19",
    decoded: "DECOY :: ROUTE17NIGHT :: BROADCAST :: [DISREGARD]",
    anomaly: false,
    clue: null,
    note: "⚠ Decoy сигнал — route-17-night е примамка",
  },
  {
    id: "SIG-006",
    timestamp: "2025-10-16 01:28",
    freq: "144.625 MHz",
    duration: "0:06",
    decoded: "REDFOX :: RITUAL :: COMPLETE :: ERASE-TRACES",
    anomaly: true,
    clue: "SIG-006: RedFox — 'ритуалът е завършен, изтрийте следите' — 01:28 на 16.10",
  },
  {
    id: "SIG-007",
    timestamp: "2025-10-16 02:15",
    freq: "433.920 MHz",
    duration: "0:03",
    decoded: "NIGHTKILLER :: DEPARTURE :: ZAHARNA :: 3-VEHICLES",
    anomaly: false,
    clue: null,
  },
]

export default function RedRoomSignalLogPage() {
  const [saved, setSaved] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filtered, setFiltered] = useState<"all" | "anomaly">("all")

  useEffect(() => {
    setSaved(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (sig: typeof SIGNALS[number]) => {
    if (!sig.clue) return
    const id = `signal-${sig.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[SIGNAL] ${sig.id}`,
      text: sig.clue, sourceRoute: "/red-room/signal-log",
      confidence: 4, status: "confirmed",
    })
    saveGameState(updated)
    setSaved((p) => [...p, id])
  }

  const visible = filtered === "anomaly" ? SIGNALS.filter((s) => s.anomaly) : SIGNALS

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/hidden-wiki-2/red-room" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.15em", textDecoration: "none" }}>← RED ROOM</Link>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="SIGNAL LOG" as="h2" intensity="medium" className="text-xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <div style={{ padding: "10px 14px", background: "#0d0000", border: `1px solid ${ACCENT}20`, marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Прихванати радиосигнали от 15-16 октомври 2025. <span style={{ color: ACCENT }}>4 от 7</span> съдържат ключова оперативна информация.
          <br /><span style={{ color: "#555" }}>SIG-005 е decoy — route-17-night е невалиден маршрут.</span>
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {(["all", "anomaly"] as const).map((f) => (
          <button key={f} onClick={() => setFiltered(f)}
            style={{ padding: "4px 12px", fontSize: 8, fontFamily: "var(--font-mono)", background: filtered === f ? `${ACCENT}22` : "#0d0d0d", color: filtered === f ? ACCENT : "#666", border: `1px solid ${filtered === f ? ACCENT + "50" : "#1e1e1e"}`, cursor: "pointer", letterSpacing: "0.1em" }}>
            {f === "all" ? "ALL SIGNALS" : "ANOMALIES ONLY"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {visible.map((sig) => {
          const id = `signal-${sig.id}`
          const isSaved = saved.includes(id)
          const isExpanded = expanded === sig.id
          return (
            <div key={sig.id}>
              <motion.div whileHover={{ x: 2 }} onClick={() => setExpanded(isExpanded ? null : sig.id)}
                style={{ padding: "10px 14px", background: isExpanded ? `${ACCENT}08` : "#090909", border: `1px solid ${isExpanded ? `${ACCENT}35` : sig.anomaly ? `${ACCENT}15` : "#141414"}`, cursor: "pointer", display: "grid", gridTemplateColumns: "70px 110px 80px 1fr auto", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: sig.anomaly ? ACCENT : "#333", letterSpacing: "0.1em" }}>{sig.id}</span>
                <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#666" }}>{sig.timestamp.split(" ")[1]}</span>
                <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444" }}>{sig.freq}</span>
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: sig.anomaly ? "#c0c0c0" : "#444", letterSpacing: "0.05em", fontWeight: sig.anomaly ? 600 : 400 }}>
                  {sig.decoded || sig.note}
                </span>
                {sig.anomaly && <span style={{ fontSize: 7, color: ACCENT, border: `1px solid ${ACCENT}40`, padding: "1px 4px", flexShrink: 0 }}>ANOMALY</span>}
              </motion.div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.16 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", background: "#060000", border: `1px solid ${ACCENT}20`, borderTop: "none" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 7, color: "#333", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", marginBottom: 3 }}>TIMESTAMP</div>
                          <div style={{ fontSize: 10, color: "#c0c0c0", fontFamily: "var(--font-mono)" }}>{sig.timestamp}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 7, color: "#333", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", marginBottom: 3 }}>FREQUENCY / DURATION</div>
                          <div style={{ fontSize: 10, color: "#c0c0c0", fontFamily: "var(--font-mono)" }}>{sig.freq} — {sig.duration}</div>
                        </div>
                      </div>
                      {sig.note && (
                        <div style={{ padding: "6px 10px", background: "#0a0000", border: `1px solid ${ACCENT}15`, marginBottom: 10, fontSize: 10, color: "#777", fontFamily: "var(--font-mono)" }}>{sig.note}</div>
                      )}
                      {sig.clue && (
                        <>
                          <div style={{ padding: "6px 10px", background: "#0a0000", border: `1px solid ${ACCENT}20`, marginBottom: 10, fontSize: 10, color: ACCENT, fontFamily: "var(--font-mono)" }}>{sig.clue}</div>
                          <button onClick={(e) => { e.stopPropagation(); handleSave(sig) }} disabled={isSaved}
                            style={{ padding: "4px 14px", fontSize: 8, fontFamily: "var(--font-mono)", background: isSaved ? `${ACCENT}18` : "transparent", color: isSaved ? ACCENT : "#777", border: `1px solid ${isSaved ? ACCENT + "50" : "#222"}`, cursor: isSaved ? "default" : "pointer" }}>
                            {isSaved ? "✓ SAVED" : "SAVE CLUE"}
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
    </div>
  )
}
