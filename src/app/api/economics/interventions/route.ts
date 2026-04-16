import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { awardFound } from "@/lib/tokens"
import { TOKEN_AWARDS } from "@/lib/constants"
import { chat, hasApiKey, NO_KEY_RESPONSE } from "@/lib/ai"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const interventions = await prisma.econIntervention.findMany({
    where: { userId: session.user.id },
    orderBy: [{ roiScore: "desc" }, { createdAt: "desc" }],
  })

  return NextResponse.json({ interventions, hasApiKey })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { title, category, region, costUSD, description, evidenceLevel, timelineYears, beneficiaries } = body

  if (!title || !category || !region || !costUSD || !description) {
    return NextResponse.json({ error: "title, category, region, costUSD, description required" }, { status: 400 })
  }

  let roiScore: number | null = null
  let aiAnalysis: string | null = null

  if (hasApiKey) {
    const system = `You are an evidence-based development economist using the Copenhagen Consensus methodology.
Score interventions on ROI (0-100) considering: evidence quality, cost-effectiveness, scalability, sustainability, and co-benefits.
Reference Lomborg's best-buy interventions as benchmarks (e.g. micronutrient supplementation = ~95, malaria nets = ~90).
Return ONLY a JSON object: {"score": <0-100>, "analysis": "<3-4 sentence rationale>"}`

    try {
      const raw = await chat([{
        role: "user", content: `Score this development intervention:
Title: ${title}
Category: ${category}
Region: ${region}
Cost (USD): ${costUSD}
Description: ${description}
Evidence level: ${evidenceLevel ?? "MEDIUM"}
Timeline: ${timelineYears ?? "Unknown"} years
Beneficiaries: ${beneficiaries ?? "Unknown"}`
      }], system, 512)

      const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim())
      roiScore = Math.min(100, Math.max(0, Math.round(parsed.score)))
      aiAnalysis = parsed.analysis
    } catch {
      aiAnalysis = await chat([{
        role: "user", content: `Evaluate this intervention using Copenhagen Consensus methodology: ${title} in ${region}, cost $${costUSD}. ${description}`
      }], `You are a development economist. Provide a 3-4 sentence evidence-based evaluation.`, 512)
    }
  }

  const intervention = await prisma.econIntervention.create({
    data: {
      userId: session.user.id,
      title, category, region,
      costUSD: parseFloat(costUSD),
      description,
      evidenceLevel: evidenceLevel ?? "MEDIUM",
      roiScore,
      timelineYears: timelineYears ?? null,
      beneficiaries: beneficiaries ?? null,
      aiAnalysis,
    },
  })

  await awardFound(session.user.id, "econ_first_intervention", "ECONOMICS", TOKEN_AWARDS.ECON_FIRST_INTERVENTION, "First intervention added")

  if (roiScore !== null && roiScore >= 80) {
    await awardFound(session.user.id, `econ_high_roi_${intervention.id}`, "ECONOMICS", TOKEN_AWARDS.ECON_HIGH_ROI_FOUND, "High-ROI intervention identified")
  }

  return NextResponse.json({ intervention }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const existing = await prisma.econIntervention.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.econIntervention.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
