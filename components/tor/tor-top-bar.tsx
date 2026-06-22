"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"

interface TopBarProps {
  currentSite?: string
  siteColor?: string
}

const ROOT = "/hidden-wiki-2"

export function TorTopBar({ currentSite, siteColor = "#00FF41" }: TopBarProps) {
  const [time, setTime] = useState("")
  const router = useRouter()
  const pathname = usePathname() ?? ""

  useEffect(() => {
    const updateTime = () => setTime(new Date().toTimeString().slice(0, 8))
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Hierarchical "up": first clear any query (e.g. open folder), then climb one
  // path segment at a time, never above the hub root.
  const atRoot = pathname === ROOT || pathname === "/"
  const goUp = () => {
    if (typeof window !== "undefined" && window.location.search) {
      router.push(pathname)
      return
    }
    if (atRoot) {
      router.push(ROOT)
      return
    }
    const segments = pathname.split("/").filter(Boolean)
    segments.pop()
    const parent = "/" + segments.join("/")
    router.push(parent.startsWith(ROOT) ? parent : ROOT)
  }

  return (
    <header
      style={{
        height: 42,
        background: "var(--panel-bg)",
        borderBottom: "1px solid var(--panel-border)",
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        gap: 14,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-mono)",
      }}
    >
      {/* Subtle bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, ${siteColor}55, transparent)`,
        }}
      />

      {/* Back / up button */}
      <button
        onClick={goUp}
        disabled={atRoot}
        title="Назад"
        style={{
          display: "flex",
          alignItems: "center",
          height: 28,
          padding: 0,
          background: atRoot ? "transparent" : "rgba(255,255,255,0.02)",
          border: `1px solid ${atRoot ? "#1c1c1c" : "var(--panel-border)"}`,
          color: atRoot ? "#3a3a3a" : "#dcdcdc",
          fontFamily: "var(--font-mono)",
          cursor: atRoot ? "not-allowed" : "pointer",
          flexShrink: 0,
          overflow: "hidden",
          transition: "all 0.14s ease",
        }}
        onMouseEnter={(e) => {
          if (atRoot) return
          e.currentTarget.style.borderColor = siteColor
          e.currentTarget.style.color = siteColor
          e.currentTarget.style.boxShadow = `0 0 10px ${siteColor}30`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = atRoot ? "#1c1c1c" : "var(--panel-border)"
          e.currentTarget.style.color = atRoot ? "#3a3a3a" : "#dcdcdc"
          e.currentTarget.style.boxShadow = "none"
        }}
      >
        {/* Chevron cell */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: "100%",
            fontSize: 15,
            lineHeight: 1,
            borderRight: `1px solid ${atRoot ? "#1c1c1c" : "var(--panel-border)"}`,
          }}
        >
          ‹
        </span>
        {/* Label cell */}
        <span
          style={{
            padding: "0 12px",
            fontSize: 10,
            letterSpacing: "0.18em",
            fontWeight: 700,
          }}
        >
          НАЗАД
        </span>
      </button>

      {/* Brand + current site — single aligned baseline, equal sizing */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: "#e8e8e8",
            lineHeight: 1,
          }}
        >
          HIDDEN WIKI 2
        </span>

        {currentSite && (
          <>
            <span style={{ color: "#3a3a3a", fontSize: 14, lineHeight: 1, fontWeight: 300 }}>/</span>
            <motion.span
              key={currentSite}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                letterSpacing: "0.16em",
                color: siteColor,
                lineHeight: 1,
              }}
            >
              {currentSite.toUpperCase()}
            </motion.span>
          </>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Clock */}
      <div
        style={{
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          color: "#d0d0d0",
          minWidth: 64,
          letterSpacing: "0.06em",
          textAlign: "right",
        }}
        suppressHydrationWarning
      >
        {time}
      </div>

      {/* Online status */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <div
          style={{
            width: 7,
            height: 7,
            background: "#00FF41",
            animation: "pulse-glow 2.4s infinite",
            boxShadow: "0 0 7px #00FF41",
          }}
        />
        <span style={{ fontSize: 10, color: "#00FF41", letterSpacing: "0.14em" }}>ONLINE</span>
      </div>
    </header>
  )
}
