import { NextRequest, NextResponse } from "next/server"
import { HC_COOKIE } from "@/lib/hc/config"
import { createToken, SESSION_COOKIE_OPTIONS } from "@/lib/hc/session"
import { getPlayer } from "@/lib/hc/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Brute-force guard: max 8 tries per 10 minutes per IP (per instance).
const attempts = new Map<string, { count: number; first: number }>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 8

function tooMany(ip: string): boolean {
  const now = Date.now()
  const rec = attempts.get(ip)
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now })
    return false
  }
  rec.count += 1
  return rec.count > MAX_ATTEMPTS
}

const CODE_PATTERN = /^[A-Z0-9-]{4,64}$/

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"

  if (tooMany(ip)) {
    return NextResponse.json({ error: "Твърде много опити. Опитай пак след малко." }, { status: 429 })
  }

  let code = ""
  try {
    const body = await req.json()
    code = String(body?.code ?? "").trim().toUpperCase()
  } catch {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 })
  }

  if (!CODE_PATTERN.test(code)) {
    return NextResponse.json({ error: "Невалиден код." }, { status: 400 })
  }

  // Codes are pre-issued; an unknown code cannot create an account.
  const player = await getPlayer(code)
  if (!player) {
    return NextResponse.json({ error: "Непознат код." }, { status: 401 })
  }

  attempts.delete(ip)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(HC_COOKIE, await createToken(player.code), SESSION_COOKIE_OPTIONS)
  return res
}
