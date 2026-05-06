"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00A8FF"

const PHONES = [
  { id: "PH-001", number: "+359 88 412 1221", label: "Д. Михайлов", org: "Братство", notes: "Повтарящ се номер — вижте VEHICLES", suspicious: true },
  { id: "PH-002", number: "+359 87 500 1030", label: "Линия за резервации", org: "Огледален преход", notes: "Официална линия за записвания", suspicious: false },
  { id: "PH-003", number: "+359 88 900 0100", label: "RedFox (оперативна)", org: "Братство", notes: "Разговор в 01:22 на 16.10.2025", suspicious: true },
  { id: "PH-004", number: "+359 89 200 3344", label: "GothGirl", org: "Братство", notes: "Последен сигнал: 15.10.2025 22:05 — кв. Надежда", suspicious: true },
  { id: "PH-005", number: "+359 88 600 7700", label: "Кръг на лунното затъмнение", org: "Кръг", notes: "Резервации и информация", suspicious: false },
  { id: "PH-006", number: "+359 87 100 8822", label: "NightKiller", org: "Братство", notes: "Сигнал в 21:58 — кв. Бенковски", suspicious: true },
  { id: "PH-007", number: "+359 86 400 5591", label: "Лора Костова", org: "—", notes: "Последен сигнал: 15.10.2025 22:12 — ул. Г. Бенковски", suspicious: false },
  { id: "PH-008", number: "+359 88 300 4400", label: "Black-Voyvoda", org: "Братство", notes: "Обаждане към Д. Михайлов в 22:15", suspicious: true },
  { id: "PH-009", number: "+359 89 800 1100", label: "CellTrace (услуга)", org: "Blackmarket", notes: "Платен IP/GPS lookup — 10 HC на заявка", suspicious: false },
  { id: "PH-010", number: "+359 87 200 9900", label: "Apteka Vital", org: "—", notes: "Продажби без рецепта документирани", suspicious: false },
  { id: "PH-011", number: "+359 88 550 6612", label: "ToxicBabe", org: "Братство", notes: "Последен сигнал: 15.10.2025 23:40", suspicious: true },
  { id: "PH-012", number: "+359 86 700 3310", label: "DataCracker6", org: "Братство", notes: "Активен в деня на изчезването", suspicious: true },
  { id: "PH-013", number: "+359 89 100 7744", label: "Огледален преход — VIP", org: "Огледален преход", notes: "Само поканени членове", suspicious: false },
  { id: "PH-014", number: "+359 88 450 2200", label: "Братство — горещ телефон", org: "Братство", notes: "Отговаря само между 20:00 и 02:00", suspicious: true },
  { id: "PH-015", number: "+359 87 900 5543", label: "BruteForce (услуга)", org: "Blackmarket", notes: "Пробиване на пароли — запитвания само в /blackmarket", suspicious: false },
  { id: "PH-016", number: "+359 86 300 1190", label: "Кръг на лунното — организатор", org: "Кръг", notes: "Лична линия на организатора", suspicious: false },
  { id: "PH-017", number: "+359 89 600 4430", label: "OutsiderX", org: "—", notes: "Неактивен от 2025-10-01", suspicious: false },
  { id: "PH-018", number: "+359 88 750 6671", label: "Р. Алексиев (лична)", org: "—", notes: "Обаждане в 22:03 — Shell — кв. Бенковски", suspicious: true },
  { id: "PH-019", number: "+359 87 850 3344", label: "NullSyn", org: "Братство", notes: "Decoy координатор — 3 фалшиви GPS изпращания", suspicious: true },
  { id: "PH-020", number: "+359 86 200 9988", label: "Братство — информация", org: "Братство", notes: "Публична информационна линия", suspicious: false },
]

