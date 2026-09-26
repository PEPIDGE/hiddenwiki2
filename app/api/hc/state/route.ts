import { NextResponse } from "next/server"
import { HC_COOKIE } from "@/lib/hc/config"
import { getSessionCode, SESSION_COOKIE_OPTIONS } from "@/lib/hc/session"
import { getPlayer } from "@/lib/hc/store"
import { getPublicTasks } from "@/lib/hc/tasks"
import { toPublicPlayer } from "@/lib/hc/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// The logged-in player's own state (coins, rewarded tasks, full progress)
// plus the public task catalog. proxy.ts already rejects missing sessions.
export async function GET() {
  const code = await getSessionCode()
  const player = code ? await getPlayer(code) : null

  if (!player) {
    // Signed cookie for a player that no longer exists — end the session.
    const res = NextResponse.json({ authenticated: false }, { status: 401 })
    res.cookies.set(HC_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 })
    return res
  }

  return NextResponse.json(
    { authenticated: true, player: toPublicPlayer(player), tasks: getPublicTasks() },
    { headers: { "Cache-Control": "no-store" } },
  )
}
