"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { GlitchText } from "@/components/tor/glitch-text"
import { SortableTable } from "@/components/tor/sortable-table"

const ACCENT = "#FF3366"

const TRANSACTIONS = [
  { id: "TX-0019", amount: "€38.400", from: "[REDACTED]", to: "Виена 1891 // V-1831", time: "03:17", method: "CRYPTO", flag: "HIGH" },
  { id: "TX-0020", amount: "€2.100",  from: "NS-0",        to: "[INTERNAL]",           time: "09:00", method: "WIRE",   flag: null },
  { id: "TX-0021", amount: "€14.750", from: "B.ORC",       to: "CIRCUIT-3",            time: "18:30", method: "CRYPTO", flag: "HIGH" },
  { id: "TX-0022", amount: "€500",    from: "[DECOY]",     to: "[DECOY]",              time: "12:00", method: "CASH",  flag: null },
  { id: "TX-0023", amount: "€9.900",  from: "ARS-REFLECT", to: "calm_voice",           time: "22:17", method: "CRYPTO", flag: "HIGH" },
  { id: "TX-0024", amount: "€700",    from: "NS-0",        to: "[INTERNAL]",           time: "08:45", method: "WIRE",  flag: null },
  { id: "TX-0025", amount: "€21.000", from: "R.ALEXIEV",   to: "V-1831",              time: "03:17", method: "CRYPTO", flag: "HIGH" },
]

export default function FinanceTransactionsPage() {
  const [filter, setFilter] = useState<"all" | "anomaly">("all")
  const rows = filter === "anomaly" ? TRANSACTIONS.filter((t) => t.flag === "HIGH") : TRANSACTIONS

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#2a0015", letterSpacing: "0.35em", marginBottom: 8 }}>FINANCE // TRANSACTIONS</div>
        <GlitchText text="TRANSACTION LEDGER" as="h1" intensity="low" color={ACCENT} className="text-2xl font-bold tracking-widest" />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}40, transparent)`, marginTop: 10 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["all", "anomaly"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 14px", background: filter === f ? `${ACCENT}15` : "transparent",
            border: `1px solid ${filter === f ? `${ACCENT}50` : "#1a1a1a"}`,
            color: filter === f ? ACCENT : "#555",
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
          { key: "flag",   label: "FLAG",    width: 70, render: (v) => v ? <span style={{ color: ACCENT, fontSize: 8 }}>{String(v)}</span> : <span style={{ color: "#222", fontSize: 8 }}>—</span> },
        ]}
        rows={rows as Record<string, unknown>[]}
      />
    </div>
  )
}
