"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF3366"

const TRANSACTIONS = [
  {
    id: "TX-0019",
    amount: "€38.400",
    from: "[REDACTED]",
    to: "Виена 1891 // V-1831",
    timestamp: "2024-12-01 03:17",
    method: "CRYPTO",
    anomaly: true,
    clue: "TX-0019: €38.400 към Виена 1891 в 03:17 — свързан с V-1831",
  },
  {
    id: "TX-0020",
    amount: "€2.100",
    from: "NS-0",
    to: "[INTERNAL]",
    timestamp: "2024-11-28 09:00",
    method: "WIRE",
    anomaly: false,
    clue: null,
  },
  {
    id: "TX-0021",
    amount: "€14.750",
    from: "B.ORC Handler",
    to: "CIRCUIT-3",
    timestamp: "2024-11-30 18:30",
    method: "CRYPTO",
    anomaly: true,
    clue: "TX-0021: €14.750 от B.ORC към CIRCUIT-3 в 18:30",
  },
  {
    id: "TX-0022",
    amount: "€500",
    from: "[DECOY]",
    to: "[DECOY]",
    timestamp: "2024-12-02 12:00",
    method: "CASH",
    anomaly: false,
    clue: null,
  },
  {
    id: "TX-0023",
    amount: "€9.900",
    from: "ARS-REFLECT-01",
    to: "calm_voice",
    timestamp: "2024-12-01 22:17",
    method: "CRYPTO",
    anomaly: true,
    clue: "TX-0023: €9.900 от ARS към calm_voice в 22:17",
  },
]

export default function FinancePage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [accessGranted, setAccessGranted] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleAccess = () => {
    if (code.trim().toUpperCase() === "CIRCUIT-3") {
      setAccessGranted(true)
      setError("")
    } else {
      setError("КОД НЕВАЛИДЕН — опитай с токен от MIRRORS")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleSave = (tx: typeof TRANSACTIONS[number]) => {
    if (!tx.clue) return
    const id = `finance-${tx.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id,
      title: `[FINANCE] ${tx.id}`,
      text: tx.clue,
      sourceRoute: "/finance",
      confidence: 5,
      status: "confirmed",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.35em", marginBottom: 8 }}>
            FINANCE — TRANSACTION LEDGER // RESTRICTED ACCESS
          </div>
          <GlitchText text="FINANCE" as="h1" intensity="medium" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ padding: "6px 12px", border: `1px solid ${ACCENT}25`, background: "#0d0008", fontSize: 8, fontFamily: "var(--font-mono)", color: `${ACCENT}60`, letterSpacing: "0.1em" }}>
          {accessGranted ? "ACCESS GRANTED" : "LOCKED — ТРЕБВА ТОКЕН"}
        </div>
      </div>

      {!accessGranted ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: "32px 28px", border: `1px solid ${ACCENT}20`, background: "#060006", maxWidth: 420 }}
        >
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em", marginBottom: 20 }}>
            ACCESS GATE — ФИНАНСОВ АРХИВ
          </div>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#444444", lineHeight: 1.7, marginBottom: 24 }}>
            Тази секция изисква токен. Намери го в{" "}
            <Link href="/hidden-wiki-2/mirrors" style={{ color: "#00BFFF", textDecoration: "none" }}>MIRRORS</Link>{" "}
            или{" "}
            <Link href="/hidden-wiki-2/cult" style={{ color: "#CC44FF", textDecoration: "none" }}>CULT</Link>.
          </div>
          <div style={{ display: "flex", gap: 0, marginBottom: 10 }}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAccess() }}
              placeholder="ВЪВЕДИ ТОКЕН..."
              style={{
                flex: 1, padding: "10px 14px",
                background: "#050005", border: `1px solid ${ACCENT}30`,
                borderRight: "none", color: ACCENT,
                fontFamily: "var(--font-mono)", fontSize: 11,
                letterSpacing: "0.12em", outline: "none",
              }}
            />
            <button onClick={handleAccess} style={{
              padding: "10px 18px", background: `${ACCENT}15`,
              border: `1px solid ${ACCENT}40`, color: ACCENT,
              fontFamily: "var(--font-mono)", fontSize: 10,
              letterSpacing: "0.1em", cursor: "pointer",
            }}>
              →
            </button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.08em" }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333333", lineHeight: 1.8, marginBottom: 24, maxWidth: 540, paddingLeft: 12, borderLeft: "2px solid #200010" }}>
            Финансови транзакции от три оператора. Три са директно свързани с Canon котвите.
            Всяка верифицирана транзакция носи максимална confidence: 5.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 90px 1fr 1fr 120px", gap: 8, padding: "6px 12px", background: "#0a0a0a", borderBottom: "1px solid #181818" }}>
              {["TX ID", "AMOUNT", "FROM", "TO", "TIME"].map((h) => (
                <div key={h} style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em" }}>{h}</div>
              ))}
            </div>

            {TRANSACTIONS.map((tx, i) => {
              const id = `finance-${tx.id}`
              const isSaved = savedClues.includes(id)
              const isExpanded = expanded === tx.id
              return (
                <div key={tx.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => setExpanded(isExpanded ? null : tx.id)}
                    style={{
                      display: "grid", gridTemplateColumns: "80px 90px 1fr 1fr 120px", gap: 8,
                      padding: "10px 12px",
                      background: isExpanded ? `${ACCENT}08` : "#040404",
                      border: `1px solid ${isExpanded ? `${ACCENT}35` : tx.anomaly ? `${ACCENT}15` : "#0e0e0e"}`,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: tx.anomaly ? ACCENT : "#2a2a2a" }}>{tx.id}</div>
                    <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: tx.anomaly ? "#dddddd" : "#444444", fontWeight: tx.anomaly ? 700 : 400 }}>{tx.amount}</div>
                    <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444444" }}>{tx.from}</div>
                    <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: tx.anomaly ? `${ACCENT}80` : "#444444" }}>{tx.to}</div>
                    <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: tx.anomaly ? `${ACCENT}70` : "#333333" }}>{tx.timestamp.split(" ")[1]}</div>
                  </motion.div>

                  <AnimatePresence>
                    {isExpanded && tx.clue && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ padding: "12px 16px", background: "#060003", border: `1px solid ${ACCENT}20`, borderTop: "none" }}>
                          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#3a0015", letterSpacing: "0.12em", marginBottom: 6 }}>ПОТВЪРДЕНА ТРАНЗАКЦИЯ</div>
                          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, marginBottom: 12 }}>{tx.clue}</div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSave(tx) }}
                            disabled={isSaved}
                            style={{
                              background: "transparent", border: `1px solid ${isSaved ? "#222222" : `${ACCENT}40`}`,
                              color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)",
                              fontSize: 9, letterSpacing: "0.1em", padding: "7px 18px", cursor: isSaved ? "default" : "pointer",
                            }}
                          >
                            {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ УЛИКА (confidence: 5)"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
