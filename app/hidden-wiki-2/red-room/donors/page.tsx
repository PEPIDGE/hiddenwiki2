"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF0033"

type SortKey = "amount" | "timestamp" | "priority" | "code"
type SortDir = "asc" | "desc"

const DONORS = [
  { id: "D-001", username: "ghost_patron", amount: 340, timestamp: "2025-10-12 14:22", code: "DC-0017", priority: false, status: "VERIFIED", note: "" },
  { id: "D-002", username: "r3dfl0w", amount: 1200, timestamp: "2025-10-13 03:17", code: "DC-0031", priority: true, status: "VERIFIED", note: "repeat donor" },
  { id: "D-003", username: "anon_9541", amount: 80, timestamp: "2025-10-10 11:00", code: "DC-0009", priority: false, status: "PARTIAL", note: "" },
  { id: "D-004", username: "NightFund", amount: 2200, timestamp: "2025-10-14 22:17", code: "DC-0044", priority: true, status: "VERIFIED", note: "linked to events" },
  { id: "D-005", username: "silent_stream", amount: 450, timestamp: "2025-10-11 09:45", code: "DC-0022", priority: false, status: "VERIFIED", note: "" },
  { id: "D-006", username: "r3dfl0w", amount: 1100, timestamp: "2025-10-15 03:17", code: "DC-0031", priority: true, status: "VERIFIED", note: "repeat — same code DC-0031" },
  { id: "D-007", username: "patron_x7", amount: 620, timestamp: "2025-10-09 18:30", code: "DC-0018", priority: false, status: "PARTIAL", note: "" },
  { id: "D-008", username: "VoidUser", amount: 50, timestamp: "2025-10-08 12:00", code: "DC-0003", priority: false, status: "PARTIAL", note: "" },
  { id: "D-009", username: "RedCircle", amount: 5500, timestamp: "2025-10-15 18:30", code: "DC-0077", priority: true, status: "VERIFIED", note: "⚠ PRIORITY — highest single donation" },
  { id: "D-010", username: "NightFund", amount: 900, timestamp: "2025-10-13 22:17", code: "DC-0044", priority: false, status: "VERIFIED", note: "repeat — code DC-0044" },
  { id: "D-011", username: "m00n_g4ze", amount: 200, timestamp: "2025-10-07 15:30", code: "DC-0011", priority: false, status: "PARTIAL", note: "" },
  { id: "D-012", username: "anon_9541", amount: 80, timestamp: "2025-10-06 10:00", code: "DC-0009", priority: false, status: "PARTIAL", note: "repeat — code DC-0009" },
  { id: "D-013", username: "RedCircle", amount: 3300, timestamp: "2025-10-14 03:17", code: "DC-0077", priority: true, status: "VERIFIED", note: "⚠ PRIORITY — repeat, DC-0077 x2" },
  { id: "D-014", username: "null_entry", amount: 10, timestamp: "2025-10-05 08:00", code: "DC-0001", priority: false, status: "DECOY", note: "possible bot" },
  { id: "D-015", username: "ghost_patron", amount: 340, timestamp: "2025-10-15 14:22", code: "DC-0017", priority: false, status: "VERIFIED", note: "repeat — code DC-0017" },
]

const PRIORITY_COLORS: Record<string, string> = {
  VERIFIED: "#00FF41",
  PARTIAL: "#FF6B00",
  DECOY: "#CC44FF",
}

