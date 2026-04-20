"use client"

import { useState } from "react"
import { Droplets, Shield, AlertTriangle, ArrowRight, ChevronDown, Globe2, DollarSign, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const WATER_FACTS = [
  { stat: "Fresh water held by Canada", value: "20% of world total", note: "More freshwater than any other nation. 7% of the world's RENEWABLE freshwater." },
  { stat: "Great Lakes (shared with US)", value: "21% of world surface freshwater", note: "Lakes Superior, Michigan, Huron, Erie, Ontario — contain more fresh water than any other surface system on Earth." },
  { stat: "Rivers", value: "8,500+ named rivers", note: "Including the Mackenzie (2nd longest in North America), St. Lawrence, Fraser, Nelson, Churchill." },
  { stat: "Lakes", value: "2 million+ lakes", note: "More lakes than all other countries combined. 60% of the world's lakes are in Canada." },
  { stat: "Glaciers", value: "~26,000", note: "Massive freshwater reserves — but melting at accelerating rates due to climate change." },
  { stat: "Per capita freshwater", value: "80,000+ cubic metres/person", note: "Among the highest in the world. For comparison: China has 2,000 cubic metres/person." },
]

const THREATS = [
  {
    threat: "Bulk Water Export",
    severity: "HIGH",
    details: "NAFTA/CUSMA treats water as a commodity if it enters commerce. Once Canada starts exporting bulk water, trade agreements may make it impossible to stop. The US Southwest (California, Arizona, Nevada) faces severe water shortages — pressure to tap Canadian water will intensify as climate change worsens. There is NO comprehensive federal law prohibiting bulk water exports.",
    solution: "Constitutional amendment declaring water a public trust (not a commodity). Federal Bulk Water Prohibition Act with trade agreement carve-outs. This must happen BEFORE any bulk export begins — once the tap is open, trade law makes it nearly impossible to close.",
  },
  {
    threat: "Indigenous Boil Water Advisories",
    severity: "CRITICAL",
    details: "30+ First Nations communities are under long-term drinking water advisories. Some have been under advisory for 20+ YEARS. In a country with 20% of the world's freshwater, Indigenous children cannot drink from their taps. The federal government promised to end all advisories by 2021 — it failed. The cost to fix every single one: $3-5 billion. Canada spent $34 billion on one pipeline.",
    solution: "Emergency infrastructure fund: $5B over 3 years to end ALL advisories permanently. Not just capital (building treatment plants) but operational funding (training local operators, maintaining systems long-term). Community ownership of water systems.",
  },
  {
    threat: "Agricultural Contamination",
    severity: "MEDIUM",
    details: "Farm runoff (fertilizers, pesticides, animal waste) contaminates rivers, lakes, and groundwater. Lake Erie algae blooms (toxic) are caused primarily by agricultural runoff from Ontario and Ohio. Lake Winnipeg faces similar problems. Nitrate contamination of groundwater in agricultural areas of the Prairies, Ontario, and Quebec is worsening.",
    solution: "Buffer zones around waterways (mandatory setbacks for farming). Precision agriculture (apply fertilizer only where needed, not broadcast). Regulate concentrated animal feeding operations (CAFOs). The technology exists — the enforcement does not.",
  },
  {
    threat: "Climate Change — Glacial Melt",
    severity: "HIGH",
    details: "Canada's 26,000 glaciers are retreating. The Columbia Icefield (feeding the Saskatchewan, Athabasca, and Columbia rivers) has lost 22% of its volume since 1979. In the short term: more water (meltwater). In the long term: less water as glaciers disappear. The prairies' agricultural water supply depends on glacial melt in summer.",
    solution: "Water storage infrastructure (reservoirs, aquifer recharge) to capture meltwater while it flows. Water efficiency in agriculture (switch from flood to drip irrigation — saves 30-50%). Long-term: diversify prairie water sources away from glacial dependence.",
  },
  {
    threat: "Great Lakes Degradation",
    severity: "MEDIUM",
    details: "The Great Lakes are shared with the US (governed by the Boundary Waters Treaty of 1909 and IJC). Threats: industrial pollution (legacy contamination from decades of manufacturing), microplastics, invasive species (zebra mussels, Asian carp), and water level fluctuations from climate change. Lake Erie is the most polluted — toxic algae blooms close beaches annually.",
    solution: "Strengthen the Great Lakes Water Quality Agreement. Invest in binational cleanup. Block Asian carp from entering Great Lakes (Chicago Sanitary and Ship Canal is the weak point). Microplastic filtration at wastewater treatment plants. The Great Lakes are irreplaceable — treat them as a national security asset.",
  },
  {
    threat: "Aging Municipal Water Infrastructure",
    severity: "HIGH",
    details: "Municipal water systems in Montreal, Toronto, Winnipeg, and other cities are 80-100+ years old. Montreal's water mains break 1,200+ times per year. Lead service lines still exist in multiple cities. Canada loses 13-30% of treated water to leaks before it reaches taps — that is billions of liters of treated, clean water wasted daily.",
    solution: "National water infrastructure fund ($10B/year for 10 years). Replace all lead service lines within 10 years. Smart water monitoring (sensors that detect leaks in real-time). The cost of NOT doing this: water main catastrophic failures, lead poisoning, and increasingly expensive emergency repairs.",
  },
]

const WATER_VALUE = [
  "By 2030, two-thirds of the world's population may face water shortages (UN). Canada will hold 20% of the solution.",
  "Water-intensive industries (semiconductors, agriculture, data centres) are moving toward water-secure regions. Canada could attract massive industrial investment purely based on water abundance.",
  "California's agricultural output ($50B/year) depends on water that is running out. Canada's agricultural potential with abundant water is barely tapped.",
  "A single acre-foot of water (enough for 2 families for a year) is worth $1,000-$5,000 in water-scarce regions. Canada has billions of acre-feet.",
  "Water wars are not science fiction. India/Pakistan, Israel/Palestine, Egypt/Ethiopia — conflicts over water are escalating globally. Canada's water security is a strategic military advantage.",
]

export default function CanadaWaterPage() {
  const [expandedThreat, setExpandedThreat] = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada's Water Security</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          20% of the world's freshwater. The most valuable resource of the 21st century. And Canada barely protects it.
        </p>
      </div>

      <Card className="border-2 border-blue-200 bg-blue-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-blue-900 mb-2">The Strategic Asset Nobody Talks About</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Oil runs out. Minerals deplete. But freshwater is <strong>renewable</strong> — it cycles through rain, rivers,
            and aquifers forever. As climate change creates droughts across the US Southwest, Asia, the Middle East,
            and Africa, Canadian freshwater becomes the most strategically valuable resource on Earth. More valuable
            than oil. More valuable than rare earth minerals. And Canada has more of it than any nation.
          </p>
        </CardContent>
      </Card>

      {/* Facts */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Canada's Water by the Numbers</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {WATER_FACTS.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
              <Droplets className="h-4 w-4 text-blue-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{f.stat}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-blue-600">{f.value}</p>
                <p className="text-[10px] text-muted-foreground max-w-40">{f.note}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Threats */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" /> 6 Threats to Canadian Water
        </h2>
        <div className="space-y-3">
          {THREATS.map((t, i) => {
            const isOpen = expandedThreat === i
            return (
              <Card key={i} className={cn("card-hover cursor-pointer",
                t.severity === "CRITICAL" ? "border-red-200" : t.severity === "HIGH" ? "border-amber-200" : "border-border"
              )} onClick={() => setExpandedThreat(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={cn("h-4 w-4 shrink-0",
                      t.severity === "CRITICAL" ? "text-red-500" : t.severity === "HIGH" ? "text-amber-500" : "text-blue-500"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t.threat}</p>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px]",
                      t.severity === "CRITICAL" ? "text-red-500 border-red-300" :
                      t.severity === "HIGH" ? "text-amber-600 border-amber-300" : "text-blue-600 border-blue-300"
                    )}>{t.severity}</Badge>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-7">
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.details}</p>
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                        <p className="text-xs text-emerald-700"><strong>Solution:</strong> {t.solution}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Strategic value */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-blue-500" /> Why Water Is Canada's Greatest Strategic Asset
        </CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {WATER_VALUE.map((v, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
              <ArrowRight className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" /><span>{v}</span>
            </p>
          ))}
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200 bg-blue-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-blue-900 mb-2">The 1,000-Year Water Policy</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Water is the one resource that MUST be protected with 1,000-year thinking. A constitutional amendment
            declaring Canadian freshwater a public trust — not a tradeable commodity — is the most important single
            piece of legislation Canada could pass. This is the equivalent of the Netherlands' Delta Works:
            a permanent, generational commitment to protecting the asset that makes Canada uniquely valuable in a
            water-scarce world. Every other policy debate is secondary to securing the resource that all life depends on.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/energy" className="text-sm text-amber-600 hover:underline">Energy Deep Dive</a>
        <a href="/canada/infrastructure" className="text-sm text-slate-600 hover:underline">Infrastructure</a>
        <a href="/canada/trajectories" className="text-sm text-emerald-600 hover:underline">Trajectories</a>
      </div>
    </div>
  )
}
