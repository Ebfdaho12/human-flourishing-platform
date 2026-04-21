import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse, sanitizeInput } from "@/lib/security"

/**
 * Discussion Rooms API
 * GET — list all rooms with post counts
 * POST — create a post in a room
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const rooms = await prisma.discussionRoom.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { posts: true } },
      },
    })

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("[API] GET /api/community/rooms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!rateLimit(`community:${session.user.id}`, 10, 60000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  const body = await req.json()
  const { roomSlug, content, type, toolLink, sourceUrl, parentId } = body

  if (!roomSlug || !content || content.length < 10) {
    return NextResponse.json({ error: "Room and content (min 10 chars) required" }, { status: 400 })
  }

  if (content.length > 2000) {
    return NextResponse.json({ error: "Content too long (max 2000 chars)" }, { status: 400 })
  }

  try {
    const room = await prisma.discussionRoom.findUnique({ where: { slug: roomSlug } })
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 })

    const post = await prisma.discussionPost.create({
      data: {
        roomId: room.id,
        authorId: session.user.id,
        content: sanitizeInput(content),
        type: type || "DISCUSSION",
        toolLink: toolLink || null,
        sourceUrl: sourceUrl || null,
        parentId: parentId || null,
      },
      include: {
        author: { select: { profile: { select: { displayName: true } } } },
      },
    })

    // Update reply count on parent if this is a reply
    if (parentId) {
      await prisma.discussionPost.update({
        where: { id: parentId },
        data: { replyCount: { increment: 1 } },
      })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("[API] POST /api/community/rooms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
