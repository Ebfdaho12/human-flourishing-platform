"use client"

import { useState } from "react"
import { Gift, DollarSign, Baby, GraduationCap, Home, Heart, Users, CheckCircle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

interface Benefit {
  name: string
  icon: any
  maxAmount: string
  whoQualifies: string
  howToGet: string
  incomeThreshold: number // 0 = everyone, otherwise max income
  requiresChildren: boolean
  requiresDisability: boolean
  requiresSenior: boolean
  estimated: (income: number, children: number) => number
}

const BENEFITS: Benefit[] = [
  {
    name: "Canada Child Benefit (CCB)",
    icon: Baby,
    maxAmount: "$7,437/child under 6, $6,275/child 6-17 per year",
    whoQualifies: "Families with children under 18. Income-tested — lower income = higher benefit.",
    howToGet: "Apply when child is born (CRA automatically processes if you file taxes). File taxes every year — even if income is $0.",
    incomeThreshold: 200000,
    requiresChildren: true,
    requiresDisability: false,
    requiresSenior: false,
    estimated: (income, children) => {
      if (children === 0) return 0
      const base = children * 7000 // simplified average
      const reduction = Math.max(0, income - 34863) * 0.07
      return Math.max(0, Math.round(base - reduction))
    },
  },
  {
    name: "GST/HST Credit",
    icon: DollarSign,
    maxAmount: "$496/individual, $650/couple, +$171 per child per year",
    whoQualifies: "All Canadian residents 19+. Income-tested — phases out above ~$42K individual / ~$55K family.",
    howToGet: "Automatic when you file your tax return. No application needed. Paid quarterly (Jan, Apr, Jul, Oct).",
    incomeThreshold: 55000,
    requiresChildren: false,
    requiresDisability: false,
    requiresSenior: false,
    estimated: (income, children) => {
      const base = 496 + (children * 171)
      const reduction = Math.max(0, income - 42335) * 0.05
      return Math.max(0, Math.round(base - reduction))
    },
  },
  {
    name: "Canada Workers Benefit (CWB)",
    icon: DollarSign,
    maxAmount: "$1,518/single, $2,616/family per year",
    whoQualifies: "Low-income workers earning over $3,000/year but under ~$33K single / ~$43K family.",
    howToGet: "Automatic when filing taxes. Can also apply for advance payments (50% paid throughout the year).",
    incomeThreshold: 43000,
    requiresChildren: false,
    requiresDisability: false,
    requiresSenior: false,
    estimated: (income, children) => {
      if (income < 3000 || income > 43000) return 0
      const familyMax = children > 0 ? 2616 : 1518
      if (income < 17522) return Math.min(familyMax, Math.round((income - 3000) * 0.27))
      return Math.max(0, Math.round(familyMax - (income - 17522) * 0.12))
    },
  },
  {
    name: "Canada Dental Benefit",
    icon: Heart,
    maxAmount: "$650/child per year (for children under 12)",
    whoQualifies: "Families with children under 12, family income under $90,000, no private dental insurance.",
    howToGet: "Apply through CRA My Account. Must not have access to private dental insurance.",
    incomeThreshold: 90000,
    requiresChildren: true,
    requiresDisability: false,
    requiresSenior: false,
    estimated: (income, children) => {
      if (children === 0 || income > 90000) return 0
      return children * (income < 70000 ? 650 : 390)
    },
  },
  {
    name: "Ontario Trillium Benefit",
    icon: Home,
    maxAmount: "Up to $1,421/year (Ontario only)",
    whoQualifies: "Ontario residents. Combines energy credit + property tax credit + sales tax credit. Income-tested.",
    howToGet: "File Ontario tax return + check the box for Trillium. Paid monthly.",
    incomeThreshold: 50000,
    requiresChildren: false,
    requiresDisability: false,
    requiresSenior: false,
    estimated: (income) => {
      if (income > 50000) return 0
      return Math.max(0, Math.round(1421 - Math.max(0, income - 25000) * 0.04))
    },
  },
  {
    name: "Canada Learning Bond (CLB)",
    icon: GraduationCap,
    maxAmount: "$2,000 per child (free — NO contribution required)",
    whoQualifies: "Children born after 2003 in families receiving NCB supplement (generally income under ~$50K). Zero contribution required — government gives the money.",
    howToGet: "Open an RESP for your child. Apply for CLB through your bank or online. The $2,000 is deposited for FREE.",
    incomeThreshold: 50000,
    requiresChildren: true,
    requiresDisability: false,
    requiresSenior: false,
    estimated: (income, children) => {
      if (children === 0 || income > 50000) return 0
      return children * 500 // Initial $500 + $100/year
    },
  },
  {
    name: "Canada Child Disability Benefit",
    icon: Heart,
    maxAmount: "$3,322/year per eligible child",
    whoQualifies: "Families with a child eligible for the Disability Tax Credit. Income-tested.",
    howToGet: "Apply for Disability Tax Credit (Form T2201 signed by doctor), then CCDB is automatic.",
    incomeThreshold: 200000,
    requiresChildren: true,
    requiresDisability: true,
    requiresSenior: false,
    estimated: () => 3322, // Simplified — income reduction complex
  },
  {
    name: "Disability Tax Credit (DTC)",
    icon: Heart,
    maxAmount: "$9,428 federal tax credit (saves ~$1,400+ in tax)",
    whoQualifies: "Anyone with a severe and prolonged impairment in physical or mental functions. Broader than most people think — includes diabetes, ADHD, chronic pain, anxiety disorders, and more.",
    howToGet: "Form T2201 — your doctor fills out and you submit to CRA. If approved, retroactive claims for up to 10 years.",
    incomeThreshold: 0,
    requiresChildren: false,
    requiresDisability: true,
    requiresSenior: false,
    estimated: () => 1414,
  },
  {
    name: "OAS + GIS (Seniors)",
    icon: Users,
    maxAmount: "OAS: $8,560/year + GIS: up to $11,680/year for low-income seniors",
    whoQualifies: "OAS: all Canadians 65+ with 10+ years of residence. GIS: low-income seniors (income under ~$21K single / ~$28K couple).",
    howToGet: "OAS is automatic if you filed taxes. GIS requires application through Service Canada.",
    incomeThreshold: 0,
    requiresChildren: false,
    requiresDisability: false,
    requiresSenior: true,
    estimated: () => 8560,
  },
]

export default function CanadaBenefitsPage() {
  const [income, setIncome] = useState(60000)
  const [children, setChildren] = useState(2)
  const [hasDisability, setHasDisability] = useState(false)
  const [isSenior, setIsSenior] = useState(false)
  const [province, setProvince] = useState("Ontario")

  const eligible = BENEFITS.filter(b => {
    if (b.requiresChildren && children === 0) return false
    if (b.requiresDisability && !hasDisability) return false
    if (b.requiresSenior && !isSenior) return false
    if (b.incomeThreshold > 0 && income > b.incomeThreshold) return false
    return true
  })

  const totalEstimated = eligible.reduce((s, b) => s + b.estimated(income, children), 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canadian Benefits Finder</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your situation. See every benefit you qualify for. Most Canadians leave $1,000-$5,000+ on the table every year.
        </p>
      </div>

      {/* Inputs */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Household income</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={income || ""} onChange={e => setIncome(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Children under 18</label>
              <Input type="number" min={0} max={10} value={children} onChange={e => setChildren(Number(e.target.value) || 0)} />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={hasDisability} onChange={e => setHasDisability(e.target.checked)} className="rounded" />
              Disability (self or child)
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={isSenior} onChange={e => setIsSenior(e.target.checked)} className="rounded" />
              Age 65+
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Total */}
      <Card className="border-2 border-emerald-300 bg-emerald-50/20">
        <CardContent className="p-5 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimated Annual Benefits</p>
          <p className="text-3xl font-bold text-emerald-600">${totalEstimated.toLocaleString()}/year</p>
          <p className="text-xs text-emerald-600">${Math.round(totalEstimated / 12).toLocaleString()}/month</p>
          <p className="text-[10px] text-muted-foreground mt-2">{eligible.length} benefits you likely qualify for</p>
        </CardContent>
      </Card>

      {/* Eligible benefits */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Benefits You Qualify For</p>
        {eligible.map((b, i) => {
          const Icon = b.icon
          const est = b.estimated(income, children)
          return (
            <Card key={i} className="border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{b.name}</p>
                      <p className="text-sm font-bold text-emerald-600">~${est.toLocaleString()}/yr</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Max: {b.maxAmount}</p>
                    <p className="text-xs text-muted-foreground mt-1"><strong>Who qualifies:</strong> {b.whoQualifies}</p>
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 mt-2">
                      <p className="text-xs text-emerald-700"><strong>How to get it:</strong> {b.howToGet}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Not eligible */}
      {BENEFITS.filter(b => !eligible.includes(b)).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Not Currently Eligible For</p>
          {BENEFITS.filter(b => !eligible.includes(b)).map((b, i) => (
            <Card key={i} className="opacity-50">
              <CardContent className="p-3 flex items-center gap-3">
                <p className="text-xs text-muted-foreground flex-1">{b.name}</p>
                <p className="text-[10px] text-muted-foreground">{b.requiresChildren ? "Requires children" : b.requiresSenior ? "Age 65+" : b.requiresDisability ? "Requires disability" : `Income under $${(b.incomeThreshold/1000).toFixed(0)}K`}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The #1 rule:</strong> FILE YOUR TAXES every year, even if your income is $0. Most benefits are calculated
            from your tax return. If you don't file, you don't receive CCB, GST credit, CWB, Trillium, or GIS.
            The CRA estimates <strong>millions of dollars in benefits go unclaimed every year</strong> because people
            don't file or don't know these programs exist. This calculator shows estimates — actual amounts
            depend on your complete tax situation. Visit{" "}
            <a href="https://www.canada.ca/en/services/benefits.html" className="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">canada.ca/benefits</a> for official amounts.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada/tax-optimization" className="text-sm text-emerald-600 hover:underline">Tax Optimization</a>
        <a href="/tax-estimator" className="text-sm text-blue-600 hover:underline">Tax Estimator</a>
        <a href="/budget" className="text-sm text-violet-600 hover:underline">Budget Calculator</a>
        <a href="/canada" className="text-sm text-red-600 hover:underline">Canada Report</a>
      </div>
    </div>
  )
}
