"use client"

import { useState, useEffect } from "react"
import { Sparkles, ChevronRight, TrendingUp, Star, Lightbulb, ArrowRight, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ────────────────────────────────────────────
// All tools with metadata for smart matching
// ────────────────────────────────────────────
interface Tool {
  name: string
  href: string
  category: string
  tags: string[]
  roi: "critical" | "high" | "medium" // impact level
  relatedTo: string[] // hrefs of related tools
  teaser: string // one-line hook to make them curious
}

const ALL_TOOLS: Tool[] = [
  // === HIGHEST ROI — things that change lives ===
  { name: "Budget Calculator", href: "/budget", category: "Finance", tags: ["money", "spending", "income"], roi: "critical", relatedTo: ["/financial-dashboard", "/debt-payoff", "/savings-finder"], teaser: "Most people don't know where 30% of their money goes. This shows you." },
  { name: "Canadian Tax Optimization", href: "/canada/tax-optimization", category: "Canada", tags: ["tax", "TFSA", "RRSP", "savings"], roi: "critical", relatedTo: ["/tax-estimator", "/investing", "/retirement"], teaser: "Canadians leave $2,000-$10,000/year on the table by not using TFSA/RRSP/FHSA correctly." },
  { name: "Real Hourly Rate", href: "/real-hourly-rate", category: "Finance", tags: ["money", "time", "work"], roi: "critical", relatedTo: ["/budget", "/family-economics", "/car-buying"], teaser: "Your real pay is 40-60% less than you think. See the number that changes how you spend." },
  { name: "Family Economics", href: "/family-economics", category: "Family", tags: ["income", "children", "stay home", "childcare"], roi: "critical", relatedTo: ["/budget", "/canada/tax-optimization", "/birth-fund"], teaser: "Can one parent stay home? The math is not what you expect." },
  { name: "Negotiation Scripts", href: "/negotiation", category: "Finance", tags: ["save", "salary", "bills", "negotiate"], roi: "critical", relatedTo: ["/budget", "/side-hustles", "/car-buying"], teaser: "6 word-for-word scripts that save $5,000-$25,000/year. Copy, practice, call." },
  { name: "Compound Interest", href: "/compound-interest", category: "Finance", tags: ["investing", "growth", "time"], roi: "critical", relatedTo: ["/investing", "/retirement", "/birth-fund"], teaser: "$200/month at 7% for 30 years = $228,000. For 40 years = $525,000. Time is the ingredient." },
  { name: "Canada Trajectories", href: "/canada/trajectories", category: "Canada", tags: ["politics", "future", "solutions"], roi: "critical", relatedTo: ["/canada", "/canada/root-causes", "/civilizations"], teaser: "Political theatre vs 1,000-year solutions. Where Canada goes depends on what it focuses on." },

  // === HIGH ROI ===
  { name: "Logical Fallacies", href: "/logical-fallacies", category: "Education", tags: ["thinking", "debate", "manipulation"], roi: "high", relatedTo: ["/propaganda", "/critical-thinking", "/media-ownership"], teaser: "20 tricks people use to win arguments without being right. Once you see them, you can't unsee them." },
  { name: "Sleep Calculator", href: "/sleep-calculator", category: "Health", tags: ["sleep", "energy", "bedtime"], roi: "high", relatedTo: ["/health", "/routine", "/focus"], teaser: "The difference between groggy and refreshed is waking at the right point in a 90-min cycle." },
  { name: "Debt Payoff Calculator", href: "/debt-payoff", category: "Finance", tags: ["debt", "freedom", "snowball"], roi: "high", relatedTo: ["/budget", "/financial-dashboard", "/emergency-fund"], teaser: "See exactly when you'll be debt-free. The date changes everything." },
  { name: "Benefits Finder", href: "/canada/benefits", category: "Canada", tags: ["CCB", "credits", "free money"], roi: "high", relatedTo: ["/canada/tax-optimization", "/tax-estimator", "/budget"], teaser: "Most Canadians leave $1,000-$5,000+/year in unclaimed benefits. Enter your situation and see." },
  { name: "Rise & Fall of Civilizations", href: "/civilizations", category: "Education", tags: ["history", "empires", "patterns"], roi: "high", relatedTo: ["/money-history", "/canada/trajectories", "/education/economics"], teaser: "Every empire follows the same 6 stages. Understanding where you are in the cycle is the most valuable knowledge." },
  { name: "Housing Crisis", href: "/canada/housing", category: "Canada", tags: ["housing", "rent", "mortgage", "affordability"], roi: "high", relatedTo: ["/rent-vs-buy", "/home-buying", "/mortgage", "/canada/compare"], teaser: "Why homes cost 8.3x income when they used to cost 2.3x. The 6 causes nobody explains together." },
  { name: "Parenting Guide", href: "/parenting", category: "Family", tags: ["kids", "development", "activities"], roi: "high", relatedTo: ["/kids-finance", "/critical-thinking", "/screen-time", "/kids-chores"], teaser: "Age-by-age: milestones, activities, screen time, and the one thing that matters most at each stage." },
  { name: "Propaganda Techniques", href: "/propaganda", category: "Education", tags: ["media", "manipulation", "awareness"], roi: "high", relatedTo: ["/logical-fallacies", "/media-ownership", "/critical-thinking"], teaser: "15 manipulation techniques used daily by media, politicians, and advertisers. Your defence starts with awareness." },
  { name: "Emergency Fund", href: "/emergency-fund", category: "Finance", tags: ["savings", "safety", "emergency"], roi: "high", relatedTo: ["/budget", "/financial-dashboard", "/investing"], teaser: "56% of Canadians can't cover a $1,000 emergency. The fund that prevents financial crisis." },
  { name: "Your Rights", href: "/rights", category: "Education", tags: ["charter", "constitution", "law", "freedom"], roi: "high", relatedTo: ["/how-laws-work", "/governance", "/logical-fallacies"], teaser: "Rights you don't know about are rights you can't exercise. Every right in plain language." },

  // === MEDIUM ROI — still valuable ===
  { name: "Money History", href: "/money-history", category: "Education", tags: ["gold", "1971", "fiat", "bitcoin"], roi: "medium", relatedTo: ["/education/economics", "/civilizations", "/inflation"], teaser: "How money went from gold coins to digital numbers — and why 1971 changed everything." },
  { name: "Birth Fund", href: "/birth-fund", category: "Finance", tags: ["children", "retirement", "compounding"], roi: "medium", relatedTo: ["/compound-interest", "/investing", "/kids-finance"], teaser: "$250/month from birth at 7% = $2.1M by age 60 (tax-free). Retirement solved from day one." },
  { name: "Cooking Basics", href: "/cooking", category: "Family", tags: ["food", "save", "health", "recipes"], roi: "medium", relatedTo: ["/meal-planner", "/budget", "/food-system"], teaser: "8 meals that save $8,000-$15,000/year. Each takes under 30 minutes and costs under $10 for 4." },
  { name: "Marriage Finance", href: "/marriage-finance", category: "Family", tags: ["couple", "money", "communication"], roi: "medium", relatedTo: ["/budget", "/difficult-conversations", "/marriage-health"], teaser: "Finances are the #1 cause of divorce — not because of money, but communication about money." },
  { name: "Credit Score", href: "/credit-score", category: "Finance", tags: ["credit", "borrowing", "score"], roi: "medium", relatedTo: ["/first-job", "/home-buying", "/debt-payoff"], teaser: "How it works, what affects it, 6 myths debunked, and 5 steps to build from scratch." },
]

// ────────────────────────────────────────────
// Smart recommendation logic
// ────────────────────────────────────────────
function getLocalStorageKeys(): string[] {
  if (typeof window === "undefined") return []
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith("hfp-")) keys.push(key)
  }
  return keys
}

