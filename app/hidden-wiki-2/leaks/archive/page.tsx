"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FFB000"

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
    label: "Улични общински камери",
    count: 3,
    color: "#FFB000",
    photos: [
      { id: "P-001", bg: "#1a0f0f", lines: ["#3a1a1a","#2a1010","#1e0e0e"], caption: "Лора Костова — последна снимка преди изчезването", date: "2025-10-15 22:14", location: "Ул. Г. Бенковски 4, София", clue: "Снимка на Лора Костова — 15.10.2025 22:14, Ул. Г. Бенковски 4, Sofia" },
      { id: "P-006", bg: "#130e0a", lines: ["#28201a","#1c1610","#12100a"], caption: "Записка под вратата на Лора", date: "2025-10-12 09:00", location: "Жилището на Лора", clue: "Записка до Лора: 'Знаем за теб. Огледален преход, 15 окт.' — изпратена 12.10.2025" },
      { id: "P-009", bg: "#0e0e0e", lines: ["#1e1e1e","#161616","#0e0e0e"], caption: "Телефон с разбит екран — до стая 9", date: "2025-10-16 01:50", location: "Коридор до стая 9, Захарна фабрика", clue: "Телефон на Лора Костова — намерен в коридора. Последно обаждане: +359 88 *** 1221" },
    ],
  },
  {
    id: "folder-zahar",
    label: "Частни охранителни камери",
    count: 4,
    color: "#FFB000",
    photos: [
      { id: "P-003", bg: "#0f130d", lines: ["#1e2e18","#121e0f","#0d160a"], caption: "Захарна фабрика — западно крило, нощна снимка", date: "2025-10-16 01:30", location: "Захарна фабрика, западно крило", clue: "Захарна фабрика, западно крило — 01:30 на 16.10.2025" },
      { id: "P-004", bg: "#14100a", lines: ["#2e2010","#201808","#160e05"], caption: "Врата с жълто-черна лента — стая 9", date: "2025-10-16 01:33", location: "Захарна фабрика, стая 9", clue: "Стая 9, Захарна фабрика — жълто-черна лента, врата залостена отвътре" },
      { id: "P-007", bg: "#0d1214", lines: ["#182430","#101820","#0a1018"], caption: "Фенерче намерено в стая 7 — гравиран символ", date: "2025-10-16 02:00", location: "Захарна фабрика, стая 7", clue: "Фенерче с гравиран символ — Братство на третото пробуждане. Намерено в стая 7" },
      { id: "P-010", bg: "#100d0a", lines: ["#20180e","#16100a","#0e0a06"], caption: "Стол с въжета — стая 9", date: "2025-10-16 03:00", location: "Захарна фабрика, стая 9", clue: "Стол с въжета в стая 9 — Захарна фабрика. Следи от задържане" },
    ],
  },
  {
    id: "folder-bratstvo",
    label: "Камери на жилищни кооперации и етажна собственост",
    count: 2,
    color: "#FFB000",
    photos: [
      { id: "P-005", bg: "#0f0d14", lines: ["#1e1830","#14102a","#0e0c1e"], caption: "Група от 5 лица — неразпознати", date: "2025-09-21 20:00", location: "Огледален преход — събитие", clue: "5 лица на Огледален преход — събитие 21.09.2025, неидентифицирани" },
      { id: "P-012", bg: "#0f0f0d", lines: ["#20201a","#161610","#0e0e08"], caption: "Годишна среща — Братство, снимки", date: "2025-08-10 19:00", location: "Неизвестна", clue: "Годишна среща на Братството на третото пробуждане — август 2025, локацията е скрита" },
    ],
  },
  {
    id: "folder-vehicle",
    label: "Търговски и бизнес камери",
    count: 2,
    color: "#FFB000",
    photos: [
      { id: "P-002", bg: "#0d0f14", lines: ["#1a2030","#101520","#0a1018"], caption: "Черен Audi A3 — засечен пред блока", date: "2025-10-15 22:09", location: "Ул. Г. Бенковски 4, София", clue: "Черен Audi A3 заснет пред жилището на Лора — 22:09, 5 мин преди снимка P-001" },
      { id: "P-011", bg: "#0a0a10", lines: ["#14142a","#0e0e1e","#080810"], caption: "Силует — черна качулка, мъж", date: "2025-10-15 22:11", location: "Ул. Г. Бенковски 4, паркинг", clue: "Силует — черна качулка, паркинг пред блока на Лора, 22:11" },
    ],
  },
  {
    id: "folder-evidence",
    label: "Камери в обществен транспорт",
    count: 1,
    color: "#FFB000",
    photos: [
      { id: "P-008", bg: "#130d14", lines: ["#2a1830","#1e1020","#140a18"], caption: "Кутия тетрабеназин — без рецепта", date: "2025-10-17 11:00", location: "Стая 9, намерена след инцидента", clue: "Тетрабеназин открит в стая 9 — принудителна седация. Вижте /leaks/cards → Румен Алексиев" },
    ],
  },
]

