"use client"

import { useState } from "react"
import { FlaskConical, ChevronDown, ChevronUp, AlertTriangle, Search, BookOpen, ShieldAlert, Link, TrendingUp, Users, BarChart3, FileWarning } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

const EVIDENCE_PYRAMID = [
  { level: 1, label: "Systematic Reviews & Meta-Analyses", color: "bg-emerald-600", desc: "Combine results from many studies. The gold standard — highest confidence." },
  { level: 2, label: "Randomized Controlled Trials (RCTs)", color: "bg-emerald-500", desc: "Participants randomly assigned to treatment or control. Establishes causation." },
  { level: 3, label: "Cohort Studies", color: "bg-teal-500", desc: "Follow groups over time, compare outcomes. Good but can't prove causation." },
  { level: 4, label: "Case-Control Studies", color: "bg-amber-500", desc: "Compare people with a condition to those without, looking backward. Weaker." },
  { level: 5, label: "Case Reports / Case Series", color: "bg-orange-500", desc: "Reports on individual patients. Interesting but almost no statistical power." },
  { level: 6, label: "Expert Opinion", color: "bg-red-400", desc: "A qualified person's view without systematic evidence. Better than nothing, barely." },
  { level: 7, label: "Anecdote / 'It worked for me'", color: "bg-red-600", desc: "Personal experience. The weakest form of evidence. Your body is not everyone's body." },
]

const KEY_CONCEPTS = [
  { term: "Sample Size", icon: Users, color: "text-blue-600",
    tip: "The number of people in a study — bigger numbers give more reliable results, like polling 1,000 people vs. asking 5 friends",
    detail: "A study of 12 people can show anything. Statistical power requires adequate sample sizes — typically hundreds or thousands for meaningful medical claims. Always check: how many participants?" },
  { term: "P-Values", icon: BarChart3, color: "text-violet-600",
    tip: "A p-value tells you how likely your results would happen by pure chance — p<0.05 means less than 5% chance it's random",
    detail: "P < 0.05 does NOT mean 'this is true.' It means there's less than a 5% chance the result is due to random variation. It says nothing about effect size. A 'statistically significant' result can be practically meaningless." },
  { term: "Correlation vs. Causation", icon: TrendingUp, color: "text-emerald-600",
    tip: "Just because two things happen together doesn't mean one causes the other — ice cream sales and drowning both rise in summer, but ice cream doesn't cause drowning",
    detail: "Ice cream sales correlate with drowning deaths. Both increase in summer — the heat is the common cause. Correlation is a clue, never proof. Always ask: could something else explain this?" },
  { term: "Relative vs. Absolute Risk", icon: AlertTriangle, color: "text-amber-600",
    tip: "Headlines use relative risk to sound scary — '50% increase!' might mean going from 2 in 10,000 to 3 in 10,000",
    detail: "A headline says 'Drug cuts risk by 50%!' Sounds amazing. But if your risk was 2 in 10,000 and now it's 1 in 10,000, the absolute reduction is 0.01%. Always ask for absolute numbers." },
  { term: "Placebo Effect", icon: ShieldAlert, color: "text-rose-600",
    tip: "People often feel better just because they think they're getting treatment — that's why studies need a control group getting a fake treatment",
    detail: "Up to 30% of people improve on sugar pills. That's why controls matter. If a study has no placebo group, you can't separate the treatment effect from the expectation effect." },
  { term: "Publication Bias", icon: FileWarning, color: "text-zinc-600",
    tip: "Studies that find something exciting get published; studies that find nothing often don't — so published research is skewed toward positive results",
    detail: "Journals prefer exciting results. Studies finding 'no effect' sit in file drawers. This means published literature systematically overestimates effect sizes. The 'file drawer problem' is real." },
  { term: "Conflicts of Interest", icon: Search, color: "text-orange-600",
    tip: "Who paid for the study matters — research funded by a company tends to find results favorable to that company",
    detail: "Industry-funded studies are 4x more likely to report favorable results. Always check: who paid? Does the author consult for the company? Financial incentives distort science." },
  { term: "Replication Crisis", icon: FlaskConical, color: "text-teal-600",
    tip: "More than half of famous psychology studies failed when other scientists tried to repeat them — if a finding can't be replicated, be skeptical",
    detail: "The Open Science Collaboration found that only 36% of psychology studies replicated. Similar issues exist in medicine and nutrition science. One study is a hypothesis. Replication is confirmation." },
]

const RED_FLAGS = [
  "Proprietary blends — if they won't tell you what's in it, why trust it?",
  "'Studies show' without any actual citations or links",
  "Before/after photos — lighting, angles, water retention, and Photoshop do a lot",
  "Celebrity endorsements — being famous doesn't make you a scientist",
  "'Doctors hate this one trick' — no they don't, and it's not a trick",
  "'All-natural' as a selling point — arsenic and cyanide are natural too",
  "Testimonials instead of data — ten happy customers is not a clinical trial",
  "Claims to cure everything — real treatments have specific, limited applications",
]