export default function LeaksPhonesPage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [filterSus, setFilterSus] = useState(false)
  const [selected, setSelected] = useState<typeof PHONES[number] | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (ph: typeof PHONES[number]) => {
    const id = `phones-${ph.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[PHONES] ${ph.label} — ${ph.number}`,
      text: `${ph.number} | ${ph.label} | ${ph.org} | ${ph.notes}`,
      sourceRoute: "/leaks/phones",
      confidence: ph.suspicious ? 4 : 2, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  const filtered = PHONES
    .filter((p) => !filterSus || p.suspicious)
    .filter((p) => !search || p.number.includes(search) || p.label.toLowerCase().includes(search.toLowerCase()) || p.org.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.15em", textDecoration: "none" }}>← LEAKS</Link>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="PHONES" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <div style={{ padding: "10px 14px", background: "#00050d", border: `1px solid ${ACCENT}20`, marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          {PHONES.length} телефонни номера. Маркираните в <span style={{ color: "#FF0033" }}>червено</span> са подозрителни. Подай номер в <Link href="/hidden-wiki-2/blackmarket" style={{ color: ACCENT }}>CellTrace (/blackmarket)</Link> за IP/GPS lookup.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Търси по номер, лице или организация..."
          style={{ flex: 1, minWidth: 200, padding: "6px 12px", background: "#0d0d0d", border: "1px solid #1e1e1e", color: "#e0e0e0", fontSize: 11, fontFamily: "var(--font-mono)", outline: "none" }} />
        <button onClick={() => setFilterSus(!filterSus)}
          style={{ padding: "5px 14px", fontSize: 8, fontFamily: "var(--font-mono)", background: filterSus ? "#1a000010" : "#0d0d0d", color: filterSus ? "#FF0033" : "#666", border: `1px solid ${filterSus ? "#FF003340" : "#1e1e1e"}`, cursor: "pointer", letterSpacing: "0.1em" }}>
          {filterSus ? "⚠ САМО ПОДОЗРИТЕЛНИ" : "САМО ПОДОЗРИТЕЛНИ"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {filtered.map((ph) => {
            const isSaved = savedClues.includes(`phones-${ph.id}`)
            return (
              <div key={ph.id} onClick={() => setSelected(selected?.id === ph.id ? null : ph)}
                style={{ padding: "10px 14px", background: selected?.id === ph.id ? `${ACCENT}08` : ph.suspicious ? "#0a0000" : "#090909", border: `1px solid ${ph.suspicious ? "#1a0000" : "#141414"}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.04em" }}>{ph.number}</span>
                    {ph.suspicious && <span style={{ fontSize: 7, color: "#FF0033", border: "1px solid #FF003330", padding: "1px 5px", fontFamily: "var(--font-mono)" }}>⚠ SUSPICIOUS</span>}
                  </div>
                  <div style={{ fontSize: 10, color: "#888", fontFamily: "var(--font-mono)" }}>
                    {ph.label} <span style={{ color: "#444", marginLeft: 8 }}>· {ph.org}</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleSave(ph) }}
                  style={{ padding: "3px 10px", fontSize: 8, fontFamily: "var(--font-mono)", background: isSaved ? `${ACCENT}18` : "#0d0d0d", color: isSaved ? ACCENT : "#555", border: `1px solid ${isSaved ? ACCENT + "40" : "#1e1e1e"}`, cursor: "pointer", flexShrink: 0 }}>
                  {isSaved ? "✓" : "SAVE"}
                </button>
              </div>
            )
          })}
        </div>

        {/* Detail panel */}
        <div style={{ background: "#080808", border: "1px solid #1a1a1a", padding: 16, height: "fit-content" }}>
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.2em", marginBottom: 12 }}>PHONE DETAIL</div>
              <div style={{ fontSize: 16, fontFamily: "var(--font-mono)", color: ACCENT, fontWeight: 700, marginBottom: 8 }}>{selected.number}</div>
              {[
                { label: "ЛИЦЕ/ЛИНИЯ", value: selected.label },
                { label: "ОРГАНИЗАЦИЯ", value: selected.org },
                { label: "СТАТУС", value: selected.suspicious ? "⚠ SUSPICIOUS" : "—", color: selected.suspicious ? "#FF0033" : "#555" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #111" }}>
                  <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.1em" }}>{row.label}</span>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: row.color ?? "#aaa" }}>{row.value}</span>
                </div>
              ))}
              <div style={{ padding: "8px 10px", background: "#0d0d0d", border: "1px solid #1a1a1a", marginBottom: 12 }}>
                <div style={{ fontSize: 8, color: "#444", fontFamily: "var(--font-mono)", marginBottom: 4 }}>БЕЛЕЖКИ</div>
                <div style={{ fontSize: 10, color: "#c0c0c0", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>{selected.notes}</div>
              </div>
              <div style={{ marginBottom: 12, padding: "8px 10px", background: "#0a0005", border: `1px solid ${ACCENT}20` }}>
                <div style={{ fontSize: 8, color: ACCENT, fontFamily: "var(--font-mono)", marginBottom: 4 }}>CELLTRACE LOOKUP</div>
                <div style={{ fontSize: 9, color: "#888", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>Подай този номер в /blackmarket → CellTrace за IP и GPS данни (10 HC).</div>
              </div>
              <button onClick={() => handleSave(selected)}
                style={{ width: "100%", padding: "5px 0", fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.12em", background: savedClues.includes(`phones-${selected.id}`) ? `${ACCENT}18` : "#0d0d0d", color: savedClues.includes(`phones-${selected.id}`) ? ACCENT : "#777", border: `1px solid ${savedClues.includes(`phones-${selected.id}`) ? ACCENT + "50" : "#222"}`, cursor: "pointer" }}>
                {savedClues.includes(`phones-${selected.id}`) ? "✓ SAVED" : "SAVE CLUE"}
              </button>
            </motion.div>
          ) : (
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#333", textAlign: "center", padding: "30px 0" }}>
              Цъкни номер за детайли
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
