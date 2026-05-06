"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#CC44FF"

const PHOTOS = [
  { id: "P-001", thumb: "👤", caption: "Лора Костова — последна снимка преди изчезването", date: "2025-10-15 22:14", location: "Ул. Г. Бенковски 4, София", tags: ["Лора", "последна"], clue: "Снимка на Лора Костова — 15.10.2025 22:14, Ул. Г. Бенковски 4, Sofia" },
  { id: "P-002", thumb: "🚗", caption: "Черен Audi A3 — засечен пред блока", date: "2025-10-15 22:09", location: "Ул. Г. Бенковски 4, София", tags: ["Audi", "кола"], clue: "Черен Audi A3 заснет пред жилището на Лора — 22:09, 5 мин преди снимка P-001" },
  { id: "P-003", thumb: "🏭", caption: "Захарна фабрика — западно крило, нощна снимка", date: "2025-10-16 01:30", location: "Захарна фабрика, западно крило", tags: ["Захарна фабрика", "локация"], clue: "Захарна фабрика, западно крило — 01:30 на 16.10.2025" },
  { id: "P-004", thumb: "🚪", caption: "Врата с жълто-черна лента — стая 9", date: "2025-10-16 01:33", location: "Захарна фабрика, стая 9", tags: ["Захарна фабрика", "стая 9"], clue: "Стая 9, Захарна фабрика — жълто-черна лента, врата залостена отвътре" },
  { id: "P-005", thumb: "👥", caption: "Група от 5 лица — неразпознати", date: "2025-09-21 20:00", location: "Огледален преход — събитие", tags: ["Огледален преход", "събитие", "непознати"], clue: "5 лица на Огледален преход — събитие 21.09.2025, неидентифицирани" },
  { id: "P-006", thumb: "📄", caption: "Записка под вратата на Лора", date: "2025-10-12 09:00", location: "Жилището на Лора", tags: ["записка", "Лора"], clue: "Записка до Лора: 'Знаем за теб. Огледален преход, 15 окт.' — изпратена 12.10.2025" },
  { id: "P-007", thumb: "🔦", caption: "Фенерче намерено в стая 7 — гравиран символ", date: "2025-10-16 02:00", location: "Захарна фабрика, стая 7", tags: ["символ", "стая 7", "Захарна фабрика"], clue: "Фенерче с гравиран символ — Братство на третото пробуждане. Намерено в стая 7" },
  { id: "P-008", thumb: "🧪", caption: "Кутия тетрабеназин — без рецепта", date: "2025-10-17 11:00", location: "Стая 9, намерена след инцидента", tags: ["тетрабеназин", "лекарство"], clue: "Тетрабеназин открит в стая 9 — принудителна седация. Вижте /leaks/cards → Румен Алексиев" },
  { id: "P-009", thumb: "📱", caption: "Телефон с разбит екран — до стая 9", date: "2025-10-16 01:50", location: "Коридор до стая 9, Захарна фабрика", tags: ["телефон", "Лора"], clue: "Телефон на Лора Костова — намерен в коридора. Последно обаждане: +359 88 *** 1221" },
  { id: "P-010", thumb: "🪑", caption: "Стол с въжета — стая 9", date: "2025-10-16 03:00", location: "Захарна фабрика, стая 9", tags: ["стая 9", "доказателство"], clue: "Стол с въжета в стая 9 — Захарна фабрика. Следи от задържане" },
  { id: "P-011", thumb: "🚶", caption: "Силует — черна качулка, мъж", date: "2025-10-15 22:11", location: "Ул. Г. Бенковски 4, паркинг", tags: ["силует", "непознат", "паркинг"], clue: "Силует — черна качулка, паркинг пред блока на Лора, 22:11" },
  { id: "P-012", thumb: "🗓️", caption: "Годишна среща — Братство, снимки", date: "2025-08-10 19:00", location: "Неизвестна", tags: ["Братство", "събитие"], clue: "Годишна среща на Братството на третото пробуждане — август 2025, локацията е скрита" },
]

