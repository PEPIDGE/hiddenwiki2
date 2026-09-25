"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { FolderSearch, Menu, X } from "lucide-react"
import s from "./shell.module.css"

interface TopBarProps {
  currentSite?: string
  siteColor?: string
  navOpen?: boolean
  evidenceOpen?: boolean
  onToggleNav?: () => void
  onToggleEvidence?: () => void
}

const ROOT = "/hidden-wiki-2"

export function TorTopBar({ currentSite, navOpen, evidenceOpen, onToggleNav, onToggleEvidence }: TopBarProps) {
  const [time, setTime] = useState("")
  const router = useRouter()
  const pathname = usePathname() ?? ""

  useEffect(() => {
    const updateTime = () => setTime(new Date().toTimeString().slice(0, 8))
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Hierarchical "up": first clear any query (e.g. open folder), then climb one
  // path segment at a time, never above the hub root.
  const atRoot = pathname === ROOT || pathname === "/"
  const goUp = () => {
    if (typeof window !== "undefined" && window.location.search) {
      router.push(pathname)
      return
    }
    if (atRoot) {
      router.push(ROOT)
      return
    }
    const segments = pathname.split("/").filter(Boolean)
    segments.pop()
    const parent = "/" + segments.join("/")
    router.push(parent.startsWith(ROOT) ? parent : ROOT)
  }

  const crumbs = pathname.replace(ROOT, "").split("/").filter(Boolean)

  return (
    <header className={s.topbar}>
      <button
        type="button"
        className={`${s.iconBtn} ${s.menuBtn}`}
        onClick={onToggleNav}
        data-active={navOpen ? "" : undefined}
        aria-label="Меню"
      >
        {navOpen ? <X size={15} /> : <Menu size={15} />}
      </button>

      <button type="button" className={s.iconBtn} onClick={goUp} disabled={atRoot} title="Назад">
        ‹ НАЗАД
      </button>

      <Link href={ROOT} className={s.brand}>
        HIDDEN WIKI 2
        {currentSite && (
          <>
            <i>/</i>
            <b>{currentSite.toUpperCase()}</b>
          </>
        )}
      </Link>

      <div className={s.crumb}>
        hw2://
        {crumbs.map((c, i) => (
          <span key={i}>
            {i > 0 && "/"}
            {c}
          </span>
        ))}
      </div>

      <div className={s.spacer} />

      <div className={s.clock} suppressHydrationWarning>
        {time}
      </div>

      <div className={s.online}>ONLINE</div>

      <button
        type="button"
        className={`${s.iconBtn} ${s.evidenceBtn}`}
        onClick={onToggleEvidence}
        data-active={evidenceOpen ? "" : undefined}
        aria-label="Улики"
      >
        <FolderSearch size={14} />
      </button>
    </header>
  )
}
