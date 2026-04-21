"use client"

import { useState } from "react"
import {
  Radio, Landmark, DollarSign, AlertTriangle, ArrowRight, ChevronDown,
  Globe2, Shield, Smartphone, CreditCard, Home, Wifi
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"
import { AletheiaConnection } from "@/components/AletheiaConnection"

const TELECOM = {
  players: [
    { name: "Rogers", share: "32%", revenue: "$20.3B", owns: "Wireless, Internet, TV (Citytv), Sports (Sportsnet, Blue Jays), Maclean's", note: "Bought Shaw for $26B in 2023, eliminating the 4th national wireless carrier. Family-controlled through dual-class shares." },
    { name: "Bell (BCE)", share: "31%", revenue: "$24.2B", owns: "Wireless, Internet, TV (CTV, CP24), Radio (iHeart), Crave streaming, The Globe and Mail (minority)", note: "Canada's largest telecom AND largest media company. Owns your phone service AND your news. Laid off 9,000 workers (2024) including journalists while reporting $3B+ profit." },
    { name: "Telus", share: "27%", revenue: "$19.8B", owns: "Wireless, Internet, Telus Health, Telus Agriculture, LifeWorks", note: "Also expanding into healthcare data and agriculture tech. The most vertically integrated of the three." },
  ],
  prices: [
    { plan: "Unlimited wireless (25GB)", canada: "$75-$90/mo", australia: "$25-$35 AUD", uk: "£10-£20", france: "€15-€25", note: "Canadians pay 2-4x more than peer countries for the same service." },
    { plan: "Home internet (150 Mbps)", canada: "$80-$100/mo", australia: "$50-$70 AUD", uk: "£25-£35", france: "€20-€30", note: "Canadian internet is among the most expensive in the OECD." },
    { plan: "Basic TV + internet bundle", canada: "$120-$180/mo", australia: "$60-$80 AUD", uk: "£40-£55", france: "€30-€50", note: "Bundling is designed to lock you in. Each component is overpriced." },
  ],
  whyExpensive: [
    "Foreign ownership restrictions prevent international competitors from entering the market. This was meant to protect Canadian companies but instead created a protected oligopoly.",
    "The CRTC (regulator) is staffed by former telecom executives — textbook regulatory capture. The regulator protects the companies it is supposed to regulate.",
    "The Big 3 buy up every potential competitor. Rogers bought Shaw ($26B). Bell bought MTS. Telus absorbed Public Mobile. Competition is systematically eliminated.",
    "Spectrum auctions favor incumbents — the Big 3 spend billions at auction to prevent new entrants from getting the radio frequencies needed to operate.",
    "Canada's population density is similar to Australia's — but Australia has affordable telecom because it allows foreign competition. The density argument is a myth.",
  ],
}

const BANKING = {
  players: [
    { name: "RBC (Royal Bank)", share: "20%", assets: "$2.0T", ceoComp: "$16.4M (2023)", note: "Canada's largest bank. Record profits every year since 2020. CEO compensation increased while mortgage rates doubled." },
    { name: "TD Bank", share: "18%", assets: "$1.9T", ceoComp: "$12.2M (2023)", note: "Major US expansion. Recently fined $3B+ by US regulators for money laundering failures — the largest bank fine in US history." },
    { name: "BMO", share: "14%", assets: "$1.3T", ceoComp: "$10.8M (2023)", note: "Oldest bank in Canada (1817). Expanding aggressively in the US." },
    { name: "Scotiabank", share: "14%", assets: "$1.4T", ceoComp: "$10.6M (2023)", note: "Largest international presence of the Big 5. Major operations in Latin America and Caribbean." },
    { name: "CIBC", share: "10%", assets: "$0.9T", ceoComp: "$9.8M (2023)", note: "Historically the most conservative. Significant mortgage exposure." },
  ],
  facts: [
    "The Big 5 control 85%+ of Canadian banking. This is one of the most concentrated banking sectors in the developed world.",
    "Combined profits in 2023: $56.7 BILLION. While Canadians struggled with mortgage renewals at 5%+ rates, banks posted record earnings from the rate increases.",
    "Average mortgage spread (bank profit margin on your mortgage): 1.8-2.2%. In competitive markets like the Netherlands: 0.5-0.8%. Canadians pay ~$300/month extra per $500K mortgage due to lack of competition.",
    "Bank fees in Canada average $180-$240/year per account. In the UK (with open banking competition): free accounts are the norm.",
    "Open banking was promised in 2018. It is still not implemented in 2026. Open banking would let fintech companies compete with banks — which is exactly why the banks lobby against it.",
    "CEO compensation of the Big 5 totals $60M+ per year. The average bank teller earns $35,000-$40,000.",
  ],
}

const GROCERY = {
  players: [
    { name: "Loblaw (Weston)", share: "30%+", brands: "Loblaws, No Frills, Shoppers Drug Mart, T&T, Valu-Mart, Real Canadian Superstore, Joe Fresh", note: "Largest grocer. Admitted to 14-year bread price-fixing conspiracy (2001-2015). $25 gift card 'apology' per customer. Record profits during 2023 inflation while families struggled." },
    { name: "Sobeys (Empire Co.)", share: "21%", brands: "Sobeys, Safeway, FreshCo, Farm Boy, Foodland, IGA", note: "Quietly raised prices alongside Loblaw. Less public scrutiny but same profit patterns." },
    { name: "Metro", share: "17%", brands: "Metro, Food Basics, Jean Coutu, Super C", note: "Dominant in Ontario and Quebec. Record profits during inflation. Parliamentary committee questioned all three chains." },
  ],
  facts: [
    "3 companies control 68% of Canadian grocery. For comparison, the UK has 7+ major chains with the top 3 at 50%.",
    "Bread price-fixing (2001-2015): Loblaw, Weston, and others coordinated to fix bread prices for 14 years. Your bread was overpriced by $1-2/loaf for over a decade. Total consumer harm: estimated $400M+. Penalty: $25 gift card per customer.",
    "Grocery inflation 2022-2023: food prices rose 10-11% while Loblaw profits rose 23%. The companies blamed 'supply chain costs' while their margins expanded.",
    "Internal pricing practices: suppliers report being squeezed by grocers who demand lower wholesale prices while raising retail prices — pocketing the difference.",
    "Shoppers Drug Mart (Loblaw): one of the most profitable pharmacies in Canada. Controls a significant share of pharmaceutical distribution — a potential conflict when Loblaw also lobbies against pharmacare.",
  ],
}

const SOLUTIONS = [
  { sector: "Telecom", fixes: [
    "Allow foreign competition — the US, UK, Australia, and EU all allow foreign telecom operators. Canada's protectionism creates a tax on every Canadian",
    "MVNO (Mobile Virtual Network Operator) access — force the Big 3 to lease network access to smaller carriers at regulated wholesale rates (as done in EU)",
    "Community broadband — municipalities build their own fiber networks (Olds, AB did this — gigabit internet for $60/month while the Big 3 charge $100+ for slower speeds)",
    "Replace CRTC commissioners with consumer advocates instead of former telecom executives",
  ]},
  { sector: "Banking", fixes: [
    "Implement open banking NOW — let fintech companies access your banking data (with your permission) to offer competing products. The UK did this in 2018 — banking fees dropped, innovation exploded",
    "Allow credit union and cooperative banking expansion — these institutions offer lower fees and better rates but face regulatory disadvantages vs Big 5",
    "Mortgage portability reform — make it easy to switch lenders at renewal without penalty. Currently the stress test makes switching harder, benefiting your existing bank",
    "Digital banking licenses for fintech challengers — make it possible for new digital-only banks to compete",
  ]},
  { sector: "Grocery", fixes: [
    "Competition Bureau enforcement with real teeth — current fines are rounding errors on billion-dollar profits",
    "Break up Loblaw's combined grocery/pharmacy/clothing empire if competition doesn't improve within 3 years",
    "Support local alternatives — farmers markets, co-op grocery stores, community-supported agriculture",
    "Grocery price transparency legislation — require public disclosure of wholesale vs retail pricing to identify unjustified markups",
    "Allow international grocery chains to compete (Aldi, Lidl operate in the US but not Canada due to regulatory barriers)",
  ]},
]

export default function CanadaOligopoliesPage() {
  const [section, setSection] = useState<"telecom" | "banking" | "grocery" | "solutions">("telecom")

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-amber-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada's Protected Oligopolies</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Three industries that control what you pay for phone, internet, banking, and food — and why competition is blocked.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">The <Explain tip="An oligopoly is when a small number of companies dominate an industry so completely that they can set prices without real competition. They don't need to collude — they just watch each other and match prices. The result is the same as a monopoly but harder to prosecute">Oligopoly</Explain> Tax on Every Canadian</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The average Canadian family pays an estimated <strong>$3,000-$5,000/year more</strong> than they would in a competitive market
            for telecom, banking, and groceries alone. That is not because these services cost more to deliver in Canada —
            it is because 3-5 companies control each sector and face no real competition. This is a hidden tax that no
            politician voted on and no ballot included. Follow the lobbying money on{" "}
            <a href="https://aletheia-truth.vercel.app" className="text-violet-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">Aletheia</a>.
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {[
          { key: "telecom", label: "Telecom", icon: Smartphone },
          { key: "banking", label: "Banking", icon: Landmark },
          { key: "grocery", label: "Grocery", icon: DollarSign },
          { key: "solutions", label: "Solutions", icon: Shield },
        ].map(t => (
          <button key={t.key} onClick={() => setSection(t.key as any)}
            className={cn("px-3 py-2 text-xs font-medium border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap",
              section === t.key ? "border-red-500 text-red-700" : "border-transparent text-muted-foreground"
            )}><t.icon className="h-3.5 w-3.5" /> {t.label}</button>
        ))}
      </div>

      {section === "telecom" && (
        <div className="space-y-4">
          <div className="space-y-2">
            {TELECOM.players.map((p, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[9px]">{p.share} market</Badge>
                      <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-300">{p.revenue}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1"><strong>Owns:</strong> {p.owns}</p>
                  <p className="text-[10px] text-amber-700">{p.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">What Canadians Pay vs The World</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {TELECOM.prices.map((p, i) => (
                <div key={i} className="rounded-lg border border-border p-2.5">
                  <p className="text-sm font-medium mb-1">{p.plan}</p>
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    <div><span className="text-red-500 font-bold">{p.canada}</span><br/>Canada</div>
                    <div><span className="text-emerald-600">{p.australia}</span><br/>Australia</div>
                    <div><span className="text-emerald-600">{p.uk}</span><br/>UK</div>
                    <div><span className="text-emerald-600">{p.france}</span><br/>France</div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{p.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-amber-200">
            <CardHeader className="pb-2"><CardTitle className="text-base">Why It Stays Expensive</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {TELECOM.whyExpensive.map((w, i) => (
                <p key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                  <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" /><span>{w}</span>
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {section === "banking" && (
        <div className="space-y-4">
          <div className="space-y-2">
            {BANKING.players.map((b, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold">{b.name}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[9px]">{b.share} market</Badge>
                      <Badge variant="outline" className="text-[9px]">{b.assets} assets</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">CEO compensation: <strong className="text-red-500">{b.ceoComp}</strong></p>
                  <p className="text-[10px] text-muted-foreground">{b.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-amber-200">
            <CardContent className="p-4 space-y-2">
              {BANKING.facts.map((f, i) => (
                <p key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                  <DollarSign className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" /><span>{f}</span>
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {section === "grocery" && (
        <div className="space-y-4">
          <div className="space-y-2">
            {GROCERY.players.map((g, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold">{g.name}</p>
                    <Badge variant="outline" className="text-[9px] text-red-500 border-red-300">{g.share} market</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1"><strong>Brands:</strong> {g.brands}</p>
                  <p className="text-[10px] text-amber-700">{g.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-red-200">
            <CardContent className="p-4 space-y-2">
              {GROCERY.facts.map((f, i) => (
                <p key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" /><span>{f}</span>
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {section === "solutions" && (
        <div className="space-y-4">
          {SOLUTIONS.map((s, i) => (
            <Card key={i} className="border-emerald-200">
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-2">{s.sector}</p>
                <ul className="space-y-1.5">
                  {s.fixes.map((f, j) => (
                    <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /><span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> CRTC Communications Monitoring Report, OECD Broadband Portal, Competition Bureau,
            Canadian Bankers Association, OSFI, StatsCan, Parliamentary Standing Committee on Agriculture (grocery study),
            Wall Centre for International Securities (telecom pricing comparison). Lobbying data on{" "}
            <a href="https://aletheia-truth.vercel.app" className="text-violet-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">Aletheia</a>.
          </p>
        </CardContent>
      </Card>

      <AletheiaConnection topic="oligopolies" />

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/spending" className="text-sm text-amber-600 hover:underline">Government Spending</a>
        <a href="/canada/root-causes" className="text-sm text-violet-600 hover:underline">Root Causes</a>
        <a href="/media-ownership" className="text-sm text-blue-600 hover:underline">Media Ownership</a>
      </div>
    </div>
  )
}
