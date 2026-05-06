"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FF6B00"

// GothGirl / joko1132 is the key entry — password recently changed
const PASSWORDS = [
  { id: "PW-001", username: "RedFox", email: "r.f@secnode.net", password: "r3dfox!2025", role: "ADMIN", lastLogin: "2025-10-16 03:14", changed: false },
  { id: "PW-002", username: "NightKiller", email: "nk@darkweb.onion", password: "n1ght_k1ll", role: "OPERATOR", lastLogin: "2025-10-15 23:55", changed: false },
  { id: "PW-003", username: "GothGirl", email: "g.girl@secnode.net", password: "joko1132", role: "OPERATOR", lastLogin: "2025-10-13 18:22", changed: true, note: "⚠ Паролата е сменена преди 3 дни — старата е тук, новата е неизвестна" },
  { id: "PW-004", username: "ToxicBabe", email: "txb@darkpool.net", password: "t0x1c_b@be", role: "OPERATOR", lastLogin: "2025-10-15 20:10", changed: false },
  { id: "PW-005", username: "Black-Voyvoda", email: "bv@secnode.net", password: "Bl@ck_V0jv0da", role: "OPERATOR", lastLogin: "2025-10-15 22:30", changed: false },
  { id: "PW-006", username: "DataCracker6", email: "dc6@nullsyn.net", password: "d4t@cr4ck6r", role: "ANALYST", lastLogin: "2025-10-14 11:00", changed: false },
  { id: "PW-007", username: "OutsiderX", email: "ox@anon.onion", password: "0uts1der_x", role: "GUEST", lastLogin: "2025-09-30 09:00", changed: false },
  { id: "PW-008", username: "NullSyn", email: "null@nullsyn.net", password: "n0llsyn!core", role: "ANALYST", lastLogin: "2025-10-10 14:00", changed: false },
  { id: "PW-009", username: "PageGhost", email: "pg@pageghost.onion", password: "p@geGh0st2024", role: "SERVICE", lastLogin: "2025-10-12 16:45", changed: false },
  { id: "PW-010", username: "CellTrace", email: "ct@celltrace.onion", password: "c3lltr@ce_9", role: "SERVICE", lastLogin: "2025-10-15 19:00", changed: false },
  { id: "PW-011", username: "CardForge", email: "cf@cardforge.onion", password: "c4rdF0rg3!", role: "SERVICE", lastLogin: "2025-10-08 08:00", changed: false },
  { id: "PW-012", username: "BruteForce", email: "bf@secnode.net", password: "Br0t3f0rc3!", role: "SERVICE", lastLogin: "2025-10-15 22:01", changed: false },
]

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#FF0033",
  OPERATOR: ACCENT,
  ANALYST: "#FFD700",
  GUEST: "#909090",
  SERVICE: "#00A8FF",
}

export default function LeaksPasswordsPage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [revealed, setRevealed] = useState<string[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (pw: typeof PASSWORDS[number], field: string, text: string, confidence = 3) => {
    const id = `passwords-${pw.id}-${field}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[PASSWORDS] ${pw.username} — ${field}`,
      text, sourceRoute: "/leaks/passwords",
      confidence, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  const filtered = search
    ? PASSWORDS.filter((p) => p.username.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase()))
    : PASSWORDS

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", textDecoration: "none" }}>← LEAKS</Link>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="PASSWORDS" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <div style={{ padding: "10px 14px", background: "#0d0500", border: `1px solid ${ACCENT}20`, marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          {PASSWORDS.length} акаунта. Паролите са хеширани (показани за demo). Открий <span style={{ color: ACCENT }}>GothGirl</span> — нейните данни са ключови за /cult/chat-system.
        </p>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Търси по username или роля..."
        style={{ width: "100%", padding: "7px 12px", background: "#0d0d0d", border: "1px solid #1e1e1e", color: "#e0e0e0", fontSize: 11, fontFamily: "var(--font-mono)", marginBottom: 12, outline: "none" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filtered.map((pw) => {
          const isRevealed = revealed.includes(pw.id)
          const isSaved = savedClues.includes(`passwords-${pw.id}-credentials`)
          return (
            <div key={pw.id} style={{ padding: "10px 14px", background: pw.changed ? "#0d0600" : "#090909", border: `1px solid ${pw.changed ? ACCENT + "30" : "#141414"}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {pw.changed && (
                <div style={{ width: "100%", padding: "4px 10px", background: `${ACCENT}15`, fontSize: 9, color: ACCENT, fontFamily: "var(--font-mono)", marginBottom: 6 }}>
                  ⚠ {pw.note}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#e0e0e0", fontWeight: 600, marginBottom: 4 }}>
                  {pw.username}
                  {pw.changed && <span style={{ marginLeft: 8, fontSize: 9, color: ACCENT, border: `1px solid ${ACCENT}40`, padding: "1px 5px" }}>CHANGED</span>}
                </div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090" }}>{pw.email}</div>
              </div>
              <div style={{ flex: 1, minWidth: 100 }}>
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ROLE_COLORS[pw.role], border: `1px solid ${ROLE_COLORS[pw.role]}30`, padding: "2px 8px" }}>
                  {pw.role}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <span style={{ fontSize: 9, color: "#444", fontFamily: "var(--font-mono)", marginRight: 6 }}>PASS:</span>
                {isRevealed ? (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: pw.changed ? ACCENT : "#c0c0c0", letterSpacing: "0.05em" }}>
                    {pw.password}
                  </motion.span>
                ) : (
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.2em" }}>{"•".repeat(pw.password.length)}</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => setRevealed((r) => isRevealed ? r.filter((x) => x !== pw.id) : [...r, pw.id])}
                  style={{ padding: "3px 10px", fontSize: 9, fontFamily: "var(--font-mono)", background: "#0d0d0d", color: "#999999", border: "1px solid #1e1e1e", cursor: "pointer" }}>
                  {isRevealed ? "HIDE" : "REVEAL"}
                </button>
                <button onClick={() => handleSave(pw, "credentials", `${pw.username} / ${pw.password} — ${pw.email} [${pw.role}]${pw.changed ? " ⚠ PASSWORD CHANGED" : ""}`, pw.changed ? 5 : 3)}
                  style={{ padding: "3px 10px", fontSize: 9, fontFamily: "var(--font-mono)", background: isSaved ? `${ACCENT}18` : "#0d0d0d", color: isSaved ? ACCENT : "#999999", border: `1px solid ${isSaved ? ACCENT + "40" : "#1e1e1e"}`, cursor: "pointer" }}>
                  {isSaved ? "✓" : "SAVE"}
                </button>
              </div>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", flexShrink: 0 }}>{pw.lastLogin}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
