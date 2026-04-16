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

  const { searchParams } = new URL(req.url)
  const view = searchParams.get("view") // "mine" | "public"

  const studies = await prisma.researchStudy.findMany({
    where: view === "public" ? { isPublic: true } : { userId: session.user.id },
    include: {
      _count: { select: { replications: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({ studies })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { title, field, hypothesis, methodology, isPublic } = body

  if (!title || !field || !hypothesis || !methodology) {
    return NextResponse.json({ error: "title, field, hypothesis, and methodology are required" }, { status: 400 })
  }

  let aiReview: string | null = null
  if (hasApiKey) {
    const system = `You are a scientific methodology reviewer for the Human Flourishing Platform's DeSci module.
Review pre-registered studies for methodological quality before data collection begins.
Focus on: hypothesis clarity, potential confounds, sample size considerations, measurement validity, and p-hacking risks.
Be constructive and specific. Keep to 3-5 sentences.`
    aiReview = await chat(
      [{ role: "user", content: `Review this pre-registered study:\nTitle: ${title}\nField: ${field}\nHypothesis: ${hypothesis}\nMethodology: ${methodology}` }],
      system, 512
    )
  }

  const study = await prisma.researchStudy.create({
    data: {
      userId: session.user.id,
      title,
      field,
      hypothesis,
      methodology,
      isPublic: isPublic ?? true,
      aiReview,
    },
  })

  await awardFound(session.user.id, `desci_prereg_${study.id}`, "DESCI", TOKEN_AWARDS.DESCI_PRE_REGISTER, "Study pre-registered")

  return NextResponse.json({ study }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { studyId, status, results, dataUrl } = body
  if (!studyId) return NextResponse.json({ error: "studyId required" }, { status: 400 })

  const existing = await prisma.researchStudy.findFirst({ where: { id: studyId, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const study = await prisma.researchStudy.update({
    where: { id: studyId },
    data: {
      ...(status ? { status } : {}),
      ...(results !== undefined ? { results } : {}),
      ...(dataUrl !== undefined ? { dataUrl } : {}),
    },
  })

  return NextResponse.json({ study })
}
