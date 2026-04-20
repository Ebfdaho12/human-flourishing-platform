"use client"

import { useState, useEffect } from "react"
import { Star, Plus, Trash2, ChevronRight, Search, Pin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const ALL_TOOLS: { name: string; href: string; category: string }[] = [
  // Financial
  { name: "Budget Calculator", href: "/budget", category: "Financial" },
  { name: "Net Worth Tracker", href: "/net-worth", category: "Financial" },
  { name: "Debt Payoff", href: "/debt-payoff", category: "Financial" },
  { name: "Financial Dashboard", href: "/financial-dashboard", category: "Financial" },
  { name: "Tax Estimator", href: "/tax-estimator", category: "Financial" },
  { name: "Compound Interest", href: "/compound-interest", category: "Financial" },
  { name: "Subscription Audit", href: "/subscriptions", category: "Financial" },
  { name: "Savings Finder", href: "/savings-finder", category: "Financial" },
  { name: "Real Hourly Rate", href: "/real-hourly-rate", category: "Financial" },
  { name: "Retirement Calculator", href: "/retirement", category: "Financial" },
  { name: "Mortgage Comparison", href: "/mortgage", category: "Financial" },
  { name: "Investing Basics", href: "/investing", category: "Financial" },
  { name: "Inflation Calculator", href: "/inflation", category: "Financial" },
  // Family
  { name: "Family Economics", href: "/family-economics", category: "Family" },
  { name: "Family Meeting", href: "/family-meeting", category: "Family" },
  { name: "Meal Planner", href: "/meal-planner", category: "Family" },
  { name: "Screen Time", href: "/screen-time", category: "Family" },
  { name: "Kids Chores", href: "/kids-chores", category: "Family" },
  { name: "Date Nights", href: "/date-nights", category: "Family" },
  { name: "Parenting Guide", href: "/parenting", category: "Family" },
  { name: "Cooking Basics", href: "/cooking", category: "Family" },
  // Health
  { name: "Health Dashboard", href: "/health", category: "Health" },
  { name: "Sleep Calculator", href: "/sleep-calculator", category: "Health" },
  { name: "Mental Health", href: "/mental-health", category: "Health" },
  // Productivity
  { name: "Daily Planner", href: "/planner", category: "Productivity" },
  { name: "Focus Timer", href: "/focus", category: "Productivity" },
  { name: "Quick Notes", href: "/notes", category: "Productivity" },
  { name: "Goals", href: "/goals", category: "Productivity" },
  { name: "Habit Stacking", href: "/habit-stack", category: "Productivity" },
  // Growth
  { name: "Decision Journal", href: "/decisions", category: "Growth" },
  { name: "Wins & Gratitude", href: "/wins", category: "Growth" },
  { name: "Reading List", href: "/reading", category: "Growth" },
  { name: "Life Wheel", href: "/life-wheel", category: "Growth" },
  { name: "Skill Inventory", href: "/skills", category: "Growth" },
  // Education
  { name: "Economics Education", href: "/education/economics", category: "Education" },
  { name: "Civilizations", href: "/civilizations", category: "Education" },
  { name: "Money History", href: "/money-history", category: "Education" },
  { name: "Logical Fallacies", href: "/logical-fallacies", category: "Education" },
  { name: "Your Rights", href: "/rights", category: "Education" },
  { name: "Media Ownership", href: "/media-ownership", category: "Education" },
  // Canada
  { name: "Canada Report", href: "/canada", category: "Canada" },
  { name: "Provincial Compare", href: "/canada/compare", category: "Canada" },
  { name: "Tax Optimization", href: "/canada/tax-optimization", category: "Canada" },
  { name: "Benefits Finder", href: "/canada/benefits", category: "Canada" },
  { name: "Housing Crisis", href: "/canada/housing", category: "Canada" },
  { name: "Trajectories", href: "/canada/trajectories", category: "Canada" },
  // Other
  { name: "Negotiation Scripts", href: "/negotiation", category: "Tools" },
  { name: "Side Hustles", href: "/side-hustles", category: "Tools" },
  { name: "Home Maintenance", href: "/home-maintenance", category: "Tools" },
  { name: "Data Backup", href: "/data-backup", category: "Tools" },
  { name: "Community Resources", href: "/community-resources", category: "Tools" },
  { name: "Home Buying Guide", href: "/home-buying", category: "Tools" },
  { name: "Car Buying Guide", href: "/car-buying", category: "Tools" },
  { name: "Emergency Preparedness", href: "/preparedness", category: "Tools" },
  { name: "Birth Fund", href: "/birth-fund", category: "Canada" },
]

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("hfp-favorites")
    if (stored) setFavorites(JSON.parse(stored))
  }, [])

  function save(updated: string[]) {
    setFavorites(updated)
    localStorage.setItem("hfp-favorites", JSON.stringify(updated))
  }

  function toggleFavorite(href: string) {
    if (favorites.includes(href)) save(favorites.filter(f => f !== href))
    else save([...favorites, href])
  }

  const favoriteTools = ALL_TOOLS.filter(t => favorites.includes(t.href))
  const filtered = search
    ? ALL_TOOLS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
    : ALL_TOOLS

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
            <Star className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Favorites</h1>
        </div>
        <p className="text-sm text-muted-foreground">Pin your most-used tools for quick access. Your favorites appear here and on your dashboard.</p>
      </div>

      {/* Pinned favorites */}
      {favoriteTools.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Pin className="h-3 w-3" /> Your Pinned Tools ({favoriteTools.length})
          </p>
          <div className="grid grid-cols-2 gap-2">
            {favoriteTools.map(t => (
              <a key={t.href} href={t.href}>
                <Card className="card-hover h-full">
                  <CardContent className="p-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.category}</p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/20 shrink-0" />
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-amber-200 bg-amber-50/20">
          <CardContent className="py-8 text-center">
            <Star className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-muted-foreground">No favorites yet</p>
            <p className="text-xs text-muted-foreground mt-1">Tap the star next to any tool below to pin it.</p>
          </CardContent>
        </Card>
      )}

      {/* Search + all tools */}
      <div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools..." className="pl-10" />
        </div>
        <div className="space-y-1">
          {filtered.map(t => {
            const isFav = favorites.includes(t.href)
            return (
              <div key={t.href} className="flex items-center gap-2 rounded-lg border border-border p-2 hover:bg-muted/30 transition-colors">
                <button onClick={() => toggleFavorite(t.href)} className="shrink-0">
                  <Star className={cn("h-4 w-4 transition-colors",
                    isFav ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20 hover:text-amber-300"
                  )} />
                </button>
                <a href={t.href} className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                </a>
                <Badge variant="outline" className="text-[9px] shrink-0">{t.category}</Badge>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
