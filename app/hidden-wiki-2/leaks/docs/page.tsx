"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Folder, FolderOpen } from "lucide-react"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"
import { PageHeader } from "@/components/tor/ui"

const ACCENT = "#FFB000"

type DocCategory =
  | "ЛИЧНИ КАРТИ / ПАСПОРТИ"
  | "ШОФЬОРСКИ КНИЖКИ"
  | "ДАНАЧНИ ДОКУМЕНТИ"
  | "ТРУДОВИ ДОГОВОРИ"
  | "ФИРМЕНИ ДОГОВОРИ"
  | "ПРЕЗЕНТАЦИИ"
  | "ЛИЧНИ СНИМКИ / ВИДЕО"
  | "ПОЛИЦЕЙСКИ / СЪДЕБНИ"
  | "ИМОТНИ ДОКУМЕНТИ"

interface Doc {
  id: string
  name: string
  category: DocCategory
  ext: string
  date: string
  size: string
  source: string
  preview: string
  tags: string[]
}

interface DocFolder {
  id: string
  category: DocCategory
  docs: Doc[]
}

const CAT_ID    = "ЛИЧНИ КАРТИ / ПАСПОРТИ"
const CAT_DL    = "ШОФЬОРСКИ КНИЖКИ"
const CAT_TAX   = "ДАНАЧНИ ДОКУМЕНТИ"
const CAT_HR    = "ТРУДОВИ ДОГОВОРИ"
const CAT_CORP  = "ФИРМЕНИ ДОГОВОРИ"
const CAT_PPT   = "ПРЕЗЕНТАЦИИ"
const CAT_IMG   = "ЛИЧНИ СНИМКИ / ВИДЕО"
const CAT_LAW   = "ПОЛИЦЕЙСКИ / СЪДЕБНИ"
const CAT_PROP  = "ИМОТНИ ДОКУМЕНТИ"

