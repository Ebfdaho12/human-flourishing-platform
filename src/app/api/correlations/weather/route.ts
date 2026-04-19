import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Weather-Mood Correlation API
 *
 * Correlates user mood data with historical weather data from Open-Meteo.
 * Shows patterns between temperature, rain, sunshine hours, and mood.
 *
 * GET /api/correlations/weather?lat=40.7128&lon=-74.0060&days=90
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const lat = req.nextUrl.searchParams.get("lat") ?? "40.7128"
  const lon = req.nextUrl.searchParams.get("lon") ?? "-74.0060"
  const days = Math.min(90, parseInt(req.nextUrl.searchParams.get("days") ?? "60"))
  const since = new Date(Date.now() - days * 86400000)

  // Get mood data
  const moodEntries = await prisma.moodEntry.findMany({
    where: { userId: session.user.id, recordedAt: { gte: since } },
    select: { score: true, recordedAt: true },
    orderBy: { recordedAt: "asc" },
  })

  if (moodEntries.length < 5) {
    return NextResponse.json({ hasData: false, message: "Need at least 5 mood entries for weather correlations" })
  }

  // Group mood by date
  const moodByDate: Record<string, number[]> = {}
  for (const m of moodEntries) {
    const date = new Date(m.recordedAt).toISOString().split("T")[0]
    if (!moodByDate[date]) moodByDate[date] = []
    moodByDate[date].push(m.score)
  }

  // Fetch weather
  const startDate = since.toISOString().split("T")[0]
  const endDate = new Date().toISOString().split("T")[0]

  try {
    const weatherRes = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean,precipitation_sum,sunshine_duration&timezone=auto`
    )

    if (!weatherRes.ok) throw new Error("Weather API error")
    const weatherData = await weatherRes.json()

    // Build paired data
    const pairs: { date: string; mood: number; temp: number | null; rain: number | null; sunshine: number | null }[] = []

    const weatherDates = weatherData.daily?.time ?? []
    for (let i = 0; i < weatherDates.length; i++) {
      const date = weatherDates[i]
      if (moodByDate[date]) {
        const avgMood = Math.round((moodByDate[date].reduce((a, b) => a + b, 0) / moodByDate[date].length) * 10) / 10
        pairs.push({
          date,
          mood: avgMood,
          temp: weatherData.daily.temperature_2m_mean?.[i] ?? null,
          rain: weatherData.daily.precipitation_sum?.[i] ?? null,
          sunshine: weatherData.daily.sunshine_duration?.[i] ? Math.round(weatherData.daily.sunshine_duration[i] / 3600 * 10) / 10 : null,
        })
      }
    }

    // Compute correlations
    function correlate(xArr: number[], yArr: number[]): number | null {
      if (xArr.length < 3) return null
      const n = xArr.length
      const sumX = xArr.reduce((a, b) => a + b, 0)
      const sumY = yArr.reduce((a, b) => a + b, 0)
      const sumXY = xArr.reduce((s, x, i) => s + x * yArr[i], 0)
      const sumX2 = xArr.reduce((s, x) => s + x ** 2, 0)
      const sumY2 = yArr.reduce((s, y) => s + y ** 2, 0)
      const num = n * sumXY - sumX * sumY
      const den = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2))
      return den !== 0 ? Math.round((num / den) * 100) / 100 : null
    }

    const tempPairs = pairs.filter(p => p.temp !== null)
    const rainPairs = pairs.filter(p => p.rain !== null)
    const sunPairs = pairs.filter(p => p.sunshine !== null)

    const tempCorrelation = correlate(tempPairs.map(p => p.temp!), tempPairs.map(p => p.mood))
    const rainCorrelation = correlate(rainPairs.map(p => p.rain!), rainPairs.map(p => p.mood))
    const sunCorrelation = correlate(sunPairs.map(p => p.sunshine!), sunPairs.map(p => p.mood))

    // Mood on rainy vs dry days
    const rainyDayMoods = pairs.filter(p => (p.rain ?? 0) > 0.5).map(p => p.mood)
    const dryDayMoods = pairs.filter(p => (p.rain ?? 0) <= 0.5).map(p => p.mood)
    const rainyAvg = rainyDayMoods.length > 0 ? Math.round((rainyDayMoods.reduce((a, b) => a + b, 0) / rainyDayMoods.length) * 10) / 10 : null
    const dryAvg = dryDayMoods.length > 0 ? Math.round((dryDayMoods.reduce((a, b) => a + b, 0) / dryDayMoods.length) * 10) / 10 : null

    return NextResponse.json({
      hasData: true,
      pairedDays: pairs.length,
      correlations: {
        temperature: { r: tempCorrelation, label: "Temperature vs Mood", pairs: tempPairs.length },
        rain: { r: rainCorrelation, label: "Rainfall vs Mood", pairs: rainPairs.length },
        sunshine: { r: sunCorrelation, label: "Sunshine vs Mood", pairs: sunPairs.length },
      },
      rainyVsDry: { rainyAvg, dryAvg, rainyDays: rainyDayMoods.length, dryDays: dryDayMoods.length },
      recentPairs: pairs.slice(-14), // Last 14 paired days for charting
    })
  } catch {
    return NextResponse.json({ hasData: false, message: "Could not fetch weather data. Try again later." })
  }
}
