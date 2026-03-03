"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00BFFF"
const ACCENT_DIM = "#00BFFF30"

const SUBLINKS = [
  { label: "/ INDEX", href: "/hidden-wiki-2/mirrors" },
  { label: "/ GALLERY", href: "/hidden-wiki-2/mirrors/gallery" },
  { label: "/ QUOTES", href: "/hidden-wiki-2/mirrors/quotes" },
  { label: "/ CACHE", href: "/hidden-wiki-2/mirrors/cache" },
]

// Mirror fragments — hidden in the "reflection" grid
// Player must identify which cells are mirrored (anomalous)
const MIRROR_CELLS = [
  { id: 1, row: 0, col: 0, mirror: false, label: "α-01" },
  { id: 2, row: 0, col: 1, mirror: false, label: "α-02" },
  { id: 3, row: 0, col: 2, mirror: true, label: "α-03", fragment: "CIRCUIT-3" },
  { id: 4, row: 0, col: 3, mirror: false, label: "α-04" },
  { id: 5, row: 1, col: 0, mirror: false, label: "β-01" },
  { id: 6, row: 1, col: 1, mirror: true, label: "β-02", fragment: "::ARS" },
  { id: 7, row: 1, col: 2, mirror: false, label: "β-03" },
  { id: 8, row: 1, col: 3, mirror: false, label: "β-04" },
  { id: 9, row: 2, col: 0, mirror: false, label: "γ-01" },
  { id: 10, row: 2, col: 1, mirror: false, label: "γ-02" },
  { id: 11, row: 2, col: 2, mirror: false, label: "γ-03" },
  { id: 12, row: 2, col: 3, mirror: true, label: "γ-04", fragment: "::VOID" },
]

const MIRROR_COUNT = MIRROR_CELLS.filter((c) => c.mirror).length

