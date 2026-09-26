"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"
import { clearGameState, flushGameState, hydrateGameState } from "@/lib/game-state"
import type { PublicPlayerState, PublicTask } from "./types"

interface ClaimResult {
  ok: boolean
  outcome?: "correct" | "wrong" | "already"
  reward?: number
  error?: string
}

interface HcContextValue {
  ready: boolean // player + progress loaded from the database
  authenticated: boolean
  player: PublicPlayerState | null
  tasks: PublicTask[]
  coins: number
  refresh: () => Promise<void>
  logout: () => Promise<void>
  claim: (taskId: string, answer: string) => Promise<ClaimResult>
}

const HcContext = createContext<HcContextValue | null>(null)

function goToLogin() {
  const here = window.location.pathname + window.location.search
  const query = here.startsWith("/login") ? "" : "?next=" + encodeURIComponent(here)
  window.location.replace("/login" + query)
}

async function postJson(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  return { res, data }
}

export function HcProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ""
  const onLoginPage = pathname.startsWith("/login")

  const [ready, setReady] = useState(false)
  const [player, setPlayer] = useState<PublicPlayerState | null>(null)
  const [tasks, setTasks] = useState<PublicTask[]>([])

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/hc/state", { cache: "no-store" })
      if (res.status === 401) {
        clearGameState()
        goToLogin()
        return
      }
      const data = await res.json()
      if (data?.authenticated && data.player) {
        hydrateGameState(data.player.progress)
        setPlayer(data.player)
        if (Array.isArray(data.tasks)) setTasks(data.tasks)
        setReady(true)
      }
    } catch {
      // Network hiccup — the ready screen stays up until the next try.
    }
  }, [])

  useEffect(() => {
    if (onLoginPage || ready) return
    refresh()
  }, [onLoginPage, ready, refresh])

  const logout = useCallback(async () => {
    flushGameState()
    await postJson("/api/hc/logout", {}).catch(() => null)
    clearGameState()
    setPlayer(null)
    setReady(false)
    window.location.replace("/login")
  }, [])

  const claim = useCallback(async (taskId: string, answer: string): Promise<ClaimResult> => {
    const { res, data } = await postJson("/api/hc/claim", { taskId, answer })
    if (res.status === 401) {
      goToLogin()
      return { ok: false, error: "Сесията изтече." }
    }
    if (typeof data?.coins === "number" && Array.isArray(data?.completedTasks)) {
      setPlayer((p) => (p ? { ...p, coins: data.coins, completedTasks: data.completedTasks } : p))
    }
    if (!res.ok) return { ok: false, error: data?.error ?? "Грешка." }
    return { ok: Boolean(data?.ok), outcome: data?.outcome, reward: data?.reward, error: data?.error }
  }, [])

  const value: HcContextValue = {
    ready,
    authenticated: ready && player !== null,
    player,
    tasks,
    coins: player?.coins ?? 0,
    refresh,
    logout,
    claim,
  }

  return <HcContext.Provider value={value}>{children}</HcContext.Provider>
}

export function usePlayer(): HcContextValue {
  const ctx = useContext(HcContext)
  if (!ctx) throw new Error("usePlayer must be used within <HcProvider>")
  return ctx
}
