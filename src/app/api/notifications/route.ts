import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Notifications API — generates contextual notifications from user activity
 *
 * In production: sends emails via Resend for streak reminders, case proposals, etc.
 * For now: computes and returns notifications for the UI.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id
  const notifications: { id: string; type: string; title: string; message: string; action?: string; read: boolean }[] = []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if user has logged health today
  const healthToday = await prisma.healthEntry.count({ where: { userId, createdAt: { gte: today } } })
  if (healthToday === 0) {
    notifications.push({
      id: "health-reminder",
      type: "REMINDER",
      title: "Health check-in",
      message: "You haven't logged any health data today. Keep your streak alive!",
      action: "/health",
      read: false,
    })
  }

  // Check mood check-in
  const moodToday = await prisma.moodEntry.count({ where: { userId, createdAt: { gte: today } } })
  if (moodToday === 0) {
    notifications.push({
      id: "mood-reminder",
      type: "REMINDER",
      title: "Mood check-in",
      message: "How are you feeling today? A quick check-in takes 30 seconds.",
      action: "/mental-health",
      read: false,
    })
  }

  // Check for unread case proposals
  const casesWithProposals = await prisma.healthCase.findMany({
    where: { userId },
    include: { proposals: { where: { status: "PENDING" } } },
  })
  const pendingProposals = casesWithProposals.reduce((s, c) => s + c.proposals.length, 0)
  if (pendingProposals > 0) {
    notifications.push({
      id: "case-proposals",
      type: "ACTION",
      title: "New treatment proposals",
      message: `You have ${pendingProposals} pending proposal${pendingProposals > 1 ? "s" : ""} from practitioners.`,
      action: "/health/cases",
      read: false,
    })
  }

  // Check for unread AI insights
  const unreadInsights = await prisma.aIInsight.count({ where: { userId, isRead: false } })
  if (unreadInsights > 0) {
    notifications.push({
      id: "ai-insights",
      type: "INFO",
      title: "New AI insights",
      message: `${unreadInsights} new insight${unreadInsights > 1 ? "s" : ""} ready to review.`,
      action: "/health",
      read: false,
    })
  }

  // Milestone notifications
  const totalEntries = await prisma.healthEntry.count({ where: { userId } })
  const milestone = totalEntries >= 100 ? 100 : totalEntries >= 50 ? 50 : totalEntries >= 10 ? 10 : 0
  if (milestone > 0) {
    notifications.push({
      id: `milestone-${milestone}`,
      type: "CELEBRATION",
      title: `${milestone}+ health entries!`,
      message: `You've logged ${totalEntries} health entries. Consistency is key.`,
      read: false,
    })
  }

  return NextResponse.json({ notifications, count: notifications.length })
}
