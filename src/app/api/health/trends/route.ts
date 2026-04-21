import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Health Trends API — returns aggregated health data for trend visualization
 *
 * GET /api/health/trends?type=VITALS&days=30
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const { searchParams } = new URL(req.url)
    const entryType = searchParams.get("type") ?? "VITALS"
    const days = Math.min(90, parseInt(searchParams.get("days") ?? "30"))

    const since = new Date()
    since.setDate(since.getDate() - days)

    const entries = await prisma.healthEntry.findMany({
      where: {
        userId: session.user.id,
        entryType,
        recordedAt: { gte: since },
      },
      orderBy: { recordedAt: "asc" },
      select: { data: true, recordedAt: true },
    })

    const points = entries.map((e) => ({
      date: e.recordedAt.toISOString().split("T")[0],
      ...JSON.parse(e.data || "{}"),
    }))

    // Compute summary stats
    const numericKeys = new Set<string>()
    for (const p of points) {
      for (const [k, v] of Object.entries(p)) {
        if (k !== "date" && typeof v === "number") numericKeys.add(k)
      }
    }

    const summary: Record<string, { min: number; max: number; avg: number; latest: number; count: number }> = {}
    for (const key of numericKeys) {
      const values = points.map((p) => p[key]).filter((v): v is number => typeof v === "number")
      if (values.length === 0) continue
      summary[key] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
        latest: values[values.length - 1],
        count: values.length,
      }
    }

    return NextResponse.json({ points, summary, entryType, days })

  } catch (error) {
    console.error("[API] GET /api/health/trends:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
