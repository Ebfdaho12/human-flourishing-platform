import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Weather Data API — pulls historical weather from Open-Meteo
 *
 * Open-Meteo is completely FREE with no API key needed.
 * Returns temperature, precipitation, wind, UV index, and more.
 *
 * GET /api/weather?lat=40.7128&lon=-74.0060&days=30
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const lat = req.nextUrl.searchParams.get("lat") ?? "40.7128" // Default: NYC
  const lon = req.nextUrl.searchParams.get("lon") ?? "-74.0060"
  const days = Math.min(90, parseInt(req.nextUrl.searchParams.get("days") ?? "30"))

  const endDate = new Date().toISOString().split("T")[0]
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split("T")[0]

  try {
    // Open-Meteo Historical Weather API — completely free, no key needed
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,windspeed_10m_max,uv_index_max,sunshine_duration&timezone=auto`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)

    const data = await res.json()

    // Transform into usable format
    const weatherDays = (data.daily?.time ?? []).map((date: string, i: number) => ({
      date,
      tempMax: data.daily.temperature_2m_max?.[i] ?? null,
      tempMin: data.daily.temperature_2m_min?.[i] ?? null,
      tempAvg: data.daily.temperature_2m_mean?.[i] ?? null,
      precipitation: data.daily.precipitation_sum?.[i] ?? null,
      windMax: data.daily.windspeed_10m_max?.[i] ?? null,
      uvIndex: data.daily.uv_index_max?.[i] ?? null,
      sunshine: data.daily.sunshine_duration?.[i] ? Math.round(data.daily.sunshine_duration[i] / 3600 * 10) / 10 : null,
    }))

    // Compute averages
    const temps = weatherDays.map((d: any) => d.tempAvg).filter(Boolean)
    const precips = weatherDays.map((d: any) => d.precipitation).filter((p: any) => p !== null)
    const sunshineHours = weatherDays.map((d: any) => d.sunshine).filter(Boolean)

    return NextResponse.json({
      connected: true,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      period: { start: startDate, end: endDate, days },
      weather: weatherDays,
      summary: {
        avgTemp: temps.length > 0 ? Math.round((temps.reduce((a: number, b: number) => a + b, 0) / temps.length) * 10) / 10 : null,
        totalPrecip: precips.length > 0 ? Math.round(precips.reduce((a: number, b: number) => a + b, 0) * 10) / 10 : null,
        rainyDays: precips.filter((p: number) => p > 0.1).length,
        avgSunshine: sunshineHours.length > 0 ? Math.round((sunshineHours.reduce((a: number, b: number) => a + b, 0) / sunshineHours.length) * 10) / 10 : null,
      },
      source: "Open-Meteo (free, no API key)",
    })
  } catch (e) {
    return NextResponse.json({
      connected: false,
      error: "Could not fetch weather data",
      note: "Open-Meteo may be temporarily unavailable. Try again later.",
    })
  }
}
