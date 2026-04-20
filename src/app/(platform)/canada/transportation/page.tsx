"use client"

import { useState } from "react"
import { Train, ChevronDown, AlertTriangle, Globe } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const TRANSIT_CITIES = [
  {
    city: "Toronto (TTC)",
    status: "Crisis",
    statusColor: "bg-red-100 text-red-800",
    summary: "Oldest subway in Canada. Line 1 runs at 130%+ capacity during peak hours. Toronto has fewer subway stations per capita than cities half its size. A city of 6 million operates roughly the same subway footprint as cities of 1–2 million in Europe and Asia.",
    detail: "The Eglinton Crosstown LRT: began construction in 2011, was supposed to open in 2022, remains unfinished as of 2024 — over $3 billion in cost overruns, a decade late, the contractor (Crosslinx) in legal disputes with Metrolinx. Scarborough Subway Extension: approved after 30 years of debate, under construction. Ontario Line: the one intelligent piece of new planning — a relief line that does what should have been built in 1980. TTC buses: chronically crowded, slow, no dedicated bus lanes on most routes.",
    why: "Toronto's transit failures come from: (1) political decisions favouring suburban car voters over urban transit users, (2) the provincial government controlling transit funding and forcing suburban-style decisions on an urban network, (3) no regional transit authority with actual authority — Metrolinx plans but doesn't operate, TTC operates but doesn't plan, municipalities fight over jurisdiction, (4) procurement costs 3–5x higher per km than comparable cities.",
  },
  {
    city: "Vancouver (SkyTrain / TransLink)",
    status: "Best in Canada",
    statusColor: "bg-emerald-100 text-emerald-800",
    summary: "Canada's best-run rapid transit system. SkyTrain is fully automated, frequent (every 3 minutes peak), and has driven high-density transit-oriented development along every corridor. SeaBus connects Vancouver and North Vancouver efficiently.",
    detail: "Ridership fully recovered post-COVID and is growing. The Broadway Subway (Millennium Line extension to Arbutus and eventually UBC) is under active construction. SkyTrain achieved something rare: it made transit the dominant mode in key corridors — people choose the train over driving. The TransLink governance model (elected mayors and a professional board) has outperformed the Ontario model significantly.",
    why: "Vancouver succeeded because: (1) transit-oriented land use policies let density follow the lines, (2) governance is regional rather than fragmented, (3) fare gates and modern proof-of-payment reduced evasion, (4) automated trains allow higher frequency at lower operating cost, (5) political consensus across parties on transit investment.",
  },
  {
    city: "Montréal (STM Metro)",
    status: "Underinvested",
    statusColor: "bg-yellow-100 text-yellow-800",
    summary: "Four lines, 68 stations, rubber-tired trains (unique in North America). The network is excellent within its coverage area but hasn't significantly expanded since the 1980s. The REM (Réseau express métropolitain) is a new automated light-metro network being built by the Caisse de dépôt.",
    detail: "The REM is transformative — connecting downtown Montreal to the South Shore, West Island, and eventually the airport. A first phase (South Shore) opened 2023. However, the REM's operator (CDPQ Infra, an arm of the Quebec pension fund) has caused controversy: it runs trains on a hybrid model where it needs fare revenue to be profitable, creating tension with integrating with STM. The Blue Line extension (Anjou extension) is approved but financing remains uncertain.",
    why: "Montreal's strength: French-language planning culture borrowed heavily from Paris models. Weakness: funding uncertainty at provincial level, unclear future for the Blue Line, and an aging fleet in the STM that needs significant investment.",
  },
  {
    city: "Ottawa (OC Transpo / O-Train)",
    status: "Cautionary tale",
    statusColor: "bg-red-100 text-red-800",
    summary: "Ottawa's LRT (Confederation Line) has been a disaster. Opened 2019, it was plagued by derailments, wheel failures, software glitches, and poor weather performance. A public inquiry concluded in 2023 that the City of Ottawa and its contractor (RTG/Alstom) prioritized cost-cutting over quality.",
    detail: "The inquiry found the city knew about defects before launch and launched anyway. Political pressure to 'get it done' overrode engineering concerns. The system has improved since 2022 but still underperforms. Stage 2 (extension east, west, and south) is under construction. Ottawa's LRT experience is now a case study in what not to do in transit procurement: low-bid selection, inadequate testing, political interference in technical decisions, and a procurement contract that didn't adequately protect the public.",
    why: "Ottawa failed because: (1) the contract was awarded to the lowest bidder despite concerns, (2) the testing period was inadequate, (3) accountability was diffused across the city, Rideau Transit Group, Alstom, and the province, making no one fully responsible, (4) political pressure overrode engineering sign-off.",
  },
]

