"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#00FF41"

// Key: Rumen Aleksiev purchased tetrabenazine  
const CARDS = [
  { id: "C-0001", holder: "А. Петров", bank: "DSK", last4: "4421", currency: "BGN", status: "ACTIVE", history: null },
  { id: "C-0002", holder: "М. Тодорова", bank: "UniCredit", last4: "7703", currency: "EUR", status: "ACTIVE", history: null },
  { id: "C-0003", holder: "Р. Алексиев", bank: "DSK", last4: "2291", currency: "BGN", status: "ACTIVE", history: [
    { date: "2025-09-10", merchant: "Apteka Vital", amount: "BGN 47.20", note: "Тетрабеназин 25mg ×60 таблетки — без рецепта" },
    { date: "2025-10-05", merchant: "Apteka Vital", amount: "BGN 47.20", note: "Тетрабеназин 25mg ×60 таблетки — повторна поръчка" },
    { date: "2025-10-14", merchant: "Kaufland Sofia", amount: "BGN 63.10", note: "Хранителни продукти" },
    { date: "2025-10-15", merchant: "Shell Sofia — Ул. Бенковски", amount: "BGN 28.00", note: "Гориво — 22:07 ⚠" },
  ], key: true },
  { id: "C-0004", holder: "К. Иванов", bank: "Fibank", last4: "9912", currency: "BGN", status: "BLOCKED", history: null },
  { id: "C-0005", holder: "Н. Стоянова", bank: "OBB", last4: "3344", currency: "BGN", status: "ACTIVE", history: null },
  { id: "C-0006", holder: "Г. Димитров", bank: "DSK", last4: "6671", currency: "EUR", status: "ACTIVE", history: null },
  { id: "C-0007", holder: "С. Василева", bank: "UniCredit", last4: "1102", currency: "BGN", status: "ACTIVE", history: null },
  { id: "C-0008", holder: "П. Маринов", bank: "Fibank", last4: "8800", currency: "BGN", status: "ACTIVE", history: null },
  { id: "C-0009", holder: "Е. Попова", bank: "OBB", last4: "5591", currency: "BGN", status: "BLOCKED", history: null },
  { id: "C-0010", holder: "Д. Михайлов", bank: "DSK", last4: "7723", currency: "BGN", status: "ACTIVE", history: null },
  { id: "C-0011", holder: "Т. Христова", bank: "Raiffeisen", last4: "4400", currency: "EUR", status: "ACTIVE", history: null },
  { id: "C-0012", holder: "В. Ангелов", bank: "UniCredit", last4: "6614", currency: "BGN", status: "ACTIVE", history: null },
  { id: "C-0013", holder: "Б. Кирова", bank: "DSK", last4: "2230", currency: "BGN", status: "ACTIVE", history: null },
  { id: "C-0014", holder: "Л. Йорданова", bank: "OBB", last4: "9988", currency: "BGN", status: "ACTIVE", history: null },
  { id: "C-0015", holder: "М. Станчев", bank: "Fibank", last4: "1144", currency: "BGN", status: "ACTIVE", history: null },
]

const STATUS_COLORS: Record<string, string> = { ACTIVE: "#00FF41", BLOCKED: "#FF0033" }

