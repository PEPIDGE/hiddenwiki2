import { NextRequest, NextResponse } from "next/server"
import { getSessionCode } from "@/lib/hc/session"
import { updatePlayer } from "@/lib/hc/store"
import { toPublicPlayer, type StoredClue } from "@/lib/hc/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_CLUES = 400

// Mirror the game's clue board server-side so each player's evidence is
// individual and survives across devices/sessions.
export async function POST(req: NextRequest) {
  const code = await getSessionCode()
  if (!code) {
    return NextResponse.json({ error: "Не си влязъл." }, { status: 401 })
  }

  let action = ""
  let clue: Partial<StoredClue> = {}
  let clueId = ""
  try {
    const body = await req.json()
    action = (body?.action ?? "").toString()
    clue = body?.clue ?? {}
    clueId = (body?.clueId ?? clue?.id ?? "").toString()
  } catch {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 })
  }

  const updated = await updatePlayer(code, (p) => {
    if (action === "save" && clue && clue.id) {
      if (p.clues.some((c) => c.id === clue.id)) return
      if (p.clues.length >= MAX_CLUES) return
      p.clues.push({
        id: String(clue.id),
        title: String(clue.title ?? clue.id),
        text: String(clue.text ?? ""),
        sourceRoute: String(clue.sourceRoute ?? ""),
        confidence: Number(clue.confidence ?? 0),
        status: (clue.status as StoredClue["status"]) ?? "unverified",
        timestamp: Date.now(),
      })
    } else if (action === "remove" && clueId) {
      p.clues = p.clues.filter((c) => c.id !== clueId)
    }
  })

  if (!updated) {
    return NextResponse.json({ error: "Профилът не е намерен." }, { status: 404 })
  }
  return NextResponse.json({ ok: true, player: toPublicPlayer(updated) })
}
