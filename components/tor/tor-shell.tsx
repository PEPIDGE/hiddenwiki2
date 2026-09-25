"use client"

import { type CSSProperties, type ReactNode, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { TorNav } from "@/components/tor/tor-nav"
import { TorTopBar } from "@/components/tor/tor-top-bar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ROUTES_CONFIG, addVisitedRoute } from "@/lib/game-state"
import s from "./shell.module.css"

interface TorShellProps {
  children: ReactNode
  currentSite?: string
  siteColor?: string
}

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 12, filter: "blur(2px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(1px)" },
}

const CursorTrail = dynamic(
  () => import("@/components/tor/cursor-trail").then((mod) => mod.CursorTrail),
  { ssr: false }
)

const EvidenceBoard = dynamic(
  () => import("@/components/tor/evidence-board").then((mod) => mod.EvidenceBoard),
  {
    ssr: false,
    loading: () => (
      <aside
        style={{
          width: 244,
          background: "var(--panel-bg)",
          borderLeft: "1px solid var(--panel-border)",
          height: "100%",
        }}
      />
    ),
  }
)

export function TorShell({ children, currentSite, siteColor = "#00FF41" }: TorShellProps) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const section = ROUTES_CONFIG.find((r) => pathname?.startsWith(r.path))

  // Register each visited route so nav can reveal sublinks
  useEffect(() => {
    if (pathname) addVisitedRoute(pathname)
    setNavOpen(false)
    setEvidenceOpen(false)
  }, [pathname])

  return (
    <>
      <CursorTrail />

      {/* Scanlines overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.09) 2px, rgba(0,0,0,0.09) 4px)",
          pointerEvents: "none",
          zIndex: 9997,
          animation: "flicker 10s infinite",
        }}
      />

      {/* Noise grain */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          pointerEvents: "none",
          zIndex: 9996,
        }}
      />

      {/* Slow scan line */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${siteColor}18, transparent)`,
          pointerEvents: "none",
          zIndex: 9995,
          animation: "scan-down 14s linear infinite",
        }}
      />

      <div className={s.shell} style={{ "--site": siteColor } as CSSProperties}>
        <TorTopBar
          currentSite={currentSite}
          siteColor={siteColor}
          navOpen={navOpen}
          evidenceOpen={evidenceOpen}
          onToggleNav={() => {
            setEvidenceOpen(false)
            setNavOpen((o) => !o)
          }}
          onToggleEvidence={() => {
            setNavOpen(false)
            setEvidenceOpen((o) => !o)
          }}
        />

        <div className={s.body}>
          <div className={s.navSlot} data-open={navOpen ? "" : undefined}>
            <TorNav />
          </div>

          <button
            type="button"
            aria-label="Затвори менюто"
            className={s.scrim}
            data-show={navOpen || evidenceOpen ? "" : undefined}
            onClick={() => {
              setNavOpen(false)
              setEvidenceOpen(false)
            }}
          />

          <main className={s.main}>
            <div className={s.siteLine} />
            {section && section.sublinks.length > 0 && (
              <nav className={s.tabs} aria-label={section.label}>
                <span className={s.tabsLabel}>{section.label}</span>
                {["", ...section.sublinks].map((sub) => {
                  const href = section.path + sub
                  return (
                    <Link key={href} href={href} className={s.tab} data-active={pathname === href ? "" : undefined}>
                      {sub || "/index"}
                    </Link>
                  )
                })}
              </nav>
            )}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                variants={PAGE_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={s.page}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          <div className={s.evidenceSlot} data-open={evidenceOpen ? "" : undefined}>
            <EvidenceBoard />
          </div>
        </div>
      </div>
    </>
  )
}
