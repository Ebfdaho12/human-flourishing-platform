"use client"

import { useState } from "react"
import {
  Search, Wrench, DollarSign, Heart, Brain, GraduationCap, Users,
  Home, Apple, Shield, Globe2, BookOpen, Target, Calculator, Briefcase,
  Baby, Clock, Flame, Star, PenLine, Scale, Layers, Moon, MessageCircle,
  Trophy, CreditCard, Utensils, Radio, Monitor, Coins, ChevronRight,
  Zap, MapPin, TrendingUp, Landmark
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Tool {
  name: string
  href: string
  desc: string
  icon: any
  category: string
  tags: string[]
}

const TOOLS: Tool[] = [
  // ─── FINANCIAL ──────────────────────────────────────────────────────────────
  { name: "Budget Calculator", href: "/budget", desc: "Full income/expense tracker with single-income simulator", icon: Calculator, category: "Financial", tags: ["money", "budget", "expenses", "income"] },
  { name: "Net Worth Tracker", href: "/net-worth", desc: "Assets minus liabilities — the most important number", icon: DollarSign, category: "Financial", tags: ["money", "assets", "debt", "wealth"] },
  { name: "Debt Payoff Calculator", href: "/debt-payoff", desc: "Snowball vs avalanche — see exactly when you are free", icon: Target, category: "Financial", tags: ["debt", "loans", "credit", "payoff"] },
  { name: "Compound Interest", href: "/compound-interest", desc: "See your money grow over 10, 20, 30 years", icon: TrendingUp, category: "Financial", tags: ["investing", "savings", "growth", "retirement"] },
  { name: "Tax Estimator", href: "/tax-estimator", desc: "Canadian and US tax brackets, effective vs marginal rate", icon: Calculator, category: "Financial", tags: ["tax", "income", "brackets", "CCB"] },
  { name: "Subscription Audit", href: "/subscriptions", desc: "Find forgotten subscriptions, see cost in hours of life", icon: CreditCard, category: "Financial", tags: ["subscriptions", "waste", "audit", "cancel"] },
  { name: "Cost of Living", href: "/cost-of-living", desc: "Compare real costs between 20 cities worldwide", icon: MapPin, category: "Financial", tags: ["cities", "housing", "cost", "compare"] },
  { name: "Negotiation Scripts", href: "/negotiation", desc: "Word-for-word scripts for raises, bills, rent, cars", icon: MessageCircle, category: "Financial", tags: ["negotiate", "salary", "bills", "save"] },
  { name: "Side Hustle Finder", href: "/side-hustles", desc: "9 proven income sources with realistic numbers", icon: Briefcase, category: "Financial", tags: ["income", "hustle", "freelance", "earn"] },
  { name: "Financial Literacy", href: "/education/finance", desc: "Money, taxes, investing, blockchain — simply explained", icon: GraduationCap, category: "Financial", tags: ["learn", "money", "investing", "taxes"] },
  { name: "Wallet & Tokens", href: "/wallet", desc: "FOUND token balance, staking, and VOICE governance", icon: Coins, category: "Financial", tags: ["tokens", "crypto", "staking", "FOUND"] },

  // ─── FAMILY ─────────────────────────────────────────────────────────────────
  { name: "Family Economics", href: "/family-economics", desc: "How one income can support a thriving family", icon: Home, category: "Family", tags: ["family", "income", "children", "stay home"] },
  { name: "Family Meeting", href: "/family-meeting", desc: "30-min structured weekly agenda for families", icon: Users, category: "Family", tags: ["family", "meeting", "communication", "weekly"] },
  { name: "Screen Time Tracker", href: "/screen-time", desc: "Track and reduce screen time for the whole family", icon: Monitor, category: "Family", tags: ["screen", "kids", "phone", "tablet"] },
  { name: "Kids Chores & Allowance", href: "/kids-chores", desc: "Age-appropriate chores, earn rewards", icon: Star, category: "Family", tags: ["kids", "chores", "allowance", "responsibility"] },
  { name: "Date Night Ideas", href: "/date-nights", desc: "18 date ideas from free to $$$ with random generator", icon: Heart, category: "Family", tags: ["date", "marriage", "relationship", "romance"] },
  { name: "Meal Planner", href: "/meal-planner", desc: "7-day plan with auto-fill and grocery list generator", icon: Utensils, category: "Family", tags: ["meals", "cooking", "grocery", "food", "plan"] },
  { name: "Relationships", href: "/relationships", desc: "Track your inner circle, contact frequency, overdue nudges", icon: Users, category: "Family", tags: ["relationships", "friends", "family", "connect"] },

  // ─── HEALTH ─────────────────────────────────────────────────────────────────
  { name: "Health Dashboard", href: "/health", desc: "Weight, mood, sleep, exercise — all in one place", icon: Heart, category: "Health", tags: ["health", "weight", "mood", "tracking"] },
  { name: "Sleep Calculator", href: "/sleep-calculator", desc: "Optimal bedtime by 90-minute sleep cycles", icon: Moon, category: "Health", tags: ["sleep", "bedtime", "wake", "cycles"] },
  { name: "Exercise Tracker", href: "/health/exercise", desc: "25 exercises with sets, reps, and progress", icon: Flame, category: "Health", tags: ["exercise", "workout", "fitness", "strength"] },
  { name: "Food Diary", href: "/health/food", desc: "Log meals with nutrition database", icon: Apple, category: "Health", tags: ["food", "nutrition", "diet", "calories"] },
  { name: "Water Tracker", href: "/health/water", desc: "Daily water intake logging", icon: Zap, category: "Health", tags: ["water", "hydration", "intake"] },
  { name: "Medication Tracker", href: "/health/medications", desc: "Medication adherence and reminders", icon: Heart, category: "Health", tags: ["medication", "pills", "adherence"] },
  { name: "Symptom Tracker", href: "/health/symptoms", desc: "Track symptoms and find patterns", icon: Heart, category: "Health", tags: ["symptoms", "pain", "patterns", "health"] },
  { name: "Body Metrics", href: "/health/body", desc: "BMI, measurements, and trends over time", icon: Heart, category: "Health", tags: ["body", "BMI", "weight", "measurements"] },

  // ─── MENTAL HEALTH ──────────────────────────────────────────────────────────
  { name: "Mental Health Hub", href: "/mental-health", desc: "Self-care tools, check-ins, and resources", icon: Brain, category: "Mental Health", tags: ["mental", "health", "self-care", "wellness"] },
  { name: "Gratitude Journal", href: "/mental-health/gratitude", desc: "Daily 3 things — rewire your brain for positivity", icon: Heart, category: "Mental Health", tags: ["gratitude", "journal", "positive"] },
  { name: "Breathing Exercises", href: "/mental-health/breathe", desc: "5 techniques for calm, focus, and sleep", icon: Brain, category: "Mental Health", tags: ["breathing", "calm", "anxiety", "relax"] },
  { name: "Meditation", href: "/mental-health/meditate", desc: "5 guided sessions for different needs", icon: Brain, category: "Mental Health", tags: ["meditation", "mindfulness", "peace"] },
  { name: "Affirmations", href: "/mental-health/affirmations", desc: "43 affirmations across 9 categories", icon: Star, category: "Mental Health", tags: ["affirmations", "positive", "mindset"] },
  { name: "Journal Prompts", href: "/mental-health/prompts", desc: "25 prompts across 7 categories", icon: PenLine, category: "Mental Health", tags: ["journal", "writing", "reflection"] },

  // ─── PERSONAL GROWTH ────────────────────────────────────────────────────────
  { name: "Life Wheel Assessment", href: "/life-wheel", desc: "10 life areas — see your balance at a glance", icon: Target, category: "Personal Growth", tags: ["life", "balance", "assessment", "wheel"] },
  { name: "Core Values Discovery", href: "/values", desc: "40 values, 3-step process to find yours", icon: Shield, category: "Personal Growth", tags: ["values", "purpose", "identity"] },
  { name: "Vision Board", href: "/vision", desc: "Visualize your ideal life across 8 categories", icon: Star, category: "Personal Growth", tags: ["vision", "goals", "dream", "future"] },
  { name: "Skill Inventory", href: "/skills", desc: "Map everything you know, find strategic gaps", icon: Brain, category: "Personal Growth", tags: ["skills", "learning", "gaps", "expertise"] },
  { name: "Career Path Explorer", href: "/career-path", desc: "6 paths with complementary skills and edge ratings", icon: Briefcase, category: "Personal Growth", tags: ["career", "jobs", "skills", "path"] },
  { name: "Decision Journal", href: "/decisions", desc: "Log decisions before outcomes, review after 3 months", icon: Scale, category: "Personal Growth", tags: ["decisions", "thinking", "review"] },
  { name: "Wins & Gratitude", href: "/wins", desc: "Celebrate progress — your brain forgets, this does not", icon: Trophy, category: "Personal Growth", tags: ["wins", "gratitude", "progress", "celebrate"] },
  { name: "Reading List", href: "/reading", desc: "Track books + 20 curated recommendations", icon: BookOpen, category: "Personal Growth", tags: ["books", "reading", "learning"] },
  { name: "30-Day Challenges", href: "/challenges", desc: "Health, Mindset, and Money — one task per day", icon: Flame, category: "Personal Growth", tags: ["challenge", "habits", "30 days"] },
  { name: "Habit Stacking", href: "/habit-stack", desc: "Chain habits together for unstoppable routines", icon: Layers, category: "Personal Growth", tags: ["habits", "routine", "atomic", "stacking"] },

  // ─── PRODUCTIVITY ───────────────────────────────────────────────────────────
  { name: "Daily Planner", href: "/planner", desc: "Time blocks, priority levels, progress tracking", icon: Clock, category: "Productivity", tags: ["planner", "schedule", "tasks", "day"] },
  { name: "Daily Routines", href: "/routine", desc: "5 science-backed routines with checklists", icon: Clock, category: "Productivity", tags: ["routine", "morning", "evening", "habits"] },
  { name: "Focus Timer", href: "/focus", desc: "Pomodoro, Deep Work, and 2 more preset modes", icon: Clock, category: "Productivity", tags: ["focus", "pomodoro", "timer", "deep work"] },
  { name: "Quick Notes", href: "/notes", desc: "Brain dump — voice input, color-coded, pin/search", icon: PenLine, category: "Productivity", tags: ["notes", "ideas", "brain dump", "quick"] },
  { name: "Goals", href: "/goals", desc: "Set, track, and achieve with milestones", icon: Target, category: "Productivity", tags: ["goals", "milestones", "achieve", "track"] },

  // ─── HOME ───────────────────────────────────────────────────────────────────
  { name: "Home Maintenance", href: "/home-maintenance", desc: "Seasonal checklist — prevent $10K repairs with $10 fixes", icon: Wrench, category: "Home", tags: ["home", "maintenance", "repair", "seasonal"] },
  { name: "Emergency Preparedness", href: "/preparedness", desc: "72-hour readiness checklist with progress bar", icon: Shield, category: "Home", tags: ["emergency", "preparedness", "survival", "safety"] },
  { name: "Food System", href: "/food-system", desc: "Who controls your food, what labels mean, grow your own", icon: Apple, category: "Home", tags: ["food", "labels", "organic", "garden", "grow"] },

  // ─── EDUCATION ──────────────────────────────────────────────────────────────
  { name: "Economics Education", href: "/education/economics", desc: "Austrian, Chicago, Keynesian — what schools skip", icon: GraduationCap, category: "Education", tags: ["economics", "austrian", "friedman", "hayek"] },
  { name: "Civilizations Timeline", href: "/civilizations", desc: "5,000 years of patterns — rise, peak, collapse", icon: Globe2, category: "Education", tags: ["history", "civilizations", "empires", "dalio"] },
  { name: "Money History", href: "/money-history", desc: "Barter → gold → Bretton Woods → 1971 → Bitcoin", icon: Coins, category: "Education", tags: ["money", "history", "gold", "1971", "fiat"] },
  { name: "Logical Fallacies", href: "/logical-fallacies", desc: "20 tricks people use to win without being right", icon: Brain, category: "Education", tags: ["logic", "fallacies", "thinking", "debate"] },
  { name: "Media Ownership", href: "/media-ownership", desc: "Who owns every major news outlet (Canada + US)", icon: Radio, category: "Education", tags: ["media", "news", "ownership", "corporate"] },
  { name: "Your Rights", href: "/rights", desc: "Charter of Rights + Bill of Rights in plain language", icon: Shield, category: "Education", tags: ["rights", "charter", "constitution", "law", "freedom"] },
  { name: "Learning Paths", href: "/education", desc: "Socratic AI tutoring and 5 learning curricula", icon: GraduationCap, category: "Education", tags: ["learning", "education", "tutoring", "courses"] },
  { name: "Personalized Learning", href: "/education/personalized", desc: "Learn through your existing interests", icon: GraduationCap, category: "Education", tags: ["learning", "interests", "personalized"] },

  // ─── WORKFORCE ──────────────────────────────────────────────────────────────
  { name: "Workforce Analytics", href: "/workforce", desc: "10 careers + 10 countries demographics/birth rates", icon: Users, category: "Career", tags: ["workforce", "careers", "shortage", "demographics"] },

  // ─── CORE MODULES ───────────────────────────────────────────────────────────
  { name: "Governance", href: "/governance", desc: "Track politicians, votes, legislation, civic guide", icon: Landmark, category: "Core Modules", tags: ["governance", "politics", "voting", "civic"] },
  { name: "DeSci", href: "/desci", desc: "Pre-register studies, peer review, replication", icon: GraduationCap, category: "Core Modules", tags: ["science", "research", "peer review", "studies"] },
  { name: "Economics Data", href: "/economics", desc: "Copenhagen Consensus ROI, FRED data, narratives", icon: TrendingUp, category: "Core Modules", tags: ["economics", "data", "FRED", "ROI"] },
  { name: "Energy", href: "/energy", desc: "Production, P2P trading, climate data, solar ROI", icon: Zap, category: "Core Modules", tags: ["energy", "solar", "P2P", "climate"] },
  { name: "Infrastructure", href: "/infrastructure", desc: "TCO analysis and global benchmarks", icon: Wrench, category: "Core Modules", tags: ["infrastructure", "TCO", "benchmarks"] },
]

const CATEGORIES = [...new Set(TOOLS.map(t => t.category))]
const CATEGORY_COLORS: Record<string, string> = {
  "Financial": "text-emerald-600 border-emerald-300 bg-emerald-50",
  "Family": "text-rose-600 border-rose-300 bg-rose-50",
  "Health": "text-red-600 border-red-300 bg-red-50",
  "Mental Health": "text-violet-600 border-violet-300 bg-violet-50",
  "Personal Growth": "text-cyan-600 border-cyan-300 bg-cyan-50",
  "Productivity": "text-blue-600 border-blue-300 bg-blue-50",
  "Home": "text-amber-600 border-amber-300 bg-amber-50",
  "Education": "text-amber-700 border-amber-400 bg-amber-50",
  "Career": "text-indigo-600 border-indigo-300 bg-indigo-50",
  "Core Modules": "text-slate-600 border-slate-300 bg-slate-50",
}

export default function ToolsPage() {
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState<string | null>(null)

  const filtered = TOOLS.filter(t => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    const matchesCat = !filterCat || t.category === filterCat
    return matchesSearch && matchesCat
  })

  const grouped: Record<string, Tool[]> = {}
  for (const t of filtered) {
    if (!grouped[t.category]) grouped[t.category] = []
    grouped[t.category].push(t)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">All Tools</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {TOOLS.length} tools for health, wealth, family, education, and personal growth. Everything in one place.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search tools... (budget, sleep, kids, negotiate, rights...)"
          className="pl-10 h-11" />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat(null)}
          className={cn("text-xs rounded-full px-3 py-1.5 border transition-colors font-medium",
            !filterCat ? "bg-violet-100 border-violet-300 text-violet-700" : "border-border text-muted-foreground hover:bg-muted/50"
          )}>All ({TOOLS.length})</button>
        {CATEGORIES.map(cat => {
          const count = TOOLS.filter(t => t.category === cat).length
          return (
            <button key={cat} onClick={() => setFilterCat(filterCat === cat ? null : cat)}
              className={cn("text-xs rounded-full px-3 py-1.5 border transition-colors",
                filterCat === cat ? (CATEGORY_COLORS[cat] || "") + " font-medium" : "border-border text-muted-foreground hover:bg-muted/50"
              )}>{cat} ({count})</button>
          )
        })}
      </div>

      {/* Results */}
      {search && filtered.length === 0 && (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
          No tools match &quot;{search}&quot;. Try a different search term.
        </CardContent></Card>
      )}

      {/* Grouped tools */}
      <div className="space-y-6">
        {(filterCat ? [filterCat] : CATEGORIES).filter(cat => grouped[cat]?.length > 0).map(cat => (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{cat}</h2>
              <Badge variant="outline" className={cn("text-[9px]", CATEGORY_COLORS[cat])}>{grouped[cat].length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {grouped[cat].map(tool => {
                const Icon = tool.icon
                return (
                  <a key={tool.href} href={tool.href}>
                    <Card className="card-hover h-full">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          CATEGORY_COLORS[tool.category]?.replace("text-", "text-").split(" ").slice(0, 2).join(" ") || "bg-muted text-muted-foreground"
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{tool.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{tool.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/20 shrink-0" />
                      </CardContent>
                    </Card>
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
