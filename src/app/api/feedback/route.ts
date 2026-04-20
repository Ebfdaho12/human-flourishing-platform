import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse, sanitizeInput } from "@/lib/security"

/**
 * Feedback API — users submit bug reports, feature requests, and general feedback
 * Stored in the database for admin review. No external service needed.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Admin can see ALL feedback; regular users see only their own
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase())
  const isAdmin = adminEmails.includes(session.user.email?.toLowerCase() ?? "")

  const feedback = await prisma.moduleActivity.findMany({
    where: isAdmin ? { moduleId: "FEEDBACK" } : { userId: session.user.id, moduleId: "FEEDBACK" },
    orderBy: { createdAt: "desc" },
    take: isAdmin ? 100 : 20,
    include: isAdmin ? { user: { select: { email: true } } } : undefined,
  })

  return NextResponse.json({ feedback, isAdmin })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!rateLimit(`feedback:${session.user.id}`, 5, 300000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  const { type, title, description, page } = await req.json()

  if (!type || !description) {
    return NextResponse.json({ error: "type and description required" }, { status: 400 })
  }

  if (!["BUG", "FEATURE", "GENERAL", "ACCESSIBILITY"].includes(type)) {
    return NextResponse.json({ error: "type must be BUG, FEATURE, GENERAL, or ACCESSIBILITY" }, { status: 400 })
  }

  await prisma.moduleActivity.create({
    data: {
      userId: session.user.id,
      moduleId: "FEEDBACK",
      activityKey: `feedback:${Date.now()}`,
      metadata: JSON.stringify({
        type,
        title: sanitizeInput(title ?? ""),
        description: sanitizeInput(description),
        page: page ?? null,
        userAgent: null, // Don't store user agent for privacy
        timestamp: new Date().toISOString(),
      }),
    },
  })

  return NextResponse.json({ success: true, message: "Thank you for your feedback!" })
}
