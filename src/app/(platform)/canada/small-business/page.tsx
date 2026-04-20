"use client"

import { useState } from "react"
import { Briefcase, DollarSign, Clock, AlertTriangle, ArrowRight, ChevronDown, Globe2, Scale } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const PROVINCIAL_BUSINESS = [
  { province: "Alberta", corpTax: "8%", smallBizTax: "2%", pst: "None", incorpCost: "$275", incorpTime: "1-2 days", minWage: "$15.00", rating: "A", note: "No PST, lowest small business tax, fast incorporation. Alberta is the easiest province to start and run a business." },
  { province: "Ontario", corpTax: "11.5%", smallBizTax: "3.2%", pst: "13% HST", incorpCost: "$300", incorpTime: "1-3 days", minWage: "$17.20", rating: "B", note: "Largest market (15.8M people) but higher costs, complex regulations. Good for tech and professional services." },
  { province: "British Columbia", corpTax: "12%", smallBizTax: "2%", pst: "5%+7% PST", incorpCost: "$350", incorpTime: "2-5 days", minWage: "$17.40", rating: "B", note: "High cost of living makes hiring expensive. Great for tech, film, tourism." },
  { province: "Quebec", corpTax: "11.5%", smallBizTax: "3.2%", pst: "9.975% QST", incorpCost: "$367", incorpTime: "3-7 days", minWage: "$15.75", rating: "C+", note: "Highest combined sales tax. Language laws (Bill 96) add compliance costs. But: cheapest energy in North America + strong AI/aerospace ecosystem." },
  { province: "Saskatchewan", corpTax: "12%", smallBizTax: "1%", pst: "6% PST", incorpCost: "$265", incorpTime: "1-2 days", minWage: "$15.00", rating: "A-", note: "LOWEST small business tax in Canada (1%). Low cost of living. Small market but low competition." },
  { province: "Manitoba", corpTax: "12%", smallBizTax: "0%", pst: "7% RST", incorpCost: "$300", incorpTime: "2-3 days", minWage: "$15.80", rating: "B+", note: "ZERO small business tax (first $500K). Affordable. Diverse economy." },
  { province: "New Brunswick", corpTax: "14%", smallBizTax: "2.5%", pst: "15% HST", incorpCost: "$262", incorpTime: "1-2 days", minWage: "$15.30", rating: "B-", note: "Bilingual workforce is an advantage for national/international business. High HST though." },
  { province: "Nova Scotia", corpTax: "14%", smallBizTax: "2.5%", pst: "15% HST", incorpCost: "$429", incorpTime: "2-5 days", minWage: "$15.20", rating: "C+", note: "Highest incorporation cost. High HST. But: growing tech sector in Halifax + ocean economy." },
]

const BARRIERS = [
  {
    barrier: "Interprovincial Trade Barriers",
    cost: "$100B+/year in lost economic activity (IMF estimate)",
    explanation: "It is easier to trade with the US than between Canadian provinces. A plumber licensed in Ontario cannot work in Quebec. A beer brewed in New Brunswick cannot be sold in Alberta without going through provincial liquor boards. A trucking company needs different permits for each province. Canada has internal trade barriers that would be illegal under WTO rules if they were between countries.",
    fix: "Mutual recognition of professional licenses nationally. Single business registration that works in all provinces. Harmonize product standards. The Canadian Free Trade Agreement (CFTA) exists but has no enforcement mechanism — give it teeth.",
  },
  {
    barrier: "Red Tape & Regulatory Burden",
    cost: "Small businesses spend ~$7,500/year on regulatory compliance (CFIB)",
    explanation: "Opening a restaurant requires permits from health (municipal), liquor (provincial), fire (municipal), building (municipal), business license (municipal), food handling (provincial), accessibility (provincial), and sometimes federal (if serving alcohol on a patio near a heritage building). A single small business may interact with 10+ regulatory bodies. Each has its own forms, timelines, and fees.",
    fix: "One-window business registration: single application, distributed to all relevant agencies. Regulatory sandbox for new businesses (12-month grace period to comply while getting started). Annual regulatory audit: for every new regulation added, remove two.",
  },
  {
    barrier: "Access to Capital",
    cost: "48% of small businesses cite capital access as top challenge (BDC)",
    explanation: "Big 5 banks prefer large, established businesses. Small businesses — especially new ones — often cannot get traditional bank loans. Venture capital in Canada is 1/10th of US levels per capita. The risk appetite for funding early-stage companies barely exists outside of Toronto and Vancouver.",
    fix: "Expand BDC (Business Development Bank) mandate. Tax incentives for angel investors (like the UK SEIS — 50% tax relief for investing in startups). Reduce capital gains tax on small business investments. Community development financial institutions (CDFIs) in underserved areas.",
  },
  {
    barrier: "Brain Drain to the US",
    cost: "~$20B/year in lost economic potential (Conference Board estimate)",
    explanation: "Canadian-trained tech workers, doctors, engineers, and entrepreneurs move to the US for higher salaries (50-100% higher in many fields), lower taxes, warmer weather, and a larger market. Canada invests in educating talent, then loses them. The US has a gravity pull that no policy fully overcomes.",
    fix: "Competitive tax rates for high-income earners (or at minimum, reduce the gap). Stock option taxation reform (Canada taxes options less favorably than the US). Entrepreneur visa fast-track. Build world-class industry clusters so talent has a reason to stay (already happening in AI in Montreal/Toronto).",
  },
  {
    barrier: "Oligopoly Squeeze",
    cost: "Small businesses pay 2-4x more for telecom, banking, and payment processing than in competitive markets",
    explanation: "A small business in Canada pays $200-$400/month for internet and phone (vs $50-$100 in the UK). Credit card processing fees: 2.5-3.5% (vs 0.3% in the EU due to regulation). Bank fees for business accounts: $30-$60/month (vs $0-$10 in the UK with open banking). The oligopoly tax hits small businesses hardest.",
    fix: "See the oligopolies page. Allow foreign telecom competition. Implement open banking. Cap interchange fees (as the EU did — reduced by 80%). These changes would save small businesses $5,000-$15,000/year each.",
  },
]

