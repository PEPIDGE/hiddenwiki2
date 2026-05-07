"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#CC44FF"

type Photo = {
  id: string
  bg: string
  lines: string[]
  caption: string
  date: string
  location: string
  clue: string
}

type Folder = {
  id: string
  label: string
  count: number
  color: string
  photos: Photo[]
}

const FOLDERS: Folder[] = [
  {
    id: "folder-lora",
    label: "ЛОРА КОСТОВА",
    count: 3,
    color: "#CC44FF",
    photos: [
      { id: "P-001", bg: "#1a0f0f", lines: ["#3a1a1a","#2a1010","#1e0e0e"], caption: "Лора Костова — последна снимка преди изчезването", date: "2025-10-15 22:14", location: "Ул. Г. Бенковски 4, София", clue: "Снимка на Лора Костова — 15.10.2025 22:14, Ул. Г. Бенковски 4, Sofia" },
      { id: "P-006", bg: "#130e0a", lines: ["#28201a","#1c1610","#12100a"], caption: "Записка под вратата на Лора", date: "2025-10-12 09:00", location: "Жилището на Лора", clue: "Записка до Лора: 'Знаем за теб. Огледален преход, 15 окт.' — изпратена 12.10.2025" },
      { id: "P-009", bg: "#0e0e0e", lines: ["#1e1e1e","#161616","#0e0e0e"], caption: "Телефон с разбит екран — до стая 9", date: "2025-10-16 01:50", location: "Коридор до стая 9, Захарна фабрика", clue: "Телефон на Лора Костова — намерен в коридора. Последно обаждане: +359 88 *** 1221" },
    ],
  },
  {
    id: "folder-zahar",
    label: "ЗАХАРНА ФАБРИКА",
    count: 4,
    color: "#FF6644",
    photos: [
      { id: "P-003", bg: "#0f130d", lines: ["#1e2e18","#121e0f","#0d160a"], caption: "Захарна фабрика — западно крило, нощна снимка", date: "2025-10-16 01:30", location: "Захарна фабрика, западно крило", clue: "Захарна фабрика, западно крило — 01:30 на 16.10.2025" },
      { id: "P-004", bg: "#14100a", lines: ["#2e2010","#201808","#160e05"], caption: "Врата с жълто-черна лента — стая 9", date: "2025-10-16 01:33", location: "Захарна фабрика, стая 9", clue: "Стая 9, Захарна фабрика — жълто-черна лента, врата залостена отвътре" },
      { id: "P-007", bg: "#0d1214", lines: ["#182430","#101820","#0a1018"], caption: "Фенерче намерено в стая 7 — гравиран символ", date: "2025-10-16 02:00", location: "Захарна фабрика, стая 7", clue: "Фенерче с гравиран символ — Братство на третото пробуждане. Намерено в стая 7" },
      { id: "P-010", bg: "#100d0a", lines: ["#20180e","#16100a","#0e0a06"], caption: "Стол с въжета — стая 9", date: "2025-10-16 03:00", location: "Захарна фабрика, стая 9", clue: "Стол с въжета в стая 9 — Захарна фабрика. Следи от задържане" },
    ],
  },
  {
    id: "folder-bratstvo",
    label: "БРАТСТВО",
    count: 2,
    color: "#44AAFF",
    photos: [
      { id: "P-005", bg: "#0f0d14", lines: ["#1e1830","#14102a","#0e0c1e"], caption: "Група от 5 лица — неразпознати", date: "2025-09-21 20:00", location: "Огледален преход — събитие", clue: "5 лица на Огледален преход — събитие 21.09.2025, неидентифицирани" },
      { id: "P-012", bg: "#0f0f0d", lines: ["#20201a","#161610","#0e0e08"], caption: "Годишна среща — Братство, снимки", date: "2025-08-10 19:00", location: "Неизвестна", clue: "Годишна среща на Братството на третото пробуждане — август 2025, локацията е скрита" },
    ],
  },
  {
    id: "folder-vehicle",
    label: "ПРЕВОЗНИ СРЕДСТВА",
    count: 2,
    color: "#FFAA22",
    photos: [
      { id: "P-002", bg: "#0d0f14", lines: ["#1a2030","#101520","#0a1018"], caption: "Черен Audi A3 — засечен пред блока", date: "2025-10-15 22:09", location: "Ул. Г. Бенковски 4, София", clue: "Черен Audi A3 заснет пред жилището на Лора — 22:09, 5 мин преди снимка P-001" },
      { id: "P-011", bg: "#0a0a10", lines: ["#14142a","#0e0e1e","#080810"], caption: "Силует — черна качулка, мъж", date: "2025-10-15 22:11", location: "Ул. Г. Бенковски 4, паркинг", clue: "Силует — черна качулка, паркинг пред блока на Лора, 22:11" },
    ],
  },
  {
    id: "folder-evidence",
    label: "ДОКАЗАТЕЛСТВА",
    count: 1,
    color: "#44FF88",
    photos: [
      { id: "P-008", bg: "#130d14", lines: ["#2a1830","#1e1020","#140a18"], caption: "Кутия тетрабеназин — без рецепта", date: "2025-10-17 11:00", location: "Стая 9, намерена след инцидента", clue: "Тетрабеназин открит в стая 9 — принудителна седация. Вижте /leaks/cards → Румен Алексиев" },
    ],
  },
  {
    id: "folder-classified",
    label: "КЛАСИФИЦИРАНО",
    count: 0,
    color: "#FF4444",
    photos: [],
  },
]

