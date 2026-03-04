"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FFD700"

const VAULT_FILES = [
  { id: "V1", name: "omegaprot_partial.enc", size: "12.4 KB", class: "CONFIDENTIAL", status: "ENCRYPTED", preview: null },
  { id: "V2", name: "rf_gate_token.txt", size: "0.1 KB", class: "CLASSIFIED", status: "READABLE", preview: "RF-GATE::TOKEN::NODE7", clue: "rf_gate_token.txt: RF-GATE::TOKEN::NODE7 — ключов токен" },
  { id: "V3", name: "circuit3_keyshard.txt", size: "0.1 KB", class: "CONFIDENTIAL", status: "READABLE", preview: "CIRCUIT-3::KEYSHARD::1891", clue: "circuit3_keyshard.txt: CIRCUIT-3::KEYSHARD::1891" },
]

export default function LeaksVaultPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])

  const handleSave = (f: typeof VAULT_FILES[number]) => {
    if (!("clue" in f) || !f.clue) return
    const id = `vault-${f.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    saveGameState(addClue(gs, { id, title: `[VAULT] ${f.name}`, text: f.clue, sourceRoute: "/leaks/vault", confidence: 5, status: "confirmed" }))
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>← LEAKS</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="VAULT" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>Защитен трезор — 2 четими файла с токени. 1 криптиран.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {VAULT_FILES.map((f, i) => {
          const id = `vault-${f.id}`
          const isSaved = saved.includes(id)
          const isSelected = selected === f.id
          return (
            <div key={f.id}>
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                onClick={() => setSelected(isSelected ? null : f.id)}
                style={{ padding: "12px 16px", background: isSelected ? `${ACCENT}08` : "#040404", border: `1px solid ${isSelected ? `${ACCENT}40` : f.status === "READABLE" ? `${ACCENT}18` : "#111"}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2200", marginBottom: 4 }}>{f.id} // {f.class}</div>
                  <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: isSelected ? ACCENT : "#888", fontWeight: 700 }}>{f.name}</div>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333", marginTop: 2 }}>{f.size}</div>
                </div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: f.status === "READABLE" ? "#00FF41" : "#FF6B00" }}>{f.status}</div>
              </motion.div>
              <AnimatePresence>
                {isSelected && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.16 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", background: "#050400", border: `1px solid ${ACCENT}20`, borderTop: "none" }}>
                      {f.status === "ENCRYPTED" && (
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#FF6B00" }}>▓▒░ ENCRYPTED — KEY REQUIRED ░▒▓</div>
                      )}
                      {f.status === "READABLE" && "preview" in f && f.preview && (
                        <>
                          <div style={{ padding: "8px 12px", background: "#0a0800", border: `1px solid ${ACCENT}20`, marginBottom: 10, fontFamily: "var(--font-mono)", fontSize: 13, color: ACCENT, letterSpacing: "0.15em" }}>
                            {f.preview}
                          </div>
                          {"clue" in f && f.clue && (
                            <button onClick={(e) => { e.stopPropagation(); handleSave(f) }} disabled={isSaved}
                              style={{ background: "transparent", border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`, color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 9, padding: "6px 16px", cursor: isSaved ? "default" : "pointer" }}>
                              {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ ТОКЕН"}
                            </button>
                          )}
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
