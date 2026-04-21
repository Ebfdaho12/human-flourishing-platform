import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse } from "@/lib/security"

/**
 * Posts API
 * GET ?room=slug — get posts for a room
 * POST — vote on a post
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const roomSlug = req.nextUrl.searchParams.get("room")
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1")
  const limit = 20

  if (!roomSlug) return NextResponse.json({ error: "Room slug required" }, { status: 400 })

  try {
    const room = await prisma.discussionRoom.findUnique({ where: { slug: roomSlug } })
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 })

    const posts = await prisma.discussionPost.findMany({
      where: { roomId: room.id, parentId: null }, // top-level posts only
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { profile: { select: { displayName: true } } } },
        replies: {
          take: 3,
          orderBy: { upvotes: "desc" },
          include: { author: { select: { profile: { select: { displayName: true } } } } },
        },
        votes: { where: { userId: session.user.id }, select: { value: true } },
      },
    })

    const total = await prisma.discussionPost.count({ where: { roomId: room.id, parentId: null } })

    return NextResponse.json({ room, posts, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error("[API] GET /api/community/posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!rateLimit(`vote:${session.user.id}`, 30, 60000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  const body = await req.json()
  const { postId, value } = body // value: 1 or -1

  if (!postId || (value !== 1 && value !== -1)) {
    return NextResponse.json({ error: "postId and value (1 or -1) required" }, { status: 400 })
  }

  try {
    // Upsert vote
    const existing = await prisma.postVote.findUnique({
      where: { postId_userId: { postId, userId: session.user.id } },
    })

    if (existing) {
      if (existing.value === value) {
        // Remove vote (toggle off)
        await prisma.postVote.delete({ where: { id: existing.id } })
        await prisma.discussionPost.update({
          where: { id: postId },
          data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
        })
      } else {
        // Change vote
        await prisma.postVote.update({ where: { id: existing.id }, data: { value } })
        await prisma.discussionPost.update({
          where: { id: postId },
          data: value === 1
            ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
            : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
        })
      }
    } else {
      await prisma.postVote.create({ data: { postId, userId: session.user.id, value } })
      await prisma.discussionPost.update({
        where: { id: postId },
        data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] POST /api/community/posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
