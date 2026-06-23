"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { ROUTES_CONFIG, getGameState, type GameState } from "@/lib/game-state"
import { motion, AnimatePresence } from "framer-motion"

const BOOT_LINES: { text: string; delay: number; color?: string }[] = [
  { text: "$ ./boot_hidden_wiki2.sh --session=new --hops=3", delay: 0, color: "#00FF41" },
  { text: "  [OK] Establishing encrypted relay...", delay: 320 },
  { text: "  [OK] Loading node map: 7 nodes found", delay: 560 },
  { text: "  [OK] Entropy pool: HIGH (512bit)", delay: 760 },
  { text: "  [OK] Session token: " + Math.random().toString(36).slice(2, 10).toUpperCase(), delay: 940 },
  { text: "  [!!] 2 anomalous transactions in ledger", delay: 1180, color: "#FF0033" },
  { text: "  [OK] Evidence index decrypted — Лора Костова / 15.10.2025", delay: 1380 },
  { text: "$ HIDDEN WIKI 2 — ready. 8 portals online.", delay: 1600, color: "#00FF41" },
]

export default function HiddenWiki2Page() {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [bootDone, setBootDone] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null)

  useEffect(() => {
    setGameState(getGameState())
  }, [])

  useEffect(() => {
    if (visibleLines >= BOOT_LINES.length) {
      const t = setTimeout(() => setBootDone(true), 500)
      return () => clearTimeout(t)
    }
    const line = BOOT_LINES[visibleLines]
    const t = setTimeout(() => setVisibleLines((n) => n + 1), visibleLines === 0 ? 80 : 220 + Math.random() * 80)
    return () => clearTimeout(t)
  }, [visibleLines])

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      {/* Boot sequence */}
      <AnimatePresence>
        {!bootDone && (
          <motion.div
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{
              marginBottom: 36,
              padding: "18px 20px",
              background: "#020202",
              border: "1px solid #151515",
              borderTop: "2px solid #00FF4120",
            }}
          >
            <div style={{
              fontSize: 9, fontFamily: "var(--font-mono)", color: "#1a2a1a",
              letterSpacing: "0.25em", marginBottom: 14,
            }}>
              TERMINAL — BOOT SEQUENCE
            </div>
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12 }}
                style={{
                  fontSize: 11, fontFamily: "var(--font-mono)",
                  color: line.color ?? "#2e2e2e",
                  lineHeight: 1.9, letterSpacing: "0.04em",
                }}
              >
                {line.text}
              </motion.div>
            ))}
            {visibleLines < BOOT_LINES.length && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                style={{ color: "#00FF41", fontFamily: "var(--font-mono)", fontSize: 13 }}
              >█</motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence>
        {bootDone && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Hero header */}
            <div style={{ marginBottom: 36, position: "relative" }}>
              {/* Background text */}
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  right: 0,
                  fontSize: 80,
                  fontFamily: "var(--font-mono)",
                  color: "#00FF41",
                  opacity: 0.025,
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                  userSelect: "none",
                  pointerEvents: "none",
                  lineHeight: 1,
                }}
              >
                TOR
              </div>

              <div
                style={{
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                  color: "#2a2a2a",
                  letterSpacing: "0.35em",
                  marginBottom: 10,
                }}
              >
                HIDDEN WIKI 2 — ESCAPE ROOM // SESSION ACTIVE
              </div>

              <GlitchText
                text="HIDDEN WIKI 2"
                as="h1"
                intensity="medium"
                className="text-5xl font-bold tracking-widest"
                color="#00FF41"
              />

              {/* Brutal divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 10 }}>
                <div style={{ height: 2, width: 60, background: "#00FF41", opacity: 0.8 }} />
                <div style={{ height: 1, flex: 1, background: "#181818" }} />
                <div style={{ height: 2, width: 12, background: "#FF0033", opacity: 0.6, marginLeft: 2 }} />
              </div>
            </div>

            {/* Site grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 1,
                background: "#181818",
                border: "1px solid #181818",
                marginBottom: 32,
              }}
            >
              {ROUTES_CONFIG.map((route, idx) => {
                const unlocked = gameState
                  ? !route.locked || gameState.unlockedRoutes.includes(route.path)
                  : !route.locked
                const isHovered = hoveredRoute === route.id

                return (
                  <Link
                    key={route.id}
                    href={unlocked ? route.path : "#"}
                    style={{ textDecoration: "none" }}
                    onMouseEnter={() => setHoveredRoute(route.id)}
                    onMouseLeave={() => setHoveredRoute(null)}
                  >
                    <motion.div
                      animate={{
                        background: isHovered && unlocked ? `${route.accentColor}0e` : "#030303",
                      }}
                      transition={{ duration: 0.15 }}
                      style={{
                        padding: "18px 20px",
                        position: "relative",
                        overflow: "hidden",
                        cursor: unlocked ? "pointer" : "not-allowed",
                        minHeight: 100,
                      }}
                    >
                      {/* Top accent bar */}
                      <motion.div
                        style={{
                          position: "absolute",
                          top: 0, left: 0, right: 0,
                          height: 2,
                          background: unlocked ? route.accentColor : "#111111",
                        }}
                        animate={{
                          boxShadow: isHovered && unlocked
                            ? `0 0 16px ${route.accentColor}80`
                            : "none",
                          opacity: isHovered ? 1 : unlocked ? 0.7 : 0.2,
                        }}
                        transition={{ duration: 0.2 }}
                      />

                      {/* Index */}
                      <div
                        style={{
                          position: "absolute",
                          top: 8, right: 10,
                          fontSize: 9,
                          fontFamily: "var(--font-mono)",
                          color: "#181818",
                        }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </div>

                      {/* Status */}
                      <div
                        style={{
                          fontSize: 7,
                          fontFamily: "var(--font-mono)",
                          color: unlocked ? route.accentColor : "#2a2a2a",
                          letterSpacing: "0.22em",
                          marginBottom: 7,
                          marginTop: 4,
                        }}
                      >
                        {route.status}
                      </div>

                      {/* Label */}
                      <div
                        style={{
                          fontSize: 20,
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          color: unlocked ? route.accentColor : "#1e1e1e",
                          letterSpacing: "0.08em",
                          marginBottom: 8,
                          textShadow: isHovered && unlocked
                            ? `0 0 24px ${route.accentColor}50`
                            : "none",
                          transition: "text-shadow 0.2s",
                        }}
                      >
                        {route.locked && !unlocked ? "[LOCKED]" : route.label}
                      </div>

                      {/* Sublinks count */}
                      <div
                        style={{
                          fontSize: 9,
                          fontFamily: "var(--font-mono)",
                          color: "#282828",
                        }}
                      >
                        {route.sublinks.length} NODES
                        {route.locked && !unlocked && (
                          <span style={{ color: "#FF003340", marginLeft: 8 }}>
                            — ИЗИСКВА УЛИКИ
                          </span>
                        )}
                      </div>

                      {/* Hover scan line */}
                      {isHovered && unlocked && (
                        <motion.div
                          initial={{ top: "0%" }}
                          animate={{ top: "100%" }}
                          transition={{ duration: 0.6, ease: "linear" }}
                          style={{
                            position: "absolute",
                            left: 0, right: 0, height: 1,
                            background: `linear-gradient(90deg, transparent, ${route.accentColor}40, transparent)`,
                            pointerEvents: "none",
                          }}
                        />
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
