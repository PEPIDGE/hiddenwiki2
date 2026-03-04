"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"
import { motion, AnimatePresence } from "framer-motion"

const ACCENT = "#FF0033"

const FRAMES = [
  { id: 1, time: "00:00:03", anomaly: false },
  { id: 2, time: "00:00:09", anomaly: false },
  { id: 3, time: "00:00:14", anomaly: true, marker: "[A3]", detail: "Силует — Audi A3 в задния план" },
  { id: 4, time: "00:00:22", anomaly: false },
  { id: 5, time: "00:00:31", anomaly: false },
  { id: 6, time: "00:00:38", anomaly: false },
  { id: 7, time: "00:00:47", anomaly: true, marker: "[13B]", detail: "Надпис '13B' — Секция, зона или апартамент" },
  { id: 8, time: "00:00:52", anomaly: false },
  { id: 9, time: "00:01:01", anomaly: false },
  { id: 10, time: "00:01:13", anomaly: false },
  { id: 11, time: "00:01:22", anomaly: true, marker: "[calm_voice]", detail: "Аудио аномалия — спокоен глас зад шума" },
  { id: 12, time: "00:01:34", anomaly: false },
]

const GRID_W = 16
const GRID_H = 10
const DEAD_PIXEL = { x: 11, y: 6 }