function PhotoCard({ photo, isSaved, onSave }: {
  photo: Photo
  isSaved: boolean
  onSave: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: photo.bg,
        border: `1px solid ${isSaved ? ACCENT + "55" : "#1c1c1c"}`,
        overflow: "hidden",
        cursor: "default",
        aspectRatio: "4/3",
      }}
    >
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {[...Array(18)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0,
            top: `${(i / 18) * 100}%`, height: 1,
            background: photo.lines[i % photo.lines.length],
            opacity: 0.5,
          }} />
        ))}
        <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(90deg, transparent 0px, transparent 3px, ${photo.bg}88 3px, ${photo.bg}88 4px)`, opacity: 0.3 }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`, opacity: 0.6 }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
        <div style={{ position: "absolute", top: 8, left: 8, fontSize: 8, fontFamily: "var(--font-mono)", color: "#ffffff30", letterSpacing: "0.15em" }}>{photo.id}</div>
        <div style={{ position: "absolute", bottom: 8, left: 8, fontSize: 7, fontFamily: "var(--font-mono)", color: "#ffffff25", letterSpacing: "0.05em" }}>{photo.date}</div>
        {isSaved && (
          <div style={{ position: "absolute", top: 8, right: 8, fontSize: 7, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.1em" }}>✓ SAVED</div>
        )}
      </div>

      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)",
        opacity: hovered ? 1 : 0,
        transition: "opacity 200ms ease",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: "10px 12px",
        gap: 8,
      }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#d0d0d0", lineHeight: 1.5 }}>{photo.caption}</div>
        <button
          onClick={onSave}
          style={{
            alignSelf: "flex-start",
            padding: "4px 12px",
            fontSize: 8,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.12em",
            background: isSaved ? `${ACCENT}22` : "rgba(0,0,0,0.7)",
            color: isSaved ? ACCENT : "#cccccc",
            border: `1px solid ${isSaved ? ACCENT + "60" : "#444"}`,
            cursor: isSaved ? "default" : "pointer",
            transition: "all 150ms ease",
          }}
        >
          {isSaved ? "✓ SAVED" : "SAVE CLUE"}
        </button>
      </div>
    </motion.div>
  )
}

