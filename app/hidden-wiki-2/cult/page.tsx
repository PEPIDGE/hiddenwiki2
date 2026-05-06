"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#CC44FF"

const CULTS = [
  {
    id: "CULT-01",
    name: "Братство на третото пробуждане",
    slug: "bratstvo",
    level: "АКТИВНО",
    members: 23,
    leaders: ["RedFox"],
    operators: ["ToxicBabe", "GothGirl", "NightKiller", "Black-Voyvoda", "DataCracker6"],
    front: "Клуб за лично развитие и духовни практики",
    location: "Захарна фабрика — западно крило",
    warning: true,
    clue: "Братство на третото пробуждане — свързано с изчезването на Лора. Оператор: RedFox. Локация: Захарна фабрика, западно крило",
  },
  {
    id: "CULT-02",
    name: "Кръг на лунното затъмнение",
    slug: "krag",
    level: "АКТИВНО",
    members: 11,
    leaders: ["OutsiderX"],
    operators: ["NullSyn"],
    front: "Астрологичен клуб и медитация",
    location: "Неизвестна",
    warning: false,
    clue: "Кръг на лунното затъмнение — астрологичен front. Лидер: OutsiderX. Оператор: NullSyn",
  },
  {
    id: "CULT-03",
    name: "Огледален преход",
    slug: "ogledalenprehod",
    level: "СЪБИТИЙНА ОРГАНИЗАЦИЯ",
    members: 40,
    leaders: ["DataCracker6"],
    operators: ["Black-Voyvoda", "ToxicBabe"],
    front: "Арт инсталации и нощни събирания",
    location: "Различни — последно Sofia, NDK",
    warning: true,
    clue: "Огледален преход — събитийна организация. Три секти участват. Лора е видяна на последно събитие",
  },
  {
    id: "CULT-04",
    name: "Пета точка",
    slug: "peta-tochka",
    level: "НЕАКТИВНО",
    members: 5,
    leaders: ["—"],
    operators: [],
    front: "Фотографски колектив",
    location: "—",
    warning: false,
    clue: "Пета точка — неактивна фотографска секта. Без връзка с основния случай",
  },
  {
    id: "CULT-05",
    name: "Нощен сигнал",
    slug: "noshten-signal",
    level: "АКТИВНО",
    members: 8,
    leaders: ["NightKiller"],
    operators: ["GothGirl"],
    front: "Радиолюбители и честотни изследвания",
    location: "Мобилна",
    warning: true,
    clue: "Нощен сигнал — front за наблюдение и проследяване. NightKiller e лидер. Използват честоти за шифрована комуникация",
  },
  {
    id: "CULT-06",
    name: "Архивът на сенките",
    slug: "arkhiv",
    level: "ПАСИВНО",
    members: 7,
    leaders: ["NullSyn"],
    operators: ["DataCracker6"],
    front: "Документален архив и изследвания",
    location: "Онлайн",
    warning: false,
    clue: "Архивът на сенките — онлайн база. NullSyn публикува decoy координати",
  },
]

// Keep old data removed
const _DOCTRINE: never[] = []