export default function FramesPage() {
  const [selected, setSelected] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null)
  const [pixelClicked, setPixelClicked] = useState(false)
  const [pixelSaved, setPixelSaved] = useState(false)

  const pixelGrid = useRef<number[][]>(
    Array.from({ length: GRID_H }, (_, y) =>
      Array.from({ length: GRID_W }, (_, x) => {
        if (x === DEAD_PIXEL.x && y === DEAD_PIXEL.y) return -1
        return Math.sin(x * 7.3 + y * 13.7) * 0.5 + 0.5
      })
    )
  ).current

  const toggle = (id: number) => {
    const frame = FRAMES.find((f) => f.id === id)
    if (!frame?.anomaly) return
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const allPicked = FRAMES.filter((f) => f.anomaly).every((f) => selected.includes(f.id)) && selected.length === 3

  const handleConfirm = () => {
    if (!allPicked) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id: "rr1-frame-markers",
      title: "Маркери от кадри: [A3]+[13B]+[calm_voice]",
      text: "Три аномални кадъра: черен Audi A3, секция 13B, спокоен глас зад шума.",
      sourceRoute: "/red-room/frames",
      confidence: 3,
      status: "unverified",
    })
    saveGameState(updated)
    setRevealed(true)
  }

  const handleDeadPixel = () => {
    setPixelClicked(true)
    if (!pixelSaved) {
      const gs = getGameState()
      const updated = addClue(gs, {
        id: "rr-dead-pixel",
        title: "[RED ROOM] Dead Pixel — координати 11×6",
        text: "Скрит мъртъв пиксел на позиция (11,6) в broadcast матрицата.",
        sourceRoute: "/red-room/frames",
        confidence: 2,
        status: "unverified",
      })
      saveGameState(updated)
      setPixelSaved(true)
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/red-room" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← RED ROOM
        </Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="BROADCAST FRAMES" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6, letterSpacing: "0.1em" }}>
          PUZZLE RR1 — 12 кадъра. Открий 3-те аномални и избери всички.
        </div>
      </div>

      {/* PIXEL GRID */}
      <div style={{ marginBottom: 28, border: "1px solid #181818", background: "#030303", padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a1a1a", letterSpacing: "0.2em" }}>
            BROADCAST MATRIX — PIXEL ANOMALY SCAN
          </div>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a1a1a" }}>{GRID_W}×{GRID_H}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${GRID_W}, 1fr)`, gap: 1 }}>
          {pixelGrid.map((row, y) =>
            row.map((val, x) => {
              const isDead = val === -1
              const isHov = hoveredPixel?.x === x && hoveredPixel?.y === y
              const b = isDead ? 0 : Math.floor(val * 14) + 4
              return (
                <div
                  key={`${x}-${y}`}
                  onClick={isDead ? handleDeadPixel : undefined}
                  onMouseEnter={() => setHoveredPixel({ x, y })}
                  onMouseLeave={() => setHoveredPixel(null)}
                  style={{
                    width: "100%", aspectRatio: "1",
                    background: isDead ? (isHov ? "#330000" : "#000") : isHov ? `rgba(${b + 40},${b + 20},${b + 20},1)` : `rgb(${b},${b},${b})`,
                    cursor: isDead ? "pointer" : "default",
                    boxShadow: isDead && isHov ? `0 0 6px ${ACCENT}60` : "none",
                    transition: "background 0.05s",
                  }}
                />
              )
            })
          )}
        </div>
        <div style={{ marginTop: 8, fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a1a1a" }}>
          {hoveredPixel ? `PIXEL (${hoveredPixel.x},${hoveredPixel.y}) — ${hoveredPixel.x === DEAD_PIXEL.x && hoveredPixel.y === DEAD_PIXEL.y ? "⚠ ANOMALY" : "NORMAL"}` : "Движи мишката върху матрицата."}
        </div>
        <AnimatePresence>
          {pixelClicked && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 10, padding: "9px 12px", border: `1px solid ${ACCENT}30`, background: "#0a0102", fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT }}>
              DEAD PIXEL @ (11,6) — КООРДИНАТИТЕ СА ЗАПИСАНИ В ДОСИЕ
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Frames grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3, marginBottom: 20 }}>
        {FRAMES.map((frame) => {
          const isSelected = selected.includes(frame.id)
          return (
            <div key={frame.id} onClick={() => toggle(frame.id)} style={{
              background: isSelected ? "#200008" : frame.anomaly ? "#120005" : "#0a0a0a",
              border: `1px solid ${isSelected ? ACCENT : frame.anomaly ? `${ACCENT}25` : "#0f0f0f"}`,
              padding: "14px 12px", cursor: frame.anomaly ? "pointer" : "default",
              transition: "all 0.15s", boxShadow: isSelected ? `0 0 12px ${ACCENT}30` : "none",
              position: "relative",
            }}>
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a1a1a", marginBottom: 8 }}>
                FRAME #{String(frame.id).padStart(3, "0")}
              </div>
              <div style={{
                height: 60, marginBottom: 8, position: "relative", overflow: "hidden",
                background: frame.anomaly ? "repeating-linear-gradient(135deg,#280008 2px,#180005 10px)" : "#060606",
              }}>
                {frame.anomaly && (
                  <div style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, fontWeight: 700,
                    opacity: isSelected ? 1 : 0.6,
                  }}>
                    {frame.marker}
                  </div>
                )}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg,transparent 3px,rgba(0,0,0,0.2) 4px)" }} />
              </div>
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a1a1a" }}>{frame.time}</div>
              {isSelected && <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: ACCENT, boxShadow: `0 0 6px ${ACCENT}` }} />}
            </div>
          )
        })}
      </div>

      <div style={{ padding: "12px 16px", border: `1px solid ${allPicked ? `${ACCENT}50` : "#1a1a1a"}`, background: "#080303", marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: allPicked ? ACCENT : "#333", letterSpacing: "0.1em", marginBottom: 6 }}>
          ИЗБРАНИ АНОМАЛИИ: {selected.length} / 3
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ width: 24, height: 3, background: i < selected.length ? ACCENT : "#1a1a1a", boxShadow: i < selected.length ? `0 0 6px ${ACCENT}` : "none" }} />
          ))}
        </div>
      </div>

      {allPicked && !revealed && (
        <button onClick={handleConfirm} style={{
          background: "transparent", border: `1px solid ${ACCENT}60`, color: ACCENT,
          fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.15em",
          padding: "10px 24px", cursor: "pointer", marginBottom: 16,
        }}>
          ПОТВЪРДИ ИЗБОРА
        </button>
      )}

      {revealed && (
        <div style={{ padding: 16, border: `1px solid ${ACCENT}40`, background: "#0d0305" }}>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.15em", marginBottom: 10 }}>
            [RR1 SOLVED] — МАРКЕРИ ЗАПИСАНИ В EVIDENCE BOARD
          </div>
          {FRAMES.filter((f) => f.anomaly).map((f) => (
            <div key={f.id} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: ACCENT, minWidth: 110 }}>{f.marker}</span>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#555", lineHeight: 1.5 }}>{f.detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