export default function LeaksCardsPage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [selected, setSelected] = useState<typeof CARDS[number] | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (card: typeof CARDS[number], field: string, text: string, confidence = 2) => {
    const id = `cards-${card.id}-${field}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[CARDS] ${card.holder} — ${field}`,
      text, sourceRoute: "/leaks/cards",
      confidence, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  const filtered = search
    ? CARDS.filter((c) => c.holder.toLowerCase().includes(search.toLowerCase()) || c.last4.includes(search) || c.bank.toLowerCase().includes(search.toLowerCase()))
    : CARDS

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", textDecoration: "none" }}>← LEAKS</Link>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="CARDS" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <div style={{ padding: "10px 14px", background: "#000d00", border: `1px solid ${ACCENT}20`, marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          {CARDS.length} дебитни карти — изтеглени от базата. Цъкни карта за история на транзакции. Търси по <span style={{ color: ACCENT }}>Алексиев</span> за ключова покупка.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
        <div>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Търси по притежател, банка или последни 4 цифри..."
            style={{ width: "100%", padding: "7px 12px", background: "#0d0d0d", border: "1px solid #1e1e1e", color: "#e0e0e0", fontSize: 11, fontFamily: "var(--font-mono)", marginBottom: 12, outline: "none" }} />

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #222" }}>
                {["ПРИТЕЖАТЕЛ", "БАНКА", "КАРТА", "ВАЛУТА", "СТАТУС", ""].map((h) => (
                  <th key={h} style={{ padding: "6px 10px", fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.12em", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((card) => {
                const isSelected = selected?.id === card.id
                return (
                  <tr key={card.id} onClick={() => setSelected(isSelected ? null : card)}
                    style={{ borderBottom: "1px solid #131313", cursor: "pointer", background: isSelected ? `${ACCENT}08` : (card as any).key ? "#000d00" : "transparent" }}>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: (card as any).key ? ACCENT : "#d0d0d0", fontWeight: (card as any).key ? 700 : 400 }}>
                        {card.holder}
                      </span>
                      {(card as any).key && <span style={{ marginLeft: 6, fontSize: 7, color: ACCENT, border: `1px solid ${ACCENT}40`, padding: "1px 4px" }}>KEY</span>}
                    </td>
                    <td style={{ padding: "8px 10px", fontSize: 10, color: "#bbbbbb", fontFamily: "var(--font-mono)" }}>{card.bank}</td>
                    <td style={{ padding: "8px 10px", fontSize: 10, color: "#999999", fontFamily: "var(--font-mono)" }}>**** {card.last4}</td>
                    <td style={{ padding: "8px 10px", fontSize: 9, color: "#909090", fontFamily: "var(--font-mono)" }}>{card.currency}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: STATUS_COLORS[card.status] }}>{card.status}</span>
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      {card.history && (
                        <button onClick={(e) => { e.stopPropagation(); handleSave(card, "holder", `${card.holder} — ${card.bank} **** ${card.last4}`, 4) }}
                          style={{ padding: "2px 7px", fontSize: 7, fontFamily: "var(--font-mono)", background: savedClues.includes(`cards-${card.id}-holder`) ? `${ACCENT}18` : "#0d0d0d", color: savedClues.includes(`cards-${card.id}-holder`) ? ACCENT : "#909090", border: `1px solid ${savedClues.includes(`cards-${card.id}-holder`) ? ACCENT + "40" : "#1e1e1e"}`, cursor: "pointer" }}>
                          {savedClues.includes(`cards-${card.id}-holder`) ? "✓" : "SAVE"}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        <div style={{ background: "#080808", border: "1px solid #1a1a1a", padding: 16, height: "fit-content" }}>
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.2em", marginBottom: 12 }}>CARD DETAIL</div>
              <div style={{ fontSize: 16, fontFamily: "var(--font-mono)", color: (selected as any).key ? ACCENT : "#e0e0e0", fontWeight: 700, marginBottom: 4 }}>{selected.holder}</div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#999999", marginBottom: 14 }}>{selected.bank} · **** {selected.last4} · {selected.currency}</div>

              {selected.history ? (
                <div>
                  <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", marginBottom: 10 }}>TRANSACTION HISTORY</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selected.history.map((tx, i) => (
                      <div key={i} style={{ padding: "8px 10px", background: tx.note.includes("Тетрабеназин") ? "#001200" : "#0d0d0d", border: `1px solid ${tx.note.includes("Тетрабеназин") ? ACCENT + "40" : "#1a1a1a"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#aaaaaa" }}>{tx.date}</span>
                          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: tx.note.includes("Тетрабеназин") ? ACCENT : "#dddddd", fontWeight: 600 }}>{tx.amount}</span>
                        </div>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#bbbbbb", marginBottom: 4 }}>{tx.merchant}</div>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: tx.note.includes("Тетрабеназин") ? ACCENT : "#909090", lineHeight: 1.5 }}>{tx.note}</div>
                        {tx.note.includes("Тетрабеназин") && (
                          <button onClick={() => handleSave(selected, `tx-tetra-${i}`, `Р. Алексиев купува Тетрабеназин — ${tx.date}, ${tx.merchant}, ${tx.amount}. Без рецепта.`, 5)}
                            style={{ marginTop: 6, padding: "3px 10px", fontSize: 9, fontFamily: "var(--font-mono)", background: savedClues.includes(`cards-${selected.id}-tx-tetra-${i}`) ? `${ACCENT}18` : "#001a00", color: savedClues.includes(`cards-${selected.id}-tx-tetra-${i}`) ? ACCENT : "#909090", border: `1px solid ${savedClues.includes(`cards-${selected.id}-tx-tetra-${i}`) ? ACCENT + "50" : "#1a2a1a"}`, cursor: "pointer" }}>
                            {savedClues.includes(`cards-${selected.id}-tx-tetra-${i}`) ? "✓ SAVED" : "⚠ SAVE KEY CLUE"}
                          </button>
                        )}
                        {tx.note.includes("22:07") && (
                          <button onClick={() => handleSave(selected, `tx-shell-${i}`, `Р. Алексиев — гориво от Shell на Ул. Бенковски, 22:07 на 15.10.2025 — съвпада с времето на изчезването`, 5)}
                            style={{ marginTop: 6, padding: "3px 10px", fontSize: 9, fontFamily: "var(--font-mono)", background: savedClues.includes(`cards-${selected.id}-tx-shell-${i}`) ? `${ACCENT}18` : "#001a00", color: savedClues.includes(`cards-${selected.id}-tx-shell-${i}`) ? ACCENT : "#909090", border: `1px solid ${savedClues.includes(`cards-${selected.id}-tx-shell-${i}`) ? ACCENT + "50" : "#1a2a1a"}`, cursor: "pointer" }}>
                            {savedClues.includes(`cards-${selected.id}-tx-shell-${i}`) ? "✓ SAVED" : "⚠ SAVE KEY CLUE"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#333", textAlign: "center", padding: "20px 0" }}>
                  Няма достъпна история
                </div>
              )}
            </motion.div>
          ) : (
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#333", textAlign: "center", padding: "30px 0" }}>
              Цъкни карта за история
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