export default function LeaksArchivePage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [selected, setSelected] = useState<typeof PHOTOS[number] | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (p: typeof PHOTOS[number]) => {
    const id = `archive-${p.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[ARCHIVE] ${p.caption}`,
      text: p.clue, sourceRoute: "/leaks/archive",
      confidence: 3, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((prev) => [...prev, id])
  }

  const allTags = Array.from(new Set(PHOTOS.flatMap((p) => p.tags)))
  const displayed = tagFilter ? PHOTOS.filter((p) => p.tags.includes(tagFilter)) : PHOTOS

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.15em", textDecoration: "none" }}>← LEAKS</Link>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="ARCHIVE" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <div style={{ padding: "10px 14px", background: "#0d000d", border: `1px solid ${ACCENT}20`, marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Наблюдателни снимки. Хронологията между <span style={{ color: ACCENT }}>P-001 (22:09)</span> и <span style={{ color: ACCENT }}>P-003 (01:30)</span> е критична. Телефонният номер в P-009 съвпада с данни от VEHICLES.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
        <button onClick={() => setTagFilter(null)}
          style={{ padding: "3px 10px", fontSize: 8, fontFamily: "var(--font-mono)", background: !tagFilter ? `${ACCENT}22` : "#0a0a0a", color: !tagFilter ? ACCENT : "#555", border: `1px solid ${!tagFilter ? ACCENT + "50" : "#1a1a1a"}`, cursor: "pointer", letterSpacing: "0.1em" }}>
          ALL
        </button>
        {allTags.map((tag) => (
          <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
            style={{ padding: "3px 8px", fontSize: 8, fontFamily: "var(--font-mono)", background: tagFilter === tag ? `${ACCENT}15` : "#090909", color: tagFilter === tag ? ACCENT : "#666", border: `1px solid ${tagFilter === tag ? ACCENT + "30" : "#161616"}`, cursor: "pointer" }}>
            {tag}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
        {displayed.map((photo) => {
          const isSaved = savedClues.includes(`archive-${photo.id}`)
          return (
            <motion.div key={photo.id} whileHover={{ scale: 1.01 }} onClick={() => setSelected(selected?.id === photo.id ? null : photo)}
              style={{ background: "#090909", border: `1px solid ${selected?.id === photo.id ? ACCENT + "60" : "#1a1a1a"}`, cursor: "pointer", overflow: "hidden" }}>
              <div style={{ height: 80, background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, borderBottom: "1px solid #141414", position: "relative" }}>
                {photo.thumb}
                {isSaved && <span style={{ position: "absolute", top: 4, right: 4, fontSize: 7, color: ACCENT, fontFamily: "var(--font-mono)" }}>✓</span>}
              </div>
              <div style={{ padding: "8px 10px" }}>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#999", lineHeight: 1.5, marginBottom: 4 }}>{photo.caption}</div>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444" }}>{photo.date}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Detail overlay */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 20, padding: "20px 24px", background: "#0a0a0a", border: `1px solid ${ACCENT}30` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 8, color: "#555", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", marginBottom: 6 }}>{selected.id} · {selected.date}</div>
              <div style={{ fontSize: 16, color: "#e0e0e0", fontFamily: "var(--font-mono)", fontWeight: 600, marginBottom: 6 }}>{selected.caption}</div>
              <div style={{ fontSize: 10, color: "#777", fontFamily: "var(--font-mono)" }}>📍 {selected.location}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 16, fontFamily: "var(--font-mono)" }}>✕</button>
          </div>
          <p style={{ fontSize: 11, color: "#c0c0c0", margin: "0 0 14px", fontFamily: "var(--font-mono)", lineHeight: 1.8, background: "#111", padding: "10px 14px", border: "1px solid #1a1a1a" }}>
            {selected.clue}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {selected.tags.map((t) => (
              <span key={t} style={{ padding: "2px 8px", fontSize: 8, fontFamily: "var(--font-mono)", color: ACCENT, border: `1px solid ${ACCENT}30` }}>#{t}</span>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => handleSave(selected)}
              style={{ padding: "5px 16px", fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.12em", background: savedClues.includes(`archive-${selected.id}`) ? `${ACCENT}18` : "#0d0d0d", color: savedClues.includes(`archive-${selected.id}`) ? ACCENT : "#777", border: `1px solid ${savedClues.includes(`archive-${selected.id}`) ? ACCENT + "50" : "#222"}`, cursor: "pointer" }}>
              {savedClues.includes(`archive-${selected.id}`) ? "✓ SAVED TO EVIDENCE BOARD" : "SAVE CLUE"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
