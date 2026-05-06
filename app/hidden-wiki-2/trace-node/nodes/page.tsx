"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlitchText } from "@/components/tor/glitch-text"
import { HackTerminal } from "@/components/tor/hack-terminal"
import { getGameState, saveGameState, type GameState } from "@/lib/game-state"

const ACCENT = "#00FF41"

const NODES = [
  { id: "NODE-A", label: "RED ROOM",   x: 18, y: 28, color: "#FF0033", active: true },
  { id: "NODE-C", label: "LEAKS",      x: 50, y: 52, color: "#FFD700", active: true },
  { id: "NODE-D", label: "EVENTS",     x: 14, y: 70, color: "#FF6B00", active: true },
  { id: "NODE-E", label: "CULT",       x: 82, y: 65, color: "#CC44FF", active: true },
  { id: "NODE-F", label: "FORUM",      x: 46, y: 84, color: "#00FF9F", active: true },
  { id: "TRACE",  label: "TRACE-NODE", x: 50, y: 34, color: ACCENT,    active: false },
]

const CONNECTIONS = [
  ["NODE-A", "NODE-C"], ["NODE-C", "TRACE"],
  ["NODE-D", "TRACE"],  ["NODE-E", "TRACE"],  ["NODE-F", "NODE-C"],
  ["NODE-A", "NODE-D"],
]

export default function TraceNodesPage() {
  const [hovered, setHovered] = useState<string | null>(null)

  const getNode = (id: string) => NODES.find((n) => n.id === id)

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#1a3a1a", letterSpacing: "0.35em", marginBottom: 8 }}>
          TRACE-NODE // NODE TOPOLOGY
        </div>
        <GlitchText text="NODE MAP" as="h1" intensity="low" color={ACCENT} className="text-2xl font-bold tracking-widest" />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}40, transparent)`, marginTop: 10 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 2 }}>
        {/* SVG Map */}
        <div style={{ padding: 24, border: "1px solid #181818", background: "#020202" }}>
          <svg viewBox="0 0 100 100" style={{ width: "100%", height: 420 }}>
            {/* connections */}
            {CONNECTIONS.map(([a, b], i) => {
              const na = getNode(a); const nb = getNode(b)
              if (!na || !nb) return null
              const isHovered = hovered === a || hovered === b
              return (
                <line key={i}
                  x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke={isHovered ? "#333" : "#181818"}
                  strokeWidth={isHovered ? "0.5" : "0.3"}
                  strokeDasharray={nb.id === "TRACE" ? "1 1" : undefined}
                />
              )
            })}
            {/* nodes */}
            {NODES.map((node) => {
              const isHov = hovered === node.id
              return (
                <g key={node.id}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "default" }}
                >
                  <rect
                    x={node.x - 4} y={node.y - 4} width={8} height={8}
                    fill={isHov ? `${node.color}30` : `${node.color}12`}
                    stroke={node.color}
                    strokeWidth={isHov ? "0.6" : "0.4"}
                  />
                  {node.active && (
                    <circle cx={node.x + 4} cy={node.y - 4} r="1.2" fill={node.color} opacity="0.8" />
                  )}
                  <text x={node.x} y={node.y + 10} textAnchor="middle"
                    style={{ fontSize: "3px", fill: node.color, fontFamily: "monospace", opacity: 0.7 }}>
                    {node.label}
                  </text>
                  {isHov && (
                    <rect x={node.x - 12} y={node.y - 14} width={24} height={7} fill="#030303" stroke={node.color} strokeWidth="0.3" />
                  )}
                  {isHov && (
                    <text x={node.x} y={node.y - 9.5} textAnchor="middle"
                      style={{ fontSize: "2.5px", fill: node.color, fontFamily: "monospace" }}>
                      {node.id} — {node.active ? "ACTIVE" : "LOCKED"}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Node list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NODES.map((node) => (
            <motion.div
              key={node.id}
              onHoverStart={() => setHovered(node.id)}
              onHoverEnd={() => setHovered(null)}
              style={{
                padding: "10px 14px",
                border: `1px solid ${hovered === node.id ? `${node.color}40` : "#141414"}`,
                background: hovered === node.id ? `${node.color}08` : "#030303",
                cursor: "default",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 5, height: 5, background: node.active ? node.color : "#222", flexShrink: 0 }} />
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: node.color, letterSpacing: "0.1em", fontWeight: 700 }}>
                  {node.id}
                </span>
              </div>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", paddingLeft: 13 }}>
                {node.label}
              </div>
              <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: node.active ? "#1a3a1a" : "#2a2a2a", paddingLeft: 13, marginTop: 3, letterSpacing: "0.1em" }}>
                {node.active ? "SIGNAL: ACTIVE" : "SIGNAL: PENDING"}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
