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

  const projects = await prisma.infraProject.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ projects, hasApiKey })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, projectType, location, climateZone, budgetUSD, lifespanYears, qualityTier, specs } = body

  if (!name || !projectType || !location) {
    return NextResponse.json({ error: "name, projectType, and location are required" }, { status: 400 })
  }

  let tcoCostUSD: number | null = null
  let tcoSavingsUSD: number | null = null
  let aiAnalysis: string | null = null

  if (hasApiKey && budgetUSD) {
    const system = `You are an infrastructure lifecycle cost analyst for the Human Flourishing Platform.
Calculate Total Cost of Ownership (TCO) and compare quality tiers.
Consider: initial cost, maintenance (annual), repairs, replacement cycles, climate degradation, and end-of-life disposal.
Return ONLY JSON: {"tco": <number>, "savings": <number vs minimum spec>, "analysis": "<3-4 sentence TCO rationale>"}`

    try {
      const raw = await chat([{
        role: "user", content: `Calculate TCO for:
Project: ${name}
Type: ${projectType}
Location: ${location}
Climate zone: ${climateZone ?? "temperate"}
Initial budget: $${budgetUSD}
Lifespan: ${lifespanYears ?? 30} years
Quality tier: ${qualityTier ?? "STANDARD"}
Specs: ${JSON.stringify(specs ?? {})}`
      }], system, 512)

      const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim())
      tcoCostUSD = parsed.tco
      tcoSavingsUSD = parsed.savings
      aiAnalysis = parsed.analysis
    } catch {
      aiAnalysis = await chat([{
        role: "user", content: `Provide a lifecycle cost analysis for a ${qualityTier ?? "STANDARD"} quality ${projectType} project in ${location} with $${budgetUSD} budget over ${lifespanYears ?? 30} years.`
      }], `You are an infrastructure TCO analyst. Give a practical 3-4 sentence analysis.`, 512)
    }
  }

  const project = await prisma.infraProject.create({
    data: {
      userId: session.user.id,
      name, projectType, location,
      climateZone: climateZone ?? null,
      budgetUSD: budgetUSD ? parseFloat(budgetUSD) : null,
      lifespanYears: lifespanYears ?? null,
      qualityTier: qualityTier ?? "STANDARD",
      specs: specs ? JSON.stringify(specs) : null,
      tcoCostUSD,
      tcoSavingsUSD,
      aiAnalysis,
    },
  })

  await awardFound(session.user.id, "infra_first_project", "INFRASTRUCTURE", TOKEN_AWARDS.INFRA_FIRST_PROJECT, "First infrastructure project")
  if (aiAnalysis) {
    await awardFound(session.user.id, `infra_tco_${project.id}`, "INFRASTRUCTURE", TOKEN_AWARDS.INFRA_TCO_ANALYSIS, "TCO analysis completed")
  }

  return NextResponse.json({ project }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { projectId, status, notes } = body
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 })

  const existing = await prisma.infraProject.findFirst({ where: { id: projectId, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const project = await prisma.infraProject.update({
    where: { id: projectId },
    data: {
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
  })

  return NextResponse.json({ project })
}
