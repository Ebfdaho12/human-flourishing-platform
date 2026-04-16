import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { analyzeHealth, hasApiKey, NO_KEY_RESPONSE } from "@/lib/ai"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const insights = await prisma.aIInsight.findMany({
    where: { userId: session.user.id, moduleId: "HEALTH" },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  return NextResponse.json({ insights, hasApiKey })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!hasApiKey) {
    return NextResponse.json({ content: NO_KEY_RESPONSE, hasApiKey: false })
  }

  const [entries, goals] = await Promise.all([
    prisma.healthEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { recordedAt: "desc" },
      take: 20,
    }),
    prisma.healthGoal.findMany({
      where: { userId: session.user.id, isActive: true },
    }),
  ])

  const parsedEntries = entries.map((e) => ({
    type: e.entryType,
    data: JSON.parse(e.data),
    notes: e.notes,
    recordedAt: e.recordedAt,
  }))

  const parsedGoals = goals.map((g) => ({
    type: g.goalType,
    title: g.title,
    target: JSON.parse(g.target),
    current: g.current ? JSON.parse(g.current) : null,
  }))

  const content = await analyzeHealth(parsedEntries, parsedGoals)

  const insight = await prisma.aIInsight.create({
    data: {
      userId: session.user.id,
      moduleId: "HEALTH",
      insightType: "RECOMMENDATION",
      content,
      dataContext: `${entries.length} entries, ${goals.length} active goals`,
    },
  })

  return NextResponse.json({ insight, hasApiKey: true })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { insightId } = await req.json()
  await prisma.aIInsight.updateMany({
    where: { id: insightId, userId: session.user.id },
    data: { isRead: true },
  })

  return NextResponse.json({ ok: true })
}
