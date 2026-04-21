import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * DeSci Replication Stats — aggregate replication success rates
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const studies = await prisma.researchStudy.findMany({
      where: { isPublic: true },
      include: {
        replications: { select: { outcome: true } },
        reviews: { select: { quality: true, rigor: true } },
      },
    })

    const byField: Record<string, { total: number; confirmed: number; refuted: number; inconclusive: number; avgQuality: number; avgRigor: number }> = {}

    for (const study of studies) {
      if (!byField[study.field]) {
        byField[study.field] = { total: 0, confirmed: 0, refuted: 0, inconclusive: 0, avgQuality: 0, avgRigor: 0 }
      }
      const f = byField[study.field]
      f.total++
      for (const r of study.replications) {
        if (r.outcome === "CONFIRMED") f.confirmed++
        else if (r.outcome === "REFUTED") f.refuted++
        else f.inconclusive++
      }
      if (study.reviews.length > 0) {
        f.avgQuality += study.reviews.reduce((s, r) => s + r.quality, 0) / study.reviews.length
        f.avgRigor += study.reviews.reduce((s, r) => s + r.rigor, 0) / study.reviews.length
      }
    }

    // Normalize averages
    const fields = Object.entries(byField).map(([field, data]) => ({
      field,
      studies: data.total,
      confirmed: data.confirmed,
      refuted: data.refuted,
      inconclusive: data.inconclusive,
      replicationRate: data.confirmed + data.refuted + data.inconclusive > 0
        ? Math.round((data.confirmed / (data.confirmed + data.refuted + data.inconclusive)) * 100)
        : null,
      avgQuality: data.total > 0 ? Math.round((data.avgQuality / data.total) * 10) / 10 : null,
      avgRigor: data.total > 0 ? Math.round((data.avgRigor / data.total) * 10) / 10 : null,
    })).sort((a, b) => b.studies - a.studies)

    const totalReplications = studies.reduce((s, st) => s + st.replications.length, 0)
    const totalReviews = studies.reduce((s, st) => s + st.reviews.length, 0)

    return NextResponse.json({
      totalStudies: studies.length,
      totalReplications,
      totalReviews,
      fields,
      // Known replication crisis benchmarks for comparison
      benchmarks: [
        { field: "Psychology", rate: 36, source: "Open Science Collaboration 2015" },
        { field: "Cancer Biology", rate: 46, source: "Reproducibility Project 2021" },
        { field: "Economics", rate: 61, source: "Camerer et al 2016" },
        { field: "Social Sciences", rate: 62, source: "Nature Human Behaviour 2018" },
      ],
    })

  } catch (error) {
    console.error("[API] GET /api/desci/replication-stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
