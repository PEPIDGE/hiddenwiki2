"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

export type SortDir = "asc" | "desc" | null

export interface Column<T> {
  key: keyof T
  label: string
  width?: number
  render?: (val: T[keyof T], row: T) => React.ReactNode
}

interface SortableTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  rows: T[]
  accentColor?: string
  maxHeight?: number
  onRowClick?: (row: T) => void
  rowHighlight?: (row: T) => boolean
  emptyMessage?: string
}

export function SortableTable<T extends Record<string, unknown>>({
  columns,
  rows,
  accentColor = "#00FF41",
  maxHeight = 420,
  onRowClick,
  rowHighlight,
  emptyMessage = "Няма данни.",
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return rows
    return [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const av2 = typeof av === "string" ? av.toLowerCase() : av
      const bv2 = typeof bv === "string" ? bv.toLowerCase() : bv
      if (av2 === bv2) return 0
      if (av2 == null) return 1
      if (bv2 == null) return -1
      const cmp = av2 < bv2 ? -1 : 1
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [rows, sortKey, sortDir])

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"))
      if (sortDir === "desc") setSortKey(null)
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const SortIndicator = ({ col }: { col: keyof T }) => {
    if (sortKey !== col) return <span style={{ color: "#222", marginLeft: 4 }}>⇅</span>
    return (
      <span style={{ color: accentColor, marginLeft: 4 }}>
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    )
  }

  return (
    <div style={{ border: "1px solid #181818", overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: columns.map((c) => c.width ? `${c.width}px` : "1fr").join(" "),
          background: "#050505",
          borderBottom: "1px solid #181818",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        {columns.map((col) => (
          <div
            key={String(col.key)}
            onClick={() => handleSort(col.key)}
            style={{
              padding: "9px 12px",
              fontSize: 8,
              fontFamily: "var(--font-mono)",
              color: sortKey === col.key ? accentColor : "#444",
              letterSpacing: "0.18em",
              cursor: "pointer",
              userSelect: "none",
              borderRight: "1px solid #0e0e0e",
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => { if (sortKey !== col.key) e.currentTarget.style.color = "#888" }}
            onMouseLeave={(e) => { if (sortKey !== col.key) e.currentTarget.style.color = "#444" }}
          >
            {col.label}
            <SortIndicator col={col.key} />
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ maxHeight, overflowY: "auto", overflowX: "hidden" }}>
        {sorted.length === 0 ? (
          <div style={{ padding: "28px 12px", textAlign: "center", fontSize: 10, fontFamily: "var(--font-mono)", color: "#2a2a2a" }}>
            {emptyMessage}
          </div>
        ) : (
          sorted.map((row, i) => {
            const highlighted = rowHighlight?.(row)
            const hovered = hoveredRow === i
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.012, 0.3) }}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onRowClick?.(row)}
                style={{
                  display: "grid",
                  gridTemplateColumns: columns.map((c) => c.width ? `${c.width}px` : "1fr").join(" "),
                  background: highlighted
                    ? `${accentColor}08`
                    : hovered
                    ? "#0a0a0a"
                    : i % 2 === 0 ? "#030303" : "#050505",
                  borderBottom: "1px solid #0d0d0d",
                  cursor: onRowClick ? "pointer" : "default",
                  borderLeft: highlighted ? `2px solid ${accentColor}40` : "2px solid transparent",
                  transition: "background 0.1s, border-color 0.1s",
                }}
              >
                {columns.map((col) => (
                  <div
                    key={String(col.key)}
                    style={{
                      padding: "8px 12px",
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      color: highlighted ? accentColor : hovered ? "#aaa" : "#555",
                      borderRight: "1px solid #0a0a0a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      letterSpacing: "0.04em",
                      lineHeight: 1.4,
                    }}
                  >
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                  </div>
                ))}
              </motion.div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "6px 12px",
        borderTop: "1px solid #0e0e0e",
        background: "#030303",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#222", letterSpacing: "0.12em" }}>
          {sorted.length} RECORDS
        </span>
        {sortKey && (
          <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: `${accentColor}50`, letterSpacing: "0.1em" }}>
            SORT: {String(sortKey).toUpperCase()} {sortDir?.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  )
}
