import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sanitizeInput } from "@/lib/security"

/**
 * Feedback Response API — admin responds to user feedback
 *
 * POST — respond to feedback (admin only)
 * Updates the feedback metadata with: status, response, reward
 * Awards FOUND tokens to the user based on feedback value
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Admin check
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase())
  if (!adminEmails.includes(session.user.email?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 })
  }

  const body = await req.json()
  const { feedbackId, status, response, rewardLevel } = body

  if (!feedbackId || !status) {
    return NextResponse.json({ error: "feedbackId and status required" }, { status: 400 })
  }

  // Valid statuses
  const validStatuses = ["RECEIVED", "IN_PROGRESS", "FIXED", "IMPLEMENTED", "WONT_FIX", "DUPLICATE"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Status must be one of: ${validStatuses.join(", ")}` }, { status: 400 })
  }

  // Get the original feedback
  const feedback = await prisma.moduleActivity.findUnique({
    where: { id: feedbackId },
    include: { user: true },
  })

  if (!feedback || feedback.moduleId !== "FEEDBACK") {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
  }

  // Parse existing metadata and add response
  const existingMeta = typeof feedback.metadata === "string"
    ? JSON.parse(feedback.metadata)
    : feedback.metadata || {}

  // Reward levels: 0 = no reward, 1 = minor (25 FOUND), 2 = helpful (100 FOUND),
  // 3 = significant (250 FOUND), 4 = critical (500 FOUND)
  const REWARD_AMOUNTS: Record<number, number> = { 0: 0, 1: 25, 2: 100, 3: 250, 4: 500 }
  const rewardAmount = REWARD_AMOUNTS[rewardLevel ?? 0] || 0

  const updatedMeta = {
    ...existingMeta,
    status,
    adminResponse: response ? sanitizeInput(response) : undefined,
    respondedAt: new Date().toISOString(),
    respondedBy: session.user.email,
    rewardLevel: rewardLevel ?? 0,
    rewardAmount,
    notifiedUser: false, // will be set to true when user sees it
  }

  // Update the feedback record
  await prisma.moduleActivity.update({
    where: { id: feedbackId },
    data: { metadata: JSON.stringify(updatedMeta) },
  })

  // Award FOUND tokens if reward > 0
  if (rewardAmount > 0 && feedback.userId) {
    const wallet = await prisma.wallet.findUnique({ where: { userId: feedback.userId } })
    if (wallet) {
      const currentBalance = BigInt(wallet.foundBalance)
      const reward = BigInt(rewardAmount) * 1000000n // FOUND has 6 decimal places
      await prisma.wallet.update({
        where: { userId: feedback.userId },
        data: { foundBalance: (currentBalance + reward).toString() },
      })

      // Log the reward transaction
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: "FEEDBACK_REWARD",
          amount: reward.toString(),
          description: `Feedback reward: ${rewardAmount} FOUND for ${status === "FIXED" ? "bug report" : status === "IMPLEMENTED" ? "feature request" : "feedback"} (${existingMeta.title || "untitled"})`,
        },
      })
    }
  }

  return NextResponse.json({
    success: true,
    status,
    rewardAmount,
    message: `Feedback ${status.toLowerCase()}. ${rewardAmount > 0 ? `${rewardAmount} FOUND awarded.` : ""}`,
  })
}
