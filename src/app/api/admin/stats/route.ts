import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Admin Stats API — platform-wide metrics for the admin dashboard
 *
 * In production: restrict to admin role. For now: any authenticated user.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Admin check — restrict to platform owner
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase())
  if (!adminEmails.includes(session.user.email?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 86400000)
  const monthAgo = new Date(today.getTime() - 30 * 86400000)

  const [
    totalUsers,
    usersToday,
    usersThisWeek,
    usersThisMonth,
    totalHealth,
    healthToday,
    totalMood,
    moodToday,
    totalJournal,
    totalSessions,
    totalStudies,
    totalGovRecords,
    totalEnergy,
    totalInterventions,
    totalInfra,
    totalCases,
    totalProposals,
    totalTransactions,
    totalInsights,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.healthEntry.count(),
    prisma.healthEntry.count({ where: { createdAt: { gte: today } } }),
    prisma.moodEntry.count(),
    prisma.moodEntry.count({ where: { createdAt: { gte: today } } }),
    prisma.journalEntry.count(),
    prisma.lessonSession.count(),
    prisma.researchStudy.count(),
    prisma.govRecord.count(),
    prisma.energyLog.count(),
    prisma.econIntervention.count(),
    prisma.infraProject.count(),
    prisma.healthCase.count(),
    prisma.caseProposal.count(),
    prisma.transaction.count(),
    prisma.aIInsight.count(),
  ])

  // Database size estimate
  const totalRecords = totalHealth + totalMood + totalJournal + totalSessions +
    totalStudies + totalGovRecords + totalEnergy + totalInterventions + totalInfra

  // Growth metrics
  const usersGrowthWeek = usersThisWeek
  const usersGrowthMonth = usersThisMonth

  // Daily active users estimate (users who did something today)
  const activeToday = new Set<string>()
  const recentActivity = await prisma.healthEntry.findMany({
    where: { createdAt: { gte: today } },
    select: { userId: true },
    take: 1000,
  })
  for (const a of recentActivity) activeToday.add(a.userId)
  const moodActivity = await prisma.moodEntry.findMany({
    where: { createdAt: { gte: today } },
    select: { userId: true },
    take: 1000,
  })
  for (const a of moodActivity) activeToday.add(a.userId)

  return NextResponse.json({
    users: {
      total: totalUsers,
      today: usersToday,
      thisWeek: usersGrowthWeek,
      thisMonth: usersGrowthMonth,
      activeToday: activeToday.size,
    },
    content: {
      healthEntries: totalHealth,
      healthToday,
      moodEntries: totalMood,
      moodToday,
      journalEntries: totalJournal,
      tutoringSessions: totalSessions,
      researchStudies: totalStudies,
      govRecords: totalGovRecords,
      energyLogs: totalEnergy,
      interventions: totalInterventions,
      infraProjects: totalInfra,
      healthCases: totalCases,
      caseProposals: totalProposals,
      totalRecords,
    },
    system: {
      transactions: totalTransactions,
      aiInsights: totalInsights,
      dbModels: 25,
      apiRoutes: 45,
    },
    timestamp: now.toISOString(),
  })
}
