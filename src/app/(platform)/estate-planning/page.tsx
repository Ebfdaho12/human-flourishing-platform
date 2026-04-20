"use client"

import { useState } from "react"
import { Shield, FileText, AlertTriangle, ArrowRight, ChevronDown, CheckCircle, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const DOCUMENTS = [
  { name: "Will (Last Will and Testament)", urgency: "CRITICAL", cost: "$300-$1,000 (lawyer) or $40-$100 (online)", whoNeeds: "EVERYONE over 18. If you own anything, have a bank account, or have children — you need a will. Period.", whatHappens: "Without a will: provincial intestacy laws decide who gets what. A court-appointed administrator handles your estate (slow, expensive). If you have young children and no will, a JUDGE decides who raises them — not your family.", howToGet: "Option 1: estate lawyer ($500-$1,000, recommended if you have property/children). Option 2: online services like Willful.co or LegalWills.ca ($40-$100, fine for simple situations). Option 3: holographic will (handwritten, signed — legally valid in most provinces but risky)." },
  { name: "Power of Attorney — Financial", urgency: "CRITICAL", cost: "$100-$300 (included in will packages)", whoNeeds: "Every adult. If you are incapacitated (accident, illness, stroke), someone needs legal authority to pay your bills, manage your accounts, and handle your finances.", whatHappens: "Without POA: your family must apply to court for guardianship (costs $5,000+, takes months). Meanwhile, bills go unpaid, accounts frozen, mortgage could default.", howToGet: "Same lawyer who does your will, or online will services include it. Name someone you trust completely — they have full access to your financial life." },
  { name: "Power of Attorney — Healthcare (Advance Directive)", urgency: "HIGH", cost: "$100-$200 (included in will packages)", whoNeeds: "Every adult. Specifies your healthcare wishes if you cannot communicate. Who makes medical decisions for you? Do you want life support? Organ donation?", whatHappens: "Without advance directive: doctors make decisions based on what they think is best. Your family may disagree with each other. Arguments happen at the worst possible time.", howToGet: "Part of will package. Also: fill out a 'living will' expressing your wishes clearly. Have the conversation with your POA and family BEFORE it is needed." },
  { name: "Beneficiary Designations", urgency: "HIGH", cost: "Free", whoNeeds: "Anyone with: RRSP, TFSA, life insurance, pension, or workplace benefits. Beneficiary designations OVERRIDE your will.", whatHappens: "If your RRSP beneficiary is your ex-spouse (because you never updated it after divorce), they get the money — even if your will says otherwise. This is the #1 estate planning mistake in Canada.", howToGet: "Log in to every account (bank, investment, insurance, pension, workplace benefits). Check who is listed as beneficiary. Update if needed. Do this TODAY — it takes 10 minutes and costs nothing." },
  { name: "Life Insurance", urgency: "HIGH (if you have dependents)", cost: "$20-$50/month for $500K term life (age 30)", whoNeeds: "Anyone with a mortgage, children, or a spouse who depends on your income. NOT needed if: no dependents, no debt, and enough savings to cover funeral costs.", whatHappens: "Mortgage: your family loses the home if they can't make payments. Children: the surviving parent may need to work full-time, losing the ability to be present. The most loving thing you can do for your family is ensure they're financially secure if you're gone.", howToGet: "Term life insurance (NOT whole life — whole life is a bad investment disguised as insurance). Get quotes: PolicyAdvisor.com, PolicyMe.com, or through your employer benefits. 10-20x annual income is the standard rule." },
]

const COMMON_MISTAKES = [
  "No will at all — 56% of Canadians don't have one. If you die without a will, the government's formula decides who gets what.",
  "Not updating after major life events — marriage, divorce, birth of child, death of beneficiary. A will from 2010 may name people who are no longer in your life.",
  "Naming only one executor — if that person is unable or unwilling, the court appoints someone. Name a backup.",
  "Not discussing with family — your will should not be a surprise. The people named (executor, guardian, POA) should know and agree to the responsibility.",
  "RRSP/TFSA beneficiary left blank or outdated — these assets transfer OUTSIDE the will. If the beneficiary field is blank, the money goes through probate (slower, more expensive, potentially taxed).",
  "Not planning for probate fees — Ontario charges 1.5% of estate value over $50K. On a $500K estate, that's $7,250. Assets with named beneficiaries (RRSP, TFSA, life insurance, joint accounts) bypass probate.",
  "DIY will with errors — a will that isn't witnessed properly, uses ambiguous language, or contradicts beneficiary designations can be challenged in court. When in doubt, pay the $500 for a lawyer.",
]

export default function EstatePlanningPage() {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-violet-700">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Will & Estate Planning</h1>
        </div>
        <p className="text-sm text-muted-foreground">The documents every adult needs. 56% of Canadians don't have a will. Don't be in that 56%.</p>
      </div>

      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>If you have children and no will:</strong> a judge — not your family — decides who raises them.
            If you have a mortgage and no life insurance: your family loses the home. If you have RRSPs and no
            named beneficiary: the money goes through probate, gets delayed, and may be taxed unnecessarily.
            These are not comfortable topics. They are essential ones. 30 minutes now saves your family months
            of legal, financial, and emotional pain.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {DOCUMENTS.map((doc, i) => {
          const isOpen = expanded === i
          return (
            <Card key={i} className={cn("card-hover cursor-pointer",
              doc.urgency === "CRITICAL" ? "border-red-200" : "border-amber-200"
            )} onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-500 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{doc.name}</p>
                      <Badge variant="outline" className={cn("text-[9px]",
                        doc.urgency === "CRITICAL" ? "text-red-500 border-red-300" : "text-amber-600 border-amber-300"
                      )}>{doc.urgency}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{doc.cost}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="mt-3 space-y-2 pl-8">
                    <p className="text-xs text-muted-foreground"><strong>Who needs this:</strong> {doc.whoNeeds}</p>
                    <div className="rounded-lg bg-red-50 border border-red-200 p-2">
                      <p className="text-xs text-red-700"><strong>Without it:</strong> {doc.whatHappens}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                      <p className="text-xs text-emerald-700"><strong>How to get it:</strong> {doc.howToGet}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> 7 Common Estate Planning Mistakes
        </CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {COMMON_MISTAKES.map((m, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
              <span className="text-red-400 shrink-0">✗</span>{m}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The 30-minute action plan:</strong> 1) Check your beneficiaries on every account (10 min).
            2) Get a will — Willful.co or LegalWills.ca for simple situations, estate lawyer for complex ones (20 min to start).
            3) Tell your executor and POA that you have named them. 4) Store originals in a fireproof safe; give copies to executor.
            This is not legal advice — consult a licensed estate lawyer for your specific situation.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/community-resources" className="text-sm text-rose-600 hover:underline">Community Resources</a>
        <a href="/financial-dashboard" className="text-sm text-emerald-600 hover:underline">Financial Dashboard</a>
        <a href="/net-worth" className="text-sm text-violet-600 hover:underline">Net Worth</a>
      </div>
    </div>
  )
}
