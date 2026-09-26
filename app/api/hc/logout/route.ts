import { NextResponse } from "next/server"
import { HC_COOKIE } from "@/lib/hc/config"
import { SESSION_COOKIE_OPTIONS } from "@/lib/hc/session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(HC_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 })
  return res
}
