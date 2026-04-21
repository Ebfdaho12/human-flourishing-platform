import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Streaks API — tracks consecutive day engagement across modules
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const userId = session.user.id
    const DAY = 86400000

    function calcStreak(dates: Date[]): { current: number; longest: number; todayDone: boolean } {
      if (dates.length === 0) return { current: 0, longest: 0, todayDone: false }

      const daySet = new Set(dates.map((d) => {
        const nd = new Date(d)
        nd.setHours(0, 0, 0, 0)
        return nd.getTime()
      }))

      const sorted = Array.from(daySet).sort((a, b) => b - a)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTs = today.getTime()

      const todayDone = daySet.has(todayTs)

      // Current streak
      let current = 0
      if (sorted[0] >= todayTs - DAY) {
        current = 1
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i - 1] - sorted[i] <= DAY) current++
          else break
        }
      }

      // Longest streak
      let longest = 0
      let run = 1
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i - 1] - sorted[i] <= DAY) {
          run++
        } else {
          longest = Math.max(longest, run)
          run = 1
        }
      }
      longest = Math.max(longest, run, current)

      return { current, longest, todayDone }
    }

    // Fetch dates from each module
    const [healthDates, moodDates, journalDates, eduDates, energyDates] = await Promise.all([
      prisma.healthEntry.findMany({ where: { userId }, select: { createdAt: true } }),
      prisma.moodEntry.findMany({ where: { userId }, select: { createdAt: true } }),
      prisma.journalEntry.findMany({ where: { userId }, select: { createdAt: true } }),
      prisma.lessonSession.findMany({ where: { userId }, select: { createdAt: true } }),
      prisma.energyLog.findMany({ where: { userId }, select: { createdAt: true } }),
    ])

    // Combined "any module" streak
    const allDates = [
      ...healthDates.map((d) => d.createdAt),
      ...moodDates.map((d) => d.createdAt),
      ...journalDates.map((d) => d.createdAt),
      ...eduDates.map((d) => d.createdAt),
      ...energyDates.map((d) => d.createdAt),
    ]

    const overall = calcStreak(allDates)

    const streaks = {
      overall,
      health: calcStreak(healthDates.map((d) => d.createdAt)),
      mood: calcStreak(moodDates.map((d) => d.createdAt)),
      journal: calcStreak(journalDates.map((d) => d.createdAt)),
      education: calcStreak(eduDates.map((d) => d.createdAt)),
      energy: calcStreak(energyDates.map((d) => d.createdAt)),
    }

    // Daily checklist
    const checklist = [
      { label: "Log health data", done: streaks.health.todayDone, module: "health" },
      { label: "Mood check-in", done: streaks.mood.todayDone, module: "mental-health" },
      { label: "Write in journal", done: streaks.journal.todayDone, module: "mental-health" },
      { label: "Learn something", done: streaks.education.todayDone, module: "education" },
      { label: "Track energy", done: streaks.energy.todayDone, module: "energy" },
    ]

    const dailyProgress = checklist.filter((c) => c.done).length
    const dailyTotal = checklist.length

    return NextResponse.json({ streaks, checklist, dailyProgress, dailyTotal })

  } catch (error) {
    console.error("[API] GET /api/streaks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