export default function CultPage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (cult: typeof CULTS[number]) => {
    const id = `cult-${cult.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[CULT] ${cult.name}`,
      text: cult.clue, sourceRoute: "/cult",
      confidence: cult.warning ? 4 : 2, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.3em", marginBottom: 8 }}>
          CULT DATABASE — ОРГАНИЗАЦИИ И СЕКТИ
        </div>
        <GlitchText text="CULT" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "OPERATORS", href: "/hidden-wiki-2/cult/operators" },
          { label: "CHAT SYSTEM", href: "/hidden-wiki-2/cult/chat-system" },
        ].map((link) => (
          <Link key={link.href} href={link.href}
            style={{ padding: "6px 14px", fontSize: 9, fontFamily: "var(--font-mono)", color: "#888", border: "1px solid #222", textDecoration: "none", letterSpacing: "0.12em" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = ACCENT + "50" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#222" }}>
            /{link.label} →
          </Link>
        ))}
      </div>

      <div style={{ padding: "10px 14px", background: "#0d000d", border: `1px solid ${ACCENT}20`, marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Регистрирани организации. Фокусирай се върху <span style={{ color: "#FF0033" }}>Братство на третото пробуждане</span> — директна връзка с изчезването на Лора Костова.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {CULTS.map((cult, i) => {
          const isExpanded = expanded === cult.id
          const isSaved = savedClues.includes(`cult-${cult.id}`)
          return (
            <div key={cult.id} style={{ background: "#090909", border: `1px solid ${cult.warning ? "#1a001a" : "#141414"}`, position: "relative" }}>
              {cult.warning && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "#FF0033", opacity: 0.4 }} />}
              <div style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12 }}
                onClick={() => setExpanded(isExpanded ? null : cult.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: cult.warning ? "#FF0033" : "#555", border: `1px solid ${cult.warning ? "#FF003340" : "#222"}`, padding: "1px 6px", letterSpacing: "0.12em" }}>
                      {cult.level}
                    </span>
                    <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444" }}>{cult.members} членa</span>
                  </div>
                  <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: cult.warning ? "#e0c0e0" : "#c0c0c0", fontWeight: 600, marginBottom: 4 }}>
                    {cult.name}
                  </div>
                  <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#666" }}>
                    <span style={{ color: "#444" }}>Публичен front: </span>{cult.front}
                  </div>
                </div>
                <span style={{ fontSize: 9, color: "#444", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{isExpanded ? "▲" : "▼"}</span>
              </div>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  style={{ borderTop: "1px solid #141414", padding: "14px 18px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 8, color: "#444", fontFamily: "var(--font-mono)", marginBottom: 4, letterSpacing: "0.1em" }}>ЛИДЕР</div>
                      {cult.leaders.map((l) => <div key={l} style={{ fontSize: 11, color: "#d0d0d0", fontFamily: "var(--font-mono)" }}>{l}</div>)}
                    </div>
                    <div>
                      <div style={{ fontSize: 8, color: "#444", fontFamily: "var(--font-mono)", marginBottom: 4, letterSpacing: "0.1em" }}>ОПЕРАТОРИ</div>
                      {cult.operators.length > 0
                        ? cult.operators.map((op) => <div key={op} style={{ fontSize: 11, color: "#aaa", fontFamily: "var(--font-mono)" }}>{op}</div>)
                        : <div style={{ fontSize: 11, color: "#333", fontFamily: "var(--font-mono)" }}>—</div>
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: 8, color: "#444", fontFamily: "var(--font-mono)", marginBottom: 4, letterSpacing: "0.1em" }}>ЛОКАЦИЯ</div>
                      <div style={{ fontSize: 11, color: "#aaa", fontFamily: "var(--font-mono)" }}>{cult.location}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 8, color: "#444", fontFamily: "var(--font-mono)", marginBottom: 4, letterSpacing: "0.1em" }}>ID</div>
                      <div style={{ fontSize: 10, color: "#555", fontFamily: "var(--font-mono)" }}>{cult.id}</div>
                    </div>
                  </div>
                  <div style={{ padding: "8px 12px", background: "#0a000a", border: `1px solid ${ACCENT}15`, marginBottom: 10, fontSize: 10, color: "#c0c0c0", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
                    {cult.clue}
                  </div>
                  <button onClick={() => handleSave(cult)}
                    style={{ padding: "4px 14px", fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", background: isSaved ? `${ACCENT}18` : "#111", color: isSaved ? ACCENT : "#777", border: `1px solid ${isSaved ? ACCENT + "50" : "#222"}`, cursor: "pointer" }}>
                    {isSaved ? "✓ SAVED" : "SAVE CLUE"}
                  </button>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