export default function MirrorsPage() {
  const pathname = usePathname()
  const [selected, setSelected] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const [token, setToken] = useState("")
  const [saved, setSaved] = useState(false)
  const [scanLine, setScanLine] = useState(0)
  const [flicker, setFlicker] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Animated scan line across the mirror grid
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setScanLine((s) => (s + 1) % 3)
    }, 1800)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  // Occasional flicker
  useEffect(() => {
    const iv = setInterval(() => {
      setFlicker(true)
      setTimeout(() => setFlicker(false), 120)
    }, 4000 + Math.random() * 4000)
    return () => clearInterval(iv)
  }, [])

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const allMirrorsFound =
    selected.length === MIRROR_COUNT &&
    MIRROR_CELLS.filter((c) => c.mirror).every((c) => selected.includes(c.id))

  useEffect(() => {
    if (allMirrorsFound && !revealed) {
      setTimeout(() => {
        setRevealed(true)
        const frags = MIRROR_CELLS
          .filter((c) => c.mirror)
          .map((c) => c.fragment)
          .join("")
        setToken(frags)
      }, 600)
    }
  }, [allMirrorsFound, revealed])

  const handleSave = () => {
    if (saved) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id: "mirrors-circuit3",
      title: `Token CIRCUIT-3 (от MIRRORS) — ${token}`,
      text: "Три огледални клетки в рефлекторната мрежа съдържат разпределен токен. Фрагменти: CIRCUIT-3 + ::ARS + ::VOID. Пълен токен: CIRCUIT-3::ARS::VOID. Необходим за OPERATOR VIEW.",
      sourceRoute: "/mirrors",
      confidence: 4,
      status: "unverified",
    })
    saveGameState(updated)
    setSaved(true)
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.35em", marginBottom: 8 }}>
            MIRRORS — AURUM RELIC SOCIETY // NODE: ARS-REFLECT
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 10, height: 10,
              background: flicker ? ACCENT : "transparent",
              border: `1px solid ${ACCENT}`,
              transition: "background 0.05s",
              boxShadow: `0 0 ${flicker ? 12 : 4}px ${ACCENT}${flicker ? "80" : "30"}`,
            }} />
            <GlitchText
              text="MIRRORS"
              as="h1"
              intensity="low"
              className="text-3xl font-bold tracking-widest"
              color={ACCENT}
            />
          </div>
        </div>

        {/* ARS badge */}
        <div style={{ padding: "8px 14px", border: `1px solid ${ACCENT}20`, background: "#030810", fontSize: 9, fontFamily: "var(--font-mono)", color: `${ACCENT}60`, letterSpacing: "0.12em" }}>
          [ARS] — Aurum Relic Society<br />
          <span style={{ color: "#1a2a2a", fontSize: 8 }}>артефакти / огледала / деception</span>
        </div>
      </div>

      {/* Sublink nav */}
      <div style={{ display: "flex", gap: 1, marginBottom: 28, background: "#0a0a0a", flexWrap: "wrap" }}>
        {SUBLINKS.map((link) => {
          const isCurrent = pathname === link.href
          return (
            <Link
              key={link.label}
              href={link.href}
              style={{
                padding: "7px 14px",
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                color: isCurrent ? ACCENT : "#333333",
                letterSpacing: "0.12em",
                textDecoration: "none",
                background: isCurrent ? `${ACCENT}10` : "#070707",
                border: `1px solid ${isCurrent ? `${ACCENT}40` : "#181818"}`,
                borderBottom: isCurrent ? `2px solid ${ACCENT}` : "1px solid #181818",
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.color = ACCENT }}
              onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.color = "#333333" }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* MR1 — Mirror Grid Puzzle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em" }}>
            PUZZLE MR1 — REFLECTION GRID
          </div>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: allMirrorsFound ? "#00FF41" : "#2a2a2a", letterSpacing: "0.1em" }}>
            {selected.length}/{MIRROR_COUNT} ОГЛЕДАЛА
          </div>
        </div>

        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#2a2a2a", lineHeight: 1.7, marginBottom: 14, maxWidth: 540 }}>
          Три клетки в мрежата са "огледала" — те отразяват фрагменти от токен.
          Открий ги и ги избери. Подсказка: огледалата имат различна текстура.
        </div>

        {/* The grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, marginBottom: 14, position: "relative" }}>
          {/* Scan line overlay */}
          <motion.div
            style={{
              position: "absolute",
              left: 0, right: 0,
              height: "33.33%",
              top: `${scanLine * 33.33}%`,
              background: `linear-gradient(180deg, transparent, ${ACCENT}06, transparent)`,
              pointerEvents: "none",
              zIndex: 1,
              transition: "top 0.6s ease",
            }}
          />
          {MIRROR_CELLS.map((cell) => {
            const isSelected = selected.includes(cell.id)
            return (
              <motion.div
                key={cell.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggle(cell.id)}
                style={{
                  background: isSelected
                    ? `${ACCENT}12`
                    : cell.mirror
                    ? "#04090f"
                    : "#060606",
                  border: `1px solid ${isSelected ? `${ACCENT}60` : cell.mirror ? `${ACCENT}18` : "#0f0f0f"}`,
                  padding: "14px 10px",
                  cursor: "pointer",
                  position: "relative",
                  boxShadow: isSelected ? `0 0 14px ${ACCENT}20` : "none",
                  transition: "box-shadow 0.2s",
                }}
              >
                {/* Cell label */}
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: isSelected ? ACCENT : "#1a1a1a", marginBottom: 8 }}>
                  {cell.label}
                </div>

                {/* Cell content */}
                <div style={{
                  height: 44,
                  position: "relative",
                  overflow: "hidden",
                  background: cell.mirror
                    ? `repeating-linear-gradient(120deg, #040c14, #040c14 2px, #030911 2px, #030911 9px)`
                    : "#030303",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {cell.mirror && (
                    <div style={{
                      fontSize: revealed ? 10 : 9,
                      fontFamily: "var(--font-mono)",
                      color: revealed && isSelected ? ACCENT : isSelected ? `${ACCENT}70` : `${ACCENT}20`,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      transition: "color 0.3s",
                    }}>
                      {revealed && isSelected ? cell.fragment : "///"}
                    </div>
                  )}
                  {!cell.mirror && (
                    <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#0f0f0f" }}>
                      {`${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`}
                    </div>
                  )}
                  {/* Mirror shimmer */}
                  {cell.mirror && (
                    <div style={{
                      position: "absolute", inset: 0, pointerEvents: "none",
                      background: `linear-gradient(135deg, transparent 40%, ${ACCENT}08 50%, transparent 60%)`,
                    }} />
                  )}
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div style={{
                    position: "absolute", top: 4, right: 4, width: 6, height: 6,
                    background: ACCENT, boxShadow: `0 0 6px ${ACCENT}`,
                  }} />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div style={{ padding: "10px 14px", border: `1px solid ${allMirrorsFound ? `${ACCENT}40` : "#1a1a1a"}`, background: "#04080c", transition: "border-color 0.4s" }}>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: allMirrorsFound ? ACCENT : "#333333", letterSpacing: "0.1em", marginBottom: 6 }}>
            ОГЛЕДАЛНИ ФРАГМЕНТИ: {selected.filter((id) => MIRROR_CELLS.find((c) => c.id === id)?.mirror).length} / {MIRROR_COUNT}
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {[...Array(MIRROR_COUNT)].map((_, i) => {
              const foundCount = selected.filter((id) => MIRROR_CELLS.find((c) => c.id === id)?.mirror).length
              return (
                <div key={i} style={{
                  flex: 1, height: 3,
                  background: i < foundCount ? ACCENT : "#1a1a1a",
                  boxShadow: i < foundCount ? `0 0 6px ${ACCENT}` : "none",
                  transition: "background 0.3s",
                }} />
              )
            })}
          </div>
        </div>

        {/* Revealed token */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 12, padding: "14px 16px", border: `1px solid ${ACCENT}40`, background: "#030c14" }}
            >
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a4a5a", letterSpacing: "0.15em", marginBottom: 8 }}>
                [MR1 SOLVED] — TOKEN ASSEMBLED
              </div>
              <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.2em", fontWeight: 700, marginBottom: 10, textShadow: `0 0 20px ${ACCENT}40` }}>
                {token}
              </div>
              <button
                onClick={handleSave}
                disabled={saved}
                style={{
                  background: "transparent", border: `1px solid ${ACCENT}60`,
                  color: saved ? "#333333" : ACCENT, fontFamily: "var(--font-mono)",
                  fontSize: 10, letterSpacing: "0.1em", padding: "8px 20px",
                  cursor: saved ? "not-allowed" : "pointer",
                }}
              >
                {saved ? "ТОКЕН ЗАПИСАН В EVIDENCE BOARD" : `ЗАПАЗИ ТОКЕН → ${token}`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* MR2 — ARS Deception panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ padding: "16px 18px", border: "1px solid #181818", background: "#030608", marginBottom: 28, position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: 4, left: 4, width: 10, height: 10, borderTop: `1px solid ${ACCENT}20`, borderLeft: `1px solid ${ACCENT}20` }} />
        <div style={{ position: "absolute", bottom: 4, right: 4, width: 10, height: 10, borderBottom: `1px solid ${ACCENT}20`, borderRight: `1px solid ${ACCENT}20` }} />

        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em", marginBottom: 12 }}>
          PUZZLE MR2 — ARS DECEPTION LAYER
        </div>

        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#333333", lineHeight: 1.9, maxWidth: 580 }}>
          Aurum Relic Society поддържа <span style={{ color: `${ACCENT}80` }}>огледални сайтове</span> — идентични копия на легитимни ноди,
          но с обърнати данни. Всяко огледало съдържа <span style={{ color: `${ACCENT}80` }}>инвертиран routing</span>.
        </div>

        {/* ARS signals */}
        <div style={{ display: "flex", gap: 2, marginTop: 14, flexWrap: "wrap" }}>
          {[
            { label: "ARS-REFLECT-01", status: "ACTIVE", hop: 3 },
            { label: "ARS-REFLECT-02", status: "DEGRADED", hop: 2 },
            { label: "ARS-REFLECT-03", status: "OFFLINE", hop: 0 },
          ].map((node) => (
            <div key={node.label} style={{
              flex: 1, minWidth: 160, padding: "10px 12px",
              background: "#040608", border: `1px solid ${node.status === "ACTIVE" ? `${ACCENT}20` : "#111111"}`,
            }}>
              <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.12em", marginBottom: 4 }}>
                {node.label}
              </div>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: node.status === "ACTIVE" ? ACCENT : node.status === "DEGRADED" ? "#FFD70060" : "#222222", letterSpacing: "0.08em" }}>
                {node.status}
              </div>
              <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#1a1a1a", marginTop: 2 }}>
                HOPS: {node.hop}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10, fontSize: 8, fontFamily: "var(--font-mono)", color: "#1e1e1e", letterSpacing: "0.06em" }}>
          [Само ARS-REFLECT-01 с hop=3 е реален. Останалите са decoy.]
        </div>
      </motion.div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/hidden-wiki-2/mirrors/gallery" style={{ padding: "7px 14px", fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT_DIM, textDecoration: "none", border: "1px solid #181818", letterSpacing: "0.1em", transition: "all 0.12s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = `${ACCENT}40` }}
          onMouseLeave={(e) => { e.currentTarget.style.color = ACCENT_DIM; e.currentTarget.style.borderColor = "#181818" }}>
          GALLERY →
        </Link>
        <Link href="/hidden-wiki-2/mirrors/quotes" style={{ padding: "7px 14px", fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT_DIM, textDecoration: "none", border: "1px solid #181818", letterSpacing: "0.1em", transition: "all 0.12s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = `${ACCENT}40` }}
          onMouseLeave={(e) => { e.currentTarget.style.color = ACCENT_DIM; e.currentTarget.style.borderColor = "#181818" }}>
          QUOTES →
        </Link>
        <Link href="/hidden-wiki-2/mirrors/cache" style={{ padding: "7px 14px", fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT_DIM, textDecoration: "none", border: "1px solid #181818", letterSpacing: "0.1em", transition: "all 0.12s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = `${ACCENT}40` }}
          onMouseLeave={(e) => { e.currentTarget.style.color = ACCENT_DIM; e.currentTarget.style.borderColor = "#181818" }}>
          CACHE →
        </Link>
        <Link href="/hidden-wiki-2/red-room" style={{ padding: "7px 14px", fontSize: 9, fontFamily: "var(--font-mono)", color: "#FF003330", textDecoration: "none", border: "1px solid #181818", letterSpacing: "0.1em", transition: "all 0.12s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#FF0033"; e.currentTarget.style.borderColor = "#FF003340" }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#FF003330"; e.currentTarget.style.borderColor = "#181818" }}>
          ← RED ROOM
        </Link>
      </div>
    </div>
  )
}
