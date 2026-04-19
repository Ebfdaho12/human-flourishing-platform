import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Sleep Analysis API — detailed sleep pattern analysis
 *
 * GET /api/health/sleep-analysis?days=30
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = Math.min(90, parseInt(searchParams.get("days") ?? "30"))
  const since = new Date(Date.now() - days * 86400000)

  const entries = await prisma.healthEntry.findMany({
    where: { userId: session.user.id, entryType: "SLEEP", recordedAt: { gte: since } },
    orderBy: { recordedAt: "asc" },
    select: { data: true, recordedAt: true },
  })

  if (entries.length === 0) {
    return NextResponse.json({ hasData: false, days })
  }

  const sleepData = entries.map(e => {
    const d = JSON.parse(e.data || "{}")
    return {
      date: e.recordedAt.toISOString().split("T")[0],
      hours: d.hoursSlept ?? null,
      quality: d.quality ?? null,
      bedtime: d.bedtime ?? null,
      wakeTime: d.wakeTime ?? null,
    }
  }).filter(d => d.hours !== null)

  if (sleepData.length === 0) {
    return NextResponse.json({ hasData: false, days })
  }

  const hours = sleepData.map(d => d.hours!).filter(Boolean)
  const qualities = sleepData.map(d => d.quality!).filter(Boolean)

  const avgHours = Math.round((hours.reduce((a, b) => a + b, 0) / hours.length) * 10) / 10
  const avgQuality = qualities.length > 0 ? Math.round((qualities.reduce((a, b) => a + b, 0) / qualities.length) * 10) / 10 : null

  // Sleep debt calculation (assuming 8 hours is ideal)
  const idealHours = 8
  const totalDebt = hours.reduce((debt, h) => debt + Math.max(0, idealHours - h), 0)

  // Consistency score (how consistent are sleep/wake times)
  let consistencyScore = 100
  if (hours.length >= 3) {
    const stdDev = Math.sqrt(hours.reduce((sum, h) => sum + Math.pow(h - avgHours, 2), 0) / hours.length)
    consistencyScore = Math.max(0, Math.round(100 - stdDev * 20))
  }

  // Day of week analysis
  const byDayOfWeek: Record<string, number[]> = { Sun: [], Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [] }
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  for (const d of sleepData) {
    if (d.hours !== null) {
      const day = dayNames[new Date(d.date).getDay()]
      byDayOfWeek[day].push(d.hours)
    }
  }
  const weekdayAvg = Object.entries(byDayOfWeek).map(([day, hours]) => ({
    day,
    avg: hours.length > 0 ? Math.round((hours.reduce((a, b) => a + b, 0) / hours.length) * 10) / 10 : null,
    count: hours.length,
  }))

  // Recommendations
  const recommendations: string[] = []
  if (avgHours < 7) recommendations.push("You're averaging less than 7 hours. Adults need 7-9 hours for optimal health.")
  if (avgHours > 9) recommendations.push("You're averaging more than 9 hours. Excessive sleep can indicate underlying health issues.")
  if (consistencyScore < 60) recommendations.push("Your sleep schedule is inconsistent. Try going to bed and waking up at the same time daily.")
  if (totalDebt > 10) recommendations.push(`You've accumulated ${Math.round(totalDebt)} hours of sleep debt over ${days} days. Consider catching up gradually.`)
  if (avgQuality !== null && avgQuality < 5) recommendations.push("Your sleep quality is low. Consider: no screens 1 hour before bed, cool dark room, consistent schedule.")
  if (recommendations.length === 0) recommendations.push("Your sleep patterns look healthy. Keep it up!")

  return NextResponse.json({
    hasData: true,
    days,
    totalEntries: sleepData.length,
    summary: {
      avgHours,
      avgQuality,
      minHours: Math.min(...hours),
      maxHours: Math.max(...hours),
      totalDebt: Math.round(totalDebt * 10) / 10,
      consistencyScore,
    },
    sleepData,
    weekdayAvg,
    recommendations,
  })
}
