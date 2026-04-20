"use client"

import { useState } from "react"
import { Landmark, ChevronDown, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const TIMELINE = [
  { era: "508 BCE", label: "Athenian Democracy", badge: "Ancient Greece", content: "Cleisthenes established the world's first democracy in Athens. Citizens (male, non-slave, Athenian-born) voted directly on laws in the Assembly (ekklesia). Served as jury members and filled public offices by lottery — deliberately preventing career politicians. Direct democracy at city-scale. Lasted ~180 years before Macedonian conquest." },
  { era: "27 BCE", label: "Roman Republic → Empire", badge: "Rome", content: "Rome's republican system (509–27 BCE) had elected consuls, a Senate, and representative assemblies. But wealth inequality, military loyalties to generals over the state, and concentrated power eroded the republic. Julius Caesar crossed the Rubicon in 49 BCE; Augustus became the first emperor in 27 BCE. The lesson: republics can collapse from within, through legal mechanisms, without a military coup." },
  { era: "1215", label: "Magna Carta", badge: "England", content: "English barons forced King John to sign the Magna Carta — the first formal limitation on royal power. Established that even the king was subject to law. Introduced habeas corpus (you can't be imprisoned without cause). Not a democracy, but a critical precedent: government is constrained by law, not just by force." },
  { era: "1640s", label: "English Civil War & Glorious Revolution", badge: "Britain", content: "Parliament fought the Crown for supremacy. Charles I was executed in 1649 — the first time subjects legally tried and executed their king. The Glorious Revolution (1688) established constitutional monarchy: Parliament became sovereign. The Bill of Rights (1689) protected parliamentary elections and free speech in Parliament. Democracy by incremental legal struggle." },
  { era: "1776–1789", label: "American & French Revolutions", badge: "Modern Democracy", content: "The American Revolution (1776) created the first modern constitutional democracy — separation of powers, elected legislature, protected rights. The French Revolution (1789) introduced radical popular sovereignty, but also showed how revolution can consume itself (Reign of Terror). Both spread democratic ideals globally and destabilized existing monarchies." },
  { era: "1800s–1900s", label: "Expansion of the Franchise", badge: "Inclusion", content: "Democracy's history is largely the history of who gets to vote. Property requirements fell first (1800s). Women gained suffrage: New Zealand 1893, UK 1918, Canada 1918 (white women; Indigenous women 1960), US 1920. Indigenous Canadians couldn't vote federally until 1960. South African apartheid ended in 1994. Universal suffrage is extremely new." },
  { era: "Post-1945", label: "Liberal Democratic Order", badge: "Modern Era", content: "Following WWII, a rules-based international order emerged: the UN, Universal Declaration of Human Rights (1948), NATO, and eventually the EU. The number of democracies grew from ~12 in 1945 to ~90+ by 2000. Freedom House tracked a democratic 'third wave' from the 1970s through 1990s. Since ~2006, that trend has reversed." },
]

const KILLERS = [
  { pattern: "1. Executive overreach", desc: "Leaders expanding power beyond constitutional limits — controlling courts, military, and media. Often happens through legal mechanisms, not coups. Seen in Hungary (Orbán), Turkey (Erdoğan), Venezuela (Chávez→Maduro)." },
  { pattern: "2. Polarization + norm erosion", desc: "When political opponents become enemies, informal norms that hold democracies together erode. Packing courts, refusing transitions of power, treating democratic losses as illegitimate. Levitsky & Ziblatt's 'How Democracies Die' (2018) documents this pattern." },
  { pattern: "3. Media capture", desc: "State or oligarchic control of media narratives. Citizens can't make informed democratic choices without reliable information. Can be overt (state media) or subtle (ownership concentration, algorithmic manipulation)." },
  { pattern: "4. Corruption that breeds cynicism", desc: "When citizens believe all politicians are corrupt, turnout drops, extremist alternatives become appealing, and democratic institutions lose legitimacy. Corruption is democracy's slow poison." },
  { pattern: "5. Economic inequality", desc: "Extreme inequality undermines democracy in two ways: wealthy elites capture political processes, and economically precarious citizens become susceptible to authoritarian populism that promises simple solutions." },
  { pattern: "6. Military or intelligence coup", desc: "The traditional democracy killer — but increasingly rare. More common today: elected leaders using military/police loyalty to entrench power. Internal democratic collapse dressed in legal clothes." },
  { pattern: "7. Foreign interference", desc: "External actors destabilizing democratic processes through disinformation, election interference, funding of extremist parties, or exploiting social divisions. More effective than invasion; harder to defend against." },
]

const TRENDS = {
  strengthening: [
    "Baltic states (Estonia, Latvia, Lithuania) — strong democratic resilience despite Russian pressure",
    "South Korea and Taiwan — high-quality democracies in a region with authoritarian neighbours",
    "Botswana — one of Africa's most stable democracies, several peaceful power transitions",
    "Canada and New Zealand — consistently high democracy indexes",
  ],
  weakening: [
    "Hungary — EU member that Freedom House now classifies as 'hybrid regime'",
    "India — world's largest democracy, significant democratic backsliding since 2014",
    "United States — polarization, norm erosion, and January 2021 unprecedented in modern American history",
    "Brazil — democratic backsliding under Bolsonaro (2019–22), partially recovered",
    "Philippines, Thailand, Myanmar — varying degrees of authoritarian drift",
  ],
}

export default function DemocracyHistoryPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showStrength, setShowStrength] = useState(true)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-700">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">History of Democracy</h1>
        </div>
        <p className="text-sm text-muted-foreground">From Athens to the present — how democracy was built, nearly lost, expanded, and is now being tested again.</p>
      </div>

      <Card className="border-2 border-indigo-200 bg-indigo-50/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-medium text-indigo-900">Key insight: Democracy is not the default. It is maintained.</p>
          <p className="text-sm text-indigo-700 mt-1">Of 115 democracies that existed in the 20th century, roughly 45% eventually collapsed. Democracy requires active participation, strong institutions, and citizens who understand what makes it fragile.</p>
        </CardContent>
      </Card>

      <div>
        <p className="text-sm font-semibold mb-3">The Timeline</p>
        <div className="space-y-2">
          {TIMELINE.map((item, i) => (
            <Card key={i} className="border">
              <CardContent className="pt-0 pb-0">
                <button onClick={() => setExpanded(expanded === `t-${i}` ? null : `t-${i}`)} className="w-full flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 text-left">
                    <Badge variant="secondary" className="text-xs shrink-0">{item.era}</Badge>
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", expanded === `t-${i}` && "rotate-180")} />
                </button>
                {expanded === `t-${i}` && <p className="pb-4 text-sm text-muted-foreground border-t pt-3">{item.content}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <p className="text-sm font-semibold">7 Patterns That Kill Democracies</p>
        </div>
        <div className="space-y-2">
          {KILLERS.map((item, i) => (
            <Card key={i} className="border">
              <CardContent className="pt-0 pb-0">
                <button onClick={() => setExpanded(expanded === `k-${i}` ? null : `k-${i}`)} className="w-full flex items-center justify-between py-3">
                  <span className="text-sm font-semibold text-left pr-4">{item.pattern}</span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", expanded === `k-${i}` && "rotate-180")} />
                </button>
                {expanded === `k-${i}` && <p className="pb-4 text-sm text-muted-foreground border-t pt-3">{item.desc}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">Where Democracy Stands Today</p>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setShowStrength(true)} className={cn("flex-1 text-sm py-2 rounded-lg font-medium border transition-all", showStrength ? "bg-emerald-500 text-white border-emerald-500" : "border-border")}>
            <TrendingUp className="h-3.5 w-3.5 inline mr-1" />Strengthening
          </button>
          <button onClick={() => setShowStrength(false)} className={cn("flex-1 text-sm py-2 rounded-lg font-medium border transition-all", !showStrength ? "bg-red-500 text-white border-red-500" : "border-border")}>
            <TrendingDown className="h-3.5 w-3.5 inline mr-1" />Weakening
          </button>
        </div>
        <div className="space-y-2">
          {(showStrength ? TRENDS.strengthening : TRENDS.weakening).map((item, i) => (
            <div key={i} className={cn("text-sm p-3 rounded-lg border", showStrength ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800")}>
              {item}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Source: Freedom House, V-Dem Institute annual democracy indexes</p>
      </div>

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/critical-thinking" className="hover:underline text-foreground">Critical Thinking</a>
        <a href="/propaganda" className="hover:underline text-foreground">Propaganda</a>
        <a href="/civilizations" className="hover:underline text-foreground">Civilizations</a>
        <a href="/rights" className="hover:underline text-foreground">Rights</a>
      </div>
    </div>
  )
}
