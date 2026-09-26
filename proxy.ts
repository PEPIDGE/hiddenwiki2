// ============================================================
// HIDDEN WIKI 2 — access gate (Next.js 16 proxy, runs before routing)
//
// Nothing is served without a valid, signed session cookie: every page
// (including statically prerendered ones) redirects to /login, every API
// answers 401. State-changing API calls must come from this origin.
// ============================================================

import { NextResponse, type NextRequest } from "next/server"
import { HC_COOKIE } from "@/lib/hc/config"
import { verifyToken } from "@/lib/hc/token"

// Reachable without a session.
const PUBLIC_PATHS = new Set(["/login", "/api/hc/login", "/api/hc/logout"])

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin")
  if (!origin) return true // same-origin fetches from older browsers / curl
  try {
    return new URL(origin).host === req.headers.get("host")
  } catch {
    return false
  }
}

function safeNext(pathname: string, search: string): string {
  const target = `${pathname}${search}`
  return target.startsWith("/") && !target.startsWith("//") ? target : "/hidden-wiki-2"
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const isApi = pathname.startsWith("/api/")

  // CSRF defence-in-depth (the cookie is also SameSite=Lax).
  if (isApi && req.method !== "GET" && req.method !== "HEAD" && !isSameOrigin(req)) {
    return NextResponse.json({ error: "Забранен произход." }, { status: 403 })
  }

  const code = await verifyToken(req.cookies.get(HC_COOKIE)?.value)

  if (PUBLIC_PATHS.has(pathname)) {
    // Already logged in → skip the login screen.
    if (code && pathname === "/login") {
      const next = req.nextUrl.searchParams.get("next")
      const url = req.nextUrl.clone()
      url.search = ""
      url.pathname = next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : "/hidden-wiki-2"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (code) return NextResponse.next()

  if (isApi) {
    return NextResponse.json({ error: "Не си влязъл." }, { status: 401 })
  }

  const url = req.nextUrl.clone()
  url.pathname = "/login"
  url.search = ""
  if (pathname !== "/") url.searchParams.set("next", safeNext(pathname, search))
  return NextResponse.redirect(url)
}

export const config = {
  // Everything except Next internals and public static files.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|mp4|webm|woff2?|ttf|txt|xml)$).*)",
  ],
}