const READ_IN_5 = [
  { step: "1. Title & Abstract", desc: "What's the claim? What did they actually test? Does the abstract match the headline?" },
  { step: "2. Methods", desc: "Sample size? Control group? Randomized? Double-blind? How long did the study run?" },
  { step: "3. Results", desc: "What's the effect size (not just p-value)? Confidence intervals? How big is the actual difference?" },
  { step: "4. Funding & Conflicts", desc: "Who paid for this? Do authors have financial ties? Check the disclosures section." },
  { step: "5. Replication", desc: "Is this a single study or do other studies agree? Has anyone tried to replicate it?" },
]

export default function ScientificLiteracyPage() {
  const [expandedConcept, setExpandedConcept] = useState<number | null>(null)
  const [showRedFlags, setShowRedFlags] = useState(false)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-400">
            <FlaskConical className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">How to Read Science</h1>
        </div>
        <p className="text-sm text-muted-foreground">How to evaluate scientific claims — so you can think for yourself instead of trusting headlines.</p>
      </div>

      {/* Intro */}
      <Card className="border-2 border-teal-200 bg-teal-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>You don't need a PhD to evaluate science.</strong> You need a framework. Most health misinformation succeeds because people don't know how to check. This page gives you the tools to evaluate any claim — from <Explain tip="Chains of amino acids that signal your body to do specific things like build muscle, burn fat, or heal tissue">peptide protocols</Explain> to diet studies to supplement marketing. Skepticism is not cynicism. It's self-defense.
          </p>
        </CardContent>
      </Card>

      {/* Evidence Hierarchy */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4 text-teal-600" /> The Evidence Hierarchy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <p className="text-xs text-muted-foreground mb-2">Not all evidence is equal. The pyramid below goes from strongest (top) to weakest (bottom).</p>
          {EVIDENCE_PYRAMID.map((e) => (
            <div key={e.level} className="flex items-center gap-2">
              <div className={cn("h-2.5 rounded-full flex-shrink-0", e.color)} style={{ width: `${10 + e.level * 6}%` }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{e.label}</p>
                <p className="text-[10px] text-muted-foreground leading-snug">{e.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Concepts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Key Concepts You Need</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {KEY_CONCEPTS.map((c, i) => (
            <div key={c.term} className="rounded-lg border p-3">
              <button onClick={() => setExpandedConcept(expandedConcept === i ? null : i)} className="flex items-center justify-between w-full text-left gap-2">
                <div className="flex items-center gap-2">
                  <c.icon className={cn("h-4 w-4", c.color)} />
                  <span className="text-sm font-semibold">
                    <Explain tip={c.tip}>{c.term}</Explain>
                  </span>
                </div>
                {expandedConcept === i ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
              </button>
              {expandedConcept === i && (
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{c.detail}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Red Flags */}
      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardHeader className="pb-2">
          <button onClick={() => setShowRedFlags(!showRedFlags)} className="flex items-center justify-between w-full">
            <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Red Flags in Health Claims</CardTitle>
            {showRedFlags ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {showRedFlags && (
          <CardContent>
            <ul className="space-y-1.5">
              {RED_FLAGS.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-red-800 leading-relaxed">
                  <span className="text-red-400 mt-0.5">&#x2716;</span>
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      {/* How to read a study in 5 minutes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4 text-teal-600" /> How to Read a Study in 5 Minutes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {READ_IN_5.map((r) => (
            <div key={r.step} className="rounded-lg border p-3">
              <p className="text-xs font-semibold">{r.step}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{r.desc}</p>
            </div>
          ))}
          <div className="rounded bg-teal-50 border border-teal-200 px-3 py-2 mt-2">
            <p className="text-xs text-teal-800 leading-relaxed"><strong>Rule of thumb:</strong> If a study can't survive these five questions, don't change your behavior based on it. One study is a conversation starter, not a conclusion.</p>
          </div>
        </CardContent>
      </Card>

      {/* Connections */}
      <Card className="border-2 border-zinc-200 bg-zinc-50/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Link className="h-4 w-4 text-zinc-600" /> Apply This Everywhere</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "Supplements", desc: "Evaluate supplement claims with this framework", href: "/supplements" },
              { label: "Nutrition", desc: "Cut through conflicting diet research", href: "/nutrition" },
              { label: "Health Protocols", desc: "Check the evidence behind every protocol", href: "/health-protocols" },
              { label: "Statistics Guide", desc: "Deeper dive into numbers and data", href: "/statistics-guide" },
            ].map((c) => (
              <a key={c.label} href={c.href} className="rounded-lg border p-2 hover:bg-slate-50 transition-colors block">
                <p className="text-xs font-semibold">{c.label}</p>
                <p className="text-[10px] text-muted-foreground">{c.desc}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <div className="flex gap-3 flex-wrap">
        <a href="/stoicism" className="text-sm text-slate-600 hover:underline">Stoicism</a>
        <a href="/supplements" className="text-sm text-emerald-600 hover:underline">Supplements</a>
        <a href="/nutrition" className="text-sm text-amber-600 hover:underline">Nutrition</a>
        <a href="/health-protocols" className="text-sm text-teal-600 hover:underline">Health Protocols</a>
      </div>
    </div>
  )
}