const TARGET_PHOTO_COUNTS: Record<string, number> = {
  "folder-lora": 14,
  "folder-zahar": 15,
  "folder-bratstvo": 16,
  "folder-vehicle": 17,
  "folder-evidence": 18,
  "folder-classified": 19,
}

const GENERATED_CAMERA_LABELS = [
  "северен вход",
  "южен вход",
  "паркинг зона",
  "автобусна спирка",
  "страничен коридор",
  "товарна рампа",
  "кръстовище",
  "подлез",
  "фоайе",
  "асансьорна площадка",
  "касова зона",
  "служебен вход",
  "перон",
  "стълбище",
  "заден двор",
  "локален запис",
  "резервен feed",
  "нощен кадър",
  "архивен фрагмент",
]

function makeGeneratedPhoto(folder: Folder, folderIndex: number, index: number): Photo {
  const cameraLabel = GENERATED_CAMERA_LABELS[index % GENERATED_CAMERA_LABELS.length]
  const idSuffix = `${folderIndex + 1}${String(index + 1).padStart(2, "0")}`
  const hour = String(21 + (index % 4)).padStart(2, "0")
  const minute = String((index * 7 + folderIndex * 3) % 60).padStart(2, "0")
  const day = String(10 + ((index + folderIndex) % 8)).padStart(2, "0")
  const shade = 9 + ((index + folderIndex) % 6)

  return {
    id: `P-${idSuffix}`,
    bg: `#0${shade.toString(16)}0${((shade + 2) % 16).toString(16)}10`,
    lines: ["#202030", "#151520", "#0b0b12"],
    caption: `${folder.label} — ${cameraLabel}`,
    date: `2025-10-${day} ${hour}:${minute}`,
    location: `${folder.label}, ${cameraLabel}`,
    clue: `Кадър от ${folder.label.toLowerCase()} — ${cameraLabel}, 2025-10-${day} ${hour}:${minute}.`,
  }
}

const ARCHIVE_FOLDERS: Folder[] = FOLDERS.map((folder, folderIndex) => {
  const targetCount = TARGET_PHOTO_COUNTS[folder.id] ?? folder.photos.length
  const generatedCount = Math.max(0, targetCount - folder.photos.length)
  const generatedPhotos = Array.from({ length: generatedCount }, (_, index) =>
    makeGeneratedPhoto(folder, folderIndex, index),
  )

  return {
    ...folder,
    count: targetCount,
    photos: [...folder.photos, ...generatedPhotos],
  }
})

