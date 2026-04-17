import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { searchFigures, getCredibility, getRelatedNarratives } from "@/lib/aletheia-bridge"

/**
 * Bridge API — HFP users can query Aletheia's truth data
 *
 * GET /api/aletheia?action=search&q=Trudeau
 * GET /api/aletheia?action=credibility&name=Justin Trudeau
 * GET /api/aletheia?action=narratives&topic=housing crisis
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const action = req.nextUrl.searchParams.get("action")
  const q = req.nextUrl.searchParams.get("q") ?? req.nextUrl.searchParams.get("name") ?? req.nextUrl.searchParams.get("topic") ?? ""

  if (!action || !q) {
    return NextResponse.json({ error: "action and q/name/topic required" }, { status: 400 })
  }

  switch (action) {
    case "search":
      const figures = await searchFigures(q)
      return NextResponse.json({ figures })

    case "credibility":
      const figure = await getCredibility(q)
      return NextResponse.json({ figure })

    case "narratives":
      const narratives = await getRelatedNarratives(q)
      return NextResponse.json({ narratives })

    default:
      return NextResponse.json({ error: "Invalid action. Use: search, credibility, narratives" }, { status: 400 })
  }
}
