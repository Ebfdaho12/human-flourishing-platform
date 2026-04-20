import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse, sanitizeInput } from "@/lib/security"

/**
 * Accountability Partners API
 * GET — list your partnerships
 * POST — create a partnership (by email)
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const partnerships = await prisma.accountabilityPartner.findMany({
    where: {
      OR: [{ userId: session.user.id }, { partnerId: session.user.id }],
      status: "ACTIVE",
    },
    include: {
      user: { select: { id: true, profile: { select: { displayName: true } } } },
      partner: { select: { id: true, profile: { select: { displayName: true } } } },
      checkIns: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  })

  return NextResponse.json({ partnerships })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!rateLimit(`partner:${session.user.id}`, 5, 300000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  const body = await req.json()
  const { partnerEmail, goal } = body

  if (!partnerEmail || !goal) {
    return NextResponse.json({ error: "Partner email and goal required" }, { status: 400 })
  }

  const partner = await prisma.user.findUnique({ where: { email: partnerEmail.toLowerCase().trim() } })
  if (!partner) return NextResponse.json({ error: "No user found with that email. They need to register first." }, { status: 404 })
  if (partner.id === session.user.id) return NextResponse.json({ error: "You cannot partner with yourself" }, { status: 400 })

  // Check for existing partnership
  const existing = await prisma.accountabilityPartner.findFirst({
    where: {
      OR: [
        { userId: session.user.id, partnerId: partner.id },
        { userId: partner.id, partnerId: session.user.id },
      ],
      status: "ACTIVE",
    },
  })
  if (existing) return NextResponse.json({ error: "You already have an active partnership with this person" }, { status: 400 })

  const partnership = await prisma.accountabilityPartner.create({
    data: {
      userId: session.user.id,
      partnerId: partner.id,
      goal: sanitizeInput(goal),
    },
  })

  return NextResponse.json({ partnership })
}
