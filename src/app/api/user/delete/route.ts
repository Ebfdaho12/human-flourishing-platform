import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const CONFIRMATION_PHRASE = "DELETE MY ACCOUNT"

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const body = await req.json()

    if (body?.confirm !== CONFIRMATION_PHRASE) {
      return NextResponse.json(
        {
          error: "Confirmation required",
          message: `You must include { "confirm": "${CONFIRMATION_PHRASE}" } in the request body to proceed. This action is IRREVERSIBLE.`,
        },
        { status: 400 }
      )
    }

    // Delete all user data in a transaction
    // Order matters: delete dependent records before the user
    await prisma.$transaction(async (tx) => {
      // Find wallet to delete transactions/staking events
      const wallet = await tx.wallet.findUnique({ where: { userId } })
      if (wallet) {
        await tx.transaction.deleteMany({ where: { walletId: wallet.id } })
        await tx.stakingEvent.deleteMany({ where: { walletId: wallet.id } })
        await tx.wallet.delete({ where: { userId } })
      }

      // Delete accountability check-ins via partnerships
      const partnerships = await tx.accountabilityPartner.findMany({
        where: { OR: [{ userId }, { partnerId: userId }] },
        select: { id: true },
      })
      const partnershipIds = partnerships.map((p) => p.id)
      if (partnershipIds.length > 0) {
        await tx.partnerCheckIn.deleteMany({
          where: { partnershipId: { in: partnershipIds } },
        })
      }
      await tx.accountabilityPartner.deleteMany({
        where: { OR: [{ userId }, { partnerId: userId }] },
      })

      // Delete case proposals (as practitioner)
      await tx.caseProposal.deleteMany({ where: { practitionerId: userId } })

      // Delete health cases and their proposals
      const healthCases = await tx.healthCase.findMany({
        where: { userId },
        select: { id: true },
      })
      const caseIds = healthCases.map((c) => c.id)
      if (caseIds.length > 0) {
        await tx.caseProposal.deleteMany({ where: { caseId: { in: caseIds } } })
      }
      await tx.healthCase.deleteMany({ where: { userId } })

      // Delete research-related (replications, peer reviews, then studies)
      await tx.replication.deleteMany({ where: { userId } })
      await tx.peerReview.deleteMany({ where: { userId } })
      // Also delete replications/reviews ON user's studies
      const studies = await tx.researchStudy.findMany({
        where: { userId },
        select: { id: true },
      })
      const studyIds = studies.map((s) => s.id)
      if (studyIds.length > 0) {
        await tx.replication.deleteMany({ where: { studyId: { in: studyIds } } })
        await tx.peerReview.deleteMany({ where: { studyId: { in: studyIds } } })
      }
      await tx.researchStudy.deleteMany({ where: { userId } })

      // Delete discussion post votes, then posts
      const posts = await tx.discussionPost.findMany({
        where: { authorId: userId },
        select: { id: true },
      })
      const postIds = posts.map((p) => p.id)
      if (postIds.length > 0) {
        await tx.postVote.deleteMany({ where: { postId: { in: postIds } } })
      }
      await tx.discussionPost.deleteMany({ where: { authorId: userId } })

      // Delete insight votes, then insights
      const userInsights = await tx.insight.findMany({
        where: { authorId: userId },
        select: { id: true },
      })
      const insightIds = userInsights.map((i) => i.id)
      if (insightIds.length > 0) {
        await tx.insightVote.deleteMany({ where: { insightId: { in: insightIds } } })
      }
      await tx.insight.deleteMany({ where: { authorId: userId } })

      // Delete votes the user cast on other content
      await tx.postVote.deleteMany({ where: { userId } })
      await tx.insightVote.deleteMany({ where: { userId } })

      // Delete social/messaging data
      await tx.directMessage.deleteMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      })
      await tx.familyMessage.deleteMany({ where: { senderId: userId } })
      await tx.familyMember.deleteMany({ where: { userId } })
      await tx.cohortMessage.deleteMany({ where: { senderId: userId } })
      await tx.cohortMember.deleteMany({ where: { userId } })

      // Delete all direct user-owned records
      await tx.identityClaim.deleteMany({ where: { userId } })
      await tx.moduleActivity.deleteMany({ where: { userId } })
      await tx.moduleInterest.deleteMany({ where: { userId } })
      await tx.healthEntry.deleteMany({ where: { userId } })
      await tx.healthGoal.deleteMany({ where: { userId } })
      await tx.aIInsight.deleteMany({ where: { userId } })
      await tx.moodEntry.deleteMany({ where: { userId } })
      await tx.journalEntry.deleteMany({ where: { userId } })
      await tx.learningGoal.deleteMany({ where: { userId } })
      await tx.lessonSession.deleteMany({ where: { userId } })
      await tx.govRecord.deleteMany({ where: { userId } })
      await tx.econIntervention.deleteMany({ where: { userId } })
      await tx.infraProject.deleteMany({ where: { userId } })
      await tx.energyLog.deleteMany({ where: { userId } })
      await tx.emailVerification.deleteMany({ where: { userId } })

      // Delete profile
      await tx.userProfile.deleteMany({ where: { userId } })

      // Finally, delete the user
      await tx.user.delete({ where: { id: userId } })
    })

    return NextResponse.json({
      success: true,
      message: "Your account and all associated data have been permanently deleted. This action cannot be undone.",
    })
  } catch (error) {
    console.error("[API] DELETE /api/user/delete:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
