"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import {
  getGameState,
  saveGameState,
  addClue,
} from "@/lib/game-state"

const ACCENT = "#FF0033"

const FRAMES_DEMO = [
  { id: 1, time: "00:00:03", anomaly: false },
  { id: 2, time: "00:00:09", anomaly: false },
  { id: 3, time: "00:00:14", anomaly: true, marker: "[A3]", hint: "Черен Audi A3" },
  { id: 4, time: "00:00:22", anomaly: false },
  { id: 5, time: "00:00:31", anomaly: false },
  { id: 6, time: "00:00:38", anomaly: false },
  { id: 7, time: "00:00:47", anomaly: true, marker: "[13B]", hint: "Апартамент 13B" },
  { id: 8, time: "00:00:52", anomaly: false },
  { id: 9, time: "00:01:01", anomaly: false },
  { id: 10, time: "00:01:13", anomaly: false },
  { id: 11, time: "00:01:22", anomaly: true, marker: "[calm_voice]", hint: "Гласово разпознаване" },
  { id: 12, time: "00:01:34", anomaly: false },
]

const SUBLINKS = [
  { label: "/ INDEX", href: "/hidden-wiki-2/red-room" },
  { label: "/ FRAMES", href: "/hidden-wiki-2/red-room/frames" },
  { label: "/ CHAT REPLAY", href: "/hidden-wiki-2/red-room/chat-replay" },
  { label: "/ OPERATOR VIEW", href: "/hidden-wiki-2/red-room/operator-view", locked: true },
]

