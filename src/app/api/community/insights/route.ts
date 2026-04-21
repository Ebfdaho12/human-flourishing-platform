import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse, sanitizeInput } from "@/lib/security"

/**
 * Insights API — public evidence-backed sharing
 * GET ?topic=TAG — list insights by topic
 * POST — share an insight
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const topic = req.nextUrl.searchParams.get("topic")
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1")

  try {
    const where = topic ? { topicTag: topic } : {}

    const insights = await prisma.insight.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 20,
      take: 20,
      include: {
        author: { select: { id: true, profile: { select: { displayName: true } } } },
        votes: { where: { userId: session.user.id }, select: { value: true } },
      },
    })

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("[API] GET /api/community/insights:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!rateLimit(`insight:${session.user.id}`, 5, 300000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  const body = await req.json()
  const { content, topicTag, toolLink, sourceUrl, isAnonymous } = body

  if (!content || content.length < 50) {
    return NextResponse.json({ error: "Insight must be at least 50 characters (substance over brevity)" }, { status: 400 })
  }
  if (content.length > 500) {
    return NextResponse.json({ error: "Max 500 characters (insights, not essays)" }, { status: 400 })
  }
  if (!topicTag) {
    return NextResponse.json({ error: "Topic tag required" }, { status: 400 })
  }

  try {
    const insight = await prisma.insight.create({
      data: {
        authorId: session.user.id,
        content: sanitizeInput(content),
        topicTag,
        toolLink: toolLink || null,
        sourceUrl: sourceUrl || null,
        isAnonymous: !!isAnonymous,
      },
    })

    return NextResponse.json({ insight })
  } catch (error) {
    console.error("[API] POST /api/community/insights:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
