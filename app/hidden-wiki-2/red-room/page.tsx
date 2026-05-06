"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"


const ACCENT = "#FF0033"

const SUBLINKS = [
  { label: "/ RED ROOM - LIVE STREAM", href: "/hidden-wiki-2/red-room" },
  { label: "/ FULL TRUTH", href: "/hidden-wiki-2/red-room/full-truth" },
  { label: "/ DONORS", href: "/hidden-wiki-2/red-room/donors" },
  { label: "/ CHAT REPLAY", href: "/hidden-wiki-2/red-room/chat-replay" },
  { label: "/ SIGNAL LOG", href: "/hidden-wiki-2/red-room/signal-log" },
]

export default function RedRoomPage() {
  const pathname = usePathname()
  const [recBlink, setRecBlink] = useState(true)
  const [signalNoise, setSignalNoise] = useState(false)
  useEffect(() => {
    const blink = setInterval(() => setRecBlink((b) => !b), 750)
    const noise = setInterval(() => {
      setSignalNoise(true)
      setTimeout(() => setSignalNoise(false), 160)
    }, 5000 + Math.random() * 5000)
    return () => { clearInterval(blink); clearInterval(noise) }
  }, [])



  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      {/* Site header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            {/* REC indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  background: recBlink ? ACCENT : "transparent",
                  border: `1px solid ${ACCENT}`,
                  transition: "background 0.08s",
                  boxShadow: recBlink ? `0 0 10px ${ACCENT}` : "none",
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                  color: ACCENT,
                  letterSpacing: "0.25em",
                  fontWeight: 700,
                }}
              >
                REC
              </span>
            </div>
            <GlitchText
              text="RED ROOM"
              as="h1"
              intensity="medium"
              className="text-3xl font-bold tracking-widest"
              color={ACCENT}
            />
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "#bbbbbb",
              letterSpacing: "0.18em",
            }}
          >
            BROADCAST NODE — ENTRY POINT — SITE 01
          </div>
        </div>

        {/* Signal status */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          <motion.div
            animate={{ color: signalNoise ? ACCENT : "#aaaaaa" }}
            transition={{ duration: 0.1 }}
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.15em",
            }}
          >
            {signalNoise ? "// SIGNAL UNSTABLE" : "// SIGNAL STABLE"}
          </motion.div>
          {/* Sub-bass line */}
          <div
            style={{
              display: "flex",
              gap: 2,
              alignItems: "flex-end",
            }}
          >
            {[4, 7, 3, 9, 5, 6, 8, 3, 7, 4].map((h, i) => (
              <motion.div
                key={i}
                animate={{
                  height: signalNoise
                    ? [h * 2, h * 4, h * 2]
                    : [h * 2, h * 2 + 2, h * 2],
                  opacity: signalNoise ? 1 : 0.3,
                }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.04,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                style={{
                  width: 2,
                  background: ACCENT,
                  borderRadius: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sublink nav */}
      <div
        style={{
          display: "flex",
          gap: 1,
          marginBottom: 28,
          background: "#0e0e0e",
          flexWrap: "wrap",
        }}
      >
        {SUBLINKS.map((link) => {
          const isLocked = false
          const isCurrent = pathname === link.href
          return (
            <Link
              key={link.label}
              href={isLocked ? "#" : link.href}
              style={{
                padding: "8px 16px",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: isCurrent ? ACCENT : isLocked ? "#444" : "#cccccc",
                letterSpacing: "0.12em",
                textDecoration: "none",
                background: isCurrent ? `${ACCENT}12` : "#070707",
                border: `1px solid ${isCurrent ? `${ACCENT}40` : "#282828"}`,
                cursor: isLocked ? "not-allowed" : "pointer",
                transition: "all 0.12s",
                borderBottom: isCurrent ? `2px solid ${ACCENT}` : "1px solid #282828",
              }}
              onMouseEnter={(e) => {
                if (!isLocked && !isCurrent) e.currentTarget.style.color = ACCENT
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) e.currentTarget.style.color = isLocked ? "#444" : "#cccccc"
              }}
            >
              {link.label}
              {isLocked && (
                <span style={{ fontSize: 9, color: "#FF003355", marginLeft: 5 }}>[LOCKED]</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* LIVE STREAM — YouTube embed styled as surveillance livestream */}
      <div style={{ marginBottom: 28, border: `2px solid ${ACCENT}50`, background: "#000", position: "relative" }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 14px", background: "#0a0000", borderBottom: `1px solid ${ACCENT}30`,
        }}>
          <div style={{
            background: ACCENT, padding: "2px 10px",
            fontSize: 10, fontFamily: "var(--font-mono)", color: "#000", fontWeight: 900, letterSpacing: "0.15em",
          }}>
            {recBlink ? "● LIVE" : "○ LIVE"}
          </div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#ccc", letterSpacing: "0.1em" }}>NODE-7 // RED ROOM // FEED-01</div>
          <div style={{ marginLeft: "auto", fontSize: 10, fontFamily: "var(--font-mono)", color: "#bbbbbb" }}>1,247 зрители</div>
        </div>

        {/* YouTube iframe container */}
        <div style={{ position: "relative", aspectRatio: "16/9" }}>
          <iframe
            src="https://www.youtube.com/embed/jNQXAC9IVRw?autoplay=0&mute=1&controls=1&rel=0&modestbranding=1"
            style={{ width: "100%", height: "100%", border: "none", display: "block", filter: "brightness(0.85) contrast(1.1) saturate(0.7)" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="RED ROOM LIVE FEED"
          />
          {/* Scanlines overlay */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
            background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)",
          }} />
          {/* Signal noise overlay */}
          {signalNoise && (
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3,
              background: "repeating-linear-gradient(0deg, rgba(255,0,51,0.10) 0px, transparent 2px)",
            }} />
          )}
          {/* Watermark */}
          <div style={{
            position: "absolute", top: 8, left: 8, zIndex: 4,
            fontSize: 9, fontFamily: "var(--font-mono)", color: "#FF003355", letterSpacing: "0.1em",
            pointerEvents: "none",
          }}>NODE-7 // ENCRYPTED</div>
          <div style={{
            position: "absolute", bottom: 8, right: 8, zIndex: 4,
            fontSize: 9, fontFamily: "var(--font-mono)", color: "#FF003355",
            pointerEvents: "none",
          }}>15.10.2025 • 03:17</div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "8px 14px", borderTop: `1px solid #1a1a1a`, background: "#080000",
        }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.08em" }}>
            <span style={{ opacity: recBlink ? 1 : 0.2, transition: "opacity 0.08s" }}>●</span> REC
          </div>
          <div style={{ flex: 1, height: 2, background: "#1a1a1a", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "62%", background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}80)` }} />
          </div>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#bbbbbb" }}>01:22 / 02:20</div>
          <div style={{
            fontSize: 9, fontFamily: "var(--font-mono)", color: signalNoise ? "#FF8800" : "#909090",
            letterSpacing: "0.1em", transition: "color 0.1s",
          }}>{signalNoise ? "SIGNAL UNSTABLE" : "SIGNAL OK"}</div>
        </div>
      </div>

      {/* Navigation hints */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
        <Link
          href="/hidden-wiki-2/red-room/chat-replay"
          style={{
            padding: "11px 22px",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            color: ACCENT,
            textDecoration: "none",
            border: `1px solid ${ACCENT}60`,
            letterSpacing: "0.12em",
            fontWeight: 700,
            background: `${ACCENT}10`,
            boxShadow: `0 0 14px ${ACCENT}20`,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${ACCENT}22`
            e.currentTarget.style.borderColor = ACCENT
            e.currentTarget.style.boxShadow = `0 0 22px ${ACCENT}40`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${ACCENT}10`
            e.currentTarget.style.borderColor = `${ACCENT}60`
            e.currentTarget.style.boxShadow = `0 0 14px ${ACCENT}20`
          }}
        >
          CHAT REPLAY →
        </Link>
        <Link
          href="/hidden-wiki-2/red-room/full-truth"
          style={{
            padding: "11px 22px",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            color: ACCENT,
            textDecoration: "none",
            border: `1px solid ${ACCENT}60`,
            letterSpacing: "0.12em",
            fontWeight: 700,
            background: `${ACCENT}10`,
            boxShadow: `0 0 14px ${ACCENT}20`,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${ACCENT}22`
            e.currentTarget.style.borderColor = ACCENT
            e.currentTarget.style.boxShadow = `0 0 22px ${ACCENT}40`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${ACCENT}10`
            e.currentTarget.style.borderColor = `${ACCENT}60`
            e.currentTarget.style.boxShadow = `0 0 14px ${ACCENT}20`
          }}
        >
          FULL TRUTH →
        </Link>
      </div>
    </div>
  )
}