function PhotoCard({ photo, isSaved, onSave, highlight = false }: {
  photo: Photo
  isSaved: boolean
  onSave: () => void
  highlight?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const showOverlay = hovered || highlight

  return (
    <motion.div
      id={`clue-archive-${photo.id}`}
      whileHover={{ scale: 1.02 }}
      animate={highlight ? { boxShadow: [`0 0 0px ${ACCENT}00`, `0 0 22px ${ACCENT}aa`, `0 0 10px ${ACCENT}55`] } : {}}
      transition={highlight ? { duration: 1.1, repeat: 2 } : {}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: photo.bg,
        border: `1px solid ${highlight ? ACCENT : isSaved ? ACCENT + "55" : "#1c1c1c"}`,
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
        <div style={{ position: "absolute", top: 8, left: 8, fontSize: 9, fontFamily: "var(--font-mono)", color: "#ffffffaa", letterSpacing: "0.12em" }}>{photo.id}</div>
        <div style={{ position: "absolute", bottom: 8, left: 8, fontSize: 9, fontFamily: "var(--font-mono)", color: "#ffffff88", letterSpacing: "0.04em" }}>{photo.date}</div>
        {isSaved && (
          <div style={{ position: "absolute", top: 8, right: 8, fontSize: 9, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.08em" }}>✓ SAVED</div>
        )}
      </div>

      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.55) 55%, transparent 100%)",
        opacity: showOverlay ? 1 : 0,
        transition: "opacity 200ms ease",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: "10px 12px",
        gap: 8,
      }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#f0f0f0", lineHeight: 1.55 }}>{photo.caption}</div>
        <button
          onClick={onSave}
          style={{
            alignSelf: "flex-start",
            padding: "5px 13px",
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.12em",
            background: isSaved ? `${ACCENT}22` : "rgba(0,0,0,0.75)",
            color: isSaved ? ACCENT : "#eeeeee",
            border: `1px solid ${isSaved ? ACCENT + "60" : "#666"}`,
            cursor: isSaved ? "default" : "pointer",
            transition: "all 150ms ease",
          }}
        >
          {isSaved ? "✓ ЗАПАЗЕНА" : "ЗАПАЗИ УЛИКА"}
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
        <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d="M2 4C2 2.9 2.9 2 4 2H11L13 5H24C25.1 5 26 5.9 26 7V20C26 21.1 25.1 22 24 22H4C2.9 22 2 21.1 2 20V4Z"
            fill={folder.color + "18"} stroke={folder.color + "60"} strokeWidth="1" />
          <path d="M2 8H26" stroke={folder.color + "40"} strokeWidth="0.5" />
        </svg>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: folder.color, letterSpacing: "0.06em", fontWeight: 600, lineHeight: 1.45, overflowWrap: "anywhere" }}>{folder.label}</div>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#9a9a9a", marginTop: 3 }}>
            {isEmpty ? "ЗАКЛЮЧЕНА" : `${folder.photos.length} ФАЙЛ${folder.photos.length !== 1 ? "А" : ""}`}
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
            <div style={{ width: 28, height: 28, background: "#111", border: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontFamily: "var(--font-mono)", color: "#9a9a9a" }}>
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

const ARCHIVE_PATH = "/hidden-wiki-2/leaks/archive"

function LeaksArchiveInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [highlightId, setHighlightId] = useState<string | null>(null)

  const folderParam = searchParams.get("folder")
  const clueParam = searchParams.get("clue")

  // A clue deep-link (?clue=archive-P-001) implies which folder to open.
  const folderFromClue = clueParam
    ? ARCHIVE_FOLDERS.find((f) => f.photos.some((p) => `archive-${p.id}` === clueParam))?.id ?? null
    : null

  const openFolder = folderParam ?? folderFromClue
  const activeFolder = ARCHIVE_FOLDERS.find((f) => f.id === openFolder) ?? null

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  // When arriving via a clue link, scroll to and highlight the photo.
  useEffect(() => {
    if (!clueParam || !activeFolder) return
    const photoId = clueParam.replace(/^archive-/, "")
    const t = setTimeout(() => {
      const el = document.getElementById(`clue-archive-${photoId}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        setHighlightId(clueParam)
        setTimeout(() => setHighlightId(null), 3600)
      }
    }, 260)
    return () => clearTimeout(t)
  }, [clueParam, activeFolder])

  const handleSave = (p: Photo) => {
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

  const openFolderRoute = (id: string) => router.push(`${ARCHIVE_PATH}?folder=${id}`)
  const backToFolders = () => router.push(ARCHIVE_PATH)

  const crumbStyle = {
    fontSize: 11, fontFamily: "var(--font-mono)", color: "#bdbdbd",
    letterSpacing: "0.1em", textDecoration: "none", background: "none",
    border: "none", cursor: "pointer", padding: 0,
  } as const

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        {/* Hierarchical breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/hidden-wiki-2/leaks" style={crumbStyle}>← LEAKS</Link>
          <span style={{ fontSize: 11, color: "#555", fontFamily: "var(--font-mono)" }}>/</span>
          {openFolder ? (
            <button onClick={backToFolders} style={crumbStyle}>ARCHIVE</button>
          ) : (
            <span style={{ ...crumbStyle, color: ACCENT, cursor: "default" }}>ARCHIVE</span>
          )}
          {openFolder && (
            <>
              <span style={{ fontSize: 11, color: "#555", fontFamily: "var(--font-mono)" }}>/</span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.1em" }}>{activeFolder?.label}</span>
            </>
          )}
        </div>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="ARCHIVE" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8 }} />
      </div>

      <div style={{ padding: "10px 14px", background: "#0a0a06", border: `1px solid ${ACCENT}33`, marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: "#d0d0d0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Галерия с изтекли конфиденциални снимки. Задръж върху кадър и натисни „ЗАПАЗИ УЛИКА“.
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
            {ARCHIVE_FOLDERS.map((folder) => (
              <FolderCard key={folder.id} folder={folder} onClick={() => openFolderRoute(folder.id)} />
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
              onClick={backToFolders}
              style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, fontFamily: "var(--font-mono)", color: "#bdbdbd", letterSpacing: "0.1em" }}
            >
              ← НАЗАД КЪМ ПАПКИТЕ
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 6 }}>
              {activeFolder!.photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  isSaved={savedClues.includes(`archive-${photo.id}`)}
                  highlight={highlightId === `archive-${photo.id}`}
                  onSave={() => handleSave(photo)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LeaksArchivePage() {
  return (
    <Suspense fallback={null}>
      <LeaksArchiveInner />
    </Suspense>
  )
}
