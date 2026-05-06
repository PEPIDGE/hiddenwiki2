"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GlitchText } from "@/components/tor/glitch-text"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF3366"

const ANOMALIES = [
  {
    id: "anom-1",
    code: "ANM-501",
    type: "REPEATED PURCHASE",
    description: "Р. Алексиев купи тетрабеназин два пъти от Аптека Витал — без рецепта. TX-2501 (09.05) и TX-2502 (10.10).",
    evidence: "Тетрабеназинът е лекарство за потискане на волевото движение — без рецепта е незаконно.",
    confidence: 5,
    clue: "ANM-501: Р. Алексиев — два пъти тетрабеназин без рецепта от Аптека Витал (09.05 и 10.10)",
  },
  {
    id: "anom-2",
    code: "ANM-502",
    type: "LOCATION + TIME OVERLAP",
    description: "Shell зареждане от Р. Алексиев в 22:07 на 15.10 — 800м от дома на Лора. Лора изчезна в 22:12.",
    evidence: "5 минути разлика. Черен Audi A3 засечен в 22:09 пред бл. 14.",
    confidence: 5,
    clue: "ANM-502: Р. Алексиев на 800м от Лора в 22:07 — Лора изчезва в 22:12. Audi засечен в 22:09",
  },
  {
    id: "anom-3",
    code: "ANM-503",
    type: "PAYMENT BEFORE OPERATION",
    description: "Братство плати €3.200 на NightKiller за 'транспорт' на 14.10 — деня преди операцията (15.10).",
    evidence: "NightKiller е регистриран собственик на черен Audi A3 с телефон +359 88 412 1221.",
    confidence: 4,
    clue: "ANM-503: Братство платило транспорт на NightKiller ден преди изчезването на Лора",
  },
  {
    id: "anom-4",
    code: "ANM-504",
    type: "FACILITY RENTAL",
    description: "Братство наело Захарна фабрика за €12.000 от 01.10 — 2 седмици преди операцията.",
    evidence: "Западно крило, стая 9 — телефонът на Лора намерен там на 17.10.",
    confidence: 4,
    clue: "ANM-504: Братство наело Захарна фабрика за €12.000 от 01.10 — Лора намерена там",
  },
]

export default function FinanceAnomaliesPage() {
  const [saved, setSaved] = useState<string[]>([])

  useEffect(() => {
    setSaved(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (a: typeof ANOMALIES[0]) => {
    const id = `finance-anom-${a.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[ANOMALY] ${a.code}`,
      text: a.clue, sourceRoute: "/hidden-wiki-2/finance",
      confidence: a.confidence, status: "confirmed",
    })
    saveGameState(updated)
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#2a0015", letterSpacing: "0.35em", marginBottom: 8 }}>FINANCE // ANOMALIES</div>
        <GlitchText text="ANOMALY REPORT" as="h1" intensity="medium" color={ACCENT} className="text-2xl font-bold tracking-widest" />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}40, transparent)`, marginTop: 10 }} />
      </div>
      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", lineHeight: 1.8, marginBottom: 24, borderLeft: "2px solid #2a0010", paddingLeft: 14 }}>
        4 транзакции показват аномалии свързани с операцията по изчезването на Лора. Всяка потвърдена аномалия носи clue с confidence 4-5.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {ANOMALIES.map((a, i) => {
          const id = `finance-anom-${a.id}`
          const isSaved = saved.includes(id)
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ padding: "16px 20px", border: `1px solid ${isSaved ? `${ACCENT}30` : "#141414"}`, background: isSaved ? `${ACCENT}05` : "#030303" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.15em", marginBottom: 4 }}>{a.type}</div>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, fontWeight: 700, letterSpacing: "0.06em" }}>{a.code}</div>
                </div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.1em" }}>
                  CONF: {a.confidence}/5
                </div>
              </div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#999999", lineHeight: 1.7, marginBottom: 8 }}>{a.description}</div>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", borderLeft: `2px solid ${ACCENT}30`, paddingLeft: 10, marginBottom: 12 }}>{a.evidence}</div>
              <button onClick={() => handleSave(a)} disabled={isSaved} style={{
                background: "transparent", border: `1px solid ${isSaved ? "#1a1a1a" : `${ACCENT}40`}`,
                color: isSaved ? "#2a2a2a" : ACCENT,
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em",
                padding: "6px 16px", cursor: isSaved ? "default" : "pointer",
              }}>
                {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ УЛИКА"}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
