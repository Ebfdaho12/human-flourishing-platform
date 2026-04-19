import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const SPECIALTIES = [
  "CARDIOLOGY", "NEUROLOGY", "DERMATOLOGY", "ENDOCRINOLOGY", "GASTRO",
  "ORTHOPEDIC", "PULMONARY", "PSYCHIATRY", "GENERAL", "OTHER",
]

/**
 * Anonymous Health Cases API
 *
 * GET /api/health/cases — browse open cases (practitioners) or view own cases (patients)
 * POST /api/health/cases — create a new anonymous case
 * DELETE /api/health/cases?id=xxx — close/delete own case
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const view = req.nextUrl.searchParams.get("view") ?? "browse"
  const specialty = req.nextUrl.searchParams.get("specialty")

  if (view === "mine") {
    // Patient viewing their own cases
    const cases = await prisma.healthCase.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        proposals: {
          select: {
            id: true,
            credentials: true,
            analysis: true,
            proposedTreatment: true,
            rootCauseTheory: true,
            evidence: true,
            status: true,
            createdAt: true,
          },
        },
      },
    })
    return NextResponse.json({ cases })
  }

  // Practitioner browsing open cases (anonymized — no userId exposed)
  const where: any = { status: "OPEN" }
  if (specialty && SPECIALTIES.includes(specialty)) {
    where.specialty = specialty
  }

  const cases = await prisma.healthCase.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      anonId: true,
      title: true,
      specialty: true,
      symptoms: true,
      timeline: true,
      sharedData: true,
      priorTreatment: true,
      seekingHelp: true,
      demographics: true,
      status: true,
      createdAt: true,
      _count: { select: { proposals: true } },
      // Deliberately NOT selecting userId — practitioner never sees who posted
    },
  })

  return NextResponse.json({ cases })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { title, specialty, symptoms, timeline, sharedData, priorTreatment, seekingHelp, demographics } = body

  if (!title || !specialty || !symptoms) {
    return NextResponse.json({ error: "Title, specialty, and symptoms are required" }, { status: 400 })
  }

  if (!SPECIALTIES.includes(specialty)) {
    return NextResponse.json({ error: "Invalid specialty" }, { status: 400 })
  }

  const healthCase = await prisma.healthCase.create({
    data: {
      userId: session.user.id,
      title,
      specialty,
      symptoms,
      timeline: timeline || null,
      sharedData: sharedData ? JSON.stringify(sharedData) : null,
      priorTreatment: priorTreatment || null,
      seekingHelp: seekingHelp || null,
      demographics: demographics ? JSON.stringify(demographics) : null,
    },
  })

  return NextResponse.json({ case: healthCase })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const existing = await prisma.healthCase.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (existing.userId !== session.user.id) return NextResponse.json({ error: "Not yours" }, { status: 403 })

  await prisma.healthCase.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
