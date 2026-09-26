"use client"

import Link from "next/link"
import { usePlayer } from "@/lib/hc/client"

const ACCENT = "#00FF41"

// Compact Hidden Coin balance + session control for the top bar.
export function HcBalance() {
  const { authenticated, coins, player, logout } = usePlayer()

  if (!authenticated) {
    return (
      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#8a8a8a", letterSpacing: "0.12em" }}>
        НЕ СИ ВЛЯЗЪЛ
      </span>
    )
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Link
        href="/hidden-wiki-2/moneytasks"
        title="Hidden Coins — отвори мисиите"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
          color: ACCENT, textDecoration: "none",
          border: `1px solid ${ACCENT}40`, background: `${ACCENT}0d`,
          padding: "3px 9px", letterSpacing: "0.06em",
        }}
      >
        <span style={{ fontSize: 11 }}>◈</span>
        {coins.toLocaleString("bg-BG")} HC
      </Link>
      <span
        title={player?.handle}
        style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#8a8a8a", letterSpacing: "0.08em", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {player?.handle}
      </span>
      <button
        type="button"
        onClick={() => logout()}
        title="Изход"
        style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#8a8a8a", fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.1em", padding: "3px 7px", cursor: "pointer" }}
      >
        ИЗХОД
      </button>
    </div>
  )
}
