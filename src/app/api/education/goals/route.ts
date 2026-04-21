import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { awardFound } from "@/lib/tokens"
import { TOKEN_AWARDS } from "@/lib/constants"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const goals = await prisma.learningGoal.findMany({
      where: { userId: session.user.id },
      include: {
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true, score: true, durationS: true },
        },
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({ goals })
  } catch (error) {
    console.error("[API] GET /api/education/goals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { subject, topic, level, description, targetDate } = body

  if (!subject || !topic) {
    return NextResponse.json({ error: "subject and topic are required" }, { status: 400 })
  }

  try {
    const goal = await prisma.learningGoal.create({
      data: {
        userId: session.user.id,
        subject,
        topic,
        level: level ?? "BEGINNER",
        description: description ?? null,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    })

    await awardFound(
      session.user.id,
      `edu_goal_${goal.id}`,
      "EDUCATION",
      TOKEN_AWARDS.EDU_GOAL_SET,
      `Learning goal set: ${subject} — ${topic}`
    )

    return NextResponse.json({ goal }, { status: 201 })
  } catch (error) {
    console.error("[API] POST /api/education/goals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { goalId, isActive, completedAt } = body

  if (!goalId) return NextResponse.json({ error: "goalId required" }, { status: 400 })

  try {
    const existing = await prisma.learningGoal.findFirst({
      where: { id: goalId, userId: session.user.id },
    })
    if (!existing) return NextResponse.json({ error: "Goal not found" }, { status: 404 })

    const goal = await prisma.learningGoal.update({
      where: { id: goalId },
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
        ...(completedAt !== undefined ? { completedAt: new Date(completedAt) } : {}),
      },
    })

    return NextResponse.json({ goal })
  } catch (error) {
    console.error("[API] PATCH /api/education/goals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
