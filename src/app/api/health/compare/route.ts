import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Health Comparison API — compare metrics between two time periods
 *
 * GET /api/health/compare?type=VITALS&periodA=30&periodB=60
 * Compares last 30 days vs previous 30 days (days 31-60)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const entryType = req.nextUrl.searchParams.get("type") ?? "VITALS"
  const periodA = Math.min(90, parseInt(req.nextUrl.searchParams.get("periodA") ?? "30"))
  const periodB = Math.min(180, parseInt(req.nextUrl.searchParams.get("periodB") ?? "60"))

  const now = new Date()
  const startA = new Date(now.getTime() - periodA * 86400000)
  const startB = new Date(now.getTime() - periodB * 86400000)

  const [entriesA, entriesB] = await Promise.all([
    prisma.healthEntry.findMany({
      where: { userId: session.user.id, entryType, recordedAt: { gte: startA } },
      select: { data: true },
    }),
    prisma.healthEntry.findMany({
      where: { userId: session.user.id, entryType, recordedAt: { gte: startB, lt: startA } },
      select: { data: true },
    }),
  ])

  function computeStats(entries: { data: string }[]) {
    const allKeys = new Set<string>()
    const values: Record<string, number[]> = {}

    for (const e of entries) {
      const d = JSON.parse(e.data || "{}")
      for (const [k, v] of Object.entries(d)) {
        if (typeof v === "number") {
          allKeys.add(k)
          if (!values[k]) values[k] = []
          values[k].push(v)
        }
      }
    }

    const stats: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    for (const key of allKeys) {
      const vals = values[key]
      if (!vals || vals.length === 0) continue
      stats[key] = {
        avg: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
        min: Math.min(...vals),
        max: Math.max(...vals),
        count: vals.length,
      }
    }
    return stats
  }

  const statsA = computeStats(entriesA)
  const statsB = computeStats(entriesB)

  // Compute changes
  const changes: Record<string, { current: number; previous: number; change: number; changePct: number }> = {}
  for (const key of new Set([...Object.keys(statsA), ...Object.keys(statsB)])) {
    const curr = statsA[key]?.avg ?? 0
    const prev = statsB[key]?.avg ?? 0
    const change = curr - prev
    const changePct = prev !== 0 ? Math.round((change / prev) * 1000) / 10 : 0
    changes[key] = { current: curr, previous: prev, change: Math.round(change * 10) / 10, changePct }
  }

  return NextResponse.json({
    periodA: { days: periodA, entries: entriesA.length, stats: statsA },
    periodB: { days: periodB - periodA, entries: entriesB.length, stats: statsB },
    changes,
    entryType,
  })
}
