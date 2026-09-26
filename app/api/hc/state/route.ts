import { NextResponse } from "next/server"
import { getSessionCode } from "@/lib/hc/session"
import { getPlayer } from "@/lib/hc/store"
import { toPublicPlayer } from "@/lib/hc/types"
import { getPublicTasks } from "@/lib/hc/tasks"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Returns the logged-in player's own state + the public task catalog.
export async function GET() {
  const code = await getSessionCode()
  if (!code) {
    return NextResponse.json(
      { authenticated: false, tasks: getPublicTasks() },
      { status: 200 },
    )
  }

  const player = await getPlayer(code)
  if (!player) {
    return NextResponse.json(
      { authenticated: false, tasks: getPublicTasks() },
      { status: 200 },
    )
  }

  return NextResponse.json({
    authenticated: true,
    player: toPublicPlayer(player),
    tasks: getPublicTasks(),
  })
}
