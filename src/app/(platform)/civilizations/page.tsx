"use client"

import { useState } from "react"
import {
  Globe2, Clock, TrendingUp, TrendingDown, AlertTriangle, Crown,
  Landmark, Coins, Swords, BookOpen, ChevronDown, ArrowRight,
  Scale, Shield, Skull, Sprout, Building2, Banknote, Eye
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ────────────────────────────────────────────
// The 6 stages every civilization goes through
// Based on Dalio, Glubb, Turchin, and historical pattern analysis
// ────────────────────────────────────────────
const STAGES = [
  {
    stage: 1,
    name: "New Order",
    icon: Sprout,
    color: "from-emerald-500 to-green-600",
    duration: "~50-80 years",
    characteristics: [
      "Power consolidates after war, revolution, or collapse of the previous order",
      "Strong leadership with a unifying vision",
      "Hard work, sacrifice, and shared purpose define the culture",
      "Debt is low, savings are high, people build real things",
      "Education is practical and valued — people learn skills that produce",
      "Social mobility is high — merit matters more than connections",
    ],
    historical: "Rome after the Republic formed (509 BC), America post-Revolution (1776), China after Mao's revolution (1949), Britain post-Glorious Revolution (1688)",
    modern: "Strong currency, productive industry, high trust in institutions, low inequality",
  },
  {
    stage: 2,
    name: "Rise & Building",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-600",
    duration: "~40-80 years",
    characteristics: [
      "Infrastructure, education, and institutions strengthen rapidly",
      "Innovation accelerates — inventions, trade routes, new industries",
      "Military grows to protect expanding trade and territory",
      "Middle class expands — prosperity is broadly shared",
      "Culture celebrates builders, inventors, and explorers",
      "Currency is strong because it is backed by real production",
    ],
    historical: "Roman Republic expansion (300-100 BC), British Empire 1700s, American Industrial Revolution (1870-1945), Dutch Golden Age (1600s)",
    modern: "GDP growth outpaces debt, manufacturing booms, patents increase, education quality peaks",
  },
  {
    stage: 3,
    name: "Peak & Dominance",
    icon: Crown,
    color: "from-amber-500 to-yellow-600",
    duration: "~30-50 years",
    characteristics: [
      "The civilization becomes the global reserve currency / dominant power",
      "Financial center of the world — everyone trades in your currency",
      "Military is unmatched — security feels permanent",
      "Education and culture are world-leading, attracting global talent",
      "This is the moment everyone points to as 'the golden age'",
      "But the seeds of decline are already being planted here",
    ],
    historical: "Roman Empire at peak (1st-2nd century AD), British Empire (1815-1900), American century (1945-2000), Dutch dominance (1625-1670)",
    modern: "Reserve currency status, military bases worldwide, cultural dominance (movies, music, language), financial markets lead globally",
  },
  {
    stage: 4,
    name: "Overextension & Decadence",
    icon: Coins,
    color: "from-orange-500 to-amber-600",
    duration: "~30-60 years",
    characteristics: [
      "Wealth concentrates — the gap between rich and poor widens dramatically",
      "Debt explodes at every level (government, corporate, personal)",
      "Currency is debased — money printing replaces productivity",
      "Military overextends — expensive wars with diminishing returns",
      "Education declines — practical skills are replaced by credentialism",
      "Culture shifts from builders to consumers, from producers to speculators",
      "Infrastructure is neglected — living off what previous generations built",
      "Political polarization increases — internal conflict replaces shared purpose",
    ],
    historical: "Late Roman Republic/Early Empire currency debasement, British post-WW1, Spanish Empire 1600s, Ottoman late period",
    modern: "Rising Gini coefficient, national debt exceeding GDP, real wages stagnating, infrastructure grades of C/D, political tribalism",
  },
  {
    stage: 5,
    name: "Decline & Internal Conflict",
    icon: AlertTriangle,
    color: "from-red-500 to-orange-600",
    duration: "~20-50 years",
    characteristics: [
      "Internal conflict becomes more dangerous than external threats",
      "Class warfare — populist movements rise on both sides",
      "Institutions lose legitimacy — people stop trusting government, media, courts",
      "Currency loses purchasing power rapidly — inflation erodes savings",
      "Education system produces ideology instead of competence",
      "Brain drain — talented people leave for rising powers",
      "Military is used internally or in futile foreign conflicts",
      "Elites become detached from common people — live in different reality",
    ],
    historical: "Roman Crisis of the Third Century, British Empire 1940s-60s, Spanish decline 1650-1700, Ottoman Tanzimat era",
    modern: "Trust in institutions at record lows, currency purchasing power declining, manufacturing offshored, social media polarization",
  },
  {
    stage: 6,
    name: "Collapse or Transformation",
    icon: Skull,
    color: "from-slate-600 to-gray-700",
    duration: "~10-30 years",
    characteristics: [
      "The old order can no longer sustain itself",
      "Revolution, invasion, or peaceful transition to a new system",
      "Currency may be replaced entirely (hyperinflation or new reserve currency)",
      "Power shifts to a rising civilization that is in stages 1-2",
      "Not always violent — sometimes the civilization transforms rather than falls",
      "The people often continue — it is the SYSTEM that collapses, not the culture",
    ],
    historical: "Fall of Rome (476 AD) — but Romans continued as Byzantines. British Empire → Commonwealth. Soviet Union → Russia. Qing Dynasty → Republic of China.",
    modern: "Every dominant power in history has eventually ceded dominance. The question is never IF but WHEN and WHAT COMES NEXT.",
  },
]

// ────────────────────────────────────────────
// Major civilizations timeline
// ────────────────────────────────────────────
const CIVILIZATIONS = [
  {
    name: "Ancient Egypt",
    start: -3100,
    peak: -1400,
    end: -30,
    duration: "3,070 years",
    color: "bg-amber-500",
    keyFacts: [
      "Longest-lasting civilization in recorded history",
      "Declined when centralized bureaucracy became corrupt and overextended",
      "Fell to successive foreign powers (Assyria, Persia, Greece, Rome)",
      "Knowledge was preserved but power was not — pattern repeats everywhere",
    ],
    collapse: "Foreign conquest after internal fragmentation, bureaucratic corruption, and military overextension",
  },
  {
    name: "Roman Republic & Empire",
    start: -509,
    peak: 117,
    end: 476,
    duration: "985 years",
    color: "bg-red-500",
    keyFacts: [
      "Republic lasted 482 years, Empire lasted 503 years",
      "Currency debased from 95% silver (denarius) to <5% over 200 years",
      "Bread and circuses — free food and entertainment kept the population docile",
      "Military expanded beyond what taxes could support — hired foreign mercenaries",
      "Wealth concentrated in the hands of Senators and landowners while average Romans lost their farms",
      "Did not 'fall' suddenly — gradually transformed. Eastern Roman Empire (Byzantium) lasted until 1453",
    ],
    collapse: "Currency debasement, military overextension, political corruption, wealth inequality, loss of civic virtue, reliance on foreign soldiers who had no loyalty to Rome",
  },
  {
    name: "Byzantine Empire",
    start: 330,
    peak: 565,
    end: 1453,
    duration: "1,123 years",
    color: "bg-purple-500",
    keyFacts: [
      "Eastern continuation of Rome — outlasted the West by nearly 1,000 years",
      "Preserved Roman law, Greek philosophy, and Christian theology",
      "Eventually fell to the Ottoman Turks after centuries of territorial loss",
      "Knowledge fled to Italy — sparked the Renaissance",
    ],
    collapse: "Gradual territorial loss, internal religious conflict, military defeats, economic decline from loss of trade routes",
  },
  {
    name: "Islamic Golden Age",
    start: 750,
    peak: 1000,
    end: 1258,
    duration: "508 years",
    color: "bg-emerald-600",
    keyFacts: [
      "Preserved and advanced Greek, Roman, and Persian knowledge when Europe was in darkness",
      "Invented algebra, algorithms, advanced medicine, optics, and astronomy",
      "Baghdad was the largest and most advanced city in the world",
      "Destroyed by the Mongol sack of Baghdad (1258) — a million killed, libraries burned",
    ],
    collapse: "Mongol invasion, internal political fragmentation, rigid religious conservatism replaced scientific openness",
  },
  {
    name: "Mongol Empire",
    start: 1206,
    peak: 1279,
    end: 1368,
    duration: "162 years",
    color: "bg-slate-600",
    keyFacts: [
      "Largest contiguous land empire in history",
      "Created the first truly global trade network (Pax Mongolica)",
      "Killed an estimated 40 million people — 10% of the world's population",
      "Collapsed because it was too large to govern — split into successor states",
    ],
    collapse: "Overextension, succession crises, plague, inability to govern diverse cultures from a single center",
  },
  {
    name: "Ottoman Empire",
    start: 1299,
    peak: 1550,
    end: 1922,
    duration: "623 years",
    color: "bg-teal-600",
    keyFacts: [
      "Controlled the crossroads of Europe, Asia, and Africa for centuries",
      "Religious and ethnic diversity managed through the millet system",
      "Declined as European powers industrialized and the Ottomans did not",
      "World War I was the final blow — empire dissolved into modern Turkey + Middle East",
    ],
    collapse: "Failed to industrialize, military defeats, nationalist movements, WW1 alliance with losing side",
  },
  {
    name: "Spanish Empire",
    start: 1492,
    peak: 1580,
    end: 1898,
    duration: "406 years",
    color: "bg-orange-600",
    keyFacts: [
      "First truly global empire — Americas, Philippines, parts of Africa and Europe",
      "Gold and silver from the Americas caused massive inflation in Spain (too much money, not enough production)",
      "Spent wealth on wars and luxury instead of investing in productive industry",
      "Classic case: resource wealth without productive capacity leads to decline",
    ],
    collapse: "Dutch Revolt, English naval defeats, inflation from New World gold, failure to industrialize, expensive European wars",
  },
  {
    name: "Dutch Republic",
    start: 1581,
    peak: 1650,
    end: 1795,
    duration: "214 years",
    color: "bg-orange-500",
    keyFacts: [
      "Invented the stock market, central banking, and modern corporate structure (Dutch East India Company)",
      "Richest nation per capita in the world during the Golden Age",
      "First recorded financial bubble: Tulip Mania (1637)",
      "Overtaken by Britain, which adopted Dutch financial innovations at larger scale",
    ],
    collapse: "Anglo-Dutch wars, French invasion, financial overextension, military competition with larger nations (Britain, France)",
  },
  {
    name: "British Empire",
    start: 1583,
    peak: 1870,
    end: 1997,
    duration: "414 years",
    color: "bg-blue-600",
    keyFacts: [
      "Largest empire in history — 25% of the world's land and population",
      "Industrial Revolution gave massive technological and military advantage",
      "Pound sterling was the world's reserve currency for over a century",
      "Two World Wars bankrupted the empire — US dollar replaced the pound",
      "Decolonization was relatively peaceful compared to other empire endings",
    ],
    collapse: "WW1 and WW2 drained resources, US surpassed economically, colonies demanded independence, pound lost reserve currency status",
  },
  {
    name: "American Era",
    start: 1776,
    peak: 1950,
    end: null,
    duration: "250 years (ongoing)",
    color: "bg-blue-500",
    keyFacts: [
      "Dollar became world reserve currency at Bretton Woods (1944)",
      "Dollar-gold link broken by Nixon (1971) — all currencies became fiat",
      "National debt: $0.3T (1970) → $1T (1982) → $10T (2008) → $35T+ (2024)",
      "Manufacturing share of GDP: 28% (1950) → 11% (2024)",
      "Real wages flat since 1971 despite 3x productivity growth",
      "Military spending exceeds the next 10 nations combined",
    ],
    collapse: null,
  },
]

// ────────────────────────────────────────────
// Rome → Vatican banking theory
// ────────────────────────────────────────────
const ROME_VATICAN = [
  {
    title: "The Political Rome Falls (476 AD)",
    text: "The Western Roman Empire's political and military structure collapses. But the INSTITUTIONAL structure — the Church — does not. The Bishop of Rome (Pope) becomes the most powerful figure in Europe, inheriting Rome's administrative network, legal traditions, and cultural authority.",
  },
  {
    title: "The Church Becomes the State (500-1000 AD)",
    text: "The Catholic Church fills every vacuum Rome left: law (Canon Law replaces Roman Law), education (monasteries become the only schools), taxation (tithes replace Roman taxes), territorial control (Papal States), and diplomatic authority (Popes crown kings).",
  },
  {
    title: "The Vatican Becomes a Bank (1100-1500)",
    text: "The Knights Templar create the first international banking system. After their dissolution (1312), Italian banking families — the Medici, Bardi, Peruzzi — take over, with the Vatican as their primary client and partner. The Vatican Bank manages immense wealth from tithes, indulgences, and land holdings across Europe.",
  },
  {
    title: "Power Shifts but Structure Remains (1500-Present)",
    text: "The Reformation breaks the Church's monopoly on Christianity. Political power shifts to nation-states. But the Vatican retains: its own sovereign territory, diplomatic relations with 183 nations, the Vatican Bank (IOR), vast real estate holdings, and influence over 1.3 billion Catholics. The STRUCTURE of Rome never actually disappeared — it transformed.",
  },
]

// ────────────────────────────────────────────
// Patterns that repeat in EVERY collapse
// ────────────────────────────────────────────
const COLLAPSE_PATTERNS = [
  {
    pattern: "Currency Debasement",
    icon: Coins,
    desc: "Every declining empire debases its currency. Rome reduced silver content. Britain abandoned the gold standard. The US broke the dollar-gold link in 1971. When a government spends more than it earns, it prints money — and every citizen's savings lose value.",
    examples: "Roman denarius (95% → 5% silver), Continental Dollar (worthless), Weimar Republic mark, Zimbabwe dollar, Venezuelan bolivar",
  },
  {
    pattern: "Wealth Concentration",
    icon: Scale,
    desc: "In every late-stage civilization, wealth concentrates dramatically. The top 1% accumulate as much as the bottom 90%. The middle class erodes. This creates the political instability that precedes collapse — desperate people support radical change.",
    examples: "Roman latifundia (mega-farms replaced small farmers), French aristocracy (pre-Revolution), Gilded Age America, 2024 America (top 1% own more than bottom 90%)",
  },
  {
    pattern: "Military Overextension",
    icon: Swords,
    desc: "Empires expand their military beyond what their economy can sustain. The cost of maintaining bases, fighting distant wars, and policing territory drains the treasury. Hired foreign soldiers replace citizen soldiers who had loyalty to the nation.",
    examples: "Rome's 5,000-mile border, British Empire's global navy, Soviet Afghanistan, US post-9/11 ($8 trillion spent)",
  },
  {
    pattern: "Education Decline",
    icon: BookOpen,
    desc: "Early-stage civilizations value practical education — engineering, farming, trade. Late-stage civilizations shift to theoretical, ideological, or credential-based education. The population becomes less capable of producing real value.",
    examples: "Roman shift from citizen-farmer to urban consumer, Medieval Europe (practical skills replaced by theological debate), modern degree inflation (jobs requiring degrees that never needed them)",
  },
  {
    pattern: "Loss of Civic Virtue",
    icon: Shield,
    desc: "Early citizens sacrifice for the common good. Late citizens demand from the state. 'Bread and circuses' — when a population is pacified by entertainment and free goods instead of engaged in building, the society is already in terminal decline.",
    examples: "Roman grain dole + gladiatorial games, late Ottoman decadence, modern social media + streaming + consumer culture",
  },
  {
    pattern: "Institutional Corruption",
    icon: Building2,
    desc: "Institutions created to serve the public begin to serve themselves. Regulatory capture, lobbying, revolving doors between government and industry. The rule of law becomes the rule of connections.",
    examples: "Roman Senate (became a rubber stamp for emperors), East India Company (corporation became a government), modern regulatory capture (FDA funded by pharma, FCC run by telecom)",
  },
  {
    pattern: "Financialization over Production",
    icon: Banknote,
    desc: "Late-stage economies shift from making things to moving money. Financial services grow while manufacturing shrinks. Profits come from speculation, not creation. The economy becomes a casino where the house always wins.",
    examples: "Late Dutch Republic (trade → finance), British post-industrial shift, US manufacturing decline (28% → 11% of GDP), Wall Street profits vs. Main Street stagnation",
  },
]

// ────────────────────────────────────────────
// Ray Dalio's Big Cycle metrics
// ────────────────────────────────────────────
const DALIO_METRICS = [
  { metric: "Education", peak: "1950s-60s", current: "Declining", direction: "down", note: "US ranks 25th in math, 24th in reading (OECD). Was #1 in both." },
  { metric: "Innovation & Technology", peak: "1960s-2000s", current: "Mixed", direction: "flat", note: "Still leads in tech but China closing gap rapidly. R&D increasingly defensive." },
  { metric: "Cost Competitiveness", peak: "1950s", current: "Low", direction: "down", note: "Manufacturing moved to cheaper nations. Services moving to AI." },
  { metric: "Military Strength", peak: "1991 (sole superpower)", current: "Dominant but strained", direction: "flat", note: "Spends more than next 10 combined. But $8T spent on wars with no clear victory." },
  { metric: "Trade", peak: "1960s-70s", current: "Large deficits", direction: "down", note: "Imports far exceed exports. Trade deficit ~$800B/year." },
  { metric: "Economic Output", peak: "1960 (40% of world GDP)", current: "~25% of world GDP", direction: "down", note: "Still largest single economy but share declining as others grow." },
  { metric: "Reserve Currency Status", peak: "1944-2000", current: "Dominant but declining share", direction: "down", note: "Dollar share of global reserves: 73% (2000) → 58% (2024). Still dominant." },
  { metric: "Wealth Gap", peak: "1950s-70s (most equal)", current: "Widest since 1929", direction: "down", note: "Top 1% own more than bottom 90%. Middle class share of wealth declining every decade." },
  { metric: "Internal Order / Unity", peak: "1950s-60s", current: "Deeply divided", direction: "down", note: "Political polarization at highest measured levels. Trust in institutions at record lows." },
  { metric: "Debt Levels", peak: "1970 ($370B national debt)", current: "$35T+ national debt", direction: "down", note: "Debt-to-GDP: 35% (1970) → 120%+ (2024). Interest payments now exceed defense spending." },
]

export default function CivilizationsPage() {
  const [expandedCiv, setExpandedCiv] = useState<number | null>(null)
  const [expandedPattern, setExpandedPattern] = useState<number | null>(null)
  const [expandedStage, setExpandedStage] = useState<number | null>(0)
  const [showRomeVatican, setShowRomeVatican] = useState(false)
  const [showDalio, setShowDalio] = useState(false)

  // Calculate visual timeline positions
  const timelineStart = -3100
  const timelineEnd = 2025
  const timelineRange = timelineEnd - timelineStart

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-red-700">
            <Globe2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Rise & Fall of Civilizations</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          5,000 years of patterns. Every empire follows the same cycle. The names change, the stages do not.
        </p>
      </div>

      {/* Core insight */}
      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">The Pattern Nobody Teaches</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every dominant civilization in history has followed the same arc: hard times create strong people.
            Strong people create good times. Good times create weak people. Weak people create hard times.
            This is not philosophy — it is observable in every empire from Egypt to America. The cycle takes
            roughly 250 years. Understanding where you are in the cycle is the most important knowledge
            a citizen can have. This page presents the data. You decide what it means.
          </p>
        </CardContent>
      </Card>

      {/* The 6 stages */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" /> The 6 Stages Every Civilization Passes Through
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Identified by Sir John Glubb (1976), expanded by Ray Dalio (2021), confirmed by Peter Turchin&apos;s
          quantitative analysis. The names differ but the pattern is identical across 3,000+ years of data.
        </p>
        <div className="space-y-3">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon
            const isOpen = expandedStage === i
            return (
              <Card key={i} className="card-hover cursor-pointer overflow-hidden" onClick={() => setExpandedStage(isOpen ? null : i)}>
                <CardContent className="p-0">
                  <div className="p-4 flex items-center gap-3">
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", stage.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px]">Stage {stage.stage}</Badge>
                        <p className="text-sm font-semibold">{stage.name}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Duration: {stage.duration}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Characteristics</p>
                        <ul className="space-y-1">
                          {stage.characteristics.map((c, j) => (
                            <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                              <span className="text-amber-400 shrink-0">-</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Historical Examples</p>
                        <p className="text-xs text-muted-foreground italic">{stage.historical}</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2.5">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Modern Indicators</p>
                        <p className="text-xs text-muted-foreground">{stage.modern}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Visual timeline */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Landmark className="h-5 w-5 text-muted-foreground" /> Timeline of Major Civilizations
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Hover/tap each civilization to see the patterns. Notice how they overlap — as one falls, another rises.
          Power does not disappear, it transfers.
        </p>
        <div className="space-y-2">
          {CIVILIZATIONS.map((civ, i) => {
            const startPct = ((civ.start - timelineStart) / timelineRange) * 100
            const endPct = (((civ.end ?? 2025) - timelineStart) / timelineRange) * 100
            const peakPct = ((civ.peak - timelineStart) / timelineRange) * 100
            const isOpen = expandedCiv === i
            return (
              <div key={i}>
                <div className="cursor-pointer" onClick={() => setExpandedCiv(isOpen ? null : i)}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium w-40 shrink-0 truncate">{civ.name}</span>
                    <span className="text-[9px] text-muted-foreground shrink-0">{civ.duration}</span>
                  </div>
                  <div className="relative h-5 bg-muted/30 rounded-full overflow-hidden">
                    <div className={cn("absolute h-full rounded-full opacity-70 hover:opacity-100 transition-opacity", civ.color)}
                      style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }} />
                    <div className="absolute h-full w-0.5 bg-amber-400"
                      style={{ left: `${peakPct}%` }} title={`Peak: ${civ.peak > 0 ? civ.peak + " AD" : Math.abs(civ.peak) + " BC"}`} />
                  </div>
                </div>
                {isOpen && (
                  <Card className="mt-2 mb-1">
                    <CardContent className="p-4">
                      <p className="text-sm font-semibold mb-1">{civ.name}</p>
                      <p className="text-[10px] text-muted-foreground mb-2">
                        {civ.start > 0 ? civ.start + " AD" : Math.abs(civ.start) + " BC"} — {civ.end ? (civ.end > 0 ? civ.end + " AD" : Math.abs(civ.end) + " BC") : "Present"}
                        {" · "}Peak: {civ.peak > 0 ? civ.peak + " AD" : Math.abs(civ.peak) + " BC"}
                      </p>
                      <ul className="space-y-1 mb-3">
                        {civ.keyFacts.map((fact, j) => (
                          <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                            <span className="text-amber-400 shrink-0">-</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                      {civ.collapse && (
                        <div className="rounded-lg bg-red-50/50 p-2.5">
                          <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wider mb-0.5">Why It Fell</p>
                          <p className="text-xs text-red-600/80">{civ.collapse}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          })}
          {/* Timeline axis */}
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1 px-1">
            <span>3100 BC</span><span>2000 BC</span><span>1000 BC</span><span>0</span><span>1000 AD</span><span>2000 AD</span>
          </div>
        </div>
      </div>

      {/* Collapse patterns */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" /> 7 Patterns That Repeat in Every Collapse
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          These are not predictions. They are observations from 5,000 years of data. Every single civilization
          that declined exhibited these patterns. The ones that recognized them early sometimes avoided the worst outcomes.
        </p>
        <div className="space-y-3">
          {COLLAPSE_PATTERNS.map((p, i) => {
            const Icon = p.icon
            const isOpen = expandedPattern === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedPattern(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-red-400 shrink-0" />
                    <p className="text-sm font-semibold flex-1">{p.pattern}</p>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-8">
                      <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                      <div className="rounded-lg bg-muted/30 p-2.5">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Historical Examples</p>
                        <p className="text-xs text-muted-foreground">{p.examples}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Rome → Vatican */}
      <Card>
        <div className="cursor-pointer" onClick={() => setShowRomeVatican(!showRomeVatican)}>
          <CardContent className="p-4 flex items-center gap-3">
            <Landmark className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Did Rome Really Fall — or Just Transform?</p>
              <p className="text-[10px] text-muted-foreground">The Rome → Vatican continuity theory</p>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showRomeVatican && "rotate-180")} />
          </CardContent>
        </div>
        {showRomeVatican && (
          <div className="px-4 pb-4 border-t border-border pt-3 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              The conventional story: Rome fell in 476 AD. End of story. The more nuanced view: Rome&apos;s POLITICAL
              structure fell, but its INSTITUTIONAL structure — the Catholic Church — not only survived but became
              more powerful than the Empire ever was. Here is the timeline:
            </p>
            {ROME_VATICAN.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">{i + 1}</div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.text}</p>
                </div>
              </div>
            ))}
            <Card className="border-amber-200 bg-amber-50/20">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>The pattern to notice:</strong> Power does not disappear when a civilization &quot;falls.&quot; It transforms.
                  The Roman Senate became the College of Cardinals. Roman provinces became dioceses. Roman law became Canon Law.
                  The question is never &quot;did the empire fall?&quot; but &quot;who inherited the infrastructure?&quot; This pattern repeats:
                  the British Empire became the Commonwealth + financial City of London. The question for today is:
                  when empires transform, who ends up holding the real power?
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </Card>

      {/* Ray Dalio's metrics */}
      <Card>
        <div className="cursor-pointer" onClick={() => setShowDalio(!showDalio)}>
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Dalio&apos;s Big Cycle Metrics — Where Are We Now?</p>
              <p className="text-[10px] text-muted-foreground">Ray Dalio&apos;s framework applied to current data</p>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showDalio && "rotate-180")} />
          </CardContent>
        </div>
        {showDalio && (
          <div className="px-4 pb-4 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Ray Dalio studied the last 500 years of reserve currencies and empires. He identified measurable indicators
              that track where a civilization is in the cycle. Here is where the current dominant power stands on each:
            </p>
            <div className="space-y-2">
              {DALIO_METRICS.map((m, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium">{m.metric}</p>
                      {m.direction === "down" ? (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      ) : (
                        <ArrowRight className="h-3 w-3 text-amber-500" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{m.note}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">Peak: {m.peak}</p>
                    <p className={cn("text-xs font-medium",
                      m.direction === "down" ? "text-red-500" : "text-amber-500"
                    )}>{m.current}</p>
                  </div>
                </div>
              ))}
            </div>
            <Card className="mt-3 border-blue-200 bg-blue-50/20">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>What Dalio concludes:</strong> &quot;The United States is in the late stages of the big cycle... roughly
                  where the Dutch were in the early 1700s or the British in the early 1900s.&quot; This does not mean
                  collapse is imminent. The British Empire took another 50+ years after its peak to fully transition.
                  But the trajectory on every single metric is in the same direction as every previous declining empire.
                  The question is what comes next — and whether awareness can change the outcome.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </Card>

      {/* What you can learn from this */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">What This Means for You</p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            This page is not doom and gloom. It is awareness. Every civilization has people who saw the patterns
            and positioned their families accordingly. Here is what history teaches:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>Own real assets</strong> — In every currency debasement, people who owned land, tools, and productive assets preserved wealth. People who held cash lost everything.</span></li>
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>Build real skills</strong> — An electrician, farmer, nurse, or welder has value in any system. A middleman in a financialized economy does not.</span></li>
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>Strengthen your family</strong> — In every transition period, the family unit is the most reliable institution. Invest in relationships, not just portfolios.</span></li>
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>Reduce dependency</strong> — Grow food, reduce debt, build community. The less you depend on systems you cannot control, the more resilient you are.</span></li>
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>Educate your children</strong> — Teach them history, critical thinking, and practical skills. The generation that understands the cycle has the power to break it — or at least navigate it.</span></li>
          </ul>
        </CardContent>
      </Card>

      {/* Data note */}
      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> Ray Dalio, <em>Principles for Dealing with the Changing World Order</em> (2021).
            Sir John Glubb, <em>The Fate of Empires</em> (1976). Peter Turchin, <em>Ages of Discord</em> (2016).
            Will &amp; Ariel Durant, <em>The Lessons of History</em> (1968). OECD PISA rankings. Federal Reserve historical data.
            IMF reserve currency composition. World Bank GDP data. This page presents historical patterns and current
            data points. It does not predict the future — history rhymes but never repeats exactly.
            Explore specific figures and power structures on <a href="https://aletheia-truth.vercel.app" className="text-violet-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">Aletheia</a>.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
        <a href="/governance" className="text-sm text-blue-600 hover:underline">Governance</a>
        <a href="/economics" className="text-sm text-emerald-600 hover:underline">Economics</a>
        <a href="/education/finance" className="text-sm text-amber-600 hover:underline">Financial Literacy</a>
      </div>
    </div>
  )
}
