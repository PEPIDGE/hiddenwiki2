"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion, AnimatePresence } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FFB000"

const VEHICLES = [
  { id: "V-001", brand: "Audi", model: "A3", year: 2005, color: "Черен", reg: "СА ○○○○ ХВ", phone: "+359 88 *** 1221", note: "Продава се срочно. Кожен салон.", city: "София", status: "AVAILABLE", match: true },
  { id: "V-002", brand: "BMW", model: "5 Series", year: 2008, color: "Тъмносив", reg: "ПВ ○○○○ АЕ", phone: "+359 87 *** 5543", note: "Внос Германия. Пълна история.", city: "Пловдив", status: "AVAILABLE", match: false },
  { id: "V-003", brand: "Audi", model: "A3", year: 2006, color: "Черен", reg: "СА ○○○○ КМ", phone: "+359 88 *** 1221", note: "Еднакъв телефон с V-001. Различна рег.", city: "София", status: "SOLD", match: true },
  { id: "V-004", brand: "VW", model: "Golf", year: 2010, color: "Бял", reg: "ВН ○○○○ ТТ", phone: "+359 86 *** 2200", note: "", city: "Варна", status: "AVAILABLE", match: false },
  { id: "V-005", brand: "Audi", model: "A4", year: 2007, color: "Черен", reg: "СА ○○○○ РХ", phone: "+359 89 *** 7744", note: "Подозрителна цена. Без история.", city: "София", status: "AVAILABLE", match: false },
  { id: "V-006", brand: "Toyota", model: "Corolla", year: 2012, color: "Сребрист", reg: "КН ○○○○ МС", phone: "+359 87 *** 3310", note: "", city: "Казанлък", status: "AVAILABLE", match: false },
  { id: "V-007", brand: "Audi", model: "A3", year: 2004, color: "Тъмночервен", reg: "БТ ○○○○ ЕА", phone: "+359 88 *** 8812", note: "Предна броня повредена.", city: "Бургас", status: "AVAILABLE", match: false },
  { id: "V-008", brand: "Mercedes", model: "C200", year: 2009, color: "Черен", reg: "СА ○○○○ ФВ", phone: "+359 88 *** 0071", note: "Бизнес кола. Заличен VIN.", city: "София", status: "AVAILABLE", match: false },
  { id: "V-009", brand: "Audi", model: "A3", year: 2005, color: "Черен", reg: "СА ○○○○ НМ", phone: "+359 88 *** 1221", note: "⚠ ТРЕТИ запис с еднакъв телефон +359 88 *** 1221. Различна рег.", city: "София", status: "AVAILABLE", match: true },
  { id: "V-010", brand: "Renault", model: "Megane", year: 2011, color: "Зелен", reg: "МН ○○○○ ВД", phone: "+359 86 *** 1190", note: "", city: "Монтана", status: "AVAILABLE", match: false },
  { id: "V-011", brand: "Opel", model: "Astra", year: 2013, color: "Бял", reg: "СА ○○○○ ТМ", phone: "+359 87 *** 4430", note: "", city: "София", status: "AVAILABLE", match: false },
  { id: "V-012", brand: "Skoda", model: "Octavia", year: 2014, color: "Сив", reg: "ПБ ○○○○ КА", phone: "+359 89 *** 6612", note: "", city: "Пазарджик", status: "AVAILABLE", match: false },
]

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "#00FF41",
  SOLD: "#909090",
}

