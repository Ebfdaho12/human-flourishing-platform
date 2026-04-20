"use client"

import { useState } from "react"
import { Heart, Home, FileText, AlertTriangle, ChevronDown, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const HOUSING: {
  name: string
  costRange: string
  color: string
  tag: string
  description: string
  covered: string
  pros: string[]
  cons: string[]
}[] = [
  {
    name: "Aging in Place",
    costRange: "$0-$2,000/month (home modifications + care)",
    color: "from-emerald-500 to-teal-600",
    tag: "Most preferred",
    description: "Staying in the family home with modifications and in-home support as needed. Most seniors want this. With the right planning it's achievable for most.",
    covered: "Home care services partially covered provincially: Ontario (CCAC/Home Care Ontario), BC (Home Health), AB (Home Living). Personal Support Workers (PSWs), nursing visits, occupational therapy often funded. Amounts vary dramatically — rural access is worse.",
    pros: [
      "Preserves independence and familiarity — strongest predictor of quality of life",
      "Lower cost than any facility option",
      "Pets, routines, and relationships stay intact",
      "Family can be involved without formal schedule",
    ],
    cons: [
      "Home may need significant modifications ($5K-$50K+): ramp, grab bars, walk-in shower, stairlift",
      "Isolation risk if mobility is limited and family lives far away",
      "In-home care has wait lists in many provinces",
      "Caregiver burden falls heavily on family members",
    ],
  },
  {
    name: "Retirement Home (Independent Living)",
    costRange: "$2,500-$5,000/month",
    color: "from-blue-500 to-cyan-600",
    tag: "For active seniors",
    description: "Private apartment in a community with optional meals, activities, and basic services. No personal care included — residents must be fully independent or hire private help.",
    covered: "NOT publicly funded. 100% private pay. Some costs may qualify for the Medical Expense Tax Credit.",
    pros: [
      "Social environment — major factor in mental health and longevity",
      "Meals, housekeeping, and activities included",
      "Lower stress for family than aging in place alone",
      "No home maintenance worries",
    ],
    cons: [
      "Expensive — $3,500/month = $42,000/year, entirely out-of-pocket",
      "Not suitable once personal care is needed — must move or hire additional help",
      "Quality varies enormously — visit multiple times before choosing",
      "Contracts are complex — read cancellation terms carefully",
    ],
  },
  {
    name: "Assisted Living",
    costRange: "$3,500-$7,000/month",
    color: "from-amber-500 to-orange-600",
    tag: "When help is needed daily",
    description: "Residential setting with 24-hour staff providing meals, medication management, personal care (bathing, dressing), and supervision. The middle ground between independence and long-term care.",
    covered: "Partially covered in some provinces. Ontario: some assisted living subsidies through LHIN. BC: subsidized assisted living available for eligible seniors. AB: limited government support. Check with your provincial health authority — income-based subsidies exist but wait lists are long.",
    pros: [
      "Personal care provided — family not responsible for hands-on care",
      "More engaging than long-term care for those still active",
      "Private rooms in most modern facilities",
      "Bridges the gap between independence and nursing home level care",
    ],
    cons: [
      "Significant cost — often not fully covered without subsidy",
      "Wait lists for subsidized spots can be 6-24 months",
      "Transition to long-term care may still be required later",
      "Private facilities vary widely in quality — no standardized licensing in all provinces",
    ],
  },
  {
    name: "Long-Term Care (LTC) Home",
    costRange: "$2,000-$3,000/month (basic room, government regulated)",
    color: "from-violet-500 to-purple-600",
    tag: "When full medical care is needed",
    description: "24-hour nursing care for those with significant medical or cognitive needs. Government regulated and partially funded in all provinces. Wait lists are the main challenge.",
    covered: "Government subsidized — residents pay a regulated co-payment (basic room in Ontario: ~$1,900/month in 2024). Province covers the rest. Private or semi-private rooms cost more. Income-tested subsidies available for lower-income residents.",
    pros: [
      "24-hour nursing care and physician access",
      "Most affordable option for complex medical needs",
      "Government regulated — inspection reports publicly available",
      "Removes caregiver burden from family for medical aspects",
    ],
    cons: [
      "Wait lists: Ontario average wait is 6-18 months. Urgent placements faster.",
      "Shared rooms in some facilities, limited privacy",
      "Can feel institutional — quality of life varies significantly between homes",
      "Limited choice if you accept the first available bed (you lose your place in line if you decline)",
    ],
  },
  {
    name: "Moving In with Family",
    costRange: "$500-$2,000/month (renovation + care costs)",
    color: "from-rose-500 to-red-600",
    tag: "Family-centered option",
    description: "Senior moves into an adult child's home. Often the most loving option — and often the most difficult. Requires honest conversation, clear expectations, and often home modifications.",
    covered: "Canada Caregiver Credit: federal tax credit for those caring for a dependent family member. Some provinces offer additional caregiver support payments. Ask about home care services — they can still be accessed in a family home.",
    pros: [
      "Maintains family bonds and familiar relationships",
      "Often least expensive for the senior",
      "Parent can remain meaningfully involved in family life",
      "Cultural preference in many communities",
    ],
    cons: [
      "Caregiver burnout is extremely high — the #1 risk of this option",
      "Home modifications may be needed: bedroom on main floor, accessible bathroom",
      "Relationship strain between adult child, their spouse, and the parent is common",
      "Can be isolating if parent's social network is far away",
    ],
  },
]

const LEGAL_DOCS = [
  { name: "Power of Attorney — Personal Care", note: "Names who makes medical decisions if your parent cannot. Without it, family must apply to court. Get this while your parent can still sign it." },
  { name: "Power of Attorney — Property", note: "Names who manages finances and assets. Different from personal care POA. Both documents are needed." },
  { name: "Advance Care Directive / Living Will", note: "Documents their wishes: CPR, life support, organ donation. Removes guesswork during a crisis. Have this conversation now." },
  { name: "Will (Updated)", note: "Review for current executor and beneficiaries. Consult an estate lawyer if joint property or significant assets are involved." },
]

const GOVT_PROGRAMS = [
  { name: "OAS — Old Age Security", detail: "Available at 65. ~$700/month in 2024. Clawed back above ~$86K income." },
  { name: "GIS — Guaranteed Income Supplement", detail: "Additional monthly benefit for low-income OAS recipients. Up to $1,000+/month. Often unclaimed — apply immediately." },
  { name: "CPP — Canada Pension Plan", detail: "Based on contributions. Can start at 60 (reduced) or delay to 70 (42% higher). Check projected amounts at CRA My Account." },
  { name: "Home Care Programs", detail: "Each province funds PSWs, nursing visits, and therapy at home. Contact your provincial health authority for an eligibility assessment." },
  { name: "Veterans Benefits", detail: "Veterans Affairs Canada provides substantial benefits: long-term care, home care, Attendance Allowance. Many veterans under-claim." },
  { name: "Disability Tax Credit", detail: "For seniors with significant disabilities. Claimable retroactively. Also unlocks the RDSP (Registered Disability Savings Plan)." },
]

const BURNOUT_SIGNS = [
  "Feeling resentful of the person you're caring for",
  "Exhausted no matter how much you sleep",
  "Getting sick more often than usual",
  "Withdrawing from friends and other family",
  "Feeling increasingly helpless or hopeless",
]

export default function ElderCarePage() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [showBurnout, setShowBurnout] = useState(false)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-violet-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Elder Care Planning</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          5 housing options, legal documents, government programs, and how to take care of the caregiver too.
        </p>
      </div>

      <Card className="border-2 border-rose-200 bg-rose-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Start the conversation early.</strong> The biggest mistake families make is waiting until a crisis —
            a fall, a diagnosis, a hospital stay — before discussing care options. By then, decisions are made under pressure
            with no plan and often no legal authority to act. The best time to have this conversation is now, when everyone
            has full capacity to participate in it.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {HOUSING.map((h, i) => {
          const isOpen = expanded === i
          return (
            <Card key={i} className="overflow-hidden cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", h.color)}>
                    <Home className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{h.name}</p>
                      <Badge variant="outline" className="text-[9px]">{h.tag}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{h.costRange}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
                </div>

                {isOpen && (
                  <div className="mt-3 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">{h.description}</p>
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-2.5">
                      <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider mb-1">Provincial Coverage</p>
                      <p className="text-xs text-blue-700">{h.covered}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">Pros</p>
                        <ul className="space-y-1">
                          {h.pros.map((p, j) => (
                            <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                              <span className="text-emerald-500 shrink-0">+</span><span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-1">Cons</p>
                        <ul className="space-y-1">
                          {h.cons.map((c, j) => (
                            <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                              <span className="text-red-400 shrink-0">−</span><span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-500" /> Legal Documents Needed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {LEGAL_DOCS.map((doc, i) => (
            <div key={i} className="border-l-2 border-violet-200 pl-3">
              <p className="text-xs font-semibold">{doc.name}</p>
              <p className="text-xs text-muted-foreground">{doc.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" /> Government Programs to Apply For
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {GOVT_PROGRAMS.map((p, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-emerald-500 text-xs font-bold shrink-0 mt-0.5">→</span>
              <div>
                <p className="text-xs font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="cursor-pointer border-amber-200" onClick={() => setShowBurnout(!showBurnout)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold flex-1">Caregiver Burnout — Signs & Resources</p>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showBurnout && "rotate-180")} />
          </div>
          {showBurnout && (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-muted-foreground">Family caregivers provide an estimated 25-30 hours of care per week on average. Burnout is not weakness — it is a predictable outcome of sustained high-demand caregiving without support.</p>
              <div>
                <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-1.5">Warning Signs</p>
                <ul className="space-y-1">
                  {BURNOUT_SIGNS.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-amber-400 shrink-0">⚠</span><span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 space-y-1.5">
                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Resources</p>
                <p className="text-xs text-emerald-700"><strong>Respite care:</strong> Temporary relief care — hours, days, or weeks. Funded through provincial home care programs and some municipalities. Ask your care coordinator.</p>
                <p className="text-xs text-emerald-700"><strong>Caregiver support line:</strong> Ontario Caregiver Organization: 1-833-416-2273. Available 24/7.</p>
                <p className="text-xs text-emerald-700"><strong>Caregiver Network:</strong> caregiver.ca — national resource hub with peer support groups, webinars, and local service finders.</p>
                <p className="text-xs text-emerald-700"><strong>Remember:</strong> You cannot care for someone else if you break down. Getting help is not giving up — it is the most sustainable choice for everyone.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/estate-planning" className="text-sm text-violet-600 hover:underline">Estate Planning</a>
        <a href="/community-resources" className="text-sm text-rose-600 hover:underline">Community Resources</a>
        <a href="/mental-health" className="text-sm text-blue-600 hover:underline">Mental Health</a>
        <a href="/family-economics" className="text-sm text-emerald-600 hover:underline">Family Economics</a>
      </div>
    </div>
  )
}
