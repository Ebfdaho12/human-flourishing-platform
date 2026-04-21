"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SearchEntry {
  title: string; path: string; description: string; category: string; keywords: string[]
}

const CATEGORIES = ["Health", "Finance", "Mind", "Tracking", "Social", "Canada", "Tools"] as const

const CATEGORY_COLORS: Record<string, string> = {
  Health: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  Finance: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Mind: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Tracking: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Social: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Canada: "bg-red-500/15 text-red-400 border-red-500/30",
  Tools: "bg-slate-500/15 text-slate-400 border-slate-500/30",
}

const I = (t: string, p: string, d: string, c: string, k: string[]): SearchEntry => ({ title: t, path: p, description: d, category: c, keywords: k })

const SEARCH_INDEX: SearchEntry[] = [
  // Health (20)
  I("Health Dashboard", "/health/dashboard", "Overview of all health metrics and vitals", "Health", ["vitals", "overview"]),
  I("Exercise Tracker", "/health/exercise", "Log workouts, track reps and cardio", "Health", ["workout", "gym", "cardio"]),
  I("Food Log", "/health/food", "Track meals, calories and macronutrients", "Health", ["calories", "macros", "diet"]),
  I("Sleep Tracker", "/health/sleep", "Monitor sleep duration and quality", "Health", ["rest", "insomnia"]),
  I("Water Intake", "/health/water", "Track daily hydration levels", "Health", ["hydration"]),
  I("Symptoms Log", "/health/symptoms", "Record and track health symptoms", "Health", ["pain", "illness"]),
  I("Medications", "/health/medications", "Manage prescriptions and supplements", "Health", ["prescriptions", "drugs"]),
  I("Health Insights", "/health/insights", "AI-driven health pattern analysis", "Health", ["patterns", "ai"]),
  I("Body Composition", "/body-composition", "Track weight, body fat and measurements", "Health", ["weight", "bmi"]),
  I("Nutrition", "/nutrition", "Evidence-based nutrition information", "Health", ["diet", "vitamins"]),
  I("Supplements", "/supplements", "Research-backed supplement protocols", "Health", ["vitamins", "nootropics"]),
  I("Meal Planner", "/meal-planner", "Plan weekly meals and grocery lists", "Health", ["recipes", "grocery"]),
  I("Fasting", "/fasting", "Intermittent fasting timer and protocols", "Health", ["intermittent", "autophagy"]),
  I("Strength Training", "/strength-training", "Progressive overload programs", "Health", ["lifting", "weights"]),
  I("Gut Health", "/gut-health", "Microbiome optimization and digestion", "Health", ["microbiome", "probiotics"]),
  I("Hormone Health", "/hormone-health", "Hormone optimization and testing", "Health", ["hormones", "thyroid"]),
  I("Sleep Optimization", "/sleep-optimization", "Advanced sleep improvement strategies", "Health", ["circadian"]),
  I("Cold Exposure", "/cold-exposure", "Cold plunge and cold shower protocols", "Health", ["ice bath", "wim hof"]),
  I("Dental Health", "/dental-health", "Oral health and dental care guide", "Health", ["teeth", "oral"]),
  I("Health Protocols", "/health-protocols", "Evidence-based optimization protocols", "Health", ["biohacking", "longevity"]),
  // Finance (20)
  I("Financial Dashboard", "/financial-dashboard", "Overview of all financial accounts", "Finance", ["money", "accounts"]),
  I("Budget Planner", "/budget", "Create and track monthly budgets", "Finance", ["spending", "expenses"]),
  I("Net Worth", "/net-worth", "Track assets, liabilities and net worth", "Finance", ["assets", "wealth"]),
  I("Investing", "/investing", "Investment strategies and portfolio tracking", "Finance", ["stocks", "ETFs", "portfolio"]),
  I("Debt Payoff", "/debt-payoff", "Debt elimination strategies and calculators", "Finance", ["debt", "snowball", "loans"]),
  I("Retirement", "/retirement", "Retirement calculators and planning tools", "Finance", ["RRSP", "pension", "FIRE"]),
  I("Emergency Fund", "/emergency-fund", "Build and track emergency savings", "Finance", ["savings", "rainy day"]),
  I("Mortgage Calculator", "/mortgage", "Mortgage payments and amortization", "Finance", ["home loan", "interest"]),
  I("Tax Estimator", "/tax-estimator", "Estimate income tax and deductions", "Finance", ["tax", "deductions"]),
  I("Credit Score", "/credit-score", "Understand and improve your credit", "Finance", ["credit", "bureau"]),
  I("Subscriptions", "/subscriptions", "Track recurring subscriptions", "Finance", ["recurring", "cancel"]),
  I("Rent vs Buy", "/rent-vs-buy", "Compare renting vs buying a home", "Finance", ["housing", "compare"]),
  I("Home Buying", "/home-buying", "Step-by-step home purchasing guide", "Finance", ["real estate", "closing"]),
  I("Side Hustles", "/side-hustles", "Ideas for additional income streams", "Finance", ["income", "freelance"]),
  I("Financial Independence", "/financial-independence", "FIRE movement strategies", "Finance", ["FIRE", "early retirement"]),
  I("Compound Interest", "/compound-interest", "Compound interest calculator", "Finance", ["growth", "calculator"]),
  I("Insurance Guide", "/insurance-guide", "Navigate insurance types and coverage", "Finance", ["coverage", "premiums"]),
  I("Estate Planning", "/estate-planning", "Wills, trusts and estate basics", "Finance", ["will", "inheritance"]),
  I("Kids Finance", "/kids-finance", "Teaching kids about money", "Finance", ["children", "RESP"]),
  I("Cost of Living", "/cost-of-living", "Compare cost of living across cities", "Finance", ["cities", "expenses"]),
  // Mind (15)
  I("Mental Health", "/mental-health", "Central hub for mental wellness tools", "Mind", ["wellness", "mental"]),
  I("Meditation", "/mental-health/meditate", "Guided meditation sessions and timer", "Mind", ["mindfulness", "calm"]),
  I("Breathwork", "/breathwork", "Breathing exercises and techniques", "Mind", ["breathing", "pranayama"]),
  I("Gratitude Journal", "/gratitude", "Daily gratitude practice and journal", "Mind", ["thankful"]),
  I("Anxiety Toolkit", "/anxiety-toolkit", "CBT-based tools for managing anxiety", "Mind", ["CBT", "panic", "worry"]),
  I("Stoicism", "/stoicism", "Stoic philosophy principles and practices", "Mind", ["marcus aurelius", "seneca"]),
  I("Cognitive Biases", "/cognitive-biases", "Catalog of cognitive biases", "Mind", ["bias", "heuristics"]),
  I("Mental Models", "/mental-models", "Powerful mental models for thinking", "Mind", ["frameworks", "first principles"]),
  I("Critical Thinking", "/critical-thinking", "Develop sharper critical thinking", "Mind", ["analysis", "reasoning"]),
  I("Focus Timer", "/focus-timer", "Pomodoro and deep work timer", "Mind", ["pomodoro", "deep work"]),
  I("Dopamine Guide", "/dopamine", "Understanding and optimizing dopamine", "Mind", ["reward", "motivation"]),
  I("Decision Journal", "/decision-journal", "Log and review major life decisions", "Mind", ["choices", "reflection"]),
  I("Memory Techniques", "/memory-techniques", "Memory palace and spaced repetition", "Mind", ["recall", "memory"]),
  I("Screen Time", "/screen-time", "Monitor and reduce screen time", "Mind", ["digital", "addiction"]),
  I("Philosophy", "/philosophy", "Philosophical frameworks for living", "Mind", ["ethics", "meaning"]),
  // Tracking (15)
  I("Dashboard", "/dashboard", "Main platform dashboard with key metrics", "Tracking", ["home", "overview"]),
  I("Flourishing Score", "/flourishing-score", "Your composite flourishing score", "Tracking", ["score", "composite"]),
  I("Life Wheel", "/life-wheel", "Visual assessment of all life domains", "Tracking", ["balance", "domains"]),
  I("Goals", "/goals", "Set and track personal goals", "Tracking", ["objectives", "targets"]),
  I("Habits", "/habits", "Build and track daily habits", "Tracking", ["streaks", "routine"]),
  I("Progress", "/progress", "Visualize long-term progress", "Tracking", ["charts", "growth"]),
  I("Trends", "/trends", "Data trends and analytics", "Tracking", ["analytics", "graphs"]),
  I("Correlations", "/correlations", "Discover metric correlations", "Tracking", ["correlation", "data science"]),
  I("Trajectory", "/trajectory", "Project future outcomes from data", "Tracking", ["forecast", "projection"]),
  I("Timeline", "/timeline", "Visual timeline of life events", "Tracking", ["milestones", "events"]),
  I("Insights", "/insights", "AI-generated insights from your data", "Tracking", ["ai", "patterns"]),
  I("Morning Briefing", "/morning-briefing", "Personalized daily morning summary", "Tracking", ["morning", "daily"]),
  I("Weekly Reflection", "/weekly-reflection", "Weekly review and planning session", "Tracking", ["weekly", "review"]),
  I("Planner", "/planner", "Daily and weekly planning tool", "Tracking", ["schedule", "calendar"]),
  I("Notes", "/notes", "Personal notes and quick capture", "Tracking", ["notes", "write"]),
  // Social (12)
  I("Community Hub", "/community/hub", "Connect with the flourishing community", "Social", ["forum", "discuss"]),
  I("Relationships", "/relationships", "Relationship health and communication", "Social", ["partner", "love"]),
  I("Communication", "/communication", "Improve communication skills", "Social", ["speaking", "listening"]),
  I("Conflict Resolution", "/conflict-resolution", "Resolve interpersonal conflicts", "Social", ["argument", "mediation"]),
  I("Negotiation", "/negotiation", "Negotiation frameworks and practice", "Social", ["deal", "salary"]),
  I("Parenting", "/parenting", "Evidence-based parenting strategies", "Social", ["children", "kids"]),
  I("Family Meeting", "/family-meeting", "Templates for family meetings", "Social", ["family", "agenda"]),
  I("Marriage Health", "/marriage-health", "Tools for a thriving marriage", "Social", ["spouse", "partnership"]),
  I("Date Nights", "/date-nights", "Date night ideas and planning", "Social", ["romance", "couple"]),
  I("Elder Care", "/elder-care", "Resources for caring for aging parents", "Social", ["aging", "seniors"]),
  I("Accountability", "/accountability", "Accountability partners and groups", "Social", ["commitment", "group"]),
  I("Hive Mind", "/hive-mind", "Collective intelligence and decisions", "Social", ["crowdsource", "wisdom"]),
  // Canada (15)
  I("Canada Overview", "/canada", "State of Canada dashboard and metrics", "Canada", ["overview", "national"]),
  I("Healthcare System", "/canada/healthcare", "Analysis of Canada's healthcare", "Canada", ["medicare", "wait times"]),
  I("Housing Crisis", "/canada/housing", "Canadian housing affordability", "Canada", ["housing", "affordability"]),
  I("Tax Burden", "/canada/tax-burden", "Tax burden analysis by province", "Canada", ["tax", "provincial"]),
  I("Tax Optimization", "/canada/tax-optimization", "Legal tax optimization strategies", "Canada", ["TFSA", "RRSP"]),
  I("Immigration", "/canada/immigration", "Immigration data and policy", "Canada", ["immigration", "PR"]),
  I("Crime Statistics", "/canada/crime", "Crime data and safety by region", "Canada", ["crime", "safety"]),
  I("Education System", "/canada/education", "Canadian education quality analysis", "Canada", ["schools", "university"]),
  I("Demographics", "/canada/demographics", "Population demographics and trends", "Canada", ["population", "age"]),
  I("Government Spending", "/canada/spending", "Where tax dollars go", "Canada", ["spending", "deficit"]),
  I("Benefits Guide", "/canada/benefits", "Government benefits and programs", "Canada", ["CPP", "EI", "OAS"]),
  I("Oligopolies", "/canada/oligopolies", "Market concentration and corporate power", "Canada", ["monopoly", "telecom"]),
  I("Canada vs World", "/canada/vs-world", "How Canada compares internationally", "Canada", ["comparison", "ranking"]),
  I("Blueprint", "/canada/blueprint", "A blueprint for Canadian renewal", "Canada", ["reform", "solutions"]),
  I("Root Causes", "/canada/root-causes", "Root cause analysis of challenges", "Canada", ["systemic", "analysis"]),
  // Tools (15)
  I("Wallet", "/wallet", "FOUND and VOICE token wallet", "Tools", ["tokens", "FOUND", "VOICE"]),
  I("Profile", "/profile", "Your identity and profile settings", "Tools", ["identity", "avatar"]),
  I("Settings", "/settings", "Platform settings and preferences", "Tools", ["preferences", "config"]),
  I("Knowledge Map", "/knowledge-map", "Visual map of your knowledge graph", "Tools", ["graph", "connections"]),
  I("Book Library", "/book-library", "Track books read and reading list", "Tools", ["books", "reading"]),
  I("Bookmarks", "/bookmarks", "Saved pages and resources", "Tools", ["saved", "favorites"]),
  I("Character Sheet", "/character-sheet", "RPG-style character sheet", "Tools", ["RPG", "stats", "level up"]),
  I("Vision Board", "/vision-board", "Create visual goal boards", "Tools", ["visualization", "dream"]),
  I("Values", "/values", "Discover and rank your core values", "Tools", ["values", "principles"]),
  I("30-Day Challenges", "/30-day-challenges", "Structured improvement challenges", "Tools", ["challenge", "habit"]),
  I("Skills", "/skills", "Track and develop your skill set", "Tools", ["competencies", "learning"]),
  I("Explore", "/explore", "Discover new features and content", "Tools", ["discover", "browse"]),
  I("Roadmap", "/roadmap", "Platform development roadmap", "Tools", ["features", "upcoming"]),
  I("What's New", "/whats-new", "Latest platform updates", "Tools", ["changelog", "releases"]),
  I("Tokens", "/tokens", "FOUND and VOICE token economics", "Tools", ["tokenomics", "governance"]),
]

