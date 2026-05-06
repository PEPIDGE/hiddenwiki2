"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FFD700"

const DOCS = [
  { id: "D-001", name: "bratstvo_manifest_v3.pdf", classification: "CLASSIFIED", operator: "RedFox", date: "2025-09-15", size: "18 KB", tags: ["секта", "Братство"], clue: "Манифест на Братството на третото пробуждане — вътрешна версия v3", isFake: false },
  { id: "D-002", name: "nightkiller_route_coords.txt", classification: "RESTRICTED", operator: "NightKiller", date: "2025-10-14", size: "0.4 KB", tags: ["координати", "маршрут"], clue: "NightKiller: route-17-night координати — ВНИМАНИЕ: вероятно bait данни", isFake: true },
  { id: "D-003", name: "org_members_oct25.csv", classification: "CONFIDENTIAL", operator: "DataCracker6", date: "2025-10-01", size: "6.2 KB", tags: ["членове", "организация"], clue: "Списък с членове на организацията — октомври 2025", isFake: false },
  { id: "D-004", name: "gps_fragment_fake_01.txt", classification: "INTERNAL", operator: "NullSyn", date: "2025-10-10", size: "0.1 KB", tags: ["GPS", "фалшив"], clue: "GPS Fragment: 42.XXX, 23.XXX — ФАЛШИВ, не води до нищо", isFake: true },
  { id: "D-005", name: "ogledalenprehod_invite_scan.jpg", classification: "CONFIDENTIAL", operator: "GothGirl", date: "2025-10-13", size: "220 KB", tags: ["покана", "Огледален преход"], clue: "Сканирана покана за Огледален преход — без конкретна локация", isFake: false },
  { id: "D-006", name: "zaharna_fabrika_plan.pdf", classification: "RESTRICTED", operator: "Black-Voyvoda", date: "2025-08-20", size: "44 KB", tags: ["Захарна фабрика", "план", "локация"], clue: "План на Захарна фабрика — западно крило, стаи 7-12", isFake: false },
  { id: "D-007", name: "decoy_coords_02.txt", classification: "INTERNAL", operator: "DataCracker6", date: "2025-10-12", size: "0.2 KB", tags: ["координати", "decoy"], clue: "GPS Fragment: 43.XXX, 25.XXX — ФАЛШИВ, wrong person координати", isFake: true },
  { id: "D-008", name: "third_awakening_ritual.pdf", classification: "CLASSIFIED", operator: "RedFox", date: "2025-09-01", size: "30 KB", tags: ["ритуал", "пробуждане"], clue: "Ритуалът на третото пробуждане — три фази, Лора е 'неподготвена' жертва", isFake: false },
  { id: "D-009", name: "audi_registration_partial.txt", classification: "RESTRICTED", operator: "Black-Voyvoda", date: "2025-10-16", size: "0.3 KB", tags: ["Audi", "регистрация", "кола"], clue: "Частична регистрация: Черен Audi A3 (2005), собственик: Д.М.", isFake: false },
  { id: "D-010", name: "forum_dump_anon.sql", classification: "INTERNAL", operator: "DataCracker6", date: "2025-11-05", size: "1.1 MB", tags: ["форум", "dump"], clue: "Forum dump — анонимни акаунти и частични чатове", isFake: false },
  { id: "D-011", name: "nightkiller_wrong_gps.txt", classification: "INTERNAL", operator: "NullSyn", date: "2025-10-15", size: "0.2 KB", tags: ["GPS", "NightKiller", "грешен"], clue: "GPS данни за NightKiller — водят към грешна локация (decoy)", isFake: true },
  { id: "D-012", name: "bratstvo_hierarchy_chart.pdf", classification: "CONFIDENTIAL", operator: "ToxicBabe", date: "2025-09-20", size: "8 KB", tags: ["йерархия", "Братство"], clue: "Йерархия на Братството: RedFox → ToxicBabe/GothGirl → NightKiller/Black-Voyvoda/DataCracker6", isFake: false },
]

const CLASS_COLORS: Record<string, string> = {
  CLASSIFIED: "#FF0033",
  CONFIDENTIAL: "#FF6B00",
  RESTRICTED: ACCENT,
  INTERNAL: "#999999",
}

