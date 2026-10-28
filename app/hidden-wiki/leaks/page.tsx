import { PageHeader, PortalGrid } from "@/components/tor/ui"

const ACCENT = "#FFB000"

const PAGES = [
  { label: "DOCS",      href: "/hidden-wiki/leaks/docs",      desc: "Изтекли документи, организационни файлове" },
  { label: "ARCHIVE",   href: "/hidden-wiki/leaks/archive",   desc: "Снимки, кадри, Захарна фабрика" },
  { label: "VEHICLES",  href: "/hidden-wiki/leaks/vehicles",  desc: "Регистрирани превозни средства" },
  { label: "CARDS",     href: "/hidden-wiki/leaks/cards",     desc: "Изтекли дебитни карти и транзакции" },
  { label: "PASSWORDS", href: "/hidden-wiki/leaks/passwords", desc: "Хеширани и обикновени пароли" },
]

export default function LeaksPage() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader
        title="LEAKS"
        accent={ACCENT}
        kicker={`DATA DUMP // ${PAGES.length} КАТЕГОРИИ`}
        intro="Избери категория изтекли данни."
      />
      <PortalGrid items={PAGES} accent={ACCENT} />
    </div>
  )
}
