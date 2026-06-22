"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { GlitchText } from "@/components/tor/glitch-text"
import { SortableTable } from "@/components/tor/sortable-table"

const ACCENT = "#00FF41"

const TRANSACTIONS = [
  { id: "TX-2501", amount: "€250",    from: "Р. Алексиев",              to: "Аптека Витал",           time: "05.09 14:30", method: "CARD",   flag: "HIGH" },
  { id: "TX-2502", amount: "€180",    from: "Р. Алексиев",              to: "Аптека Витал",           time: "10.10 11:15", method: "CARD",   flag: "HIGH" },
  { id: "TX-2503", amount: "€3.200",  from: "Братство (анон.)",         to: "NightKiller",            time: "14.10 20:00", method: "CRYPTO", flag: "HIGH" },
  { id: "TX-2504", amount: "€85",     from: "Р. Алексиев",              to: "Shell, ул. Бенковски",   time: "15.10 22:07", method: "CARD",   flag: "HIGH" },
  { id: "TX-2505", amount: "€12.000", from: "Братство (анон.)",         to: "Захарна фабрика",        time: "01.10 09:00", method: "WIRE",   flag: "HIGH" },
  { id: "TX-2506", amount: "€500",    from: "[DECOY]",                  to: "[DECOY]",                time: "12.10 12:00", method: "CASH",   flag: null },
  { id: "TX-2507", amount: "€700",    from: "[INTERNAL]",               to: "[INTERNAL]",             time: "08.10 08:45", method: "WIRE",   flag: null },
]

export default function FinanceTransactionsPage() {
  const [filter, setFilter] = useState<"all" | "anomaly">("all")
  const rows = filter === "anomaly" ? TRANSACTIONS.filter((t) => t.flag === "HIGH") : TRANSACTIONS

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#2a0015", letterSpacing: "0.35em", marginBottom: 8 }}>FINANCE // TRANSACTIONS</div>
        <GlitchText text="TRANSACTION LEDGER" as="h1" intensity="low" color={ACCENT} className="text-2xl font-bold tracking-widest" />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}40, transparent)`, marginTop: 10 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["all", "anomaly"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 14px", background: filter === f ? `${ACCENT}15` : "transparent",
            border: `1px solid ${filter === f ? `${ACCENT}50` : "#1a1a1a"}`,
            color: filter === f ? ACCENT : "#909090",
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", cursor: "pointer",
          }}>
            {f === "all" ? "ALL TX" : "ANOMALIES ONLY"}
          </button>
        ))}
      </div>
      <SortableTable
        accentColor={ACCENT}
        rowHighlight={(r) => (r as typeof TRANSACTIONS[0]).flag === "HIGH"}
        onRowClick={(r) => console.log(r)}
        columns={[
          { key: "id",     label: "TX ID",   width: 88 },
          { key: "amount", label: "AMOUNT",  width: 90 },
          { key: "from",   label: "FROM" },
          { key: "to",     label: "TO" },
          { key: "time",   label: "TIME",    width: 70 },
          { key: "method", label: "METHOD",  width: 80 },
          { key: "flag",   label: "FLAG",    width: 70, render: (v) => v ? <span style={{ color: ACCENT, fontSize: 9 }}>{String(v)}</span> : <span style={{ color: "#222", fontSize: 9 }}>—</span> },
        ]}
        rows={rows as Record<string, unknown>[]}
      />
    </div>
  )
}
