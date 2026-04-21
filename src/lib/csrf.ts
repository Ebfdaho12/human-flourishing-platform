/**
 * CSRF Protection — Double Submit Cookie pattern
 *
 * How it works:
 * 1. GET /api/csrf generates a random token, sets it as a cookie, and returns it in JSON
 * 2. Client reads the cookie and sends the token as an `x-csrf-token` header on mutations
 * 3. Server middleware compares the header value to the cookie value
 *
 * The cookie is httpOnly=false so client JS can read it. SameSite=Strict prevents
 * cross-origin cookie attachment, and the header check ensures the request originated
 * from our own code (cross-origin JS cannot read our cookies due to SameSite).
 */

import { NextRequest, NextResponse } from "next/server"

export const CSRF_COOKIE_NAME = "csrf-token"
export const CSRF_HEADER_NAME = "x-csrf-token"

/** Methods that mutate state and require CSRF validation */
const STATE_CHANGING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"])

/**
 * Generate a cryptographically random CSRF token
 */
export function generateCsrfToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Build a Set-Cookie header value for the CSRF token
 */
export function csrfCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
  return `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Strict${secure}`
}

/**
 * Validate CSRF token on a request.
 * Returns null if valid, or a NextResponse 403 if invalid.
 */
export function validateCsrf(request: NextRequest): NextResponse | null {
  // Only check state-changing methods
  if (!STATE_CHANGING_METHODS.has(request.method)) return null

  // Skip NextAuth routes — it handles its own CSRF
  if (request.nextUrl.pathname.startsWith("/api/auth/")) return null

  // Skip non-API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) return null

  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  const headerToken = request.headers.get(CSRF_HEADER_NAME)

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return NextResponse.json(
      { error: "Invalid or missing CSRF token" },
      { status: 403 }
    )
  }

  return null
}
