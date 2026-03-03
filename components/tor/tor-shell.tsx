"use client"

import { type ReactNode, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TorNav } from "@/components/tor/tor-nav"
import { TorTopBar } from "@/components/tor/tor-top-bar"
import { EvidenceBoard } from "@/components/tor/evidence-board"
import { CursorTrail } from "@/components/tor/cursor-trail"
import { usePathname } from "next/navigation"
import { addVisitedRoute } from "@/lib/game-state"

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

export function TorShell({ children, currentSite, siteColor = "#00FF41" }: TorShellProps) {
  const pathname = usePathname()

  // Register each visited route so nav can reveal sublinks
  useEffect(() => {
    if (pathname) addVisitedRoute(pathname)
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          background: "var(--background)",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <TorTopBar currentSite={currentSite} siteColor={siteColor} />

        {/* Main layout: nav | content | evidence */}
        <div
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <TorNav />

          {/* Main content with Framer Motion transitions */}
          <main
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              position: "relative",
            }}
          >
            {/* Site accent line at top */}
            <div
              style={{
                height: 2,
                background: siteColor,
                boxShadow: `0 0 16px ${siteColor}50`,
                animation: "flicker 6s infinite",
                flexShrink: 0,
              }}
            />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                variants={PAGE_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ padding: "24px 28px", minHeight: "100%" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          <EvidenceBoard />
        </div>
      </div>
    </>
  )
}
