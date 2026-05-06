"use client"

import { useEffect, useState } from "react"
import { getGameState, CANON_ANCHORS, type Clue, type GameState } from "@/lib/game-state"
import { motion, AnimatePresence } from "framer-motion"

const STATUS_LABELS: Record<string, string> = {
  confirmed: "ПОТВЪРДЕНО",
  unverified: "НЕПОТВЪРДЕНО",
  suspicious: "СЪМНИТЕЛНО",
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#00FF41",
  unverified: "#777777",
  suspicious: "#FF0033",
}

export function EvidenceBoard() {
  const [state, setState] = useState<GameState | null>(null)
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setState(getGameState())
    const interval = setInterval(() => setState(getGameState()), 1500)
    return () => clearInterval(interval)
  }, [])

  const confirmedCount = state?.clues.filter((c) => c.status === "confirmed").length ?? 0
  const totalNeeded = 3
  const progressPct = Math.min(100, (confirmedCount / totalNeeded) * 100)

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
        {collapsed ? "▶" : "◀"}
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

            {/* Final progress */}
            <div style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                  color: confirmedCount >= totalNeeded ? "#00FF41" : "#aaaaaa",
                  marginBottom: 4,
                  letterSpacing: "0.1em",
                }}
              >
                ФИНАЛ: {confirmedCount}/{totalNeeded}
              </div>
              <div style={{ height: 2, background: "#111111", position: "relative" }}>
                <motion.div
                  style={{ height: "100%", background: "#00FF41", position: "absolute", left: 0, top: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Canon anchors */}
            <div style={{ fontSize: 10, color: "#808080", letterSpacing: "0.12em", marginBottom: 5 }}>
              КАНОН-КОТВИ
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {CANON_ANCHORS.map((anchor) => (
                <div
                  key={anchor.id}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}
                  title={anchor.description}
                >
                  <span style={{ width: 3, height: 3, background: "#606060", flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      color: "#909090",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {anchor.label}
                  </span>
                </div>
              ))}
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
                  НЕТ УЛИКИ
                  <br />
                  НАЧНИ РАЗСЛЕДВАНЕТО
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
                  УЛИКИ [{state.clues.length}]
                </div>
                <AnimatePresence>
                  {state.clues.map((clue) => (
                    <motion.div
                      key={clue.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedClue(selectedClue?.id === clue.id ? null : clue)}
                      style={{
                        padding: "7px 12px",
                        borderLeft: `2px solid ${STATUS_COLORS[clue.status]}`,
                        margin: "1px 0",
                        cursor: "pointer",
                        background:
                          selectedClue?.id === clue.id ? `${STATUS_COLORS[clue.status]}09` : "transparent",
                        transition: "background 0.12s",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          color: STATUS_COLORS[clue.status],
                          marginBottom: 2,
                          letterSpacing: "0.05em",
                        }}
                      >
                        {clue.title}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#aaaaaa",
                          fontFamily: "var(--font-mono)",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{STATUS_LABELS[clue.status]}</span>
                        <span
                          style={{
                            color:
                              clue.confidence >= 4
                                ? "#00FF41"
                                : clue.confidence >= 2
                                  ? "#FFD700"
                                  : "#FF0033",
                          }}
                        >
                          {clue.confidence}/5
                        </span>
                      </div>

                      <AnimatePresence>
                        {selectedClue?.id === clue.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div
                              style={{
                                marginTop: 7,
                                paddingTop: 7,
                                borderTop: "1px solid #181818",
                              }}
                            >
                              <div
                                style={{
                                fontSize: 10,
                                fontFamily: "var(--font-mono)",
                                color: "#b0b0b0",
                                  lineHeight: 1.7,
                                  marginBottom: 4,
                                }}
                              >
                                {clue.text}
                              </div>
                              <div style={{ fontSize: 9, color: "#808080", fontFamily: "var(--font-mono)" }}>
                                SRC: {clue.sourceRoute}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Tokens */}
          {state && Object.keys(state.tokens).filter((k) => state.tokens[k]).length > 0 && (
            <div
              style={{
                padding: "8px 12px",
                borderTop: "1px solid var(--panel-border)",
              }}
            >
              <div style={{ fontSize: 10, color: "#909090", letterSpacing: "0.18em", marginBottom: 5 }}>
                TOKENS
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {Object.entries(state.tokens)
                  .filter(([, active]) => active)
                  .map(([token]) => (
                    <motion.span
                      key={token}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{
                        fontSize: 9,
                        fontFamily: "var(--font-mono)",
                        color: "#00FF41",
                        border: "1px solid #00FF4120",
                        padding: "2px 5px",
                        letterSpacing: "0.05em",
                        background: "#00FF4106",
                      }}
                    >
                      {token}
                    </motion.span>
                  ))}
              </div>
            </div>
          )}

          {/* Progress footer */}
          <div style={{ padding: "9px 12px", borderTop: "1px solid var(--panel-border)" }}>
            <div style={{ fontSize: 10, color: "#909090", letterSpacing: "0.12em", marginBottom: 4 }}>
              ПРОГРЕС
            </div>
            <div style={{ height: 2, background: "#0e0e0e", position: "relative" }}>
              <motion.div
                style={{
                  position: "absolute",
                  left: 0, top: 0, height: "100%",
                  background: "linear-gradient(90deg, #00FF41, #00BFFF)",
                }}
                animate={{ width: `${state?.progress ?? 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#2a2a2a",
                fontFamily: "var(--font-mono)",
                marginTop: 3,
              }}
            >
              {state?.progress ?? 0}%
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
