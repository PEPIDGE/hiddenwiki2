"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF0033"

const STREAM_CLUES = [
  {
    id: "rr-grid",
    frameTime: "00:14",
    label: "Решетка — метална конструкция",
    detail: "Дебели прозоречни решетки. Индустриален тип. Не е стандартен апартамент.",
    clueText: "Червена стая: решетка — индустриален обект, не жилищна сграда",
  },
  {
    id: "rr-line",
    frameTime: "00:31",
    label: "Жълто-черна лента на пода",
    detail: "Предупредителна лента — стандартна за складове и производствени помещения.",
    clueText: "Червена стая: жълто-черна лента — склад или производствено помещение",
  },
  {
    id: "rr-sign",
    frameTime: "00:47",
    label: "Индустриален надпис — частичен",
    detail: "Видима е само задна част: ...ARNA FABR... — вероятно Захарна Фабрика.",
    clueText: "Червена стая: надпис '...ARNA FABR...' — вероятно Захарна Фабрика, София",
  },
  {
    id: "rr-anomaly",
    frameTime: "01:03",
    label: "Системна аномалия — статус ред",
    detail: "Кратко прекъсване. В статус реда се появява: NODE-7 / LIVE / 03:17",
    clueText: "Червена стая: NODE-7 / LIVE / 03:17 — системна аномалия в stream-а",
  },
  {
    id: "rr-laura",
    frameTime: "01:22",
    label: "Freeze frame — лице/позиция на Лора",
    detail: "Видима е дясна ръка върху стол. Бяла риза. Тъмна коса. Спряла е да се движи.",
    clueText: "Червена стая: Лора — бяла риза, тъмна коса, неподвижна позиция",
  },
  {
    id: "rr-phone",
    frameTime: "02:11",
    label: "Телефон — в края на stream-а",
    detail: "Лора се добира до телефон. Набира номер. Stream приключва след 8 секунди.",
    clueText: "Червена стая: Лора набира телефон в края — кому се обажда?",
  },
]

const SYSTEM_STATUS = [
  { key: "STREAM", value: "LIVE", color: ACCENT },
  { key: "NODE", value: "NODE-7", color: "#aaa" },
  { key: "HOPS", value: "3", color: "#00FF41" },
  { key: "ENTROPY", value: "HIGH", color: "#00FF41" },
  { key: "SIGNAL", value: "UNSTABLE", color: "#FF8800" },
]

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
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "#888",
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
            animate={{ color: signalNoise ? ACCENT : "#777" }}
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
          const isLocked = link.locked && !watermarkUnlocked
          const isCurrent = pathname === link.href
          return (
            <Link
              key={link.label}
              href={isLocked ? "#" : link.href}
              style={{
                padding: "8px 16px",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: isCurrent ? ACCENT : isLocked ? "#444" : "#aaa",
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
                if (!isCurrent) e.currentTarget.style.color = isLocked ? "#444" : "#aaa"
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
          <div style={{ marginLeft: "auto", fontSize: 10, fontFamily: "var(--font-mono)", color: "#888" }}>1,247 зрители</div>
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
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#888" }}>01:22 / 02:20</div>
          <div style={{
            fontSize: 9, fontFamily: "var(--font-mono)", color: signalNoise ? "#FF8800" : "#555",
            letterSpacing: "0.1em", transition: "color 0.1s",
          }}>{signalNoise ? "SIGNAL UNSTABLE" : "SIGNAL OK"}</div>
        </div>
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
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#888", letterSpacing: "0.2em" }}>
            PUZZLE RR1 — FRAME HUNT
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: allAnomaliesSelected ? "#00FF41" : "#888",
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
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: isSelected ? ACCENT : "#666", marginBottom: 5 }}>
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
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#666" }}>{frame.time}</div>
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

        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#888", letterSpacing: "0.2em", marginBottom: 12 }}>
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

        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#888", marginTop: 7 }}>
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
