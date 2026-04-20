"use client"

import { useState } from "react"
import { MessageCircle, DollarSign, ChevronDown, Copy, CheckCircle, Phone, Briefcase, Home, CreditCard, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const SCRIPTS: {
  title: string
  category: string
  icon: any
  color: string
  savings: string
  time: string
  script: string[]
  tips: string[]
  when: string
}[] = [
  {
    title: "Negotiate a Raise at Work",
    category: "Income",
    icon: Briefcase,
    color: "from-violet-500 to-purple-600",
    savings: "$3,000-$15,000/year",
    time: "15-30 min conversation",
    when: "After a performance review, after completing a major project, or when you have been at the same salary for 12+ months",
    script: [
      "\"I appreciate the opportunity to discuss my compensation. I have been here for [X time] and I would like to talk about aligning my pay with the value I bring.\"",
      "\"In the last [period], I have [specific accomplishments: completed X project, saved the company Y, brought in Z revenue, took on A responsibility].\"",
      "\"I have researched the market rate for this role in our area, and it is in the range of $[X-Y]. I am currently below that range.\"",
      "\"I am asking for a [specific number or range]. This reflects my contributions and the market rate for this role.\"",
      "\"I am committed to this role and this company. I want to make sure we are both invested in this relationship fairly.\"",
      "[If they say no]: \"I understand budget constraints. Can we set specific goals and a timeline for a review in 3-6 months? I would like to know exactly what I need to do to earn this increase.\"",
    ],
    tips: [
      "NEVER give a range — they will always choose the bottom. State a specific number slightly above what you want",
      "NEVER negotiate without research. Use Glassdoor, PayScale, or LinkedIn salary insights to know the market rate",
      "The average person who negotiates earns $500K-$1M more over their career than those who do not",
      "If you are nervous, practice with your partner the night before. Role-play it",
      "Timing matters: after a win, during budget season (Q4/Q1), or when you have another offer",
    ],
  },
  {
    title: "Lower Your Internet Bill",
    category: "Bills",
    icon: Zap,
    color: "from-blue-500 to-cyan-600",
    savings: "$20-$50/month ($240-$600/year)",
    time: "10-15 min phone call",
    when: "When your promotional rate expires, or anytime you have been paying the same rate for 6+ months",
    script: [
      "\"Hi, I am calling about my internet bill. I have been a customer for [X years] and I noticed my bill increased to $[amount]/month.\"",
      "\"I have been looking at other providers and [competitor] is offering [their rate] for similar speeds. I do not want to switch — I would prefer to stay with you.\"",
      "\"Is there a promotional rate or loyalty discount you can apply to my account?\"",
      "[If they say no]: \"I understand. Can you transfer me to the retention department? I may need to consider other options.\"",
      "[Retention will usually offer a deal]: \"That is closer to what I was hoping for. Can you do $[target amount]? I will commit to [6-12 months] at that rate.\"",
    ],
    tips: [
      "The retention department has authority to offer deals the regular rep cannot. Always ask for retention",
      "Know the competitor's rate before calling — it is your leverage",
      "Be polite but firm. They want to keep you. Customer acquisition costs 5-10x more than retention",
      "Call on a weekday morning — shorter hold times and reps are less burned out",
      "This works for internet, phone, cable, insurance, and most subscription services",
    ],
  },
  {
    title: "Negotiate a Lower Car Insurance Rate",
    category: "Bills",
    icon: CreditCard,
    color: "from-emerald-500 to-teal-600",
    savings: "$30-$100/month ($360-$1,200/year)",
    time: "20-30 min (get quotes + call)",
    when: "At renewal time (60 days before), or anytime you have not shopped rates in 12+ months",
    script: [
      "Step 1: Get 3 quotes from competitors BEFORE calling your current insurer. Use online quote tools — takes 10 minutes each.",
      "\"Hi, my policy renews on [date] and I have been getting quotes from other companies. I have a quote from [competitor] for $[amount]/month with similar coverage.\"",
      "\"I have been with you for [X years] with no claims. Is there anything you can do to match or beat that rate?\"",
      "\"I would prefer to stay — I just need the rate to be competitive.\"",
      "[If they cannot match]: \"Thank you. I will take a few days to decide.\" Then actually switch if they cannot compete. Loyalty to a company that does not reward you is expensive.",
    ],
    tips: [
      "Bundle home + auto for 10-25% discount",
      "Increase your deductible from $500 to $1,000 — saves 15-30% on premiums",
      "Ask about every discount: clean driving record, low mileage, multiple vehicles, professional associations, alumni discounts",
      "Switch every 2-3 years if your rate creeps up — the best rates are for new customers, not loyal ones",
      "In Ontario: shop aggressively. Rates vary by 50%+ between companies for identical coverage",
    ],
  },
  {
    title: "Negotiate Rent (or Lease Renewal)",
    category: "Housing",
    icon: Home,
    color: "from-amber-500 to-orange-600",
    savings: "$50-$200/month ($600-$2,400/year)",
    time: "15-20 min conversation",
    when: "60-90 days before your lease renews. Landlords would rather keep a good tenant than find a new one",
    script: [
      "\"I have really enjoyed living here and I would like to renew my lease. Before I do, I wanted to discuss the rent.\"",
      "\"I have been a reliable tenant — always paid on time, maintained the unit well, and have not caused any issues.\"",
      "\"I have been looking at comparable units in the area and they are renting for $[market rate]. My current rent of $[your rent] is [at/above/below] that range.\"",
      "\"Would you be willing to keep the rent at $[target] for the next lease term? Keeping a good tenant saves you the cost and hassle of turnover — cleaning, repairs, vacancy, showing, and screening.\"",
      "[If they insist on increase]: \"I understand costs are going up. Would you consider [smaller increase] instead of [proposed increase]? Or could you include [free parking, updated appliance, fresh paint] to offset the difference?\"",
    ],
    tips: [
      "Landlord turnover costs $3,000-$5,000+ (vacancy, cleaning, repairs, advertising, screening). Keeping you is cheaper",
      "Be a great tenant BEFORE you negotiate. Pay on time. Be quiet. Report maintenance early. This is your leverage",
      "In Ontario: rent increases are capped by provincial guidelines for existing tenants (2.5% in 2024). Know the rules",
      "If you are month-to-month, you have more leverage — you can leave anytime. Use that",
      "Always negotiate in person or by phone, not text or email. Tone matters",
    ],
  },
  {
    title: "Negotiate a Medical Bill (US)",
    category: "Healthcare",
    icon: DollarSign,
    color: "from-red-500 to-rose-600",
    savings: "20-60% off the original bill",
    time: "15-30 min phone call",
    when: "After receiving any medical bill, especially a large one. Most people do not know you can negotiate these",
    script: [
      "\"I received a bill for $[amount] and I would like to discuss the charges.\"",
      "\"Can you provide an itemized breakdown of every charge?\" (Errors are found 30-80% of the time in itemized bills)",
      "\"I am having difficulty paying this amount. Do you offer a prompt-pay discount for paying in full today?\" (Many offer 20-40% off)",
      "\"If I cannot pay in full, can we set up a payment plan with no interest?\"",
      "\"I have looked up the fair market rate for these procedures on Healthcare Bluebook / FAIR Health, and the reasonable rate is $[amount]. Can you adjust the bill to the fair market rate?\"",
    ],
    tips: [
      "ALWAYS request an itemized bill. Billing errors are extremely common. You may be charged for services you did not receive",
      "Hospitals have charity care programs — if your income is below a threshold, they may forgive 50-100% of the bill",
      "Medical debt does not appear on credit reports until 365 days — you have time to negotiate",
      "In Canada: this applies to dental, vision, physiotherapy, and other services not covered by provincial health insurance",
      "The listed price (chargemaster rate) is the STARTING point, not the final price. Insurance companies negotiate 40-70% off. You can too",
    ],
  },
  {
    title: "Negotiate a Better Price on a Car",
    category: "Major Purchase",
    icon: DollarSign,
    color: "from-slate-500 to-gray-600",
    savings: "$1,000-$5,000 off sticker price",
    time: "1-3 hours total (research + dealer visit)",
    when: "When buying any car — new or used",
    script: [
      "BEFORE going to the dealer: research the invoice price (what the dealer paid) on Unhaggle (Canada) or Edmunds/TrueCar (US). This is your baseline.",
      "\"I have done my research and I know the invoice price on this vehicle is approximately $[amount]. I am prepared to pay $[invoice + $500-1000] today.\"",
      "\"I am not interested in monthly payment discussions — let us agree on the total price first, then discuss financing separately.\"",
      "NEVER tell them your budget or your monthly payment target. They will manipulate the loan term to make any price 'fit.'",
      "[On trade-in]: Get an independent appraisal (CarGurus, Canadian Black Book) BEFORE going to the dealer. Negotiate the new car price and trade-in value SEPARATELY.",
      "[On financing]: Get pre-approved at your bank BEFORE the dealer. This gives you a rate to beat. Dealer financing is often 1-3% higher.",
    ],
    tips: [
      "End of month, end of quarter, and end of year are the best times to buy — dealers need to hit sales targets",
      "NEVER buy on your first visit. Say 'I need to think about it.' The follow-up call will often include a better offer",
      "Extended warranties are almost never worth it. The dealer makes 50-60% margin on warranties",
      "The monthly payment question is a trap. A $400/month payment over 84 months costs far more than $500/month over 48 months",
      "In Canada: check the CarCostCanada or Unhaggle dealer cost. Knowledge is leverage",
    ],
  },
]

export default function NegotiationPage() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [copied, setCopied] = useState<number | null>(null)

  function copyScript(idx: number) {
    const script = SCRIPTS[idx].script.join("\n\n")
    navigator.clipboard?.writeText(script)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  const totalSavings = "$5,000-$25,000+/year"

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Negotiation Scripts</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Word-for-word scripts for the conversations that save you {totalSavings}. Copy, practice, call.
        </p>
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">The Most Underpaid Skill</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Negotiation is the highest-ROI skill you will ever learn. A 15-minute phone call can save $500/year on
            your internet bill. A 30-minute salary negotiation can be worth $10,000/year — every year for the rest
            of your career. Most people do not negotiate because they do not know what to say. Now you do.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {SCRIPTS.map((s, i) => {
          const Icon = s.icon
          const isOpen = expanded === i
          return (
            <Card key={i} className="overflow-hidden">
              <div className="cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", s.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{s.title}</p>
                    <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                      <span className="text-emerald-600 font-medium">Saves: {s.savings}</span>
                      <span>{s.time}</span>
                    </div>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </CardContent>
              </div>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                  <p className="text-xs text-muted-foreground"><strong>When:</strong> {s.when}</p>

                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">The Script</p>
                      <button onClick={() => copyScript(i)} className="text-[10px] text-slate-500 hover:text-violet-600 flex items-center gap-1">
                        {copied === i ? <><CheckCircle className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
                      </button>
                    </div>
                    {s.script.map((line, j) => (
                      <p key={j} className="text-xs text-slate-700 leading-relaxed">{line}</p>
                    ))}
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pro Tips</p>
                    <ul className="space-y-1">
                      {s.tips.map((tip, j) => (
                        <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                          <span className="text-emerald-400 shrink-0">+</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The compound effect of negotiation:</strong> If you negotiate your salary (+$5,000/year), your internet (-$360/year),
            your car insurance (-$600/year), and one major purchase (-$2,000), that is $7,960/year. Invested at 7% for 20 years,
            that negotiation skill is worth <strong>$344,000</strong>. And you only had to learn it once.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/side-hustles" className="text-sm text-emerald-600 hover:underline">Side Hustles</a>
        <a href="/budget" className="text-sm text-blue-600 hover:underline">Budget Calculator</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
        <a href="/compound-interest" className="text-sm text-violet-600 hover:underline">Compound Interest</a>
      </div>
    </div>
  )
}
