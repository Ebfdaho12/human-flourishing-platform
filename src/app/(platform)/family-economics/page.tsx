"use client"

import { useState } from "react"
import {
  Home, Heart, Baby, DollarSign, TrendingDown, TrendingUp, Scale,
  Clock, ShieldCheck, GraduationCap, Users, ArrowRight, ChevronDown,
  Lightbulb, BarChart3, AlertTriangle, Sprout
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ────────────────────────────────────────────
// DATA: What happened to the single-income family?
// ────────────────────────────────────────────

const TIMELINE = [
  {
    year: "1970",
    income: "Median household: $9,870 (~$76,000 adjusted)",
    housing: "Median home: $23,000 (~2.3x income)",
    family: "52% of families had one earner",
    note: "A single factory/office job could buy a home, a car, feed a family, and save for retirement.",
  },
  {
    year: "1990",
    income: "Median household: $29,943",
    housing: "Median home: $79,100 (~2.6x income)",
    family: "Dual income becoming the norm — not for luxury, but to keep up",
    note: "Housing, healthcare, and education costs began outpacing wage growth significantly.",
  },
  {
    year: "2000",
    income: "Median household: $42,148",
    housing: "Median home: $119,600 (~2.8x income)",
    family: "Childcare costs doubled from 1990 levels",
    note: "Elizabeth Warren's 'Two-Income Trap' documented how dual incomes didn't increase financial security — they increased fixed costs.",
  },
  {
    year: "2024",
    income: "Median household: $80,610",
    housing: "Median home: $420,400 (~5.2x income)",
    family: "Average childcare: $15,000-$25,000/year per child",
    note: "For many families, one parent's entire salary goes to childcare + taxes + commuting. Working becomes a net-zero or net-negative financial decision.",
  },
]

const COST_EXPLOSION = [
  { label: "Housing", then: "$23,000", now: "$420,400", increase: "1,728%", wageGrowth: "670%", icon: Home },
  { label: "Healthcare", then: "$350/yr", now: "$24,000/yr family", increase: "6,757%", wageGrowth: "670%", icon: Heart },
  { label: "College (4yr public)", then: "$1,200/yr", now: "$24,000/yr", increase: "1,900%", wageGrowth: "670%", icon: GraduationCap },
  { label: "Childcare (per child)", then: "~$1,500/yr", now: "$15,000+/yr", increase: "900%+", wageGrowth: "670%", icon: Baby },
]

const DUAL_INCOME_TRAP = [
  {
    title: "The Bidding War Effect",
    text: "When most families have two incomes, housing prices rise to absorb that second income. Banks approve larger mortgages, sellers price higher. The second income doesn't make you richer — it raises the floor for everyone.",
  },
  {
    title: "The Childcare Paradox",
    text: "The average family spends $15,000-$25,000/year per child on childcare. After taxes, commuting, work clothes, and convenience spending (fast food, services you'd do yourself with time), many second earners net $5,000-$15,000. Some net negative.",
  },
  {
    title: "The Safety Net Disappeared",
    text: "In a single-income family, if the earner loses their job, the other parent can enter the workforce. In a dual-income family, there's no backup — both incomes are already committed to fixed expenses. One job loss = crisis.",
  },
  {
    title: "The Time Tax",
    text: "Two working parents means less time for cooking (more eating out), less time for home repair (more hiring out), less time for childcare (more paying for it). The money earned is spent replacing the labor that used to happen at home.",
  },
]

const BUTTERFLY_EFFECTS = [
  {
    area: "Children",
    icon: Baby,
    color: "text-rose-600 bg-rose-100",
    effects: [
      "Children with a present parent in early years show stronger emotional regulation and attachment security",
      "Reduced screen time — engaged parent replaces passive entertainment",
      "Homework help, reading together, and conversations build 30% larger vocabularies by age 3",
      "Lower anxiety and behavioral issues — children feel more secure with consistent parental presence",
      "Home-cooked meals improve nutrition, reduce childhood obesity rates",
    ],
  },
  {
    area: "Parents",
    icon: Heart,
    color: "text-violet-600 bg-violet-100",
    effects: [
      "Dramatically reduced stress — no more juggling two jobs, daycare schedules, and household duties",
      "Stronger marriage/partnership — more time together, less financial pressure arguments",
      "Better physical health — time to cook, exercise, sleep properly",
      "Reduced mental health burden — burnout, guilt, and overwhelm decrease significantly",
      "The working parent performs better at their job with a stable home base",
    ],
  },
  {
    area: "Community",
    icon: Users,
    color: "text-blue-600 bg-blue-100",
    effects: [
      "Present parents create safer neighborhoods — more eyes on streets, more involved in schools",
      "Volunteerism increases — someone has capacity to give back",
      "Local economies benefit — home cooking, gardening, and DIY reduce dependency on corporations",
      "Elderly care improves — extended family support becomes possible again",
      "Social fabric strengthens — neighbors know each other, children play together",
    ],
  },
  {
    area: "Economy",
    icon: DollarSign,
    color: "text-emerald-600 bg-emerald-100",
    effects: [
      "Reduced childcare industry dependency — families keep more of what they earn",
      "Lower healthcare costs — less stress-related illness, better nutrition, more preventive care",
      "Housing prices could normalize — less dual-income bidding pressure",
      "Consumer spending shifts from services (daycare, fast food) to savings and investment",
      "Entrepreneurship increases — financial stability from one good income + low expenses enables risk-taking",
    ],
  },
]

const STRATEGIES = [
  {
    category: "Reduce the Big 3 (Housing, Transport, Food)",
    icon: Home,
    color: "from-emerald-500 to-teal-600",
    actions: [
      { title: "Geographic arbitrage", desc: "Move to where cost of living is 40-60% lower. Remote work makes this possible. A $80K salary in rural Tennessee buys what $150K buys in San Francisco." },
      { title: "House hack", desc: "Buy a duplex/triplex, live in one unit, rent the others. Your tenants pay your mortgage. This single strategy has created more financial freedom than almost any other." },
      { title: "One car family", desc: "The average car costs $12,000/year (payment, insurance, gas, maintenance). Eliminating one car saves $1,000/month." },
      { title: "Meal planning + bulk cooking", desc: "A family spending $1,200/month eating out can spend $400/month cooking at home — better nutrition, better health, $9,600/year saved." },
      { title: "Eliminate lifestyle inflation", desc: "When income rises, keep expenses flat. The gap between income and expenses is the only number that matters." },
    ],
  },
  {
    category: "Increase Income Quality (Not Quantity)",
    icon: TrendingUp,
    color: "from-violet-500 to-purple-600",
    actions: [
      { title: "Skill up into shortage fields", desc: "Trades (electrician, plumber, HVAC), nursing, cybersecurity, truck driving — these pay $60K-$120K with less than 4 years of training and massive demand." },
      { title: "Negotiate, don't just accept", desc: "The average person leaves $500K-$1M on the table over their career by not negotiating. One conversation can be worth $5,000-$15,000/year." },
      { title: "Build one income source to replace two", desc: "Overtime, certifications, side income, or promotion at one job can match what two mediocre jobs provide — without the childcare cost." },
      { title: "Freelance/contract for higher hourly rates", desc: "Many skills pay 2-3x more as freelance/contract vs. salary. 30 hours/week at $75/hr beats 40 hours at $30/hr — and you get time back." },
    ],
  },
  {
    category: "Restructure Fixed Costs",
    icon: Scale,
    color: "from-amber-500 to-orange-600",
    actions: [
      { title: "Eliminate debt systematically", desc: "Average American family pays $1,200/month in non-mortgage debt. Eliminating this alone could make single-income possible for many families." },
      { title: "Health sharing or catastrophic plans", desc: "For healthy families, health sharing ministries or high-deductible plans + HSA can cut healthcare costs by 50-70% vs. traditional insurance." },
      { title: "Homeschool or co-op education", desc: "Not for everyone, but families who do it report $0 tuition, stronger family bonds, and educational outcomes that match or exceed public schools." },
      { title: "Multi-generational living", desc: "The nuclear family living alone is historically unusual. Grandparents provide childcare, share housing costs, and maintain family knowledge transfer." },
    ],
  },
  {
    category: "Policy Changes That Would Help",
    icon: ShieldCheck,
    color: "from-blue-500 to-cyan-600",
    actions: [
      { title: "Tax code reform for single-income families", desc: "Currently, a family earning $80K from one income pays more tax than a family earning $40K+$40K. Equalizing this would remove a penalty on single-income families." },
      { title: "Zoning reform", desc: "Restrictive zoning (single-family only) artificially inflates housing costs. Allowing duplexes, ADUs, and mixed-use development increases supply and lowers prices." },
      { title: "Healthcare delinked from employment", desc: "Tying health insurance to jobs forces both parents to work for benefits. Portable, affordable healthcare would free families to choose what works for them." },
      { title: "Anti-monopoly enforcement", desc: "Corporate consolidation in housing, healthcare, food, and education drives prices up. Actual competition brings prices down." },
      { title: "Homesteading and land access programs", desc: "Programs that give families access to affordable land for small-scale farming/homesteading create self-sufficiency and generational wealth." },
    ],
  },
]

// ────────────────────────────────────────────
// The real daily time breakdown
// ────────────────────────────────────────────
const DAILY_TIME_DUAL = [
  { activity: "Sleep", hours: 8, who: "child", color: "bg-indigo-300" },
  { activity: "Daycare / School", hours: 8, who: "institution", color: "bg-slate-300" },
  { activity: "Commute (parent pickup)", hours: 0.5, who: "transition", color: "bg-amber-200" },
  { activity: "Screen time (after school)", hours: 1.5, who: "screen", color: "bg-red-300" },
  { activity: "Supper rush", hours: 1, who: "chore", color: "bg-orange-200" },
  { activity: "Bath / bedtime routine", hours: 1, who: "routine", color: "bg-cyan-200" },
  { activity: "Actual engaged parent time", hours: 0.75, who: "parent", color: "bg-emerald-400" },
  { activity: "Transition / commute / errands", hours: 3.25, who: "lost", color: "bg-gray-200" },
]

const DAILY_TIME_SINGLE = [
  { activity: "Sleep", hours: 8, who: "child", color: "bg-indigo-300" },
  { activity: "School (when age-appropriate)", hours: 6, who: "institution", color: "bg-slate-300" },
  { activity: "Engaged parent time (morning)", hours: 2, who: "parent", color: "bg-emerald-400" },
  { activity: "Engaged parent time (after school)", hours: 3, who: "parent", color: "bg-emerald-400" },
  { activity: "Home-cooked meals together", hours: 1.5, who: "parent", color: "bg-emerald-300" },
  { activity: "Outdoor play / activities", hours: 1.5, who: "parent", color: "bg-emerald-200" },
  { activity: "Reading / learning together", hours: 1, who: "parent", color: "bg-emerald-400" },
  { activity: "Bath / bedtime routine", hours: 1, who: "routine", color: "bg-cyan-200" },
]

// ────────────────────────────────────────────
// Economic value of a stay-at-home parent
// ────────────────────────────────────────────
const HOME_PARENT_VALUE = [
  { role: "Childcare provider", marketRate: "$35,000-$45,000/yr", note: "Full-time nanny rate in most Canadian/US cities" },
  { role: "Cook / meal planner", marketRate: "$8,000-$15,000/yr", note: "Home cooking saves $800-$1,200/month vs. convenience food + eating out" },
  { role: "House cleaner", marketRate: "$6,000-$10,000/yr", note: "Weekly cleaning service runs $150-$250/visit" },
  { role: "Tutor / homework help", marketRate: "$5,000-$10,000/yr", note: "Private tutoring is $40-$80/hour" },
  { role: "Driver / logistics", marketRate: "$3,000-$5,000/yr", note: "No aftercare pickup, no rushing, no Uber when schedules conflict" },
  { role: "Household manager", marketRate: "$3,000-$5,000/yr", note: "Appointments, scheduling, bills, maintenance coordination" },
  { role: "Gardener / home maintenance", marketRate: "$2,000-$5,000/yr", note: "Lawn care + minor repairs + garden that produces food" },
  { role: "Emotional support / therapist", marketRate: "Priceless", note: "A child who feels seen and safe every day — no market rate covers this" },
]

// ────────────────────────────────────────────
// Screen time data
// ────────────────────────────────────────────
const SCREEN_IMPACT = [
  { stat: "Average child screen time", value: "7+ hours/day", source: "Common Sense Media 2023", note: "Up from 4.5 hours pre-pandemic" },
  { stat: "Screen time in JK/SK classrooms", value: "1-2 hours/day", source: "Ontario teacher surveys", note: "Often used as a classroom management tool, not educational tool" },
  { stat: "Reading scores since tablets in schools", value: "Down 14%", source: "OECD PISA 2023", note: "Countries that removed screens from schools saw scores recover" },
  { stat: "Attention span decline (ages 4-8)", value: "33% shorter", source: "Journal of Pediatrics", note: "Directly correlated with daily screen hours" },
  { stat: "YouTube algorithm exposure", value: "6-8 hrs/day", source: "vs. 45 min engaged parent time", note: "The algorithm has more influence on your child's worldview than you do" },
]

// ────────────────────────────────────────────
// Canadian-specific data
// ────────────────────────────────────────────
const CANADA_DATA = {
  childcare: {
    ontario: "$1,500-$2,000/month per child (even with $10/day subsidy waitlists years long)",
    average: "$15,000-$24,000/year per child",
    twoKids: "$30,000-$48,000/year — that is a full salary just for childcare",
  },
  housing: [
    { city: "Toronto (GTA)", median: "$1,100,000", incomeRatio: "13.6x", verdict: "Virtually impossible on one income without significant equity" },
    { city: "Ottawa", median: "$625,000", incomeRatio: "7.8x", verdict: "Difficult but possible with trades income + down payment" },
    { city: "London, ON", median: "$550,000", incomeRatio: "7.3x", verdict: "Achievable with $80K+ income and modest lifestyle" },
    { city: "Winnipeg", median: "$350,000", incomeRatio: "4.4x", verdict: "Very achievable on one skilled trade income" },
    { city: "Moncton, NB", median: "$290,000", incomeRatio: "3.8x", verdict: "Comfortable single-income family life possible" },
    { city: "Thunder Bay", median: "$310,000", incomeRatio: "3.9x", verdict: "Strong trade wages + affordable housing = thriving" },
    { city: "Sault Ste. Marie", median: "$280,000", incomeRatio: "3.7x", verdict: "Excellent cost-of-income ratio" },
  ],
  trades: [
    { trade: "Electrician", wage: "$75,000-$110,000", demand: "Critical shortage", path: "4-year apprenticeship (earn while learning)" },
    { trade: "Plumber", wage: "$70,000-$100,000", demand: "Severe shortage", path: "4-5 year apprenticeship" },
    { trade: "HVAC Technician", wage: "$65,000-$95,000", demand: "High demand", path: "3-4 year apprenticeship" },
    { trade: "Millwright", wage: "$80,000-$120,000", demand: "Critical in manufacturing", path: "4-year apprenticeship" },
    { trade: "Heavy Equipment Operator", wage: "$70,000-$110,000", demand: "Infrastructure boom", path: "Training programs 3-12 months" },
    { trade: "Welder", wage: "$60,000-$100,000", demand: "Shortage across Canada", path: "College diploma + certification" },
    { trade: "Registered Nurse", wage: "$75,000-$105,000", demand: "Extreme shortage", path: "4-year BScN (some bridging programs shorter)" },
    { trade: "Cybersecurity Analyst", wage: "$80,000-$130,000", demand: "Massive global shortage", path: "Certifications + self-study (no degree required)" },
  ],
}

// ────────────────────────────────────────────
// 12-month family roadmap
// ────────────────────────────────────────────
const ROADMAP = [
  {
    phase: "Month 1-2: Know Your Numbers",
    steps: [
      "Calculate your REAL second-income net (income minus childcare, taxes, commute, work costs, convenience spending)",
      "Track every dollar both of you spend for 30 days — the awareness alone changes behavior",
      "Calculate your family's actual minimum viable monthly expenses (not wants, needs)",
      "List every debt with balance, rate, and minimum payment",
    ],
  },
  {
    phase: "Month 3-4: Cut the Fat",
    steps: [
      "Cancel every subscription you forgot about or barely use",
      "Negotiate every bill (internet, phone, insurance) — call and ask for their best rate",
      "Switch to meal planning + bulk cooking — aim to cut food spending by 40%",
      "Evaluate: could you be a one-car family? That saves $800-$1,200/month",
      "If renting: research lower cost-of-living areas where your income or remote work still applies",
    ],
  },
  {
    phase: "Month 5-7: Increase Income Quality",
    steps: [
      "The working parent: negotiate a raise, pursue overtime, or start a certification in a higher-paying field",
      "Research skilled trades if applicable — apprenticeships pay you to learn and lead to $80K-$130K careers",
      "If possible, start a small side income from home (the at-home parent can do this during nap time — not required, but accelerates the timeline)",
      "Attack highest-interest debt aggressively with money freed from months 3-4",
    ],
  },
  {
    phase: "Month 8-10: Build the Safety Net",
    steps: [
      "Target 3-month emergency fund before making the transition",
      "Research all government benefits you qualify for as a single-income family (Canada Child Benefit increases significantly at lower household income)",
      "If considering a move: visit the area, research schools, talk to locals, price housing",
      "Have the conversation with your partner — run the numbers together, make the plan together",
    ],
  },
  {
    phase: "Month 11-12: Make the Transition",
    steps: [
      "Give notice at the right time (after bonus season, after vesting, etc.)",
      "Set up the home systems: meal plans, routines, activity schedules",
      "First month at home: resist the urge to fill time with productivity — bond with your kids first",
      "Track your finances monthly — adjust the budget based on reality, not projection",
      "Revisit after 90 days: most families report lower stress, better health, stronger marriage, happier kids — and often better finances than expected",
    ],
  },
]

const CALCULATOR_SCENARIOS = [
  {
    label: "Dual Income (typical)",
    income1: 55000,
    income2: 42000,
    childcare: 18000,
    taxes2: 8400,
    commute2: 4800,
    workCosts2: 3600, // clothes, lunches, convenience
    netBenefit: 7200,
    note: "Second income of $42K nets only $7,200 after childcare, taxes, commuting, and work expenses. That's $3.46/hour for 40 hours/week.",
  },
  {
    label: "Dual Income (2 kids)",
    income1: 55000,
    income2: 42000,
    childcare: 32000,
    taxes2: 8400,
    commute2: 4800,
    workCosts2: 3600,
    netBenefit: -6800,
    note: "With 2 kids, the second income is NET NEGATIVE. The family literally pays $6,800/year for the privilege of both parents working.",
  },
  {
    label: "Single Income (optimized)",
    income1: 65000,
    income2: 0,
    childcare: 0,
    taxes2: 0,
    commute2: 0,
    workCosts2: 0,
    netBenefit: 0,
    note: "One parent earns $65K (skilled trade, IT, nursing). Zero childcare costs, home-cooked meals, one car, lower stress. Net financial position: often BETTER than dual $55K+$42K.",
  },
]

export default function FamilyEconomicsPage() {
  const [expandedStrategy, setExpandedStrategy] = useState<number | null>(0)
  const [showEffects, setShowEffects] = useState<number | null>(null)

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-600">
            <Home className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Family Economics</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          How to build a life where one income supports a thriving family — and why it matters more than you think.
        </p>
      </div>

      {/* The core question */}
      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-base font-semibold text-amber-900 mb-2">The question nobody asks:</p>
          <p className="text-sm text-amber-800 leading-relaxed">
            In 1970, one factory worker's salary could buy a house, feed a family of four, own a car, and save for retirement.
            Today, two college-educated parents working full-time struggle to afford the same life. What changed — and more
            importantly, what can individual families do about it right now?
          </p>
        </CardContent>
      </Card>

      {/* Timeline: What happened */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" /> What Happened to the Single-Income Family?
        </h2>
        <div className="space-y-0 relative">
          <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-emerald-300 via-amber-300 to-red-300" />
          {TIMELINE.map((t, i) => (
            <div key={t.year} className="flex gap-4 pb-5 relative">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold z-10",
                i === 0 ? "bg-emerald-100 text-emerald-700" :
                i === 1 ? "bg-amber-100 text-amber-700" :
                i === 2 ? "bg-orange-100 text-orange-700" :
                "bg-red-100 text-red-700"
              )}>{t.year}</div>
              <div>
                <p className="text-sm"><strong>Income:</strong> {t.income}</p>
                <p className="text-sm"><strong>Housing:</strong> {t.housing}</p>
                <p className="text-sm"><strong>Family:</strong> {t.family}</p>
                <p className="text-xs text-muted-foreground mt-1 italic">{t.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost explosion vs wages */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-red-500" /> The Numbers: Costs vs. Wages
        </h2>
        <p className="text-xs text-muted-foreground mb-3">Since 1970, wages grew ~670%. These costs grew far more:</p>
        <div className="space-y-2">
          {COST_EXPLOSION.map(item => {
            const Icon = item.icon
            return (
              <Card key={item.label}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.then} → {item.now}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{item.increase}</p>
                    <p className="text-[10px] text-muted-foreground">vs {item.wageGrowth} wages</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* The Two-Income Trap */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" /> The Dual-Income Trap
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Based on research by Elizabeth Warren (before politics — her academic work as a Harvard bankruptcy law professor).
        </p>
        <div className="space-y-3">
          {DUAL_INCOME_TRAP.map((item, i) => (
            <Card key={i} className="border-amber-100">
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Real math: dual income vs single income */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-500" /> The Real Math: What Does a Second Income Actually Net?
        </h2>
        <div className="space-y-3">
          {CALCULATOR_SCENARIOS.map((s, i) => (
            <Card key={i} className={cn(
              s.netBenefit < 0 ? "border-red-200 bg-red-50/20" :
              s.netBenefit === 0 ? "border-emerald-200 bg-emerald-50/20" :
              "border-amber-200 bg-amber-50/20"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{s.label}</p>
                  {s.income2 > 0 && (
                    <Badge variant="outline" className={cn("text-xs",
                      s.netBenefit < 0 ? "border-red-300 text-red-600" : "border-amber-300 text-amber-600"
                    )}>
                      Net: {s.netBenefit < 0 ? "-" : "+"}${Math.abs(s.netBenefit).toLocaleString()}/yr
                    </Badge>
                  )}
                </div>
                {s.income2 > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
                    <span className="text-muted-foreground">2nd gross income:</span>
                    <span className="text-right font-medium text-emerald-600">+${s.income2.toLocaleString()}</span>
                    <span className="text-muted-foreground">Childcare:</span>
                    <span className="text-right font-medium text-red-500">-${s.childcare.toLocaleString()}</span>
                    <span className="text-muted-foreground">Additional taxes:</span>
                    <span className="text-right font-medium text-red-500">-${s.taxes2.toLocaleString()}</span>
                    <span className="text-muted-foreground">Commuting:</span>
                    <span className="text-right font-medium text-red-500">-${s.commute2.toLocaleString()}</span>
                    <span className="text-muted-foreground">Work costs (clothes, food):</span>
                    <span className="text-right font-medium text-red-500">-${s.workCosts2.toLocaleString()}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground italic">{s.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Butterfly effects */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Sprout className="h-5 w-5 text-emerald-500" /> The Butterfly Effect: What Changes When a Parent Is Home
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          This is not about which parent. It is about one parent having the capacity to be fully present. The effects ripple outward in ways most people never calculate.
        </p>
        <div className="space-y-3">
          {BUTTERFLY_EFFECTS.map((effect, i) => {
            const Icon = effect.icon
            const isOpen = showEffects === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setShowEffects(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", effect.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold flex-1">{effect.area}</p>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <ul className="mt-3 space-y-2 pl-12">
                      {effect.effects.map((e, j) => (
                        <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                          <span className="text-emerald-400 shrink-0 mt-0.5">+</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Actionable strategies */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" /> How to Actually Make It Work
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          These are not theoretical. Every strategy below has been done by real families. The question is which combination fits yours.
        </p>
        <div className="space-y-4">
          {STRATEGIES.map((strat, i) => {
            const Icon = strat.icon
            const isOpen = expandedStrategy === i
            return (
              <Card key={i}>
                <div className="cursor-pointer" onClick={() => setExpandedStrategy(isOpen ? null : i)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", strat.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{strat.category}</p>
                        <p className="text-xs text-muted-foreground">{strat.actions.length} strategies</p>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                    </div>
                  </CardContent>
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3 mx-4">
                    {strat.actions.map((action, j) => (
                      <div key={j}>
                        <p className="text-sm font-medium">{action.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{action.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* The 45-minute reality */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-red-500" /> The 45-Minute Reality
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          In a typical dual-income family, here is where a child's day actually goes:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-red-200">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-red-700 mb-3">Dual Income — Typical Day</p>
              <div className="space-y-1.5">
                {DAILY_TIME_DUAL.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={cn("h-3 rounded-full shrink-0", t.color)} style={{ width: `${Math.max(t.hours * 12, 6)}%` }} />
                    <span className="text-xs text-muted-foreground flex-1">{t.activity}</span>
                    <span className={cn("text-xs font-medium", t.who === "parent" ? "text-emerald-600" : "text-muted-foreground")}>
                      {t.hours}h
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-red-600 font-semibold mt-3">Engaged parent time: ~45 minutes/day</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-emerald-700 mb-3">One Parent Home — Typical Day</p>
              <div className="space-y-1.5">
                {DAILY_TIME_SINGLE.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={cn("h-3 rounded-full shrink-0", t.color)} style={{ width: `${Math.max(t.hours * 12, 6)}%` }} />
                    <span className="text-xs text-muted-foreground flex-1">{t.activity}</span>
                    <span className={cn("text-xs font-medium", t.who === "parent" ? "text-emerald-600" : "text-muted-foreground")}>
                      {t.hours}h
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-3">Engaged parent time: ~7.5 hours/day</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">
          That is a 10x difference. 45 minutes vs 7.5 hours. Over 18 years, it is the difference between
          4,927 hours and 49,275 hours of engaged parenting. The child who gets 49,275 hours grows up fundamentally different.
        </p>
      </div>

      {/* Screen time crisis */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" /> The Screen Time Crisis
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          When parents cannot be present, screens fill the void. This is not a judgment — it is a structural reality.
          Exhausted parents use screens because they have no other option. A present parent changes the equation entirely.
        </p>
        <div className="space-y-2">
          {SCREEN_IMPACT.map((item, i) => (
            <Card key={i}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.stat}</p>
                  <p className="text-[10px] text-muted-foreground">{item.source}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-red-600">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground">{item.note}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-3 border-amber-200 bg-amber-50/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Sweden banned screens in preschools.</strong> Reading scores immediately improved. Finland — ranked #1 in global
              education — limits screen time and prioritizes play-based learning. The evidence is clear: screens in early education
              are not helping. A parent reading with their child, playing in the dirt, building with blocks, or just being present
              produces better outcomes than any educational app ever created.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Economic value of stay-at-home parent */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-500" /> The Economic Value of a Stay-at-Home Parent
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Society says a stay-at-home parent &quot;doesn&apos;t work.&quot; Here is what it would cost to replace what they do:
        </p>
        <div className="space-y-2">
          {HOME_PARENT_VALUE.map((item, i) => (
            <Card key={i}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.role}</p>
                  <p className="text-[10px] text-muted-foreground">{item.note}</p>
                </div>
                <p className="text-sm font-bold text-emerald-600 shrink-0">{item.marketRate}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-3 border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Total market value: $62,000-$95,000/year.</strong> A stay-at-home parent is not &quot;not working&quot; — they are
              performing $62K-$95K worth of labor that the family would otherwise pay for (or go without). When someone asks
              &quot;can you afford for one parent to stay home?&quot; the real question is &quot;can you afford to outsource $62K-$95K of
              labor to strangers and institutions?&quot;
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Canadian-specific section */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Home className="h-5 w-5 text-red-500" /> Canadian Reality Check
        </h2>

        {/* Childcare costs */}
        <Card className="mb-3">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-2">Childcare Costs in Canada</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p><strong>Ontario:</strong> {CANADA_DATA.childcare.ontario}</p>
              <p><strong>National average:</strong> {CANADA_DATA.childcare.average}</p>
              <p className="text-red-600 font-medium"><strong>Two kids:</strong> {CANADA_DATA.childcare.twoKids}</p>
            </div>
          </CardContent>
        </Card>

        {/* Housing by city */}
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Housing: Where Can One Income Work?</p>
        <div className="space-y-2 mb-4">
          {CANADA_DATA.housing.map((city, i) => (
            <Card key={i} className={cn(
              parseFloat(city.incomeRatio) <= 4.5 ? "border-emerald-200" :
              parseFloat(city.incomeRatio) <= 7 ? "border-amber-200" : "border-red-200"
            )}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{city.city}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold">{city.median}</span>
                    <span className={cn("text-[10px] ml-1.5",
                      parseFloat(city.incomeRatio) <= 4.5 ? "text-emerald-600" :
                      parseFloat(city.incomeRatio) <= 7 ? "text-amber-600" : "text-red-600"
                    )}>({city.incomeRatio}x income)</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">{city.verdict}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trades */}
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Careers That Support a Family on One Income</p>
        <div className="space-y-2">
          {CANADA_DATA.trades.map((trade, i) => (
            <Card key={i}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{trade.trade}</p>
                  <p className="text-[10px] text-muted-foreground">{trade.path}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-600">{trade.wage}</p>
                  <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-300">{trade.demand}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-3 border-blue-200 bg-blue-50/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>The Canada Child Benefit factor:</strong> CCB is income-tested. When a family drops from two incomes to one,
              their CCB payment often increases by $2,000-$6,000/year. Combined with lower marginal tax rates on one income,
              reduced childcare costs, and lower work-related expenses, the actual financial gap is far smaller than the
              gross salary difference suggests. Many families are shocked when they run the numbers.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 12-month roadmap */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-violet-500" /> The 12-Month Roadmap: From Dual Income to Thriving on One
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          This is not about quitting tomorrow. It is about a 12-month plan that transitions your family
          safely and confidently. Every step builds on the last.
        </p>
        <div className="space-y-3">
          {ROADMAP.map((phase, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    i === ROADMAP.length - 1 ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"
                  )}>{i + 1}</div>
                  <p className="text-sm font-semibold">{phase.phase}</p>
                </div>
                <ul className="space-y-1.5 pl-11">
                  {phase.steps.map((step, j) => (
                    <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-violet-400 shrink-0 mt-0.5">-</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* What changes after 90 days */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">What Families Report After 90 Days</p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Based on thousands of family testimonials in single-income communities, financial independence forums,
            and family research:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Stress levels", before: "8/10", after: "3/10", color: "text-emerald-600" },
              { label: "Quality time with kids", before: "45 min/day", after: "5-7 hrs/day", color: "text-emerald-600" },
              { label: "Home-cooked meals", before: "2-3/week", after: "6-7/week", color: "text-emerald-600" },
              { label: "Child behavior issues", before: "Frequent", after: "Rare", color: "text-emerald-600" },
              { label: "Marriage satisfaction", before: "5/10", after: "8/10", color: "text-emerald-600" },
              { label: "Financial anxiety", before: "High (both working, still tight)", after: "Low (less income but less spending)", color: "text-emerald-600" },
            ].map((item, i) => (
              <div key={i} className="rounded-lg bg-white/50 p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-red-500 line-through">{item.before}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className={cn("text-xs font-semibold", item.color)}>{item.after}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* The honest take */}
      <Card className="border-2 border-rose-200 bg-rose-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-rose-900 mb-2">The Honest Take</p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            This page is not saying one way is right for every family. Some parents love their careers. Some families
            need two incomes regardless of optimization. What this page IS saying:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-rose-400 shrink-0 mt-0.5" /> <span>The system is designed so that two incomes feel mandatory — but for many families, the math shows otherwise.</span></li>
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-rose-400 shrink-0 mt-0.5" /> <span>The costs that exploded (housing, healthcare, education, childcare) are not natural — they are the result of specific policies, monopolies, and financial engineering.</span></li>
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-rose-400 shrink-0 mt-0.5" /> <span>Every family deserves the CHOICE. Right now, most families feel they have no choice. This page exists to show that strategies exist — and that the math often supports them.</span></li>
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-rose-400 shrink-0 mt-0.5" /> <span>The biggest beneficiaries are children. Every study on early childhood development points the same direction: consistent, present caregiving from a bonded adult is irreplaceable.</span></li>
          </ul>
        </CardContent>
      </Card>

      {/* Interactive calculator */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-4 w-4 text-violet-500" /> Your Family's Break-Even
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            To find your real number: take the second income, subtract childcare, the additional taxes
            (married filing jointly pushes you into a higher bracket), commuting costs, work wardrobe, eating out more,
            convenience services you pay for because nobody is home, and the mental health cost of burnout.
            Whatever is left is what the second job actually pays. For many families, it is shockingly low — or negative.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Use the <a href="/net-worth" className="text-violet-600 hover:underline font-medium">Net Worth Tracker</a> and{" "}
            <a href="/cost-of-living" className="text-violet-600 hover:underline font-medium">Cost of Living Comparison</a> to
            model your specific situation. Then use the{" "}
            <a href="/education/finance" className="text-violet-600 hover:underline font-medium">Financial Literacy</a> module
            to build the knowledge to execute.
          </p>
        </CardContent>
      </Card>

      {/* Data sources */}
      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> U.S. Census Bureau, Federal Reserve, BLS, USDA, Statistics Canada, CREA (Canadian Real Estate Association),
            Canada Revenue Agency (CCB data), Ontario Ministry of Education, Elizabeth Warren &amp; Amelia Tyagi
            (<em>The Two-Income Trap</em>, 2003), Harvard Study of Adult Development, NICHD Study of Early Child Care,
            OECD PISA 2023, Common Sense Media, Journal of Pediatrics, National Association of Realtors,
            Salary.com (stay-at-home parent market value study). All data is publicly available. This page presents
            data and strategies — it does not tell you what is right for your family.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/cost-of-living" className="text-sm text-teal-600 hover:underline">Cost of Living</a>
        <a href="/net-worth" className="text-sm text-emerald-600 hover:underline">Net Worth Tracker</a>
        <a href="/education/finance" className="text-sm text-amber-600 hover:underline">Financial Literacy</a>
        <a href="/workforce" className="text-sm text-blue-600 hover:underline">Workforce Analytics</a>
        <a href="/relationships" className="text-sm text-rose-600 hover:underline">Relationships</a>
      </div>
    </div>
  )
}
