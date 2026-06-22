"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GlitchText } from "@/components/tor/glitch-text"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF41"

const BENEFICIARIES = [
  { id: "ben-1", name: "NightKiller (Д. Михайлов)", alias: "Транспорт",    total: "€3.200",  count: 1, confirmed: true,  clue: "NightKiller получи €3.200 за 'транспорт' на 14.10 — ден преди операцията. Телефон: +359 88 412 1221" },
  { id: "ben-2", name: "Захарна фабрика",            alias: "Наем",         total: "€12.000", count: 1, confirmed: true,  clue: "Захарна фабрика — наета от Братство за €12.000 от 01.10.2025. Западно крило, стая 9" },
  { id: "ben-3", name: "Аптека Витал",               alias: "Доставчик",    total: "€430",    count: 2, confirmed: true,  clue: "Аптека Витал — две продажби на тетрабеназин без рецепта към Р. Алексиев (€250 + €180)" },
  { id: "ben-4", name: "Shell, ул. Бенковски",       alias: "Зареждане",    total: "€85",     count: 1, confirmed: false, clue: null },
  { id: "ben-5", name: "[INTERNAL]",                 alias: "Неизвестен",   total: "€700",    count: 1, confirmed: false, clue: null },
]

export default function FinanceBeneficiariesPage() {
  const [saved, setSaved] = useState<string[]>([])

  useEffect(() => setSaved(getGameState().clues.map((c) => c.id)), [])

  const handleSave = (b: typeof BENEFICIARIES[0]) => {
    if (!b.clue) return
    const id = `finance-ben-${b.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, { id, title: `[BENEFICIARY] ${b.name}`, text: b.clue, sourceRoute: "/hidden-wiki-2/finance", confidence: 5, status: "confirmed" })
    saveGameState(updated)
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#2a0015", letterSpacing: "0.35em", marginBottom: 8 }}>FINANCE // BENEFICIARIES</div>
        <GlitchText text="BENEFICIARY INDEX" as="h1" intensity="low" color={ACCENT} className="text-2xl font-bold tracking-widest" />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}40, transparent)`, marginTop: 10 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {BENEFICIARIES.map((b, i) => {
          const id = `finance-ben-${b.id}`
          const isSaved = saved.includes(id)
          return (
            <motion.div key={b.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 100px", gap: 12, padding: "12px 16px", border: `1px solid ${b.confirmed ? `${ACCENT}25` : "#111"}`, background: b.confirmed ? `${ACCENT}05` : "#030303", alignItems: "center" }}
            >
              <div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: b.confirmed ? ACCENT : "#999999", fontWeight: 700, marginBottom: 2 }}>{b.name}</div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333" }}>{b.alias}</div>
              </div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: b.confirmed ? "#ddd" : "#444", fontWeight: 700 }}>{b.total}</div>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333" }}>{b.count} TX</div>
              <div>
                {b.clue && (
                  <button onClick={() => handleSave(b)} disabled={isSaved} style={{
                    background: "transparent", border: `1px solid ${isSaved ? "#1a1a1a" : `${ACCENT}40`}`,
                    color: isSaved ? "#2a2a2a" : ACCENT,
                    fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em",
                    padding: "5px 10px", cursor: isSaved ? "default" : "pointer",
                  }}>
                    {isSaved ? "SAVED" : "+ CLUE"}
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
