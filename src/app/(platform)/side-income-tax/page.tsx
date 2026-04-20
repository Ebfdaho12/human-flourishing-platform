"use client"

import { useState } from "react"
import { Receipt, ChevronDown, AlertTriangle, CheckCircle, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const TOPICS: {
  title: string
  tag: string
  tagColor: string
  summary: string
  body: { label: string; text: string }[]
  tip?: string
  warning?: string
}[] = [
  {
    title: "The $30,000 HST Threshold",
    tag: "Registration",
    tagColor: "text-rose-500 border-rose-300",
    summary: "You must register for HST/GST once you earn more than $30,000 in a calendar year from self-employment.",
    body: [
      { label: "The rule", text: "Once your total self-employment income in any four consecutive calendar quarters exceeds $30,000, you are legally required to register for a GST/HST number with the CRA. This includes income from all sources combined — freelancing, tutoring, driving, consulting." },
      { label: "How to register", text: "Register online at canada.ca/cra-business (takes 15 minutes). You will get a 9-digit Business Number. Once registered, you must collect HST from clients (13% in Ontario, varies by province) and remit it to the CRA." },
      { label: "Before you hit $30K", text: "You can voluntarily register at any time — which lets you claim Input Tax Credits (ITCs) to recover HST you paid on business expenses. If your expenses are significant (equipment, supplies), voluntary registration often saves money." },
      { label: "The tax is not yours", text: "HST you collect belongs to the government. Keep it in a separate savings account so you are not tempted to spend it. Remit on time — penalties for late remittance compound fast." },
    ],
    tip: "Set aside 13% of every invoice into a separate account labeled 'HST Owed.' Never touch it.",
  },
  {
    title: "Reporting Self-Employment Income",
    tag: "Tax Filing",
    tagColor: "text-violet-500 border-violet-300",
    summary: "Self-employment income goes on T2125 (Statement of Business Activities) — attached to your T1 personal return.",
    body: [
      { label: "T2125 form", text: "Every self-employed person files a T2125. It reports gross income, allowable deductions, and net business income. Your net business income is what gets taxed — not your gross revenue." },
      { label: "Net income = gross income minus expenses", text: "If you earned $40,000 freelancing and had $8,000 in legitimate business expenses, you pay tax on $32,000. Deductions matter enormously at this income level." },
      { label: "Self-employment tax hit", text: "You pay both the employee AND employer portion of CPP contributions (about 11.9% of net income up to the maximum). This surprises many first-time self-employed people — budget for it." },
      { label: "Deadlines", text: "If you or your spouse are self-employed, you have until June 15 to file your return. However, any tax owing is still due April 30. File by April 30 if you owe money to avoid interest." },
    ],
    warning: "Failing to report self-employment income is tax evasion — not a grey area. The CRA cross-references e-transfers, PayPal, Etsy payouts, and bank deposits. Report everything.",
  },
  {
    title: "What You Can Deduct",
    tag: "Deductions",
    tagColor: "text-emerald-600 border-emerald-300",
    summary: "Every dollar you deduct reduces your taxable income. Keep receipts for everything.",
    body: [
      { label: "Home office", text: "If you work from home regularly, you can deduct a portion of rent/mortgage interest, utilities, internet, and property tax. Calculate the percentage: your workspace square footage ÷ total home square footage. On a 1,200 sq ft home with a 120 sq ft office, you deduct 10% of home costs." },
      { label: "Vehicle", text: "Track business vs personal km in a mileage log (date, destination, purpose, km). Deductible portion = business km ÷ total km × actual vehicle costs (gas, insurance, maintenance, depreciation). The CRA requires a logbook — 'I think it was about 60% business' is not acceptable." },
      { label: "Phone", text: "Deduct the business-use percentage of your phone bill. If you use it 50% for work, deduct 50%. Keep your bill. The CRA accepts a reasonable estimate backed by documentation." },
      { label: "Equipment & supplies", text: "Laptops, cameras, tools, office furniture, software subscriptions — all deductible. Large assets (over ~$500) are depreciated over time using CCA (Capital Cost Allowance) rather than deducted in full." },
      { label: "Professional services", text: "Accounting fees, legal fees, business insurance, professional memberships, courses directly related to your business — all deductible." },
    ],
    tip: "Use a dedicated credit/debit card for all business expenses. This creates a perfect paper trail and makes T2125 preparation trivial.",
  },
  {
    title: "Quarterly Installment Payments",
    tag: "Cash Flow",
    tagColor: "text-amber-600 border-amber-300",
    summary: "If you will owe more than $3,000 in tax, the CRA may require you to pay in quarterly installments.",
    body: [
      { label: "Why installments exist", text: "Employees have tax withheld from every paycheque. Self-employed people don't — so the CRA requires quarterly prepayments to prevent a massive bill in April. If you owed more than $3,000 last year (or this year), you will receive installment reminders." },
      { label: "Payment schedule", text: "Installments are due March 15, June 15, September 15, and December 15. The CRA will suggest an amount based on last year's tax — but you can pay based on your best estimate of current-year income." },
      { label: "Simple calculation", text: "Estimate your net business income for the year. Apply your expected marginal tax rate plus 11.9% CPP. Divide by 4. Pay that quarterly. Adjust if your income changes significantly mid-year." },
      { label: "Interest on missed installments", text: "The CRA charges prescribed interest (currently 9-10%) on late or missed installments — even if you pay in full at tax time. Installments are not optional once you qualify." },
    ],
    tip: "Every time you get paid for a job, transfer 30% into a dedicated tax savings account. Never miss a quarterly payment.",
  },
  {
    title: "CRA Audit Triggers to Avoid",
    tag: "Risk",
    tagColor: "text-red-500 border-red-300",
    summary: "Most audits are triggered by patterns — not random selection. Understand what raises flags.",
    body: [
      { label: "Large round-number deductions", text: "Claiming exactly $10,000 in vehicle expenses every year, or exactly $5,000 in meals, triggers attention. Real expenses are messy — keep real receipts and claim real amounts." },
      { label: "Home office + vehicle both 100%", text: "Claiming your home office as 100% business use AND your car as 100% business use in the same year — when you are clearly living in the house — is a red flag. Be reasonable." },
      { label: "Income that doesn't match lifestyle", text: "Reporting $25,000 net income while owning a $600,000 home, three vehicles, and taking international trips raises questions. The CRA uses net-worth audits for suspected unreported income." },
      { label: "Consistent losses for multiple years", text: "A business that loses money every year with no path to profitability looks like a tax shelter, not a real business. If it is a real business, document the business plan." },
      { label: "Missing the HST threshold", text: "If your gross revenue crosses $30,000 and you have not registered for HST, the CRA can assess you for uncollected HST — plus interest and penalties — going back years." },
    ],
    warning: "An audit is not the end of the world if your records are clean. It is a disaster if they are not. Keep every receipt for 7 years.",
  },
  {
    title: "Simple (Sole Proprietor) vs Incorporated",
    tag: "Structure",
    tagColor: "text-blue-500 border-blue-300",
    summary: "Most side income earners should stay unincorporated until they consistently earn $80,000+ net.",
    body: [
      { label: "Sole proprietor (default)", text: "You report income on your personal T1 return using T2125. Simple, cheap, no corporate filings. All income taxed at your marginal personal rate. Income and losses directly offset your other income. Right for: under $80K net, early-stage, or part-time income." },
      { label: "Incorporation", text: "A separate legal entity. Files its own T2 corporate return. Small business rate in Canada is ~9% on the first $500K of active income — vs 20-53% personally. Tax deferral: leave profits in the corp, pay yourself only what you need. Right for: consistent $80K+ net profit, stable client base, long-term plans." },
      { label: "The deferral game", text: "Incorporation does not eliminate tax — it defers it. When you pay yourself dividends or salary, personal tax applies. The benefit is choosing WHEN to pay tax, which can be powerful for investment and retirement planning." },
      { label: "Incorporation costs", text: "$1,000-$2,000 to incorporate (lawyer or DIY at $360 through Ownr/Ownr). $1,500-$3,000/year for corporate accounting. It only makes financial sense when the tax savings exceed the extra admin cost." },
    ],
    tip: "Start as a sole proprietor. Get comfortable with T2125. Once your net self-employment income consistently exceeds $80,000, talk to a CPA about incorporating.",
  },
]

export default function SideIncomeTaxPage() {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Receipt className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Side Income Tax Guide</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Canada-specific. Everything you need to know about taxes on freelance, contract, and side hustle income — so you never get blindsided.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The #1 mistake new self-employed Canadians make:</strong> spending all their income without setting aside tax.
            The CRA will come for 25-45% of your net profit — and they will add interest if you are not ready.
            This guide will make sure that never happens to you. Not legal or tax advice — consult a CPA for your situation.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {TOPICS.map((t, i) => {
          const isOpen = expanded === i
          return (
            <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{t.title}</p>
                      <Badge variant="outline" className={cn("text-[9px]", t.tagColor)}>{t.tag}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.summary}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="mt-3 pl-13 space-y-2">
                    {t.body.map((b, j) => (
                      <p key={j} className="text-xs text-muted-foreground leading-relaxed">
                        <strong>{b.label}: </strong>{b.text}
                      </p>
                    ))}
                    {t.tip && (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                        <p className="text-xs text-emerald-700"><strong>Tip:</strong> {t.tip}</p>
                      </div>
                    )}
                    {t.warning && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-2.5">
                        <p className="text-xs text-red-700"><strong>Warning:</strong> {t.warning}</p>
                      </div>
                    )}
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
            <strong>The 30% rule:</strong> Every time money hits your account from self-employment, move 30% to a
            dedicated tax savings account. Never touch it until tax time. If your marginal rate is lower, you get a
            refund. If it is higher, you are close enough. This one habit prevents the most common financial disaster
            in self-employment: the surprise April tax bill that wipes out everything you earned.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/tax-estimator" className="text-sm text-emerald-600 hover:underline">Tax Estimator</a>
        <a href="/side-hustles" className="text-sm text-amber-600 hover:underline">Side Hustle Finder</a>
        <a href="/budget" className="text-sm text-blue-600 hover:underline">Budget Calculator</a>
        <a href="/retirement" className="text-sm text-violet-600 hover:underline">Retirement Planning</a>
        <a href="/estate-planning" className="text-sm text-slate-600 hover:underline">Estate Planning</a>
      </div>
    </div>
  )
}
