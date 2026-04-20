"use client"

import { useState } from "react"
import {
  MapPin, ArrowRight, Zap, Wheat, Factory, Home, Heart, Shield,
  Users, GraduationCap, ChevronDown, Droplets, TreePine, Mountain,
  Ship, Cpu, Globe2, TrendingUp, Sprout
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ────────────────────────────────────────────
// Regional blueprints — what each region should lean into
// ────────────────────────────────────────────
const REGIONS: {
  name: string
  provinces: string[]
  population: string
  leanInto: { strength: string; icon: any; strategy: string; potential: string }[]
  weaknesses: { issue: string; solution: string }[]
  vision: string
}[] = [
  {
    name: "The West Coast (British Columbia)",
    provinces: ["British Columbia"],
    population: "5.4M",
    leanInto: [
      { strength: "Pacific Gateway — Port of Vancouver", icon: Ship, strategy: "Vancouver is Canada's door to Asia-Pacific. Expand port capacity, build rail links, and create free trade zones. Diversify trade away from 75% US dependency by becoming the pipeline to Japan, South Korea, India, and ASEAN.", potential: "Could handle 50%+ more container traffic with expansion. Every container that moves through Vancouver instead of Seattle or LA creates Canadian jobs and tax revenue." },
      { strength: "Technology & Film Industry", icon: Cpu, strategy: "Vancouver already has a thriving tech and film ecosystem. Lean in hard: tax incentives for studios AND tech companies that build headquarters (not just branch offices). VFX, gaming (EA, Relic), and AI. Retain talent instead of losing them to Seattle.", potential: "BC's tech sector is $20B+. With aggressive retention policies it could rival Seattle." },
      { strength: "Hydroelectric Power", icon: Zap, strategy: "BC generates 90%+ of electricity from hydro — among the cleanest grids in the world. Export clean power to Alberta and the US Pacific Northwest. Attract energy-intensive industries (data centers, aluminum smelting) that want clean energy.", potential: "Site C dam adds 1,100 MW. BC could become a clean energy exporter at scale." },
      { strength: "Forestry → Mass Timber", icon: TreePine, strategy: "Stop exporting raw logs. Build mass timber (CLT) factories that turn BC wood into building materials that replace imported steel and concrete. BC wood should build BC homes.", potential: "Mass timber construction is growing 15%/year globally. BC has unlimited raw material." },
    ],
    weaknesses: [
      { issue: "Housing (worst in Canada: 15.2x income in Vancouver)", solution: "Upzone aggressively. Convert single-family lots to 6-plexes on transit corridors. Expand rail transit. Use provincial Crown land for housing developments. Penalize vacant properties 5%/year." },
      { issue: "Drug crisis (overdose deaths surpassing COVID deaths)", solution: "Treatment + housing first approach. Decriminalization without treatment failed. BC needs 10,000+ treatment beds. Compulsory care for people in immediate danger (controversial but saves lives). Address root cause: economic despair." },
      { issue: "Wildfire risk (escalating every year)", solution: "Community fireproofing program. Create fire breaks around every town. Prescribed burns (Indigenous fire management practices). Update building codes for fire-resistant materials." },
    ],
    vision: "Canada's Pacific powerhouse: clean energy, technology, mass timber construction, and the gateway to Asian markets. Housing that workers can actually afford within 30 minutes of their jobs.",
  },
  {
    name: "The Prairies (Alberta, Saskatchewan, Manitoba)",
    provinces: ["Alberta", "Saskatchewan", "Manitoba"],
    population: "8.5M combined",
    leanInto: [
      { strength: "Energy (Oil, Gas, Uranium, Hydro)", icon: Zap, strategy: "Stop exporting crude — refine it here. Alberta has the raw material, Saskatchewan has uranium for nuclear, Manitoba has hydro. Build a Prairie energy corridor that processes, refines, and exports FINISHED energy products. SMR nuclear reactors in Saskatchewan. Hydrogen production from natural gas with carbon capture.", potential: "Alberta refining alone could add $50B+ in GDP by processing what is currently exported raw at a discount." },
      { strength: "Agriculture (world-class farmland)", icon: Wheat, strategy: "The Prairies feed 100+ countries but export raw grain and import processed food. Build food processing capacity: flour mills, canola oil refineries, lentil processing, beef processing. Every dollar of value-added processing stays in Canada.", potential: "Canada exports $80B in agri-food products. Processing could add 40-60% more value — that is $32-48B in new economic activity." },
      { strength: "Critical Minerals (Potash, Uranium, Rare Earths)", icon: Mountain, strategy: "Saskatchewan's potash is 30% of world supply — essential for global food production. Uranium powers nuclear energy worldwide. Rare earth deposits are being identified. Process these domestically instead of shipping raw material to China.", potential: "Potash alone is a $10B+ industry. Uranium + rare earth processing could add $5-10B." },
      { strength: "Renewable Energy Potential", icon: Zap, strategy: "Southern Alberta has the best wind and solar conditions in Canada. Saskatchewan is wide-open for wind farms. Manitoba's hydro is expandable. The Prairies could be a renewable energy exporter — clean power sent east to Ontario or south to the US.", potential: "Alberta's solar potential rivals that of southern Spain. Wind capacity is essentially unlimited on flat prairie land." },
    ],
    weaknesses: [
      { issue: "Oil dependency and boom-bust cycles (Alberta)", solution: "Heritage fund (Norway model — Norway saved $1.5 trillion from oil revenue while Alberta saved $18B). Diversify aggressively: tech (Calgary is growing), food processing, petrochemicals. Save windfall revenue instead of spending it." },
      { issue: "Population retention (young people leaving Saskatchewan/Manitoba)", solution: "Affordable housing + high-paying trade jobs + quality of life marketing. Edmonton and Winnipeg are the most affordable major cities in Canada — make that the pitch. Remote work means people don't need to live in Toronto anymore." },
      { issue: "Water scarcity in southern Alberta and Saskatchewan", solution: "Irrigation modernization (drip irrigation saves 30-50% of water vs flood irrigation). Water recycling in industrial processes. Groundwater monitoring and protection. Long-term: water transfer infrastructure from water-rich northern regions." },
    ],
    vision: "Canada's energy AND food processing heartland. Not just raw material exporters but the place where Canadian resources become Canadian products. The most affordable region to live with the highest quality of life.",
  },
  {
    name: "Central Canada (Ontario, Quebec)",
    provinces: ["Ontario", "Quebec"],
    population: "24.7M combined (60% of Canada)",
    leanInto: [
      { strength: "Manufacturing Rebuild", icon: Factory, strategy: "Ontario was Canada's manufacturing engine — the 'workshop of Canada.' It still has the infrastructure, skilled workforce, and logistics (Great Lakes shipping, rail, highways). Rebuild with focus on: EV batteries (lithium processing + battery factories already starting), medical equipment, military equipment, and food processing. Quebec has aerospace (Bombardier, CAE) and aluminum — expand.", potential: "Ontario's manufacturing sector is $80B. With reshoring and EV transition, it could double. Quebec's aerospace is $18B — 2nd in North America after Montreal." },
      { strength: "Nuclear Energy (Ontario)", icon: Zap, strategy: "Ontario has 19 nuclear reactors providing 60% of its electricity — clean, reliable baseload. Expand with SMRs (Small Modular Reactors). Export nuclear technology (CANDU is Canadian-designed). Ontario could become the nuclear energy leader of North America.", potential: "SMR market is projected at $150B+ globally by 2040. Canada designs them — Canada should build them." },
      { strength: "AI & Technology (Toronto-Waterloo + Montreal MILA)", icon: Cpu, strategy: "The godfather of deep learning (Geoffrey Hinton) trained at U of T. Yoshua Bengio runs MILA in Montreal. Canada has the researchers — it needs the companies. Stop the brain drain to Silicon Valley by building AI companies HERE. Vector Institute, MILA, Amii — fund them aggressively and build commercial ecosystems around them.", potential: "Canada's AI talent is world-class but the $$ go to US companies. Retention could build a $50B+ domestic AI industry." },
      { strength: "Hydroelectric (Quebec)", icon: Droplets, strategy: "Quebec has the cheapest electricity in North America — 95%+ from hydro. This is a massive competitive advantage. Attract data centers, aluminum smelting, and any energy-intensive industry. Export clean power to Ontario and the US Northeast (already happening via HVDC lines).", potential: "Quebec's hydro surplus could power Ontario's transition off natural gas and attract massive industrial investment." },
    ],
    weaknesses: [
      { issue: "Housing crisis (GTA and Montreal price explosion)", solution: "Ontario: upzone the 'yellowbelt' (70% of Toronto's residential land zoned exclusively for single-family). Quebec: maintain rent control but build MUCH more rental supply. Both: modular housing factories, government-built rental, federal land conversion." },
      { issue: "Healthcare collapse (Ontario ER closures, Quebec doctor shortages)", solution: "Mixed delivery model: keep universal coverage but allow regulated private clinics for non-emergency care (as in France, Australia). Expand nurse practitioner scope. Recruit internationally with fast credential recognition. Digital health records." },
      { issue: "Interprovincial trade barriers (easier to trade with US than between provinces)", solution: "Internal free trade agreement with real enforcement. Mutual credential recognition (an electrician licensed in Ontario should be licensed in Quebec). Common food safety standards. Digital business registration that works across provinces." },
    ],
    vision: "North America's manufacturing, nuclear, and AI corridor. Clean energy from Quebec hydro powering Ontario factories that build EVs, medical equipment, and AI systems designed by the world's best researchers — all within 30 minutes of an affordable home.",
  },
  {
    name: "Atlantic Canada (NB, NS, PEI, NL)",
    provinces: ["New Brunswick", "Nova Scotia", "Prince Edward Island", "Newfoundland & Labrador"],
    population: "2.5M combined",
    leanInto: [
      { strength: "Ocean Economy (Fisheries, Aquaculture, Offshore Energy, Tidal)", icon: Ship, strategy: "Atlantic Canada's coastline is its greatest asset. Rebuild sustainable fisheries (cod is recovering). Expand aquaculture responsibly. Develop tidal energy in the Bay of Fundy (highest tides in the world). Offshore wind is enormous and untapped.", potential: "Bay of Fundy tidal energy could generate 2,500 MW — enough to power all of New Brunswick. Offshore wind potential is massive on the Atlantic coast." },
      { strength: "Military / Defence Hub (Halifax)", icon: Shield, strategy: "Halifax is already the Atlantic naval base. Expand shipbuilding (Irving is doing this — $60B+ program). Cyber security operations. Arctic patrol staging. Defence spending increase should flow through Atlantic Canada where the infrastructure exists.", potential: "Defence spending increase to 2% GDP = $15B+ additional annually. Atlantic Canada should capture a significant share." },
      { strength: "Remote Work Destination", icon: Home, strategy: "Atlantic Canada is the most affordable region with the best quality of life (low crime, beautiful scenery, strong communities). Market aggressively to remote workers: 'Your salary from Toronto, your cost of living from Moncton.' Provincial nominee programs already attract newcomers — combine with housing availability.", potential: "Even 50,000 remote workers relocating = $3B+ in new spending annually in a region of 2.5M people. Transformative." },
      { strength: "Churchill Falls (NL) — Power Contract Expiry 2041", icon: Zap, strategy: "The most lopsided contract in Canadian history: Quebec pays NL $2/MWh for Churchill Falls hydro (market rate: $60+/MWh). When it expires in 2041, NL gains $2-3B/year in revenue overnight. Plan NOW for how to use that revenue: sovereign wealth fund, infrastructure, debt elimination.", potential: "$2-3B/year for a province of 500K people is transformative — $4,000-6,000 per resident per year in new government revenue." },
    ],
    weaknesses: [
      { issue: "Population aging and youth outmigration", solution: "Make it worth staying: affordable housing + remote work infrastructure + quality healthcare. Young people leave for jobs — give them reasons to stay or return. Return incentive programs (student loan forgiveness for staying in region)." },
      { issue: "Irving family economic concentration (NB)", solution: "Competition policy enforcement. Transparency in government contracts. Support alternative media (Irving owns virtually all NB newspapers). Diversify NB economy beyond Irving companies." },
      { issue: "Healthcare access (doctor shortages across all 4 provinces)", solution: "Recruit aggressively internationally. Fast-track credential recognition. Nurse practitioner clinics in every community. Telehealth for rural areas. Medical school expansion (Dalhousie, Memorial)." },
    ],
    vision: "The most livable region in Canada: affordable homes, ocean economy, clean energy, strong military presence, and the country's best quality of life. A magnet for remote workers and families who want a slower, richer life without poverty wages.",
  },
  {
    name: "The North (Yukon, NWT, Nunavut)",
    provinces: ["Yukon", "Northwest Territories", "Nunavut"],
    population: "0.13M combined",
    leanInto: [
      { strength: "Arctic Sovereignty", icon: Shield, strategy: "As Arctic ice retreats, the Northwest Passage opens for shipping. Russia, China, Denmark, and the US all have competing claims. If Canada doesn't assert sovereignty with presence (military bases, deep-water ports, permanent communities), others will. The North is the future frontier of global trade.", potential: "The Northwest Passage as a shipping route would be one of the most strategic waterways on Earth — shorter than the Suez or Panama canals for Asia-Europe trade." },
      { strength: "Critical Minerals", icon: Mountain, strategy: "NWT has diamonds, rare earths, and gold. Nunavut has iron ore, gold, and uranium. Yukon has gold, copper, and zinc. Process domestically instead of exporting raw. Ensure Indigenous communities are equity partners in development, not just consulted.", potential: "Arctic mineral deposits are estimated in the hundreds of billions. Responsible development with Indigenous partnership could transform Northern economies." },
      { strength: "Indigenous Self-Governance", icon: Users, strategy: "Nunavut is the only jurisdiction in North America governed primarily by Indigenous people. This is an opportunity to demonstrate that Indigenous self-governance WORKS — with proper funding, infrastructure, and respect for traditional knowledge.", potential: "If Northern Indigenous communities are properly supported, they become a model for the world — not a cautionary tale." },
    ],
    weaknesses: [
      { issue: "Food insecurity (46% of Nunavut households are food insecure)", solution: "Greenhouse and hydroponic farms in every community (technology exists — Inuvik already has a community greenhouse). Country food support programs. Reduce freight costs through infrastructure investment. Community freezers for harvested food." },
      { issue: "Housing crisis (severe overcrowding, mold, inadequate buildings)", solution: "Build housing designed for the North (current buildings use Southern designs that fail in permafrost). Invest in local construction capacity — train Northern residents to build Northern homes. 10-year housing build program." },
      { issue: "Infrastructure (many communities accessible only by air or seasonal ice road)", solution: "All-season road expansion where feasible. Enhanced air service. Satellite internet (Starlink is already changing this). Renewable energy for every community (diesel dependence is expensive and polluting)." },
    ],
    vision: "The sovereign North: Arctic infrastructure that asserts Canadian presence, resource development that benefits Indigenous communities as equity partners, and every community with clean water, reliable food, and connection to the rest of Canada. Not a forgotten territory — a strategic priority.",
  },
]

// ────────────────────────────────────────────
// The new Canada scorecard
// ────────────────────────────────────────────
const SCORECARD = [
  { metric: "Home price to income ratio", current: "8.3x (severely unaffordable)", target: "3.5x (affordable)", timeframe: "15 years" },
  { metric: "Healthcare wait time (specialist)", current: "27.7 weeks (worst in OECD)", target: "4 weeks (France/Germany level)", timeframe: "10 years" },
  { metric: "Trade concentration (US)", current: "75% of exports to one country", target: "55% US, 20% EU/UK, 15% Asia, 10% other", timeframe: "15 years" },
  { metric: "Manufacturing as % of GDP", current: "10% (was 18% in 1990)", target: "15% (strategic sectors)", timeframe: "15 years" },
  { metric: "Defence spending", current: "1.3% GDP", target: "2.0% GDP with domestic manufacturing", timeframe: "7 years" },
  { metric: "National debt", current: "$1.2 trillion (growing)", target: "Declining — balanced budget by Year 5", timeframe: "5 years to balance, 25 to halve" },
  { metric: "Indigenous boil water advisories", current: "30+", target: "0", timeframe: "3 years (this is achievable NOW)" },
  { metric: "Birth rate", current: "1.33 (lowest ever)", target: "1.8+ (through affordability, not mandates)", timeframe: "10-15 years" },
  { metric: "Food self-sufficiency", current: "~80% staples, ~50% produce", target: "95%+ staples, 75%+ produce (greenhouse)", timeframe: "10 years" },
  { metric: "Household debt to income", current: "$1.79 per $1.00 income", target: "$1.00 per $1.00 income", timeframe: "15 years" },
]

export default function CanadaBlueprintPage() {
  const [expandedRegion, setExpandedRegion] = useState<number | null>(0)
  const [showScorecard, setShowScorecard] = useState(false)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Blueprint: Rebuilding Canada</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Region by region. Lean into strengths, fix weaknesses, build what should have been built all along.
        </p>
      </div>

      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-red-900 mb-2">The Vision</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada has every resource a nation needs to thrive independently: water, energy, farmland, minerals,
            timber, coastline, educated population. The problem has never been what Canada HAS — it is what Canada
            DOES with it. A country that exports raw materials and imports finished products is a colony by another
            name. This blueprint maps what each region should specialize in based on what it actually has, how to
            fix specific weaknesses, and what success looks like — measured, not promised. Not left or right.
            Not federal vs provincial. Just: what works, based on what exists.
          </p>
        </CardContent>
      </Card>

      {/* Regional blueprints */}
      <div className="space-y-4">
        {REGIONS.map((region, ri) => {
          const isOpen = expandedRegion === ri
          return (
            <Card key={ri} className="overflow-hidden">
              <div className="cursor-pointer" onClick={() => setExpandedRegion(isOpen ? null : ri)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-red-500 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{region.name}</p>
                      <Badge variant="outline" className="text-[9px]">{region.population}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{region.provinces.join(", ")}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </CardContent>
              </div>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-4">
                  {/* Lean into */}
                  <div>
                    <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-2">Lean Into These Strengths</p>
                    <div className="space-y-3">
                      {region.leanInto.map((s, si) => {
                        const Icon = s.icon
                        return (
                          <div key={si} className="rounded-lg border border-emerald-200 bg-emerald-50/20 p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="h-4 w-4 text-emerald-600" />
                              <p className="text-xs font-semibold text-emerald-800">{s.strength}</p>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-1">{s.strategy}</p>
                            <p className="text-[10px] text-emerald-600 italic">{s.potential}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-2">Address These Weaknesses</p>
                    <div className="space-y-2">
                      {region.weaknesses.map((w, wi) => (
                        <div key={wi} className="rounded-lg border border-amber-200 bg-amber-50/20 p-3">
                          <p className="text-xs font-semibold text-amber-800 mb-0.5">{w.issue}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{w.solution}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Regional vision */}
                  <div className="rounded-lg bg-blue-50/50 border border-blue-200 p-3">
                    <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider mb-0.5">The Vision</p>
                    <p className="text-xs text-blue-700">{region.vision}</p>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* National scorecard */}
      <Card className="cursor-pointer" onClick={() => setShowScorecard(!showScorecard)}>
        <CardContent className="p-4 flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold">National Scorecard — Measure Success</p>
            <p className="text-[10px] text-muted-foreground">10 metrics to track whether Canada is actually getting better</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showScorecard && "rotate-180")} />
        </CardContent>
      </Card>
      {showScorecard && (
        <div className="space-y-2">
          {SCORECARD.map((s, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <p className="text-sm font-medium mb-1">{s.metric}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-red-500">{s.current}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-emerald-600 font-medium">{s.target}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Timeframe: {s.timeframe}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">This Is Not Impossible</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Everything in this blueprint has been done by at least one country. Norway built a $1.5T sovereign wealth
            fund from oil. Vienna built social housing that 60% of residents live in. South Korea went from developing
            country to tech powerhouse in 30 years. Finland built the best education system on Earth. Singapore went
            from fishing village to global financial center in one generation. The knowledge exists. The resources
            exist. Canada has MORE natural advantages than any of these countries had when they started. The only
            thing missing is the will to stop accepting mediocrity and start building what this country could be.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/spending" className="text-sm text-amber-600 hover:underline">Government Spending</a>
        <a href="/canada/housing" className="text-sm text-orange-600 hover:underline">Housing Crisis</a>
        <a href="/canada/root-causes" className="text-sm text-violet-600 hover:underline">Root Causes</a>
      </div>
    </div>
  )
}
