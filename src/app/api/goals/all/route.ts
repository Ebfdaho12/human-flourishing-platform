import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Unified Goals API — all goals across all modules in one view
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id

  const [healthGoals, learningGoals] = await Promise.all([
    prisma.healthGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, goalType: true, title: true, target: true, current: true, isActive: true, completedAt: true, deadline: true, createdAt: true },
    }),
    prisma.learningGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, subject: true, topic: true, level: true, isActive: true, completedAt: true, targetDate: true, createdAt: true },
    }),
  ])

  const goals = [
    ...healthGoals.map(g => {
      const target = JSON.parse(g.target || "{}")
      const current = g.current ? JSON.parse(g.current) : null
      const pct = current?.value && target?.value ? Math.min(100, Math.round((current.value / target.value) * 100)) : 0
      return {
        id: g.id, module: "HEALTH", type: g.goalType, title: g.title,
        target: `${target.value ?? "?"} ${target.unit ?? ""}`,
        progress: pct, isActive: g.isActive, completedAt: g.completedAt?.toISOString() ?? null,
        deadline: g.deadline?.toISOString() ?? null, createdAt: g.createdAt.toISOString(),
      }
    }),
    ...learningGoals.map(g => ({
      id: g.id, module: "EDUCATION", type: "LEARNING", title: `${g.subject}: ${g.topic}`,
      target: g.level, progress: g.completedAt ? 100 : g.isActive ? 50 : 0,
      isActive: g.isActive, completedAt: g.completedAt?.toISOString() ?? null,
      deadline: g.targetDate?.toISOString() ?? null, createdAt: g.createdAt.toISOString(),
    })),
  ]

  const active = goals.filter(g => g.isActive && !g.completedAt)
  const completed = goals.filter(g => g.completedAt)

  return NextResponse.json({ goals, active: active.length, completed: completed.length, total: goals.length })
}
