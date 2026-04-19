/**
 * Aletheia Bridge — Connects HFP modules to Aletheia's truth data
 *
 * The governance, economics, DeSci, and energy modules pull from Aletheia's
 * public figures, claims, funding links, credibility scores, climate data,
 * economic data, and media analysis to inform HFP users' decision-making.
 *
 * In production, both apps run on separate ports and communicate via HTTP.
 * When Aletheia is offline, bridge functions return empty results gracefully.
 */

const ALETHEIA_URL = process.env.ALETHEIA_API_URL ?? "http://localhost:3001"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AletheiaFigure {
  id?: string
  name: string
  title: string
  party?: string
  country?: string
  category?: string
  credibilityScore: number
  consistencyScore: number
  totalClaims: number
  verifiedClaims: number
  refutedClaims: number
  bio?: string
}

export interface AletheiaFundingLink {
  funderName: string
  recipientName: string
  amountUSD: number
  description: string
  potentialBias?: string
  type?: string
}

export interface AletheiaNarrative {
  id?: string
  title: string
  description: string
  status: string
  spreadScore: number
  evidenceCount: number
  origin?: string
}

export interface AletheiaClaim {
  id?: string
  content: string
  status: string
  figureName?: string
  createdAt?: string
}

export interface AletheiaMediaOutlet {
  name: string
  owner: string
  biasRating?: number
  factualRating?: number
  country?: string
}

// ─── API Functions ───────────────────────────────────────────────────────────

async function fetchAletheia<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${ALETHEIA_URL}${path}`, { next: { revalidate: 300 } })
    if (!res.ok) return fallback
    return await res.json()
  } catch {
    return fallback
  }
}

/**
 * Search Aletheia for public figures by name or country
 */
export async function searchFigures(query: string): Promise<AletheiaFigure[]> {
  const data = await fetchAletheia<{ figures: AletheiaFigure[] }>(
    `/api/figures?search=${encodeURIComponent(query)}`,
    { figures: [] }
  )
  return data.figures ?? []
}

/**
 * Get credibility score for a public figure
 */
export async function getCredibility(name: string): Promise<AletheiaFigure | null> {
  const figures = await searchFigures(name)
  return figures.find(f => f.name.toLowerCase() === name.toLowerCase()) ?? figures[0] ?? null
}

/**
 * Get funding links for a specific figure or organization
 */
export async function getFundingLinks(name: string): Promise<AletheiaFundingLink[]> {
  const data = await fetchAletheia<{ links: AletheiaFundingLink[] }>(
    `/api/funding?search=${encodeURIComponent(name)}`,
    { links: [] }
  )
  return data.links ?? []
}

/**
 * Get narratives related to a topic
 */
export async function getRelatedNarratives(topic: string): Promise<AletheiaNarrative[]> {
  const data = await fetchAletheia<{ narratives: AletheiaNarrative[] }>(
    `/api/narratives?search=${encodeURIComponent(topic)}`,
    { narratives: [] }
  )
  return data.narratives ?? []
}

/**
 * Universal search across all Aletheia data types
 */
export async function universalSearch(query: string): Promise<{
  figures: AletheiaFigure[]
  narratives: AletheiaNarrative[]
  claims: AletheiaClaim[]
}> {
  const data = await fetchAletheia<any>(
    `/api/search?q=${encodeURIComponent(query)}&type=all&limit=5`,
    { figures: [], narratives: [], claims: [] }
  )
  return {
    figures: data.figures ?? [],
    narratives: data.narratives ?? [],
    claims: data.claims ?? [],
  }
}

/**
 * Get economic data from FRED via Aletheia
 */
export async function getEconomicData(): Promise<any> {
  return fetchAletheia("/api/economy", { data: [] })
}

/**
 * Get climate data from NOAA/NASA via Aletheia
 */
export async function getClimateData(): Promise<any> {
  return fetchAletheia("/api/climate", { data: [] })
}

/**
 * Get media outlets and bias ratings
 */
export async function getMediaOutlets(): Promise<AletheiaMediaOutlet[]> {
  const data = await fetchAletheia<{ outlets: AletheiaMediaOutlet[] }>(
    "/api/media",
    { outlets: [] }
  )
  return data.outlets ?? []
}

/**
 * Get Aletheia platform stats
 */
export async function getAletheiaStats(): Promise<any> {
  return fetchAletheia("/api/stats", null)
}

/**
 * Check if Aletheia is reachable
 */
export async function isAletheiaOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${ALETHEIA_URL}/api/stats`, { next: { revalidate: 60 } })
    return res.ok
  } catch {
    return false
  }
}

// ─── Display Helpers ─────────────────────────────────────────────────────────

export function credibilityBadge(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Highly Credible", color: "text-green-600" }
  if (score >= 60) return { label: "Generally Credible", color: "text-blue-600" }
  if (score >= 40) return { label: "Mixed Record", color: "text-amber-600" }
  if (score >= 20) return { label: "Low Credibility", color: "text-orange-600" }
  return { label: "Very Low Credibility", color: "text-red-600" }
}

export function narrativeStatusColor(status: string): string {
  if (status === "ACTIVE") return "text-emerald-600"
  if (status === "DEBUNKED") return "text-red-600"
  if (status === "GRAVEYARD") return "text-muted-foreground"
  return "text-amber-600"
}
