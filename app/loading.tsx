import { PageLoader } from "@/components/tor/page-loader"

export default function RootLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--background)", padding: 28 }}>
      <PageLoader label="BOOTING SHELL" />
    </div>
  )
}
