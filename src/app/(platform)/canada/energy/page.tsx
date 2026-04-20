"use client"

import { useState } from "react"
import {
  Zap, Droplets, Sun, Wind, Fuel, AlertTriangle, ArrowRight,
  ChevronDown, Globe2, DollarSign, Factory
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const PROVINCIAL_MIX = [
  { province: "Quebec", hydro: 95, nuclear: 0, gas: 2, wind: 3, solar: 0, coal: 0, price: "$0.073/kWh", note: "Cheapest electricity in North America. Almost entirely hydro. Massive export potential." },
  { province: "British Columbia", hydro: 87, nuclear: 0, gas: 9, wind: 1, solar: 0, coal: 0, price: "$0.094/kWh", note: "Clean grid. Site C dam adding 1,100 MW. Some natural gas generation." },
  { province: "Manitoba", hydro: 97, nuclear: 0, gas: 2, wind: 1, solar: 0, coal: 0, price: "$0.089/kWh", note: "Nearly 100% hydro. Exports to US (Minnesota). Churchill Falls of the Prairies." },
  { province: "Ontario", hydro: 24, nuclear: 58, gas: 10, wind: 7, solar: 1, coal: 0, price: "$0.130/kWh", note: "Nuclear-dominant since coal phase-out (2014). Refurbishing Darlington and Bruce reactors. Pursuing SMRs." },
  { province: "Alberta", hydro: 3, nuclear: 0, gas: 64, wind: 18, solar: 5, coal: 10, price: "$0.165/kWh", note: "Gas-dominant. Wind/solar growing rapidly (best solar conditions in Canada). Coal almost gone." },
  { province: "Saskatchewan", hydro: 12, nuclear: 0, gas: 45, wind: 8, solar: 2, coal: 33, price: "$0.172/kWh", note: "Still 33% coal — last major coal user. Pursuing SMR nuclear. Has the uranium to fuel it." },
  { province: "New Brunswick", hydro: 20, nuclear: 35, gas: 20, wind: 5, solar: 0, coal: 10, price: "$0.127/kWh", note: "Point Lepreau nuclear plant. Irving Oil refinery powers some generation. Pursuing SMR at Point Lepreau." },
  { province: "Nova Scotia", hydro: 10, nuclear: 0, gas: 25, wind: 15, solar: 1, coal: 40, price: "$0.175/kWh", note: "MOST EXPENSIVE + DIRTIEST grid in Canada. 40% coal. Tidal energy potential (Bay of Fundy) untapped." },
]

const OIL_STORY = [
  {
    title: "Canada Has the 3rd Largest Oil Reserves on Earth",
    details: [
      "168 billion barrels of proven reserves (after Venezuela and Saudi Arabia)",
      "97% of this is in the oil sands of northern Alberta",
      "At current production (~4.9M barrels/day), reserves last 90+ years",
      "Canada is the 4th largest oil producer globally and the largest supplier to the US",
    ],
  },
  {
    title: "The Absurd Reality: Export Crude, Import Gasoline",
    details: [
      "Canada exports 3.8M barrels/day of crude oil — almost all to the US (Gulf Coast refineries)",
      "Atlantic Canada (NB, NS, NL) imports oil from Saudi Arabia, Nigeria, and the US because there is NO pipeline from Alberta to the East Coast",
      "Energy East pipeline was proposed to fix this — cancelled in 2017 after political opposition from Quebec",
      "The Irving refinery in Saint John, NB processes imported oil — not Canadian oil. One family profits from importing foreign oil while Canadian oil sits in Alberta",
      "Canada exports crude at a DISCOUNT ($10-20/barrel below world price due to pipeline constraints) and imports refined products at a PREMIUM",
    ],
  },
  {
    title: "The Refining Gap",
    details: [
      "Canada has 14 refineries (down from 40+ in the 1970s). Refining capacity: ~2M barrels/day. Production: ~4.9M barrels/day",
      "The difference is exported as crude — the lowest-value product. Refining adds $20-40/barrel in value that goes to US refineries instead of Canadian workers",
      "If Canada refined ALL its oil domestically, it would add $30-50B/year in GDP and 50,000+ jobs",
      "Why it doesn't happen: cheaper to pipe crude to existing US Gulf Coast refineries than to build new refineries in Canada. But 'cheaper' ignores sovereignty, jobs, and strategic vulnerability",
    ],
  },
  {
    title: "The Pipeline Problem",
    details: [
      "Trans Mountain Expansion: government bought it for $4.5B (2018), final cost ~$34B (2024). 7.5x over budget. Now publicly owned",
      "Energy East: cancelled. Would have sent Alberta oil to Atlantic Canada. Quebec opposed it for environmental reasons — while continuing to import Saudi oil by tanker",
      "Keystone XL: cancelled by Biden (2021). Would have increased Canada-US pipeline capacity",
      "Northern Gateway: cancelled. Would have sent oil to BC coast for Asian export",
      "Result: Canada has ONE major new pipeline (Trans Mountain) after 15 years of debate and $34B in taxpayer cost. Every other route was blocked",
    ],
  },
]

const NUCLEAR_OPPORTUNITY = [
  { point: "CANDU reactors are Canadian-designed and exported globally (India, China, South Korea, Argentina, Romania)", icon: Globe2 },
  { point: "Ontario gets 58% of electricity from nuclear — the largest nuclear fleet in Canada. Reliable, clean, 24/7 baseload power", icon: Zap },
  { point: "SMRs (Small Modular Reactors) are the next frontier. Ontario, New Brunswick, and Saskatchewan are all pursuing them. Canadian companies (GE Hitachi BWRX-300, Terrestrial Energy) are designing them", icon: Factory },
  { point: "Saskatchewan has the world's richest uranium deposits. Mining the fuel AND building the reactors = complete domestic nuclear supply chain", icon: DollarSign },
  { point: "Nuclear produces zero carbon emissions during operation. 1 uranium pellet = energy equivalent of 400 kg of coal. The most energy-dense fuel known to humanity", icon: Zap },
  { point: "Public perception is the biggest barrier. Nuclear has the lowest death rate per kWh of ANY energy source — including wind and solar (due to construction accidents). Fukushima and Chernobyl dominate perception despite being outliers in 70 years of nuclear power", icon: AlertTriangle },
]

const CLEAN_ENERGY_POTENTIAL = [
  { source: "Hydroelectric", potential: "Quebec, BC, Manitoba, Labrador — untapped potential could double current output. Churchill Falls contract expires 2041 — Newfoundland gains control of massive clean energy", current: "60% of Canadian electricity", barrier: "Environmental impact of new dams. Indigenous land rights. Long construction timelines (10-15 years)." },
  { source: "Wind", potential: "Prairie provinces (AB, SK) and Atlantic coast (NS, NL) have world-class wind resources. Alberta's wind capacity has quadrupled in 5 years.", current: "~7% of Canadian electricity", barrier: "Intermittency (wind doesn't always blow). Grid storage needed. Transmission lines from windy prairies to urban demand centres." },
  { source: "Solar", potential: "Southern Alberta has solar irradiance comparable to southern Spain. Ontario and Saskatchewan also viable.", current: "~1% of Canadian electricity", barrier: "Seasonal variability (Canada gets much less sun in winter when demand is highest). Cold doesn't reduce efficiency — short days do." },
  { source: "Tidal", potential: "Bay of Fundy has the highest tides in the world (16m). Estimated 2,500 MW potential = enough to power all of New Brunswick.", current: "<0.1%", barrier: "Technology still maturing. Harsh marine environment. High upfront cost. But the fuel (tides) is free and infinite." },
  { source: "Nuclear (SMRs)", potential: "Can be deployed anywhere. 300 MW per unit. Factory-built, site-assembled. Perfect for remote communities and industrial sites.", current: "15% (existing reactors)", barrier: "Regulatory approval timeline (5-10 years). Public perception. Waste storage (politically difficult but technically solved — deep geological repository)." },
]

export default function CanadaEnergyPage() {
  const [section, setSection] = useState<"mix" | "oil" | "nuclear" | "clean">("mix")

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-red-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada Energy Deep Dive</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Province-by-province energy mix, the oil export absurdity, nuclear opportunity, and the clean energy future.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">The Paradox</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada is an energy <strong>superpower</strong> — 3rd largest oil reserves, 2nd largest hydroelectric producer,
            2nd largest uranium producer, massive wind and solar potential. Yet <strong>Atlantic Canada imports Saudi oil</strong>,
            <strong> Saskatchewan burns coal</strong>, <strong>Nova Scotia has the most expensive electricity in the country</strong>,
            and Canada exports crude at a discount while importing refined products at a premium.
            The issue is not resources — it is policy, infrastructure, and political will.
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {[
          { key: "mix", label: "Provincial Mix" },
          { key: "oil", label: "Oil & Gas" },
          { key: "nuclear", label: "Nuclear" },
          { key: "clean", label: "Clean Energy" },
        ].map(t => (
          <button key={t.key} onClick={() => setSection(t.key as any)}
            className={cn("px-3 py-2 text-xs font-medium border-b-2 -mb-px whitespace-nowrap",
              section === t.key ? "border-amber-500 text-amber-700" : "border-transparent text-muted-foreground"
            )}>{t.label}</button>
        ))}
      </div>

      {section === "mix" && (
        <div className="space-y-2">
          {PROVINCIAL_MIX.map((p, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{p.province}</span>
                  <span className="text-xs font-bold">{p.price}</span>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden mb-1">
                  {p.hydro > 0 && <div className="bg-blue-400 h-full" style={{ width: `${p.hydro}%` }} title={`Hydro: ${p.hydro}%`} />}
                  {p.nuclear > 0 && <div className="bg-violet-400 h-full" style={{ width: `${p.nuclear}%` }} title={`Nuclear: ${p.nuclear}%`} />}
                  {p.wind > 0 && <div className="bg-cyan-400 h-full" style={{ width: `${p.wind}%` }} title={`Wind: ${p.wind}%`} />}
                  {p.solar > 0 && <div className="bg-amber-400 h-full" style={{ width: `${p.solar}%` }} title={`Solar: ${p.solar}%`} />}
                  {p.gas > 0 && <div className="bg-orange-400 h-full" style={{ width: `${p.gas}%` }} title={`Gas: ${p.gas}%`} />}
                  {p.coal > 0 && <div className="bg-slate-500 h-full" style={{ width: `${p.coal}%` }} title={`Coal: ${p.coal}%`} />}
                </div>
                <div className="flex gap-2 text-[9px] text-muted-foreground flex-wrap">
                  {p.hydro > 0 && <span className="flex items-center gap-0.5"><div className="h-2 w-2 rounded-full bg-blue-400" />Hydro {p.hydro}%</span>}
                  {p.nuclear > 0 && <span className="flex items-center gap-0.5"><div className="h-2 w-2 rounded-full bg-violet-400" />Nuclear {p.nuclear}%</span>}
                  {p.wind > 0 && <span className="flex items-center gap-0.5"><div className="h-2 w-2 rounded-full bg-cyan-400" />Wind {p.wind}%</span>}
                  {p.gas > 0 && <span className="flex items-center gap-0.5"><div className="h-2 w-2 rounded-full bg-orange-400" />Gas {p.gas}%</span>}
                  {p.coal > 0 && <span className="flex items-center gap-0.5"><div className="h-2 w-2 rounded-full bg-slate-500" />Coal {p.coal}%</span>}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{p.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {section === "oil" && (
        <div className="space-y-4">
          {OIL_STORY.map((s, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-2">{s.title}</p>
                <ul className="space-y-1">
                  {s.details.map((d, j) => (
                    <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <ArrowRight className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" /><span>{d}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {section === "nuclear" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Canada designed its own nuclear reactor technology (CANDU) and has the fuel to power it. Nuclear is the most reliable, cleanest baseload energy source — and Canada is uniquely positioned to lead.</p>
          {NUCLEAR_OPPORTUNITY.map((n, i) => {
            const Icon = n.icon
            return (
              <Card key={i}>
                <CardContent className="p-3 flex items-start gap-3">
                  <Icon className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.point}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {section === "clean" && (
        <div className="space-y-3">
          {CLEAN_ENERGY_POTENTIAL.map((c, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{c.source}</p>
                  <Badge variant="outline" className="text-[9px]">Current: {c.current}</Badge>
                </div>
                <p className="text-xs text-emerald-700 mb-1"><strong>Potential:</strong> {c.potential}</p>
                <p className="text-xs text-amber-700"><strong>Barrier:</strong> {c.barrier}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">The Vision</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada could be the cleanest energy superpower on Earth: Quebec/BC/Manitoba hydro for baseload,
            Ontario nuclear (CANDU + SMRs), Prairie wind + solar, Atlantic tidal, Saskatchewan uranium fueling
            reactors nationally. Connected by an east-west energy grid so no province burns foreign oil or coal.
            Refining Canadian oil for Canadian use. Exporting PROCESSED energy products (refined fuel, electricity,
            hydrogen, batteries) instead of raw crude. Every piece of this exists today — it just needs to be connected.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/infrastructure" className="text-sm text-slate-600 hover:underline">Infrastructure</a>
        <a href="/canada/blueprint" className="text-sm text-emerald-600 hover:underline">Blueprint</a>
        <a href="/energy" className="text-sm text-amber-600 hover:underline">Energy Module</a>
      </div>
    </div>
  )
}