const INTERCITY_RAIL = [
  {
    route: "Toronto–Montréal (Via Rail)",
    distance: "540 km",
    current: "5+ hours, $50–180+, 4–5 trains/day. Often late. Runs on CN/CP freight tracks — freight has priority.",
    shouldBe: "3 hours on dedicated high-speed rail. Paris–Lyon is 514 km in 2 hours. Tokyo–Osaka is 503 km in 2:15. There is no technical reason this route cannot be done in 3 hours.",
    barrier: "Canada does not own the tracks. Via Rail pays to use freight tracks where freight trains have legal priority. Dedicated passenger rail infrastructure has been discussed for 40 years. A 2021 federal proposal (HFR — High Frequency Rail) proposed dedicated tracks but not true high speed. In 2024, a new HFR Crown corporation was created. Target: early 2030s for improved service.",
  },
  {
    route: "Toronto–Ottawa",
    distance: "450 km",
    current: "4:30–5 hours. Slower than driving in good traffic. Runs on the same shared freight tracks with similar reliability problems.",
    shouldBe: "2:30 or less on dedicated tracks. Ottawa is Canada's capital — it is embarrassing that the rail connection to the country's largest city takes longer than driving.",
    barrier: "Same as Toronto–Montréal: no dedicated infrastructure. HFR would fix this. Political will exists on paper; funding and timeline are uncertain.",
  },
  {
    route: "Vancouver–Seattle (Amtrak Cascades)",
    distance: "230 km",
    current: "4 hours. Cross-border rail is slow, with border processing adding time. Demand is high.",
    shouldBe: "1:30–2 hours on upgraded track. Washington State is investing in Cascades corridor improvements. Canada's BC section has had no significant investment.",
    barrier: "Cross-border coordination, funding split between Canadian and US governments, and lower political priority relative to domestic routes.",
  },
]

const HIGHWAY = [
  { topic: "Highway 401 (Toronto)", detail: "The 401 through Toronto is the busiest highway in North America — 500,000 vehicles/day at peak points. It is fundamentally at capacity and cannot be meaningfully widened (induced demand means adding lanes fills them immediately). The solution is transit alternatives, not more lanes. This is one of the best-documented cases of induced demand in urban planning." },
  { topic: "Trans-Canada Highway", detail: "Still two-lane through many sections, including significant parts of northern Ontario. Dangerous: single-vehicle accidents and head-on collisions are a chronic problem. Many northern communities rely on it as the only overland route." },
  { topic: "Infrastructure funding gap", detail: "The Federation of Canadian Municipalities estimates Canada's core infrastructure deficit at $120+ billion. Roads and bridges are aging. The federal Investing in Canada Infrastructure Program (ICIP) provides funding but is oversubscribed and often delayed." },
]

const INTERNATIONAL = [
  { country: "Japan (Shinkansen)", lesson: "Opened 1964. Tokyo–Osaka (515 km) in 2:15 at 285 km/h. Network spans the entire country. Punctuality: average delay under 1 minute over a 60-year history. Built by a Crown corporation on dedicated tracks with full government investment in infrastructure." },
  { country: "France (TGV)", lesson: "Paris to Lyon (427 km) in 2 hours. Paris to Bordeaux (579 km) in 2:04. The TGV transformed France — it shifted domestic air travel to rail on most corridors under 3 hours. Key: the French state owns the tracks (SNCF Réseau) and the trains operate on that infrastructure." },
  { country: "Spain (AVE)", lesson: "Madrid to Barcelona (625 km) in 2:30. Spain built one of the most extensive high-speed networks in the world starting in 1992. Now has more high-speed rail km than any other European country. Key: Spain was willing to build the infrastructure before demand justified it — the 'build it and they will come' approach worked." },
  { country: "Netherlands", lesson: "A country smaller than Nova Scotia with more transit trips per capita than any other nation. 100% of intercity trains are electric. Urban cycling infrastructure has eliminated the need for cars for millions of trips. The key lesson: this required sustained political commitment over 50 years, not a single project." },
]

