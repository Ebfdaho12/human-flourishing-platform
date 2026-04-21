import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse, sanitizeInput } from "@/lib/security"
import { auditLog } from "@/lib/audit"

/**
 * Family Groups API
 * GET — list your family groups
 * POST — create a family group or join via invite code
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const memberships = await prisma.familyMember.findMany({
      where: { userId: session.user.id },
      include: {
        group: {
          include: {
            members: { include: { user: { select: { id: true, profile: { select: { displayName: true } } } } } },
            messages: { orderBy: { createdAt: "desc" }, take: 10, include: { sender: { select: { profile: { select: { displayName: true } } } } } },
            _count: { select: { members: true, messages: true } },
          },
        },
      },
    })

    return NextResponse.json({ groups: memberships.map(m => ({ ...m.group, role: m.role })) })

  } catch (error) {
    console.error("[API] GET /api/community/family:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!rateLimit(`family:${session.user.id}`, 5, 300000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  try {
  const body = await req.json()
  const { action, name, inviteCode, message, groupId, type } = body

  if (action === "create") {
    if (!name) return NextResponse.json({ error: "Group name required" }, { status: 400 })

    const group = await prisma.familyGroup.create({
      data: {
        name: sanitizeInput(name),
        createdBy: session.user.id,
        members: { create: { userId: session.user.id, role: "ADMIN" } },
      },
    })
    auditLog({ userId: session.user.id, action: "CREATE", resource: "family_group", resourceId: group.id })
    return NextResponse.json({ group })
  }

  if (action === "join") {
    if (!inviteCode) return NextResponse.json({ error: "Invite code required" }, { status: 400 })

    const group = await prisma.familyGroup.findUnique({ where: { inviteCode } })
    if (!group) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 })

    const existing = await prisma.familyMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId: session.user.id } },
    })
    if (existing) return NextResponse.json({ error: "Already a member" }, { status: 400 })

    await prisma.familyMember.create({ data: { groupId: group.id, userId: session.user.id } })
    return NextResponse.json({ group })
  }

  if (action === "message") {
    if (!groupId || !message) return NextResponse.json({ error: "groupId and message required" }, { status: 400 })

    // Verify membership
    const member = await prisma.familyMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
    })
    if (!member) return NextResponse.json({ error: "Not a member of this group" }, { status: 403 })

    const msg = await prisma.familyMessage.create({
      data: {
        groupId,
        senderId: session.user.id,
        content: sanitizeInput(message),
        type: type || "TEXT",
      },
    })
    auditLog({ userId: session.user.id, action: "CREATE", resource: "family_message", resourceId: msg.id })
    return NextResponse.json({ message: msg })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[API] POST /api/community/family:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
