"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FFD700"

const DOCS = [
  { id: "D1", name: "fin_q4_extract.xls", size: "88 KB", class: "RESTRICTED", clue: null, preview: "Q4 финансов екстракт — 3 транзакции маркирани" },
  { id: "D2", name: "R_auth_seed.enc", size: "2.2 KB", class: "CLASSIFIED", clue: null, preview: "▓▒░ ENCRYPTED ░▒▓" },
  { id: "D3", name: "A_lexiev_contract.pdf", size: "44 KB", class: "CONFIDENTIAL", preview: "Договор — Бенефициар: Р. Алексиев\nДата: 12.09.2024\nСума: ░░.░░░ EUR\nRef: RF-GATE/CIRCUIT", clue: "A_lexiev_contract.pdf — Бенефициар: Р. Алексиев, дата 12.09.2024" },
  { id: "D4", name: "_chain_ref_node7.bin", size: "0.7 KB", class: "RESTRICTED", preview: "RF-TRACE::NODE7\nChain signature: VALID\nSource: DataCracker6 @ 2024-10-16 00:03", clue: "_chain_ref_node7.bin: RF-TRACE::NODE7, chain signature VALID" },
  { id: "D5", name: "deception_proto_v1.pdf", size: "22.7 KB", class: null, preview: "NullSyndicate Protocol v1 — Decoy injection manual. HOPS=2 decoy confirmed operational." },
  { id: "D6", name: "[REDACTED]_0317.bin", size: "???", class: "CLASSIFIED", preview: "░░░ [REDACTED BY ORDER OF OPERATOR] ░░░" },
]

export default function LeaksDocsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])

  const handleSave = (d: typeof DOCS[number]) => {
    if (!d.clue) return
    const id = `docs-${d.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    saveGameState(addClue(gs, { id, title: `[DOCS] ${d.name}`, text: d.clue, sourceRoute: "/leaks/docs", confidence: 4, status: "confirmed" }))
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>← LEAKS</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="DOCS" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>6 документа. 2 с директни доказателства. Кликни за преглед.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {DOCS.map((d, i) => {
          const id = `docs-${d.id}`
          const isSaved = saved.includes(id)
          const isSelected = selected === d.id
          return (
            <div key={d.id}>
              <motion.div initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                onClick={() => setSelected(isSelected ? null : d.id)}
                style={{ padding: "11px 14px", background: isSelected ? `${ACCENT}07` : "#040404", border: `1px solid ${isSelected ? `${ACCENT}35` : d.clue ? `${ACCENT}18` : "#0f0f0f"}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2200", marginBottom: 3 }}>{d.id}</div>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: isSelected ? ACCENT : d.clue ? "#cccccc" : "#666", fontWeight: d.clue ? 700 : 400 }}>{d.name}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333" }}>{d.size}</div>
                  {d.class && <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2200", marginTop: 2 }}>{d.class}</div>}
                </div>
              </motion.div>
              <AnimatePresence>
                {isSelected && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.17 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", background: "#050400", border: `1px solid ${ACCENT}18`, borderTop: "none" }}>
                      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: d.clue ? "#cccccc" : "#555", lineHeight: 1.8, whiteSpace: "pre-line", marginBottom: d.clue ? 12 : 0 }}>{d.preview}</div>
                      {d.clue && (
                        <>
                          <div style={{ padding: "8px 12px", background: "#0a0800", border: `1px solid ${ACCENT}20`, marginBottom: 10 }}>
                            <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#3a2a00", marginBottom: 3 }}>ДОКАЗАТЕЛСТВО</div>
                            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT }}>{d.clue}</div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleSave(d) }} disabled={isSaved}
                            style={{ background: "transparent", border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`, color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 9, padding: "6px 16px", cursor: isSaved ? "default" : "pointer" }}>
                            {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ (confidence: 4)"}
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
