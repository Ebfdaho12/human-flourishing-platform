import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Bookmarks API — save anything for later
 *
 * Users can bookmark pages, resources, Aletheia figures, narratives,
 * or any URL they want to return to.
 *
 * GET /api/bookmarks — list bookmarks
 * POST /api/bookmarks — add bookmark
 * DELETE /api/bookmarks?id=xxx — remove bookmark
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const bookmarks = await prisma.moduleActivity.findMany({
    where: { userId: session.user.id, moduleId: "BOOKMARK" },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json({
    bookmarks: bookmarks.map(b => ({
      id: b.id,
      ...JSON.parse(b.metadata ?? "{}"),
      createdAt: b.createdAt,
    })),
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, url, note, category } = await req.json()
  if (!title || !url) return NextResponse.json({ error: "title and url required" }, { status: 400 })

  await prisma.moduleActivity.create({
    data: {
      userId: session.user.id,
      moduleId: "BOOKMARK",
      activityKey: `bookmark:${Date.now()}`,
      metadata: JSON.stringify({ title, url, note, category: category ?? "general" }),
    },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const bookmark = await prisma.moduleActivity.findUnique({ where: { id } })
  if (!bookmark || bookmark.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.moduleActivity.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
