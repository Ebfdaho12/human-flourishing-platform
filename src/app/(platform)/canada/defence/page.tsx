"use client"

import { useState } from "react"
import {
  Shield, Swords, Ship, Globe2, AlertTriangle, ArrowRight, ChevronDown,
  DollarSign, Users, MapPin, Target
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"
import { AletheiaConnection } from "@/components/AletheiaConnection"

const CURRENT_STATE = [
  { metric: "Defence spending (% GDP)", canada: "1.3%", natoTarget: "2.0%", usSpending: "3.5%", gap: "$15B+/year below NATO target", verdict: "FAILING" },
  { metric: "Active military personnel", canada: "68,000", target: "100,000+", note: "Cannot fill existing positions. 10,000+ vacancies. Recruitment at lowest level in decades.", verdict: "CRISIS" },
  { metric: "Navy — major surface combatants", canada: "12 frigates (Halifax-class, avg age 30+)", target: "15 new CSC ships (delivery: 2030s-2040s)", note: "Oldest frigates in any NATO navy. Replacement 15+ years behind schedule.", verdict: "FAILING" },
  { metric: "Air Force — fighter jets", canada: "77 CF-18s (designed 1978, acquired 1982)", target: "88 F-35s (delivery: 2026-2032)", note: "Took 20+ YEARS to decide on a replacement. CF-18s are the oldest fighters in any NATO air force.", verdict: "FAILING" },
  { metric: "Army — main battle tanks", canada: "82 Leopard 2 tanks", target: "Adequate for current commitments", note: "Functional but limited. Canada cannot sustain a major ground operation independently.", verdict: "ADEQUATE" },
  { metric: "Arctic presence", canada: "1 military base (Alert), few patrol vessels", target: "Deep-water ports, radar chain, permanent presence", note: "Canada's Arctic is functionally undefended. Russia has 40+ Arctic military bases. Canada has 1.", verdict: "CRISIS" },
  { metric: "Procurement timeline", canada: "15-25 years average", target: "5-8 years (peer countries)", note: "Fighter jets: 20 years. Ships: 15 years and counting. Every major project is over budget and behind schedule.", verdict: "FAILING" },
  { metric: "NORAD modernization", canada: "Aging radar + sensor network", target: "$40B over 20 years (committed 2022)", note: "North Warning System is 1980s technology. Cannot detect modern threats (cruise missiles, hypersonic weapons). Modernization finally committed but will take 15+ years.", verdict: "IN PROGRESS" },
]

const WHY_IT_MATTERS = [
  {
    threat: "Arctic Sovereignty",
    icon: MapPin,
    urgency: "CRITICAL",
    details: "Russia has 40+ military bases above the Arctic Circle. China declared itself a 'near-Arctic state' and is building icebreakers. Denmark (via Greenland) and the US have competing claims. The Northwest Passage — which will become a major shipping route as ice retreats — passes through waters Canada claims but cannot patrol. If you cannot defend territory, you do not control it. Period.",
    whatNeeded: "Deep-water port at Nanisivik (construction stalled). Permanent military bases at Resolute Bay and Inuvik. Arctic-capable patrol vessels (6-8 Harry DeWolf-class are being built — good start). Year-round surveillance (satellite + drone + radar). Indigenous Rangers expanded and supported (they are the best Arctic operators Canada has).",
  },
  {
    threat: "Continental Defence (NORAD)",
    icon: Shield,
    urgency: "HIGH",
    details: "NORAD is jointly operated with the US — Canada could not defend its own airspace alone. The North Warning System (radar chain across the Arctic) uses 1980s technology that cannot detect modern cruise missiles or hypersonic weapons. Canada committed $40B to NORAD modernization in 2022 but has not specified timelines or capabilities. The US is increasingly frustrated with Canada's underinvestment.",
    whatNeeded: "Modern over-the-horizon radar. Satellite-based surveillance. Upgraded interceptor capability. This is not optional — if Canada cannot contribute meaningfully to continental defence, the US will fill the gap and Canadian sovereignty over its own airspace diminishes.",
  },
  {
    threat: "Recruitment Crisis",
    icon: Users,
    urgency: "CRITICAL",
    details: "The Canadian Armed Forces cannot recruit enough people. 10,000+ positions unfilled. Recruitment is at its lowest level in decades. Why: military pay is not competitive with civilian alternatives, housing on bases is often substandard, the bureaucracy is stifling, and the culture has been damaged by sexual misconduct scandals. Young Canadians do not see the military as an attractive career.",
    whatNeeded: "Competitive pay (match civilian equivalents + danger/deployment premiums). Fix base housing (many military families live in mold-infested quarters). Fast-track citizenship for immigrants who serve (the French Foreign Legion model — serve 5 years, become a citizen). Post-service benefits: free university, housing assistance, guaranteed government job placement. Make military service a genuine path to a better life.",
  },
  {
    threat: "Procurement Disaster",
    icon: DollarSign,
    urgency: "HIGH",
    details: "Canadian military procurement is the worst in NATO. Examples: fighter jet replacement took 20 years. The Canadian Surface Combatant (CSC) program — 15 frigates to replace the Halifax class — was announced in 2008. First delivery is not expected until 2030s. Original cost estimate: $26B. Current estimate: $77-80B+. Every project follows the same pattern: years of study, political interference, cost overruns, and delays.",
    whatNeeded: "Single-source procurement for proven platforms (buy what allies already use instead of 10-year competitions). Independent procurement agency (remove political interference). Penalty clauses in contracts (Irving Shipbuilding's CSC contract has minimal consequences for delays). Accept 'good enough' equipment delivered on time over 'perfect' equipment delivered 15 years late.",
  },
  {
    threat: "Cyber & Information Warfare",
    icon: Globe2,
    urgency: "HIGH",
    details: "Cyber attacks on Canadian infrastructure are increasing. Russia, China, and criminal organizations target government systems, critical infrastructure (power grids, water systems, financial networks), and democratic institutions (election interference). The Communications Security Establishment (CSE) exists but is under-resourced relative to the threat. Canada has no offensive cyber capability comparable to the US Cyber Command or UK GCHQ.",
    whatNeeded: "Triple CSE funding. Establish a Canadian Cyber Command with offensive capability (not just defence). Mandatory cybersecurity standards for critical infrastructure operators (power, water, telecom, banking). Cyber reservist program — recruit private-sector tech talent for part-time national security roles.",
  },
]

const WHAT_2_PERCENT_BUYS = [
  "Current spending: ~$36B/year. At 2%: ~$56B/year. Difference: $20B/year additional.",
  "8 new Arctic patrol vessels + 2 deep-water ports + year-round Arctic surveillance = ~$8B over 10 years ($800M/year)",
  "NORAD modernization (Canada's share): $40B over 20 years ($2B/year)",
  "Recruitment incentive package (housing, pay, benefits): ~$3B/year",
  "Cyber Command establishment: ~$1B/year",
  "Equipment maintenance + ammunition stockpile (depleted after donations to Ukraine): ~$2B/year",
  "Naval fleet expansion (additional corvettes, submarines): ~$5B/year",
  "Domestic defence manufacturing (create Canadian jobs instead of buying foreign): ~$6B/year",
  "Total allocated: ~$20B/year = exactly the gap between current spending and 2% target. The money buys real capability — not bureaucracy.",
]

const DOMESTIC_INDUSTRY = [
  { company: "Irving Shipbuilding (Halifax)", builds: "Harry DeWolf-class patrol vessels, future CSC frigates", value: "$60B+ in contracts", issue: "Chronic delays and cost overruns. Monopoly position means no competitive pressure. But: employs 8,000+ in Atlantic Canada." },
  { company: "General Dynamics Land Systems (London, ON)", builds: "LAV armoured vehicles", value: "$15B Saudi LAV contract (controversial)", issue: "World-class LAV manufacturer. Exports globally. One of the few Canadian defence success stories." },
  { company: "CAE (Montreal)", builds: "Flight simulators, training systems", value: "World's largest simulator manufacturer", issue: "Global leader in military simulation/training. Canadian technology used by 50+ air forces. Under-leveraged domestically." },
  { company: "Bombardier Defence (multiple)", builds: "Surveillance aircraft (Global Eye for UAE)", value: "Growing defence division", issue: "Has the platform (Global Express) for surveillance/reconnaissance aircraft. Canada should buy Canadian for patrol aircraft." },
  { company: "MDA (Vancouver)", builds: "Canadarm, satellite systems, radar", value: "Space and defence technology", issue: "Built Canadarm 1&2 for NASA/ISS. RADARSAT satellites for surveillance. Critical for Arctic monitoring. Underinvested by government." },
]

export default function CanadaDefencePage() {
  const [expandedThreat, setExpandedThreat] = useState<number | null>(null)
  const [show2Pct, setShow2Pct] = useState(false)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-red-800">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada's Military & Defence</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The honest state of Canada's ability to defend itself. Spoiler: it cannot.
        </p>
      </div>

      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-red-900 mb-2">The Reality</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada has the <strong>2nd largest country by land area</strong>, the <strong>longest coastline on Earth</strong> (243,042 km),
            and borders <strong>three oceans</strong>. It spends <strong>1.3% of GDP</strong> on defence — the 2nd lowest in NATO. It cannot
            patrol its own Arctic. Its fighter jets are 40+ years old. Its frigates are 30+ years old. It cannot recruit
            enough soldiers to fill existing positions. Equipment procurement takes 15-25 years. If Canada had to defend
            itself without the US, it could not. That is not an opinion — it is the assessment of every military analyst
            who has studied the question.
          </p>
        </CardContent>
      </Card>

      {/* Current state */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Current State Report Card</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {CURRENT_STATE.map((s, i) => (
            <div key={i} className={cn("rounded-lg border p-2.5",
              s.verdict === "CRISIS" ? "border-red-200 bg-red-50/10" :
              s.verdict === "FAILING" ? "border-amber-200 bg-amber-50/10" : "border-border"
            )}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium">{s.metric}</span>
                <Badge variant="outline" className={cn("text-[9px]",
                  s.verdict === "CRISIS" ? "text-red-500 border-red-300" :
                  s.verdict === "FAILING" ? "text-amber-600 border-amber-300" :
                  s.verdict === "IN PROGRESS" ? "text-blue-600 border-blue-300" :
                  "text-emerald-600 border-emerald-300"
                )}>{s.verdict}</Badge>
              </div>
              <div className="flex gap-3 text-[10px] text-muted-foreground">
                <span>Canada: <strong>{s.canada}</strong></span>
                {"natoTarget" in s && <span>NATO target: <strong>{s.natoTarget}</strong></span>}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Why it matters */}
      <div>
        <h2 className="text-lg font-bold mb-3">5 Threats Canada Cannot Currently Address</h2>
        <div className="space-y-3">
          {WHY_IT_MATTERS.map((t, i) => {
            const Icon = t.icon
            const isOpen = expandedThreat === i
            return (
              <Card key={i} className={cn("card-hover cursor-pointer",
                t.urgency === "CRITICAL" ? "border-red-200" : "border-amber-200"
              )} onClick={() => setExpandedThreat(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5 shrink-0",
                      t.urgency === "CRITICAL" ? "text-red-500" : "text-amber-500"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t.threat}</p>
                      <Badge variant="outline" className={cn("text-[9px]",
                        t.urgency === "CRITICAL" ? "text-red-500 border-red-300" : "text-amber-600 border-amber-300"
                      )}>{t.urgency}</Badge>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-8">
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.details}</p>
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                        <p className="text-xs text-emerald-700"><strong>What is needed:</strong> {t.whatNeeded}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* What 2% buys */}
      <Card className="cursor-pointer" onClick={() => setShow2Pct(!show2Pct)}>
        <CardContent className="p-4 flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-emerald-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold">What 2% GDP Actually Buys</p>
            <p className="text-[10px] text-muted-foreground">$20B/year additional — here is where every dollar goes</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", show2Pct && "rotate-180")} />
        </CardContent>
      </Card>
      {show2Pct && (
        <Card className="border-emerald-200">
          <CardContent className="p-4 space-y-1.5">
            {WHAT_2_PERCENT_BUYS.map((item, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                <ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /><span>{item}</span>
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Domestic industry */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Swords className="h-5 w-5 text-slate-500" /> Canadian Defence Industry
        </h2>
        <p className="text-xs text-muted-foreground mb-3">Build it here. The money stays in Canada. The jobs stay in Canada. The capability stays in Canada.</p>
        <div className="space-y-2">
          {DOMESTIC_INDUSTRY.map((d, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{d.company}</p>
                  <Badge variant="outline" className="text-[9px]">{d.value}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-0.5"><strong>Builds:</strong> {d.builds}</p>
                <p className="text-[10px] text-muted-foreground">{d.issue}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-2 border-slate-200 bg-slate-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-slate-900 mb-2">The Bottom Line</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A country that cannot defend itself is not sovereign — it is a protectorate. Canada has lived under
            the US security umbrella for 80 years and built an identity around peacekeeping and soft power.
            That works when the world is stable. The world is not stable. Russia invaded Ukraine. China is
            militarizing the South China Sea and eyeing the Arctic. Cyberthreats target Canadian infrastructure
            daily. Canada either invests in its own defence or accepts that its sovereignty depends entirely on
            the goodwill of the United States. That goodwill is not guaranteed — and it has already been tested.
          </p>
        </CardContent>
      </Card>

      <AletheiaConnection topic="defence military" />

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/spending" className="text-sm text-amber-600 hover:underline">Government Spending</a>
        <a href="/canada/water" className="text-sm text-blue-600 hover:underline">Water Security</a>
        <a href="/canada/trajectories" className="text-sm text-emerald-600 hover:underline">Trajectories</a>
      </div>
    </div>
  )
}
