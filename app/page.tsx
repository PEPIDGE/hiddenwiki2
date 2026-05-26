"use client"

import HiddenWiki2Page from "@/app/hidden-wiki-2/page"
import { TorShell } from "@/components/tor/tor-shell"

export default function RootPage() {
  return (
    <TorShell siteColor="#00FF41">
      <HiddenWiki2Page />
    </TorShell>
  )
}
