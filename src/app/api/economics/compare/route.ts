import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Economics Comparison API — compare two interventions side-by-side
 *
 * GET /api/economics/compare?a=id1&b=id2
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const aId = req.nextUrl.searchParams.get("a")
  const bId = req.nextUrl.searchParams.get("b")

  if (!aId || !bId) return NextResponse.json({ error: "Both a and b intervention IDs required" }, { status: 400 })

  const [a, b] = await Promise.all([
    prisma.econIntervention.findUnique({ where: { id: aId } }),
    prisma.econIntervention.findUnique({ where: { id: bId } }),
  ])

  if (!a || !b) return NextResponse.json({ error: "One or both interventions not found" }, { status: 404 })

  // Verify ownership
  if (a.userId !== session.user.id || b.userId !== session.user.id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 })
  }

  const comparison = {
    a, b,
    analysis: {
      roiDifference: a.roiScore !== null && b.roiScore !== null ? a.roiScore - b.roiScore : null,
      costDifference: a.costUSD - b.costUSD,
      costPerBeneficiaryA: a.beneficiaries ? Math.round(a.costUSD / a.beneficiaries) : null,
      costPerBeneficiaryB: b.beneficiaries ? Math.round(b.costUSD / b.beneficiaries) : null,
      recommendation: a.roiScore !== null && b.roiScore !== null
        ? a.roiScore > b.roiScore
          ? `"${a.title}" has a higher ROI score (${a.roiScore} vs ${b.roiScore})`
          : `"${b.title}" has a higher ROI score (${b.roiScore} vs ${a.roiScore})`
        : "Both interventions need AI scoring to compare ROI",
    },
  }

  return NextResponse.json(comparison)
}
