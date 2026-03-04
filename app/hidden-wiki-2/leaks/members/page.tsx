"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FFD700"

const MEMBERS = [
  { id: "M-01", handle: "DataCracker6", role: "LEAKS OPERATOR", uploads: 14, firstSeen: "2024-09-01", lastActive: "2024-10-16", flagged: true, clue: "DataCracker6 = активен от 09/2024, 14 uploads, последен в 00:01-00:03 (R/A/_ файлове)" },
  { id: "M-02", handle: "RedFox", role: "VERIFIED MEMBER", uploads: 8, firstSeen: "2024-08-15", lastActive: "2024-12-05", flagged: true, clue: "RedFox = verified member, последен upload 2024-12-05 viena_ref_1891.enc" },
  { id: "M-03", handle: "ToxicBabe", role: "MEMBER", uploads: 5, firstSeen: "2024-09-10", lastActive: "2024-10-25", flagged: false, clue: null },
  { id: "M-04", handle: "Black-Voyvoda", role: "MEMBER", uploads: 5, firstSeen: "2024-10-01", lastActive: "2024-11-16", flagged: false, clue: null },
  { id: "M-05", handle: "GothGirl", role: "MEDIA OPERATOR", uploads: 5, firstSeen: "2024-09-05", lastActive: "2024-10-17", flagged: false, clue: null },
  { id: "M-06", handle: "NightKiller", role: "MEMBER", uploads: 4, firstSeen: "2024-09-20", lastActive: "2024-10-15", flagged: false, clue: null },
  { id: "M-07", handle: "NullSyn", role: "DECOY / AGENT", uploads: 2, firstSeen: "2024-11-08", lastActive: "2024-11-08", flagged: true, clue: "NullSyn = NullSyndicate decoy agent — HOPS=2, всички uploads са decoy" },
]

export default function LeaksMembersPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])

  const handleSave = (m: typeof MEMBERS[number]) => {
    if (!m.clue) return
    const id = `member-${m.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    saveGameState(addClue(gs, { id, title: `[MEMBERS] ${m.handle}`, text: m.clue, sourceRoute: "/leaks/members", confidence: 3, status: "unverified" }))
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>← LEAKS</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="MEMBERS" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>7 известни члена. 3 с флагове за разследване.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 60px", gap: 8, padding: "6px 12px", background: "#0a0a0a", borderBottom: "1px solid #181818" }}>
          {["ID", "HANDLE", "ROLE", "UPLOADS"].map((h) => (
            <div key={h} style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2200", letterSpacing: "0.2em" }}>{h}</div>
          ))}
        </div>

        {MEMBERS.map((m, i) => {
          const id = `member-${m.id}`
          const isSaved = saved.includes(id)
          const isSelected = selected === m.id
          return (
            <div key={m.id}>
              <motion.div initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                onClick={() => setSelected(isSelected ? null : m.id)}
                style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 60px", gap: 8, padding: "10px 12px", background: isSelected ? `${ACCENT}07` : "#040404", border: `1px solid ${isSelected ? `${ACCENT}35` : m.flagged ? `${ACCENT}14` : "#0e0e0e"}`, cursor: "pointer" }}>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: m.flagged ? ACCENT : "#2a2a2a" }}>{m.id}</div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: isSelected ? ACCENT : m.handle === "RedFox" ? "#FF3366" : "#888", fontWeight: m.flagged ? 700 : 400 }}>{m.handle}</div>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444" }}>{m.role}</div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333" }}>{m.uploads}</div>
              </motion.div>
              <AnimatePresence>
                {isSelected && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.16 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", background: "#050400", border: `1px solid ${ACCENT}18`, borderTop: "none" }}>
                      <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333", marginBottom: 4 }}>
                        FIRST SEEN: {m.firstSeen} / LAST ACTIVE: {m.lastActive}
                      </div>
                      {m.clue && (
                        <>
                          <div style={{ padding: "8px 12px", background: "#0a0800", border: `1px solid ${ACCENT}20`, marginBottom: 10 }}>
                            <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#3a2a00", marginBottom: 3 }}>УЛИКА</div>
                            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT }}>{m.clue}</div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleSave(m) }} disabled={isSaved}
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
