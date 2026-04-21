import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Weekly Digest API — generates a summary of the user's week
 *
 * GET /api/digest
 * Returns a comprehensive overview of the last 7 days of activity,
 * progress, streaks, and insights across all modules.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const userId = session.user.id
    const weekAgo = new Date(Date.now() - 7 * 86400000)

    const [
      healthEntries,
      moodEntries,
      journalEntries,
      tutorSessions,
      govRecords,
      studies,
      energyLogs,
      interventions,
      infraProjects,
      wallet,
    ] = await Promise.all([
      prisma.healthEntry.count({ where: { userId, createdAt: { gte: weekAgo } } }),
      prisma.moodEntry.findMany({ where: { userId, createdAt: { gte: weekAgo } }, select: { score: true } }),
      prisma.journalEntry.count({ where: { userId, createdAt: { gte: weekAgo } } }),
      prisma.lessonSession.findMany({ where: { userId, createdAt: { gte: weekAgo } }, select: { subject: true, durationS: true, score: true } }),
      prisma.govRecord.count({ where: { userId, createdAt: { gte: weekAgo } } }),
      prisma.researchStudy.count({ where: { userId, createdAt: { gte: weekAgo } } }),
      prisma.energyLog.findMany({ where: { userId, createdAt: { gte: weekAgo } }, select: { amountKwh: true, logType: true, sourceType: true } }),
      prisma.econIntervention.count({ where: { userId, createdAt: { gte: weekAgo } } }),
      prisma.infraProject.count({ where: { userId, createdAt: { gte: weekAgo } } }),
      prisma.wallet.findUnique({ where: { userId }, select: { foundBalance: true } }),
    ])

    // Compute weekly stats
    const avgMood = moodEntries.length > 0
      ? Math.round((moodEntries.reduce((s, m) => s + m.score, 0) / moodEntries.length) * 10) / 10
      : null

    const totalStudyMinutes = tutorSessions.reduce((s, t) => s + Math.round(t.durationS / 60), 0)
    const subjectsStudied = [...new Set(tutorSessions.map(t => t.subject))]
    const avgSessionScore = tutorSessions.filter(t => t.score !== null).length > 0
      ? Math.round(tutorSessions.filter(t => t.score !== null).reduce((s, t) => s + (t.score ?? 0), 0) / tutorSessions.filter(t => t.score !== null).length)
      : null

    const totalProduced = energyLogs.filter(l => l.logType === "PRODUCTION").reduce((s, l) => s + l.amountKwh, 0)
    const totalConsumed = energyLogs.filter(l => l.logType === "CONSUMPTION").reduce((s, l) => s + l.amountKwh, 0)
    const renewableKwh = energyLogs.filter(l => ["SOLAR", "WIND", "HYDRO"].includes(l.sourceType)).reduce((s, l) => s + l.amountKwh, 0)

    const totalActions = healthEntries + moodEntries.length + journalEntries + tutorSessions.length + govRecords + studies + energyLogs.length + interventions + infraProjects

    // Active days this week
    const activeDays = new Set<string>()
    const allDates = await prisma.healthEntry.findMany({
      where: { userId, createdAt: { gte: weekAgo } },
      select: { createdAt: true },
    })
    const moodDates = await prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: weekAgo } },
      select: { createdAt: true },
    })
    for (const d of [...allDates, ...moodDates]) {
      activeDays.add(d.createdAt.toISOString().split("T")[0])
    }

    // Generate highlights
    const highlights: string[] = []
    if (healthEntries > 0) highlights.push(`Logged ${healthEntries} health entries`)
    if (moodEntries.length > 0) highlights.push(`${moodEntries.length} mood check-ins (avg: ${avgMood}/10)`)
    if (journalEntries > 0) highlights.push(`Wrote ${journalEntries} journal entries`)
    if (tutorSessions.length > 0) highlights.push(`${tutorSessions.length} tutoring sessions (${totalStudyMinutes} min)`)
    if (govRecords > 0) highlights.push(`Tracked ${govRecords} governance records`)
    if (energyLogs.length > 0) highlights.push(`Logged ${Math.round(totalProduced * 10) / 10} kWh produced`)
    if (totalActions === 0) highlights.push("No activity this week — your streak needs you!")

    return NextResponse.json({
      week: {
        startDate: weekAgo.toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      },
      summary: {
        totalActions,
        activeDays: activeDays.size,
        foundBalance: wallet ? Number(BigInt(wallet.foundBalance) / 1_000_000n) : 0,
      },
      health: { entries: healthEntries },
      mentalHealth: { moodCheckIns: moodEntries.length, avgMood, journalEntries },
      education: { sessions: tutorSessions.length, minutes: totalStudyMinutes, subjects: subjectsStudied, avgScore: avgSessionScore },
      governance: { records: govRecords },
      science: { studies },
      energy: { logs: energyLogs.length, produced: Math.round(totalProduced * 10) / 10, consumed: Math.round(totalConsumed * 10) / 10, renewableKwh: Math.round(renewableKwh * 10) / 10 },
      economics: { interventions },
      infrastructure: { projects: infraProjects },
      highlights,
    })

  } catch (error) {
    console.error("[API] GET /api/digest:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