const BASE_DOCS: Doc[] = [
  {
    id: "D-001",
    name: "id_scan_petar_ivanov_90.jpg",
    category: CAT_ID,
    ext: "JPG",
    date: "2025-10-02",
    size: "184 KB",
    source: "anon_dump_@leakbot",
    preview: "Сканирана лична карта: Петър Иванов Петров, ЕГН 9004**1234, издадена МВР Пловдив 2021. Адрес: ул. Роза 14, ет. 3. Без връзка с основния случай.",
    tags: ["лична карта", "scan", "лични данни"],
  },
  {
    id: "D-002",
    name: "passport_maria_kostadinova.jpg",
    category: CAT_ID,
    ext: "JPG",
    date: "2025-10-08",
    size: "210 KB",
    source: "anon_dump_@leakbot",
    preview: "Паспорт: Мария Костадинова Иванова, № BG7854321, валиден до 2028. Снимката е частично замъглена. Лицето не е идентифицирано в случая.",
    tags: ["паспорт", "scan", "лични данни"],
  },
  {
    id: "D-003",
    name: "driving_license_georgi_stoyanov.jpg",
    category: CAT_DL,
    ext: "JPG",
    date: "2025-09-29",
    size: "96 KB",
    source: "paste_mirror_09",
    preview: "Шофьорска книжка: Георги Красимиров Стоянов, кат. B/C, издадена 2019, валидна до 2029. ЕГН частично видим. Не съответства на нито едно ППС в случая.",
    tags: ["шофьорска книжка", "лични данни"],
  },
  {
    id: "D-004",
    name: "driving_license_elena_dimitrova.pdf",
    category: CAT_DL,
    ext: "PDF",
    date: "2025-10-11",
    size: "74 KB",
    source: "paste_mirror_09",
    preview: "Шофьорска книжка: Елена Валентинова Димитрова, кат. B, издадена МВР Варна 2022. Адресът на гърба е нечетлив. Без отношение към разследването.",
    tags: ["шофьорска книжка", "лични данни"],
  },
  {
    id: "D-005",
    name: "tax_declaration_2024_nikolov_a.pdf",
    category: CAT_TAX,
    ext: "PDF",
    date: "2025-04-30",
    size: "118 KB",
    source: "nap_leak_mirror",
    preview: "Данъчна декларация обр. 2001 за 2024 г.: Александър Николов, ДОИ 8392****. Доходи от трудово правоотношение: 38 400 лв. Стандартен документ, без нередности.",
    tags: ["данъчна декларация", "НАП", "физическо лице"],
  },
  {
    id: "D-006",
    name: "vat_return_zvezda_eood_q3_2025.xlsx",
    category: CAT_TAX,
    ext: "XLSX",
    date: "2025-10-14",
    size: "52 KB",
    source: "nap_leak_mirror",
    preview: "ДДС декларация за Q3 2025: Звезда ЕООД, ЕИК 2059****. Начислен ДДС 12 800 лв, приспаднат 9 400 лв. Редовна декларация, без данъчни нарушения.",
    tags: ["ДДС", "фирма", "данъчни"],
  },
  {
    id: "D-007",
    name: "work_contract_dimitrova_e_2024.pdf",
    category: CAT_HR,
    ext: "PDF",
    date: "2024-03-01",
    size: "140 KB",
    source: "hr_dump_v2",
    preview: "Трудов договор: Елена Валентинова Димитрова, длъжност Мениджър обслужване на клиенти, брутна заплата 2 800 лв/мес, работодател: Медиа Груп ЕООД. Стандартен договор.",
    tags: ["трудов договор", "заплата", "служител"],
  },
  {
    id: "D-008",
    name: "payslip_oct2025_kolev_d.pdf",
    category: CAT_HR,
    ext: "PDF",
    date: "2025-10-31",
    size: "38 KB",
    source: "hr_dump_v2",
    preview: "Фиш за заплата: Димитър Колев, октомври 2025. Брутно 3 200 лв, нето 2 414 лв. Работодател: Инфотех АД. Без нередности.",
    tags: ["фиш", "заплата", "служител"],
  },
  {
    id: "D-009",
    name: "nda_zvezda_holding_mediagrup.pdf",
    category: CAT_CORP,
    ext: "PDF",
    date: "2025-07-15",
    size: "88 KB",
    source: "corp_leak_07",
    preview: "NDA между Звезда Холдинг АД и Медиа Груп ЕООД, срок 3 г. Стандартни клаузи за поверителност. Не са включени имена или теми с отношение към случая.",
    tags: ["NDA", "договор", "фирма"],
  },
  {
    id: "D-010",
    name: "partnership_greentech_bulgaroil_2025.pdf",
    category: CAT_CORP,
    ext: "PDF",
    date: "2025-08-01",
    size: "204 KB",
    source: "corp_leak_07",
    preview: "Партньорски договор: GreenTech Ltd. & Булгароил АД. Съвместен проект за соларна централа, бюджет EUR 2.1 млн. Без отношение към разследването.",
    tags: ["партньорство", "договор", "фирма"],
  },
  {
    id: "D-011",
    name: "q3_strategy_2025_zvezda_internal.pptx",
    category: CAT_PPT,
    ext: "PPTX",
    date: "2025-09-05",
    size: "3.2 MB",
    source: "gdrive_mirror_anon",
    preview: "Вътрешна презентация Звезда Холдинг Q3 2025: пазарен удял, прогнози, KPI-та. 34 слайда. Стандартно бизнес съдържание, без чувствителни данни за случая.",
    tags: ["презентация", "бизнес стратегия", "вътрешен"],
  },
  {
    id: "D-012",
    name: "annual_report_draft_2024_zvezda.pdf",
    category: CAT_PPT,
    ext: "PDF",
    date: "2025-09-20",
    size: "1.8 MB",
    source: "gdrive_mirror_anon",
    preview: "Проект на годишен отчет 2024 -- Звезда Холдинг. Приходи 4.7 млн лв, EBITDA 18%. Маркиран DRAFT CONFIDENTIAL. Финансово незначителен за случая.",
    tags: ["отчет", "бизнес", "вътрешен"],
  },
  {
    id: "D-013",
    name: "icloud_photos_dump_342files.zip",
    category: CAT_IMG,
    ext: "ZIP",
    date: "2025-10-17",
    size: "412 MB",
    source: "cloud_breach_mirror",
    preview: "342 лични снимки от iCloud акаунт: ваканции, семейни събирания, селфита. Без локационни метаданни. Лицата не са разпознати в разследването.",
    tags: ["снимки", "iCloud", "лични данни"],
  },
  {
    id: "D-014",
    name: "gdrive_video_family_gathering_2025.mp4",
    category: CAT_IMG,
    ext: "MP4",
    date: "2025-06-20",
    size: "87 MB",
    source: "cloud_breach_mirror",
    preview: "Видео 3:42 мин от Google Drive: семейно събиране на открито, летен ден. Гласовете са неразпознаваеми. Без релевантно съдържание.",
    tags: ["видео", "Google Drive", "лични данни"],
  },
  {
    id: "D-015",
    name: "police_report_pta_12092025.pdf",
    category: CAT_LAW,
    ext: "PDF",
    date: "2025-09-12",
    size: "62 KB",
    source: "anon_gov_leak",
    preview: "Полицейски протокол за ПТП от 12.09.2025, бул. Витоша, без пострадали лица. Виновен: неустановен водач. Превозното средство не съвпада с нито едно в случая.",
    tags: ["полиция", "ПТП", "протокол"],
  },
  {
    id: "D-016",
    name: "court_decision_property_dispute_sofia.pdf",
    category: CAT_LAW,
    ext: "PDF",
    date: "2025-08-28",
    size: "110 KB",
    source: "anon_gov_leak",
    preview: "Решение на СРС по гражданско дело за имуществен спор -- приключено в полза на ищеца. Страните по делото нямат отношение към случая.",
    tags: ["съд", "решение", "имущество"],
  },
  {
    id: "D-017",
    name: "notary_deed_lozentez_apt_2024.pdf",
    category: CAT_PROP,
    ext: "PDF",
    date: "2024-11-10",
    size: "156 KB",
    source: "registry_leak_bg",
    preview: "Нотариален акт № 114/2024: апартамент 78 кв.m, кв. Лозенец, продавач Стамо Николов, купувач Красимира Петрова, цена EUR 142 000. Стандартна сделка.",
    tags: ["нотариален акт", "апартамент", "имот"],
  },
  {
    id: "D-018",
    name: "property_docs_villa_varna_2023.pdf",
    category: CAT_PROP,
    ext: "PDF",
    date: "2023-07-22",
    size: "198 KB",
    source: "registry_leak_bg",
    preview: "Документи за вила, м-ст Траката, Варна, 2023. Собственик: Людмила Тодорова-Манева. Ипотека към ЮниКредит Булбанк. Без отношение към случая.",
    tags: ["вила", "имот", "Варна"],
  },
]

