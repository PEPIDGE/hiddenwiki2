"use client"

import { useEffect, useState } from "react"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"

interface TopBarProps {
  currentSite?: string
  siteColor?: string
}

const NOISE_CHARS = "!@#$%^&*<>?/\\|0123456789ABCDEF"

function NoiseChar() {
  const [char, setChar] = useState("_")
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    const iv = setInterval(() => {
      setChar(NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)])
    }, 80)
    return () => clearInterval(iv)
  }, [])
  // Render static placeholder on server, animate only after hydration
  return <span style={{ opacity: 0.15, color: "#00FF41" }} suppressHydrationWarning>{mounted ? char : "_"}</span>
}

export function TorTopBar({ currentSite, siteColor = "#00FF41" }: TopBarProps) {
  const [time, setTime] = useState("")
  const [signal, setSignal] = useState(97)
  const [hops] = useState(3)
  const [glitchActive, setGlitchActive] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toTimeString().slice(0, 8))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setSignal(Math.floor(82 + Math.random() * 18))
      // Trigger glitch on signal drop
      if (Math.random() > 0.6) {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 220)
      }
    }, 3500)
    return () => clearInterval(interval)
  }, [])

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
      {/* Bottom accent bar animated */}
      <motion.div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "1px",
          background: siteColor,
          opacity: 0.35,
          boxShadow: `0 0 6px ${siteColor}`,
        }}
        animate={{ width: `${signal}%` }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* Glitch overlay flash */}
      {glitchActive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `${siteColor}08`,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      )}

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
          {/* Corner accents */}
          <div style={{ position: "absolute", top: -1, left: -1, width: 4, height: 4, borderTop: `1px solid ${siteColor}`, borderLeft: `1px solid ${siteColor}` }} />
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 4, height: 4, borderBottom: `1px solid ${siteColor}`, borderRight: `1px solid ${siteColor}` }} />
        </div>

        <GlitchText
          text="HIDDEN WIKI 2"
          as="span"
          intensity="low"
          className="text-xs tracking-widest font-bold"
          color={siteColor}
        />
      </div>

      {/* Separator */}
      <span style={{ color: "#222222", fontSize: 14, fontWeight: 100 }}>|</span>

      {/* Current site breadcrumb */}
      {currentSite && (
        <div
          style={{
            fontSize: 10,
            color: "var(--muted-foreground)",
            letterSpacing: "0.15em",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ color: "#333333" }}>/</span>
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

      {/* Flex spacer */}
      <div style={{ flex: 1 }} />

      {/* Noise chars — decorative */}
      <div style={{ display: "flex", gap: 0, fontSize: 9 }}>
        <NoiseChar />
        <NoiseChar />
        <NoiseChar />
        <NoiseChar />
      </div>

      {/* Hops indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: "0.12em" }}>HOP</span>
        <div style={{ display: "flex", gap: 2 }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 7,
                height: 7,
                background: i < hops ? "#00FF41" : "#111111",
                boxShadow: i < hops ? "0 0 5px #00FF41" : "none",
                animation: i === 0 ? "flicker 2.5s infinite" : i === 1 ? "flicker 3.5s infinite" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Signal */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: "0.1em" }}>SIG</span>
        <motion.span
          animate={{ color: signal > 90 ? "#00FF41" : signal > 75 ? "#FFD700" : "#FF0033" }}
          transition={{ duration: 0.4 }}
          style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}
        >
          {signal}%
        </motion.span>
      </div>

      {/* TZ */}
      <span style={{ fontSize: 8, color: "#1e1e1e", letterSpacing: "0.08em" }}>+0200</span>

      {/* Time */}
      <div
        style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: "var(--muted-foreground)",
          minWidth: 62,
          letterSpacing: "0.05em",
        }}
        suppressHydrationWarning
      >
        {time}
      </div>

      {/* Online dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div
          style={{
            width: 7,
            height: 7,
            background: "#00FF41",
            animation: "pulse-glow 2.4s infinite",
            boxShadow: "0 0 7px #00FF41",
          }}
        />
        <span style={{ fontSize: 8, color: "#00FF41", letterSpacing: "0.12em" }}>ONLINE</span>
      </div>
    </header>
  )
}
