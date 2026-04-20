"use client"

import { useState } from "react"
import { CreditCard, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const SCORE_RANGES = [
  { range: "800-900", label: "Excellent", color: "text-emerald-600 bg-emerald-50 border-emerald-200", pct: "15% of Canadians", benefit: "Best rates on everything. Instant approvals. Premium credit card offers." },
  { range: "720-799", label: "Very Good", color: "text-blue-600 bg-blue-50 border-blue-200", pct: "25% of Canadians", benefit: "Near-best rates. Easy approvals. Most people should aim here." },
  { range: "680-719", label: "Good", color: "text-cyan-600 bg-cyan-50 border-cyan-200", pct: "20% of Canadians", benefit: "Competitive rates. Standard approvals. Room to improve." },
  { range: "600-679", label: "Fair", color: "text-amber-600 bg-amber-50 border-amber-200", pct: "20% of Canadians", benefit: "Higher rates. May need co-signer for large purchases. Improvement possible within 6-12 months." },
  { range: "300-599", label: "Poor", color: "text-red-500 bg-red-50 border-red-200", pct: "20% of Canadians", benefit: "Difficulty getting approved. High rates. Rebuild takes 12-24 months of consistent effort." },
]

const FACTORS = [
  { factor: "Payment History", weight: "35%", desc: "The single biggest factor. Have you paid every bill on time? Even ONE missed payment (30+ days late) can drop your score 50-100 points and stay on your report for 6 years.", improve: "Set up automatic payments for everything. If you missed one, call and ask for a goodwill adjustment (some creditors will remove it if you've been reliable since)." },
  { factor: "Credit Utilization", weight: "30%", desc: "How much of your available credit are you using? Using 80% of your limit ($4,000 of a $5,000 card) destroys your score. Under 30% is good. Under 10% is optimal.", improve: "Pay credit cards 2x/month (before statement date). Request higher limits (lowers utilization without spending more). Never max out a card." },
  { factor: "Credit History Length", weight: "15%", desc: "How long have you had credit accounts? Longer = better. Closing your oldest card shortens your history and drops your score.", improve: "Keep your oldest credit card open — even if you don't use it. Put a small recurring charge on it (Netflix) and set up autopay." },
  { factor: "Credit Mix", weight: "10%", desc: "Having different types of credit (credit card + car loan + mortgage) shows you can handle various debt types.", improve: "Don't take on debt just for this factor. But if you have only credit cards, a small car loan or line of credit adds mix." },
  { factor: "New Credit Inquiries", weight: "10%", desc: "Every time you apply for credit, a 'hard inquiry' appears. Too many applications in a short time = looks desperate = score drops.", improve: "Limit applications to when you actually need credit. Multiple mortgage or car loan inquiries within 14 days count as ONE inquiry (rate shopping). Don't apply for store credit cards at checkout." },
]

const MYTHS = [
  { myth: "Checking your own credit score hurts it", truth: "FALSE. Checking your own score is a 'soft inquiry' — it has ZERO impact. Check it monthly. Borrowell and Credit Karma are free." },
  { myth: "Closing credit cards improves your score", truth: "USUALLY FALSE. Closing cards reduces your total available credit (increasing utilization) and can shorten credit history. Keep cards open, especially your oldest." },
  { myth: "You need to carry a balance to build credit", truth: "FALSE. You build credit by USING the card and PAYING IT IN FULL every month. Carrying a balance just costs you interest. Zero balance = zero interest = same credit building." },
  { myth: "Debit cards build credit", truth: "FALSE. Debit cards are not reported to credit bureaus. They have zero impact on your score. Only credit products (credit cards, loans, lines of credit) build credit." },
  { myth: "Income affects your credit score", truth: "FALSE. Your income is NOT a factor in your credit score. A person earning $30K with perfect payment history has a higher score than a person earning $300K who misses payments." },
  { myth: "All debt is bad for your score", truth: "FALSE. Having manageable debt that you pay consistently BUILDS your score. No credit history at all (no debt ever) actually makes it harder to get approved because there's no data to evaluate." },
]

const BUILD_FROM_ZERO = [
  { step: "1. Get a secured credit card", desc: "You deposit $500 (your 'security'). The bank gives you a $500 credit limit. Use it for small purchases. Pay in full monthly. After 6-12 months, convert to a regular card and get your deposit back. Capital One, Home Trust, and most credit unions offer these." },
  { step: "2. Become an authorized user", desc: "Ask a family member with good credit to add you as an authorized user on their card. Their positive history appears on YOUR report. You don't even need to use the card." },
  { step: "3. Get a credit builder loan", desc: "Some credit unions offer loans where the money goes into a locked savings account. You make payments (building history). When the loan is paid, you get the savings. You build credit AND savings simultaneously." },
  { step: "4. Report rent payments", desc: "Services like Borrowell Rent Advantage and FrontLobby report your rent payments to credit bureaus. If you pay rent on time (which you do), it builds your score. Costs $5-8/month." },
  { step: "5. Wait 6-12 months", desc: "With consistent on-time payments, a secured card, and low utilization, most people see their score rise 100+ points within 6-12 months. It's not fast, but it's reliable." },
]

export default function CreditScorePage() {
  const [expandedFactor, setExpandedFactor] = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Credit Score Demystified</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          How it works. What affects it. How to improve it. Myths debunked.
        </p>
      </div>

      <Card className="border-2 border-blue-200 bg-blue-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Check yours for free:</strong> <a href="https://www.borrowell.com" className="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">Borrowell</a> (Equifax score) and{" "}
            <a href="https://www.creditkarma.ca" className="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">Credit Karma</a> (TransUnion score) are both free and do NOT affect your score. Check monthly.
          </p>
        </CardContent>
      </Card>

      {/* Score ranges */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Score Ranges</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {SCORE_RANGES.map((s, i) => (
            <div key={i} className={cn("rounded-lg border p-2.5", s.color)}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-bold">{s.range}</span>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[9px]">{s.label}</Badge>
                  <span className="text-[10px] text-muted-foreground">{s.pct}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">{s.benefit}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 5 factors */}
      <div>
        <h2 className="text-lg font-bold mb-3">5 Factors That Determine Your Score</h2>
        <div className="space-y-2">
          {FACTORS.map((f, i) => {
            const isOpen = expandedFactor === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedFactor(isOpen ? null : i)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Badge className="text-xs bg-blue-500 text-white shrink-0">{f.weight}</Badge>
                    <p className="text-sm font-medium flex-1">{f.factor}</p>
                    <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-2 space-y-1.5 pl-14">
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                        <p className="text-xs text-emerald-700"><strong>How to improve:</strong> {f.improve}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Myths */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> 6 Credit Score Myths
        </CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {MYTHS.map((m, i) => (
            <div key={i} className="rounded-lg border border-border p-2.5">
              <p className="text-xs text-red-500 line-through mb-0.5">{m.myth}</p>
              <p className="text-xs text-emerald-700">{m.truth}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Build from zero */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Building Credit From Scratch (5 Steps)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {BUILD_FROM_ZERO.map((s, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">{i + 1}</div>
              <div>
                <p className="text-xs font-semibold">{s.step}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/budget" className="text-sm text-emerald-600 hover:underline">Budget</a>
        <a href="/debt-payoff" className="text-sm text-red-600 hover:underline">Debt Payoff</a>
        <a href="/home-buying" className="text-sm text-blue-600 hover:underline">Home Buying</a>
        <a href="/education/finance" className="text-sm text-amber-600 hover:underline">Financial Literacy</a>
      </div>
    </div>
  )
}