export default function TransportationPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700">
            <Train className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada Transportation</h1>
        </div>
        <p className="text-sm text-muted-foreground">Transit by city, intercity rail (and why it underperforms), highway infrastructure, and what countries that get this right actually do differently.</p>
      </div>

      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-semibold text-blue-900">The central problem: Canada builds transit like it's embarrassed about transit</p>
          <p className="text-sm text-blue-700 mt-1">Canadian cities cost 3–5x more per km to build subway than comparable cities in Europe, Asia, and even the US. Projects are routinely late, over budget, and underwhelming. The causes are structural: fragmented governance, lowest-bid procurement, political interference, and a planning culture that caters to suburban car users over urban transit riders. Meanwhile, Japan runs a 500 km/h train network with sub-1-minute average delays.</p>
        </CardContent>
      </Card>

      <div>
        <p className="text-sm font-semibold mb-3">Transit by City</p>
        <div className="space-y-2">
          {TRANSIT_CITIES.map((c, i) => {
            const key = `city-${i}`
            const isOpen = expanded === key
            return (
              <Card key={i} className="border">
                <CardContent className="pt-0 pb-0">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{c.city}</span>
                      <Badge className={cn("text-xs", c.statusColor)}>{c.status}</Badge>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="pb-4 border-t pt-3 space-y-3">
                      <p className="text-sm">{c.summary}</p>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Details</p>
                        <p className="text-sm text-muted-foreground">{c.detail}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Why?</p>
                        <p className="text-sm text-muted-foreground">{c.why}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <p className="text-sm font-semibold">Intercity Rail: Via Rail & HFR</p>
        </div>
        <div className="space-y-2">
          {INTERCITY_RAIL.map((r, i) => {
            const key = `rail-${i}`
            const isOpen = expanded === key
            return (
              <Card key={i} className="border">
                <CardContent className="pt-0 pb-0">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3 gap-2">
                    <div className="text-left">
                      <span className="text-sm font-semibold">{r.route}</span>
                      <span className="text-xs text-muted-foreground ml-2">{r.distance}</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="pb-3 pt-2 border-t space-y-2">
                      <p className="text-sm"><span className="font-medium">Current:</span> {r.current}</p>
                      <p className="text-sm text-emerald-800"><span className="font-medium">What it should be:</span> {r.shouldBe}</p>
                      <p className="text-sm text-muted-foreground"><span className="font-medium">The barrier:</span> {r.barrier}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">Highway Infrastructure</p>
        <div className="space-y-2">
          {HIGHWAY.map((h, i) => (
            <Card key={i} className="border">
              <CardContent className="pt-3 pb-3">
                <p className="text-sm font-semibold">{h.topic}</p>
                <p className="text-sm text-muted-foreground mt-1">{h.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-emerald-600" />
          <p className="text-sm font-semibold">What Other Countries Do Right</p>
        </div>
        <div className="space-y-2">
          {INTERNATIONAL.map((c, i) => {
            const key = `intl-${i}`
            const isOpen = expanded === key
            return (
              <Card key={i} className="border border-emerald-100">
                <CardContent className="pt-0 pb-0">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3">
                    <span className="text-sm font-semibold">{c.country}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && <p className="text-sm text-muted-foreground pb-3 pt-2 border-t">{c.lesson}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/canada" className="hover:underline text-foreground">Canada Overview</a>
        <a href="/canada/infrastructure" className="hover:underline text-foreground">Infrastructure</a>
        <a href="/canada/spending" className="hover:underline text-foreground">Federal Spending</a>
        <a href="/canada/vs-world" className="hover:underline text-foreground">Canada vs World</a>
      </div>
    </div>
  )
}