function FolderCard({ folder, onClick }: { folder: Folder; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const isEmpty = folder.photos.length === 0

  return (
    <motion.div
      whileHover={{ scale: isEmpty ? 1 : 1.02 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={isEmpty ? undefined : onClick}
      style={{
        position: "relative",
        background: "#0a0a0a",
        border: `1px solid ${hovered && !isEmpty ? folder.color + "50" : "#1e1e1e"}`,
        cursor: isEmpty ? "not-allowed" : "pointer",
        padding: "20px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "border-color 150ms ease",
        opacity: isEmpty ? 0.45 : 1,
      }}
    >
      {/* Folder icon */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 4C2 2.9 2.9 2 4 2H11L13 5H24C25.1 5 26 5.9 26 7V20C26 21.1 25.1 22 24 22H4C2.9 22 2 21.1 2 20V4Z"
            fill={folder.color + "18"} stroke={folder.color + "60"} strokeWidth="1" />
          <path d="M2 8H26" stroke={folder.color + "40"} strokeWidth="0.5" />
        </svg>
        <div>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: folder.color, letterSpacing: "0.15em", fontWeight: 600 }}>{folder.label}</div>
          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444", marginTop: 2 }}>
            {isEmpty ? "LOCKED" : `${folder.photos.length} ФАЙЛ${folder.photos.length !== 1 ? "А" : ""}`}
          </div>
        </div>
      </div>
      {/* Preview thumbnails */}
      {!isEmpty && (
        <div style={{ display: "flex", gap: 3 }}>
          {folder.photos.slice(0, 3).map((p) => (
            <div key={p.id} style={{ flex: 1, height: 28, background: p.bg, border: "1px solid #1a1a1a", position: "relative", overflow: "hidden" }}>
              {[0,1,2].map((i) => (
                <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${i * 33}%`, height: 1, background: p.lines[0], opacity: 0.4 }} />
              ))}
            </div>
          ))}
          {folder.photos.length > 3 && (
            <div style={{ width: 28, height: 28, background: "#111", border: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontFamily: "var(--font-mono)", color: "#555" }}>
              +{folder.photos.length - 3}
            </div>
          )}
        </div>
      )}
      {isEmpty && (
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#FF444460", letterSpacing: "0.1em" }}>ACCESS DENIED</div>
      )}
    </motion.div>
  )
}

export default function LeaksArchivePage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [openFolder, setOpenFolder] = useState<string | null>(null)

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (p: Photo, folderId: string) => {
    const id = `archive-${p.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[ARCHIVE] ${p.caption}`,
      text: p.clue, sourceRoute: "/leaks/archive",
      confidence: 3, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((prev) => [...prev, id])
  }

  const activeFolder = FOLDERS.find((f) => f.id === openFolder) ?? null

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", textDecoration: "none" }}>← LEAKS</Link>
          {openFolder && (
            <>
              <span style={{ fontSize: 9, color: "#333", fontFamily: "var(--font-mono)" }}>/</span>
              <button onClick={() => setOpenFolder(null)} style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", background: "none", border: "none", cursor: "pointer", padding: 0 }}>ARCHIVE</button>
              <span style={{ fontSize: 9, color: "#333", fontFamily: "var(--font-mono)" }}>/</span>
              <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.15em" }}>{activeFolder?.label}</span>
            </>
          )}
        </div>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="ARCHIVE" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <div style={{ padding: "10px 14px", background: "#0d000d", border: `1px solid ${ACCENT}20`, marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: "#c0c0c0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Галерия с изтекли конфиденциални снимки
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!openFolder ? (
          <motion.div
            key="folders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}
          >
            {FOLDERS.map((folder) => (
              <FolderCard key={folder.id} folder={folder} onClick={() => setOpenFolder(folder.id)} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={openFolder}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              onClick={() => setOpenFolder(null)}
              style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 9, fontFamily: "var(--font-mono)", color: "#666", letterSpacing: "0.12em" }}
            >
              ← НАЗАД КЪМ ПАПКИТЕ
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 6 }}>
              {activeFolder!.photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  isSaved={savedClues.includes(`archive-${photo.id}`)}
                  onSave={() => handleSave(photo, openFolder)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
