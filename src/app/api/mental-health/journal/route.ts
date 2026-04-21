import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { awardFound } from "@/lib/tokens"
import { TOKEN_AWARDS } from "@/lib/constants"
import { auditLog } from "@/lib/audit"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100)
    const offset = parseInt(searchParams.get("offset") ?? "0")

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          content: true,
          mood: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.journalEntry.count({ where: { userId: session.user.id } }),
    ])

    const parsed = entries.map((e) => ({
      ...e,
      tags: e.tags ? JSON.parse(e.tags) : [],
    }))

    return NextResponse.json({ entries: parsed, total })
  } catch (error) {
    console.error("[API] GET /api/mental-health/journal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { title, content, mood, tags } = body

    if (!content || content.trim().length < 1) {
      return NextResponse.json({ error: "content is required" }, { status: 400 })
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        title: title?.trim() || null,
        content: content.trim(),
        mood: mood ?? null,
        tags: tags ? JSON.stringify(tags) : null,
      },
    })

    // First journal entry reward
    await awardFound(
      session.user.id,
      "journal_first_entry",
      "MENTAL_HEALTH",
      TOKEN_AWARDS.JOURNAL_FIRST_ENTRY,
      "First journal entry"
    )

    // 10 entries milestone
    const count = await prisma.journalEntry.count({ where: { userId: session.user.id } })
    if (count >= 10) {
      await awardFound(
        session.user.id,
        "journal_ten_entries",
        "MENTAL_HEALTH",
        TOKEN_AWARDS.JOURNAL_TEN_ENTRIES,
        "10 journal entries milestone"
      )
    }

    auditLog({ userId: session.user.id, action: "CREATE", resource: "journal", resourceId: entry.id })

    return NextResponse.json({ entry: { ...entry, tags: entry.tags ? JSON.parse(entry.tags) : [] } }, { status: 201 })
  } catch (error) {
    console.error("[API] POST /api/mental-health/journal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { entryId, title, content, mood, tags } = body

    if (!entryId) return NextResponse.json({ error: "entryId required" }, { status: 400 })

    const existing = await prisma.journalEntry.findFirst({
      where: { id: entryId, userId: session.user.id },
    })
    if (!existing) return NextResponse.json({ error: "Entry not found" }, { status: 404 })

    const entry = await prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        ...(title !== undefined ? { title: title?.trim() || null } : {}),
        ...(content !== undefined ? { content: content.trim() } : {}),
        ...(mood !== undefined ? { mood } : {}),
        ...(tags !== undefined ? { tags: JSON.stringify(tags) } : {}),
      },
    })

    auditLog({ userId: session.user.id, action: "UPDATE", resource: "journal", resourceId: entry.id })

    return NextResponse.json({ entry: { ...entry, tags: entry.tags ? JSON.parse(entry.tags) : [] } })
  } catch (error) {
    console.error("[API] PATCH /api/mental-health/journal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const entryId = searchParams.get("entryId")
    if (!entryId) return NextResponse.json({ error: "entryId required" }, { status: 400 })

    const existing = await prisma.journalEntry.findFirst({
      where: { id: entryId, userId: session.user.id },
    })
    if (!existing) return NextResponse.json({ error: "Entry not found" }, { status: 404 })

    await prisma.journalEntry.delete({ where: { id: entryId } })

    auditLog({ userId: session.user.id, action: "DELETE", resource: "journal", resourceId: entryId })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[API] DELETE /api/mental-health/journal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
