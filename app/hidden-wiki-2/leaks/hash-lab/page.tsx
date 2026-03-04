"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FFD700"

// HASH-LAB PUZZLE: player enters known values and the system reveals matching identities
const KNOWN_HASHES: Record<string, string> = {
  "rf-gate::token::node7": "IDENTITY: DataCracker6 // Р. Алексиев // Relay: RF-GATE::NODE7",
  "circuit-3::keyshard::1891": "IDENTITY: CIRCUIT-3 // АРХИТЕКТ // Key year: 1891",
  "circuit3": "IDENTITY: CIRCUIT-3 // Р. Алексиев // Role: АРХИТЕКТ",
  "redfox": "IDENTITY: RedFox // Р. Алексиев // Leaks operator: DataCracker6",
  "румен алексиев": "FULL NAME MATCH: Р. Алексиев = RedFox = DataCracker6 = CIRCUIT-3",
  "42.6977": "COORDINATE LAT match: 42.6977°N — Sofia area",
  "23.3219": "COORDINATE LON match: 23.3219°E — Sofia area",
}

export default function LeaksHashLabPage() {
  const [input, setInput] = useState("")
  const [results, setResults] = useState<{ query: string; result: string; ts: string }[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = () => {
    const q = input.trim().toLowerCase()
    if (!q) return
    const match = KNOWN_HASHES[q]
    const result = match ?? "[NO MATCH] — Стойността не е в базата. Опитай с токен или идентичност."
    const ts = new Date().toLocaleTimeString()
    setResults((p) => [{ query: input.trim(), result, ts }, ...p].slice(0, 12))
    if (match) {
      const clueId = `hashlab-${q.replace(/\s/g, "_")}`
      if (!saved.includes(clueId)) {
        const gs = getGameState()
        saveGameState(addClue(gs, { id: clueId, title: `[HASH-LAB] Match: ${input.trim()}`, text: match, sourceRoute: "/leaks/hash-lab", confidence: 5, status: "confirmed" }))
        setSaved((p) => [...p, clueId])
      }
    }
    setInput("")
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>← LEAKS</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="HASH-LAB" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>Верификационна лаборатория. Въведи токен, идентичност или координата за проверка.</div>
      </div>

      <div style={{ padding: "14px 16px", border: `1px solid ${ACCENT}20`, background: "#050400", marginBottom: 20 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2200", letterSpacing: "0.15em", marginBottom: 10 }}>HASH LOOKUP ENGINE v2</div>
        <div style={{ display: "flex", gap: 0 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
            placeholder="Въведи токен / идентичност / координата..."
            style={{ flex: 1, padding: "10px 14px", background: "#030200", border: `1px solid ${ACCENT}30`, borderRight: "none", color: ACCENT, fontFamily: "var(--font-mono)", fontSize: 11, outline: "none", caretColor: ACCENT, letterSpacing: "0.1em" }}
            onFocus={(e) => (e.target.style.borderColor = `${ACCENT}70`)}
            onBlur={(e) => (e.target.style.borderColor = `${ACCENT}30`)}
          />
          <button onClick={handleSearch} style={{ padding: "10px 20px", background: `${ACCENT}18`, border: `1px solid ${ACCENT}40`, color: ACCENT, fontFamily: "var(--font-mono)", fontSize: 12, cursor: "pointer" }}>→</button>
        </div>
        <div style={{ marginTop: 8, fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2200" }}>
          HINT: опитай токените намерени в VAULT или DOCS
        </div>
      </div>

      {/* Results terminal */}
      <div style={{ border: "1px solid #181818", background: "#030200", minHeight: 180 }}>
        <div style={{ padding: "8px 14px", borderBottom: "1px solid #141414", fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2200", letterSpacing: "0.15em" }}>
          RESULTS LOG — {results.length} queries
        </div>
        <div style={{ padding: "10px 0" }}>
          {results.length === 0 && (
            <div style={{ padding: "16px 14px", fontSize: 9, fontFamily: "var(--font-mono)", color: "#1a1a1a" }}>
              Waiting for query...
            </div>
          )}
          <AnimatePresence>
            {results.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                style={{ padding: "8px 14px", borderBottom: "1px solid #0e0e0e" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2200", flexShrink: 0 }}>{r.ts}</span>
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT, flexShrink: 0, minWidth: 140 }}>{r.query}</span>
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: r.result.startsWith("[NO") ? "#333" : "#888", lineHeight: 1.5 }}>{r.result}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {saved.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 9, fontFamily: "var(--font-mono)", color: `${ACCENT}60`, letterSpacing: "0.1em" }}>
          {saved.length} match(es) запазени в Evidence Board
        </div>
      )}
    </div>
  )
}
