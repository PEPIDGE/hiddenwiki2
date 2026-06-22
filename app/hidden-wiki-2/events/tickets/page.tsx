"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF41"

const TICKETS = [
  { id: "TK-9901", event: "Огледална нощ", seat: "VIP-13B", issued: "2024-11-28", holder: "[REDACTED]", status: "USED", anomaly: true, clue: "Билет TK-9901: VIP-13B — директна връзка с апартамент 13B" },
  { id: "TK-9902", event: "ARS Quarterly", seat: "ROW-7", issued: "2024-10-10", holder: "ARS Member", status: "USED", anomaly: false, clue: null },
  { id: "TK-9903", event: "CIRCUIT-3 Initiation", seat: "RELAY-NODE", issued: "2024-12-01", holder: "OP::RED_X", status: "USED", anomaly: true, clue: "TK-9903: OP::RED_X — билет за CIRCUIT-3 инициация" },
  { id: "TK-9904", event: "B.ORC Transfer", seat: "DRIVER", issued: "2024-12-05", holder: "[REDACTED]", status: "PENDING", anomaly: true, clue: "TK-9904: DRIVER seat — B.ORC Transfer, Audi A3 шофьор" },
  { id: "TK-9905", event: "Forum Debrief #12", seat: "GENERAL", issued: "2024-11-05", holder: "anon_7731", status: "CANCELLED", anomaly: false, clue: null },
]

const STATUS_COLOR: Record<string, string> = { USED: "#00FF41", PENDING: ACCENT, CANCELLED: "#333" }

export default function EventsTicketsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])

  const handleSave = (tk: typeof TICKETS[number]) => {
    if (!tk.clue) return
    const id = `ticket-${tk.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    saveGameState(addClue(gs, { id, title: `[TICKETS] ${tk.id}`, text: tk.clue, sourceRoute: "/events/tickets", confidence: 3, status: "unverified" }))
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/events" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>← EVENTS</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="TICKETS" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>5 билета — 3 с потенциални улики.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 80px 110px 80px", gap: 8, padding: "6px 12px", background: "#0a0a0a", borderBottom: "1px solid #181818" }}>
          {["ID", "EVENT", "SEAT", "ISSUED", "STATUS"].map((h) => (
            <div key={h} style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em" }}>{h}</div>
          ))}
        </div>

        {TICKETS.map((tk, i) => {
          const id = `ticket-${tk.id}`
          const isSaved = saved.includes(id)
          const isExp = selected === tk.id
          return (
            <div key={tk.id}>
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                onClick={() => setSelected(isExp ? null : tk.id)}
                style={{ display: "grid", gridTemplateColumns: "80px 1fr 80px 110px 80px", gap: 8, padding: "10px 12px", background: isExp ? `${ACCENT}08` : "#040404", border: `1px solid ${isExp ? `${ACCENT}35` : tk.anomaly ? `${ACCENT}15` : "#0e0e0e"}`, cursor: "pointer" }}>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: tk.anomaly ? ACCENT : "#2a2a2a" }}>{tk.id}</div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: tk.anomaly ? "#cccccc" : "#444" }}>{tk.event}</div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: tk.anomaly ? `${ACCENT}80` : "#333" }}>{tk.seat}</div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333" }}>{tk.issued}</div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: STATUS_COLOR[tk.status] }}>{tk.status}</div>
              </motion.div>
              <AnimatePresence>
                {isExp && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.16 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", background: "#060200", border: `1px solid ${ACCENT}20`, borderTop: "none" }}>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", marginBottom: 6 }}>Носител: {tk.holder}</div>
                      {tk.clue && (
                        <>
                          <div style={{ padding: "8px 12px", background: "#0a0300", border: `1px solid ${ACCENT}20`, marginBottom: 10 }}>
                            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#3a2000", marginBottom: 3 }}>УЛИКА</div>
                            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT }}>{tk.clue}</div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleSave(tk) }} disabled={isSaved}
                            style={{ background: "transparent", border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`, color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 9, padding: "6px 16px", cursor: isSaved ? "default" : "pointer" }}>
                            {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ"}
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
