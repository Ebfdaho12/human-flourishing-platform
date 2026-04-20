"use client"

import { useState } from "react"
import { Wheat, AlertTriangle, ArrowRight, ChevronDown, Globe2, DollarSign, Sprout, Ship, Factory } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const WHAT_WE_GROW = [
  { product: "Wheat", globalRank: "#6 producer, #3 exporter", selfSufficient: "400%+", note: "We grow 4x what we eat. Major export to 70+ countries. The prairies feed millions globally." },
  { product: "Canola", globalRank: "#1 exporter", selfSufficient: "500%+", note: "Canada invented canola (Canadian Oil Low Acid). Dominates global supply." },
  { product: "Lentils & Pulses", globalRank: "#1 exporter", selfSufficient: "1000%+", note: "Saskatchewan produces more lentils than any other region. Exported to India, Middle East, Europe." },
  { product: "Beef", globalRank: "#7 producer", selfSufficient: "130%", note: "Net exporter. Alberta is the centre. 4 companies control 85% of processing." },
  { product: "Pork", globalRank: "#5 exporter", selfSufficient: "200%+", note: "Major exporter to Japan, China, US. Manitoba and Ontario lead." },
  { product: "Dairy", globalRank: "Supply-managed", selfSufficient: "100%", note: "Supply management keeps prices high but guarantees domestic production. Controversial — protects farmers but costs consumers $600+/year extra." },
  { product: "Potatoes", globalRank: "#8 producer", selfSufficient: "150%+", note: "PEI produces 25% of Canada's potatoes. Major export. Self-sufficient plus export surplus." },
  { product: "Maple Syrup", globalRank: "#1 (71% of world supply)", selfSufficient: "5000%+", note: "Quebec produces 71% of the world's maple syrup. Strategic reserve exists (yes, really)." },
]

const WHAT_WE_IMPORT = [
  { product: "Fresh fruits (bananas, citrus, tropical)", dependence: "95%+ imported", from: "US (California, Florida), Mexico, Central America", risk: "HIGH — any disruption to US/Mexico supply chain = empty shelves within 2-3 weeks" },
  { product: "Fresh vegetables (winter)", dependence: "60-80% imported in winter", from: "US (California, Arizona), Mexico", risk: "HIGH — Canadian greenhouses could produce year-round but capacity is ~20% of winter demand" },
  { product: "Processed food (frozen, canned, packaged)", dependence: "30-50% imported", from: "US, various", risk: "MEDIUM — Canada exports raw commodities and imports processed food at 3-5x markup. We ship wheat out and buy bread back." },
  { product: "Coffee, tea, chocolate, spices", dependence: "100% imported", from: "South America, Africa, Asia", risk: "LOW-MEDIUM — not nutritionally essential but culturally significant. No domestic alternative." },
  { product: "Seafood (farmed salmon, shrimp)", dependence: "70% imported", from: "Chile, Thailand, Vietnam, Ecuador", risk: "MEDIUM — ironic for a country with the longest coastline on Earth. Wild Canadian fisheries exist but farmed imports dominate." },
]