const CATEGORY_ICONS: Record<DocCategory, string> = {
  [CAT_ID]:   "ID",
  [CAT_DL]:   "DL",
  [CAT_TAX]:  "TX",
  [CAT_HR]:   "HR",
  [CAT_CORP]: "NDA",
  [CAT_PPT]:  "PPT",
  [CAT_IMG]:  "IMG",
  [CAT_LAW]:  "LAW",
  [CAT_PROP]: "REG",
}

const EXT_COLOR: Record<string, string> = {
  JPG:  "#FFB000",
  PDF:  "#FF0033",
  XLSX: "#00FF41",
  PPTX: "#FFB000",
  ZIP:  "#9a9a9a",
  MP4:  "#9a9a9a",
}

const CATEGORIES = Array.from(new Set(BASE_DOCS.map((d) => d.category))) as DocCategory[]

const EXTRA_DOC_NAMES = [
  "sofia_redacted",
  "plovdiv_mirror",
  "varna_node",
  "burgas_cache",
  "ruse_packet",
  "stara_zagora_drop",
  "pleven_bundle",
  "sliven_extract",
  "dobrich_backup",
  "shumen_copy",
  "pernik_scan",
  "haskovo_record",
  "yambol_archive",
  "blagoevgrad_dump",
  "veliko_tarnovo_set",
]

