import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { analyzeMood, hasApiKey, NO_KEY_RESPONSE } from "@/lib/ai"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const insights = await prisma.aIInsight.findMany({
      where: { userId: session.user.id, moduleId: "MENTAL_HEALTH" },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    return NextResponse.json({ insights, hasApiKey })
  } catch (error) {
    console.error("[API] GET /api/mental-health/insights:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!hasApiKey) {
    return NextResponse.json({ content: NO_KEY_RESPONSE, hasApiKey: false })
  }

  try {
    const [moodEntries, journalEntries] = await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId: session.user.id },
        orderBy: { recordedAt: "desc" },
        take: 14,
      }),
      prisma.journalEntry.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { title: true, content: true, mood: true, createdAt: true },
      }),
    ])

    const parsedMood = moodEntries.map((e) => ({
      score: e.score,
      emotions: JSON.parse(e.emotions || "[]"),
      notes: e.notes,
      recordedAt: e.recordedAt,
    }))

    const content = await analyzeMood(parsedMood, journalEntries)

    const insight = await prisma.aIInsight.create({
      data: {
        userId: session.user.id,
        moduleId: "MENTAL_HEALTH",
        insightType: "ENCOURAGEMENT",
        content,
        dataContext: `${moodEntries.length} mood entries, ${journalEntries.length} journal entries`,
      },
    })

    return NextResponse.json({ insight, hasApiKey: true })
  } catch (error) {
    console.error("[API] POST /api/mental-health/insights:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
