// ============================================================
// HIDDEN COIN — session token (runtime-agnostic, Web Crypto)
//
// Token = base64url(JSON payload) + "." + base64url(HMAC-SHA256).
// Used by proxy.ts (gate before every page/API) and by route handlers.
// No Node-only imports, so it runs anywhere Web Crypto exists.
// ============================================================

import { HC_SESSION_TTL_MS } from "./config"

const enc = new TextEncoder()
const dec = new TextDecoder()
const DEV_FALLBACK_SECRET = "dev-only-insecure-secret-change-me-in-prod-please-32b"

function getSecret(): string {
  const secret = process.env.HC_SESSION_SECRET
  if (secret && secret.length >= 32) return secret
  if (process.env.NODE_ENV === "production") {
    // Never sign sessions with a guessable key in production.
    throw new Error("HC_SESSION_SECRET is missing or shorter than 32 characters")
  }
  return DEV_FALLBACK_SECRET
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = ""
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function b64urlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/")
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4)
  const bin = atob(padded)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

let keyPromise: Promise<CryptoKey> | null = null
function getKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    keyPromise = crypto.subtle.importKey(
      "raw",
      enc.encode(getSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    )
  }
  return keyPromise
}

async function sign(data: string): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await getKey(), enc.encode(data))
  return bytesToB64url(new Uint8Array(sig))
}

// Constant-time string comparison (no early exit on first mismatch).
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

interface SessionPayload {
  code: string
  iat: number
}

export async function createToken(code: string): Promise<string> {
  const payload: SessionPayload = { code, iat: Date.now() }
  const body = bytesToB64url(enc.encode(JSON.stringify(payload)))
  return `${body}.${await sign(body)}`
}

// Returns the player code for a valid, unexpired token — otherwise null.
export async function verifyToken(token: string | undefined | null): Promise<string | null> {
  if (!token || typeof token !== "string" || token.length > 1024) return null
  const dot = token.indexOf(".")
  if (dot <= 0) return null
  const body = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  try {
    if (!safeEqual(sig, await sign(body))) return null
    const payload = JSON.parse(dec.decode(b64urlToBytes(body))) as SessionPayload
    if (typeof payload?.code !== "string" || typeof payload.iat !== "number") return null
    if (payload.iat > Date.now() + 60_000) return null
    if (Date.now() - payload.iat > HC_SESSION_TTL_MS) return null
    return payload.code
  } catch {
    return null
  }
}
