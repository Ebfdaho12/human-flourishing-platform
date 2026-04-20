"use client"

import {
  Globe2, DollarSign, Home, Heart, Shield, Users, GraduationCap,
  Zap, Droplets, Wheat, Factory, TrendingUp, Baby, MapPin, Briefcase,
  Wrench, Scale, Target, ChevronRight, Radio
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const SECTIONS = [
  {
    title: "The Big Picture",
    color: "from-red-600 to-red-700",
    pages: [
      { name: "Sovereignty Report", href: "/canada", icon: Globe2, desc: "Assets, dependencies, trade, 25-year roadmap" },
      { name: "Blueprint: Rebuild Canada", href: "/canada/blueprint", icon: Target, desc: "Region-by-region playbook + national scorecard" },
      { name: "Trajectories", href: "/canada/trajectories", icon: TrendingUp, desc: "Political theatre vs 1,000-year solutions" },
      { name: "Canada vs The World", href: "/canada/vs-world", icon: Globe2, desc: "15 metrics compared to peer nations" },
      { name: "Root Causes", href: "/canada/root-causes", icon: Scale, desc: "6 problems traced to the decisions that caused them" },
    ],
  },
  {
    title: "Economy & Money",
    color: "from-emerald-600 to-teal-700",
    pages: [
      { name: "Government Spending", href: "/canada/spending", icon: DollarSign, desc: "Where the money goes + documented waste" },
      { name: "Your Real Tax Burden", href: "/canada/tax-burden", icon: DollarSign, desc: "ALL taxes — the real 40-55%" },
      { name: "Tax Optimization (TFSA/RRSP)", href: "/canada/tax-optimization", icon: DollarSign, desc: "Save $2K-$10K/year in taxes" },
      { name: "Benefits Finder", href: "/canada/benefits", icon: DollarSign, desc: "Every benefit you qualify for" },
      { name: "Small Business", href: "/canada/small-business", icon: Briefcase, desc: "Province-by-province comparison + barriers" },
      { name: "Oligopolies", href: "/canada/oligopolies", icon: Radio, desc: "Telecom, banking, grocery price gouging" },
    ],
  },
  {
    title: "Housing & Living",
    color: "from-blue-600 to-indigo-700",
    pages: [
      { name: "Housing Crisis", href: "/canada/housing", icon: Home, desc: "12 cities, 6 causes, solutions" },
      { name: "Provincial Comparison", href: "/canada/compare", icon: MapPin, desc: "Compare any 2 provinces side by side" },
      { name: "Immigration Dashboard", href: "/canada/immigration", icon: Users, desc: "Newcomers vs capacity — the honest data" },
      { name: "Demographics", href: "/canada/demographics", icon: Baby, desc: "Birth rate crisis (1.26) + what would fix it" },
      { name: "Birth Fund", href: "/birth-fund", icon: Baby, desc: "Retirement from day one — policy proposal" },
    ],
  },
  {
    title: "Systems & Services",
    color: "from-violet-600 to-purple-700",
    pages: [
      { name: "Healthcare", href: "/canada/healthcare", icon: Heart, desc: "Wait times, spending vs outcomes, what works elsewhere" },
      { name: "Education", href: "/canada/education", icon: GraduationCap, desc: "PISA decline, screen time, what works" },
      { name: "Infrastructure", href: "/canada/infrastructure", icon: Wrench, desc: "6-sector report card, $400B+ deficit" },
    ],
  },
  {
    title: "Strategic Resources",
    color: "from-amber-600 to-orange-700",
    pages: [
      { name: "Energy Deep Dive", href: "/canada/energy", icon: Zap, desc: "Oil, nuclear, hydro, clean energy by province" },
      { name: "Water Security", href: "/canada/water", icon: Droplets, desc: "20% of world freshwater, barely protected" },
      { name: "Food Security", href: "/canada/food-security", icon: Wheat, desc: "What we grow, import, and the 3-day vulnerability" },
      { name: "Military & Defence", href: "/canada/defence", icon: Shield, desc: "40 Russian Arctic bases vs 1 Canadian" },
    ],
  },
]

export default function CanadaIndexPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700">
            <Globe2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada — Complete Analysis</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          23 deep pages covering every major Canadian system. The most comprehensive publicly available analysis in one place.
        </p>
      </div>

      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This section covers: sovereignty and resources, government spending and waste, housing crisis,
            healthcare system, education decline, energy policy, water security, food security, military readiness,
            immigration capacity, demographics and birth rate, oligopolies, infrastructure, small business barriers,
            tax burden, tax optimization, provincial comparison, benefits finder, and a forward-looking blueprint
            with multiple trajectory scenarios. Data-driven. Both sides. No political labels.
          </p>
        </CardContent>
      </Card>

      {SECTIONS.map((section, si) => (
        <div key={si}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">{section.title}</h2>
          <div className="space-y-1.5">
            {section.pages.map((page, pi) => {
              const Icon = page.icon
              return (
                <a key={pi} href={page.href}>
                  <Card className="card-hover">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white", section.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{page.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{page.desc}</p>
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

      <div className="flex gap-3 flex-wrap">
        <a href="/governance" className="text-sm text-blue-600 hover:underline">Governance Module</a>
        <a href="/civilizations" className="text-sm text-amber-600 hover:underline">Civilizations</a>
        <a href="/education/economics" className="text-sm text-emerald-600 hover:underline">Economics Education</a>
      </div>
    </div>
  )
}
