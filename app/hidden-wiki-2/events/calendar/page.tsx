"use client"

import { useState } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF41"

const CALENDAR_EVENTS = [
  { date: "2025-09-01", time: "22:00", title: "Братство — вътрешна среща", note: "Ритуална. Локация неизвестна.", highlight: false, clue: null },
  { date: "2025-09-21", time: "19:00", title: "Огледален преход — NDK", note: "40+ участника. Лора Костова присъства.", highlight: true, clue: "Огледален преход 21.09 в NDK — три секти + Лора Костова (гражданска)" },
  { date: "2025-09-21", time: "23:30", title: "Частно събирание след NDK", note: "Наблюдавани: ToxicBabe, OutsiderX, GothGirl", highlight: false, clue: null },
  { date: "2025-10-08", time: "20:00", title: "Нощен сигнал — дебрифинг", note: "Отменено — причина неизвестна.", highlight: false, clue: null },
  { date: "2025-10-12", time: "14:00", title: "GothGirl — последна активност в чат", note: "3 дни преди промяната на паролата", highlight: true, clue: "GothGirl последно активна в чат на 12.10.2025 — паролата сменена 3 дни по-рано от 15.10" },
  { date: "2025-10-15", time: "22:07", title: "Р. Алексиев — зареждане Shell, ул. Бенковски", note: "Само 800м от дома на Лора", highlight: true, clue: "Shell зареждане 22:07 на 15.10 — 800м от Лора. Предишни покупки: тетрабеназин без рецепта" },
  { date: "2025-10-15", time: "22:09", title: "Черен Audi A3 — мине покрай бл. 14", note: "Засечен от камерата на ул. Роза", highlight: true, clue: "Черен Audi A3 в 22:09 пред бл. 14 — 5 мин преди Лора да изчезне" },
  { date: "2025-10-15", time: "22:12", title: "Лора Костова — последен сигнал", note: "Телефонен сигнал изчезва. Последно обаждане: +359 88 412 1221", highlight: true, clue: "22:12 — Лора изчезва. Последното й обаждане е към +359 88 412 1221 (Братство / Д. Михайлов)" },
  { date: "2025-10-16", time: "01:30", title: "Захарна фабрика — движение, западно крило", note: "Засечено на охранителна камера", highlight: true, clue: "Движение в Захарна фабрика 01:30 на 16.10 — западно крило, стая 9" },
  { date: "2025-10-16", time: "09:00", title: "Сигнал за изчезване — полиция", note: "Подадено от съсед", highlight: false, clue: null },
  { date: "2025-10-17", time: "14:00", title: "Телефонът на Лора намерен — Захарна фабрика", note: "Разбит екран. Снимки изтеглени.", highlight: true, clue: "Телефонът на Лора намерен в Захарна фабрика — снимки от ALB-04 изтеглени" },
]

export default function EventsCalendarPage() {
  const [saved, setSaved] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  const handleSave = (ev: typeof CALENDAR_EVENTS[number], idx: number) => {
    if (!ev.clue) return
    const id = `cal-ev-${idx}`
    if (saved.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id,
      title: `[CALENDAR] ${ev.title}`,
      text: ev.clue,
      sourceRoute: "/events/calendar",
      confidence: 3,
      status: "unverified",
    })
    saveGameState(updated)
    setSaved((p) => [...p, id])
  }

  const months = ["ноември 2024", "декември 2024"]

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/hidden-wiki-2/events" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", textDecoration: "none", letterSpacing: "0.1em" }}>← EVENTS</Link>
        <div style={{ height: 1, background: "#111", margin: "10px 0" }} />
        <GlitchText text="CALENDAR" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", marginTop: 6 }}>Хронологичен изглед — 4 критични времеви маркера.</div>
      </div>

      <div style={{ position: "relative", paddingLeft: 80 }}>
        <div style={{ position: "absolute", left: 56, top: 0, bottom: 0, width: 1, background: "#141414" }} />

        {CALENDAR_EVENTS.map((ev, i) => {
          const id = `cal-ev-${i}`
          const isSaved = saved.includes(id)
          const isSelected = selected === id
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{ position: "relative", marginBottom: 3 }}>
              {/* Date label */}
              <div style={{ position: "absolute", left: -72, top: 12, textAlign: "right", width: 64 }}>
                <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: ev.highlight ? ACCENT : "#222", letterSpacing: "0.06em" }}>
                  {ev.date.slice(5)}
                </div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ev.highlight ? ACCENT : "#1a1a1a", fontWeight: ev.highlight ? 700 : 400 }}>
                  {ev.time}
                </div>
              </div>
              {/* Node */}
              <div style={{
                position: "absolute", left: -11, top: 14, width: 7, height: 7,
                background: ev.highlight ? ACCENT : "#181818",
                boxShadow: ev.highlight ? `0 0 8px ${ACCENT}60` : "none",
              }} />

              <div onClick={() => setSelected(isSelected ? null : id)} style={{
                padding: "11px 14px",
                background: isSelected ? `${ACCENT}08` : "#040404",
                border: `1px solid ${isSelected ? `${ACCENT}35` : ev.highlight ? `${ACCENT}18` : "#0f0f0f"}`,
                cursor: "pointer",
              }}>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: isSelected ? ACCENT : ev.highlight ? "#cccccc" : "#909090", fontWeight: ev.highlight ? 700 : 400 }}>
                  {ev.title}
                </div>
                {ev.note && <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", marginTop: 3 }}>{ev.note}</div>}
              </div>

              <AnimatePresence>
                {isSelected && ev.clue && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.16 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", background: "#060300", border: `1px solid ${ACCENT}20`, borderTop: "none" }}>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#3a2000", letterSpacing: "0.12em", marginBottom: 4 }}>УЛИКА</div>
                      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, marginBottom: 10 }}>{ev.clue}</div>
                      <button onClick={(e) => { e.stopPropagation(); handleSave(ev, i) }} disabled={isSaved}
                        style={{ background: "transparent", border: `1px solid ${isSaved ? "#222" : `${ACCENT}40`}`, color: isSaved ? "#2a2a2a" : ACCENT, fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", padding: "6px 16px", cursor: isSaved ? "default" : "pointer" }}>
                        {isSaved ? "ЗАПИСАНО" : "ЗАПАЗИ УЛИКА"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