const VULNERABILITIES = [
  {
    vulnerability: "Just-In-Time Supply Chain",
    severity: "CRITICAL",
    details: "Canadian grocery stores carry 3-5 days of inventory. There is no national food reserve — unlike China (18 months), India (6 months), or even the EU (60 days for key staples). If trucking stops (strike, fuel shortage, border closure), shelves are empty in 72 hours. COVID and the 2022 trucker convoy both demonstrated this fragility. One blockade at the Ambassador Bridge (Windsor-Detroit) disrupted supply for millions.",
    solution: "National strategic food reserve: 90 days of shelf-stable staples (grain, canned goods, dried goods). Cost: ~$2-3B to establish, $200M/year to maintain. Canada has the farmland, the production, and the storage capacity — it just doesn't have the policy. Every other G20 nation has some form of food reserve.",
  },
  {
    vulnerability: "Grocery Oligopoly",
    severity: "HIGH",
    details: "Loblaw (30%), Sobeys (21%), Metro (17%) = 68% of grocery. When 3 companies control the food distribution system, they control pricing, availability, and which farmers survive. During 2023 inflation, all 3 reported record profits while Canadians went to food banks at record rates. Loblaw admitted to 14 years of bread price-fixing. The Competition Bureau has no meaningful power to change this.",
    solution: "Allow international grocery competition (Aldi, Lidl, Costco expansion). Strengthen Competition Bureau enforcement — current fines are rounding errors on $50B+ revenue. Support local food systems: farmers markets, co-ops, community-supported agriculture. Break Loblaw's combined grocery/pharmacy monopoly if competition doesn't improve.",
  },
  {
    vulnerability: "Farm Consolidation",
    severity: "HIGH",
    details: "The number of farms in Canada has dropped from 732,832 (1941) to 189,874 (2021) — a 74% decline. Farm size has quadrupled. Agriculture is dominated by large corporate operations. Young people cannot afford to start farming — land prices are too high, equipment too expensive. When farming is concentrated in few hands, the food system is fragile and communities hollow out.",
    solution: "Young farmer financing programs (low-interest loans, land trusts, incubator farms). Farmland protection from development (once farmland is paved, it's gone forever). Local food processing infrastructure (so farmers can add value locally instead of shipping raw commodities 3,000 km to a processor).",
  },
  {
    vulnerability: "Climate Change Impact on Agriculture",
    severity: "MEDIUM-HIGH",
    details: "The Prairies are getting drier in the south and wetter in the north. Growing seasons are longer but droughts are more severe. The 2021 BC heat dome destroyed $600M in crops and killed billions of farm animals. Wildfires threaten agricultural land. Paradoxically, climate change also opens NEW farmland in northern Canada — but infrastructure (roads, irrigation) doesn't exist there yet.",
    solution: "Drought-resistant crop varieties (already in development at U of Saskatchewan). Irrigation infrastructure in southern prairies (water exists in the north, farmland in the south — connect them). Climate-adapted farming practices. Northern agricultural development planning (long-term — as permafrost retreats, new land becomes viable).",
  },
  {
    vulnerability: "Dependence on US California/Arizona for Winter Produce",
    severity: "HIGH",
    details: "Most fresh produce Canadians eat from November to April comes from California and Arizona — regions facing severe water shortages. Lake Mead (supplies California agriculture) is at 30% capacity. Colorado River allocations are being cut. Within 10-20 years, California's agricultural output may decline significantly. Canada's winter food supply depends on water that is running out in another country.",
    solution: "Massive greenhouse expansion. The Netherlands (a country smaller than Nova Scotia) is the #2 food exporter on EARTH — entirely through greenhouse technology. Canada has cheap electricity (Quebec hydro), land, and water. There is zero reason Canada cannot grow tomatoes, peppers, lettuce, and herbs year-round in greenhouses. Ontario and BC already have greenhouse operations — they need to scale 10x.",
  },
]

const FOOD_PROCESSING_GAP = [
  { raw: "Wheat", exportedAs: "Raw grain ($500/tonne)", couldBe: "Flour, bread, pasta ($1,500-$3,000/tonne)", valueLeft: "3-6x value left on table" },
  { raw: "Canola", exportedAs: "Raw seed ($600/tonne)", couldBe: "Cooking oil, meal, biofuel ($1,200-$2,000/tonne)", valueLeft: "2-3x value left on table" },
  { raw: "Beef cattle", exportedAs: "Live cattle or raw cuts", couldBe: "Branded processed beef products", valueLeft: "2-4x value with processing and branding" },
  { raw: "Potatoes", exportedAs: "Raw potatoes ($300/tonne)", couldBe: "Frozen fries, chips, potato products ($1,000-$2,000/tonne)", valueLeft: "3-6x value left on table" },
  { raw: "Lentils", exportedAs: "Raw bulk lentils", couldBe: "Packaged, branded, ready-to-cook ($2-4x markup)", valueLeft: "2-4x value with packaging and branding" },
]

