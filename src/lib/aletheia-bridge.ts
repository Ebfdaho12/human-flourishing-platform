/**
 * Aletheia Bridge — Connects HFP modules to Aletheia's truth data
 *
 * The governance and economics modules can pull from Aletheia's
 * public figures, claims, funding links, and credibility scores
 * to inform HFP users' decision-making.
 *
 * In production, this would call Aletheia's API.
 * For now, it provides the interface and sample integration.
 */

// Aletheia API base URL
const ALETHEIA_URL = process.env.ALETHEIA_API_URL ?? "http://localhost:3001"

export interface AletheiaFigure {
  name: string
  title: string
  party?: string
  country?: string
  credibilityScore: number
  consistencyScore: number
  totalClaims: number
  verifiedClaims: number
  refutedClaims: number
}

export interface AletheiaFundingLink {
  funderName: string
  recipientName: string
  amountUSD: number
  description: string
  potentialBias?: string
}

export interface AletheiaNarrative {
  title: string
  description: string
  status: string
  spreadScore: number
  evidenceCount: number
}

/**
 * Search Aletheia for public figures by name or country
 */
export async function searchFigures(query: string): Promise<AletheiaFigure[]> {
  try {
    const res = await fetch(`${ALETHEIA_URL}/api/figures?search=${encodeURIComponent(query)}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.figures ?? []
  } catch {
    return []
  }
}

/**
 * Get funding links for a specific figure or organization
 */
export async function getFundingLinks(name: string): Promise<AletheiaFundingLink[]> {
  try {
    const res = await fetch(`${ALETHEIA_URL}/api/wallet?fundingFor=${encodeURIComponent(name)}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.links ?? []
  } catch {
    return []
  }
}

/**
 * Get credibility score for a public figure
 */
export async function getCredibility(name: string): Promise<AletheiaFigure | null> {
  try {
    const figures = await searchFigures(name)
    return figures.find(f => f.name.toLowerCase() === name.toLowerCase()) ?? figures[0] ?? null
  } catch {
    return null
  }
}

/**
 * Get narratives related to a topic (for governance and economics modules)
 */
export async function getRelatedNarratives(topic: string): Promise<AletheiaNarrative[]> {
  try {
    const res = await fetch(`${ALETHEIA_URL}/api/narratives?search=${encodeURIComponent(topic)}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.narratives ?? []
  } catch {
    return []
  }
}

/**
 * Format credibility score as a human-readable badge
 */
export function credibilityBadge(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Highly Credible", color: "text-green-600" }
  if (score >= 60) return { label: "Generally Credible", color: "text-blue-600" }
  if (score >= 40) return { label: "Mixed Record", color: "text-amber-600" }
  if (score >= 20) return { label: "Low Credibility", color: "text-orange-600" }
  return { label: "Very Low Credibility", color: "text-red-600" }
}
