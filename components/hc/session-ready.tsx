"use client"

import type { ReactNode } from "react"
import { usePlayer } from "@/lib/hc/client"

// proxy.ts already guarantees a valid session. This only holds the page
// back until the player's progress has been loaded from the database, so
// every page reads the right clues/puzzles on its first render.
export function SessionReady({ children }: { children: ReactNode }) {
  const { ready } = usePlayer()

  if (!ready) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", color: "#00FF41", fontSize: 12, letterSpacing: "0.2em" }}>
          УСТАНОВЯВАНЕ НА ВРЪЗКА…
        </span>
      </div>
    )
  }

  return <>{children}</>
}
