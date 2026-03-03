"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { GlitchText } from "@/components/tor/glitch-text"
import { ROUTES_CONFIG, getGameState, type GameState } from "@/lib/game-state"
import { motion, AnimatePresence } from "framer-motion"

const STATUS_COLORS: Record<string, string> = {
  ENTRY: "#FF0033",
  ACTIVE: "#00FF41",
  LOCKED: "#2a2a2a",
  FINAL: "#00FF41",
}

export function TorNav() {
  const pathname = usePathname()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState("--------")

  useEffect(() => {
    // Generate session ID only on client to avoid SSR mismatch
    setSessionId(btoa(Date.now().toString()).slice(0, 8).toUpperCase())
    setGameState(getGameState())
    const interval = setInterval(() => setGameState(getGameState()), 1500)
    return () => clearInterval(interval)
  }, [])

  // Auto-expand active route only
  useEffect(() => {
    const active = ROUTES_CONFIG.find((r) => pathname?.startsWith(r.path))
    if (active) setExpandedRoute(active.id)
  }, [pathname])

  const isUnlocked = (routeId: string) => {
    if (!gameState) return false
    const config = ROUTES_CONFIG.find((r) => r.id === routeId)
    if (!config) return false
    if (!config.locked) return true
    return gameState.unlockedRoutes.includes(config.path)
  }

  // Sublinks only shown if user has visited this route before
  const hasVisited = (routePath: string) => {
    if (!gameState) return false
    return gameState.visitedRoutes.some((v) => v.startsWith(routePath))
  }

  const isActive = (path: string) => pathname?.startsWith(path)

  return (
    <nav
      style={{
        width: 210,
        minWidth: 210,
        background: "var(--panel-bg)",
        borderRight: "1px solid var(--panel-border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--panel-border)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ fontSize: 8, color: "#282828", letterSpacing: "0.25em" }}>
          NODE INDEX
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div
            style={{
              width: 6,
              height: 6,
              background: "#00FF41",
              animation: "flicker 3s infinite",
              boxShadow: "0 0 5px #00FF41",
            }}
          />
          <span style={{ fontSize: 9, color: "#00FF41", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
            {ROUTES_CONFIG.filter((r) => !r.locked).length}/{ROUTES_CONFIG.length} ACTIVE
          </span>
        </div>
      </div>

      {/* Route list */}
      <div style={{ flex: 1, padding: "4px 0" }}>
        {ROUTES_CONFIG.map((route, idx) => {
          const unlocked = isUnlocked(route.id)
          const active = isActive(route.path)
          const expanded = expandedRoute === route.id

          return (
            <div key={route.id}>
              <div
                role="button"
                tabIndex={unlocked ? 0 : -1}
                aria-label={`${route.label} - ${route.status}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  cursor: unlocked ? "pointer" : "not-allowed",
                  background: active ? `${route.accentColor}0d` : "transparent",
                  borderLeft: active
                    ? `2px solid ${route.accentColor}`
                    : "2px solid transparent",
                  transition: "background 0.12s, border-color 0.12s",
                  gap: 9,
                  position: "relative",
                }}
                onClick={() => {
                  if (unlocked) setExpandedRoute(expanded ? null : route.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && unlocked) setExpandedRoute(expanded ? null : route.id)
                }}
                onMouseEnter={(e) => {
                  if (unlocked && !active) e.currentTarget.style.background = `${route.accentColor}07`
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent"
                }}
              >
                {/* Index */}
                <span
                  style={{
                    fontSize: 8,
                    color: "#1e1e1e",
                    fontFamily: "var(--font-mono)",
                    minWidth: 14,
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* Status dot */}
                <span
                  style={{
                    width: 5,
                    height: 5,
                    background: unlocked ? route.accentColor : "#181818",
                    flexShrink: 0,
                    boxShadow: unlocked && active ? `0 0 7px ${route.accentColor}` : "none",
                    transition: "box-shadow 0.3s",
                  }}
                />

                {/* Label */}
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.1em",
                    color: unlocked
                      ? active ? route.accentColor : "#888888"
                      : "#282828",
                    flex: 1,
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {active ? (
                    <GlitchText text={route.label} intensity="low" color={route.accentColor} />
                  ) : (
                    route.label
                  )}
                </span>

                {/* Status badge */}
                <span
                  style={{
                    fontSize: 7,
                    fontFamily: "var(--font-mono)",
                    color: STATUS_COLORS[route.status] || "#282828",
                    letterSpacing: "0.08em",
                    opacity: unlocked ? 0.8 : 0.3,
                  }}
                >
                  {route.status}
                </span>
              </div>

              {/* Sublinks — only visible after visiting the route */}
              <AnimatePresence initial={false}>
                {expanded && unlocked && hasVisited(route.path) && (
                  <motion.div
                    key="sublinks"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    style={{
                      overflow: "hidden",
                      borderLeft: `1px solid ${route.accentColor}20`,
                      marginLeft: 27,
                    }}
                  >
                    <div style={{ paddingLeft: 14, paddingBottom: 4, paddingTop: 2 }}>
                      <Link
                        href={route.path}
                        style={{
                          display: "block",
                          padding: "3px 6px",
                          fontSize: 9,
                          fontFamily: "var(--font-mono)",
                          color: pathname === route.path ? route.accentColor : "#444444",
                          letterSpacing: "0.05em",
                          textDecoration: "none",
                          borderLeft: pathname === route.path ? `1px solid ${route.accentColor}` : "1px solid transparent",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = route.accentColor)}
                        onMouseLeave={(e) => { if (pathname !== route.path) e.currentTarget.style.color = "#444444" }}
                      >
                        /index
                      </Link>
                      {route.sublinks.map((sub) => {
                        const fullPath = `${route.path}${sub}`
                        const isCurrent = pathname === fullPath
                        return (
                          <Link
                            key={sub}
                            href={fullPath}
                            style={{
                              display: "block",
                              padding: "3px 6px",
                              fontSize: 9,
                              fontFamily: "var(--font-mono)",
                              color: isCurrent ? route.accentColor : "#444444",
                              letterSpacing: "0.05em",
                              textDecoration: "none",
                              borderLeft: isCurrent ? `1px solid ${route.accentColor}` : "1px solid transparent",
                              transition: "color 0.1s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = route.accentColor)}
                            onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.color = "#444444" }}
                          >
                            {sub.replace("/", "/")}
                          </Link>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "9px 14px",
          borderTop: "1px solid var(--panel-border)",
        }}
      >
        <div style={{ fontSize: 8, color: "#1e1e1e", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
          v2.4.1-ALPHA
        </div>
        <div style={{ fontSize: 8, color: "#161616", fontFamily: "var(--font-mono)" }}>
          SID: {sessionId}
        </div>
      </div>
    </nav>
  )
}
