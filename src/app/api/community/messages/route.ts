import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse, sanitizeInput } from "@/lib/security"

/**
 * Direct Messages API
 * GET — list conversations (grouped by partner)
 * GET ?with=userId — get messages with specific user
 * POST — send a message
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const withUser = req.nextUrl.searchParams.get("with")

  if (withUser) {
    // Get messages with specific user
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: withUser },
          { senderId: withUser, receiverId: session.user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: {
        sender: { select: { profile: { select: { displayName: true } } } },
      },
    })

    // Mark unread messages as read
    await prisma.directMessage.updateMany({
      where: { senderId: withUser, receiverId: session.user.id, read: false },
      data: { read: true, readAt: new Date() },
    })

    return NextResponse.json({ messages })
  }

  // List all conversations (latest message per partner)
  const sent = await prisma.directMessage.findMany({
    where: { senderId: session.user.id },
    select: { receiverId: true, createdAt: true, content: true },
    orderBy: { createdAt: "desc" },
  })

  const received = await prisma.directMessage.findMany({
    where: { receiverId: session.user.id },
    select: { senderId: true, createdAt: true, content: true, read: true },
    orderBy: { createdAt: "desc" },
  })

  // Build unique conversation list
  const convos = new Map<string, { partnerId: string; lastMessage: string; lastAt: Date; unread: number }>()

  for (const m of sent) {
    if (!convos.has(m.receiverId)) {
      convos.set(m.receiverId, { partnerId: m.receiverId, lastMessage: m.content.substring(0, 50), lastAt: m.createdAt, unread: 0 })
    }
  }
  for (const m of received) {
    const existing = convos.get(m.senderId)
    if (!existing || m.createdAt > existing.lastAt) {
      convos.set(m.senderId, {
        partnerId: m.senderId,
        lastMessage: m.content.substring(0, 50),
        lastAt: m.createdAt,
        unread: (existing?.unread || 0) + (!m.read ? 1 : 0),
      })
    } else if (!m.read) {
      existing.unread++
    }
  }

  // Get partner profiles
  const partnerIds = [...convos.keys()]
  const partners = await prisma.user.findMany({
    where: { id: { in: partnerIds } },
    select: { id: true, profile: { select: { displayName: true } } },
  })

  const conversations = [...convos.values()]
    .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime())
    .map(c => ({
      ...c,
      partnerName: partners.find(p => p.id === c.partnerId)?.profile?.displayName || "User",
    }))

  return NextResponse.json({ conversations })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!rateLimit(`dm:${session.user.id}`, 20, 60000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  const body = await req.json()
  const { receiverId, content } = body

  if (!receiverId || !content || content.length < 1) {
    return NextResponse.json({ error: "receiverId and content required" }, { status: 400 })
  }

  if (content.length > 2000) {
    return NextResponse.json({ error: "Message too long (max 2000)" }, { status: 400 })
  }

  // Verify receiver exists
  const receiver = await prisma.user.findUnique({ where: { id: receiverId } })
  if (!receiver) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const message = await prisma.directMessage.create({
    data: {
      senderId: session.user.id,
      receiverId,
      content: sanitizeInput(content),
    },
  })

  return NextResponse.json({ message })
}