export function SearchOverlay() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const filtered = query.length < 1 ? [] : SEARCH_INDEX.filter((entry) => {
    const q = query.toLowerCase()
    return (
      entry.title.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.category.toLowerCase().includes(q) ||
      entry.keywords.some((k) => k.toLowerCase().includes(q))
    )
  })

  const grouped = CATEGORIES.reduce<Record<string, SearchEntry[]>>((acc, cat) => {
    const items = filtered.filter((e) => e.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  const flatResults = Object.values(grouped).flat()

  const openOverlay = useCallback(() => { setOpen(true); setQuery(""); setSelectedIndex(0) }, [])
  const closeOverlay = useCallback(() => { setOpen(false); setQuery("") }, [])

  const navigateTo = useCallback((path: string) => {
    closeOverlay()
    router.push(path)
  }, [closeOverlay, router])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => { if (prev) { closeOverlay(); return false } else { openOverlay(); return true } })
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [openOverlay, closeOverlay])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10)
  }, [open])

  useEffect(() => { setSelectedIndex(0) }, [query])

  useEffect(() => {
    const el = resultsRef.current?.querySelector("[data-selected='true']")
    el?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { closeOverlay(); return }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1)) }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)) }
    if (e.key === "Enter" && flatResults[selectedIndex]) { navigateTo(flatResults[selectedIndex].path) }
  }

  if (!open) return null

  let itemIdx = -1

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={closeOverlay}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, tools, guides..."
            className="border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground shrink-0">
            ESC
          </kbd>
          <button onClick={closeOverlay} className="sm:hidden p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto p-2">
          {query.length > 0 && flatResults.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No pages found for "{query}"</p>
          )}
          {query.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">Start typing to search across {SEARCH_INDEX.length} pages</p>
          )}
          {Object.entries(grouped).map(([category, entries]) => (
            <div key={category} className="mb-1">
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </p>
              {entries.map((entry) => {
                itemIdx++
                const idx = itemIdx
                const isSelected = idx === selectedIndex
                return (
                  <button
                    key={entry.path}
                    data-selected={isSelected}
                    onClick={() => navigateTo(entry.path)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                      isSelected ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", isSelected && "text-foreground")}>{entry.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{entry.description}</p>
                    </div>
                    <Badge variant="outline" className={cn("shrink-0 text-[10px]", CATEGORY_COLORS[entry.category])}>
                      {entry.category}
                    </Badge>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        {flatResults.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
            <span>{flatResults.length} result{flatResults.length !== 1 ? "s" : ""}</span>
            <div className="flex items-center gap-2">
              <kbd className="rounded border border-border bg-muted px-1 font-mono">↑↓</kbd>
              <span>navigate</span>
              <kbd className="rounded border border-border bg-muted px-1 font-mono">↵</kbd>
              <span>open</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
