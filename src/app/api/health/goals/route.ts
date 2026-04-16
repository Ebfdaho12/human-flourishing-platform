import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { awardFound } from "@/lib/tokens"
import { TOKEN_AWARDS } from "@/lib/constants"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const goals = await prisma.healthGoal.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  })

  return NextResponse.json({ goals })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { goalType, title, target, deadline } = body

  if (!goalType || !title || !target) {
    return NextResponse.json({ error: "goalType, title, and target are required" }, { status: 400 })
  }

  const goal = await prisma.healthGoal.create({
    data: {
      userId: session.user.id,
      goalType,
      title,
      target: JSON.stringify(target),
      deadline: deadline ? new Date(deadline) : null,
    },
  })

  await awardFound(
    session.user.id,
    `health_goal_set_${goalType}`,
    "HEALTH",
    TOKEN_AWARDS.HEALTH_GOAL_SET,
    `Health goal set: ${title}`
  )

  return NextResponse.json({ goal }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { goalId, current, isActive, completedAt } = body

  if (!goalId) return NextResponse.json({ error: "goalId required" }, { status: 400 })

  const existing = await prisma.healthGoal.findFirst({
    where: { id: goalId, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: "Goal not found" }, { status: 404 })

  const goal = await prisma.healthGoal.update({
    where: { id: goalId },
    data: {
      ...(current !== undefined ? { current: JSON.stringify(current) } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(completedAt !== undefined ? { completedAt: new Date(completedAt) } : {}),
    },
  })

  return NextResponse.json({ goal })
}
