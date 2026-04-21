import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Habit Tracker API — visual calendar of daily engagement
 *
 * GET /api/habits?months=3
 * Returns a GitHub-style contribution grid showing which days
 * had activity and what was done.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const months = Math.min(12, parseInt(searchParams.get("months") ?? "3"))

    const since = new Date()
    since.setMonth(since.getMonth() - months)
    since.setHours(0, 0, 0, 0)

    // Get all activity dates across all modules
    const [healthDates, moodDates, journalDates, eduDates, govDates, energyDates] = await Promise.all([
      prisma.healthEntry.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.moodEntry.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.journalEntry.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.lessonSession.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.govRecord.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.energyLog.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }),
    ])

    // Build day map
    const dayMap: Record<string, { total: number; modules: string[] }> = {}

    function addDay(date: Date, module: string) {
      const key = date.toISOString().split("T")[0]
      if (!dayMap[key]) dayMap[key] = { total: 0, modules: [] }
      dayMap[key].total++
      if (!dayMap[key].modules.includes(module)) dayMap[key].modules.push(module)
    }

    for (const d of healthDates) addDay(d.createdAt, "health")
    for (const d of moodDates) addDay(d.createdAt, "mood")
    for (const d of journalDates) addDay(d.createdAt, "journal")
    for (const d of eduDates) addDay(d.createdAt, "education")
    for (const d of govDates) addDay(d.createdAt, "governance")
    for (const d of energyDates) addDay(d.createdAt, "energy")

    // Build calendar grid (weeks x days)
    const today = new Date()
    const totalDays = Math.floor((today.getTime() - since.getTime()) / 86400000) + 1
    const days: { date: string; level: number; total: number; modules: string[] }[] = []

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(since.getTime() + i * 86400000)
      const key = d.toISOString().split("T")[0]
      const entry = dayMap[key]
      const total = entry?.total ?? 0
      const level = total === 0 ? 0 : total <= 2 ? 1 : total <= 5 ? 2 : total <= 10 ? 3 : 4

      days.push({ date: key, level, total, modules: entry?.modules ?? [] })
    }

    // Stats
    const activeDays = days.filter(d => d.level > 0).length
    const totalActions = days.reduce((s, d) => s + d.total, 0)

    // Current streak
    let streak = 0
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].level > 0) streak++
      else if (i < days.length - 1) break // Allow today to be empty
    }

    // Longest streak
    let longest = 0
    let current = 0
    for (const d of days) {
      if (d.level > 0) { current++; longest = Math.max(longest, current) }
      else current = 0
    }

    return NextResponse.json({
      days,
      stats: { activeDays, totalDays, totalActions, currentStreak: streak, longestStreak: longest },
      months,
    })

  } catch (error) {
    console.error("[API] GET /api/habits:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
