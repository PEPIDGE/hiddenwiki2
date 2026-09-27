"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"
import { PageHeader } from "@/components/tor/ui"

const ACCENT = "#00FF41"

const ORGS = [
  {
    id: "ORG-01",
    publicName: "Арт Студио Nexus",
    realName: "Братство на третото пробуждане",
    type: "СЕКТА",
    events: ["Огледален преход (21.09.2025)", "Захарна фабрика (16.10.2025)"],
    contact: "+359 88 414 1221",
    website: "artnexus-sofia.bg [offline]",
    warning: true,
    clue: "Арт Студио Nexus = публичен front на Братството. Организира Огледален преход и събитието в Захарна фабрика",
  },
  {
    id: "ORG-02",
    publicName: "Лунен Кръг — Астрология и Медитация",
    realName: "Институтът на Чистата формула",
    type: "СЕКТА",
    events: ["Месечни срещи (различни локации)", "Огледален преход (21.09.2025)"],
    contact: "+359 88 600 7700",
    website: "lunenkrag.bg",
    warning: false,
    clue: "Лунен Кръг = публично прикритие на Института на Чистата формула. Участва в Огледален преход",
  },
  {
    id: "ORG-03",
    publicName: "Огледален преход",
    realName: "Съвместна операция: Братство + Чистата формула + Нощен сигнал",
    type: "СЪБИТИЙНА ОРГАНИЗАЦИЯ",
    events: ["21.09.2025 — NDK, Sofia (потвърдено)", "15.10.2025 — CANCELLED (или ПРЕМЕСТЕНО?)"],
    contact: "+359 87 500 1030",
    website: "ogledalen-prehod.net",
    warning: true,
    clue: "Огледален преход — три секти работят заедно. Лора видяна на събитие от 21.09. Събитието на 15.10 е отменено или преместено",
  },
  {
    id: "ORG-04",
    publicName: "Нощен сигнал FM",
    realName: "Нощен сигнал",
    type: "СЕКТА",
    events: ["Неофициални събирания (нощни)", "Събитие 15.10.2025 (неясно)"],
    contact: "+359 88 414 1221",
    website: "noshten-signal.net [offline]",
    warning: true,
    clue: "Нощен сигнал FM = front на Нощен сигнал. Споделя телефон с оператор Д. Михайлов",
  },
  {
    id: "ORG-05",
    publicName: "Документален архив — Balkantrace",
    realName: "Архивът на сенките",
    type: "ОНЛАЙН ОРГАНИЗАЦИЯ",
    events: ["Без публични събития"],
    contact: "N/A",
    website: "balkantrace.onion",
    warning: false,
    clue: "Balkantrace = front на Архивът на сенките. Публикува decoy GPS данни",
  },
]

export default function EventsPage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (org: typeof ORGS[number]) => {
    const id = `events-org-${org.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[EVENTS] ${org.publicName}`,
      text: org.clue, sourceRoute: "/events",
      confidence: org.warning ? 4 : 2, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <PageHeader
        title="EVENTS"
        accent={ACCENT}
        kicker="EVENTS // ORGANIZATIONS & FRONTS"
        intro={
          <>
            Организации и техните публични fronts. <span style={{ color: ACCENT }}>Огледален преход</span> е събитие с три секти — ключова точка в случая с Лора Костова.
          </>
        }
      />


      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {ORGS.map((org, i) => {
          const isExpanded = expanded === org.id
          const isSaved = savedClues.includes(`events-org-${org.id}`)
          return (
            <motion.div key={org.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div style={{ background: "#090909", border: `1px solid ${org.warning ? "#1a0500" : "#141414"}`, position: "relative" }}>
                {org.warning && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: ACCENT, opacity: 0.4 }} />}
                <div style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12 }}
                  onClick={() => setExpanded(isExpanded ? null : org.id)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: org.warning ? ACCENT : "#909090", border: `1px solid ${org.warning ? ACCENT + "30" : "#222"}`, padding: "1px 6px", letterSpacing: "0.12em" }}>{org.type}</span>
                      {org.warning && <span style={{ fontSize: 9, color: "#FF0033", fontFamily: "var(--font-mono)" }}>⚠</span>}
                    </div>
                    <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: org.warning ? "#e0d0c0" : "#c0c0c0", fontWeight: 600, marginBottom: 4 }}>
                      {org.publicName}
                    </div>
                    <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#909090" }}>
                      <span style={{ color: "#727272" }}>Реална организация: </span>
                      <span style={{ color: org.warning ? ACCENT : "#999999" }}>{org.realName}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: "#727272", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{isExpanded ? "▲" : "▼"}</span>
                </div>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    style={{ borderTop: "1px solid #141414", padding: "14px 18px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#727272", fontFamily: "var(--font-mono)", marginBottom: 4, letterSpacing: "0.1em" }}>СЪБИТИЯ</div>
                        {org.events.map((e) => <div key={e} style={{ fontSize: 10, color: "#cccccc", fontFamily: "var(--font-mono)", marginBottom: 2 }}>{e}</div>)}
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#727272", fontFamily: "var(--font-mono)", marginBottom: 4, letterSpacing: "0.1em" }}>КОНТАКТ</div>
                        <div style={{ fontSize: 10, color: "#bbbbbb", fontFamily: "var(--font-mono)" }}>{org.contact}</div>
                        <div style={{ fontSize: 10, color: "#909090", fontFamily: "var(--font-mono)", marginTop: 4 }}>{org.website}</div>
                      </div>
                    </div>
                    <div style={{ padding: "8px 12px", background: "#0a0300", border: `1px solid ${ACCENT}15`, marginBottom: 10, fontSize: 10, color: "#c0c0c0", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
                      {org.clue}
                    </div>
                    <button onClick={() => handleSave(org)}
                      style={{ padding: "4px 14px", fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", background: isSaved ? `${ACCENT}18` : "#111", color: isSaved ? ACCENT : "#aaaaaa", border: `1px solid ${isSaved ? ACCENT + "50" : "#222"}`, cursor: "pointer" }}>
                      {isSaved ? "✓ SAVED" : "SAVE CLUE"}
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
