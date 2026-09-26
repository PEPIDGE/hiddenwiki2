"use client"

import HiddenWiki2Page from "@/app/hidden-wiki-2/page"
import { TorShell } from "@/components/tor/tor-shell"
import { SessionReady } from "@/components/hc/session-ready"

export default function RootPage() {
  return (
    <TorShell siteColor="#00FF41">
      <SessionReady>
        <HiddenWiki2Page />
      </SessionReady>
    </TorShell>
  )
}
