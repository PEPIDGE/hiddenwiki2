"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { PublicPlayerState, PublicTask, StoredClue } from "./types"

interface ClaimResult {
  ok: boolean
  outcome?: "correct" | "wrong" | "already"
  reward?: number
  error?: string
}

interface HcContextValue {
  loading: boolean
  authenticated: boolean
  player: PublicPlayerState | null
  tasks: PublicTask[]
  coins: number
  refresh: () => Promise<void>
  login: (code: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  claim: (taskId: string, answer: string) => Promise<ClaimResult>
  saveClue: (clue: Omit<StoredClue, "timestamp">) => Promise<void>
  removeClue: (clueId: string) => Promise<void>
  unlockRoute: (route: string) => Promise<void>
}

const HcContext = createContext<HcContextValue | null>(null)

async function api(path: string, body?: unknown) {
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  return { res, data }
}

export function HcProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [player, setPlayer] = useState<PublicPlayerState | null>(null)
  const [tasks, setTasks] = useState<PublicTask[]>([])
  const didInit = useRef(false)

  const refresh = useCallback(async () => {
    try {
      const { data } = await api("/api/hc/state")
      setAuthenticated(Boolean(data?.authenticated))
      setPlayer(data?.player ?? null)
      if (Array.isArray(data?.tasks)) setTasks(data.tasks)
    } catch {
      // Offline / API down — keep whatever we had.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    refresh()
  }, [refresh])

  const login = useCallback(async (code: string) => {
    const { res, data } = await api("/api/hc/login", { code })
    if (res.ok && data?.ok) {
      setAuthenticated(true)
      setPlayer(data.player ?? null)
      return { ok: true }
    }
    return { ok: false, error: data?.error ?? "Неуспешен вход." }
  }, [])

  const logout = useCallback(async () => {
    await api("/api/hc/logout", {})
    setAuthenticated(false)
    setPlayer(null)
  }, [])

  const claim = useCallback(async (taskId: string, answer: string): Promise<ClaimResult> => {
    const { res, data } = await api("/api/hc/claim", { taskId, answer })
    if (data?.player) setPlayer(data.player)
    if (!res.ok) return { ok: false, error: data?.error ?? "Грешка." }
    return {
      ok: Boolean(data?.ok),
      outcome: data?.outcome,
      reward: data?.reward,
      error: data?.error,
    }
  }, [])

  const saveClue = useCallback(async (clue: Omit<StoredClue, "timestamp">) => {
    const { data } = await api("/api/hc/clue", { action: "save", clue })
    if (data?.player) setPlayer(data.player)
  }, [])

  const removeClue = useCallback(async (clueId: string) => {
    const { data } = await api("/api/hc/clue", { action: "remove", clueId })
    if (data?.player) setPlayer(data.player)
  }, [])

  const unlockRoute = useCallback(async (route: string) => {
    const { data } = await api("/api/hc/unlock", { route })
    if (data?.player) setPlayer(data.player)
  }, [])

  const value: HcContextValue = {
    loading,
    authenticated,
    player,
    tasks,
    coins: player?.coins ?? 0,
    refresh,
    login,
    logout,
    claim,
    saveClue,
    removeClue,
    unlockRoute,
  }

  return <HcContext.Provider value={value}>{children}</HcContext.Provider>
}

export function usePlayer(): HcContextValue {
  const ctx = useContext(HcContext)
  if (!ctx) {
    throw new Error("usePlayer must be used within <HcProvider>")
  }
  return ctx
}
