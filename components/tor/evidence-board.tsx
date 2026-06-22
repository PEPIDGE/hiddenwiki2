"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getGameState,
  saveGameState,
  removeClue,
  routeColor,
  resolveClueRoute,
  PALETTE,
  type Clue,
  type GameState,
} from "@/lib/game-state"
import { motion, AnimatePresence } from "framer-motion"

export function EvidenceBoard() {
  const [state, setState] = useState<GameState | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Clue | null>(null)
  const router = useRouter()

  useEffect(() => {
    setState(getGameState())
    const interval = setInterval(() => setState(getGameState()), 1500)
    return () => clearInterval(interval)
  }, [])

  const goToClue = (clue: Clue) => {
    const route = resolveClueRoute(clue.sourceRoute)
    router.push(`${route}?clue=${encodeURIComponent(clue.id)}`)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const updated = removeClue(getGameState(), pendingDelete.id)
    saveGameState(updated)
    setState(updated)
    setPendingDelete(null)
  }

  return (
    <aside
      style={{
        width: collapsed ? 30 : 244,
        minWidth: collapsed ? 30 : 244,
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
          top: 11,
          left: collapsed ? "50%" : "auto",
          right: collapsed ? "auto" : 10,
          transform: collapsed ? "translateX(-50%)" : "none",
          background: "transparent",
          border: "none",
          color: "#8a8a8a",
          cursor: "pointer",
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          zIndex: 10,
          padding: 2,
          lineHeight: 1,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = PALETTE.green)}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#8a8a8a")}
      >
        {collapsed ? "▶" : "◀"}
      </button>

      {!collapsed && (
        <>
          {/* Header */}
          <div
            style={{
              padding: "12px 14px 11px",
              paddingTop: 34,
              borderBottom: "1px solid var(--panel-border)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#d8d8d8",
                letterSpacing: "0.22em",
                fontWeight: 700,
              }}
            >
              ДОСИЕ С УЛИКИ
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#8a8a8a",
                letterSpacing: "0.1em",
                marginTop: 4,
                fontFamily: "var(--font-mono)",
              }}
            >
              {state?.clues.length ?? 0} запазени · {state?.progress ?? 0}% разкрито
            </div>
          </div>

          {/* Clues */}
          <div style={{ flex: 1, padding: "6px 0" }}>
            {!state?.clues.length ? (
              <div style={{ padding: "26px 16px", textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "#bdbdbd",
                    letterSpacing: "0.1em",
                    lineHeight: 2,
                  }}
                >
                  НЯМА УЛИКИ
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "#888",
                    letterSpacing: "0.06em",
                    marginTop: 6,
                    lineHeight: 1.7,
                  }}
                >
                  Запазвай улики из сайта, за да започнеш разследването.
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    padding: "4px 14px 8px",
                    fontSize: 10,
                    color: "#a8a8a8",
                    letterSpacing: "0.18em",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  УЛИКИ [{state.clues.length}]
                </div>
                <AnimatePresence>
                  {state.clues.map((clue) => {
                    const color = routeColor(clue.sourceRoute)
                    return (
                      <motion.div
                        key={clue.id}
                        layout
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          display: "flex",
                          alignItems: "stretch",
                          borderLeft: `2px solid ${color}`,
                          margin: "2px 0",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = `${color}14`)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {/* Clickable area → jump to the clue's page */}
                        <button
                          onClick={() => goToClue(clue)}
                          title="Отиди до уликата"
                          style={{
                            flex: 1,
                            minWidth: 0,
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "8px 6px 8px 12px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontFamily: "var(--font-mono)",
                              color: color,
                              marginBottom: 3,
                              letterSpacing: "0.03em",
                              lineHeight: 1.4,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {clue.title}
                          </div>
                          <div
                            style={{
                              fontSize: 9,
                              color: "#9a9a9a",
                              fontFamily: "var(--font-mono)",
                              letterSpacing: "0.04em",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {resolveClueRoute(clue.sourceRoute).replace("/hidden-wiki-2", "")}
                          </div>
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPendingDelete(clue)
                          }}
                          aria-label="Изтрий уликата"
                          title="Изтрий уликата"
                          style={{
                            flexShrink: 0,
                            width: 26,
                            background: "transparent",
                            border: "none",
                            borderLeft: "1px solid var(--panel-border)",
                            color: "#777",
                            cursor: "pointer",
                            fontSize: 13,
                            fontFamily: "var(--font-mono)",
                            lineHeight: 1,
                            transition: "color 0.12s, background 0.12s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = PALETTE.red
                            e.currentTarget.style.background = `${PALETTE.red}18`
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#777"
                            e.currentTarget.style.background = "transparent"
                          }}
                        >
                          ×
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </>
      )}

      {/* Custom confirm popup — site style */}
      <AnimatePresence>
        {pendingDelete && (
          <ConfirmDeleteModal
            clue={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onConfirm={confirmDelete}
          />
        )}
      </AnimatePresence>
    </aside>
  )
}

function ConfirmDeleteModal({
  clue,
  onCancel,
  onConfirm,
}: {
  clue: Clue
  onCancel: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
      if (e.key === "Enter") onConfirm()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onCancel, onConfirm])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#0a0a0a",
          border: `1px solid ${PALETTE.red}55`,
          boxShadow: `0 0 28px ${PALETTE.red}22`,
          fontFamily: "var(--font-mono)",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderBottom: `1px solid ${PALETTE.red}33`,
            background: `${PALETTE.red}0d`,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              background: PALETTE.red,
              boxShadow: `0 0 7px ${PALETTE.red}`,
            }}
          />
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              color: PALETTE.red,
              fontWeight: 700,
            }}
          >
            ИЗТРИВАНЕ НА УЛИКА
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 16px 8px" }}>
          <p
            style={{
              fontSize: 13,
              color: "#e4e4e4",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Сигурен ли си, че искаш да изтриеш тази улика от досието?
          </p>
          <div
            style={{
              marginTop: 12,
              padding: "8px 10px",
              border: "1px solid var(--panel-border)",
              background: "#060606",
              fontSize: 11,
              color: routeColor(clue.sourceRoute),
              lineHeight: 1.5,
              overflowWrap: "anywhere",
            }}
          >
            {clue.title}
          </div>
          <p
            style={{
              fontSize: 10,
              color: "#909090",
              marginTop: 10,
              marginBottom: 0,
              letterSpacing: "0.04em",
            }}
          >
            Действието е необратимо.
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "12px 16px 16px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.12em",
              background: "transparent",
              color: "#cccccc",
              border: "1px solid #3a3a3a",
              cursor: "pointer",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#666"
              e.currentTarget.style.color = "#fff"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#3a3a3a"
              e.currentTarget.style.color = "#cccccc"
            }}
          >
            ОТКАЖИ
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            style={{
              padding: "8px 16px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.12em",
              background: `${PALETTE.red}1a`,
              color: PALETTE.red,
              border: `1px solid ${PALETTE.red}`,
              cursor: "pointer",
              fontWeight: 700,
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${PALETTE.red}33`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${PALETTE.red}1a`
            }}
          >
            ИЗТРИЙ
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
