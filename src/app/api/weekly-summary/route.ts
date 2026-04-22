import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Weekly Summary API — Compiles user's week into a digest
 *
 * GET /api/weekly-summary
 *
 * Returns: mood average, health entries count, streaks, goals progress,
 * correlations, achievements, and personalized insights.
 *
 * Powers: /digest page, potential email notifications, morning briefing weekly section
 */

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const userId = session.user.id
    const weekAgo = new Date(Date.now() - 7 * 86400000)

    const [moodEntries, healthEntries, wallet, journalCount] = await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId, recordedAt: { gte: weekAgo } },
        select: { score: true, emotions: true, recordedAt: true },
        orderBy: { recordedAt: "asc" },
      }),
      prisma.healthEntry.findMany({
        where: { userId, recordedAt: { gte: weekAgo } },
        select: { entryType: true, data: true, recordedAt: true },
        orderBy: { recordedAt: "asc" },
      }),
      prisma.wallet.findUnique({ where: { userId }, select: { foundBalance: true } }),
      prisma.journalEntry.count({ where: { userId, createdAt: { gte: weekAgo } } }),
    ])

    // Mood analysis
    const moodScores = moodEntries.map(m => m.score)
    const avgMood = moodScores.length > 0 ? Math.round(moodScores.reduce((a, b) => a + b, 0) / moodScores.length * 10) / 10 : null
    const moodTrend = moodScores.length >= 4
      ? Math.round((moodScores.slice(Math.floor(moodScores.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(moodScores.length / 2) -
          moodScores.slice(0, Math.floor(moodScores.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(moodScores.length / 2)) * 10) / 10
      : null
    const bestDay = moodEntries.length > 0 ? moodEntries.reduce((best, m) => m.score > best.score ? m : best) : null
    const worstDay = moodEntries.length > 0 ? moodEntries.reduce((worst, m) => m.score < worst.score ? m : worst) : null

    // Most common emotions
    const emotionCounts: Record<string, number> = {}
    moodEntries.forEach(m => {
      const emotions = typeof m.emotions === "string" ? JSON.parse(m.emotions || "[]") : (m.emotions || [])
      emotions.forEach((e: string) => { emotionCounts[e] = (emotionCounts[e] || 0) + 1 })
    })
    const topEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([e]) => e)

    // Health breakdown
    const healthByType: Record<string, number> = {}
    healthEntries.forEach(e => { healthByType[e.entryType] = (healthByType[e.entryType] || 0) + 1 })

    // Sleep analysis
    const sleepEntries = healthEntries.filter(e => e.entryType === "SLEEP")
    const sleepHours = sleepEntries.map(e => { try { return JSON.parse(e.data || "{}").hoursSlept || 0 } catch { return 0 } }).filter(h => h > 0)
    const avgSleep = sleepHours.length > 0 ? Math.round(sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length * 10) / 10 : null

    // Exercise count
    const exerciseCount = healthEntries.filter(e => e.entryType === "EXERCISE").length

    // Generate insights
    const insights: string[] = []
    if (avgMood !== null) {
      if (avgMood >= 7) insights.push(`Great week! Your average mood was ${avgMood}/10.`)
      else if (avgMood >= 5) insights.push(`Solid week. Average mood: ${avgMood}/10.`)
      else insights.push(`Tough week — average mood was ${avgMood}/10. Be gentle with yourself.`)
    }
    if (moodTrend !== null && Math.abs(moodTrend) > 0.5) {
      insights.push(moodTrend > 0 ? `Your mood improved through the week (+${moodTrend}).` : `Your mood dipped later in the week (${moodTrend}).`)
    }
    if (avgSleep !== null) {
      if (avgSleep >= 7) insights.push(`Sleep was good — ${avgSleep}hrs average.`)
      else insights.push(`Sleep was below 7hrs (${avgSleep}hrs avg). This affects everything else.`)
    }
    if (exerciseCount >= 4) insights.push(`Strong exercise week — ${exerciseCount} sessions!`)
    else if (exerciseCount > 0) insights.push(`${exerciseCount} exercise session${exerciseCount > 1 ? "s" : ""} this week.`)
    if (journalCount > 0) insights.push(`You journaled ${journalCount} time${journalCount > 1 ? "s" : ""} this week.`)
    if (topEmotions.length > 0) insights.push(`Most felt: ${topEmotions.join(", ")}.`)

    return NextResponse.json({
      period: { from: weekAgo.toISOString().split("T")[0], to: new Date().toISOString().split("T")[0] },
      mood: { average: avgMood, trend: moodTrend, entries: moodScores.length, bestDay: bestDay ? { score: bestDay.score, date: bestDay.recordedAt } : null, worstDay: worstDay ? { score: worstDay.score, date: worstDay.recordedAt } : null, topEmotions },
      sleep: { average: avgSleep, entries: sleepHours.length },
      exercise: { sessions: exerciseCount },
      health: { totalEntries: healthEntries.length, byType: healthByType },
      journal: { entries: journalCount },
      tokens: { balance: Number(wallet?.foundBalance || 0) },
      insights,
    })
  } catch (error) {
    console.error("[API] GET /api/weekly-summary:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
