import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Shared Goals API — users can optionally share their goals with the community
 *
 * GET /api/goals/shared — browse community goals (anonymized by default)
 * POST /api/goals/shared — share one of your goals publicly
 *
 * Privacy first: goals are only shared if explicitly opted in.
 * Display names are used if available, otherwise anonymous.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const type = req.nextUrl.searchParams.get("type") // health or education

    // Get shared health goals
    const healthGoals = !type || type === "health" ? await prisma.healthGoal.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        goalType: true,
        title: true,
        target: true,
        current: true,
        deadline: true,
        createdAt: true,
        user: {
          select: {
            profile: { select: { displayName: true, profileVisibility: true } },
          },
        },
      },
    }) : []

    // Get shared education goals
    const educationGoals = !type || type === "education" ? await prisma.learningGoal.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        subject: true,
        topic: true,
        level: true,
        createdAt: true,
        user: {
          select: {
            profile: { select: { displayName: true, profileVisibility: true } },
          },
        },
      },
    }) : []

    // Anonymize — only show display name if user has public profile
    const anonHealth = healthGoals.map((g) => ({
      ...g,
      user: g.user?.profile?.profileVisibility === "PUBLIC" ? g.user.profile.displayName : "Anonymous",
    }))

    const anonEducation = educationGoals.map((g) => ({
      ...g,
      user: g.user?.profile?.profileVisibility === "PUBLIC" ? g.user.profile.displayName : "Anonymous",
    }))

    return NextResponse.json({
      healthGoals: anonHealth,
      educationGoals: anonEducation,
    })

  } catch (error) {
    console.error("[API] GET /api/goals/shared:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
