import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Achievements API — computes badges/milestones from user activity
 * All computed server-side from real data, no separate achievements table needed.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const userId = session.user.id

    const [
      claimCount,
      healthCount,
      moodCount,
      journalCount,
      sessionCount,
      studyCount,
      govCount,
      energyCount,
      econCount,
      infraCount,
      wallet,
    ] = await Promise.all([
      prisma.identityClaim.count({ where: { userId } }),
      prisma.healthEntry.count({ where: { userId } }),
      prisma.moodEntry.count({ where: { userId } }),
      prisma.journalEntry.count({ where: { userId } }),
      prisma.lessonSession.count({ where: { userId } }),
      prisma.researchStudy.count({ where: { userId } }),
      prisma.govRecord.count({ where: { userId } }),
      prisma.energyLog.count({ where: { userId } }),
      prisma.econIntervention.count({ where: { userId } }),
      prisma.infraProject.count({ where: { userId } }),
      prisma.wallet.findUnique({ where: { userId }, select: { foundBalance: true, voiceBalance: true, stakedFound: true } }),
    ])

    const foundBalance = wallet ? Number(BigInt(wallet.foundBalance) / 1_000_000n) : 0
    const totalActions = healthCount + moodCount + journalCount + sessionCount + studyCount + govCount + energyCount + econCount + infraCount

    type Badge = { id: string; name: string; description: string; earned: boolean; progress?: number; target?: number; tier: "bronze" | "silver" | "gold" | "platinum" }

    const badges: Badge[] = [
      // Identity
      { id: "first-claim", name: "Identity Established", description: "Add your first identity claim", earned: claimCount >= 1, progress: claimCount, target: 1, tier: "bronze" },
      { id: "full-identity", name: "Full Identity", description: "Add 4+ identity claims", earned: claimCount >= 4, progress: claimCount, target: 4, tier: "silver" },

      // Health
      { id: "first-health", name: "Health Tracker", description: "Log your first health entry", earned: healthCount >= 1, progress: healthCount, target: 1, tier: "bronze" },
      { id: "health-10", name: "Health Committed", description: "Log 10 health entries", earned: healthCount >= 10, progress: healthCount, target: 10, tier: "silver" },
      { id: "health-50", name: "Health Champion", description: "Log 50 health entries", earned: healthCount >= 50, progress: healthCount, target: 50, tier: "gold" },

      // Mental Health
      { id: "first-mood", name: "Self-Aware", description: "Complete your first mood check-in", earned: moodCount >= 1, progress: moodCount, target: 1, tier: "bronze" },
      { id: "mood-14", name: "Two-Week Streak", description: "14 mood check-ins", earned: moodCount >= 14, progress: moodCount, target: 14, tier: "silver" },
      { id: "first-journal", name: "Writer", description: "Write your first journal entry", earned: journalCount >= 1, progress: journalCount, target: 1, tier: "bronze" },
      { id: "journal-10", name: "Chronicler", description: "Write 10 journal entries", earned: journalCount >= 10, progress: journalCount, target: 10, tier: "silver" },

      // Education
      { id: "first-session", name: "Lifelong Learner", description: "Complete your first tutoring session", earned: sessionCount >= 1, progress: sessionCount, target: 1, tier: "bronze" },
      { id: "session-10", name: "Scholar", description: "Complete 10 tutoring sessions", earned: sessionCount >= 10, progress: sessionCount, target: 10, tier: "silver" },
      { id: "session-50", name: "Polymath", description: "Complete 50 tutoring sessions", earned: sessionCount >= 50, progress: sessionCount, target: 50, tier: "gold" },

      // DeSci
      { id: "first-study", name: "Citizen Scientist", description: "Pre-register your first study", earned: studyCount >= 1, progress: studyCount, target: 1, tier: "silver" },
      { id: "study-5", name: "Research Pioneer", description: "Pre-register 5 studies", earned: studyCount >= 5, progress: studyCount, target: 5, tier: "gold" },

      // Governance
      { id: "first-gov", name: "Civic Participant", description: "Add your first governance record", earned: govCount >= 1, progress: govCount, target: 1, tier: "bronze" },
      { id: "gov-10", name: "Watchdog", description: "Track 10 governance records", earned: govCount >= 10, progress: govCount, target: 10, tier: "silver" },

      // Energy
      { id: "first-energy", name: "Energy Tracker", description: "Log your first energy entry", earned: energyCount >= 1, progress: energyCount, target: 1, tier: "bronze" },
      { id: "energy-20", name: "Grid Guardian", description: "Log 20 energy entries", earned: energyCount >= 20, progress: energyCount, target: 20, tier: "silver" },

      // Economics
      { id: "first-econ", name: "Development Analyst", description: "Add your first intervention", earned: econCount >= 1, progress: econCount, target: 1, tier: "bronze" },

      // Infrastructure
      { id: "first-infra", name: "Builder", description: "Add your first infrastructure project", earned: infraCount >= 1, progress: infraCount, target: 1, tier: "bronze" },

      // Token milestones
      { id: "found-100", name: "First Hundred", description: "Earn 100 FOUND tokens", earned: foundBalance >= 100, progress: foundBalance, target: 100, tier: "bronze" },
      { id: "found-500", name: "Rising Star", description: "Earn 500 FOUND tokens", earned: foundBalance >= 500, progress: foundBalance, target: 500, tier: "silver" },
      { id: "found-1000", name: "Power User", description: "Earn 1,000 FOUND tokens", earned: foundBalance >= 1000, progress: foundBalance, target: 1000, tier: "gold" },

      // Cross-module
      { id: "multi-module", name: "Renaissance", description: "Use 5+ different modules", earned: [healthCount, moodCount, sessionCount, studyCount, govCount, energyCount, econCount, infraCount].filter(c => c > 0).length >= 5, tier: "gold" },
      { id: "century", name: "Century Club", description: "100 total actions across all modules", earned: totalActions >= 100, progress: totalActions, target: 100, tier: "platinum" },
    ]

    const earnedCount = badges.filter(b => b.earned).length

    return NextResponse.json({
      badges,
      earned: earnedCount,
      total: badges.length,
      completionPct: Math.round((earnedCount / badges.length) * 100),
    })

  } catch (error) {
    console.error("[API] GET /api/achievements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