function getVisitedPages(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("hfp-visited-pages") || "[]")
  } catch { return [] }
}

function trackPageVisit(href: string) {
  if (typeof window === "undefined") return
  try {
    const visited = JSON.parse(localStorage.getItem("hfp-visited-pages") || "[]")
    if (!visited.includes(href)) {
      visited.push(href)
      localStorage.setItem("hfp-visited-pages", JSON.stringify(visited.slice(-50)))
    }
  } catch {}
}

function getRecommendations(tools: Tool[], visited: string[], dataKeys: string[]): { featured: Tool[]; personalized: Tool[]; related: Tool[] } {
  const notVisited = tools.filter(t => !visited.includes(t.href))
  const hasVisited = tools.filter(t => visited.includes(t.href))

  // Featured: highest ROI tools the user hasn't seen
  const featured = notVisited
    .filter(t => t.roi === "critical")
    .slice(0, 3)

  // Personalized: based on what they've used, suggest related tools they haven't tried
  const relatedHrefs = new Set<string>()
  for (const tool of hasVisited) {
    for (const rel of tool.relatedTo) {
      if (!visited.includes(rel)) relatedHrefs.add(rel)
    }
  }
  const personalized = tools
    .filter(t => relatedHrefs.has(t.href))
    .slice(0, 4)

  // Related: based on tags of what they've used, find topically related tools
  const usedTags = new Set<string>()
  for (const tool of hasVisited) {
    for (const tag of tool.tags) usedTags.add(tag)
  }
  const related = notVisited
    .filter(t => !relatedHrefs.has(t.href) && !featured.includes(t))
    .filter(t => t.tags.some(tag => usedTags.has(tag)))
    .sort((a, b) => (a.roi === "critical" ? 0 : a.roi === "high" ? 1 : 2) - (b.roi === "critical" ? 0 : b.roi === "high" ? 1 : 2))
    .slice(0, 3)

  return { featured, personalized, related }
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────
export function Discover() {
  const [visited, setVisited] = useState<string[]>([])
  const [dataKeys, setDataKeys] = useState<string[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setVisited(getVisitedPages())
    setDataKeys(getLocalStorageKeys())
    // Track current page
    trackPageVisit(window.location.pathname)
  }, [refreshKey])

  const { featured, personalized, related } = getRecommendations(ALL_TOOLS, visited, dataKeys)

  // If user is new (no visits), show curated onboarding
  const isNew = visited.length < 3

  if (isNew) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Start Here — Highest Impact
          </h2>
          <a href="/quiz" className="text-[10px] text-violet-600 hover:underline">Take the quiz for personalized picks →</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ALL_TOOLS.filter(t => t.roi === "critical").slice(0, 6).map(tool => (
            <a key={tool.href} href={tool.href}>
              <Card className="card-hover h-full border-amber-100">
                <CardContent className="p-3 flex items-start gap-2.5">
                  <Star className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{tool.name}</p>
                      <Badge variant="outline" className="text-[8px] text-amber-600 border-amber-300 shrink-0">High ROI</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{tool.teaser}</p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/20 shrink-0 mt-1" />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Featured — highest ROI not yet visited */}
      {featured.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> You Haven't Tried These Yet
            </h2>
            <button onClick={() => setRefreshKey(k => k + 1)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RefreshCw className="h-2.5 w-2.5" /> Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {featured.map(tool => (
              <a key={tool.href} href={tool.href}>
                <Card className="card-hover h-full border-emerald-100">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge variant="outline" className="text-[8px] text-emerald-600 border-emerald-300">High Impact</Badge>
                      <Badge variant="outline" className="text-[8px]">{tool.category}</Badge>
                    </div>
                    <p className="text-sm font-medium">{tool.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{tool.teaser}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Personalized — based on what they've already used */}
      {personalized.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
            <Lightbulb className="h-3.5 w-3.5 text-violet-500" /> Because You Used Related Tools
          </h2>
          <div className="space-y-1.5">
            {personalized.map(tool => (
              <a key={tool.href} href={tool.href}>
                <Card className="card-hover">
                  <CardContent className="p-2.5 flex items-center gap-3">
                    <ArrowRight className="h-3 w-3 text-violet-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{tool.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{tool.teaser}</p>
                    </div>
                    <Badge variant="outline" className="text-[8px] shrink-0">{tool.category}</Badge>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Topically related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> You Might Also Like
          </h2>
          <div className="space-y-1.5">
            {related.map(tool => (
              <a key={tool.href} href={tool.href}>
                <Card className="card-hover">
                  <CardContent className="p-2.5 flex items-center gap-3">
                    <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{tool.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{tool.teaser}</p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/20 shrink-0" />
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
