import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { awardFound } from "@/lib/tokens"
import { TOKEN_AWARDS } from "@/lib/constants"

const RENEWABLE_SOURCES = ["SOLAR", "WIND", "HYDRO"]

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200)

  const logs = await prisma.energyLog.findMany({
    where: { userId: session.user.id },
    orderBy: { recordedAt: "desc" },
    take: limit,
  })

  // Aggregate stats
  const totalProduced = logs
    .filter((l) => l.logType === "PRODUCTION")
    .reduce((sum, l) => sum + l.amountKwh, 0)

  const totalConsumed = logs
    .filter((l) => l.logType === "CONSUMPTION")
    .reduce((sum, l) => sum + l.amountKwh, 0)

  const totalCO2Saved = logs
    .reduce((sum, l) => sum + (l.co2SavedKg ?? 0), 0)

  const renewableKwh = logs
    .filter((l) => RENEWABLE_SOURCES.includes(l.sourceType))
    .reduce((sum, l) => sum + l.amountKwh, 0)

  return NextResponse.json({
    logs,
    stats: { totalProduced, totalConsumed, totalCO2Saved, renewableKwh },
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { logType, sourceType, amountKwh, pricePerKwh, co2SavedKg, peakDemand, notes, recordedAt } = body

  if (!logType || !sourceType || !amountKwh) {
    return NextResponse.json({ error: "logType, sourceType, and amountKwh are required" }, { status: 400 })
  }

  const log = await prisma.energyLog.create({
    data: {
      userId: session.user.id,
      logType,
      sourceType,
      amountKwh: parseFloat(amountKwh),
      pricePerKwh: pricePerKwh ? parseFloat(pricePerKwh) : null,
      co2SavedKg: co2SavedKg ? parseFloat(co2SavedKg) : null,
      peakDemand: peakDemand ?? false,
      notes: notes ?? null,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    },
  })

  await awardFound(session.user.id, "energy_first_log", "ENERGY", TOKEN_AWARDS.ENERGY_FIRST_LOG, "First energy log")

  if (RENEWABLE_SOURCES.includes(sourceType) && logType === "PRODUCTION") {
    const count = await prisma.energyLog.count({
      where: { userId: session.user.id, sourceType: { in: RENEWABLE_SOURCES }, logType: "PRODUCTION" },
    })
    await awardFound(
      session.user.id,
      `energy_renewable_${count}`,
      "ENERGY",
      TOKEN_AWARDS.ENERGY_RENEWABLE,
      `Renewable energy logged: ${sourceType}`
    )
  }

  // 7-day streak
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentCount = await prisma.energyLog.count({
    where: { userId: session.user.id, recordedAt: { gte: sevenDaysAgo } },
  })
  if (recentCount >= 7) {
    await awardFound(session.user.id, "energy_week_streak", "ENERGY", TOKEN_AWARDS.ENERGY_WEEK_STREAK, "7-day energy logging streak")
  }

  return NextResponse.json({ log }, { status: 201 })
}
