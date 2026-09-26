import { NextRequest, NextResponse } from "next/server"
import { HC_COOKIE, HC_SESSION_TTL_MS } from "@/lib/hc/config"
import { createToken } from "@/lib/hc/session"
import { getPlayer } from "@/lib/hc/store"
import { toPublicPlayer } from "@/lib/hc/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Simple in-memory brute-force guard: max 8 tries / 10 min per IP.
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

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"

  if (tooMany(ip)) {
    return NextResponse.json(
      { error: "Твърде много опити. Опитай пак по-късно." },
      { status: 429 },
    )
  }

  let code = ""
  try {
    const body = await req.json()
    code = (body?.code ?? "").toString().trim()
  } catch {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 })
  }

  if (!code || code.length > 64) {
    return NextResponse.json({ error: "Въведи валиден код." }, { status: 400 })
  }

  // Codes are pre-issued; unknown codes cannot self-register.
  const player = await getPlayer(code)
  if (!player) {
    return NextResponse.json(
      { error: "Непознат код за достъп." },
      { status: 401 },
    )
  }

  const res = NextResponse.json({ ok: true, player: toPublicPlayer(player) })
  res.cookies.set(HC_COOKIE, createToken(player.code), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(HC_SESSION_TTL_MS / 1000),
  })
  return res
}
