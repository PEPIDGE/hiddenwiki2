"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF41"

const OPERATORS = [
  { id: "OP-001", callsign: "RedFox", realName: "Р.Ф.", level: "АРХИТЕКТ", cult: "Братство на третото пробуждане", status: "ACTIVE", lastSeen: "2025-10-16 03:14", relay: "HOPS=3", note: "Лидер и основател. Отговорен за ритуалите. Последна активност след изчезването.", anomaly: true, clue: "RedFox — АРХИТЕКТ на Братството. Активен в 03:14 на 16.10.2025 — след изчезването на Лора" },
  { id: "OP-002", callsign: "NightKiller", realName: "Н.К.", level: "ОПЕРАТОР", cult: "Братство / Нощен сигнал", status: "ACTIVE", lastSeen: "2025-10-15 23:55", relay: "HOPS=3", note: "Транзит оператор. Черен Audi A3. Последно виден в кв. Бенковски.", anomaly: true, clue: "NightKiller — транзит с черен Audi A3. Последен сигнал 23:55 на 15.10.2025 — кв. Бенковски" },
  { id: "OP-003", callsign: "GothGirl", realName: "Г.Г.", level: "ОПЕРАТОР", cult: "Братство / Нощен сигнал", status: "ACTIVE", lastSeen: "2025-10-13 18:22", relay: "HOPS=3", note: "Паролата в чат системата е сменена. Стара парола: joko1132. Нова е неизвестна.", anomaly: true, clue: "GothGirl — стара парола joko1132 (сменена). Достъп до /cult/chat-system изисква BruteForce" },
  { id: "OP-004", callsign: "ToxicBabe", realName: "Т.Б.", level: "ОПЕРАТОР", cult: "Братство", status: "ACTIVE", lastSeen: "2025-10-15 20:10", relay: "HOPS=3", note: "Отговаря за вербовка. Организатор на Огледален преход.", anomaly: false, clue: "ToxicBabe — вербовка и организация на Огледален преход. HOPS=3" },
  { id: "OP-005", callsign: "Black-Voyvoda", realName: "Б.В.", level: "ОПЕРАТОР", cult: "Братство", status: "ACTIVE", lastSeen: "2025-10-15 22:30", relay: "HOPS=3", note: "Охрана и логистика. Обаждане към Д. Михайлов в 22:15.", anomaly: true, clue: "Black-Voyvoda — охрана. Обажда се в 22:15 на 15.10.2025 — 3 мин след изчезването" },
  { id: "OP-006", callsign: "DataCracker6", realName: "Д.К.", level: "АНАЛИТИК", cult: "Братство / Архивът на сенките", status: "ACTIVE", lastSeen: "2025-10-14 11:00", relay: "HOPS=3", note: "Технически оператор. Отговорен за форум дъмпа и decoy документи.", anomaly: false, clue: "DataCracker6 — технически оператор. Публикувал decoy GPS координати в /leaks/docs" },
  { id: "OP-007", callsign: "NullSyn", realName: "Н.С.", level: "АНАЛИТИК", cult: "Кръг / Архивът на сенките", status: "ACTIVE", lastSeen: "2025-10-15 19:00", relay: "HOPS=2", note: "⚠ HOPS=2 — decoy или компрометиран. Публикувал фалшиви GPS данни.", anomaly: false, clue: "NullSyn — HOPS=2 (нереален). Decoy координатор — 3 фалшиви GPS изпращания" },
  { id: "OP-008", callsign: "OutsiderX", realName: "О.Х.", level: "ЛИДЕР", cult: "Кръг на лунното затъмнение", status: "INACTIVE", lastSeen: "2025-09-30 09:00", relay: "N/A", note: "Неактивен от октомври. Кръгът е отделна секта — слаба връзка с случая.", anomaly: false, clue: "OutsiderX — лидер на Кръга. Неактивен от 30.09.2025" },
]

const STATUS_COLOR: Record<string, string> = { ACTIVE: "#00FF41", UNKNOWN: ACCENT, DECOY: "#333" }

export default function CultOperatorsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [saved, setSaved] = useState<string[]>([])

  useEffect(() => {
    setSaved(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (op: typeof OPERATORS[number]) => {
    if (!op.clue) return
    const id = `cult-op-${op.id}`
    if (saved.includes(id)) return
    const gs = getGameState()
    saveGameState(addClue(gs, { id, title: `[OPERATORS] ${op.callsign}`, text: op.clue, sourceRoute: "/cult/operators", confidence: 3, status: "unverified" }))
    setSaved((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/cult" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none" }}>← CULT</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="OPERATORS" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>4 known оператора — 1 decoy. Идентификация само по callsign и relay.</div>
      </div>

      <div style={{ marginBottom: 16, padding: "10px 14px", border: "1px solid #1a1a1a", background: "#040404", fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", lineHeight: 1.7 }}>
        Правило: реален оператор = HOPS=3. HOPS≠3 = decoy или компрометиран.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {OPERATORS.map((op, i) => {
          const id = `cult-op-${op.id}`
          const isSaved = saved.includes(id)
          const isSelected = selected === op.id
          return (
            <div key={op.id}>
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                onClick={() => setSelected(isSelected ? null : op.id)}
                style={{ padding: "14px 16px", background: isSelected ? `${ACCENT}07` : "#040404", border: `1px solid ${isSelected ? `${ACCENT}30` : op.anomaly ? `${ACCENT}14` : "#111"}`, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#2a2a2a", marginBottom: 5 }}>{op.id} // {op.level}</div>
                    <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: isSelected ? ACCENT : op.anomaly ? "#cccccc" : "#909090", fontWeight: 700 }}>{op.callsign}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: STATUS_COLOR[op.status] ?? "#333" }}>{op.status}</div>
                    <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: op.relay === "HOPS=3" ? `${ACCENT}50` : "#FF000050", marginTop: 3 }}>{op.relay}</div>
                  </div>
                </div>
              </motion.div>
              <AnimatePresence>
                {isSelected && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", background: "#060208", border: `1px solid ${ACCENT}18`, borderTop: "none" }}>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", marginBottom: 4 }}>LAST SEEN: {op.lastSeen}</div>
                      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#999999", lineHeight: 1.7, marginBottom: op.clue ? 12 : 0 }}>{op.note}</div>
                      {op.clue && (
                        <>
                          <div style={{ padding: "8px 12px", background: "#080310", border: `1px solid ${ACCENT}20`, marginBottom: 10 }}>
                            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#3a1050", marginBottom: 3 }}>УЛИКА</div>
                            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT }}>{op.clue}</div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleSave(op) }} disabled={isSaved}
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
