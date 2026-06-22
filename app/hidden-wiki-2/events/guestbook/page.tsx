"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF41"

// Guest list showing 3 cults at Ogledalen Prehod event
const EVENTS_GUESTS = [
  {
    eventId: "EV-OGL-01",
    eventName: "Огледален преход — 21.09.2025",
    location: "NDK, Sofia",
    guests: [
      { name: "ToxicBabe", org: "Братство на третото пробуждане", status: "ПОТВЪРДЕН", note: "Организатор" },
      { name: "OutsiderX", org: "Кръг на лунното затъмнение", status: "ПОТВЪРДЕН", note: "Представен като гост-лектор" },
      { name: "NightKiller", org: "Нощен сигнал", status: "ПОТВЪРДЕН", note: "Технически персонал" },
      { name: "Black-Voyvoda", org: "Братство на третото пробуждане", status: "ПОТВЪРДЕН", note: "Охрана" },
      { name: "GothGirl", org: "Братство / Нощен сигнал", status: "ПОТВЪРДЕН", note: "Регистрация" },
      { name: "NullSyn", org: "Кръг на лунното затъмнение", status: "ПОТВЪРДЕН", note: "" },
      { name: "DataCracker6", org: "Братство на третото пробуждане", status: "ПОТВЪРДЕН", note: "Фотограф (официален)" },
      { name: "Лора Костова", org: "—", status: "РЕГИСТРИРАН", note: "⚠ Гражданско лице — не е член. Поканена от GothGirl.", key: true },
      { name: "М. Петрова", org: "—", status: "РЕГИСТРИРАН", note: "Гражданско лице" },
      { name: "Т. Борисов", org: "—", status: "РЕГИСТРИРАН", note: "Гражданско лице" },
      { name: "RedFox", org: "Братство на третото пробуждане", status: "НЕПОТВЪРДЕН", note: "Не е регистриран лично — комуникира дистанционно" },
    ],
    clue: "Огледален преход 21.09.2025 — три секти: Братство, Кръг, Нощен сигнал. Лора Костова поканена от GothGirl",
    warning: true,
  },
  {
    eventId: "EV-OGL-02",
    eventName: "Огледален преход — 15.10.2025 [ОТМЕНЕНО?]",
    location: "Неизвестна — Захарна фабрика?",
    guests: [
      { name: "NightKiller", org: "Нощен сигнал", status: "ПОТВЪРДЕН", note: "Транспорт" },
      { name: "Black-Voyvoda", org: "Братство на третото пробуждане", status: "ПОТВЪРДЕН", note: "Охрана" },
      { name: "RedFox", org: "Братство на третото пробуждане", status: "ПОТВЪРДЕН", note: "Лично" },
      { name: "Лора Костова", org: "—", status: "НЕИЗВЕСТЕН", note: "⚠ Получила покана. Изчезнала в нощта на събитието.", key: true },
    ],
    clue: "Събитие 15.10.2025 — RedFox, NightKiller, Black-Voyvoda потвърдени. Лора получила покана — изчезва в нощта",
    warning: true,
  },
  {
    eventId: "EV-KRAG-01",
    eventName: "Кръг — месечна среща, октомври 2025",
    location: "Неизвестна",
    guests: [
      { name: "OutsiderX", org: "Кръг на лунното затъмнение", status: "ПОТВЪРДЕН", note: "Председател" },
      { name: "NullSyn", org: "Кръг на лунното затъмнение", status: "ПОТВЪРДЕН", note: "" },
    ],
    clue: "Кръгова среща, октомври 2025 — слаба връзка с основния случай",
    warning: false,
  },
]

const ORG_COLORS: Record<string, string> = {
  "Братство на третото пробуждане": "#FF0033",
  "Кръг на лунното затъмнение": "#00FF41",
  "Нощен сигнал": ACCENT,
  "Братство / Нощен сигнал": "#FF6B33",
  "Братство на третото пробуждане / Нощен сигнал": ACCENT,
  "—": "#909090",
}

