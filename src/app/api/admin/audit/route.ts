import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Admin Audit Log API — query audit trail entries
 *
 * GET /api/admin/audit?userId=&resource=&action=&limit=&offset=
 *
 * Restricted to ADMIN_EMAILS.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Admin check
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
  if (!adminEmails.includes(session.user.email?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = req.nextUrl
    const userId = searchParams.get("userId") || undefined
    const resource = searchParams.get("resource") || undefined
    const action = searchParams.get("action") || undefined
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 1), 200)
    const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10) || 0, 0)

    const where = {
      ...(userId && { userId }),
      ...(resource && { resource }),
      ...(action && { action }),
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("[API] GET /api/admin/audit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
