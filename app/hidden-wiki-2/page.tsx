"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { ROUTES_CONFIG, getGameState, type GameState } from "@/lib/game-state"
import { motion, AnimatePresence } from "framer-motion"
import type { CSSProperties } from "react"
import s from "./hub.module.css"

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
    <div className={s.page}>
      <AnimatePresence>
        {!bootDone && (
          <motion.div exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className={s.term}>
            <div className={s.termBar}>
              <i />
              <i />
              <i />
              <span>TERMINAL — BOOT SEQUENCE</span>
            </div>
            <div className={s.termBody}>
              {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.12 }}
                  className={s.line}
                  style={line.color ? { color: line.color } : undefined}
                >
                  {line.text}
                </motion.div>
              ))}
              {visibleLines < BOOT_LINES.length && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                  className={s.cursor}
                >
                  █
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bootDone && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <header className={s.hero}>
              <div className={s.bgWord} aria-hidden>
                TOR
              </div>
              <div className={s.kicker}>HIDDEN WIKI 2 — ESCAPE ROOM // SESSION ACTIVE</div>
              <GlitchText text="HIDDEN WIKI 2" as="h1" intensity="medium" className={s.title} />
              <div className={s.divider}>
                <i />
                <i />
                <i />
              </div>
            </header>

            <div className={s.grid}>
              {ROUTES_CONFIG.map((route, idx) => {
                const unlocked = gameState
                  ? !route.locked || gameState.unlockedRoutes.includes(route.path)
                  : !route.locked

                return (
                  <Link
                    key={route.id}
                    href={unlocked ? route.path : "#"}
                    className={s.portal}
                    data-locked={unlocked ? undefined : ""}
                    style={{ "--accent": route.accentColor } as CSSProperties}
                  >
                    <div className={s.top}>
                      <span className={s.idx}>{String(idx + 1).padStart(2, "0")}</span>
                      <span className={s.status}>{route.status}</span>
                    </div>
                    <div className={s.label}>{route.locked && !unlocked ? "[LOCKED]" : route.label}</div>
                    {route.sublinks.length > 0 && (
                      <div className={s.subs}>
                        {route.sublinks.map((sub) => (
                          <span key={sub}>{sub}</span>
                        ))}
                      </div>
                    )}
                    <div className={s.foot}>
                      <span>
                        {route.sublinks.length} NODES
                        {route.locked && !unlocked && <b> — ИЗИСКВА УЛИКИ</b>}
                      </span>
                      <span className={s.arrow}>→</span>
                    </div>
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