const STARTUP_COSTS = [
  { item: "Federal incorporation", cost: "$200 (online)", note: "corporations.ic.gc.ca — can be done in 1 day" },
  { item: "Provincial registration", cost: "$0-$429 (varies)", note: "Required after federal incorporation" },
  { item: "Business bank account", cost: "$0-$60/month", note: "Big 5 charge $30-60/mo. Credit unions: often free." },
  { item: "Business insurance", cost: "$50-$300/month", note: "Liability insurance. Essential. Cost depends on industry." },
  { item: "GST/HST registration", cost: "Free (mandatory over $30K revenue)", note: "Register at CRA. Allows you to claim input tax credits." },
  { item: "Domain + website", cost: "$10-$50/year domain + $0-$30/mo hosting", note: "Squarespace, Shopify, or WordPress. Start simple." },
  { item: "Accounting software", cost: "$0-$30/month", note: "Wave (free), FreshBooks ($15/mo), QuickBooks ($25/mo)" },
  { item: "First year realistic total", cost: "$2,000-$5,000", note: "Not including inventory/equipment. The barrier to starting is lower than most people think." },
]

export default function CanadaSmallBusinessPage() {
  const [expandedBarrier, setExpandedBarrier] = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-amber-600">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Starting a Business in Canada</h1>
        </div>
        <p className="text-sm text-muted-foreground">Province-by-province comparison, real startup costs, and the barriers that hold small business back.</p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada ranks <strong>3rd globally</strong> for ease of starting a business (World Bank). But starting is the easy part — <strong>scaling is where Canada fails</strong>.
            Interprovincial trade barriers, oligopoly costs, brain drain, and regulatory burden make it harder to GROW a business in Canada than in most peer countries.
            98% of Canadian businesses are small businesses. They employ 70% of the private workforce. Making it easier for them is the highest-ROI economic policy possible.
          </p>
        </CardContent>
      </Card>

      {/* Provincial comparison */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Province-by-Province Business Environment</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {PROVINCIAL_BUSINESS.map((p, i) => (
            <div key={i} className={cn("rounded-lg border p-2.5",
              p.rating.startsWith("A") ? "border-emerald-200" : p.rating.startsWith("C") ? "border-amber-200" : "border-border"
            )}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{p.province}</span>
                <Badge variant="outline" className={cn("text-xs",
                  p.rating.startsWith("A") ? "text-emerald-600 border-emerald-300" :
                  p.rating.startsWith("C") ? "text-amber-600 border-amber-300" : "text-blue-600 border-blue-300"
                )}>{p.rating}</Badge>
              </div>
              <div className="grid grid-cols-5 gap-1 text-[10px] text-muted-foreground mb-1">
                <span>Corp: <strong>{p.corpTax}</strong></span>
                <span>Small: <strong>{p.smallBizTax}</strong></span>
                <span>Sales: <strong>{p.pst}</strong></span>
                <span>Incorp: <strong>{p.incorpCost}</strong></span>
                <span>Min wage: <strong>{p.minWage}</strong></span>
              </div>
              <p className="text-[10px] text-muted-foreground">{p.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Startup costs */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Real Cost to Start a Business</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {STARTUP_COSTS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground w-40 shrink-0">{s.item}</span>
              <span className="font-bold w-32 shrink-0">{s.cost}</span>
              <span className="text-[10px] text-muted-foreground">{s.note}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Barriers */}
      <div>
        <h2 className="text-lg font-bold mb-3">5 Barriers Holding Small Business Back</h2>
        <div className="space-y-3">
          {BARRIERS.map((b, i) => {
            const isOpen = expandedBarrier === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedBarrier(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{b.barrier}</p>
                      <p className="text-[10px] text-red-500">{b.cost}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-7">
                      <p className="text-xs text-muted-foreground leading-relaxed">{b.explanation}</p>
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                        <p className="text-xs text-emerald-700"><strong>Fix:</strong> {b.fix}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> World Bank Doing Business rankings, CRA corporate tax rates, CFIB (Canadian Federation
            of Independent Business) surveys, BDC Small Business Week data, provincial incorporation registries,
            IMF Canada economic assessment. Use the <a href="/side-hustles" className="text-violet-600 hover:underline">Side Hustle Finder</a> for
            business ideas and the <a href="/canada/tax-optimization" className="text-violet-600 hover:underline">Tax Optimization guide</a> to structure your business tax-efficiently.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/oligopolies" className="text-sm text-amber-600 hover:underline">Oligopolies</a>
        <a href="/side-hustles" className="text-sm text-emerald-600 hover:underline">Side Hustles</a>
        <a href="/canada/tax-optimization" className="text-sm text-blue-600 hover:underline">Tax Optimization</a>
      </div>
    </div>
  )
}
