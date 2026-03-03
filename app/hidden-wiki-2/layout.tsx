"use client"

import { type ReactNode } from "react"
import { TorShell } from "@/components/tor/tor-shell"
import { usePathname } from "next/navigation"
import { ROUTES_CONFIG } from "@/lib/game-state"

export default function HiddenWiki2Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ""

  // Detect current site from path
  const currentRoute = ROUTES_CONFIG.find((r) => pathname.startsWith(r.path))
  const currentSite = currentRoute?.label
  const siteColor = currentRoute?.accentColor ?? "#00FF41"

  return (
    <TorShell currentSite={currentSite} siteColor={siteColor}>
      {children}
    </TorShell>
  )
}
