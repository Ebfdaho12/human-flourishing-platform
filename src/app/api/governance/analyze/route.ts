import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { chat, hasApiKey, NO_KEY_RESPONSE } from "@/lib/ai"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { recordId } = await req.json()
  if (!recordId) return NextResponse.json({ error: "recordId required" }, { status: 400 })

  try {

    const record = await prisma.govRecord.findFirst({ where: { id: recordId, userId: session.user.id } })
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (!hasApiKey) {
      return NextResponse.json({ analysis: NO_KEY_RESPONSE, hasApiKey: false })
    }

    const system = `You are a strictly neutral political analyst for the Human Flourishing Platform.
  Your role: produce factual, balanced analysis with ZERO partisan bias.
  Rules:
  - Never use loaded language (radical, extreme, progressive, conservative, etc.)
  - State facts only — votes, positions, funding sources, outcomes
  - If presenting criticism, present equal criticism from all sides
  - Flag when data is incomplete or unverified
  - Keep analysis to 3-5 sentences`

    const data = JSON.parse(record.data || "{}")
    const userMsg = `Provide a strictly neutral factual analysis of this governance record:
  Type: ${record.entityType}
  Title: ${record.title}
  Jurisdiction: ${record.jurisdiction ?? "Unknown"}
  Party: ${record.party ?? "Unknown"}
  Office: ${record.office ?? "Unknown"}
  Data: ${JSON.stringify(data)}
  Notes: ${record.notes ?? "None"}`

    const analysis = await chat([{ role: "user", content: userMsg }], system, 512)

    await prisma.govRecord.update({ where: { id: recordId }, data: { aiAnalysis: analysis } })

    return NextResponse.json({ analysis, hasApiKey: true })

  } catch (error) {
    console.error("[API] POST /api/governance/analyze:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
