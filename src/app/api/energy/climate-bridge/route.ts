import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const ALETHEIA_URL = process.env.ALETHEIA_API_URL ?? "http://localhost:3001"

/**
 * Climate data bridge — pulls from Aletheia's NOAA/NASA climate dataset
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const res = await fetch(`${ALETHEIA_URL}/api/climate`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error("Aletheia unavailable")
    const data = await res.json()
    return NextResponse.json({ connected: true, climate: data })
  } catch {
    return NextResponse.json({
      connected: false,
      climate: {
        indicators: [
          { name: "Atmospheric CO2", latest: "424 ppm", source: "NOAA/Mauna Loa", period: "2024", trend: "rising" },
          { name: "Global Temperature Anomaly", latest: "+1.45°C", source: "NASA GISS", period: "2024", trend: "rising" },
          { name: "Arctic Sea Ice Extent", latest: "4.28M km²", source: "NSIDC", period: "Sep 2024", trend: "declining" },
          { name: "Sea Level Rise", latest: "+101mm since 1993", source: "NASA/CNES", period: "2024", trend: "rising" },
          { name: "Global Renewable Share", latest: "30%", source: "IEA", period: "2023", trend: "rising" },
          { name: "US Solar Capacity", latest: "175 GW", source: "EIA", period: "2024", trend: "rising" },
        ],
        note: "Aletheia offline — showing reference data. Connect Aletheia on port 3001 for live NOAA/NASA data.",
      },
    })
  }
}
