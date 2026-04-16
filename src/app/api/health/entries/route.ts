import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { awardFound } from "@/lib/tokens"
import { TOKEN_AWARDS } from "@/lib/constants"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200)

  const entries = await prisma.healthEntry.findMany({
    where: {
      userId: session.user.id,
      ...(type ? { entryType: type } : {}),
    },
    orderBy: { recordedAt: "desc" },
    take: limit,
  })

  return NextResponse.json({ entries })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { entryType, data, notes, recordedAt } = body

  if (!entryType || !data) {
    return NextResponse.json({ error: "entryType and data are required" }, { status: 400 })
  }

  const VALID_TYPES = ["VITALS", "SYMPTOM", "EXERCISE", "SLEEP", "NUTRITION", "MEDICATION", "MEASUREMENT"]
  if (!VALID_TYPES.includes(entryType)) {
    return NextResponse.json({ error: "Invalid entryType" }, { status: 400 })
  }

  const entry = await prisma.healthEntry.create({
    data: {
      userId: session.user.id,
      entryType,
      data: JSON.stringify(data),
      notes: notes ?? null,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    },
  })

  // Award FOUND for first health log (idempotent)
  await awardFound(
    session.user.id,
    "health_first_log",
    "HEALTH",
    TOKEN_AWARDS.HEALTH_FIRST_LOG,
    "First health log entry"
  )

  // Check for 7-day streak
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentCount = await prisma.healthEntry.count({
    where: {
      userId: session.user.id,
      recordedAt: { gte: sevenDaysAgo },
    },
  })
  if (recentCount >= 7) {
    await awardFound(
      session.user.id,
      "health_week_streak",
      "HEALTH",
      TOKEN_AWARDS.HEALTH_WEEK_STREAK,
      "7-day health logging streak"
    )
  }

  return NextResponse.json({ entry }, { status: 201 })
}
