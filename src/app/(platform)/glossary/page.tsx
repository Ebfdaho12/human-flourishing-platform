"use client"

import { useState } from "react"
import { BookOpen, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Term {
  term: string
  simple: string
  technical: string
  category: string
  related?: string[]
}

const GLOSSARY: Term[] = [
  // Platform
  { term: "Flourishing Score", simple: "A single number (0-100) that shows how well you're doing across all areas of life — mood, sleep, exercise, habits, gratitude.", technical: "Weighted composite: mood (25%), sleep (25%), exercise (20%), habits (15%), gratitude (10%), consistency (5%). Updates daily from your data.", category: "Platform", related: ["/flourishing-score"] },
  { term: "XP (Experience Points)", simple: "Points you earn for doing healthy things on the platform. Like a video game — more actions = more XP = higher level.", technical: "Awarded per action: mood log (10), health entry (15), streak day (20), page visit (5), gratitude (10), goal (25). Accumulated for leveling.", category: "Platform", related: ["/character-sheet"] },
  { term: "FOUND Token", simple: "The platform's digital currency. You earn it by using the platform. Eventually will be on the Solana blockchain.", technical: "SPL token, 369,369,369 max supply, 6 decimals. Earned through module engagement, feedback, and governance participation. Can be staked for VOICE.", category: "Platform", related: ["/wallet", "/tokens"] },
  { term: "VOICE Token", simple: "Governance power. Stake FOUND tokens to get VOICE, which lets you vote on platform decisions.", technical: "Soulbound governance token. Earned by staking FOUND. Non-transferable. Weighted voting on proposals. Burns on unstake.", category: "Platform", related: ["/wallet"] },
  { term: "Combo Multiplier", simple: "Complete multiple daily quests and your XP gets multiplied. 3 quests = 1.25x, 6 = 1.5x, 9+ = 2x. Like combo hits in a fighting game.", technical: "Applied to total daily quest XP. Incentivizes touching multiple flourishing dimensions per day. Resets daily.", category: "Platform", related: ["/daily-quests"] },
  { term: "Hive Mind", simple: "When enough people track their data, the platform shows patterns across everyone — anonymously. Your data stays private, but the collective patterns become visible.", technical: "Anonymous aggregate analytics. Individual data encrypted client-side (AES-256-GCM). Server computes aggregates on encrypted blobs. No individual data is ever decrypted server-side.", category: "Platform", related: ["/hive-mind"] },
  { term: "Zero-Knowledge Architecture", simple: "The platform literally cannot read your data — even if a court orders it. Your password encrypts everything in your browser before it reaches our servers.", technical: "Client-side AES-256-GCM encryption. Key derived from password via PBKDF2 (100K iterations). Key stored in sessionStorage only (cleared on tab close). Server stores opaque encrypted blobs.", category: "Security", related: ["/privacy-architecture"] },
  { term: "CSRF Token", simple: "A security code that proves a request to the platform actually came from you, not from a malicious website pretending to be you.", technical: "Random hex token stored in SameSite=Strict cookie. Validated via x-csrf-token header on POST/PATCH/PUT/DELETE to /api/*. Prevents cross-site request forgery.", category: "Security" },

  // Health
  { term: "Fascia", simple: "A web of connective tissue that wraps everything in your body — muscles, organs, bones, nerves. It stores tension, transmits force, and affects pain, movement, and even emotions.", technical: "Continuous collagen/elastin/ground substance matrix. Contains mechanoreceptors (Ruffini, Pacini) for proprioception. Myofibroblasts allow active contraction (Schleip). Ground substance hydration determines tissue pliability.", category: "Health", related: ["/fascia"] },
  { term: "Hormesis", simple: "Small controlled stresses make your body stronger. Cold showers, exercise, fasting, and sauna all work this way — temporary stress → adaptation → stronger than before.", technical: "Biphasic dose-response: low-dose stimulation, high-dose inhibition. Activates NRF2 pathway, heat shock proteins, BDNF, cold shock proteins. Distinct from chronic stress (which is harmful).", category: "Health", related: ["/cold-exposure", "/sauna", "/fasting"] },
  { term: "Autophagy", simple: "Your body's self-cleaning system. During fasting, cells break down and recycle damaged parts. Like a renovation crew clearing out old furniture. Won a Nobel Prize in 2016.", technical: "Cellular degradation pathway where damaged organelles, misfolded proteins, and pathogens are sequestered in autophagosomes and delivered to lysosomes. Upregulated by AMPK activation during nutrient deprivation.", category: "Health", related: ["/fasting"] },
  { term: "HRV (Heart Rate Variability)", simple: "The variation in time between heartbeats. Higher = better. It's the #1 marker for how well your nervous system handles stress.", technical: "Time-domain and frequency-domain analysis of R-R interval variation. RMSSD and pNN50 for parasympathetic tone. High HRV = strong vagal tone, autonomic flexibility. Low HRV = stress, poor recovery.", category: "Health", related: ["/breathwork", "/health"] },
  { term: "Circadian Rhythm", simple: "Your body's 24-hour internal clock. Controls when you're alert, sleepy, hungry, and when hormones are released. Light is the master switch.", technical: "Suprachiasmatic nucleus (SCN) in hypothalamus entrains to light via melanopsin ganglion cells. Regulates cortisol, melatonin, body temperature, gene expression (~15% of genome). Disruption linked to metabolic syndrome, depression, cancer risk.", category: "Health", related: ["/sleep-optimization"] },
  { term: "Vagus Nerve", simple: "The longest nerve in your body, running from brain to gut. It's the 'calm down' nerve. You can activate it with breathing, cold water, humming, and gargling.", technical: "Cranial nerve X. Primary parasympathetic pathway. Mediates anti-inflammatory reflex (cholinergic anti-inflammatory pathway). Vagal tone measured via HRV. Stimulated by slow exhalation, cold exposure, meditation.", category: "Health", related: ["/breathwork", "/anxiety-toolkit"] },
  { term: "BPC-157", simple: "A peptide (small protein fragment) found naturally in stomach acid. Research shows it may accelerate healing of tendons, muscles, and gut lining. Most evidence is from animal studies.", technical: "Gastric pentadecapeptide. 15 amino acids. Upregulates VEGF, NO system, GABAergic pathways. 544 articles (1993-2024), mostly preclinical. 2025 IV safety pilot: 2 adults tolerated 20mg with no adverse events.", category: "Health", related: ["/peptides"] },

  // Mind
  { term: "Mental Model", simple: "A thinking framework that helps you make better decisions. Like a lens you look through to understand the world. The more models you have, the clearer you see.", technical: "Abstracted representation of how something works. Charlie Munger's 'latticework' concept: multiple models from different disciplines (physics, biology, psychology, economics) applied to the same problem reduce blindspots.", category: "Mind", related: ["/mental-models"] },
  { term: "Cognitive Bias", simple: "A bug in human thinking. Your brain takes shortcuts that worked for survival 200,000 years ago but cause errors in modern life. Knowing the bugs helps you catch them.", technical: "Systematic deviation from rational judgment. Identified by Kahneman/Tversky. Examples: confirmation bias (seeking confirming evidence), anchoring (first number influences judgment), availability heuristic (overweighting recent/vivid events).", category: "Mind", related: ["/cognitive-biases"] },
  { term: "Stoicism", simple: "An ancient philosophy (2,300 years old) about controlling what you can, accepting what you can't, and finding peace in any situation. Not about suppressing emotions — about choosing your response.", technical: "Hellenistic philosophy (Zeno, Epictetus, Seneca, Marcus Aurelius). Core tenets: dichotomy of control, virtue as sole good, premeditatio malorum, view from above. Modern applications in CBT, resilience training, military psychology.", category: "Mind", related: ["/stoicism"] },
  { term: "Dopamine", simple: "A brain chemical that drives motivation and reward-seeking. NOT a pleasure chemical — it's an anticipation chemical. Social media, sugar, and drugs hijack it. Cold showers and exercise boost it naturally.", technical: "Catecholamine neurotransmitter. Synthesized in VTA and substantia nigra. Mesolimbic pathway: motivation, reward prediction. Baseline vs. peak: supernormal stimuli crash baseline (tolerance). Cold exposure: 250% increase lasting 2-3hrs (Molecular Psychiatry).", category: "Mind", related: ["/dopamine"] },

  // Finance
  { term: "4% Rule / 25x Rule", simple: "To retire, save 25 times your annual expenses. Then withdraw 4% per year. Based on 30 years of market data — your money should last 30+ years.", technical: "Trinity Study (Cooley et al. 1998): 4% initial withdrawal rate, adjusted for inflation, with 50/50 stock/bond portfolio survived 30 years in 95% of historical periods. Recently debated: some argue 3.5% is safer given current valuations.", category: "Finance", related: ["/financial-independence"] },
  { term: "Compound Interest", simple: "Earning interest on your interest. $100/month at 7% becomes $120K in 20 years and $600K in 40 years. Time is the most powerful variable — start early.", technical: "A = P(1 + r/n)^(nt). Exponential growth where returns generate further returns. Rule of 72: divide 72 by interest rate = years to double. At 7%, money doubles every ~10.3 years.", category: "Finance", related: ["/compound-interest", "/trajectory"] },
]

export default function GlossaryPage() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = [...new Set(GLOSSARY.map(t => t.category))]
  const filtered = GLOSSARY.filter(t => {
    const matchesSearch = !search || t.term.toLowerCase().includes(search.toLowerCase()) || t.simple.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !activeCategory || t.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Glossary</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Every term on the platform explained simply AND technically. If you don't understand something, it's our fault — not yours.
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search terms..." className="h-9 text-sm pl-9" />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveCategory(null)} className={cn("px-3 py-1 rounded-full text-xs border transition-colors", !activeCategory ? "bg-violet-100 border-violet-300 text-violet-700" : "hover:bg-muted/50")}>All ({GLOSSARY.length})</button>
        {categories.map(cat => {
          const count = GLOSSARY.filter(t => t.category === cat).length
          return <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} className={cn("px-3 py-1 rounded-full text-xs border transition-colors", activeCategory === cat ? "bg-blue-100 border-blue-300 text-blue-700" : "hover:bg-muted/50")}>{cat} ({count})</button>
        })}
      </div>

      {/* Terms */}
      <div className="space-y-3">
        {filtered.map((t, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-bold">{t.term}</p>
                <Badge variant="outline" className="text-[8px]">{t.category}</Badge>
              </div>
              <div className="space-y-2">
                <div className="rounded bg-blue-50 border border-blue-200 p-2.5">
                  <p className="text-[9px] font-semibold text-blue-700 mb-0.5">Simple Explanation</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.simple}</p>
                </div>
                <div className="rounded bg-slate-50 border border-slate-200 p-2.5">
                  <p className="text-[9px] font-semibold text-slate-700 mb-0.5">Technical Detail</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{t.technical}</p>
                </div>
              </div>
              {t.related && t.related.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {t.related.map((r, j) => (
                    <a key={j} href={r} className="text-[10px] text-violet-600 hover:underline">{r.replace(/\//g, "").replace(/-/g, " ")} →</a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No terms found for "{search}"</p>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <a href="/scientific-literacy" className="text-sm text-teal-600 hover:underline">Scientific Literacy</a>
        <a href="/mental-models" className="text-sm text-amber-600 hover:underline">Mental Models</a>
        <a href="/tools" className="text-sm text-violet-600 hover:underline">All Tools</a>
        <a href="/my-path" className="text-sm text-blue-600 hover:underline">My Path</a>
      </div>
    </div>
  )
}
