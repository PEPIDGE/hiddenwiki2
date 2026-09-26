import { NextRequest, NextResponse } from "next/server"
import { getSessionCode } from "@/lib/hc/session"
import { updatePlayer } from "@/lib/hc/store"
import { toPublicPlayer } from "@/lib/hc/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Record that a player has unlocked a route (individual progress line).
export async function POST(req: NextRequest) {
  const code = await getSessionCode()
  if (!code) {
    return NextResponse.json({ error: "Не си влязъл." }, { status: 401 })
  }

  let route = ""
  try {
    const body = await req.json()
    route = (body?.route ?? "").toString()
  } catch {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 })
  }

  if (!route.startsWith("/hidden-wiki-2") || route.length > 200) {
    return NextResponse.json({ error: "Невалиден маршрут." }, { status: 400 })
  }

  const updated = await updatePlayer(code, (p) => {
    if (!p.unlockedRoutes.includes(route)) p.unlockedRoutes.push(route)
  })

  if (!updated) {
    return NextResponse.json({ error: "Профилът не е намерен." }, { status: 404 })
  }
  return NextResponse.json({ ok: true, player: toPublicPlayer(updated) })
}
