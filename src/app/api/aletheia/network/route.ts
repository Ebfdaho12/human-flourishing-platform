import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const ALETHEIA_URL = process.env.ALETHEIA_API_URL ?? "http://localhost:3001"

/**
 * Aletheia Network Graph API — maps connections between public figures
 *
 * GET /api/aletheia/network?q=Goldman Sachs
 * Returns figures connected to the query entity and the links between them
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const q = req.nextUrl.searchParams.get("q")
  if (!q) return NextResponse.json({ error: "q required" }, { status: 400 })

  try {
    // Search for the central figure/entity
    const figureRes = await fetch(`${ALETHEIA_URL}/api/figures?search=${encodeURIComponent(q)}&limit=5`)
    const figureData = figureRes.ok ? await figureRes.json() : { figures: [] }

    // Search funding links involving this entity
    const fundingRes = await fetch(`${ALETHEIA_URL}/api/funding?search=${encodeURIComponent(q)}&limit=20`)
    const fundingData = fundingRes.ok ? await fundingRes.json() : { links: [] }

    const figures = figureData.figures ?? []
    const links = fundingData.links ?? []

    // Build network nodes and edges
    const nodes: Record<string, { id: string; name: string; type: string; score?: number }> = {}
    const edges: { from: string; to: string; label: string; amount?: number }[] = []

    // Add central figures as nodes
    for (const f of figures) {
      nodes[f.name] = { id: f.name, name: f.name, type: f.category ?? "other", score: f.credibilityScore }
    }

    // Add funding connections
    for (const l of links) {
      if (!nodes[l.funderName]) nodes[l.funderName] = { id: l.funderName, name: l.funderName, type: "funder" }
      if (!nodes[l.recipientName]) nodes[l.recipientName] = { id: l.recipientName, name: l.recipientName, type: "recipient" }
      edges.push({ from: l.funderName, to: l.recipientName, label: l.description?.slice(0, 80) ?? "funding", amount: l.amountUSD })
    }

    return NextResponse.json({
      connected: figures.length > 0 || links.length > 0,
      query: q,
      nodes: Object.values(nodes),
      edges,
      totalNodes: Object.keys(nodes).length,
      totalEdges: edges.length,
    })
  } catch {
    return NextResponse.json({
      connected: false,
      query: q,
      nodes: [],
      edges: [],
      totalNodes: 0,
      totalEdges: 0,
      note: "Connect Aletheia on port 3001 to see network connections",
    })
  }
}
