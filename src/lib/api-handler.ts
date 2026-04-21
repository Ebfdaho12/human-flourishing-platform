import { NextRequest, NextResponse } from "next/server"

/**
 * Safe API Handler Wrapper
 *
 * Wraps route handlers with:
 * - try-catch error handling (no stack trace leaks)
 * - Consistent error response format
 * - Request logging for audit trail
 *
 * Usage:
 *   export const GET = apiHandler(async (req) => {
 *     // your logic
 *     return NextResponse.json({ data })
 *   })
 */
export function apiHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      console.error(`[API Error] ${req.method} ${req.nextUrl.pathname}:`, error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
}
