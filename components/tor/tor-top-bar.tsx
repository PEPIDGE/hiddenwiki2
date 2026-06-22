"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { GlitchText } from "@/components/tor/glitch-text"
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
        title="Назад / нагоре по йерархията"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 26,
          padding: "0 11px",
          background: "transparent",
          border: "1px solid var(--panel-border)",
          color: atRoot ? "#444" : "#d0d0d0",
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.1em",
          cursor: atRoot ? "not-allowed" : "pointer",
          flexShrink: 0,
          transition: "all 0.12s",
        }}
        onMouseEnter={(e) => {
          if (atRoot) return
          e.currentTarget.style.borderColor = `${siteColor}80`
          e.currentTarget.style.color = siteColor
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--panel-border)"
          e.currentTarget.style.color = atRoot ? "#444" : "#d0d0d0"
        }}
      >
        <span style={{ fontSize: 13, lineHeight: 1 }}>←</span>
        НАЗАД
      </button>

      {/* Logo mark */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div
          style={{
            width: 22,
            height: 22,
            border: `1px solid ${siteColor}60`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              background: siteColor,
              animation: "pulse-glow 2s infinite",
              boxShadow: `0 0 8px ${siteColor}`,
            }}
          />
        </div>

        <GlitchText
          text="HIDDEN WIKI 2"
          as="span"
          intensity="low"
          className="text-xs tracking-widest font-bold"
          color={siteColor}
        />
      </div>

      {/* Current site label */}
      {currentSite && (
        <div
          style={{
            fontSize: 11,
            color: "#aaaaaa",
            letterSpacing: "0.14em",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ color: "#555555" }}>/</span>
          <motion.span
            key={currentSite}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ color: siteColor, fontWeight: 700 }}
          >
            {currentSite.toUpperCase()}
          </motion.span>
        </div>
      )}

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
