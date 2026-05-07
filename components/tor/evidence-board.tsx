"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getGameState, CANON_ANCHORS, type Clue, type GameState } from "@/lib/game-state"
import { motion, AnimatePresence } from "framer-motion"

function clueColor(sourceRoute: string): string {
  if (sourceRoute.includes("red-room")) return "#FF0033"
  if (sourceRoute.includes("leaks")) return "#FFD700"
  if (sourceRoute.includes("cult")) return "#CC44FF"
  if (sourceRoute.includes("events")) return "#FF6B00"
  if (sourceRoute.includes("forum")) return "#00FF9F"
  if (sourceRoute.includes("finance")) return "#FF3366"
  if (sourceRoute.includes("getrich")) return "#00FF41"
  if (sourceRoute.includes("trace-node")) return "#00FF41"
  return "#CC44FF"
}

export function EvidenceBoard() {
  const [state, setState] = useState<GameState | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setState(getGameState())
    const interval = setInterval(() => setState(getGameState()), 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <aside
      style={{
        width: collapsed ? 28 : 230,
        minWidth: collapsed ? 28 : 230,
        background: "var(--panel-bg)",
        borderLeft: "1px solid var(--panel-border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: collapsed ? "hidden" : "auto",
        flexShrink: 0,
        transition: "width 0.22s ease, min-width 0.22s ease",
        position: "relative",
      }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand evidence board" : "Collapse evidence board"}
        style={{
          position: "absolute",
          top: 10,
          left: collapsed ? "50%" : "auto",
          right: collapsed ? "auto" : 10,
          transform: collapsed ? "translateX(-50%)" : "none",
          background: "transparent",
          border: "none",
          color: "#333333",
          cursor: "pointer",
          fontSize: 10,
          fontFamily: "var(--font-mono)",
          zIndex: 10,
          padding: 2,
          letterSpacing: "0.05em",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#00FF41")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#777777")}
      >
        {collapsed ? "â–¶" : "â—€"}
      </button>

      {!collapsed && (
        <>
          {/* Header */}
          <div
            style={{
              padding: "10px 12px",
              paddingTop: 32,
              borderBottom: "1px solid var(--panel-border)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#909090",
                letterSpacing: "0.22em",
                marginBottom: 8,
              }}
            >
              EVIDENCE BOARD
            </div>
          </div>

          {/* Clues */}
          <div style={{ flex: 1, padding: "6px 0" }}>
            {!state?.clues.length ? (
              <div style={{ padding: "20px 12px", textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "#707070",
                    letterSpacing: "0.12em",
                    lineHeight: 2.2,
                  }}
                >
                  ÐÐ•Ð¢ Ð£Ð›Ð˜ÐšÐ˜
                  <br />
                  ÐÐÐ§ÐÐ˜ Ð ÐÐ—Ð¡Ð›Ð•Ð”Ð’ÐÐÐ•Ð¢Ðž
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    padding: "3px 12px 6px",
                    fontSize: 10,
                    color: "#909090",
                    letterSpacing: "0.18em",
                  }}
                >
                  Ð£Ð›Ð˜ÐšÐ˜ [{state.clues.length}]
                </div>
                <AnimatePresence>
                  {state.clues.map((clue) => {
                    const color = clueColor(clue.sourceRoute)
                    return (
                    <motion.div
                      key={clue.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => router.push(clue.sourceRoute)}
                      style={{
                        padding: "7px 12px",
                        borderLeft: `2px solid ${color}`,
                        margin: "1px 0",
                        cursor: "pointer",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = `${color}12`)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          color: color,
                          marginBottom: 2,
                          letterSpacing: "0.05em",
                        }}
                      >
                        {clue.title}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: "#555",
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {clue.sourceRoute}
                      </div>
                    </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  )
}