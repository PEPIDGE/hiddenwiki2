"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"

const ACCENT = "#FFB000"

const PAGES = [
  { label: "DOCS",      href: "/hidden-wiki-2/leaks/docs",      desc: "Изтекли документи, организационни файлове" },
  { label: "ARCHIVE",   href: "/hidden-wiki-2/leaks/archive",   desc: "Снимки, кадри, Захарна фабрика" },
  { label: "VEHICLES",  href: "/hidden-wiki-2/leaks/vehicles",  desc: "Регистрирани превозни средства" },
  { label: "CARDS",     href: "/hidden-wiki-2/leaks/cards",     desc: "Изтекли дебитни карти и транзакции" },
  { label: "PASSWORDS", href: "/hidden-wiki-2/leaks/passwords", desc: "Хеширани и обикновени пароли" },
]

export default function LeaksPage() {
  const pathname = usePathname()

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <GlitchText text="LEAKS" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8, opacity: 0.5 }} />
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#909090", marginTop: 10, letterSpacing: "0.08em" }}>
          Избери категория изтекли данни.
        </div>
      </div>

      {/* Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {PAGES.map((page, i) => (
          <motion.div
            key={page.href}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              href={page.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                background: "#080800",
                border: `1px solid ${ACCENT}20`,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.background = `${ACCENT}08`
                el.style.borderColor = `${ACCENT}60`
                el.style.boxShadow = `0 0 18px ${ACCENT}18`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.background = "#080800"
                el.style.borderColor = `${ACCENT}20`
                el.style.boxShadow = "none"
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 700, color: ACCENT, letterSpacing: "0.12em" }}>
                  {page.label}
                </div>
              </div>
              <span style={{ fontSize: 16, color: `${ACCENT}60`, fontFamily: "var(--font-mono)" }}>→</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
