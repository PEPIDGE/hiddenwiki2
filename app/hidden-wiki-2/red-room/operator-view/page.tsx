"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"
import { PuzzleGate } from "@/components/tor/puzzle-gate"

const ACCENT = "#FF0033"

const DECOY_TRACE = {
  source: "NullSyndicate",
  hops: 2,
  timezone: "+0100",
  note: "CIRCUIT-TRACE // HOPS:2 — Несъответствие с котва (очакваме 3 хоп). Timezone +0100 ≠ +0200.",
}

const OPERATOR_DATA = {
  callsign: "OP::RED_X",
  active: true,
  lastSeen: "22:17:01",
  route: "Огледален преход — потвърден",
  tokens_required: ["RF-GATE", "КРЪГЪТ"],
  note: "Operatorite не се идентифицират по лице. Само по гласов подпис и routing.",
}

export default function OperatorViewPage() {
  const [gameState, setGameState] = useState<ReturnType<typeof getGameState> | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [showDecoy, setShowDecoy] = useState(false)

  useEffect(() => {
    const gs = getGameState()
    setGameState(gs)
    if (gs.solvedPuzzles.includes("operator-gate")) setUnlocked(true)
  }, [])

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 8, color: "#2a2a2a", fontFamily: "var(--font-mono)", letterSpacing: "0.2em", marginBottom: 6 }}>
          RED ROOM / OPERATOR-VIEW — PUZZLE RR4
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, background: ACCENT, animation: "pulse-glow 2s infinite" }} />
          <div style={{ fontSize: 22, fontFamily: "var(--font-mono)", fontWeight: 700, color: ACCENT, letterSpacing: "0.1em" }}>
            OPERATOR GATE
          </div>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8, opacity: 0.3 }} />
      </div>

      {!unlocked ? (
        <>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#3a3a3a", lineHeight: 1.8, marginBottom: 22, maxWidth: 520 }}>
            Достъпът изисква token от MIRRORS + код от EVENTS.
            Грешните опити генерират decoy trace от NullSyndicate.
          </div>

          {/* Decoy warning */}
          <div
            style={{
              padding: "10px 14px",
              border: "1px solid #FF003320",
              background: "#0a0101",
              marginBottom: 18,
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              color: "#3a3a3a",
              lineHeight: 1.7,
            }}
          >
            <span style={{ color: `${ACCENT}60` }}>! ПРЕДУПРЕЖДЕНИЕ:</span> При 3+ грешни опита системата
            генерира правдоподобен но ФАЛШИВ резултат от NullSyndicate.
            Hops≠3 и Timezone≠+0200 са признаци за decoy.
          </div>

          <PuzzleGate
            puzzleId="operator-gate"
            title="OPERATOR VIEW ACCESS"
            description="Въведи token CIRCUIT-3 (от MIRRORS) + код КРЪГЪТ (от EVENTS). Формат: CIRCUIT-3::КРЪГЪТ"
            hint="Огледалният режим разкрива CIRCUIT-3. Събитията са подредени в ред."
            placeholder="TOKEN::КОД"
            maxAttempts={5}
            cooldownSeconds={90}
            accentColor={ACCENT}
            decoyMessage="TRACE RESULT — NullSyndicate NS-0: Circuit hops=2, TZ=+0100, target unresolved. [DECOY — проверка: hops≠3]"
            onSuccess={(gs) => {
              // This puzzle gate handles its own state — but we only open if truly correct
              return gs // placeholder - real check would be in the gate
            }}
          >
            {/* Content shown after unlock */}
            <OperatorContent />
          </PuzzleGate>

          {/* Show decoy trace if failed */}
          <AnimatePresence>
            {showDecoy && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  border: "1px solid #FF000330",
                  background: "#080101",
                }}
              >
                <div style={{ fontSize: 8, color: "#FF003360", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", marginBottom: 6 }}>
                  TRACE RESULT — {DECOY_TRACE.source}
                </div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333333", lineHeight: 1.7 }}>
                  HOPS: <span style={{ color: "#FF0033" }}>{DECOY_TRACE.hops}</span> / TZ: <span style={{ color: "#FF0033" }}>{DECOY_TRACE.timezone}</span>
                  <br />
                  {DECOY_TRACE.note}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <OperatorContent />
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
        <Link href="/hidden-wiki-2/red-room/chat-replay" style={{ padding: "6px 12px", fontSize: 9, fontFamily: "var(--font-mono)", color: `${ACCENT}50`, textDecoration: "none", border: "1px solid #181818", letterSpacing: "0.1em" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = `${ACCENT}50`)}>
          ← CHAT REPLAY
        </Link>
        <Link href="/hidden-wiki-2/mirrors" style={{ padding: "6px 12px", fontSize: 9, fontFamily: "var(--font-mono)", color: "#00BFFF30", textDecoration: "none", border: "1px solid #181818", letterSpacing: "0.1em" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#00BFFF")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#00BFFF30")}>
          MIRRORS →
        </Link>
      </div>
    </div>
  )
}

function OperatorContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginTop: 8 }}
    >
      <div style={{ display: "flex", gap: 2, marginBottom: 18 }}>
        <div style={{ width: 6, height: 6, background: ACCENT, animation: "pulse-glow 1.5s infinite", marginTop: 2 }} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.1em" }}>
          OPERATOR PROFILE — ACTIVE
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        {[
          { label: "CALLSIGN", value: "OP::RED_X", accent: true },
          { label: "LAST SEEN", value: "22:17:01", accent: false },
          { label: "STATUS", value: "ACTIVE", accent: true },
          { label: "ROUTING", value: "Огледален преход — потвърден", accent: false },
        ].map((item) => (
          <div key={item.label} style={{ padding: "10px 12px", background: "#060606", border: "1px solid #181818" }}>
            <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.15em", marginBottom: 3 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: item.accent ? ACCENT : "#666666", letterSpacing: "0.06em" }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, padding: "10px 12px", border: `1px solid ${ACCENT}20`, background: "#0a0101" }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.12em", marginBottom: 4 }}>
          OPERATOR NOTE
        </div>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444444", lineHeight: 1.7 }}>
          Operatorite не се идентифицират по лице.
          Само по гласов подпис и routing. Виж LEAKS / hash-lab за верификация.
        </div>
      </div>

      {/* Decoy trace embedded */}
      <div style={{ marginTop: 12, padding: "8px 12px", border: "1px solid #FF000318", background: "#070000" }}>
        <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#FF000340", letterSpacing: "0.15em", marginBottom: 3 }}>
          EMBEDDED DECOY TRACE — NullSyndicate
        </div>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#1a1a1a", lineHeight: 1.6 }}>
          HOPS:2 / TZ:+0100 / TARGET:unresolved — [НЕСЪОТВЕТСТВИЕ: очакваме hops=3, TZ=+0200]
        </div>
      </div>
    </motion.div>
  )
}
