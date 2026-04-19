import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  searchFigures, getCredibility, getRelatedNarratives,
  getFundingLinks, universalSearch, getAletheiaStats, isAletheiaOnline
} from "@/lib/aletheia-bridge"

/**
 * Bridge API — HFP users can query Aletheia's truth data
 *
 * GET /api/aletheia?action=search&q=Trudeau
 * GET /api/aletheia?action=credibility&name=Justin Trudeau
 * GET /api/aletheia?action=narratives&topic=housing crisis
 * GET /api/aletheia?action=funding&q=Goldman Sachs
 * GET /api/aletheia?action=universal&q=climate change
 * GET /api/aletheia?action=stats
 * GET /api/aletheia?action=status
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const action = req.nextUrl.searchParams.get("action")
  const q = req.nextUrl.searchParams.get("q") ?? req.nextUrl.searchParams.get("name") ?? req.nextUrl.searchParams.get("topic") ?? ""

  if (!action) {
    return NextResponse.json({ error: "action required" }, { status: 400 })
  }

  switch (action) {
    case "search": {
      if (!q) return NextResponse.json({ error: "q required" }, { status: 400 })
      const figures = await searchFigures(q)
      return NextResponse.json({ figures })
    }

    case "credibility": {
      if (!q) return NextResponse.json({ error: "name required" }, { status: 400 })
      const figure = await getCredibility(q)
      return NextResponse.json({ figure })
    }

    case "narratives": {
      if (!q) return NextResponse.json({ error: "topic required" }, { status: 400 })
      const narratives = await getRelatedNarratives(q)
      return NextResponse.json({ narratives })
    }

    case "funding": {
      if (!q) return NextResponse.json({ error: "q required" }, { status: 400 })
      const links = await getFundingLinks(q)
      return NextResponse.json({ links })
    }

    case "universal": {
      if (!q) return NextResponse.json({ error: "q required" }, { status: 400 })
      const results = await universalSearch(q)
      return NextResponse.json(results)
    }

    case "stats": {
      const stats = await getAletheiaStats()
      return NextResponse.json({ stats })
    }

    case "status": {
      const online = await isAletheiaOnline()
      return NextResponse.json({ online })
    }

    default:
      return NextResponse.json({ error: "Invalid action. Use: search, credibility, narratives, funding, universal, stats, status" }, { status: 400 })
  }
}
