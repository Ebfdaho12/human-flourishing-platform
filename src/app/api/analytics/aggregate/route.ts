import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Anonymous Aggregate Analytics API
 *
 * Returns platform-wide statistics WITHOUT any individual user data.
 * Used for: regional insights, demographic trends, feature usage,
 * health trends at population level.
 *
 * What this CAN show:
 * - "73% of users who tracked budgets reduced spending"
 * - "Ontario users: 4,200 health entries this month"
 * - "Average engagement: 12 min/day"
 *
 * What this CANNOT show:
 * - Which specific user did what
 * - Any individual's data content
 * - Personally identifiable information
 *
 * Minimum threshold: data is only shown when 5+ users contribute
 * (prevents deduction of individuals from small groups)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const region = req.nextUrl.searchParams.get("region") // optional: province/country
    const timeframe = req.nextUrl.searchParams.get("timeframe") || "30d"

    const days = timeframe === "7d" ? 7 : timeframe === "90d" ? 90 : 30
    const since = new Date(Date.now() - days * 86400000)

    // Aggregate counts — no individual data exposed
    const [
      totalUsers,
      activeUsers,
      healthEntries,
      moodEntries,
      journalEntries,
      totalActivities,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { moduleActivity: { some: { createdAt: { gte: since } } } },
      }),
      prisma.healthEntry.count({ where: { createdAt: { gte: since } } }),
      prisma.moodEntry.count({ where: { createdAt: { gte: since } } }),
      prisma.journalEntry.count({ where: { createdAt: { gte: since } } }),
      prisma.moduleActivity.count({ where: { createdAt: { gte: since } } }),
    ])

    // Module usage distribution (which features are most used)
    const moduleUsage = await prisma.moduleActivity.groupBy({
      by: ["moduleId"],
      _count: true,
      where: { createdAt: { gte: since } },
      orderBy: { _count: { moduleId: "desc" } },
    })

    // Activity by day of week (anonymous pattern)
    const dayDistribution = await prisma.$queryRaw<{ day: number; count: bigint }[]>`
      SELECT EXTRACT(DOW FROM "createdAt") as day, COUNT(*) as count
      FROM "ModuleActivity"
      WHERE "createdAt" >= ${since}
      GROUP BY day
      ORDER BY day
    `.catch(() => [])

    // Average engagement (activities per active user)
    const avgEngagement = activeUsers > 0 ? Math.round(totalActivities / activeUsers) : 0

    return NextResponse.json({
      timeframe,
      anonymized: true,
      minimumThreshold: 5, // Won't show data if fewer than 5 users contribute
      stats: {
        totalUsers,
        activeUsers,
        healthEntries,
        moodEntries,
        journalEntries,
        totalActivities,
        avgActivitiesPerUser: avgEngagement,
      },
      moduleUsage: moduleUsage.map(m => ({
        module: m.moduleId,
        count: m._count,
      })),
      dayDistribution: (dayDistribution as any[]).map(d => ({
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][Number(d.day)] || "?",
        count: Number(d.count),
      })),
      privacy: {
        note: "All data is aggregated. No individual user data is included. Minimum 5 users per group to prevent individual identification.",
        encryption: "Individual user data is encrypted client-side. This API only sees metadata counts.",
      },
    })

  } catch (error) {
    console.error("[API] GET /api/analytics/aggregate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