const EXTRA_DOC_CONFIG: Record<DocCategory, { prefix: string; ext: string; source: string; baseSize: number; sizeStep: number; preview: string; tags: string[] }> = {
  [CAT_ID]: {
    prefix: "id_packet",
    ext: "JPG",
    source: "anon_dump_@leakbot",
    baseSize: 132,
    sizeStep: 7,
    preview: "Additional identity scan from a mirrored personal-data dump. Partial fields are masked; relevance is unverified.",
    tags: ["id", "scan", "personal"],
  },
  [CAT_DL]: {
    prefix: "driver_license",
    ext: "PDF",
    source: "paste_mirror_09",
    baseSize: 64,
    sizeStep: 5,
    preview: "Additional driver-license record from the transport mirror. Category and issue data are visible; case relevance is low.",
    tags: ["driver", "license", "registry"],
  },
  [CAT_TAX]: {
    prefix: "tax_record",
    ext: "XLSX",
    source: "nap_leak_mirror",
    baseSize: 48,
    sizeStep: 6,
    preview: "Additional tax export from the mirrored accounting batch. Amounts are present but no direct case link is confirmed.",
    tags: ["tax", "nap", "finance"],
  },
  [CAT_HR]: {
    prefix: "hr_contract",
    ext: "PDF",
    source: "hr_dump_v2",
    baseSize: 72,
    sizeStep: 8,
    preview: "Additional HR document from an employee-data dump. Employment details are visible; status remains unverified.",
    tags: ["hr", "contract", "employee"],
  },
  [CAT_CORP]: {
    prefix: "corp_agreement",
    ext: "PDF",
    source: "corp_leak_07",
    baseSize: 96,
    sizeStep: 11,
    preview: "Additional corporate agreement from the leaked company archive. Parties and clauses are visible in summary form.",
    tags: ["corp", "agreement", "nda"],
  },
  [CAT_PPT]: {
    prefix: "internal_deck",
    ext: "PPTX",
    source: "gdrive_mirror_anon",
    baseSize: 840,
    sizeStep: 95,
    preview: "Additional internal presentation from the drive mirror. Slides appear operational but have no confirmed lead value.",
    tags: ["slides", "internal", "strategy"],
  },
  [CAT_IMG]: {
    prefix: "media_dump",
    ext: "ZIP",
    source: "cloud_breach_mirror",
    baseSize: 120,
    sizeStep: 18,
    preview: "Additional media archive from a cloud breach mirror. Files contain personal images or video thumbnails only.",
    tags: ["media", "cloud", "personal"],
  },
  [CAT_LAW]: {
    prefix: "legal_file",
    ext: "PDF",
    source: "anon_gov_leak",
    baseSize: 58,
    sizeStep: 9,
    preview: "Additional police or court document from the government leak mirror. Names are partial; relevance is unconfirmed.",
    tags: ["law", "court", "police"],
  },
  [CAT_PROP]: {
    prefix: "property_record",
    ext: "PDF",
    source: "registry_leak_bg",
    baseSize: 102,
    sizeStep: 10,
    preview: "Additional property registry document from the leaked archive. Ownership and address fields are partially masked.",
    tags: ["property", "registry", "real-estate"],
  },
}

const EXTRA_DOCS: Doc[] = CATEGORIES.flatMap((category, categoryIndex) => {
  const config = EXTRA_DOC_CONFIG[category]
  const startId = 19 + categoryIndex * EXTRA_DOC_NAMES.length

  return EXTRA_DOC_NAMES.map((name, index) => {
    const idNumber = startId + index
    const month = String(1 + ((categoryIndex + index) % 10)).padStart(2, "0")
    const day = String(1 + ((index * 3 + categoryIndex) % 28)).padStart(2, "0")

    return {
      id: `D-${String(idNumber).padStart(3, "0")}`,
      name: `${config.prefix}_${name}_${String(index + 1).padStart(2, "0")}.${config.ext.toLowerCase()}`,
      category,
      ext: config.ext,
      date: `2025-${month}-${day}`,
      size: `${config.baseSize + index * config.sizeStep} KB`,
      source: config.source,
      preview: `${config.preview} Batch ref ${CATEGORY_ICONS[category]}-${String(index + 1).padStart(2, "0")}.`,
      tags: config.tags,
    }
  })
})

const DOCS: Doc[] = [...BASE_DOCS, ...EXTRA_DOCS]

const DOC_FOLDERS: DocFolder[] = CATEGORIES.map((category) => ({
  id: CATEGORY_ICONS[category].toLowerCase(),
  category,
  docs: DOCS.filter((doc) => doc.category === category),
}))

