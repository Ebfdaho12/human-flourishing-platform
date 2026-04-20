"use client"

import { useState } from "react"
import { Scale, ChevronDown, AlertTriangle, FileText, Home, CreditCard, Users, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const SECTIONS = [
  {
    id: "assets",
    icon: DollarSign,
    label: "Splitting Assets",
    badge: "RRSP & Pensions",
    content: [
      { title: "RRSP Division", body: "RRSPs accumulated during the marriage are matrimonial property in most provinces. They can be transferred between spouses under a court order or separation agreement without triggering immediate tax using Form T2220. The transfer is tax-neutral to the transferring spouse — no withholding tax, no inclusion in income. The receiving spouse inherits the tax liability when they eventually withdraw." },
      { title: "Defined Benefit Pensions", body: "Pension division is complex. A 'pension valuation' must be done by an actuary. Options: immediate offset (one spouse gets other assets of equal value now) or deferred split (payments split when pension pays out). Some pensions allow assignment under pension legislation; others don't. Get a certified divorce financial analyst (CDFA) for this." },
      { title: "TFSA and Investment Accounts", body: "TFSAs are included in net family property calculations. Transfers out are not tax-sheltered — withdrawing to give to a spouse triggers no tax (TFSAs are post-tax), but the TFSA room is lost. Non-registered investments transferred as part of a settlement are deemed dispositions — capital gains tax may apply. Document adjusted cost basis for all investments." },
      { title: "Business Interests", body: "If one or both spouses own a business, valuation is typically required. Fair market value less personal goodwill is the standard. A CPA or business valuator is essential. The non-owning spouse has a claim on the increase in business value during the marriage, not just the current value." },
    ],
  },
  {
    id: "home",
    icon: Home,
    label: "The Matrimonial Home",
    badge: "Special Rules Apply",
    content: [
      { title: "Why the home is different", body: "In Ontario and most provinces, the matrimonial home gets special treatment: BOTH spouses have equal right to possession, regardless of whose name is on the title. Neither can sell or mortgage the home without the other's consent — even after separation but before divorce." },
      { title: "Options for the home", body: "Option 1: One spouse buys out the other — requires refinancing to remove the departing spouse from the mortgage. Lenders require qualifying on one income. Option 2: Sell and split proceeds. Option 3: Deferred sale — often used when young children are in the home. The custodial parent stays until a trigger event (children graduate, remarriage)." },
      { title: "Tax on the principal residence", body: "The sale of a matrimonial home is generally tax-free under the principal residence exemption — but only for years it was your principal residence. If it was an investment property or rental for any years, partial gains tax may apply. Confirm with your accountant." },
    ],
  },
  {
    id: "support",
    icon: Users,
    label: "Child & Spousal Support",
    badge: "Federal Guidelines",
    content: [
      { title: "Child Support (Canada)", body: "Child support is determined by the Federal Child Support Guidelines. The paying parent's income and number of children determine the base amount — it's a table lookup, not a negotiation. The Department of Justice has an online calculator at justice.gc.ca/childsupp. Special and extraordinary expenses (daycare, medical, post-secondary) are shared proportionally to income." },
      { title: "Spousal Support", body: "Spousal support is more discretionary than child support. The Spousal Support Advisory Guidelines (SSAGs) provide ranges but aren't mandatory. Factors: length of marriage, economic disparity, career sacrifices made for family, ability to become self-sufficient. Duration is often 0.5–1 year per year of marriage for shorter marriages; indefinite for long ones." },
      { title: "Tax treatment", body: "Spousal support paid under a written agreement or court order is deductible to the payer and taxable to the recipient. Child support paid for orders after May 1997 is NOT deductible and NOT taxable. Keep all payment records; CRA audits these claims frequently." },
    ],
  },
  {
    id: "credit",
    icon: CreditCard,
    label: "Protecting Your Credit",
    badge: "Act Immediately",
    content: [
      { title: "Joint debt liability", body: "Both names on a debt = both are 100% liable. If your ex stops paying a joint credit card, YOUR credit score gets destroyed. Courts can order someone to pay a debt, but creditors are not bound by that order — they will still come after you." },
      { title: "What to do now", body: "Pull your credit report from both Equifax and TransUnion (free at annualcreditreport.ca). Document every joint account. Contact lenders immediately to either: convert joint accounts to individual, close the account, or get a release from liability. Pay off and close joint cards if at all possible." },
      { title: "Building individual credit", body: "If your credit profile was thin because a spouse managed finances, start building immediately: get a credit card in your name only, pay it in full monthly, get your name on a utility or service. Credit history is one of the most important post-separation financial assets." },
    ],
  },
  {
    id: "documents",
    icon: FileText,
    label: "Document Everything First",
    badge: "Before You Separate",
    content: [
      { title: "Financial disclosure is mandatory", body: "Separation agreements require full financial disclosure by both parties. Hidden assets discovered later can void agreements and create contempt of court issues. But documenting NOW — before things get adversarial — protects you." },
      { title: "Documents to gather", body: "Last 3 years of tax returns (yours and joint), all bank and investment statements (especially going back to marriage date), property assessments, mortgage statements, pension statements, business records, life insurance policies, RRSP contribution room statements, credit card statements, vehicle valuations." },
      { title: "Marriage date is critical", body: "Net family property is calculated as: (value on separation date) minus (value on marriage date). Document your assets and debts AS OF your marriage date. If you had assets before marriage — inherited money, pre-marriage RRSP — these may be excluded with proper documentation." },
    ],
  },
  {
    id: "admin",
    icon: Scale,
    label: "Beneficiaries, Will & POA",
    badge: "Often Forgotten",
    content: [
      { title: "Update beneficiary designations", body: "RRSP, RRIF, TFSA, life insurance, and pension plans pass outside your will — directly to named beneficiaries. Divorce does NOT automatically remove an ex-spouse as beneficiary in most provinces (Ontario changed this in 2022 for some instruments; check your province). Update these immediately." },
      { title: "Rewrite your will", body: "Your existing will likely leaves everything to your spouse. If you die during separation (before divorce is final), they may inherit under that will. Make a new will immediately. Name a new executor. Establish guardianship provisions for children." },
      { title: "Power of Attorney", body: "If your ex is your attorney under a POA, revoke it in writing and notify institutions. Execute a new POA for property and personal care. Choose someone you trust completely — they will have significant financial and medical decision-making authority." },
    ],
  },
]

export default function DivorceFinancePage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-700">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Divorce Financial Guide (Canada)</h1>
        </div>
        <p className="text-sm text-muted-foreground">Financial steps, not legal advice. For legal guidance, consult a family law lawyer. For financial strategy, a Certified Divorce Financial Analyst (CDFA) can help.</p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="pt-4 pb-3 flex gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">This is not legal advice.</p>
            <p className="text-sm text-amber-800 mt-0.5">Family law varies significantly by province. A family law lawyer is essential for any separation or divorce. What follows is general financial education to help you ask better questions.</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {SECTIONS.map(section => {
          const Icon = section.icon
          const isOpen = expanded === section.id
          return (
            <Card key={section.id} className="border">
              <CardContent className="pt-0 pb-0">
                <button
                  onClick={() => setExpanded(isOpen ? null : section.id)}
                  className="w-full flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{section.label}</span>
                    <Badge variant="secondary" className="text-xs">{section.badge}</Badge>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="pb-4 space-y-4 border-t pt-4">
                    {section.content.map((item, i) => (
                      <div key={i}>
                        <p className="text-sm font-semibold mb-1">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-semibold text-blue-900 mb-2">Key resources</p>
          <div className="space-y-1 text-sm text-blue-800">
            <p>Child Support Calculator: justice.gc.ca/childsupp</p>
            <p>Find a CDFA: institutedfa.com</p>
            <p>Free legal help: legalaid.on.ca (and provincial equivalents)</p>
            <p>Credit reports: Equifax and TransUnion both offer free reports</p>
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/money-relationship" className="hover:underline text-foreground">Money Personality</a>
        <a href="/credit-score" className="hover:underline text-foreground">Credit Score</a>
        <a href="/budget" className="hover:underline text-foreground">Budget</a>
        <a href="/marriage-health" className="hover:underline text-foreground">Marriage Health</a>
      </div>
    </div>
  )
}
