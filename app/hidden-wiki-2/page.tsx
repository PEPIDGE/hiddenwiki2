"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { GlitchText, TypewriterText } from "@/components/tor/glitch-text"
import { ROUTES_CONFIG, getGameState, type GameState } from "@/lib/game-state"
import { motion, AnimatePresence } from "framer-motion"

const BOOT_LINES = [
  "Инициализиране на TorShell v2.4.1-ALPHA...",
  "Установяване на криптирана сесия — HOPS:3 / TZ:+0200",
  "SIGNAL: 97% | NODE_MAP: loaded | ENTROPY: high",
  "Декриптиране на индекс...",
  "[ГОТОВО] — Добре дошъл в HIDDEN WIKI 2.",
]

export default function HiddenWiki2Page() {
  const [bootLine, setBootLine] = useState(0)
  const [bootDone, setBootDone] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null)

  useEffect(() => {
    setGameState(getGameState())
  }, [])

  useEffect(() => {
    if (bootLine >= BOOT_LINES.length) {
      setTimeout(() => setBootDone(true), 400)
    }
  }, [bootLine])

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      {/* Boot sequence */}
      <AnimatePresence>
        {!bootDone && (
          <motion.div
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: 36 }}
          >
            {BOOT_LINES.slice(0, bootLine + 1).map((line, i) => (
              <div key={i} style={{ marginBottom: 3 }}>
                {i === bootLine ? (
                  <TypewriterText
                    text={`> ${line}`}
                    speed={18}
                    className="text-xs"
                    onComplete={() => {
                      if (i === bootLine) setTimeout(() => setBootLine((l) => l + 1), 160)
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      color: i === 0 ? "#00FF41" : i === 5 ? "#FF0033" : "var(--muted-foreground)",
                    }}
                  >
                    {">"} {line}
                  </div>
                )}
              </div>
            ))}
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
                  fontSize: 8,
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

            {/* Description */}
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "#444444",
                lineHeight: 2,
                maxWidth: 580,
                marginBottom: 36,
                paddingLeft: 12,
                borderLeft: "2px solid #181818",
              }}
            >
              Портал с <span style={{ color: "#d0d0d0" }}>8 независими сайта</span>. Всеки носи улики.
              Само <span style={{ color: "#00FF41" }}>3 потвърдени доказателства</span> отключват
              финалния TRACE-NODE.
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
                          fontSize: 8,
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
                          fontSize: 8,
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

            {/* Progress summary */}
            {gameState && gameState.clues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "14px 16px",
                  border: "1px solid #181818",
                  borderTop: "2px solid #00FF4130",
                }}
              >
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.22em", marginBottom: 10 }}>
                  АКТИВНО РАЗСЛЕДВАНЕ
                </div>
                <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
                  <StatItem label="УЛИКИ" value={gameState.clues.length} color="#00FF41" />
                  <StatItem
                    label="ПОТВЪРДЕНИ"
                    value={gameState.clues.filter((c) => c.status === "confirmed").length}
                    color="#00FF41"
                  />
                  <StatItem label="ПЪЗЕЛИ" value={gameState.solvedPuzzles.length} color="#00BFFF" />
                  <StatItem label="ПРОГРЕС" value={`${gameState.progress}%`} color="#FFD700" />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatItem({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.18em", marginBottom: 2 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          color,
          textShadow: `0 0 12px ${color}30`,
        }}
      >
        {value}
      </div>
    </div>
  )
}
