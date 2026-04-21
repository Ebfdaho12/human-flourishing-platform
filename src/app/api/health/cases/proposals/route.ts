import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Case Proposals API — practitioners submit treatment proposals, patients respond
 *
 * POST /api/health/cases/proposals — practitioner submits a proposal
 * PATCH /api/health/cases/proposals — patient accepts/declines a proposal
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { caseId, credentials, analysis, proposedTreatment, evidence, rootCauseTheory } = await req.json()

    if (!caseId || !credentials || !analysis || !proposedTreatment) {
      return NextResponse.json({ error: "caseId, credentials, analysis, and proposedTreatment are required" }, { status: 400 })
    }

    // Verify case exists and is open
    const healthCase = await prisma.healthCase.findUnique({ where: { id: caseId } })
    if (!healthCase) return NextResponse.json({ error: "Case not found" }, { status: 404 })
    if (healthCase.status !== "OPEN") return NextResponse.json({ error: "Case is not open" }, { status: 400 })

    // Practitioners cannot propose on their own cases
    if (healthCase.userId === session.user.id) {
      return NextResponse.json({ error: "Cannot propose on your own case" }, { status: 400 })
    }

    // Check for existing proposal
    const existing = await prisma.caseProposal.findUnique({
      where: { caseId_practitionerId: { caseId, practitionerId: session.user.id } },
    })
    if (existing) return NextResponse.json({ error: "You already submitted a proposal for this case" }, { status: 400 })

    const proposal = await prisma.caseProposal.create({
      data: {
        caseId,
        practitionerId: session.user.id,
        credentials,
        analysis,
        proposedTreatment,
        evidence: evidence || null,
        rootCauseTheory: rootCauseTheory || null,
      },
    })

    // Update case status
    await prisma.healthCase.update({ where: { id: caseId }, data: { status: "IN_REVIEW" } })

    return NextResponse.json({ proposal })
  } catch (error) {
    console.error("[API] POST /api/health/cases/proposals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { proposalId, action } = await req.json()

    if (!proposalId || !["ACCEPTED", "DECLINED"].includes(action)) {
      return NextResponse.json({ error: "proposalId and action (ACCEPTED/DECLINED) required" }, { status: 400 })
    }

    // Get proposal and verify ownership of the case
    const proposal = await prisma.caseProposal.findUnique({
      where: { id: proposalId },
      include: { case: true },
    })
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    if (proposal.case.userId !== session.user.id) {
      return NextResponse.json({ error: "Only the case owner can respond to proposals" }, { status: 403 })
    }

    await prisma.caseProposal.update({
      where: { id: proposalId },
      data: { status: action },
    })

    // If accepted, update case status to MATCHED
    if (action === "ACCEPTED") {
      await prisma.healthCase.update({
        where: { id: proposal.caseId },
        data: { status: "MATCHED" },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[API] PATCH /api/health/cases/proposals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