export default function LeaksDocsPage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (doc: typeof DOCS[number]) => {
    const id = `leaks-doc-${doc.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[LEAKS/DOCS] ${doc.name}`,
      text: doc.clue, sourceRoute: "/leaks/docs",
      confidence: doc.isFake ? 1 : 3, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  const allTags = Array.from(new Set(DOCS.flatMap((d) => d.tags)))
  const filtered = tagFilter ? DOCS.filter((d) => d.tags.includes(tagFilter)) : DOCS

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", textDecoration: "none" }}>← LEAKS</Link>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="DOCS" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <div style={{ padding: "10px 14px", background: "#090900", border: `1px solid ${ACCENT}20`, marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          ⚠ Някои документи са <span style={{ color: "#FF0033" }}>decoy</span> — водят към грешни координати или хора. Търси tags <span style={{ color: ACCENT }}>Захарна фабрика</span>, <span style={{ color: ACCENT }}>Братство</span>, <span style={{ color: ACCENT }}>Audi</span>.
        </p>
      </div>

      {/* Tag filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
        <button onClick={() => setTagFilter(null)}
          style={{ padding: "3px 10px", fontSize: 9, fontFamily: "var(--font-mono)", background: !tagFilter ? `${ACCENT}22` : "#0a0a0a", color: !tagFilter ? ACCENT : "#909090", border: `1px solid ${!tagFilter ? ACCENT + "50" : "#1a1a1a"}`, cursor: "pointer", letterSpacing: "0.1em" }}>
          ALL
        </button>
        {allTags.map((tag) => (
          <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
            style={{ padding: "3px 8px", fontSize: 9, fontFamily: "var(--font-mono)", background: tagFilter === tag ? `${ACCENT}15` : "#090909", color: tagFilter === tag ? ACCENT : "#999999", border: `1px solid ${tagFilter === tag ? ACCENT + "30" : "#161616"}`, cursor: "pointer" }}>
            {tag}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {filtered.map((doc) => {
          const isExpanded = expanded === doc.id
          const isSaved = savedClues.includes(`leaks-doc-${doc.id}`)
          return (
            <div key={doc.id} style={{ background: "#090909", border: `1px solid ${doc.isFake ? "#1a0000" : "#151515"}`, position: "relative" }}>
              {doc.isFake && (
                <div style={{ position: "absolute", top: 0, right: 0, padding: "2px 8px", background: "#1a0000", fontSize: 7, fontFamily: "var(--font-mono)", color: "#FF003060", letterSpacing: "0.12em" }}>
                  UNVERIFIED
                </div>
              )}
              <div style={{ padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}
                onClick={() => setExpanded(isExpanded ? null : doc.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: CLASS_COLORS[doc.classification], letterSpacing: "0.12em" }}>
                      [{doc.classification}]
                    </span>
                    <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#444" }}>{doc.date} · {doc.size}</span>
                  </div>
                  <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#d0d0d0", letterSpacing: "0.04em", marginBottom: 4 }}>
                    {doc.name}
                  </div>
                  <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#999999" }}>
                    operator: <span style={{ color: "#bbbbbb" }}>{doc.operator}</span>
                    {doc.tags.map((t) => <span key={t} style={{ marginLeft: 6, color: "#444", fontSize: 9 }}>#{t}</span>)}
                  </div>
                </div>
                <span style={{ fontSize: 9, color: "#444", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{isExpanded ? "▲" : "▼"}</span>
              </div>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} style={{ borderTop: "1px solid #141414", padding: "10px 14px" }}>
                  <p style={{ fontSize: 11, color: "#c0c0c0", margin: "0 0 10px", fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
                    {doc.clue}
                  </p>
                  {doc.isFake && (
                    <p style={{ fontSize: 10, color: "#FF003080", margin: "0 0 10px", fontFamily: "var(--font-mono)" }}>
                      ⚠ Съдържа неверни или подвеждащи данни
                    </p>
                  )}
                  <button onClick={() => handleSave(doc)}
                    style={{ padding: "4px 12px", fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", background: isSaved ? `${ACCENT}18` : "#111", color: isSaved ? ACCENT : "#aaaaaa", border: `1px solid ${isSaved ? ACCENT + "50" : "#222"}`, cursor: "pointer" }}>
                    {isSaved ? "✓ SAVED" : "SAVE CLUE"}
                  </button>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}