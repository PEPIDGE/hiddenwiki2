"use client"

import HiddenWikiPage from "@/app/hidden-wiki/page"
import { TorShell } from "@/components/tor/tor-shell"
import { SessionReady } from "@/components/hc/session-ready"

export default function RootPage() {
  return (
    <TorShell siteColor="#00FF41">
      <SessionReady>
        <HiddenWikiPage />
      </SessionReady>
    </TorShell>
  )
}
