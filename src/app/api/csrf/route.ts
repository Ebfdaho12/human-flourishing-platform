import { NextResponse } from "next/server"
import { generateCsrfToken, csrfCookieHeader } from "@/lib/csrf"

/**
 * GET /api/csrf — Issue a fresh CSRF token
 *
 * Returns the token in JSON and sets it as a cookie.
 * Client code calls this once on load, then attaches the token
 * as an x-csrf-token header on every state-changing request.
 */
export async function GET() {
  const token = generateCsrfToken()

  const response = NextResponse.json({ csrfToken: token })
  response.headers.set("Set-Cookie", csrfCookieHeader(token))
  return response
}