export default function EventsGuestbookPage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string>("EV-OGL-01")

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (ev: typeof EVENTS_GUESTS[number], suffix = "event") => {
    const id = `guestbook-${ev.eventId}-${suffix}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[GUESTBOOK] ${ev.eventName}`,
      text: ev.clue, sourceRoute: "/events/guestbook",
      confidence: ev.warning ? 4 : 2, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  const handleSaveGuest = (ev: typeof EVENTS_GUESTS[number], guestName: string, note: string) => {
    const id = `guestbook-${ev.eventId}-guest-${guestName.replace(/\s/g, "_")}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[GUESTBOOK] ${guestName} @ ${ev.eventName}`,
      text: `${guestName} — ${note}`, sourceRoute: "/events/guestbook",
      confidence: 4, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/hidden-wiki-2/events" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", textDecoration: "none" }}>← EVENTS</Link>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="GUESTBOOK" as="h2" intensity="low" className="text-xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <div style={{ padding: "10px 14px", background: "#0d0500", border: `1px solid ${ACCENT}20`, marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Списъци с гости от ключови събития. <span style={{ color: ACCENT }}>Лора Костова</span> е регистрирана на Огледален преход 21.09. Тя е поканена от <span style={{ color: ACCENT }}>GothGirl</span>.
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {EVENTS_GUESTS.map((ev) => (
          <button key={ev.eventId} onClick={() => setExpanded(ev.eventId)}
            style={{ padding: "5px 12px", fontSize: 9, fontFamily: "var(--font-mono)", background: expanded === ev.eventId ? `${ACCENT}22` : "#0d0d0d", color: expanded === ev.eventId ? ACCENT : "#999999", border: `1px solid ${expanded === ev.eventId ? ACCENT + "50" : "#1e1e1e"}`, cursor: "pointer", letterSpacing: "0.08em" }}>
            {ev.eventId}
          </button>
        ))}
      </div>

      {EVENTS_GUESTS.filter((ev) => ev.eventId === expanded).map((ev) => (
        <motion.div key={ev.eventId} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ padding: "14px 18px", background: "#090909", border: `1px solid ${ev.warning ? ACCENT + "20" : "#1a1a1a"}`, marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ev.warning ? ACCENT : "#909090", letterSpacing: "0.15em", marginBottom: 6 }}>
              {ev.eventId} {ev.warning && "⚠"}
            </div>
            <div style={{ fontSize: 15, fontFamily: "var(--font-mono)", color: "#e0e0e0", fontWeight: 700, marginBottom: 4 }}>{ev.eventName}</div>
            <div style={{ fontSize: 10, color: "#999999", fontFamily: "var(--font-mono)", marginBottom: 12 }}>📍 {ev.location}</div>
            <div style={{ padding: "8px 12px", background: "#0a0300", border: `1px solid ${ACCENT}15`, marginBottom: 12, fontSize: 10, color: "#c0c0c0", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
              {ev.clue}
            </div>
            <button onClick={() => handleSave(ev)}
              style={{ padding: "4px 14px", fontSize: 9, fontFamily: "var(--font-mono)", background: savedClues.includes(`guestbook-${ev.eventId}-event`) ? `${ACCENT}18` : "#111", color: savedClues.includes(`guestbook-${ev.eventId}-event`) ? ACCENT : "#aaaaaa", border: `1px solid ${savedClues.includes(`guestbook-${ev.eventId}-event`) ? ACCENT + "50" : "#222"}`, cursor: "pointer" }}>
              {savedClues.includes(`guestbook-${ev.eventId}-event`) ? "✓ SAVED" : "SAVE EVENT CLUE"}
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #222" }}>
                {["ИМЕ", "ОРГАНИЗАЦИЯ", "СТАТУС", "БЕЛЕЖКИ", ""].map((h) => (
                  <th key={h} style={{ padding: "7px 10px", fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.12em", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ev.guests.map((g) => (
                <tr key={g.name} style={{ borderBottom: "1px solid #131313", background: (g as any).key ? "#0d0000" : "transparent" }}>
                  <td style={{ padding: "9px 10px" }}>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: (g as any).key ? "#FF0033" : "#d0d0d0", fontWeight: (g as any).key ? 700 : 400 }}>{g.name}</span>
                    {(g as any).key && <span style={{ marginLeft: 6, fontSize: 7, color: "#FF0033", border: "1px solid #FF003340", padding: "1px 4px" }}>KEY</span>}
                  </td>
                  <td style={{ padding: "9px 10px" }}>
                    <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ORG_COLORS[g.org] || "#999999" }}>{g.org}</span>
                  </td>
                  <td style={{ padding: "9px 10px", fontSize: 9, color: g.status === "НЕИЗВЕСТЕН" ? "#FF0033" : "#cccccc", fontFamily: "var(--font-mono)" }}>{g.status}</td>
                  <td style={{ padding: "9px 10px", fontSize: 9, color: (g as any).key ? ACCENT : "#999999", fontFamily: "var(--font-mono)", maxWidth: 220 }}>{g.note}</td>
                  <td style={{ padding: "9px 10px" }}>
                    {(g as any).key && (
                      <button onClick={() => handleSaveGuest(ev, g.name, g.note)}
                        style={{ padding: "2px 8px", fontSize: 7, fontFamily: "var(--font-mono)", background: savedClues.includes(`guestbook-${ev.eventId}-guest-${g.name.replace(/\s/g, "_")}`) ? `${ACCENT}18` : "#0d0d0d", color: savedClues.includes(`guestbook-${ev.eventId}-guest-${g.name.replace(/\s/g, "_")}`) ? ACCENT : "#909090", border: "1px solid #222", cursor: "pointer" }}>
                        {savedClues.includes(`guestbook-${ev.eventId}-guest-${g.name.replace(/\s/g, "_")}`) ? "✓" : "SAVE"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ))}
    </div>
  )
}
