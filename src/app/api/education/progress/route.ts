import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Education Progress API — learning streaks, subject mastery, and session stats
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const userId = session.user.id

    // Get all sessions for this user
    const sessions = await prisma.lessonSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { subject: true, topic: true, level: true, score: true, durationS: true, createdAt: true },
    })

    const goals = await prisma.learningGoal.findMany({
      where: { userId },
      select: { subject: true, topic: true, level: true, isActive: true, completedAt: true },
    })

    // Calculate streak (consecutive days with sessions)
    let streak = 0
    if (sessions.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const sessionDays = new Set(
        sessions.map((s) => {
          const d = new Date(s.createdAt)
          d.setHours(0, 0, 0, 0)
          return d.getTime()
        })
      )

      const sortedDays = Array.from(sessionDays).sort((a, b) => b - a)
      const DAY = 86400000

      // Check if today or yesterday has a session
      if (sortedDays[0] >= today.getTime() - DAY) {
        streak = 1
        for (let i = 1; i < sortedDays.length; i++) {
          if (sortedDays[i - 1] - sortedDays[i] <= DAY) {
            streak++
          } else {
            break
          }
        }
      }
    }

    // Subject mastery breakdown
    const subjectMap: Record<string, { sessions: number; totalScore: number; scoredSessions: number; totalMinutes: number; topics: Set<string> }> = {}
    for (const s of sessions) {
      if (!subjectMap[s.subject]) {
        subjectMap[s.subject] = { sessions: 0, totalScore: 0, scoredSessions: 0, totalMinutes: 0, topics: new Set() }
      }
      const entry = subjectMap[s.subject]
      entry.sessions++
      entry.totalMinutes += Math.round(s.durationS / 60)
      entry.topics.add(s.topic)
      if (s.score !== null) {
        entry.totalScore += s.score
        entry.scoredSessions++
      }
    }

    const subjects = Object.entries(subjectMap).map(([name, data]) => ({
      name,
      sessions: data.sessions,
      avgScore: data.scoredSessions > 0 ? Math.round(data.totalScore / data.scoredSessions) : null,
      totalMinutes: data.totalMinutes,
      topicCount: data.topics.size,
    })).sort((a, b) => b.sessions - a.sessions)

    // Weekly sessions (last 4 weeks)
    const weeklyActivity: { week: string; sessions: number; minutes: number }[] = []
    for (let w = 0; w < 4; w++) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (w + 1) * 7)
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - w * 7)

      const weekSessions = sessions.filter((s) => {
        const d = new Date(s.createdAt)
        return d >= weekStart && d < weekEnd
      })

      weeklyActivity.push({
        week: w === 0 ? "This week" : w === 1 ? "Last week" : `${w + 1} weeks ago`,
        sessions: weekSessions.length,
        minutes: weekSessions.reduce((sum, s) => sum + Math.round(s.durationS / 60), 0),
      })
    }

    return NextResponse.json({
      streak,
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum, s) => sum + Math.round(s.durationS / 60), 0),
      totalGoals: goals.length,
      activeGoals: goals.filter((g) => g.isActive).length,
      completedGoals: goals.filter((g) => g.completedAt).length,
      subjects,
      weeklyActivity: weeklyActivity.reverse(),
    })

  } catch (error) {
    console.error("[API] GET /api/education/progress:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
