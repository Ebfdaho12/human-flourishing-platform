"use client"

import { useState } from "react"
import { Briefcase, DollarSign, Clock, TrendingUp, Star, ChevronDown, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const HUSTLES: {
  name: string
  category: string
  income: string
  startup: string
  timeNeeded: string
  difficulty: string
  scalable: boolean
  description: string
  howToStart: string[]
  warning: string
}[] = [
  {
    name: "Freelance Writing / Copywriting",
    category: "Skill-Based",
    income: "$500-$5,000/month",
    startup: "$0-$50 (portfolio website)",
    timeNeeded: "5-20 hrs/week",
    difficulty: "Medium",
    scalable: true,
    description: "Write blog posts, website copy, emails, or technical documentation for businesses. Every company needs content but most cannot write it themselves.",
    howToStart: [
      "Write 3-5 sample articles on topics you know",
      "Create a free portfolio on Contently, Clippings.me, or a simple website",
      "Start on Upwork or Fiverr to build reviews (accept lower rates initially)",
      "Once you have 5+ reviews, raise rates and pitch directly to companies",
      "Specialize in a niche (tech, health, finance) to command premium rates",
    ],
    warning: "AI is changing this field rapidly. The writers who survive will be those who add expertise, personality, and strategy — not just words.",
  },
  {
    name: "Lawn Care / Snow Removal",
    category: "Physical",
    income: "$1,000-$5,000/month (seasonal)",
    startup: "$200-$500 (mower, basic equipment)",
    timeNeeded: "10-25 hrs/week",
    difficulty: "Easy",
    scalable: true,
    description: "Mow lawns in summer, shovel/plow snow in winter. Can start with existing equipment and scale by adding clients and hiring help.",
    howToStart: [
      "Start with your own street — knock on 10 doors and offer a competitive rate",
      "Post on local Facebook groups, Nextdoor, and Kijiji",
      "Price per yard ($30-$60/cut) or per driveway ($25-$50/shovel)",
      "Consistent quality + reliability = clients for life. Most people's biggest complaint is unreliable service",
      "Scale: hire a helper, buy a trailer, add landscaping services",
    ],
    warning: "Seasonal in northern climates. Combine lawn care (summer) with snow removal (winter) for year-round income.",
  },
  {
    name: "Tutoring (Math, Science, Languages)",
    category: "Skill-Based",
    income: "$500-$3,000/month",
    startup: "$0",
    timeNeeded: "5-15 hrs/week",
    difficulty: "Easy",
    scalable: true,
    description: "Help students with subjects you are good at. Demand is enormous — especially math, science, French/English, and test prep.",
    howToStart: [
      "List on Wyzant, Tutor.com, or local tutoring groups",
      "Post flyers at schools, libraries, community centers",
      "Start at $25-$35/hour, raise to $50-$80 as you build reviews",
      "Online tutoring via Zoom allows you to reach students anywhere",
      "Group tutoring (3-4 students at once) multiplies your hourly rate",
    ],
    warning: "You do not need to be an expert — you just need to be ahead of the student. A university student can tutor high schoolers.",
  },
  {
    name: "Handyman / Home Repair",
    category: "Physical",
    income: "$1,000-$6,000/month",
    startup: "$200-$800 (tools you probably already own)",
    timeNeeded: "10-30 hrs/week",
    difficulty: "Medium",
    scalable: true,
    description: "Fix things in people's homes — leaky faucets, drywall patches, furniture assembly, painting, deck staining. Most homeowners cannot or will not do this themselves.",
    howToStart: [
      "List on TaskRabbit, Jiffy, or Handy",
      "Post on local Facebook marketplace and Kijiji",
      "Start with small jobs ($50-$150) to build reviews",
      "Charge $40-$80/hour or quote by the job",
      "Specializing (e.g., bathroom renovations, painting) commands higher rates",
    ],
    warning: "Insurance is important — even basic liability insurance ($300-$500/year) protects you if something goes wrong. Some work requires licensing (electrical, plumbing).",
  },
  {
    name: "Sell on Etsy / Handmade Goods",
    category: "Creative",
    income: "$200-$5,000/month",
    startup: "$50-$300 (materials)",
    timeNeeded: "10-20 hrs/week",
    difficulty: "Medium",
    scalable: true,
    description: "Create and sell handmade products: candles, jewelry, art prints, custom signs, knitted goods, woodwork, digital downloads (printables, planners, wall art).",
    howToStart: [
      "Pick ONE product — do not try to sell everything",
      "Make 10-20 items, photograph them well (phone + natural light = fine)",
      "List on Etsy ($0.20/listing). SEO matters — research what people search for",
      "Digital downloads (printables, templates) have zero material cost and sell infinitely",
      "Reinvest first profits into better materials and paid Etsy ads",
    ],
    warning: "Etsy fees add up (6.5% transaction + payment processing). Factor this into pricing. Many sellers undercharge — price for your time + materials + profit.",
  },
  {
    name: "Reselling / Flipping",
    category: "Entrepreneurial",
    income: "$500-$3,000/month",
    startup: "$100-$500 (initial inventory)",
    timeNeeded: "10-20 hrs/week",
    difficulty: "Easy-Medium",
    scalable: true,
    description: "Buy undervalued items at thrift stores, garage sales, auctions, or liquidation sales and resell on eBay, Facebook Marketplace, or Amazon.",
    howToStart: [
      "Start at thrift stores — look for brand names priced wrong ($5 Nike jacket sells for $40)",
      "Use the eBay app to scan barcodes and check sold prices before buying",
      "Best categories: brand clothing, electronics, books, vintage items, tools",
      "List on eBay (most buyers), Facebook Marketplace (local, no shipping), or Amazon (books)",
      "Furniture flipping (paint + repair = 3-5x markup) is excellent for local sales",
    ],
    warning: "Track expenses carefully — it is easy to think you are making money while spending it all on inventory. Revenue is not profit.",
  },
  {
    name: "Dog Walking / Pet Sitting",
    category: "Physical",
    income: "$500-$2,500/month",
    startup: "$0-$50",
    timeNeeded: "10-20 hrs/week",
    difficulty: "Easy",
    scalable: true,
    description: "Walk dogs during the day, pet-sit when owners travel. Perfect for a stay-at-home parent — bring your kids along on walks.",
    howToStart: [
      "Sign up on Rover, Wag, or PetBacker",
      "Post on neighborhood Facebook groups",
      "Start at $15-$20/walk (30 min), raise as you build reviews",
      "Pet sitting during holidays pays $40-$80/night",
      "Walking 3-4 dogs at once multiplies your hourly rate",
    ],
    warning: "Insurance is worth it. Dogs can be unpredictable. Rover provides some coverage but having your own policy is safer.",
  },
  {
    name: "Virtual Assistant",
    category: "Skill-Based",
    income: "$1,000-$4,000/month",
    startup: "$0 (just a laptop)",
    timeNeeded: "10-30 hrs/week",
    difficulty: "Easy-Medium",
    scalable: true,
    description: "Help business owners with email, scheduling, social media, data entry, bookkeeping, customer service — all remotely from home.",
    howToStart: [
      "List on Belay, Time Etc, Upwork, or Fiverr",
      "Start at $15-$20/hour, raise to $25-$50 with experience",
      "Specialize: social media VAs, bookkeeping VAs, and real estate VAs earn more",
      "Most clients need 5-10 hours/week — stack 3-4 clients for full-time income",
      "Best for: organized people who are good with email, spreadsheets, and communication",
    ],
    warning: "Protect your time — some clients will try to get 40 hours of work for 10 hours of pay. Set clear boundaries on hours and response times.",
  },
  {
    name: "Teach a Skill Online (Course / Coaching)",
    category: "Skill-Based",
    income: "$500-$10,000+/month",
    startup: "$0-$200",
    timeNeeded: "5-20 hrs/week",
    difficulty: "Medium-Hard",
    scalable: true,
    description: "Package your expertise into a course, coaching program, or paid community. If you know something well enough to teach it, people will pay to learn it.",
    howToStart: [
      "Pick ONE specific topic you know well (not 'fitness' — 'meal prep for busy parents')",
      "Start by teaching for free on YouTube or social media to build trust",
      "Create a simple course on Teachable, Gumroad, or Kajabi",
      "Start with 1-on-1 coaching ($50-$200/session) before building a course",
      "A course is built once and sold forever — the ultimate scalable income",
    ],
    warning: "Building an audience takes time — 6-12 months of consistent free content before most people see significant course sales. Patience is required.",
  },
]

const CATEGORIES = [...new Set(HUSTLES.map(h => h.category))]

export default function SideHustlesPage() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [filterCat, setFilterCat] = useState<string | null>(null)

  const filtered = filterCat ? HUSTLES.filter(h => h.category === filterCat) : HUSTLES

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Side Hustle Finder</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          9 proven ways to earn extra income — with realistic numbers, startup costs, and step-by-step how to start.
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The goal is not to work more.</strong> The goal is to earn more per hour, build something that grows,
            or create income that does not require your time (courses, digital products). An extra $500-$1,000/month
            can be the difference between dual-income stress and single-income freedom. These are all things real people
            do — not get-rich-quick schemes.
          </p>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat(null)}
          className={cn("text-xs rounded-full px-3 py-1 border transition-colors",
            !filterCat ? "bg-emerald-100 border-emerald-300 text-emerald-700 font-semibold" : "border-border text-muted-foreground"
          )}>All ({HUSTLES.length})</button>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilterCat(filterCat === cat ? null : cat)}
            className={cn("text-xs rounded-full px-3 py-1 border transition-colors",
              filterCat === cat ? "bg-emerald-100 border-emerald-300 text-emerald-700 font-semibold" : "border-border text-muted-foreground"
            )}>{cat}</button>
        ))}
      </div>

      {/* Hustles */}
      <div className="space-y-3">
        {filtered.map((h, i) => {
          const globalIdx = HUSTLES.indexOf(h)
          const isOpen = expanded === globalIdx
          return (
            <Card key={h.name} className="card-hover cursor-pointer" onClick={() => setExpanded(isOpen ? null : globalIdx)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{h.name}</p>
                      <Badge variant="outline" className="text-[9px]">{h.category}</Badge>
                      {h.scalable && <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-300">Scalable</Badge>}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-emerald-600">{h.income}</span>
                      <span>Startup: {h.startup}</span>
                      <span>{h.timeNeeded}</span>
                    </div>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="mt-3 pl-13 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">{h.description}</p>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">How to Start</p>
                      <ol className="space-y-1">
                        {h.howToStart.map((step, j) => (
                          <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                            <span className="text-emerald-500 font-bold shrink-0">{j + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="rounded-lg bg-amber-50/50 border border-amber-200 p-2.5">
                      <p className="text-xs text-amber-800"><strong>Watch out:</strong> {h.warning}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The $500/month rule:</strong> An extra $500/month = $6,000/year. Invested at 7% for 20 years, that becomes
            $263,000. For 30 years: $610,000. A side hustle is not just extra spending money — it is a wealth-building
            engine when the income is invested instead of spent. Use the{" "}
            <a href="/compound-interest" className="text-violet-600 hover:underline font-medium">Compound Interest Visualizer</a>{" "}
            to see what your side hustle income could grow into.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/career-path" className="text-sm text-emerald-600 hover:underline">Career Path Explorer</a>
        <a href="/skills" className="text-sm text-cyan-600 hover:underline">Skill Inventory</a>
        <a href="/budget" className="text-sm text-blue-600 hover:underline">Budget Calculator</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
      </div>
    </div>
  )
}
