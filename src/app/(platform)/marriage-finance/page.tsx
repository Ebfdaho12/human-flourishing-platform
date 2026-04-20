"use client"

import { useState } from "react"
import { Heart, ChevronDown, AlertCircle, DollarSign, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const ACCOUNT_MODELS = [
  {
    model: "Fully Joint (One Pool)",
    pros: ["Maximum transparency — both people always know the full picture", "Simplifies bill payment and savings tracking", "Eliminates 'mine vs. yours' — everything is shared", "Works well when incomes are similar or one partner earns significantly more"],
    cons: ["Zero financial privacy — every purchase is visible", "Can feel controlling if one partner earns more and has different spending values", "Creates conflict over small discretionary purchases"],
    bestFor: "Couples who are highly aligned on values, similar spenders, and comfortable with full transparency.",
  },
  {
    model: "Fully Separate (Parallel Finances)",
    pros: ["Maximum autonomy and privacy", "No financial gatekeeping", "Works well when both partners have similar incomes and strong individual financial identities"],
    cons: ["How do you split shared expenses? Constant negotiation required", "Can create incentive misalignment — one partner saves, other spends", "Makes joint goals (house, retirement) harder to coordinate", "Can enable financial secrecy, which is a relationship risk"],
    bestFor: "Short-term relationships, or couples where both have strong, incompatible financial styles they're unwilling to blend.",
  },
  {
    model: "Hybrid (Yours, Mine, Ours) — Most Common",
    pros: ["Joint account for shared expenses (rent/mortgage, groceries, utilities, shared savings)", "Individual accounts for personal spending — no questions asked", "Balances transparency on shared goals with autonomy for personal choices"],
    cons: ["Requires agreement on how much each person contributes to joint (equal? proportional to income?)", "Three accounts to manage", "The 'fun money' split needs regular revisiting as incomes change"],
    bestFor: "Most couples. The contribution method (equal vs. proportional to income) is the main decision.",
  },
]

const MONEY_DATE = [
  { step: "Pick a recurring time", detail: "First Sunday of the month, or a weeknight after dinner. 30–60 minutes. Put it in the calendar. Treat it as non-negotiable as a bill payment." },
  { step: "Review last month's spending", detail: "Go through actual numbers — not feelings. Where did the money go? Anything surprising? No blame, just information. Use a shared spreadsheet or budgeting app (YNAB, Copilot, Monarch Money)." },
  { step: "Check on your goals", detail: "Emergency fund: where is it? Savings/investments: on track? Any upcoming large expenses (car maintenance, travel, gifts)? Adjust monthly allocations if needed." },
  { step: "Discuss any changes or concerns", detail: "Did income change? Are any subscriptions no longer worth it? Are you both still aligned on the big goals? This is a check-in, not a tribunal." },
  { step: "One forward decision", detail: "End every money date with one concrete action: 'We'll increase our TFSA contribution by $100/month starting next paycheck.' Small forward motion compounds over years." },
]

const COMMON_FIGHTS = [
  {
    fight: "'You spent HOW much on that?'",
    root: "Different spending values + no pre-agreed 'no questions asked' limit.",
    fix: "Agree on a 'consultation threshold' — any individual purchase over $X gets mentioned first. Common amounts: $200–$500. Implement personal 'fun money' that requires zero justification.",
  },
  {
    fight: "Saver vs. Spender",
    root: "Fundamentally different money personalities, often rooted in childhood money experiences.",
    fix: "Neither is objectively correct. The goal is not to make the spender into a saver, but to agree on savings rate that funds the saver's security needs while leaving enough discretionary for the spender's wellbeing. Both people must feel respected.",
  },
  {
    fight: "'Why don't you earn more?' or 'You work too much'",
    root: "Misaligned expectations about income, lifestyle, and time trade-offs.",
    fix: "This is a values conversation, not a numbers conversation. Explicitly discuss: What lifestyle do we want? What are we willing to sacrifice to get it? What aren't we willing to sacrifice? These conversations are hard but the alternative is resentment.",
  },
  {
    fight: "Debt one person brought into the relationship",
    root: "Undefined agreement about whether pre-relationship debt is 'ours' or 'yours.'",
    fix: "Default position in law: debts incurred before marriage are individual. But practically, if one partner is paying down debt instead of contributing to joint savings, the couple is affected. Have an explicit conversation: Is this 'our' problem to solve together, or 'yours'? Either is valid — just decide consciously.",
  },
  {
    fight: "Different risk tolerances in investing",
    root: "One partner is comfortable in equities; the other wants cash under the mattress.",
    fix: "Compromise on asset allocation. Consider separate investment accounts within the same overall strategy. Education often helps — many risk-averse partners become more comfortable with equities after understanding long-term data. Never override the risk-averse partner; that damages trust.",
  },
]

const PRENUP = [
  { q: "Isn't a prenup unromantic?", a: "Only if you think discussing reality is unromantic. A prenup is a conversation about values, expectations, and fairness — done while you still love each other unconditionally, before any grievance exists. Done well, it's one of the most respectful conversations a couple can have." },
  { q: "Who needs one?", a: "Anyone entering a marriage with: (1) significant individual assets (property, investments, inheritance), (2) significant individual debt, (3) a business they've built, (4) children from a previous relationship who need to inherit specific assets, (5) significantly different earning trajectories (one partner leaving a career for family), or (6) a substantial difference in net worth between partners." },
  { q: "What can it cover?", a: "Division of pre-marital assets. Protection of a business. Spousal support arrangements. How specific property is divided. What it cannot override: child support and custody (courts set this in children's best interests, always). It cannot include terms that encourage divorce or are grossly unfair at the time of signing." },
  { q: "How much does it cost?", a: "Each partner needs independent legal advice — budget $1,500–5,000+ per person depending on complexity. If it's protecting significant assets, this is cheap insurance. Courts will invalidate a prenup if one party didn't have independent legal counsel." },
  { q: "What about a postnup?", a: "A postnuptial agreement (signed after marriage) is legally valid in Canada and most jurisdictions. Useful if circumstances change significantly after marriage (inheritance, business success, one partner leaving work). Harder to enforce if contested, but still valuable." },
]

export default function MarriageFinancePage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Money & Marriage</h1>
        </div>
        <p className="text-sm text-muted-foreground">Finances are the #1 cause of divorce — not because of money, but because of communication about money. This is how to get ahead of it.</p>
      </div>

      <Card className="border-2 border-rose-200 bg-rose-50/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-semibold text-rose-900">The core insight</p>
          <p className="text-sm text-rose-700 mt-1">Couples who fight about money are usually not fighting about money. They're fighting about security, control, values, fairness, and trust — money is just the arena where those deeper conflicts surface. A monthly 'money date' catches these tensions early, before they become resentments. Most couples who divorce over finances never had a single intentional conversation about their financial values as a couple.</p>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-violet-600" />
          <p className="text-sm font-semibold">Joint vs. Separate Accounts</p>
        </div>
        <div className="space-y-2">
          {ACCOUNT_MODELS.map((m, i) => {
            const key = `acct-${i}`
            const isOpen = expanded === key
            return (
              <Card key={i} className="border">
                <CardContent className="pt-0 pb-0">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3">
                    <span className="text-sm font-semibold">{m.model}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="pb-4 border-t pt-3 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Pros</p>
                        <ul className="text-sm space-y-1">{m.pros.map((p, pi) => <li key={pi} className="text-muted-foreground">• {p}</li>)}</ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide mb-1">Cons</p>
                        <ul className="text-sm space-y-1">{m.cons.map((c, ci) => <li key={ci} className="text-muted-foreground">• {c}</li>)}</ul>
                      </div>
                      <div className="bg-muted/40 rounded p-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Best for</p>
                        <p className="text-sm">{m.bestFor}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold">The Monthly Money Date</p>
        </div>
        <div className="space-y-2">
          {MONEY_DATE.map((item, i) => (
            <div key={i} className="flex gap-3">
              <Badge variant="secondary" className="text-xs h-fit mt-0.5 shrink-0">{i + 1}</Badge>
              <div>
                <p className="text-sm font-semibold">{item.step}</p>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <p className="text-sm font-semibold">Biggest Financial Fights & How to Prevent Them</p>
        </div>
        <div className="space-y-2">
          {COMMON_FIGHTS.map((item, i) => {
            const key = `fight-${i}`
            const isOpen = expanded === key
            return (
              <Card key={i} className="border">
                <CardContent className="pt-0 pb-0">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3 gap-2">
                    <span className="text-sm font-semibold text-left">{item.fight}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="pb-3 pt-2 border-t space-y-2">
                      <p className="text-sm"><span className="font-medium text-amber-800">Root cause: </span>{item.root}</p>
                      <p className="text-sm"><span className="font-medium text-emerald-800">The fix: </span>{item.fix}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4 text-rose-500" />
          <p className="text-sm font-semibold">Prenups: Practical, Not Unromantic</p>
        </div>
        <div className="space-y-2">
          {PRENUP.map((item, i) => {
            const key = `prenup-${i}`
            const isOpen = expanded === key
            return (
              <Card key={i} className="border border-rose-100">
                <CardContent className="pt-0 pb-0">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3 gap-2">
                    <span className="text-sm font-semibold text-left">{item.q}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && <p className="text-sm text-muted-foreground pb-3 pt-2 border-t">{item.a}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/marriage-health" className="hover:underline text-foreground">Marriage Health</a>
        <a href="/divorce-finance" className="hover:underline text-foreground">Divorce & Finance</a>
        <a href="/budget" className="hover:underline text-foreground">Budget</a>
        <a href="/net-worth" className="hover:underline text-foreground">Net Worth</a>
        <a href="/money-relationship" className="hover:underline text-foreground">Money & Psychology</a>
      </div>
    </div>
  )
}