function FolderCard({ folder, onOpen }: { folder: DocFolder; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false)
  const Icon = hovered ? FolderOpen : Folder

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.015 }}
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        minHeight: 160,
        background: hovered ? `${ACCENT}0a` : "#0a0a0a",
        border: `1px solid ${hovered ? ACCENT + "55" : "#202020"}`,
        color: "inherit",
        cursor: "pointer",
        padding: "18px 16px",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "background 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
        boxShadow: hovered ? `0 0 18px ${ACCENT}18` : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: `${ACCENT}12`,
            border: `1px solid ${ACCENT}40`,
          }}
        >
          <Icon size={20} strokeWidth={1.5} color={hovered ? ACCENT : "#cfcfcf"} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.12em", marginBottom: 6, fontWeight: 700 }}>
            [{CATEGORY_ICONS[folder.category]}] · {folder.docs.length} ФАЙЛА
          </div>
          <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: hovered ? "#ffffff" : "#e2e2e2", letterSpacing: "0.04em", lineHeight: 1.45, overflowWrap: "anywhere", fontWeight: 600 }}>
            {folder.category}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: "auto", borderTop: "1px solid #181818", paddingTop: 10 }}>
        {folder.docs.slice(0, 3).map((doc) => {
          const extColor = EXT_COLOR[doc.ext] ?? "#9a9a9a"

          return (
            <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span style={{ width: 32, flexShrink: 0, fontSize: 10, fontFamily: "var(--font-mono)", color: extColor, letterSpacing: "0.06em", fontWeight: 700 }}>
                {doc.ext}
              </span>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#9a9a9a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {doc.name}
              </span>
            </div>
          )
        })}
      </div>
    </motion.button>
  )
}

const DOCS_PATH = "/hidden-wiki-2/leaks/docs"
const CAT_BY_SLUG = new Map(DOC_FOLDERS.map((f) => [f.id, f.category]))

function LeaksDocsInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  const catSlug = searchParams.get("cat")
  const openFolder = catSlug ? CAT_BY_SLUG.get(catSlug) ?? null : null

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  // reset expanded doc whenever the category changes
  useEffect(() => { setExpanded(null) }, [catSlug])

  const handleSave = (doc: Doc) => {
    const id = `leaks-docs-noise-${doc.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id,
      title: `[DOCS] ${doc.name}`,
      text: doc.preview,
      sourceRoute: "/leaks/docs",
      confidence: 1,
      status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  const activeFolder = DOC_FOLDERS.find((folder) => folder.category === openFolder) ?? null
  const visibleDocs = activeFolder?.docs ?? []

  const openDocFolder = (folder: DocFolder) => router.push(`${DOCS_PATH}?cat=${folder.id}`)
  const closeDocFolder = () => router.push(DOCS_PATH)

  const crumbStyle = {
    fontSize: 11, fontFamily: "var(--font-mono)", color: "#bdbdbd",
    letterSpacing: "0.1em", textDecoration: "none", background: "none",
    border: "none", cursor: "pointer", padding: 0,
  } as const

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>

      <PageHeader
        title="DOCS"
        accent={ACCENT}
        intro={
          !activeFolder && (
            <>
              {DOC_FOLDERS.length} категории · {DOCS.length} изтекли документа. Избери папка, за да разгледаш файловете.
            </>
          )
        }
        kicker={
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Link href="/hidden-wiki-2/leaks" style={crumbStyle}>← LEAKS</Link>
          <span style={{ fontSize: 11, color: "#7c7c7c", fontFamily: "var(--font-mono)" }}>/</span>
          {activeFolder ? (
            <button type="button" onClick={closeDocFolder} style={crumbStyle}>DOCS</button>
          ) : (
            <span style={{ ...crumbStyle, color: ACCENT, cursor: "default" }}>DOCS</span>
          )}
          {activeFolder && (
            <>
              <span style={{ fontSize: 11, color: "#7c7c7c", fontFamily: "var(--font-mono)" }}>/</span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.1em" }}>
                {activeFolder.category}
              </span>
            </>
          )}
        </div>
        }
      />

      <AnimatePresence mode="wait">
        {!activeFolder ? (
          <motion.div
            key="folders"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}
          >
            {DOC_FOLDERS.map((folder) => (
              <FolderCard key={folder.id} folder={folder} onOpen={() => openDocFolder(folder)} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={activeFolder.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
          >
            <button
              type="button"
              onClick={closeDocFolder}
              style={{
                display: "flex", alignItems: "center", gap: 7, marginBottom: 14,
                background: "none", border: "none", cursor: "pointer", padding: 0,
                fontSize: 11, fontFamily: "var(--font-mono)", color: "#bdbdbd", letterSpacing: "0.1em",
              }}
            >
              <ArrowLeft size={13} strokeWidth={1.5} />
              НАЗАД КЪМ ПАПКИТЕ
            </button>

            <div style={{ marginBottom: 12, padding: "12px 16px", background: `${ACCENT}0a`, border: `1px solid ${ACCENT}40`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.06em", lineHeight: 1.5, fontWeight: 700 }}>
                [{CATEGORY_ICONS[activeFolder.category]}] {activeFolder.category}
              </div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#b0b0b0", letterSpacing: "0.1em", flexShrink: 0 }}>
                {visibleDocs.length} ФАЙЛА
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {visibleDocs.map((doc) => {
                const isExpanded = expanded === doc.id
                const isSaved = savedClues.includes(`leaks-docs-noise-${doc.id}`)
                const extColor = EXT_COLOR[doc.ext] ?? "#9a9a9a"

                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ background: "#0a0a0a", border: `1px solid ${isExpanded ? ACCENT + "44" : "#1a1a1a"}` }}
                  >
                    <div
                      onClick={() => setExpanded(isExpanded ? null : doc.id)}
                      style={{ padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer" }}
                    >
                      <div style={{
                        flexShrink: 0, width: 42, height: 42,
                        background: `${extColor}14`, border: `1px solid ${extColor}44`,
                        display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
                      }}>
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: extColor, letterSpacing: "0.04em", fontWeight: 700 }}>{doc.ext}</span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#9a9a9a", letterSpacing: "0.1em" }}>{doc.id}</span>
                          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#c0c0c0", background: "#161616", padding: "2px 7px", border: "1px solid #2a2a2a", letterSpacing: "0.04em" }}>
                            {doc.date} · {doc.size}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#ececec", letterSpacing: "0.02em", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
                          {doc.name}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
                          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#8a8a8a" }}>
                            src: <span style={{ color: "#b0b0b0" }}>{doc.source}</span>
                          </span>
                          {doc.tags.map((t) => (
                            <span key={t} style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#9a9a9a", padding: "1px 6px", border: "1px solid #2a2a2a" }}>#{t}</span>
                          ))}
                        </div>
                      </div>

                      <span style={{ fontSize: 12, color: isExpanded ? ACCENT : "#8a8a8a", fontFamily: "var(--font-mono)", flexShrink: 0, marginTop: 2 }}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        style={{ borderTop: `1px solid ${ACCENT}22`, padding: "14px 16px", background: "#060606" }}
                      >
                        <p style={{ fontSize: 13, color: "#d4d4d4", margin: "0 0 14px", fontFamily: "var(--font-mono)", lineHeight: 1.8 }}>
                          {doc.preview}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSave(doc) }}
                            style={{
                              padding: "7px 16px", fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", fontWeight: 700,
                              background: isSaved ? `${ACCENT}1a` : "#141414",
                              color: isSaved ? ACCENT : "#dcdcdc",
                              border: `1px solid ${isSaved ? ACCENT + "60" : "#3a3a3a"}`,
                              cursor: isSaved ? "default" : "pointer", transition: "all 0.2s",
                            }}>
                            {isSaved ? "✓ ЗАПАЗЕНО" : "ЗАПАЗИ СЛЕДА"}
                          </button>
                          {isSaved && (
                            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#9a9a9a", letterSpacing: "0.06em" }}>
                              достоверност: ниска · статус: непотвърдено
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 20, paddingTop: 10, borderTop: "1px solid #1a1a1a", fontSize: 10, fontFamily: "var(--font-mono)", color: "#8a8a8a", letterSpacing: "0.08em" }}>
        {activeFolder ? (
          <>ПОКАЗАНИ {visibleDocs.length} / {DOCS.length} ДОКУМЕНТА</>
        ) : (
          <>{DOC_FOLDERS.length} ПАПКИ / {DOCS.length} ДОКУМЕНТА</>
        )}
      </div>
    </div>
  )
}

export default function LeaksDocsPage() {
  return (
    <Suspense fallback={null}>
      <LeaksDocsInner />
    </Suspense>
  )
}
