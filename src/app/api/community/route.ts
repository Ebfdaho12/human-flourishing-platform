import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Community API — aggregates platform-wide stats for the community page
 * Only shows anonymized, aggregate data. No individual user data exposed.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [
    totalUsers,
    totalHealthEntries,
    totalMoodEntries,
    totalJournalEntries,
    totalSessions,
    totalStudies,
    publicStudies,
    totalGovRecords,
    totalEnergyLogs,
    totalInterventions,
    totalInfraProjects,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.healthEntry.count(),
    prisma.moodEntry.count(),
    prisma.journalEntry.count(),
    prisma.lessonSession.count(),
    prisma.researchStudy.count(),
    prisma.researchStudy.count({ where: { isPublic: true } }),
    prisma.govRecord.count(),
    prisma.energyLog.count(),
    prisma.econIntervention.count(),
    prisma.infraProject.count(),
  ])

  // Recent public studies for the community feed
  const recentPublicStudies = await prisma.researchStudy.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      field: true,
      status: true,
      hypothesis: true,
      createdAt: true,
      _count: { select: { replications: true, reviews: true } },
    },
  })

  // Aggregate mood data (anonymized average)
  const recentMoods = await prisma.moodEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { score: true },
  })
  const avgCommunityMood = recentMoods.length > 0
    ? Math.round((recentMoods.reduce((s, m) => s + m.score, 0) / recentMoods.length) * 10) / 10
    : null

  // Top subjects studied
  const topSubjects = await prisma.lessonSession.groupBy({
    by: ["subject"],
    _count: { subject: true },
    orderBy: { _count: { subject: "desc" } },
    take: 5,
  })

  return NextResponse.json({
    stats: {
      users: totalUsers,
      healthEntries: totalHealthEntries,
      moodEntries: totalMoodEntries,
      journalEntries: totalJournalEntries,
      tutoringSessions: totalSessions,
      studies: totalStudies,
      publicStudies,
      govRecords: totalGovRecords,
      energyLogs: totalEnergyLogs,
      interventions: totalInterventions,
      infraProjects: totalInfraProjects,
    },
    avgCommunityMood,
    recentPublicStudies,
    topSubjects: topSubjects.map((s) => ({ subject: s.subject, count: s._count.subject })),
  })
}