export default function LeaksVehiclesPage() {
  const [captchaPassed, setCaptchaPassed] = useState(false)
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [filterMatch, setFilterMatch] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [puzzleStep, setPuzzleStep] = useState(0)
  const [puzzleError, setPuzzleError] = useState("")
  const [puzzleAttempts, setPuzzleAttempts] = useState(0)
  const [shake, setShake] = useState(false)

  const PUZZLE_QUESTIONS = [
    {
      q: "Продавач ти бута кола със заличен VIN и без документи. Реакцията ти?",
      options: [
        { label: "A", text: "Изисквам талон и пълна история на собственост", cop: true },
        { label: "B", text: "Проверявам в КАТ дали не е крадена", cop: true },
        { label: "C", text: "Колко в брой и кога мога да я взема — без приказки", cop: false },
        { label: "D", text: "Сигнализирам в полицията за откраднат автомобил", cop: true },
      ],
    },
    {
      q: "Телефон те свързва директно със случая. Трябва да изчезне. Ти...",
      options: [
        { label: "A", text: "Предавам го доброволно на разследващите", cop: true },
        { label: "B", text: "Пазя го — може да послужи като доказателство", cop: true },
        { label: "C", text: "Чупя SIM-а, корпусът отива в реката. Нощем.", cop: false },
        { label: "D", text: "Звъня на адвокат преди да направя каквото и да е", cop: true },
      ],
    },
    {
      q: "Питат те кой стои зад поръчката. Отговорът ти?",
      options: [
        { label: "A", text: "Казвам истината — нямам какво да крия", cop: true },
        { label: "B", text: "Насочвам питащия към полицията", cop: true },
        { label: "C", text: "Не знам нищо. Не познавам никого. Никога.", cop: false },
        { label: "D", text: "Записвам разговора, за всеки случай", cop: true },
      ],
    },
    {
      q: "Свидетел те е видял на грешното място в грешния час. Какво следва?",
      options: [
        { label: "A", text: "Сам отивам и давам показания", cop: true },
        { label: "B", text: "Уведомявам органите за свидетеля", cop: true },
        { label: "C", text: "Свидетели се убеждават да забравят какво са видели", cop: false },
        { label: "D", text: "Изчаквам спокойно да ме призоват официално", cop: true },
      ],
    },
  ]

  const handlePuzzleChoice = (isCop: boolean) => {
    if (isCop) {
      const newAttempts = puzzleAttempts + 1
      setPuzzleAttempts(newAttempts)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      const msgs = [
        "ГРЕШЕН ОТГОВОР. Засечен е cop pattern.",
        "ВНИМАНИЕ: поведението ти прилича на ченге.",
        "ПОДОЗРИТЕЛНО. Опитай пак.",
        "СИСТЕМАТА НЕ ВИ ВЯРВА. Продължи...",
      ]
      setPuzzleError(msgs[Math.min(newAttempts - 1, msgs.length - 1)])
      setTimeout(() => setPuzzleError(""), 2200)
    } else {
      setPuzzleError("")
      if (puzzleStep + 1 >= PUZZLE_QUESTIONS.length) {
        setCaptchaPassed(true)
      } else {
        setPuzzleStep((s) => s + 1)
      }
    }
  }

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])



  const handleSave = (v: typeof VEHICLES[number], field: string, text: string) => {
    const id = `vehicles-${v.id}-${field}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id, title: `[VEHICLES] ${v.brand} ${v.model} — ${field}`,
      text, sourceRoute: "/leaks/vehicles",
      confidence: v.match ? 4 : 2, status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  const displayed = filterMatch ? VEHICLES.filter((v) => v.match) : VEHICLES
  const selectedV = selected ? VEHICLES.find((v) => v.id === selected) : null

  if (!captchaPassed) {
    const q = PUZZLE_QUESTIONS[puzzleStep]

    return (
      <div style={{ maxWidth: 560, margin: "48px auto" }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#bdbdbd", letterSpacing: "0.12em", textDecoration: "none" }}>← LEAKS</Link>
          <div style={{ marginTop: 12 }}>
            <GlitchText text="VEHICLES" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
          </div>
          <div style={{ height: 2, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 10 }} />
        </div>

        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ background: "#0a0a0a", border: `1px solid ${ACCENT}44`, boxShadow: `0 0 24px ${ACCENT}12` }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", borderBottom: `1px solid ${ACCENT}33`, background: `${ACCENT}0a` }}>
            <span style={{ width: 7, height: 7, background: ACCENT, boxShadow: `0 0 8px ${ACCENT}`, animation: "pulse-glow 2s infinite" }} />
            <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: ACCENT, letterSpacing: "0.16em", fontWeight: 700 }}>
              ДОКАЖИ, ЧЕ НЕ СИ ЧЕНГЕ
            </span>
          </div>

          <div style={{ padding: "22px 22px 24px" }}>
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#c4c4c4", letterSpacing: "0.04em", marginBottom: 20, lineHeight: 1.6 }}>
              Това е черен пазар. Един грешен отговор и вратата се затваря. Отговори „правилно" на всичко.
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#a8a8a8", letterSpacing: "0.08em" }}>ВЪПРОС {puzzleStep + 1} / {PUZZLE_QUESTIONS.length}</span>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: puzzleAttempts > 0 ? "#FF0033" : "#00FF41", letterSpacing: "0.08em", fontWeight: 700 }}>
                  {puzzleAttempts > 0 ? `COP PATTERN: ${puzzleAttempts}×` : "CLEAN"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {PUZZLE_QUESTIONS.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 4, background: i < puzzleStep ? ACCENT : i === puzzleStep ? `${ACCENT}66` : "#1c1c1c" }} />
                ))}
              </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={puzzleStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ padding: "16px 18px", background: `${ACCENT}0a`, borderLeft: `3px solid ${ACCENT}`, marginBottom: 16 }}>
                  <p style={{ fontSize: 14, color: "#f0f0f0", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.65, fontWeight: 600 }}>
                    {q.q}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {q.options.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handlePuzzleChoice(opt.cop)}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "13px 16px", background: "#0d0d0d",
                        border: "1px solid #2a2a2a", cursor: "pointer",
                        textAlign: "left", transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = `${ACCENT}66`; (e.currentTarget as HTMLButtonElement).style.background = `${ACCENT}0d` }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2a"; (e.currentTarget as HTMLButtonElement).style.background = "#0d0d0d" }}
                    >
                      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: ACCENT, flexShrink: 0, minWidth: 22, letterSpacing: "0.06em", fontWeight: 700 }}>
                        {opt.label}
                      </span>
                      <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#dcdcdc", lineHeight: 1.55 }}>
                        {opt.text}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {puzzleError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ marginTop: 14, padding: "10px 14px", background: "#FF00331a", border: "1px solid #FF003355", fontSize: 12, fontFamily: "var(--font-mono)", color: "#FF0033", letterSpacing: "0.04em", fontWeight: 700 }}
                >
                  ⚠ {puzzleError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/hidden-wiki-2/leaks" style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#bdbdbd", letterSpacing: "0.12em", textDecoration: "none" }}>← LEAKS</Link>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <GlitchText text="VEHICLES" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#9a9a9a", marginLeft: "auto", letterSpacing: "0.1em" }}>{VEHICLES.length} ЗАПИСА</span>
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 10 }} />
      </div>

      <div style={{ padding: "12px 16px", background: "#0a0a06", border: `1px solid ${ACCENT}33`, marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: "#d6d6d6", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          Черен пазар за коли. Сравни модел, цвят и година с <span style={{ color: ACCENT, fontWeight: 700 }}>черния Audi A3 (2005)</span> от случая. Един и същ телефон на три обяви не е съвпадение.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setFilterMatch(!filterMatch)}
          style={{ padding: "7px 16px", fontSize: 11, fontFamily: "var(--font-mono)", background: filterMatch ? `${ACCENT}22` : "#111", color: filterMatch ? ACCENT : "#cccccc", border: `1px solid ${filterMatch ? ACCENT + "55" : "#333"}`, cursor: "pointer", letterSpacing: "0.08em", fontWeight: 700 }}>
          {filterMatch ? "★ САМО СЪВПАДЕНИЯ" : "САМО СЪВПАДЕНИЯ"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedV ? "1fr 320px" : "1fr", gap: 16, transition: "grid-template-columns 0.2s" }}>
        <div style={{ overflow: "auto", border: "1px solid #161616" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${ACCENT}33`, background: "#0a0a06" }}>
                {["МАРКА/МОДЕЛ", "ГОДИНА", "ЦВЯТ", "РЕГ. №", "ТЕЛЕФОН", "СТАТУС", ""].map((h) => (
                  <th key={h} style={{ padding: "11px 12px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#b0b0b0", letterSpacing: "0.1em", textAlign: "left", whiteSpace: "nowrap", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((v) => {
                const isSelected = selected === v.id
                const isRepeatPhone = VEHICLES.filter((x) => x.phone === v.phone).length > 1
                return (
                  <tr key={v.id} onClick={() => setSelected(isSelected ? null : v.id)}
                    style={{ borderBottom: "1px solid #161616", cursor: "pointer", background: isSelected ? `${ACCENT}12` : v.match ? `${ACCENT}0a` : "transparent", transition: "background 0.1s" }}>
                    <td style={{ padding: "11px 12px" }}>
                      <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: v.match ? ACCENT : "#e0e0e0", fontWeight: v.match ? 700 : 400 }}>
                        {v.brand} {v.model}
                      </span>
                      {v.match && <span style={{ marginLeft: 7, fontSize: 9, color: ACCENT, border: `1px solid ${ACCENT}55`, padding: "1px 6px", letterSpacing: "0.06em" }}>MATCH</span>}
                    </td>
                    <td style={{ padding: "11px 12px", fontSize: 12, color: "#d0d0d0", fontFamily: "var(--font-mono)" }}>{v.year}</td>
                    <td style={{ padding: "11px 12px", fontSize: 12, color: "#d0d0d0", fontFamily: "var(--font-mono)" }}>{v.color}</td>
                    <td style={{ padding: "11px 12px", fontSize: 12, color: "#c0c0c0", fontFamily: "var(--font-mono)" }}>{v.reg}</td>
                    <td style={{ padding: "11px 12px", fontSize: 12, color: isRepeatPhone ? ACCENT : "#c0c0c0", fontFamily: "var(--font-mono)", fontWeight: isRepeatPhone ? 700 : 400 }}>
                      {v.phone}{isRepeatPhone && <span style={{ marginLeft: 5, fontSize: 10, color: ACCENT }}>×REP</span>}
                    </td>
                    <td style={{ padding: "11px 12px" }}>
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: STATUS_COLORS[v.status], fontWeight: 700 }}>{v.status}</span>
                    </td>
                    <td style={{ padding: "11px 12px" }}>
                      <button onClick={(e) => { e.stopPropagation(); handleSave(v, "row", `${v.brand} ${v.model} ${v.year} ${v.color} — ${v.reg} — ${v.phone}`) }}
                        style={{ padding: "5px 12px", fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", background: savedClues.includes(`vehicles-${v.id}-row`) ? `${ACCENT}18` : "#111", color: savedClues.includes(`vehicles-${v.id}-row`) ? ACCENT : "#cccccc", border: `1px solid ${savedClues.includes(`vehicles-${v.id}-row`) ? ACCENT + "55" : "#333"}`, cursor: "pointer" }}>
                        {savedClues.includes(`vehicles-${v.id}-row`) ? "✓" : "SAVE"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Detail panel — only when a row is selected */}
        {selectedV && (
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} key={selectedV.id}
            style={{ background: "#0a0a0a", border: `1px solid ${ACCENT}33`, padding: 16, height: "fit-content", position: "sticky", top: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#9a9a9a", letterSpacing: "0.18em" }}>VEHICLE DETAIL</span>
              <button onClick={() => setSelected(null)} aria-label="Затвори"
                style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
            </div>
            <div style={{ fontSize: 18, fontFamily: "var(--font-mono)", color: selectedV.match ? ACCENT : "#f0f0f0", fontWeight: 700, marginBottom: 16 }}>
              {selectedV.brand} {selectedV.model} {selectedV.year}
            </div>
            {[
              { label: "ID", value: selectedV.id },
              { label: "ЦВЯТ", value: selectedV.color },
              { label: "РЕГ. №", value: selectedV.reg },
              { label: "ТЕЛЕФОН", value: selectedV.phone },
              { label: "ГРАД", value: selectedV.city },
              { label: "СТАТУС", value: selectedV.status, color: STATUS_COLORS[selectedV.status] },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 9, paddingBottom: 9, borderBottom: "1px solid #161616" }}>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#9a9a9a", letterSpacing: "0.1em" }}>{row.label}</span>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: row.color ?? "#dcdcdc", textAlign: "right" }}>{row.value}</span>
              </div>
            ))}
            {selectedV.note && (
              <div style={{ marginBottom: 12, marginTop: 4, padding: "9px 11px", background: `${ACCENT}0d`, border: `1px solid ${ACCENT}44`, fontSize: 11, color: ACCENT, fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>
                {selectedV.note}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { field: "reg", text: `Рег. №: ${selectedV.reg}` },
                { field: "phone", text: `Телефон: ${selectedV.phone}` },
                { field: "note", text: `Бележка: ${selectedV.note || "—"}` },
              ].map((a) => (
                <button key={a.field} onClick={() => handleSave(selectedV, a.field, a.text)}
                  style={{ padding: "7px 11px", fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", background: savedClues.includes(`vehicles-${selectedV.id}-${a.field}`) ? `${ACCENT}18` : "#111", color: savedClues.includes(`vehicles-${selectedV.id}-${a.field}`) ? ACCENT : "#cccccc", border: `1px solid ${savedClues.includes(`vehicles-${selectedV.id}-${a.field}`) ? ACCENT + "55" : "#333"}`, cursor: "pointer", textAlign: "left" }}>
                  {savedClues.includes(`vehicles-${selectedV.id}-${a.field}`) ? "✓ " : ""}{a.text.split(":")[0]} → ЗАПАЗИ
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
