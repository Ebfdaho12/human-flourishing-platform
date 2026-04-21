"use client"

import { useState } from "react"
import {
  Globe2, Shield, Droplets, Zap, Wheat, Factory, Swords, Home,
  ChevronDown, AlertTriangle, ArrowRight, TrendingUp, Landmark,
  TreePine, Mountain, Cpu, Pill, Ship, Fuel, Users, MapPin
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"
import { AletheiaConnection } from "@/components/AletheiaConnection"

// ────────────────────────────────────────────
// Canada's strategic assets
// ────────────────────────────────────────────
const ASSETS = [
  {
    resource: "Fresh Water",
    icon: Droplets,
    color: "from-blue-500 to-cyan-600",
    stat: "20% of world's fresh water",
    details: [
      "Canada holds 20% of the world's total freshwater and 7% of renewable freshwater",
      "The Great Lakes alone contain 21% of the world's surface fresh water",
      "As climate change intensifies droughts globally, Canadian water becomes the most strategically valuable resource on Earth",
      "Current status: largely unprotected from bulk export. No comprehensive national water policy.",
      "Vulnerability: NAFTA/CUSMA treats water as a tradeable commodity once it enters commerce. Bulk water exports could be legally challenged to stop",
    ],
    selfSufficiency: "Complete — Canada has more fresh water than it could ever need domestically. The challenge is protection, not supply.",
    action: "National water sovereignty legislation. Classify water as a public trust, not a commodity. Invest in water treatment infrastructure (many Indigenous communities still lack clean drinking water).",
  },
  {
    resource: "Energy (Oil, Gas, Hydro, Nuclear, Renewables)",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    stat: "3rd largest oil reserves globally",
    details: [
      "Oil sands: 168 billion barrels proven reserves (3rd after Venezuela, Saudi Arabia)",
      "Natural gas: massive reserves in BC, Alberta, and offshore Atlantic",
      "Hydroelectric: 2nd largest producer globally. Quebec generates 95%+ of its electricity from hydro",
      "Uranium: world's 2nd largest producer. Saskatchewan's Athabasca Basin has the richest deposits on Earth",
      "Nuclear: 19 reactors (Ontario). CANDU technology is Canadian-designed",
      "Wind and solar: enormous untapped potential, especially in prairies and Atlantic coast",
    ],
    selfSufficiency: "Energy SURPLUS — Canada produces far more energy than it consumes. The problem is refining and processing.",
    action: "Build domestic refining capacity (currently exports crude to the US and imports gasoline back). Expand nuclear (SMRs). Complete east-west pipeline so Atlantic Canada doesn't import Saudi oil while Alberta has a surplus. National energy grid interconnection.",
  },
  {
    resource: "Agriculture & Food",
    icon: Wheat,
    color: "from-yellow-500 to-amber-600",
    stat: "Only 5% of land farmed — massive expansion potential",
    details: [
      "Canadian prairies: some of the most fertile farmland on Earth. World's largest exporters of wheat, canola, lentils, peas",
      "Canada exports raw commodities and imports processed food at 3-5x markup. We ship wheat out and buy bread back",
      "Food processing has declined since NAFTA — easier to process in the US or Mexico",
      "Greenhouse technology could extend growing seasons dramatically (Netherlands model — tiny country, 2nd largest food exporter)",
      "Only 5% of total land area is cultivated. Climate change is actually opening new agricultural land in the north",
      "Supply chain vulnerability: 30% of fresh produce comes from California and Mexico. A supply disruption = immediate grocery crisis",
    ],
    selfSufficiency: "80% for staples (grain, meat, dairy). 50-60% for fresh produce. Almost 0% for tropical products (bananas, coffee, etc.).",
    action: "Invest in food processing (add value domestically instead of exporting raw). Expand greenhouse farming. Strategic food reserves (Canada has none — most countries do). Support local food systems and farmer's markets.",
  },
  {
    resource: "Minerals & Critical Metals",
    icon: Mountain,
    color: "from-slate-500 to-gray-600",
    stat: "World-class deposits of 60+ minerals",
    details: [
      "Nickel: one of the world's largest producers (Sudbury, Thompson, Voisey's Bay)",
      "Potash: 30% of global supply (Saskatchewan) — essential for food production worldwide",
      "Uranium: 2nd largest producer. Powers nuclear energy globally",
      "Gold, diamonds, zinc, copper: major global producer in all four",
      "Rare earth elements: significant deposits identified in Quebec, NWT, and Ontario — critical for electronics, EVs, and military technology",
      "Lithium: growing deposits in Quebec and Ontario for EV batteries",
      "The problem: Canada exports raw minerals and imports finished products. We mine lithium and import batteries from China",
    ],
    selfSufficiency: "Raw materials: near-complete. Processing: critically deficient. Canada mines the ingredients but doesn't make the products.",
    action: "Build domestic mineral processing and refining. Battery manufacturing plants (some underway in Ontario/Quebec). Rare earth processing to reduce China dependency. Value-added manufacturing from Canadian raw materials.",
  },
  {
    resource: "Timber & Forestry",
    icon: TreePine,
    color: "from-green-600 to-emerald-700",
    stat: "10% of world's forests — 347 million hectares",
    details: [
      "Canada has 347 million hectares of forest — 10% of the world's total",
      "Lumber, pulp, paper — major export industries, especially to the US",
      "Softwood lumber dispute with the US has lasted decades — tariffs applied repeatedly",
      "Mass timber construction is emerging as a sustainable alternative to concrete and steel — Canada is perfectly positioned",
      "Carbon sink: Canadian forests absorb massive amounts of CO2 (though wildfires have turned them into net emitters in recent years)",
    ],
    selfSufficiency: "Complete for timber. The opportunity is mass timber construction to replace foreign steel and concrete imports.",
    action: "Invest in mass timber manufacturing (CLT plants). Wildfire management infrastructure. Sustainable forestry certification for global markets.",
  },
  {
    resource: "Fisheries & Oceans",
    icon: Ship,
    color: "from-blue-600 to-indigo-700",
    stat: "Longest coastline in the world — 243,042 km",
    details: [
      "Three ocean coastlines: Atlantic, Pacific, Arctic",
      "Historically: the cod fishery sustained Atlantic Canada for 500 years — until it collapsed from overfishing (1992 moratorium)",
      "Current: salmon (Pacific), lobster (Atlantic), shrimp, crab, halibut — $7B+ industry",
      "Arctic: as ice retreats, the Northwest Passage opens. Whoever controls Arctic shipping routes controls global trade",
      "Aquaculture (fish farming) is growing but controversial (environmental impacts)",
      "Sovereignty concern: Russian, Chinese, and Danish claims overlap with Canadian Arctic territory",
    ],
    selfSufficiency: "High for seafood. The strategic question is Arctic sovereignty — the Northwest Passage is a future choke point for global trade.",
    action: "Arctic sovereignty investment (military, coast guard, infrastructure). Sustainable fisheries management. Rebuild Atlantic cod stocks. Expand sustainable aquaculture.",
  },
]

// ────────────────────────────────────────────
// Where Canada is critically dependent
// ────────────────────────────────────────────
const DEPENDENCIES = [
  {
    sector: "Pharmaceuticals",
    icon: Pill,
    dependency: "70%+ imported",
    from: "US, EU, India, China",
    risk: "CRITICAL",
    details: "Canada imports the vast majority of medications. During COVID, supply chains broke and drug shortages spiked. Canada has no domestic capability to manufacture mRNA vaccines, most antibiotics, or critical ICU medications. If trade routes close, hospitals run out of drugs within weeks.",
    solution: "Domestic pharmaceutical manufacturing. Canada had this capacity in the 1990s — it was dismantled after patent law changes favored imported brand-name drugs. Rebuild generic manufacturing (India model). Invest in mRNA/biotech manufacturing (already started with Moderna plant in Montreal).",
  },
  {
    sector: "Manufacturing",
    icon: Factory,
    dependency: "Gutted since NAFTA",
    from: "US, China, Mexico",
    risk: "HIGH",
    details: "Canada lost 500,000+ manufacturing jobs since NAFTA (1994). Most consumer goods, electronics, appliances, and industrial equipment are imported. The auto industry survives but is entirely dependent on US/Japanese/Korean companies choosing to manufacture here.",
    solution: "Strategic reshoring of critical manufacturing: medical equipment, military equipment, basic electronics, heavy machinery. Not everything — but the things you cannot afford to be without.",
  },
  {
    sector: "Technology & Semiconductors",
    icon: Cpu,
    dependency: "Near-total import",
    from: "US, Taiwan, South Korea, China",
    risk: "HIGH",
    details: "Canada designs some technology (AI research is world-class: Hinton, Bengio, LeCun all have Canadian connections) but manufactures almost none. No semiconductor fabrication plants. If Taiwan (TSMC) is disrupted, Canada has zero domestic chip production. Every phone, computer, car, and medical device depends on imported chips.",
    solution: "Semiconductor fabrication investment (extremely expensive — $10-20B per fab, but national security requires it). Leverage world-class AI research into domestic AI industry. Cybersecurity as a national priority.",
  },
  {
    sector: "Petroleum Refining",
    icon: Fuel,
    dependency: "Exports crude, imports refined",
    from: "US refineries",
    risk: "HIGH",
    details: "Canada has the 3rd largest oil reserves but does not refine enough for domestic consumption. Atlantic Canada imports oil from Saudi Arabia, Nigeria, and the US because there is no pipeline from Alberta to the East Coast. Canada exports crude at a discount and imports gasoline at a premium. The Irving refinery in Saint John, NB is the largest in Canada — one family controls Atlantic Canada's fuel supply.",
    solution: "East-west pipeline (Energy East was cancelled). Expand refining capacity in Alberta, Saskatchewan, and Atlantic Canada. Process Canadian oil for Canadian use first, export the surplus refined — not raw.",
  },
  {
    sector: "Defence & Military",
    icon: Swords,
    dependency: "Dependent on US/NATO umbrella",
    from: "US primarily",
    risk: "CRITICAL",
    details: "Canada spends 1.3% of GDP on defence (NATO target is 2%). NORAD is jointly operated with the US — Canada could not defend its own airspace alone. Navy has 12 frigates (some 30+ years old). Arctic sovereignty is functionally undefended. Fighter jet procurement (F-35) took 20+ years. Military recruitment is in crisis — can't fill existing positions.",
    solution: "Reach NATO 2% GDP target. Arctic military infrastructure (deep-water ports, radar, patrol vessels). Domestic military equipment manufacturing (Irving Shipbuilding is doing this). Recruit aggressively — military service as a path to citizenship and career.",
  },
  {
    sector: "Housing System",
    icon: Home,
    dependency: "Financialized — treated as investment, not shelter",
    from: "Domestic policy failure",
    risk: "CRITICAL",
    details: "Average home: $665K nationally, $1.1M in Toronto, $1.2M in Vancouver. Income-to-home-price ratio is the worst in the G7. Foreign investment, REITs, and restrictive zoning have turned housing into a financial asset. A generation is locked out of homeownership. This is not a supply problem alone — it's a demand problem created by treating shelter as a commodity.",
    solution: "Zoning reform (allow density). Tax vacant properties and foreign speculators aggressively. Build purpose-built rental. Social housing investment (Vienna model — 60% of Vienna residents live in social housing). Restrict REIT residential purchases. Bring housing-to-income ratio back to 3-4x from 10-13x.",
  },
]

// ───────────────────────��────────────────────
// Provincial strengths
// ────────────────────────────────────────────
const PROVINCES = [
  { name: "British Columbia", strengths: "Forestry, ports (Vancouver = Canada's Pacific gateway), tech (Vancouver), hydro power, fisheries, mining, agriculture (Okanagan), film industry", population: "5.4M", gdp: "$365B", keyIssue: "Housing affordability (worst in Canada), drug crisis, forestry decline, wildfire risk" },
  { name: "Alberta", strengths: "Oil & gas (3rd largest reserves globally), agriculture (beef, grain), low taxes (no PST), petrochemicals, growing tech sector (Calgary)", population: "4.8M", gdp: "$380B", keyIssue: "Economic diversification beyond oil, boom-bust cycles, water scarcity in south, interprovincial tensions" },
  { name: "Saskatchewan", strengths: "Potash (30% of world supply), uranium (richest deposits on Earth), agriculture (wheat, canola, lentils), oil", population: "1.2M", gdp: "$90B", keyIssue: "Population retention, Indigenous reconciliation, infrastructure for remote communities" },
  { name: "Manitoba", strengths: "Hydroelectric power (exports to US), agriculture (grain, canola), aerospace manufacturing (Magellan), insurance industry (Great-West)", population: "1.5M", gdp: "$85B", keyIssue: "Winnipeg infrastructure, northern communities, flooding risk" },
  { name: "Ontario", strengths: "Manufacturing hub (auto, aerospace, food processing), financial services (Toronto = Bay Street), tech (Ottawa, Toronto-Waterloo), agriculture, nuclear power, mining (Sudbury nickel, Ring of Fire)", population: "15.8M", gdp: "$980B", keyIssue: "Housing crisis (GTA), manufacturing decline, healthcare wait times, Ring of Fire development stalled" },
  { name: "Quebec", strengths: "Hydroelectric (95%+ of electricity from hydro — cheapest in North America), aerospace (Bombardier, CAE), AI research (MILA, Yoshua Bengio), culture/media, mining, aluminum smelting, gaming (Ubisoft)", population: "8.9M", gdp: "$505B", keyIssue: "Language politics, infrastructure decay (bridges, roads), immigration integration, manufacturing decline" },
  { name: "New Brunswick", strengths: "Irving refinery (largest in Canada), forestry, bilingual workforce, growing tech (Fredericton), tidal energy potential (Bay of Fundy)", population: "0.8M", gdp: "$45B", keyIssue: "Irving family concentration of economic power, population aging, healthcare access, youth outmigration" },
  { name: "Nova Scotia", strengths: "Military (Halifax = Atlantic naval base), ocean technology, fisheries (lobster), universities (Dalhousie), renewable energy potential (offshore wind, tidal)", population: "1.1M", gdp: "$55B", keyIssue: "Population aging, healthcare crisis, housing costs rising fast (Halifax), rural decline" },
  { name: "Prince Edward Island", strengths: "Agriculture (potatoes — 25% of Canadian production), tourism, fisheries, wind energy", population: "0.17M", gdp: "$8.5B", keyIssue: "Climate change vulnerability (erosion, storms), housing crisis (unexpected), population boom straining infrastructure" },
  { name: "Newfoundland & Labrador", strengths: "Offshore oil (Hibernia, Terra Nova), hydroelectric (Churchill Falls — controversial contract with Quebec), fisheries, minerals (Voisey's Bay nickel)", population: "0.5M", gdp: "$40B", keyIssue: "Oil dependency, Churchill Falls contract expires 2041 (massive revenue opportunity), population decline, outmigration" },
  { name: "Yukon", strengths: "Mining (gold, copper, zinc), tourism, wilderness, renewable energy potential", population: "0.045M", gdp: "$3.5B", keyIssue: "Infrastructure, permafrost thaw from climate change, Indigenous self-governance" },
  { name: "Northwest Territories", strengths: "Diamonds (Diavik, Ekati), rare earth minerals, Arctic sovereignty, natural gas", population: "0.045M", gdp: "$5B", keyIssue: "Mine closures, infrastructure costs, climate change, devolution of powers" },
  { name: "Nunavut", strengths: "Arctic sovereignty, mining potential, fisheries, Inuit culture and governance", population: "0.04M", gdp: "$3B", keyIssue: "Food insecurity (highest in Canada), housing crisis, infrastructure, education, mental health" },
]

// ────────────────────────────────────────────
// The independence roadmap
// ────────────────────────────────────────────
const ROADMAP = [
  {
    phase: "Phase 1: Secure the Essentials (Years 1-3)",
    items: [
      "National water sovereignty legislation — classify water as public trust, not tradeable commodity",
      "Strategic food reserve (Canada has none — most nations keep 3-6 month reserves)",
      "Domestic pharmaceutical manufacturing — start with generics and critical medications (antibiotics, insulin, ICU drugs)",
      "East-west energy corridor — so Atlantic Canada stops importing Saudi oil while Alberta has a surplus",
      "Emergency semiconductor stockpile — 6-month buffer of critical chips for medical, military, and infrastructure systems",
    ],
  },
  {
    phase: "Phase 2: Build Domestic Capacity (Years 3-7)",
    items: [
      "Refining expansion — process Canadian oil in Canada, not in US Gulf Coast refineries",
      "Battery manufacturing (EV supply chain) — mine lithium in Quebec/Ontario, process domestically, build batteries here",
      "Rare earth processing — break China's monopoly by processing Canadian rare earth deposits domestically",
      "Nuclear expansion (SMRs) — Ontario and Saskatchewan pursuing small modular reactors. Clean, reliable, Canadian-designed",
      "Mass timber manufacturing — replace imported steel and concrete with domestic engineered wood for construction",
      "Defence spending to 2% GDP — with emphasis on Arctic sovereignty, naval capability, and domestic manufacturing",
      "Broadband to every community — rural and Indigenous communities need connectivity for economic participation",
    ],
  },
  {
    phase: "Phase 3: Value-Added Economy (Years 7-15)",
    items: [
      "Stop exporting raw and importing finished: process wheat into flour → bread. Mine nickel → make batteries. Grow canola → refine oil",
      "AI and tech sovereignty — leverage world-class AI research (Hinton, Bengio, Sutskever all trained in Canada) into domestic industry instead of exporting talent to the US",
      "Trade diversification — reduce 75% US dependency to 55% by expanding trade with EU, Japan, South Korea, India, UK",
      "Housing as infrastructure — build 500K+ homes per year (current pace is 200K). Zoning reform nationally. Purpose-built rental. Social housing",
      "Arctic development — deep-water ports, year-round shipping through Northwest Passage, sovereignty infrastructure, resource development with Indigenous partnership",
      "Interprovincial trade reform — remove internal trade barriers (it's easier to trade with the US than between provinces in some cases)",
      "Immigration aligned with capacity — match immigration levels to housing, healthcare, and infrastructure capacity rather than arbitrary targets",
    ],
  },
  {
    phase: "Phase 4: True Sovereignty (Years 15-25)",
    items: [
      "Energy exporter with processed products — not crude oil, but refined fuels, electricity, hydrogen, and batteries",
      "Food exporter with processed products — not wheat, but flour, bread, pasta, packaged goods. Not canola seed, but cooking oil",
      "Technology exporter — AI, quantum computing, cybersecurity, clean tech",
      "Military capable of independent Arctic defence and North American contribution without dependency",
      "Housing affordable at 3-4x income nationally (from current 8-13x)",
      "Healthcare self-sufficient — domestic pharmaceutical manufacturing, medical equipment production, sufficient healthcare workers",
      "Every Canadian community with clean water, broadband, and basic infrastructure — including the 30+ Indigenous communities currently under boil water advisories",
      "A country that could sustain itself in a worst-case scenario — not isolated, but independent enough that no single trade disruption creates a crisis",
    ],
  },
]

// ────────────────────────────────────────────
// Trade dependency data
// ────────────────────────────────────────────
const TRADE = [
  { partner: "United States", exports: "75%", imports: "49%", risk: "Single point of failure. One tariff decision affects 75% of Canadian exports. CUSMA renegotiation in 2026 adds uncertainty." },
  { partner: "China", exports: "4%", imports: "14%", risk: "Imports 14% from China — mostly manufactured goods, electronics, machinery. Diplomatic tensions (Meng Wanzhou, Huawei 5G ban, Uyghur sanctions) make this relationship volatile." },
  { partner: "European Union", exports: "6%", imports: "11%", risk: "CETA (trade agreement) is underutilized. Natural diversification partner but cultural and regulatory differences slow growth." },
  { partner: "Japan", exports: "2%", imports: "3%", risk: "Stable partner. CPTPP provides framework. Room to grow significantly." },
  { partner: "United Kingdom", exports: "3%", imports: "2%", risk: "Post-Brexit trade deal opportunity. Historical and cultural ties support deeper trade." },
]

export default function CanadaPage() {
  const [expandedAsset, setExpandedAsset] = useState<number | null>(0)
  const [expandedDep, setExpandedDep] = useState<number | null>(null)
  const [expandedProvince, setExpandedProvince] = useState<number | null>(null)
  const [section, setSection] = useState<"assets" | "dependencies" | "provinces" | "roadmap" | "trade">("assets")

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700">
            <Globe2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada Sovereignty Report</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          What Canada has, what it lacks, and a practical roadmap to independence. Province by province, sector by sector.
        </p>
      </div>

      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-red-900 mb-2">Why This Matters</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada has more natural resources per capita than almost any nation on Earth — water, energy, minerals,
            farmland, timber, coastline. Yet it imports most of its manufactured goods, medications, technology, and
            even refined fuel. It exports raw materials at low prices and imports finished products at high prices.
            This is a colonial economic model — and it makes Canada vulnerable to any disruption in trade, supply chains,
            or geopolitics. This report maps the reality and outlines what genuine self-sufficiency would look like.
            Not isolation — independence. A country that trades by choice, not by necessity.
          </p>
        </CardContent>
      </Card>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {[
          { key: "assets", label: "Strategic Assets" },
          { key: "dependencies", label: "Dependencies" },
          { key: "provinces", label: "Provinces" },
          { key: "trade", label: "Trade" },
          { key: "roadmap", label: "Roadmap" },
        ].map(t => (
          <button key={t.key} onClick={() => setSection(t.key as any)}
            className={cn("px-3 py-2 text-xs font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
              section === t.key ? "border-red-500 text-red-700" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>{t.label}</button>
        ))}
      </div>

      {/* ASSETS */}
      {section === "assets" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Canada's advantages that most Canadians don't fully appreciate:</p>
          {ASSETS.map((a, i) => {
            const Icon = a.icon
            const isOpen = expandedAsset === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedAsset(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", a.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{a.resource}</p>
                      <p className="text-xs text-muted-foreground">{a.stat}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-3 pl-13">
                      <ul className="space-y-1.5">
                        {a.details.map((d, j) => (
                          <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                            <span className="text-emerald-400 shrink-0">-</span><span>{d}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-2.5">
                        <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">Self-Sufficiency</p>
                        <p className="text-xs text-emerald-700">{a.selfSufficiency}</p>
                      </div>
                      <div className="rounded-lg bg-blue-50/50 border border-blue-200 p-2.5">
                        <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider mb-0.5">Action Required</p>
                        <p className="text-xs text-blue-700">{a.action}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* DEPENDENCIES */}
      {section === "dependencies" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Where Canada cannot sustain itself — the vulnerabilities that need fixing:</p>
          {DEPENDENCIES.map((d, i) => {
            const Icon = d.icon
            const isOpen = expandedDep === i
            return (
              <Card key={i} className={cn("card-hover cursor-pointer",
                d.risk === "CRITICAL" ? "border-red-200" : "border-amber-200"
              )} onClick={() => setExpandedDep(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-red-400 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{d.sector}</p>
                        <Badge variant="outline" className={cn("text-[9px]",
                          d.risk === "CRITICAL" ? "text-red-500 border-red-300" : "text-amber-600 border-amber-300"
                        )}>{d.risk}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{d.dependency} — from {d.from}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-8">
                      <p className="text-xs text-muted-foreground leading-relaxed">{d.details}</p>
                      <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-2.5">
                        <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">Solution</p>
                        <p className="text-xs text-emerald-700">{d.solution}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* PROVINCES */}
      {section === "provinces" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Each province brings unique strengths — together they cover almost every need:</p>
          {PROVINCES.map((p, i) => {
            const isOpen = expandedProvince === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedProvince(isOpen ? null : i)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{p.name}</p>
                        <span className="text-[10px] text-muted-foreground">{p.population} · ${p.gdp} GDP</span>
                      </div>
                    </div>
                    <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-2 pl-7 space-y-1.5">
                      <p className="text-xs text-muted-foreground"><strong>Strengths:</strong> {p.strengths}</p>
                      <p className="text-xs text-amber-700"><strong>Key challenge:</strong> {p.keyIssue}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* TRADE */}
      {section === "trade" && (
        <div className="space-y-3">
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>The 75% problem:</strong> Canada sends 75% of its exports to one country. No other G7 nation has this
                level of trade concentration. If the US imposes tariffs, changes trade policy, or enters a recession,
                Canada has almost no alternative. Diversification is not anti-American — it is basic risk management.
              </p>
            </CardContent>
          </Card>
          {TRADE.map((t, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{t.partner}</p>
                  <div className="flex gap-3 text-xs">
                    <span className="text-emerald-600">Exports: {t.exports}</span>
                    <span className="text-blue-600">Imports: {t.imports}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.risk}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ROADMAP */}
      {section === "roadmap" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">A practical 25-year path from dependency to sovereignty. Not isolation — independence by choice.</p>
          {ROADMAP.map((phase, i) => (
            <Card key={i} className={cn(i === ROADMAP.length - 1 ? "border-emerald-200 bg-emerald-50/10" : "")}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    i === ROADMAP.length - 1 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  )}>{i + 1}</div>
                  <p className="text-sm font-semibold">{phase.phase}</p>
                </div>
                <ul className="space-y-1.5 pl-11">
                  {phase.items.map((item, j) => (
                    <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <ArrowRight className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sources */}
      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> Natural Resources Canada, Statistics Canada, Global Affairs Canada, Canadian Energy Regulator,
            Agriculture and Agri-Food Canada, Fisheries and Oceans Canada, Department of National Defence,
            Bank of Canada, CMHC, provincial government data. Trade data from Industry Canada and WTO.
            This report presents publicly available data and proposes strategies — it does not endorse any political party
            or ideology. Self-sufficiency is not left or right — it is common sense.
          </p>
        </CardContent>
      </Card>

      <AletheiaConnection topic="sovereignty" />

      <div className="flex gap-3 flex-wrap">
        <a href="/civilizations" className="text-sm text-amber-600 hover:underline">Civilizations</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
        <a href="/education/economics" className="text-sm text-emerald-600 hover:underline">Economics Education</a>
        <a href="/governance" className="text-sm text-blue-600 hover:underline">Governance</a>
      </div>
    </div>
  )
}