export default function CanadaFoodSecurityPage() {
  const [expandedVuln, setExpandedVuln] = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-700">
            <Wheat className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada's Food Security</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Canada feeds 100+ countries but has 3 days of grocery inventory, no food reserve, and imports most winter produce from drought-threatened California.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">The Paradox</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada has some of the most productive farmland on Earth. It exports $80B+ in agri-food products annually.
            It is the world's #1 exporter of canola, lentils, and maple syrup. Yet: <strong>grocery shelves carry
            3-5 days of inventory</strong>, there is <strong>no national food reserve</strong>, food banks served
            <strong> 2 million visits/month</strong> in 2023, and 60-80% of winter fresh produce comes from one
            US state (California) that is running out of water. Canada is a food superpower with a food security problem.
          </p>
        </CardContent>
      </Card>

      {/* What we grow */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <Sprout className="h-4 w-4 text-emerald-500" /> What Canada Produces
        </CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {WHAT_WE_GROW.map((p, i) => (
            <div key={i} className="rounded-lg border border-emerald-200 bg-emerald-50/10 p-2.5">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-medium">{p.product}</span>
                <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-300">{p.selfSufficient} self-sufficient</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{p.globalRank}</p>
              <p className="text-[10px] text-muted-foreground">{p.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* What we import */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <Ship className="h-4 w-4 text-red-500" /> What We Import (Vulnerabilities)
        </CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {WHAT_WE_IMPORT.map((p, i) => (
            <div key={i} className={cn("rounded-lg border p-2.5",
              p.risk.startsWith("HIGH") ? "border-red-200 bg-red-50/10" : "border-amber-200 bg-amber-50/10"
            )}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-medium">{p.product}</span>
                <Badge variant="outline" className={cn("text-[9px]",
                  p.risk.startsWith("HIGH") ? "text-red-500 border-red-300" : "text-amber-600 border-amber-300"
                )}>{p.dependence}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">From: {p.from}</p>
              <p className="text-[10px] text-red-500">{p.risk}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Vulnerabilities */}
      <div>
        <h2 className="text-lg font-bold mb-3">5 Food System Vulnerabilities</h2>
        <div className="space-y-3">
          {VULNERABILITIES.map((v, i) => {
            const isOpen = expandedVuln === i
            return (
              <Card key={i} className={cn("card-hover cursor-pointer",
                v.severity === "CRITICAL" ? "border-red-200" : "border-amber-200"
              )} onClick={() => setExpandedVuln(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={cn("h-4 w-4 shrink-0",
                      v.severity === "CRITICAL" ? "text-red-500" : "text-amber-500"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{v.vulnerability}</p>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px]",
                      v.severity === "CRITICAL" ? "text-red-500 border-red-300" : "text-amber-600 border-amber-300"
                    )}>{v.severity}</Badge>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-7">
                      <p className="text-xs text-muted-foreground leading-relaxed">{v.details}</p>
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                        <p className="text-xs text-emerald-700"><strong>Solution:</strong> {v.solution}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Processing gap */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <Factory className="h-4 w-4 text-amber-500" /> The Processing Gap — Export Raw, Import Finished
        </CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          <p className="text-xs text-muted-foreground mb-2">Canada exports raw commodities at low prices and imports processed food at 3-6x the value. This is a colonial trade pattern.</p>
          {FOOD_PROCESSING_GAP.map((f, i) => (
            <div key={i} className="rounded-lg border border-border p-2.5">
              <p className="text-sm font-medium mb-1">{f.raw}</p>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-red-500">Export: {f.exportedAs}</span>
                <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="text-emerald-600">Could be: {f.couldBe}</span>
              </div>
              <p className="text-[10px] text-amber-600 font-medium mt-0.5">{f.valueLeft}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">The Netherlands Model</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Netherlands is <strong>smaller than Nova Scotia</strong> yet is the <strong>#2 food exporter on Earth</strong> ($120B+/year).
            How? Greenhouses. Technology. Processing. Branding. They turned a tiny, flat, flood-prone country into an
            agricultural superpower through innovation, not land. Canada has 270x the land area, unlimited water,
            and the cheapest clean electricity on the continent. If the Netherlands can do this with nothing,
            Canada can do it with everything. The missing ingredient is not resources — it is strategy.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/water" className="text-sm text-blue-600 hover:underline">Water Security</a>
        <a href="/food-system" className="text-sm text-green-600 hover:underline">Food System Education</a>
        <a href="/canada/oligopolies" className="text-sm text-amber-600 hover:underline">Oligopolies</a>
        <a href="/cooking" className="text-sm text-orange-600 hover:underline">Cooking Basics</a>
      </div>
    </div>
  )
}
