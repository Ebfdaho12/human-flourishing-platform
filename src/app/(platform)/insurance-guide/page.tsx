"use client"

import { useState } from "react"
import { Shield, AlertTriangle, ChevronDown, CheckCircle, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const TYPES: {
  name: string
  color: string
  urgency: string
  whoNeeds: string
  whoDoesnt: string
  lookFor: string[]
  avgCost: string
  scams: string[]
}[] = [
  {
    name: "Term Life Insurance",
    color: "from-blue-500 to-violet-600",
    urgency: "ESSENTIAL — if you have dependents",
    whoNeeds: "Anyone with a mortgage, children, or a spouse who relies on your income. If you died tomorrow, could your family pay the bills? If no: you need this.",
    whoDoesnt: "Single renters with no dependents and no debt. Retirees whose children are adults and whose spouse has their own income.",
    lookFor: [
      "Term life (10, 20, or 30 year) — NOT whole life or universal life",
      "Coverage of 10-20x your annual income",
      "Guaranteed renewable without re-qualifying for health",
      "Non-smoker rates if applicable — saves 50%+",
      "Compare PolicyMe.com, PolicyAdvisor.com, and your employer benefits",
    ],
    avgCost: "$25-$60/month for $500K of coverage (age 30, healthy, non-smoker)",
    scams: [
      "Whole life and universal life: sold as 'insurance + investment.' The investment returns are terrible. Buy term, invest the difference.",
      "Mortgage life insurance from your bank: overpriced, decreasing coverage, not portable. Get your own term policy instead.",
      "Credit card life insurance: extremely overpriced for minimal coverage. Skip it.",
    ],
  },
  {
    name: "Home Insurance",
    color: "from-amber-500 to-orange-600",
    urgency: "ESSENTIAL — legally required by most mortgage lenders",
    whoNeeds: "Every homeowner. Also strongly recommended for renters (tenant's insurance is different — covers your belongings + liability, costs $20-$30/month and is one of the best value purchases in insurance).",
    whoDoesnt: "Very few exceptions. If you own or rent a home with anything in it, you need this.",
    lookFor: [
      "Replacement cost coverage (not actual cash value) — pays to rebuild, not just market value",
      "Guaranteed replacement cost if available — covers full rebuild even if costs exceed estimate",
      "Minimum $1M liability coverage",
      "Sewer backup and water damage riders — standard policies often exclude these",
      "Check the deductible: $1,000 deductible saves ~20% vs $500",
    ],
    avgCost: "$1,200-$2,400/year for a home. $200-$400/year for tenant's insurance.",
    scams: [
      "Under-insuring to save on premiums — then a flood or fire hits and you're $100K short on rebuilding costs.",
      "Not reading exclusions: mold, earthquakes, overland flooding, and 'acts of God' are commonly excluded. Know what your policy does NOT cover.",
      "Accepting the renewal without shopping: insurers raise rates gradually. Shop every 2 years.",
    ],
  },
  {
    name: "Auto Insurance",
    color: "from-emerald-500 to-teal-600",
    urgency: "LEGALLY REQUIRED in all provinces",
    whoNeeds: "Every driver. Minimum coverage required by law — but minimums are often dangerously low. Third-party liability should be at least $1M, ideally $2M.",
    whoDoesnt: "Non-drivers. If you use only transit and have no vehicle, you don't need this.",
    lookFor: [
      "Liability minimum $1M — $2M is better and costs little extra",
      "Accident benefits: medical, income replacement, death benefit",
      "Collision and comprehensive (especially if car is worth $15K+)",
      "Deductible of $1,000 to reduce premiums",
      "Usage-based insurance (UBI) app if you're a low-mileage driver — saves 10-25%",
    ],
    avgCost: "Varies hugely by province. ON: $1,500-$3,000+/year. AB: $1,200-$2,000/year. BC: $1,000-$1,800/year through ICBC.",
    scams: [
      "Not disclosing all drivers in the household — if an undisclosed driver gets in an accident, your claim may be denied.",
      "Rental car insurance through the dealer: check your credit card first — many Visa/Mastercard cards include this automatically.",
      "Buying minimum coverage only: in Ontario, the minimum $200K liability is dangerously low. One serious accident can exceed this.",
    ],
  },
  {
    name: "Disability Insurance",
    color: "from-violet-500 to-purple-600",
    urgency: "HIGH — the most underrated insurance in Canada",
    whoNeeds: "Every working adult. Your most valuable asset is your ability to earn income. A 35-year-old earning $70K has over $2M of future income. Disability is more likely than death during working years: 1 in 3 Canadians will be disabled for 90+ days at some point in their career.",
    whoDoesnt: "Those with substantial passive income, very short remaining careers, or comprehensive employer coverage. Check your group benefits before buying individually.",
    lookFor: [
      "Own-occupation definition: pays if you can't do YOUR job, not just any job",
      "90-day elimination period (the waiting period — longer = lower premiums)",
      "Coverage to age 65",
      "Non-cancellable and guaranteed renewable",
      "Check employer coverage first — group LTD at work may cover 60-70% of income",
    ],
    avgCost: "$150-$400/month for an individual policy. Much cheaper through group benefits at work.",
    scams: [
      "'Any occupation' definition: the policy only pays if you can't do ANY work at all. Much harder to claim than 'own occupation.'",
      "Waiting until you need it: disability insurance is medically underwritten. If you get sick or injured first, you cannot then buy coverage.",
      "Short benefit period (2-year policies): if you have a long-term disability, a 2-year policy leaves you without income. Ensure coverage goes to age 65.",
    ],
  },
  {
    name: "Critical Illness Insurance",
    color: "from-rose-500 to-red-600",
    urgency: "MODERATE — valuable but assess your situation first",
    whoNeeds: "Adults with family history of cancer, heart attack, or stroke. Those without an emergency fund large enough to cover 6-12 months of lost income during treatment. Particularly valuable for self-employed who have no group benefits or paid sick leave.",
    whoDoesnt: "Those with comprehensive group benefits, solid emergency fund ($30K+), and strong disability coverage. Good emergency fund often replaces the need for this.",
    lookFor: [
      "Coverage for the 3 big conditions: cancer, heart attack, stroke (covers 80%+ of claims)",
      "Lump-sum payment — you receive the money and spend it however you need",
      "Return of premium option if you want your premiums back if you never claim (costs more upfront)",
      "30-day survival period condition — must survive 30 days after diagnosis to collect",
      "Compare standalone policy vs adding a rider to your term life policy",
    ],
    avgCost: "$50-$150/month for $100K of coverage (age 35, healthy, non-smoker)",
    scams: [
      "Narrow definition of covered conditions: read the fine print on exactly what qualifies as a 'heart attack' or 'cancer' — some policies exclude early-stage cancers.",
      "Stacking too much insurance: some people over-insure and pay $500+/month in premiums. Prioritize: term life first, disability second, CI third.",
      "Employer-sponsored CI that disappears when you leave: if you are self-employed or change jobs often, employer CI is not a reliable long-term plan.",
    ],
  },
]

const PROVINCE_NOTES = [
  { province: "Ontario", note: "Most expensive auto insurance in Canada. Private market — shop aggressively, rates can vary 50%+ between companies for identical coverage. Use a broker." },
  { province: "Alberta", note: "Competitive private market. Recent reforms capped accident benefit increases. Shop every year at renewal — switching providers saves $300-$600/year on average." },
  { province: "BC", note: "Government monopoly through ICBC. Less price variation but still shop optional coverage. Enhanced Accident Benefits added in 2021 improved base coverage." },
  { province: "Quebec", note: "Split system: bodily injury covered by SAAQ (government). Property damage through private insurers. Generally lower auto rates than ON or AB." },
  { province: "Manitoba/SK", note: "Government-run auto insurance (MPI and SGI). Rates are generally lower than private provinces. Less shopping available for mandatory coverage." },
]

const TIPS = [
  "Always get at least 3 quotes. Insurance is a commodity — coverage can be identical, prices vary enormously.",
  "Check employer benefits first. Group life, disability, and extended health through work are typically subsidized and often the best deal available.",
  "Term life, not whole life. Whole life is sold as insurance + investment. The investment component has poor returns. Buy term and invest the difference in index funds.",
  "Do not over-insure. Calculate what your family actually needs if you're gone. A $5M policy when you earn $80K and have a paid-off home is expensive overkill.",
  "Review every 5 years or after major life events: marriage, divorce, new baby, home purchase, significant income change.",
  "Bundle home and auto with one provider for 10-25% multi-policy discount.",
  "Higher deductible = lower premiums. If you have an emergency fund, you can self-insure the gap — a $1,000 deductible vs $500 typically saves $200-$400/year.",
]

export default function InsuranceGuidePage() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [showProvinces, setShowProvinces] = useState(false)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canadian Insurance Guide</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          What you actually need, what to skip, and how to avoid paying too much. 5 types of insurance — plain language.
        </p>
      </div>

      <Card className="border-2 border-blue-200 bg-blue-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The golden rule:</strong> Insurance is for catastrophic losses you cannot self-insure.
            If an event would financially ruin you or your family, insure it. If it would hurt but you could
            recover from savings, consider your deductible instead of paying premiums forever.
            Insurance companies are profitable because most people are over-insured on some things and under-insured on others.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {TYPES.map((t, i) => {
          const isOpen = expanded === i
          return (
            <Card key={i} className="overflow-hidden cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", t.color)}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <Badge variant="outline" className="text-[9px]">{t.urgency.split(" — ")[0]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.avgCost}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
                </div>

                {isOpen && (
                  <div className="mt-3 space-y-3 pl-13">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Who Needs It</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.whoNeeds}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Who Doesn't Need It</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.whoDoesnt}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">What to Look For</p>
                      <ul className="space-y-1">
                        {t.lookFor.map((item, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex gap-2">
                            <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-red-50 border border-red-200 p-2.5">
                      <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Common Scams & Traps
                      </p>
                      <ul className="space-y-1.5">
                        {t.scams.map((s, j) => (
                          <li key={j} className="text-xs text-red-700 flex gap-2">
                            <span className="shrink-0">✗</span><span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="cursor-pointer" onClick={() => setShowProvinces(!showProvinces)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-semibold flex-1">Auto Insurance by Province</p>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showProvinces && "rotate-180")} />
          </div>
          {showProvinces && (
            <div className="mt-3 space-y-2">
              {PROVINCE_NOTES.map((p, i) => (
                <div key={i} className="border-l-2 border-blue-200 pl-3">
                  <p className="text-xs font-semibold text-blue-700">{p.province}</p>
                  <p className="text-xs text-muted-foreground">{p.note}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" /> Golden Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {TIPS.map((tip, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
              <span className="text-blue-400 shrink-0 font-bold">{i + 1}.</span>
              <span>{tip}</span>
            </p>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/estate-planning" className="text-sm text-violet-600 hover:underline">Estate Planning</a>
        <a href="/emergency-fund" className="text-sm text-emerald-600 hover:underline">Emergency Fund</a>
        <a href="/budget" className="text-sm text-blue-600 hover:underline">Budget Calculator</a>
        <a href="/negotiation" className="text-sm text-amber-600 hover:underline">Negotiation Scripts</a>
      </div>
    </div>
  )
}
