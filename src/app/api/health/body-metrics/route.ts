import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Body Metrics API — weight, BMI, body composition tracking over time
 *
 * GET /api/health/body-metrics?days=90
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = Math.min(365, parseInt(searchParams.get("days") ?? "90"))
  const since = new Date(Date.now() - days * 86400000)

  const entries = await prisma.healthEntry.findMany({
    where: { userId: session.user.id, entryType: "MEASUREMENT", recordedAt: { gte: since } },
    orderBy: { recordedAt: "asc" },
    select: { data: true, recordedAt: true },
  })

  const measurements = entries.map(e => {
    const d = JSON.parse(e.data || "{}")
    return {
      date: e.recordedAt.toISOString().split("T")[0],
      weight: d.weight ?? null, // lbs
      waist: d.waist ?? null,   // inches
      steps: d.steps ?? null,
    }
  })

  const weights = measurements.map(m => m.weight).filter(Boolean)
  const waists = measurements.map(m => m.waist).filter(Boolean)
  const stepsList = measurements.map(m => m.steps).filter(Boolean)

  // BMI calculation (needs height — estimate from average or let user set)
  // Using 5'9" (69 inches) as default — users should set their own height
  const heightInches = 69
  const latestWeight = weights.length > 0 ? weights[weights.length - 1] : null
  const bmi = latestWeight ? Math.round((latestWeight / (heightInches * heightInches)) * 703 * 10) / 10 : null

  let bmiCategory = ""
  if (bmi) {
    if (bmi < 18.5) bmiCategory = "Underweight"
    else if (bmi < 25) bmiCategory = "Normal"
    else if (bmi < 30) bmiCategory = "Overweight"
    else bmiCategory = "Obese"
  }

  // Weight change
  const weightChange = weights.length >= 2 ? Math.round((weights[weights.length - 1] - weights[0]) * 10) / 10 : null

  // Weekly weight averages for trend
  const weeklyWeights: { week: string; avg: number }[] = []
  const weekMap: Record<string, number[]> = {}
  for (const m of measurements) {
    if (m.weight === null) continue
    const weekStart = new Date(m.date)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const key = weekStart.toISOString().split("T")[0]
    if (!weekMap[key]) weekMap[key] = []
    weekMap[key].push(m.weight)
  }
  for (const [week, vals] of Object.entries(weekMap)) {
    weeklyWeights.push({ week, avg: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 })
  }

  return NextResponse.json({
    hasData: measurements.length > 0,
    days,
    totalMeasurements: measurements.length,
    measurements,
    weight: {
      latest: latestWeight,
      first: weights.length > 0 ? weights[0] : null,
      change: weightChange,
      min: weights.length > 0 ? Math.min(...weights) : null,
      max: weights.length > 0 ? Math.max(...weights) : null,
      avg: weights.length > 0 ? Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10 : null,
      weeklyTrend: weeklyWeights,
    },
    bmi: { value: bmi, category: bmiCategory, heightUsed: `${Math.floor(heightInches / 12)}'${heightInches % 12}"` },
    waist: {
      latest: waists.length > 0 ? waists[waists.length - 1] : null,
      change: waists.length >= 2 ? Math.round((waists[waists.length - 1] - waists[0]) * 10) / 10 : null,
    },
    steps: {
      avg: stepsList.length > 0 ? Math.round(stepsList.reduce((a, b) => a + b, 0) / stepsList.length) : null,
      max: stepsList.length > 0 ? Math.max(...stepsList) : null,
      totalEntries: stepsList.length,
    },
  })
}
