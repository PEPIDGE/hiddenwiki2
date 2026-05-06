"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00BFFF"

const ARTIFACTS = [
  { id: "OGL-001", label: "Лого на Огледален преход", desc: "Официален флаер от NDK събитие. Датиран 21.09.2025.", anomaly: false, tags: ["events", "ogledalen"] },
  { id: "OGL-002", label: "Снимка — Лора и NightKiller", desc: "Силует с черна качулка до Лора. Снимка #14 от ALB-01.", anomaly: true, reveal: "Силует на NightKiller до Лора на Огледален преход 21.09 — 3 седмици преди изчезването", tags: ["people", "key"] },
  { id: "OGL-003", label: "Покана за 15.10", desc: "Ръкописна покана. Без адрес. Намерена в телефона на Лора.", anomaly: true, reveal: "Ръкописна покана до Лора за Огледален преход 15.10 — без подател, без адрес", tags: ["doc", "key"] },
  { id: "OGL-004", label: "Символ на Братството", desc: "Гравиран на стена в Захарна фабрика. Съвпада с фенерчето от стая 7.", anomaly: false, tags: ["cult", "bratstvo"] },
  { id: "OGL-005", label: "Снимка — Черен Audi пред NDK", desc: "Снимка #18 от ALB-01. Рег. частично четима: СА ○○○○.", anomaly: true, reveal: "Черен Audi A3 пред NDK на 21.09.2025 — регистрация СА ****. Съвпада с MATCH в /leaks/vehicles", tags: ["vehicle", "key"] },
  { id: "OGL-006", label: "Стая 9 — Захарна фабрика", desc: "Документален снимков запис. Жълто-черна лента. Залостена отвътре.", anomaly: false, tags: ["location", "zaharna"] },
]

export default function MirrorsGalleryPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [cluesSaved, setCluesSaved] = useState<string[]>([])

  useEffect(() => {
    const gs = getGameState()
    const saved = gs.clues.map((c) => c.id)
    setCluesSaved(saved)
  }, [])

  const handleSaveClue = (artifact: typeof ARTIFACTS[number]) => {
    if (!artifact.anomaly || !artifact.reveal) return
    const id = `gallery-${artifact.id}`
    if (cluesSaved.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id,
      title: `[GALLERY] ${artifact.label}`,
      text: artifact.reveal,
      sourceRoute: "/mirrors/gallery",
      confidence: 2,
      status: "unverified",
    })
    saveGameState(updated)
    setCluesSaved((prev) => [...prev, id])
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.3em", marginBottom: 8 }}>
          MIRRORS / GALLERY — ARS ARTIFACT CATALOG
        </div>
        <GlitchText text="GALLERY" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 8 }}>
          <div style={{ height: 1, width: 40, background: ACCENT, opacity: 0.5 }} />
          <div style={{ height: 1, flex: 1, background: "#181818" }} />
        </div>
      </div>

      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333333", lineHeight: 1.8, marginBottom: 24, maxWidth: 500 }}>
        Каталог на ARS артефакти. Два записа съдържат аномалии — скрити препратки.
        Кликни върху артефакт за детайли.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginBottom: 24 }}>
        {ARTIFACTS.map((art) => {
          const isSaved = cluesSaved.includes(`gallery-${art.id}`)
          return (
            <motion.div
              key={art.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelected(selected === art.id ? null : art.id)}
              style={{
                background: selected === art.id ? `${ACCENT}0a` : "#060606",
                border: `1px solid ${selected === art.id ? `${ACCENT}35` : art.anomaly ? `${ACCENT}14` : "#111111"}`,
                padding: "14px 14px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {art.anomaly && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 1,
                  background: ACCENT, opacity: 0.3,
                }} />
              )}
              <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#1e1e1e", letterSpacing: "0.15em", marginBottom: 6 }}>
                {art.id}
              </div>
              <div style={{ width: "100%", height: 70, background: art.anomaly ? `repeating-linear-gradient(135deg, #040c14, #040c14 2px, #030911 2px, #030911 8px)` : "#030303", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {art.anomaly ? (
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: `${ACCENT}35`, letterSpacing: "0.1em" }}>[ ANOMALY ]</div>
                ) : (
                  <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#0e0e0e" }}>NO DATA</div>
                )}
              </div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: selected === art.id ? ACCENT : "#888888", fontWeight: 700, marginBottom: 4, letterSpacing: "0.06em" }}>
                {art.label}
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {art.tags.map((t) => (
                  <span key={t} style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", border: "1px solid #181818", padding: "1px 5px" }}>
                    {t}
                  </span>
                ))}
                {isSaved && (
                  <span style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: `${ACCENT}60`, border: `1px solid ${ACCENT}20`, padding: "1px 5px" }}>
                    SAVED
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {selected && (() => {
          const art = ARTIFACTS.find((a) => a.id === selected)!
          return (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{ padding: "16px 18px", border: `1px solid ${art.anomaly ? `${ACCENT}30` : "#222222"}`, background: "#040810", marginBottom: 20 }}
            >
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a2a2a", letterSpacing: "0.18em", marginBottom: 8 }}>{art.id}</div>
              <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: art.anomaly ? ACCENT : "#888888", fontWeight: 700, marginBottom: 10 }}>{art.label}</div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#555555", lineHeight: 1.8, marginBottom: 14 }}>{art.desc}</div>
              {art.anomaly && art.reveal && (
                <div style={{ padding: "10px 14px", border: `1px solid ${ACCENT}25`, background: "#03070c", marginBottom: 12 }}>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a4a5a", letterSpacing: "0.15em", marginBottom: 4 }}>АНОМАЛИЯ ОТКРИТА</div>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.08em" }}>{art.reveal}</div>
                </div>
              )}
              {art.anomaly && (
                <button
                  onClick={() => handleSaveClue(art)}
                  disabled={cluesSaved.includes(`gallery-${art.id}`)}
                  style={{
                    background: "transparent", border: `1px solid ${ACCENT}40`,
                    color: cluesSaved.includes(`gallery-${art.id}`) ? "#2a2a2a" : ACCENT,
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    letterSpacing: "0.1em", padding: "7px 18px", cursor: "pointer",
                  }}
                >
                  {cluesSaved.includes(`gallery-${art.id}`) ? "УЛИКА ЗАПИСАНА" : "ЗАПАЗИ УЛИКА"}
                </button>
              )}
            </motion.div>
          )
        })()}
      </AnimatePresence>

      <Link href="/hidden-wiki-2/mirrors" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: `${ACCENT}40`, textDecoration: "none", letterSpacing: "0.1em" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
        onMouseLeave={(e) => (e.currentTarget.style.color = `${ACCENT}40`)}>
        ← MIRRORS INDEX
      </Link>
    </div>
  )
}