export default function RedRoomPage() {
  const pathname = usePathname()
  const [recBlink, setRecBlink] = useState(true)
  const [signalNoise, setSignalNoise] = useState(false)
  const [watermarkHover, setWatermarkHover] = useState(false)
  const [watermarkHoldTime, setWatermarkHoldTime] = useState(0)
  const [watermarkUnlocked, setWatermarkUnlocked] = useState(false)
  const [selectedFrames, setSelectedFrames] = useState<number[]>([])
  const [markerRevealed, setMarkerRevealed] = useState(false)

  useEffect(() => {
    const blink = setInterval(() => setRecBlink((b) => !b), 750)
    const noise = setInterval(() => {
      setSignalNoise(true)
      setTimeout(() => setSignalNoise(false), 160)
    }, 5000 + Math.random() * 5000)
    return () => { clearInterval(blink); clearInterval(noise) }
  }, [])

  // Watermark hold timer
  useEffect(() => {
    let iv: ReturnType<typeof setInterval> | null = null
    if (watermarkHover && !watermarkUnlocked) {
      iv = setInterval(() => {
        setWatermarkHoldTime((t) => {
          const next = t + 100
          if (next >= 4000) {
            setWatermarkUnlocked(true)
            return 4000
          }
          return next
        })
      }, 100)
    } else if (!watermarkHover && !watermarkUnlocked) {
      setWatermarkHoldTime(0)
    }
    return () => { if (iv) clearInterval(iv) }
  }, [watermarkHover, watermarkUnlocked])

  const toggleFrame = (id: number) => {
    const frame = FRAMES_DEMO.find((f) => f.id === id)
    if (!frame?.anomaly) return
    setSelectedFrames((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const allAnomaliesSelected =
    selectedFrames.length === 3 &&
    FRAMES_DEMO.filter((f) => f.anomaly).every((f) => selectedFrames.includes(f.id))

  // Save clue when all anomalies found
  useEffect(() => {
    if (allAnomaliesSelected && !markerRevealed) {
      setMarkerRevealed(true)
      const gs = getGameState()
      const newGs = addClue(gs, {
        id: "clue-rr1-frames",
        title: "Frame Markers [A3+13B+calm]",
        text: "Три аномални кадъра: черен Audi A3, адрес 13B, гласова идентификация. Кръстосай с котви.",
        sourceRoute: "RED ROOM / frames",
        confidence: 3,
        status: "unverified",
      })
      saveGameState(newGs)
    }
  }, [allAnomaliesSelected, markerRevealed])

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
                  fontSize: 8,
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
              fontSize: 8,
              fontFamily: "var(--font-mono)",
              color: "#2a2a2a",
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
            animate={{ color: signalNoise ? ACCENT : "#2a2a2a" }}
            transition={{ duration: 0.1 }}
            style={{
              fontSize: 8,
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
          const isLocked = link.locked && !watermarkUnlocked
          const isCurrent = pathname === link.href
          return (
            <Link
              key={link.label}
              href={isLocked ? "#" : link.href}
              style={{
                padding: "7px 14px",
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                color: isCurrent ? ACCENT : isLocked ? "#202020" : "#3a3a3a",
                letterSpacing: "0.12em",
                textDecoration: "none",
                background: isCurrent ? `${ACCENT}12` : "#070707",
                border: `1px solid ${isCurrent ? `${ACCENT}40` : "#181818"}`,
                cursor: isLocked ? "not-allowed" : "pointer",
                transition: "all 0.12s",
                borderBottom: isCurrent ? `2px solid ${ACCENT}` : "1px solid #181818",
              }}
              onMouseEnter={(e) => {
                if (!isLocked && !isCurrent) e.currentTarget.style.color = ACCENT
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) e.currentTarget.style.color = isLocked ? "#202020" : "#3a3a3a"
              }}
            >
              {link.label}
              {isLocked && (
                <span style={{ fontSize: 7, color: "#FF003325", marginLeft: 5 }}>[LOCKED]</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* RR1 — Frame Hunt */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{ marginBottom: 28 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em" }}>
            PUZZLE RR1 — FRAME HUNT
          </div>
          <div
            style={{
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              color: allAnomaliesSelected ? "#00FF41" : "#2a2a2a",
              letterSpacing: "0.1em",
            }}
          >
            {selectedFrames.length}/3 АНОМАЛИИ
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 2 }}>
          {FRAMES_DEMO.map((frame) => {
            const isSelected = selectedFrames.includes(frame.id)
            return (
              <motion.div
                key={frame.id}
                whileHover={frame.anomaly ? { scale: 1.04 } : {}}
                whileTap={frame.anomaly ? { scale: 0.97 } : {}}
                onClick={() => toggleFrame(frame.id)}
                style={{
                  background: isSelected ? "#1a0005" : frame.anomaly ? "#0e0003" : "#060606",
                  border: `1px solid ${isSelected ? ACCENT : frame.anomaly ? `${ACCENT}25` : "#111111"}`,
                  padding: "8px 6px",
                  position: "relative",
                  cursor: frame.anomaly ? "pointer" : "default",
                  boxShadow: isSelected ? `0 0 12px ${ACCENT}25` : "none",
                  transition: "box-shadow 0.2s",
                }}
              >
                <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: isSelected ? ACCENT : "#1e1e1e", marginBottom: 5 }}>
                  #{String(frame.id).padStart(3, "0")}
                </div>
                <div
                  style={{
                    height: 30,
                    marginBottom: 5,
                    position: "relative",
                    overflow: "hidden",
                    background: frame.anomaly
                      ? `repeating-linear-gradient(45deg, #1a0007, #1a0007 2px, #0e0003 2px, #0e0003 7px)`
                      : "#030303",
                  }}
                >
                  {frame.anomaly && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 8,
                        fontFamily: "var(--font-mono)",
                        color: isSelected ? ACCENT : `${ACCENT}50`,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        animation: "flicker 2s infinite",
                      }}
                    >
                      {isSelected ? frame.marker : "///"}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#1e1e1e" }}>{frame.time}</div>
              </motion.div>
            )
          })}
        </div>

        <AnimatePresence>
          {allAnomaliesSelected && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 10,
                padding: "10px 14px",
                border: `1px solid ${ACCENT}35`,
                background: "#0a0103",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ width: 6, height: 6, background: ACCENT, animation: "pulse-glow 1.5s infinite" }} />
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.1em" }}>
                МАРКЕРИ: [A3] + [13B] + [calm_voice] — Запиши. Провери с котвите.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* RR2 — Watermark Hover */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          padding: "18px 18px",
          border: "1px solid #181818",
          background: "#050103",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Corner decorations */}
        <div style={{ position: "absolute", top: 4, left: 4, width: 10, height: 10, borderTop: `1px solid ${ACCENT}30`, borderLeft: `1px solid ${ACCENT}30` }} />
        <div style={{ position: "absolute", bottom: 4, right: 4, width: 10, height: 10, borderBottom: `1px solid ${ACCENT}30`, borderRight: `1px solid ${ACCENT}30` }} />

        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.2em", marginBottom: 12 }}>
          PUZZLE RR2 — BROADCAST WATERMARK
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 440,
            height: 160,
            background: "#060103",
            border: `1px solid ${ACCENT}15`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Scanlines inside broadcast */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${i * 10}%`,
                height: 1,
                background: "#FF000305",
              }}
            />
          ))}

          {/* Static noise */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              fontFamily: "var(--font-mono)",
              color: "#FF003318",
              letterSpacing: "0.3em",
            }}
          >
            NO SIGNAL
          </div>

          {/* Watermark target */}
          <div
            onMouseEnter={() => setWatermarkHover(true)}
            onMouseLeave={() => setWatermarkHover(false)}
            style={{
              position: "absolute",
              bottom: 9,
              right: 10,
              zIndex: 2,
            }}
          >
            {!watermarkUnlocked ? (
              <div
                style={{
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                  color: watermarkHover ? `${ACCENT}70` : `${ACCENT}14`,
                  letterSpacing: "0.12em",
                  cursor: "none",
                  transition: "color 0.3s",
                  userSelect: "none",
                }}
              >
                OP::BROADCAST_IDENT
                {watermarkHover && (
                  <div style={{ marginTop: 4, height: 2, background: "#1a1a1a", width: 140 }}>
                    <motion.div
                      style={{ height: "100%", background: ACCENT, width: 0 }}
                      animate={{ width: `${(watermarkHoldTime / 4000) * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Link
                  href="/hidden-wiki-2/red-room/operator-view"
                  style={{
                    fontSize: 9,
                    fontFamily: "var(--font-mono)",
                    color: ACCENT,
                    textDecoration: "none",
                    border: `1px solid ${ACCENT}50`,
                    padding: "3px 10px",
                    background: "#1a0005",
                    letterSpacing: "0.1em",
                    boxShadow: `0 0 10px ${ACCENT}30`,
                    display: "inline-block",
                  }}
                >
                  OPERATOR VIEW →
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1e1e1e", marginTop: 7 }}>
          {watermarkUnlocked
            ? "[WATERMARK АКТИВИРАН — достъп открит]"
            : "[Задръж курсора върху watermark 4 секунди]"
          }
        </div>
      </motion.div>

      {/* Navigation hints */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link
          href="/hidden-wiki-2/red-room/chat-replay"
          style={{
            padding: "7px 14px",
            fontSize: 9,
            fontFamily: "var(--font-mono)",
            color: `${ACCENT}50`,
            textDecoration: "none",
            border: "1px solid #181818",
            letterSpacing: "0.1em",
            transition: "all 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = ACCENT
            e.currentTarget.style.borderColor = `${ACCENT}40`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = `${ACCENT}50`
            e.currentTarget.style.borderColor = "#181818"
          }}
        >
          CHAT REPLAY →
        </Link>
        <Link
          href="/hidden-wiki-2/mirrors"
          style={{
            padding: "7px 14px",
            fontSize: 9,
            fontFamily: "var(--font-mono)",
            color: "#00BFFF30",
            textDecoration: "none",
            border: "1px solid #181818",
            letterSpacing: "0.1em",
            transition: "all 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#00BFFF"
            e.currentTarget.style.borderColor = "#00BFFF40"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#00BFFF30"
            e.currentTarget.style.borderColor = "#181818"
          }}
        >
          MIRRORS →
        </Link>
      </div>
    </div>
  )
}
