import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { auditLog } from "@/lib/audit"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    // Fetch all user-related data in parallel
    const [
      user,
      profile,
      claims,
      wallet,
      moduleActivity,
      moduleInterests,
      healthEntries,
      healthGoals,
      aiInsights,
      moodEntries,
      journalEntries,
      learningGoals,
      lessonSessions,
      govRecords,
      researchStudies,
      replications,
      peerReviews,
      econInterventions,
      infraProjects,
      energyLogs,
      healthCases,
      caseProposals,
      sentMessages,
      receivedMessages,
      accountabilityAsUser,
      accountabilityAsPartner,
      familyMemberships,
      familyMessages,
      discussionPosts,
      cohortMemberships,
      cohortMessages,
      insights,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          didIdentifier: true,
          merkleRoot: true,
          publicKeyHint: true,
        },
      }),
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.identityClaim.findMany({ where: { userId } }),
      prisma.wallet.findUnique({
        where: { userId },
        include: {
          transactions: true,
          stakingEvents: true,
        },
      }),
      prisma.moduleActivity.findMany({ where: { userId } }),
      prisma.moduleInterest.findMany({ where: { userId } }),
      prisma.healthEntry.findMany({ where: { userId } }),
      prisma.healthGoal.findMany({ where: { userId } }),
      prisma.aIInsight.findMany({ where: { userId } }),
      prisma.moodEntry.findMany({ where: { userId } }),
      prisma.journalEntry.findMany({ where: { userId } }),
      prisma.learningGoal.findMany({ where: { userId } }),
      prisma.lessonSession.findMany({ where: { userId } }),
      prisma.govRecord.findMany({ where: { userId } }),
      prisma.researchStudy.findMany({
        where: { userId },
        include: { replications: true, reviews: true },
      }),
      prisma.replication.findMany({ where: { userId } }),
      prisma.peerReview.findMany({ where: { userId } }),
      prisma.econIntervention.findMany({ where: { userId } }),
      prisma.infraProject.findMany({ where: { userId } }),
      prisma.energyLog.findMany({ where: { userId } }),
      prisma.healthCase.findMany({
        where: { userId },
        include: { proposals: true },
      }),
      prisma.caseProposal.findMany({ where: { practitionerId: userId } }),
      prisma.directMessage.findMany({ where: { senderId: userId } }),
      prisma.directMessage.findMany({ where: { receiverId: userId } }),
      prisma.accountabilityPartner.findMany({
        where: { userId },
        include: { checkIns: true },
      }),
      prisma.accountabilityPartner.findMany({
        where: { partnerId: userId },
        include: { checkIns: true },
      }),
      prisma.familyMember.findMany({ where: { userId } }),
      prisma.familyMessage.findMany({ where: { senderId: userId } }),
      prisma.discussionPost.findMany({ where: { authorId: userId } }),
      prisma.cohortMember.findMany({ where: { userId } }),
      prisma.cohortMessage.findMany({ where: { senderId: userId } }),
      prisma.insight.findMany({ where: { authorId: userId } }),
    ])

    const exportData = {
      exportedAt: new Date().toISOString(),
      gdprExport: true,
      user,
      profile,
      identityClaims: claims,
      wallet,
      moduleActivity,
      moduleInterests,
      healthEntries,
      healthGoals,
      aiInsights,
      moodEntries,
      journalEntries,
      learningGoals,
      lessonSessions,
      govRecords,
      researchStudies,
      replications,
      peerReviews,
      econInterventions,
      infraProjects,
      energyLogs,
      healthCases,
      caseProposals,
      sentMessages,
      receivedMessages,
      accountabilityPartnerships: [
        ...accountabilityAsUser,
        ...accountabilityAsPartner,
      ],
      familyMemberships,
      familyMessages,
      discussionPosts,
      cohortMemberships,
      cohortMessages,
      insights,
    }

    // Serialize BigInt values to strings for JSON compatibility
    const jsonString = JSON.stringify(exportData, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value,
      2
    )

    auditLog({ userId, action: "EXPORT", resource: "profile" })

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="hfp-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("[API] GET /api/user/export:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
