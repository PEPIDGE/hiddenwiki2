"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#CC44FF"

const DOCTRINES = [
  { id: "D-01", title: "Закон на Огледалото", text: "Всеки участник поддържа огледална идентичност. Реалното и отражението са равнозначни.", clue: null },
  { id: "D-02", title: "Протокол за Транзит", text: "При транзит: автомобилът трябва да е тъмен, вход само в 18:30 или 22:17. Апартамент [REDACTED].", clue: "Транзит: 18:30 или 22:17. Тъмен автомобил — задължително." },
  { id: "D-03", title: "Нивова Йерархия", text: "Три нива: Посветен / Оператор / Архитект. Архитектът е известен само като CIRCUIT-3.", clue: "CIRCUIT-3 = Архитект на Кръга — най-високо ниво" },
  { id: "D-04", title: "Правило на Мълчанието", text: "Комуникация само чрез relay nodes с HOPS=3. Всеки с HOPS≠3 е компрометиран.", clue: "HOPS=3 = задължително. HOPS≠3 = decoy или компрометиран" },
  { id: "D-05", title: "Финалният Преход", text: "Три потвърдени доказателства активират TRACE-NODE. Последователност: [REDACTED]→[REDACTED]→[REDACTED].", clue: "3 confirmed улики → TRACE-NODE активиран" },
]

export default function CultDoctrinePage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])

  const handleSave = (d: typeof DOCTRINES[number]) => {
    if (!d.clue) return
    const id = `doctrine-${d.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    saveGameState(addClue(gs, { id, title: `[DOCTRINE] ${d.title}`, text: d.clue, sourceRoute: "/cult/doctrine", confidence: 4, status: "unverified" }))
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/cult" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>← CULT</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="DOCTRINE" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>Петте закона на Кръга. 4 съдържат оперативни улики.</div>
      </div>

      {/* Cult symbol */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <div style={{ position: "relative", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 56, height: 56, border: `1px solid ${ACCENT}15`, transform: "rotate(45deg)" }} />
          <div style={{ position: "absolute", width: 36, height: 36, border: `1px solid ${ACCENT}25` }} />
          <div style={{ width: 6, height: 6, background: `${ACCENT}30`, border: `1px solid ${ACCENT}50` }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {DOCTRINES.map((d, i) => {
          const id = `doctrine-${d.id}`
          const isSaved = saved.includes(id)
          const isExp = expanded === d.id
          return (
            <div key={d.id}>
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                onClick={() => setExpanded(isExp ? null : d.id)}
                style={{ padding: "14px 16px", background: isExp ? `${ACCENT}07` : "#050505", border: `1px solid ${isExp ? `${ACCENT}35` : d.clue ? `${ACCENT}14` : "#111"}`, cursor: "pointer", position: "relative" }}>
                {d.clue && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 1, background: ACCENT, opacity: 0.3 }} />}
                <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", marginBottom: 5 }}>ЗАКОН {d.id}</div>
                <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: isExp ? ACCENT : "#bbbbbb", fontWeight: 700 }}>{d.title}</div>
              </motion.div>
              <AnimatePresence>
                {isExp && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", background: "#060208", border: `1px solid ${ACCENT}18`, borderTop: "none" }}>
                      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#999999", lineHeight: 1.8, marginBottom: d.clue ? 12 : 0 }}>{d.text}</div>
                      {d.clue && (
                        <>
                          <div style={{ padding: "8px 12px", background: "#080310", border: `1px solid ${ACCENT}20`, marginBottom: 10 }}>
                            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#3a1050", marginBottom: 3 }}>УЛИКА</div>
                            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT }}>{d.clue}</div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleSave(d) }} disabled={isSaved}
                            style={{ background: "transparent", border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`, color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 9, padding: "6px 16px", cursor: isSaved ? "default" : "pointer" }}>
                            {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ УЛИКА"}
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
