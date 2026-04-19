import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const ALETHEIA_URL = process.env.ALETHEIA_API_URL ?? "http://localhost:3001"

/**
 * Governance Bill Tracker — pulls legislation data from Aletheia
 *
 * GET /api/governance/bills?q=infrastructure
 *
 * When Aletheia is running, this searches its legislation database.
 * When offline, provides reference data about how to track bills.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const q = req.nextUrl.searchParams.get("q")

  try {
    if (q) {
      const res = await fetch(`${ALETHEIA_URL}/api/search?q=${encodeURIComponent(q)}&type=all&limit=10`)
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json({ connected: true, results: data })
      }
    }
    throw new Error("offline")
  } catch {
    return NextResponse.json({
      connected: false,
      resources: [
        { name: "Congress.gov", url: "https://congress.gov", description: "Official US federal legislation tracker" },
        { name: "GovTrack.us", url: "https://govtrack.us", description: "Track bills, votes, and members of Congress" },
        { name: "OpenStates", url: "https://openstates.org", description: "Track state-level legislation across all 50 states" },
        { name: "UK Parliament", url: "https://bills.parliament.uk", description: "Track UK parliamentary bills and acts" },
        { name: "EU Legislative Observatory", url: "https://oeil.secure.europarl.europa.eu", description: "Track EU legislation" },
        { name: "Open Parliament Canada", url: "https://openparliament.ca", description: "Track Canadian parliamentary activity" },
      ],
      tip: "Add legislation as governance records to track how your representatives vote. Connect Aletheia on port 3001 for automated bill tracking.",
    })
  }
}
