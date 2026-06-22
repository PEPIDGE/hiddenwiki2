"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF41"

// RITUAL PUZZLE: 5-step ritual — must click in correct sequence (2,4,1,5,3) to unlock
const STEPS = [
  { id: 1, label: "ОГЛЕДАЛО", desc: "Постави огледалото лице надолу." },
  { id: 2, label: "СИМВОЛ", desc: "Начертай символа на Кръга." },
  { id: 3, label: "ВРЕМЕТО", desc: "Изчакай 03:17." },
  { id: 4, label: "ТОКЕН", desc: "Произнеси CIRCUIT-3 три пъти." },
  { id: 5, label: "ПРЕХОД", desc: "Стъпи зад огледалото." },
]

const CORRECT_SEQ = [2, 4, 1, 5, 3]

export default function CultRitualPage() {
  const [seq, setSeq] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const [error, setError] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleStep = (id: number) => {
    if (solved) return
    const next = [...seq, id]
    setSeq(next)

    if (next.length === CORRECT_SEQ.length) {
      if (JSON.stringify(next) === JSON.stringify(CORRECT_SEQ)) {
        setSolved(true)
        setError(false)
      } else {
        setError(true)
        setTimeout(() => { setSeq([]); setError(false) }, 1200)
      }
    } else if (next[next.length - 1] !== CORRECT_SEQ[next.length - 1]) {
      setError(true)
      setTimeout(() => { setSeq([]); setError(false) }, 900)
    }
  }

  const handleSave = () => {
    if (saved) return
    const gs = getGameState()
    saveGameState(addClue(gs, {
      id: "cult-ritual-complete",
      title: "[RITUAL] Завършен ритуал на Кръга",
      text: "Правилна последователност: СИМВОЛ→ТОКЕН→ОГЛЕДАЛО→ПРЕХОД→ВРЕМЕТО. CIRCUIT-3 е произнесен. Ритуалът е активиран.",
      sourceRoute: "/cult/ritual",
      confidence: 4,
      status: "confirmed",
    }))
    setSaved(true)
  }

  const progress = seq.length

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/cult" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>← CULT</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="RITUAL" as="h2" intensity="medium" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>PUZZLE CR1 — Виж Доктрина D-05. Намери правилната последователност от 5 стъпки.</div>
      </div>

      {/* Ritual circle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28, position: "relative" }}>
        <svg width={220} height={220} viewBox="0 0 220 220">
          <circle cx={110} cy={110} r={95} fill="none" stroke={`${ACCENT}12`} strokeWidth={1} />
          <circle cx={110} cy={110} r={60} fill="none" stroke={`${ACCENT}20`} strokeWidth={1} />
          {STEPS.map((step, i) => {
            const angle = (i / STEPS.length) * Math.PI * 2 - Math.PI / 2
            const x = 110 + Math.cos(angle) * 80
            const y = 110 + Math.sin(angle) * 80
            const isActive = seq.includes(step.id)
            const pos = seq.indexOf(step.id) + 1
            return (
              <g key={step.id} onClick={() => handleStep(step.id)} style={{ cursor: "pointer" }}>
                <rect x={x - 18} y={y - 9} width={36} height={18} fill={isActive ? `${ACCENT}18` : "#050505"} stroke={isActive ? ACCENT : `${ACCENT}25`} strokeWidth={0.5} rx={1} />
                <text x={x} y={y + 4} textAnchor="middle" style={{ fontSize: "5px", fill: isActive ? ACCENT : `${ACCENT}50`, fontFamily: "monospace" }}>
                  {pos > 0 ? `#${pos} ` : ""}{step.label}
                </text>
              </g>
            )
          })}
          {/* Center */}
          <rect x={101} y={101} width={18} height={18} fill={solved ? `${ACCENT}30` : "#030303"} stroke={solved ? ACCENT : `${ACCENT}30`} strokeWidth={1} transform="rotate(45 110 110)" />
        </svg>
      </div>

      {/* Progress */}
      <div style={{ padding: "12px 16px", border: `1px solid ${error ? "#FF003340" : solved ? `${ACCENT}40` : "#181818"}`, background: "#060208", marginBottom: 16, transition: "border-color 0.3s" }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: error ? "#FF0033" : solved ? ACCENT : "#333", letterSpacing: "0.1em", marginBottom: 6 }}>
          {error ? "WRONG SEQUENCE — RESET" : solved ? "[CR1 SOLVED] — RITUAL COMPLETE" : `SEQUENCE: ${progress}/5`}
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, background: error ? "#FF003360" : i < progress ? ACCENT : "#1a1a1a", boxShadow: i < progress && !error ? `0 0 6px ${ACCENT}` : "none", transition: "all 0.2s" }} />
          ))}
        </div>
      </div>

      {/* Steps list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 20 }}>
        {STEPS.map((step) => {
          const pos = seq.indexOf(step.id) + 1
          return (
            <motion.div key={step.id} whileHover={{ scale: 1.01 }} onClick={() => handleStep(step.id)}
              style={{ padding: "12px 16px", background: pos > 0 ? `${ACCENT}08` : "#040404", border: `1px solid ${pos > 0 ? `${ACCENT}35` : "#111"}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: pos > 0 ? `${ACCENT}70` : "#2a2a2a", marginBottom: 3 }}>СТЪПКА {step.id}</div>
                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: pos > 0 ? ACCENT : "#999999", fontWeight: 700 }}>{step.label}</div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 3 }}>{step.desc}</div>
              </div>
              {pos > 0 && <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, fontWeight: 700 }}>#{pos}</div>}
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {solved && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: "14px 16px", border: `1px solid ${ACCENT}40`, background: "#060208" }}>
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: `${ACCENT}70`, letterSpacing: "0.15em", marginBottom: 8 }}>РИТУАЛЪТ Е ЗАВЪРШЕН</div>
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", lineHeight: 1.7, marginBottom: 10 }}>
              Последователност: СИМВОЛ → ТОКЕН → ОГЛЕДАЛО → ПРЕХОД → ВРЕМЕТО<br />
              Подсказка за КРЪГЪТ код: следвай числата — 2,4,1,5,3.
            </div>
            <button onClick={handleSave} disabled={saved}
              style={{ background: "transparent", border: `1px solid ${saved ? "#222" : `${ACCENT}40`}`, color: saved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 9, padding: "7px 18px", cursor: saved ? "default" : "pointer" }}>
              {saved ? "ЗАПИСАНО В EVIDENCE BOARD" : "ЗАПАЗИ УЛИКА"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
