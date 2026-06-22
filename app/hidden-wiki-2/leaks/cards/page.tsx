"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FFB000"

const CARDS = [
  { id: "C-0001", holder: "А. Петров", bank: "DSK", last4: "4421", currency: "EUR", status: "ACTIVE", history: [
    { date: "2025-09-22", merchant: "FreshMart Sofia — Младост", amount: "EUR 19.71", note: "Хранителни продукти" },
    { date: "2025-10-01", merchant: "ConnectBG", amount: "EUR 11.25", note: "Месечен абонамент" },
    { date: "2025-10-08", merchant: "PetroStop — Цариградско шосе", amount: "EUR 27.61", note: "Гориво" },
    { date: "2025-10-19", merchant: "GrandMarket Plovdiv", amount: "EUR 21.12", note: "Хранителни продукти" },
  ] },
  { id: "C-0002", holder: "М. Тодорова", bank: "UniCredit", last4: "7703", currency: "EUR", status: "ACTIVE", history: [
    { date: "2025-09-14", merchant: "ModaNet Online", amount: "EUR 89.90", note: "Дрехи — онлайн поръчка" },
    { date: "2025-09-30", merchant: "UrbanStyle Sofia Mall", amount: "EUR 47.00", note: "Дрехи" },
    { date: "2025-10-06", merchant: "FreshMart Varna", amount: "EUR 29.80", note: "Хранителни продукти" },
    { date: "2025-10-21", merchant: "StreamVault", amount: "EUR 15.99", note: "Абонамент — ежемесечно" },
  ] },
  { id: "C-0003", holder: "Р. Алексиев", bank: "DSK", last4: "2291", currency: "EUR", status: "ACTIVE", history: [
    { date: "2025-09-10", merchant: "Apteka Nadezhda", amount: "EUR 24.13", note: "Тетрабеназин 25mg ×60 таблетки — без рецепта" },
    { date: "2025-10-05", merchant: "Apteka Nadezhda", amount: "EUR 24.13", note: "Тетрабеназин 25mg ×60 таблетки — повторна поръчка" },
    { date: "2025-10-14", merchant: "FreshMart Sofia", amount: "EUR 32.26", note: "Хранителни продукти" },
    { date: "2025-10-15", merchant: "FuelZone Sofia — Ул. Бенковски", amount: "EUR 14.32", note: "Гориво — 22:07 ⚠" },
  ] },
  { id: "C-0004", holder: "К. Иванов", bank: "Fibank", last4: "9912", currency: "EUR", status: "BLOCKED", history: [
    { date: "2025-09-18", merchant: "GlobalRemit — Serdika", amount: "EUR 255.64", note: "Международен превод — получател неизвестен" },
    { date: "2025-09-25", merchant: "GlobalRemit — Serdika", amount: "EUR 255.64", note: "Международен превод — повторен" },
    { date: "2025-10-02", merchant: "Fibank ATM — Благоевград", amount: "EUR 409.03", note: "Теглене в брой" },
    { date: "2025-10-03", merchant: "БЛОКИРАНА", amount: "—", note: "Картата е блокирана след засечена подозрителна активност" },
  ] },
  { id: "C-0005", holder: "Н. Стоянова", bank: "OBB", last4: "3344", currency: "EUR", status: "ACTIVE", history: [
    { date: "2025-09-20", merchant: "Apteka Nadezhda", amount: "EUR 9.41", note: "Витамини и хранителни добавки" },
    { date: "2025-10-03", merchant: "CityMart Sofia — Лозенец", amount: "EUR 26.94", note: "Хранителни продукти" },
    { date: "2025-10-11", merchant: "ConnectBG", amount: "EUR 9.71", note: "Телефонен план" },
    { date: "2025-10-22", merchant: "CineMax Sofia", amount: "EUR 14.32", note: "2× билети" },
  ] },
  { id: "C-0006", holder: "Г. Димитров", bank: "DSK", last4: "6671", currency: "EUR", status: "ACTIVE", history: [
    { date: "2025-09-12", merchant: "StayEasy.net", amount: "EUR 210.00", note: "Хотел Варна — 3 нощувки" },
    { date: "2025-09-28", merchant: "SkyRoute Airlines", amount: "EUR 89.00", note: "Самолетен билет — Sofia → Vienna" },
    { date: "2025-10-10", merchant: "NordiMart Wien", amount: "EUR 23.40", note: "Хранителни продукти" },
    { date: "2025-10-17", merchant: "EuroFuel Austria", amount: "EUR 61.00", note: "Гориво" },
  ] },
  { id: "C-0007", holder: "С. Василева", bank: "UniCredit", last4: "1102", currency: "EUR", status: "ACTIVE", history: [
    { date: "2025-09-16", merchant: "TechWorld Sofia", amount: "EUR 178.44", note: "Bluetooth слушалки" },
    { date: "2025-09-29", merchant: "FreshMart Sofia — Люлин", amount: "EUR 22.60", note: "Хранителни продукти" },
    { date: "2025-10-07", merchant: "SportZone BG", amount: "EUR 48.57", note: "Спортна екипировка" },
    { date: "2025-10-20", merchant: "TuneStream", amount: "EUR 5.62", note: "Абонамент" },
  ] },
  { id: "C-0008", holder: "П. Маринов", bank: "Fibank", last4: "8800", currency: "EUR", status: "ACTIVE", history: [
    { date: "2025-09-23", merchant: "FuelZone — Ботевградско шосе", amount: "EUR 36.81", note: "Гориво" },
    { date: "2025-10-01", merchant: "BuildMaster Sofia", amount: "EUR 65.70", note: "Строителни материали" },
    { date: "2025-10-09", merchant: "FreshMart Sofia — Надежда", amount: "EUR 18.82", note: "Хранителни продукти" },
    { date: "2025-10-18", merchant: "Fibank ATM — Банкя", amount: "EUR 102.26", note: "Теглене в брой" },
  ] },
  { id: "C-0009", holder: "Е. Попова", bank: "OBB", last4: "5591", currency: "EUR", status: "BLOCKED", history: [
    { date: "2025-09-19", merchant: "AsiaShop Online", amount: "EUR 173.84", note: "Онлайн поръчка — неустановен доставчик" },
    { date: "2025-09-26", merchant: "AsiaShop Online", amount: "EUR 143.15", note: "Онлайн поръчка — повторна" },
    { date: "2025-10-04", merchant: "OBB Fraud Detection", amount: "—", note: "Автоматична блокировка — засечена измамна активност" },
    { date: "2025-10-04", merchant: "БЛОКИРАНА", amount: "—", note: "Картата е блокирана" },
  ] },
  { id: "C-0010", holder: "Д. Михайлов", bank: "DSK", last4: "7723", currency: "EUR", status: "ACTIVE", history: [
    { date: "2025-09-17", merchant: "CityMart Plovdiv", amount: "EUR 30.11", note: "Хранителни продукти" },
    { date: "2025-10-02", merchant: "PetroStop Plovdiv — Пещерско шосе", amount: "EUR 24.54", note: "Гориво" },
    { date: "2025-10-13", merchant: "Apteka Nadezhda", amount: "EUR 12.07", note: "Аспирин, антибиотик с рецепта" },
    { date: "2025-10-24", merchant: "BurgerPalace Plovdiv", amount: "EUR 15.85", note: "Ресторант" },
  ] },
  { id: "C-0011", holder: "Т. Христова", bank: "Raiffeisen", last4: "4400", currency: "EUR", status: "ACTIVE", history: [
    { date: "2025-09-11", merchant: "PageWorld.de", amount: "EUR 54.99", note: "Книги и канцеларски материали" },
    { date: "2025-09-27", merchant: "LuxScent Sofia", amount: "EUR 72.00", note: "Парфюм и козметика" },
    { date: "2025-10-05", merchant: "CityMart Sofia — Изток", amount: "EUR 31.50", note: "Хранителни продукти" },
    { date: "2025-10-16", merchant: "QuickBite Delivery", amount: "EUR 18.40", note: "Доставка на храна" },
  ] },
  { id: "C-0012", holder: "В. Ангелов", bank: "UniCredit", last4: "6614", currency: "EUR", status: "ACTIVE", history: [
    { date: "2025-09-21", merchant: "AutoParts BG Sofia", amount: "EUR 214.75", note: "Авточасти — каско ремонт" },
    { date: "2025-10-03", merchant: "PetroStop — Студентски град", amount: "EUR 33.24", note: "Гориво" },
    { date: "2025-10-12", merchant: "GrandMarket Sofia", amount: "EUR 24.34", note: "Хранителни продукти" },
    { date: "2025-10-23", merchant: "SportZone BG", amount: "EUR 45.51", note: "Спортни обувки" },
  ] },
  { id: "C-0013", holder: "Б. Кирова", bank: "DSK", last4: "2230", currency: "EUR", status: "ACTIVE", history: [
    { date: "2025-09-15", merchant: "UrbanStyle Sofia Mall", amount: "EUR 61.35", note: "Дрехи" },
    { date: "2025-09-30", merchant: "CityMart Sofia — Надежда", amount: "EUR 20.04", note: "Хранителни продукти" },
    { date: "2025-10-08", merchant: "DSK ATM — Красно село", amount: "EUR 153.44", note: "Теглене в брой" },
    { date: "2025-10-20", merchant: "ConnectBG", amount: "EUR 9.71", note: "Телефонен план" },
  ] },
  { id: "C-0014", holder: "Л. Йорданова", bank: "OBB", last4: "9988", currency: "EUR", status: "ACTIVE", history: [
    { date: "2025-09-24", merchant: "HomeBase Sofia", amount: "EUR 42.64", note: "Домакински стоки" },
    { date: "2025-10-06", merchant: "FreshMart Sofia — Дружба", amount: "EUR 28.17", note: "Хранителни продукти" },
    { date: "2025-10-14", merchant: "ConnectBG", amount: "EUR 11.25", note: "Месечен абонамент" },
    { date: "2025-10-25", merchant: "Apteka Nadezhda", amount: "EUR 7.57", note: "Болкоуспокояващи" },
  ] },
  { id: "C-0015", holder: "М. Станчев", bank: "Fibank", last4: "1144", currency: "EUR", status: "ACTIVE", history: [
    { date: "2025-09-13", merchant: "TechWorld Plovdiv", amount: "EUR 664.14", note: "Лаптоп — Lenovo IdeaPad" },
    { date: "2025-09-28", merchant: "FuelZone Plovdiv", amount: "EUR 25.57", note: "Гориво" },
    { date: "2025-10-09", merchant: "FreshMart Plovdiv", amount: "EUR 22.34", note: "Хранителни продукти" },
    { date: "2025-10-22", merchant: "GameVault", amount: "EUR 15.33", note: "Игри — онлайн покупка" },
  ] },
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
                    style={{ borderBottom: "1px solid #131313", cursor: "pointer", background: isSelected ? `${ACCENT}08` : "transparent" }}>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#d0d0d0", fontWeight: 400 }}>
                        {card.holder}
                      </span>
                    </td>
                    <td style={{ padding: "8px 10px", fontSize: 10, color: "#bbbbbb", fontFamily: "var(--font-mono)" }}>{card.bank}</td>
                    <td style={{ padding: "8px 10px", fontSize: 10, color: "#999999", fontFamily: "var(--font-mono)" }}>**** {card.last4}</td>
                    <td style={{ padding: "8px 10px", fontSize: 9, color: "#909090", fontFamily: "var(--font-mono)" }}>{card.currency}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: STATUS_COLORS[card.status] }}>{card.status}</span>
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <button onClick={(e) => { e.stopPropagation(); handleSave(card, "holder", `${card.holder} — ${card.bank} **** ${card.last4}`, 2) }}
                        style={{ padding: "2px 7px", fontSize: 7, fontFamily: "var(--font-mono)", background: savedClues.includes(`cards-${card.id}-holder`) ? `${ACCENT}18` : "#0d0d0d", color: savedClues.includes(`cards-${card.id}-holder`) ? ACCENT : "#909090", border: `1px solid ${savedClues.includes(`cards-${card.id}-holder`) ? ACCENT + "40" : "#1e1e1e"}`, cursor: "pointer" }}>
                        {savedClues.includes(`cards-${card.id}-holder`) ? "✓" : "SAVE"}
                      </button>
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
              <div style={{ fontSize: 16, fontFamily: "var(--font-mono)", color: "#e0e0e0", fontWeight: 700, marginBottom: 4 }}>{selected.holder}</div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#999999", marginBottom: 14 }}>{selected.bank} · **** {selected.last4} · {selected.currency}</div>

              {selected.history ? (
                <div>
                  <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", marginBottom: 10 }}>TRANSACTION HISTORY</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selected.history.map((tx, i) => (
                      <div key={i} style={{ padding: "8px 10px", background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#aaaaaa" }}>{tx.date}</span>
                          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#dddddd", fontWeight: 600 }}>{tx.amount}</span>
                        </div>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#bbbbbb", marginBottom: 4 }}>{tx.merchant}</div>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", lineHeight: 1.5 }}>{tx.note}</div>
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
