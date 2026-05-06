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
  const [expandedRoute, setExpandedRoute] = useState<string | null>("red-room")
  const [sessionId, setSessionId] = useState("--------")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSessionId(btoa(String(Date.now())).slice(0, 8).toUpperCase())
    setGameState(getGameState())
    const interval = setInterval(() => setGameState(getGameState()), 1500)
    return () => clearInterval(interval)
  }, [])

  // Auto-expand the section matching current URL
  useEffect(() => {
    const match = ROUTES_CONFIG.find((r) => pathname?.startsWith(r.path))
    if (match) setExpandedRoute(match.id)
  }, [pathname])

  const isUnlocked = (routeId: string) => {
    if (!gameState) return true // optimistic — show everything before state loads
    const config = ROUTES_CONFIG.find((r) => r.id === routeId)
    if (!config) return false
    if (!config.locked) return true
    return gameState.unlockedRoutes.includes(config.path)
  }

  // Render a minimal skeleton on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <nav style={{ width: 210, minWidth: 210, background: "var(--panel-bg)", borderRight: "1px solid var(--panel-border)", height: "100%", flexShrink: 0 }} />
    )
  }

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
        overflowX: "hidden",
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "block",
          padding: "12px 14px 10px",
          borderBottom: "1px solid var(--panel-border)",
          textDecoration: "none",
          cursor: "pointer",
        }}
      >
        <GlitchText text="HIDDEN WIKI 2" intensity="low" color="#00FF41" />
      </Link>

      {/* Header */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--panel-border)", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 8, color: "#383838", letterSpacing: "0.25em", fontFamily: "var(--font-mono)" }}>
          NODE INDEX
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 5, height: 5, background: "#00FF41", boxShadow: "0 0 5px #00FF41", animation: "flicker 3s infinite" }} />
          <span style={{ fontSize: 9, color: "#00FF41", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
            {ROUTES_CONFIG.filter((r) => !r.locked).length}/{ROUTES_CONFIG.length} ACTIVE
          </span>
        </div>
      </div>

      {/* Route list */}
      <div style={{ flex: 1, paddingTop: 4, paddingBottom: 4 }}>
        {ROUTES_CONFIG.map((route, idx) => {
          const unlocked = isUnlocked(route.id)
          const active = pathname?.startsWith(route.path) ?? false
          const expanded = expandedRoute === route.id

          return (
            <div key={route.id}>
              {/* Row: navigate on label click, toggle on arrow click */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: active ? `${route.accentColor}12` : "transparent",
                  borderLeft: active ? `2px solid ${route.accentColor}` : "2px solid transparent",
                  transition: "background 0.12s",
                }}
              >
                {/* Index */}
                <span style={{ fontSize: 8, color: "#282828", fontFamily: "var(--font-mono)", paddingLeft: 10, minWidth: 26, flexShrink: 0 }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* Color dot */}
                <span style={{
                  width: 5, height: 5, flexShrink: 0, marginRight: 8,
                  background: unlocked ? route.accentColor : "#222",
                  boxShadow: active && unlocked ? `0 0 8px ${route.accentColor}` : "none",
                }} />

                {/* Label — clicking navigates */}
                <Link
                  href={unlocked ? route.path : "#"}
                  style={{
                    flex: 1,
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.08em",
                    color: unlocked ? (active ? route.accentColor : "#b0b0b0") : "#333333",
                    fontWeight: active ? 700 : 400,
                    textDecoration: "none",
                    padding: "7px 0",
                    display: "block",
                    pointerEvents: unlocked ? "auto" : "none",
                  }}
                  onClick={(e) => {
                    if (!unlocked) { e.preventDefault(); return }
                    // If clicking active route, just toggle dropdown
                    if (active) { e.preventDefault(); setExpandedRoute(expanded ? null : route.id) }
                    else setExpandedRoute(route.id)
                  }}
                >
                  {active ? (
                    <GlitchText text={route.label} intensity="low" color={route.accentColor} />
                  ) : route.label}
                </Link>

                {/* Toggle arrow — always clickable if unlocked */}
                {unlocked && route.sublinks.length > 0 && (
                  <button
                    onClick={() => setExpandedRoute(expanded ? null : route.id)}
                    style={{
                      background: "none", border: "none", padding: "7px 10px",
                      color: expanded ? route.accentColor : "#383838",
                      fontSize: 8, fontFamily: "var(--font-mono)",
                      transition: "color 0.12s",
                    }}
                    aria-label={expanded ? "Collapse" : "Expand"}
                  >
                    {expanded ? "▲" : "▼"}
                  </button>
                )}

                {/* Status badge */}
                {!route.sublinks.length && (
                  <span style={{
                    fontSize: 7, fontFamily: "var(--font-mono)",
                    color: STATUS_COLORS[route.status] || "#282828",
                    letterSpacing: "0.06em", paddingRight: 10, opacity: unlocked ? 0.7 : 0.25,
                  }}>
                    {route.status}
                  </span>
                )}
              </div>

              {/* Sub-links — show when expanded + unlocked */}
              <AnimatePresence initial={false}>
                {expanded && unlocked && (
                  <motion.div
                    key="sub"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{
                      marginLeft: 36,
                      borderLeft: `1px solid ${route.accentColor}25`,
                      paddingLeft: 10,
                      paddingTop: 2,
                      paddingBottom: 6,
                    }}>
                      {/* Index sub-link */}
                      <Link href={route.path} style={{
                        display: "block", padding: "3px 6px",
                        fontSize: 9, fontFamily: "var(--font-mono)",
                        color: pathname === route.path ? route.accentColor : "#aaaaaa",
                        textDecoration: "none",
                        letterSpacing: "0.06em",
                      }}>
                        /index
                      </Link>
                      {route.sublinks.map((sub) => {
                        const fullPath = `${route.path}${sub}`
                        const subActive = pathname === fullPath
                        return (
                          <Link key={sub} href={fullPath} style={{
                            display: "block", padding: "3px 6px",
                            fontSize: 9, fontFamily: "var(--font-mono)",
                            color: subActive ? route.accentColor : "#aaaaaa",
                            textDecoration: "none",
                            letterSpacing: "0.06em",
                            fontWeight: subActive ? 700 : 400,
                          }}>
                            {sub}
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
      <div style={{ padding: "9px 14px", borderTop: "1px solid var(--panel-border)" }}>
        <div style={{ fontSize: 8, color: "#2a2a2a", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
          HW2 v2.4.1
        </div>
        <div style={{ fontSize: 8, color: "#222", fontFamily: "var(--font-mono)" }} suppressHydrationWarning>
          SID: {sessionId}
        </div>
      </div>
    </nav>
  )
}