export default function DonorsPage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<SortKey>("timestamp")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("desc") }
  }

  const sorted = [...DONORS].sort((a, b) => {
    let av: string | number = a[sortKey] ?? ""
    let bv: string | number = b[sortKey] ?? ""
    if (sortKey === "priority") { av = a.priority ? 1 : 0; bv = b.priority ? 1 : 0 }
    if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av
    return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
  })

  const handleSave = (donor: typeof DONORS[number], field: string, text: string) => {
    const id = `donors-${donor.id}-${field}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[DONORS] ${donor.username} — ${field}`,
      text, sourceRoute: "/red-room/donors", confidence: 3, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  const selectedDonor = selected ? DONORS.find((d) => d.id === selected) : null

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/hidden-wiki-2/red-room" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.15em", textDecoration: "none" }}>
          ← RED ROOM
        </Link>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <GlitchText text="DONORS" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", marginLeft: "auto", letterSpacing: "0.1em" }}>
            {DONORS.length} ЗАПИСА
          </span>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <div style={{ padding: "10px 14px", background: "#080808", border: "1px solid #1e1e1e", marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: "#aaa", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Сортирай по <span style={{ color: "#FFD700" }}>amount</span>, <span style={{ color: "#FF6B00" }}>timestamp</span> или <span style={{ color: "#CC44FF" }}>priority</span> — повтарящите се donor кодове крият информация.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        {/* Table */}
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #222" }}>
                {[
                  { key: "username" as SortKey, label: "USERNAME" },
                  { key: "amount" as SortKey, label: "AMOUNT €" },
                  { key: "timestamp" as SortKey, label: "TIMESTAMP" },
                  { key: "code" as SortKey, label: "DONOR CODE" },
                  { key: "priority" as SortKey, label: "PRIORITY" },
                ].map((col) => (
                  <th key={col.key}
                    onClick={() => handleSort(col.key)}
                    style={{ padding: "8px 10px", fontSize: 8, fontFamily: "var(--font-mono)", color: sortKey === col.key ? ACCENT : "#555", letterSpacing: "0.15em", cursor: "pointer", textAlign: "left", whiteSpace: "nowrap" }}>
                    {col.label} {sortKey === col.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                ))}
                <th style={{ padding: "8px 10px", fontSize: 8, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.15em" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((donor) => {
                const isSelected = selected === donor.id
                const isRepeat = DONORS.filter((d) => d.code === donor.code).length > 1
                return (
                  <tr key={donor.id}
                    onClick={() => setSelected(isSelected ? null : donor.id)}
                    style={{
                      borderBottom: "1px solid #141414", cursor: "pointer",
                      background: isSelected ? `${ACCENT}0a` : isRepeat ? "#0d0000" : "transparent",
                      transition: "background 0.1s",
                    }}>
                    <td style={{ padding: "8px 10px", fontSize: 11, color: isRepeat ? "#FFD700" : "#d0d0d0", fontFamily: "var(--font-mono)" }}>
                      {donor.username}
                    </td>
                    <td style={{ padding: "8px 10px", fontSize: 11, color: donor.amount >= 2000 ? ACCENT : "#c0c0c0", fontFamily: "var(--font-mono)", fontWeight: donor.amount >= 2000 ? 700 : 400 }}>
                      {donor.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: "8px 10px", fontSize: 10, color: "#888", fontFamily: "var(--font-mono)" }}>
                      {donor.timestamp}
                    </td>
                    <td style={{ padding: "8px 10px", fontSize: 10, color: isRepeat ? "#CC44FF" : "#777", fontFamily: "var(--font-mono)" }}>
                      {donor.code}
                      {isRepeat && <span style={{ marginLeft: 6, fontSize: 8, color: "#CC44FF" }}>×REPEAT</span>}
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      {donor.priority && <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: ACCENT, border: `1px solid ${ACCENT}40`, padding: "2px 6px" }}>PRIORITY</span>}
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <button onClick={(e) => { e.stopPropagation(); handleSave(donor, "row", `Donor: ${donor.username} | ${donor.amount}€ | ${donor.timestamp} | ${donor.code}${donor.note ? " | " + donor.note : ""}`) }}
                        style={{ padding: "3px 8px", fontSize: 7, fontFamily: "var(--font-mono)", background: savedClues.includes(`donors-${donor.id}-row`) ? `${ACCENT}18` : "#0d0d0d", color: savedClues.includes(`donors-${donor.id}-row`) ? ACCENT : "#666", border: `1px solid ${savedClues.includes(`donors-${donor.id}-row`) ? ACCENT + "40" : "#1e1e1e"}`, cursor: "pointer" }}>
                        {savedClues.includes(`donors-${donor.id}-row`) ? "✓" : "SAVE"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        <div style={{ background: "#080808", border: "1px solid #1e1e1e", padding: 16, height: "fit-content" }}>
          {selectedDonor ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={selectedDonor.id}>
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.2em", marginBottom: 12 }}>DONOR DETAIL</div>
              <div style={{ fontSize: 16, fontFamily: "var(--font-mono)", color: "#e0e0e0", fontWeight: 700, marginBottom: 14 }}>{selectedDonor.username}</div>
              {[
                { label: "ID", value: selectedDonor.id },
                { label: "AMOUNT", value: `€${selectedDonor.amount}`, color: selectedDonor.amount >= 2000 ? ACCENT : "#c0c0c0" },
                { label: "TIMESTAMP", value: selectedDonor.timestamp },
                { label: "CODE", value: selectedDonor.code, color: DONORS.filter((d) => d.code === selectedDonor.code).length > 1 ? "#CC44FF" : "#888" },
                { label: "STATUS", value: selectedDonor.status, color: PRIORITY_COLORS[selectedDonor.status] },
                { label: "PRIORITY", value: selectedDonor.priority ? "YES" : "NO", color: selectedDonor.priority ? ACCENT : "#555" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #111" }}>
                  <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.1em" }}>{row.label}</span>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: row.color ?? "#aaa" }}>{row.value}</span>
                </div>
              ))}
              {selectedDonor.note && (
                <div style={{ marginTop: 8, padding: "8px 10px", background: "#0d0d0d", border: "1px solid #1e1e1e", fontSize: 10, color: "#FFD700", fontFamily: "var(--font-mono)" }}>
                  ⚠ {selectedDonor.note}
                </div>
              )}
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { field: "username", text: `Username: ${selectedDonor.username}` },
                  { field: "code", text: `Donor code: ${selectedDonor.code}` },
                  { field: "timestamp", text: `Timestamp: ${selectedDonor.timestamp}` },
                ].map((action) => (
                  <button key={action.field} onClick={() => handleSave(selectedDonor, action.field, action.text)}
                    style={{ padding: "5px 10px", fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", background: savedClues.includes(`donors-${selectedDonor.id}-${action.field}`) ? `${ACCENT}18` : "#0d0d0d", color: savedClues.includes(`donors-${selectedDonor.id}-${action.field}`) ? ACCENT : "#777", border: `1px solid ${savedClues.includes(`donors-${selectedDonor.id}-${action.field}`) ? ACCENT + "40" : "#222"}`, cursor: "pointer", textAlign: "left" }}>
                    {savedClues.includes(`donors-${selectedDonor.id}-${action.field}`) ? "✓ " : ""}{action.text.split(":")[0]} → SAVE
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#333", textAlign: "center", padding: "30px 0" }}>
              Цъкни ред за детайли
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
