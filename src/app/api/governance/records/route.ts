import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { awardFound } from "@/lib/tokens"
import { TOKEN_AWARDS } from "@/lib/constants"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")

  const records = await prisma.govRecord.findMany({
    where: {
      userId: session.user.id,
      ...(type ? { entityType: type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json({ records })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { entityType, title, jurisdiction, party, office, data, sourceUrl, notes } = body

  if (!entityType || !title) {
    return NextResponse.json({ error: "entityType and title are required" }, { status: 400 })
  }

  const record = await prisma.govRecord.create({
    data: {
      userId: session.user.id,
      entityType,
      title,
      jurisdiction: jurisdiction ?? null,
      party: party ?? null,
      office: office ?? null,
      data: JSON.stringify(data ?? {}),
      sourceUrl: sourceUrl ?? null,
      notes: notes ?? null,
    },
  })

  await awardFound(session.user.id, "gov_first_record", "GOVERNANCE", TOKEN_AWARDS.GOV_FIRST_RECORD, "First governance record")

  if (entityType === "CIVIC_ACTION") {
    const count = await prisma.govRecord.count({
      where: { userId: session.user.id, entityType: "CIVIC_ACTION" },
    })
    await awardFound(
      session.user.id,
      `gov_civic_${count}`,
      "GOVERNANCE",
      TOKEN_AWARDS.GOV_CIVIC_ACTION,
      "Civic action recorded"
    )
  }

  return NextResponse.json({ record }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const existing = await prisma.govRecord.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.govRecord.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
