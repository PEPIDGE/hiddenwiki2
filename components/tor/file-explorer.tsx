"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface FSItem {
  id: string
  name: string
  type: "file" | "folder" | "encrypted" | "redacted"
  size?: string
  modified?: string
  classification?: string
  children?: FSItem[]
  locked?: boolean
  clue?: string
  content?: string
}

interface FileExplorerProps {
  items: FSItem[]
  accentColor?: string
  onFileOpen?: (item: FSItem) => void
  title?: string
}

const TYPE_ICONS: Record<FSItem["type"], string> = {
  file: "▪",
  folder: "▸",
  encrypted: "▓",
  redacted: "░",
}

const TYPE_COLORS: Record<FSItem["type"], string> = {
  file: "#909090",
  folder: "#bbbbbb",
  encrypted: "#FF6B00",
  redacted: "#333",
}

function FSRow({
  item,
  depth,
  accentColor,
  onFileOpen,
}: {
  item: FSItem
  depth: number
  accentColor: string
  onFileOpen?: (item: FSItem) => void
}) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  const isFolder = item.type === "folder"
  const icon = isFolder ? (open ? "▾" : "▸") : TYPE_ICONS[item.type]
  const color = hovered ? accentColor : TYPE_COLORS[item.type]

  const handleClick = () => {
    if (isFolder) setOpen((o) => !o)
    else if (!item.locked) onFileOpen?.(item)
  }

  return (
    <div>
      <div
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px 6px",
          paddingLeft: 10 + depth * 18,
          cursor: item.locked ? "not-allowed" : "pointer",
          borderBottom: "1px solid #080808",
          background: hovered ? "#0a0a0a" : "transparent",
          transition: "background 0.1s",
          opacity: item.locked ? 0.35 : 1,
        }}
      >
        <span style={{ fontSize: 10, color, width: 12, flexShrink: 0, fontFamily: "monospace" }}>
          {icon}
        </span>
        <span style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: hovered && !item.locked ? accentColor : item.type === "redacted" ? "#2a2a2a" : "#999999",
          letterSpacing: "0.04em",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {item.name}
        </span>
        {item.size && (
          <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#222", marginLeft: "auto", flexShrink: 0 }}>
            {item.size}
          </span>
        )}
        {item.modified && (
          <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1e1e1e", flexShrink: 0, marginLeft: 12 }}>
            {item.modified}
          </span>
        )}
        {item.classification && (
          <span style={{
            fontSize: 7, fontFamily: "var(--font-mono)", color: "#FF3333",
            border: "1px solid #2a0000", padding: "1px 5px", letterSpacing: "0.1em",
            flexShrink: 0, marginLeft: 8,
          }}>
            {item.classification}
          </span>
        )}
        {item.locked && (
          <span style={{ fontSize: 8, color: "#FF0033", marginLeft: 8 }}>🔒</span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isFolder && open && item.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: "hidden", borderLeft: "1px solid #0e0e0e", marginLeft: 10 + depth * 18 + 6 }}
          >
            {item.children.map((child) => (
              <FSRow key={child.id} item={child} depth={depth + 1} accentColor={accentColor} onFileOpen={onFileOpen} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FileExplorer({ items, accentColor = "#00FF41", onFileOpen, title = "FILE SYSTEM" }: FileExplorerProps) {
  return (
    <div style={{ border: "1px solid #181818", overflow: "hidden" }}>
      {/* Header bar */}
      <div style={{
        padding: "8px 12px",
        background: "#050505",
        borderBottom: "1px solid #181818",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#1a1a1a", "#1a1a1a", "#1a1a1a"].map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, background: c, border: "1px solid #222" }} />
          ))}
        </div>
        <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.2em", flex: 1, textAlign: "center" }}>
          {title}
        </span>
        <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#1a1a1a" }}>
          {items.length} ITEMS
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 60px 90px 80px",
        padding: "5px 10px",
        background: "#030303",
        borderBottom: "1px solid #0e0e0e",
      }}>
        {["NAME", "SIZE", "MODIFIED", "CLASS"].map((h) => (
          <span key={h} style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "#222", letterSpacing: "0.18em" }}>
            {h}
          </span>
        ))}
      </div>

      {/* Items */}
      <div style={{ background: "#030303" }}>
        {items.map((item) => (
          <FSRow key={item.id} item={item} depth={0} accentColor={accentColor} onFileOpen={onFileOpen} />
        ))}
      </div>
    </div>
  )
}
