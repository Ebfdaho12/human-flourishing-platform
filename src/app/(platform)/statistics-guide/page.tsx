"use client"

import { useState } from "react"
import { BarChart2, ChevronDown, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const CONCEPTS = [
  {
    name: "Mean vs. Median",
    badge: "Central Tendency",
    color: "from-blue-500 to-indigo-600",
    definition: "The mean (average) adds all values and divides by count. The median is the middle value when sorted.",
    simple: "If 9 people earn $30k and 1 person earns $1M, the mean salary is ~$127k — but the median is $30k. Which tells the real story?",
    misuse: "Headlines claiming 'average household wealth increased 40%' often use the mean, hiding that gains went almost entirely to the top 1%.",
    evaluate: "Ask: is this skewed data? Are there outliers? When data is skewed, median is almost always more honest.",
  },
  {
    name: "Correlation vs. Causation",
    badge: "Relationship",
    color: "from-purple-500 to-pink-600",
    definition: "Correlation means two things move together. Causation means one actually causes the other.",
    simple: "Ice cream sales and drowning rates are correlated — because both spike in summer. Ice cream doesn't cause drowning.",
    misuse: "Studies showing 'coffee drinkers live longer' are correlational — coffee drinkers may simply have other healthy habits.",
    evaluate: "Ask: is there a plausible mechanism? Was it a controlled experiment? Could a third variable explain both?",
  },
  {
    name: "Sample Size",
    badge: "Reliability",
    color: "from-green-500 to-emerald-600",
    definition: "How many people or data points were studied. Small samples produce unreliable, highly variable results.",
    simple: "A study of 12 people saying a diet works is nearly meaningless. A study of 12,000 people is far more trustworthy.",
    misuse: "'9 out of 10 dentists recommend...' — ten dentists. The entire study was ten people.",
    evaluate: "Ask: how many participants? Was the sample representative of the population being described?",
  },
  {
    name: "P-Values",
    badge: "Significance",
    color: "from-orange-500 to-red-600",
    definition: "A p-value below 0.05 means there's less than a 5% chance the result happened by random chance alone.",
    simple: "It does NOT mean the effect is large or important — just that it's unlikely to be a fluke. A tiny, useless effect can be statistically significant.",
    misuse: "'Statistically significant' cancer risk increase from a food — the actual increase may be 0.001%. Headlines omit the effect size.",
    evaluate: "Ask: what's the effect size? Is the p-value just barely significant? Has it been replicated?",
  },
  {
    name: "Confidence Intervals",
    badge: "Precision",
    color: "from-teal-500 to-cyan-600",
    definition: "A range of values that likely contains the true result. '95% CI: 1.2–3.4' means we're 95% confident the true value is in that range.",
    simple: "A poll says 52% support a policy ±4%. The real number could be 48–56% — which crosses the majority threshold. The headline '52% support' buries the uncertainty.",
    misuse: "Drug X reduces risk by 30% (CI: 1%–59%). That wide interval means the true effect could be nearly zero.",
    evaluate: "Always look for confidence intervals. Narrow = precise. Wide = uncertain. If it crosses zero or 1.0, the effect may not exist.",
  },
  {
    name: "Selection Bias",
    badge: "Sample Quality",
    color: "from-yellow-500 to-amber-600",
    definition: "When the sample studied doesn't represent the population you're trying to understand.",
    simple: "Surveying gym members about exercise habits will not give you typical human behavior. You've selected for people who already exercise.",
    misuse: "Online polls about internet regulation — only people online can vote, skewing toward a tech-savvy, opinionated minority.",
    evaluate: "Ask: who was NOT included? How were participants recruited? Who chose to respond?",
  },
  {
    name: "Survivorship Bias",
    badge: "Hidden Data",
    color: "from-red-500 to-rose-600",
    definition: "Focusing only on outcomes that 'survived' a process while ignoring the failures that didn't make it to be counted.",
    simple: "WWII planes returned with bullet holes in wings — so engineers reinforced wings. Abraham Wald realized: the planes that got shot in the engine didn't come back. Reinforce the engine.",
    misuse: "'Successful entrepreneurs dropped out of college' — we only hear about the winners. We don't count the thousands who dropped out and failed.",
    evaluate: "Ask: what data is missing? Who didn't make it into this sample? What happened to the failures?",
  },
  {
    name: "Cherry Picking",
    badge: "Data Selection",
    color: "from-pink-500 to-fuchsia-600",
    definition: "Selecting only the data points that support a conclusion while ignoring contradicting evidence.",
    simple: "Showing one study that supports your position while ignoring 20 studies that contradict it.",
    misuse: "Climate deniers citing a cold winter as proof global warming isn't real — ignoring decades of data showing the trend.",
    evaluate: "Ask: is this the full picture? What's the scientific consensus? Has the speaker addressed contrary evidence?",
  },
]

const FIVE_QUESTIONS = [
  { q: "Who conducted this study and who funded it?", why: "Tobacco companies funded studies showing smoking was safe. Follow the money." },
  { q: "How large was the sample, and how was it chosen?", why: "12 people ≠ proof of anything. A biased sample produces biased results." },
  { q: "What's the effect size — not just whether it's significant?", why: "'Statistically significant' can mean practically meaningless." },
  { q: "Has this been independently replicated?", why: "One study proves nothing. Replication across multiple independent teams builds real knowledge." },
  { q: "What does the broader evidence say?", why: "A single outlier study doesn't overturn a scientific consensus. Context is everything." },
]

export default function StatisticsGuidePage() {
  const [openConcept, setOpenConcept] = useState<number | null>(null)
  const [openQ, setOpenQ] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <BarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold">Understanding Statistics</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Numbers can mislead — not always by lying, but by framing. Learn the 8 most misused concepts so you can read any study, headline, or report with confidence.
        </p>
      </div>

      <div className="space-y-3">
        {CONCEPTS.map((c, i) => {
          const open = openConcept === i
          return (
            <Card key={i} className={cn("transition-all", open && "ring-2 ring-blue-500/30")}>
              <button
                className="w-full text-left p-4 flex items-center justify-between gap-3"
                onClick={() => setOpenConcept(open ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-8 rounded-full bg-gradient-to-b", c.color)} />
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <Badge variant="secondary" className="text-xs mt-0.5">{c.badge}</Badge>
                  </div>
                </div>
                <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
              </button>
              {open && (
                <CardContent className="pt-0 pb-5 px-5 space-y-4 border-t">
                  <div className="grid gap-3 pt-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Definition</p>
                      <p className="text-sm">{c.definition}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Simple Explanation</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{c.simple}</p>
                    </div>
                    <div className="flex gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-0.5">Real-World Misuse</p>
                        <p className="text-sm text-red-700 dark:text-red-300">{c.misuse}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-0.5">How to Evaluate</p>
                        <p className="text-sm text-green-700 dark:text-green-300">{c.evaluate}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold">Every time you see a statistic in the news, ask these 5 questions</h2>
        </div>
        {FIVE_QUESTIONS.map((item, i) => {
          const open = openQ === i
          return (
            <Card key={i}>
              <button
                className="w-full text-left p-4 flex items-center justify-between gap-3"
                onClick={() => setOpenQ(open ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-sm shrink-0">{i + 1}</span>
                  <p className="font-medium text-sm">{item.q}</p>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
              </button>
              {open && (
                <CardContent className="pt-0 pb-4 px-5 border-t">
                  <p className="text-sm text-muted-foreground pt-3">{item.why}</p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <div className="border-t pt-6">
        <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Related on this platform</p>
        <div className="flex flex-wrap gap-2">
          {[["Critical Thinking", "/critical-thinking"], ["Correlations", "/correlations"], ["Propaganda", "/propaganda"], ["Decisions", "/decisions"]].map(([label, href]) => (
            <a key={href} href={href} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
