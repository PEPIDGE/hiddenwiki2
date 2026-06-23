"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FFB000"

// GothGirl / joko1132 is the key entry — password recently changed
const PASSWORDS = [
  { id: "PW-001", username: "RedFox", email: "r.f@secnode.net", password: "r3dfox!2025", role: "ADMIN", lastLogin: "2025-10-16 03:14", changed: true, note: "⚠ Паролата е сменена преди 1 ден — вероятна компрометация" },
  { id: "PW-002", username: "NightKiller", email: "nk@darkweb.onion", password: "n1ght_k1ll", role: "OPERATOR", lastLogin: "2025-10-15 23:55", changed: false },
  { id: "PW-003", username: "GothGirl", email: "g.girl@secnode.net", password: "joko1132", role: "OPERATOR", lastLogin: "2025-10-13 18:22", changed: true, note: "⚠ Паролата е сменена преди 3 дни — старата е тук, новата е неизвестна" },
  { id: "PW-004", username: "ToxicBabe", email: "txb@darkpool.net", password: "t0x1c_b@be", role: "OPERATOR", lastLogin: "2025-10-15 20:10", changed: false },
  { id: "PW-005", username: "Black-Voyvoda", email: "bv@secnode.net", password: "Bl@ck_V0jv0da", role: "OPERATOR", lastLogin: "2025-10-15 22:30", changed: true, note: "⚠ Паролата е сменена преди 5 дни" },
  { id: "PW-006", username: "DataCracker6", email: "dc6@nullsyn.net", password: "d4t@cr4ck6r", role: "ANALYST", lastLogin: "2025-10-14 11:00", changed: false },
  { id: "PW-007", username: "OutsiderX", email: "ox@anon.onion", password: "0uts1der_x", role: "GUEST", lastLogin: "2025-09-30 09:00", changed: false },
  { id: "PW-008", username: "NullSyn", email: "null@nullsyn.net", password: "n0llsyn!core", role: "ANALYST", lastLogin: "2025-10-10 14:00", changed: true, note: "⚠ Паролата е сменена преди 6 дни — повтаряща се активност" },
  { id: "PW-009", username: "PageGhost", email: "pg@pageghost.onion", password: "p@geGh0st2024", role: "SERVICE", lastLogin: "2025-10-12 16:45", changed: false },
  { id: "PW-010", username: "CellTrace", email: "ct@celltrace.onion", password: "c3lltr@ce_9", role: "SERVICE", lastLogin: "2025-10-15 19:00", changed: false },
  { id: "PW-011", username: "CardForge", email: "cf@cardforge.onion", password: "c4rdF0rg3!", role: "SERVICE", lastLogin: "2025-10-08 08:00", changed: true, note: "⚠ Паролата е сменена — акаунтът е маркиран за одит" },
  { id: "PW-012", username: "BruteForce", email: "bf@secnode.net", password: "Br0t3f0rc3!", role: "SERVICE", lastLogin: "2025-10-15 22:01", changed: false },
]

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#FF0033",
  OPERATOR: ACCENT,
  ANALYST: ACCENT,
  GUEST: "#9a9a9a",
  SERVICE: "#00FF41",
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
        <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#bdbdbd", letterSpacing: "0.12em", textDecoration: "none" }}>← LEAKS</Link>
        <div style={{ marginTop: 12 }}>
          <GlitchText text="PASSWORDS" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 10 }} />
      </div>

      <div style={{ padding: "12px 16px", background: "#0a0a06", border: `1px solid ${ACCENT}33`, marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: "#d6d6d6", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          {PASSWORDS.length} акаунта. Паролите са показани за demo. Открий <span style={{ color: ACCENT, fontWeight: 700 }}>GothGirl</span> — данните ѝ са ключови за CHAT SYSTEM секцията в култовите досиета.
        </p>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Търси по username или роля..."
        style={{ width: "100%", padding: "10px 14px", background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#e8e8e8", fontSize: 13, fontFamily: "var(--font-mono)", marginBottom: 12, outline: "none" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {filtered.map((pw) => {
          const isRevealed = revealed.includes(pw.id)
          const isSaved = savedClues.includes(`passwords-${pw.id}-credentials`)
          return (
            <div key={pw.id} style={{ padding: "12px 14px", background: pw.changed ? "#0d0a04" : "#0a0a0a", border: `1px solid ${pw.changed ? ACCENT + "44" : "#1a1a1a"}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              {pw.changed && pw.note && (
                <div style={{ width: "100%", padding: "6px 11px", background: `${ACCENT}14`, border: `1px solid ${ACCENT}33`, fontSize: 11, color: ACCENT, fontFamily: "var(--font-mono)", marginBottom: 4, lineHeight: 1.5 }}>
                  ⚠ {pw.note}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 130 }}>
                <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "#f0f0f0", fontWeight: 700, marginBottom: 4 }}>
                  {pw.username}
                  {pw.changed && <span style={{ marginLeft: 8, fontSize: 9, color: ACCENT, border: `1px solid ${ACCENT}55`, padding: "1px 6px", letterSpacing: "0.08em" }}>CHANGED</span>}
                </div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#a8a8a8" }}>{pw.email}</div>
              </div>
              <div style={{ flex: 1, minWidth: 100 }}>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: ROLE_COLORS[pw.role], border: `1px solid ${ROLE_COLORS[pw.role]}55`, padding: "3px 9px", letterSpacing: "0.06em", fontWeight: 700 }}>
                  {pw.role}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <span style={{ fontSize: 10, color: "#8a8a8a", fontFamily: "var(--font-mono)", marginRight: 7 }}>PASS:</span>
                {isRevealed ? (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: pw.changed ? ACCENT : "#e0e0e0", letterSpacing: "0.05em", fontWeight: 600 }}>
                    {pw.password}
                  </motion.span>
                ) : (
                  <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#555", letterSpacing: "0.2em" }}>{"•".repeat(pw.password.length)}</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => setRevealed((r) => isRevealed ? r.filter((x) => x !== pw.id) : [...r, pw.id])}
                  style={{ padding: "5px 12px", fontSize: 10, fontFamily: "var(--font-mono)", background: "#111", color: "#cccccc", border: "1px solid #333", cursor: "pointer", letterSpacing: "0.06em" }}>
                  {isRevealed ? "СКРИЙ" : "ПОКАЖИ"}
                </button>
                <button onClick={() => handleSave(pw, "credentials", `${pw.username} / ${pw.password} — ${pw.email} [${pw.role}]${pw.changed ? " ⚠ PASSWORD CHANGED" : ""}`, pw.changed ? 5 : 3)}
                  style={{ padding: "5px 12px", fontSize: 10, fontFamily: "var(--font-mono)", background: isSaved ? `${ACCENT}18` : "#111", color: isSaved ? ACCENT : "#cccccc", border: `1px solid ${isSaved ? ACCENT + "55" : "#333"}`, cursor: "pointer", letterSpacing: "0.06em" }}>
                  {isSaved ? "✓" : "SAVE"}
                </button>
              </div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#8a8a8a", flexShrink: 0 }}>{pw.lastLogin}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
