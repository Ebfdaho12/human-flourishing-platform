import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { awardFound } from "@/lib/tokens"
import { TOKEN_AWARDS } from "@/lib/constants"
import { auditLog } from "@/lib/audit"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "30"), 90)

    const entries = await prisma.moodEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { recordedAt: "desc" },
      take: limit,
    })

    const parsed = entries.map((e) => ({
      ...e,
      emotions: JSON.parse(e.emotions || "[]"),
      triggers: e.triggers ? JSON.parse(e.triggers) : [],
      activities: e.activities ? JSON.parse(e.activities) : [],
    }))

    return NextResponse.json({ entries: parsed })
  } catch (error) {
    console.error("[API] GET /api/mental-health/mood:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { score, emotions, notes, triggers, activities } = body

    if (!score || score < 1 || score > 10) {
      return NextResponse.json({ error: "score must be 1-10" }, { status: 400 })
    }

    const entry = await prisma.moodEntry.create({
      data: {
        userId: session.user.id,
        score,
        emotions: JSON.stringify(emotions ?? []),
        notes: notes ?? null,
        triggers: triggers ? JSON.stringify(triggers) : null,
        activities: activities ? JSON.stringify(activities) : null,
      },
    })

    // First mood log reward
    await awardFound(
      session.user.id,
      "mood_first_log",
      "MENTAL_HEALTH",
      TOKEN_AWARDS.MOOD_FIRST_LOG,
      "First mood check-in"
    )

    // 7-day streak check
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentCount = await prisma.moodEntry.count({
      where: { userId: session.user.id, recordedAt: { gte: sevenDaysAgo } },
    })
    if (recentCount >= 7) {
      await awardFound(
        session.user.id,
        "mood_week_streak",
        "MENTAL_HEALTH",
        TOKEN_AWARDS.MOOD_WEEK_STREAK,
        "7-day mood tracking streak"
      )
    }

    auditLog({ userId: session.user.id, action: "CREATE", resource: "mood_entry", resourceId: entry.id })

    return NextResponse.json({
      entry: {
        ...entry,
        emotions: JSON.parse(entry.emotions),
        triggers: entry.triggers ? JSON.parse(entry.triggers) : [],
        activities: entry.activities ? JSON.parse(entry.activities) : [],
      },
    }, { status: 201 })
  } catch (error) {
    console.error("[API] POST /api/mental-health/mood:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
