"use client"

import { type CSSProperties, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ROUTES_CONFIG, getGameState, type GameState } from "@/lib/game-state"
import { motion, AnimatePresence } from "framer-motion"
import s from "./shell.module.css"

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
    return <nav className={s.nav} />
  }

  return (
    <nav className={s.nav}>
      <div className={s.navHead}>
        <Link href="/" className={s.navLogo}>
          HW//2
          <small>HIDDEN WIKI 2</small>
        </Link>
      </div>

      <div className={s.navMeta}>
        NODE INDEX
        <b>
          {ROUTES_CONFIG.filter((r) => !r.locked).length}/{ROUTES_CONFIG.length} ACTIVE
        </b>
      </div>

      <div className={s.routes}>
        {ROUTES_CONFIG.map((route, idx) => {
          const unlocked = isUnlocked(route.id)
          const active = pathname?.startsWith(route.path) ?? false
          const expanded = expandedRoute === route.id

          return (
            <div key={route.id} style={{ "--accent": route.accentColor } as CSSProperties}>
              <div
                className={s.row}
                data-active={active ? "" : undefined}
                data-locked={unlocked ? undefined : ""}
              >
                <span className={s.rowIdx}>{String(idx + 1).padStart(2, "0")}</span>
                <span className={s.dot} />
                <Link
                  href={unlocked ? route.path : "#"}
                  className={s.rowLink}
                  onClick={(e) => {
                    if (!unlocked) { e.preventDefault(); return }
                    // If clicking active route, just toggle dropdown
                    if (active) { e.preventDefault(); setExpandedRoute(expanded ? null : route.id) }
                    else setExpandedRoute(route.id)
                  }}
                >
                  {route.label}
                </Link>

                {unlocked && route.sublinks.length > 0 ? (
                  <button
                    type="button"
                    className={s.toggle}
                    data-open={expanded ? "" : undefined}
                    onClick={() => setExpandedRoute(expanded ? null : route.id)}
                    aria-label={expanded ? "Collapse" : "Expand"}
                  >
                    ▼
                  </button>
                ) : (
                  <span className={s.status}>{route.status}</span>
                )}
              </div>

              <AnimatePresence initial={false}>
                {expanded && unlocked && route.sublinks.length > 0 && (
                  <motion.div
                    key="sub"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className={s.subs}>
                      <Link
                        href={route.path}
                        className={s.sub}
                        data-active={pathname === route.path ? "" : undefined}
                      >
                        /index
                      </Link>
                      {route.sublinks.map((sub) => {
                        const fullPath = `${route.path}${sub}`
                        return (
                          <Link
                            key={sub}
                            href={fullPath}
                            className={s.sub}
                            data-active={pathname === fullPath ? "" : undefined}
                          >
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

      <div className={s.navFoot}>
        <span>HW2 v2.4.1</span>
        <span suppressHydrationWarning>SID: {sessionId}</span>
      </div>
    </nav>
  )
}
