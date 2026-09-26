"use client"

import HiddenWiki2Page from "@/app/hidden-wiki-2/page"
import { TorShell } from "@/components/tor/tor-shell"
import { LoginGate } from "@/components/hc/login-gate"

export default function RootPage() {
  return (
    <TorShell siteColor="#00FF41">
      <LoginGate>
        <HiddenWiki2Page />
      </LoginGate>
    </TorShell>
  )
}
