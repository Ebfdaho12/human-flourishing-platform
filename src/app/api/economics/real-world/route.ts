import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const ALETHEIA_URL = process.env.ALETHEIA_API_URL ?? "http://localhost:3001"

/**
 * Real-world economic data bridge — pulls from Aletheia's FRED dataset
 *
 * GET /api/economics/real-world
 * Returns inflation, unemployment, GDP, debt, and money supply data
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const res = await fetch(`${ALETHEIA_URL}/api/economy`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error("Aletheia unavailable")
    const data = await res.json()
    return NextResponse.json({ connected: true, economy: data })
  } catch {
    // Fallback: provide static reference data when Aletheia is offline
    return NextResponse.json({
      connected: false,
      economy: {
        indicators: [
          { name: "US Inflation Rate (CPI)", latest: "3.0%", trend: "declining", source: "BLS/FRED", period: "2024" },
          { name: "US Unemployment Rate", latest: "4.2%", trend: "stable", source: "BLS/FRED", period: "2024" },
          { name: "US GDP Growth (Annual)", latest: "2.5%", trend: "stable", source: "BEA/FRED", period: "2024" },
          { name: "US National Debt", latest: "$34.7T", trend: "rising", source: "Treasury/FRED", period: "2024" },
          { name: "Global Extreme Poverty", latest: "8.5%", trend: "declining", source: "World Bank", period: "2023" },
          { name: "Global GDP (PPP)", latest: "$175T", trend: "rising", source: "IMF", period: "2024" },
        ],
        note: "Aletheia offline — showing reference data. Connect Aletheia on port 3001 for live FRED data.",
      },
    })
  }
}
