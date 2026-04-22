"use client"

import { useState, useEffect } from "react"
import { Search, Scale, Shield, AlertTriangle, CheckCircle, XCircle, DollarSign, Users, Link2, ExternalLink, Download, Plus, ChevronDown, ChevronUp, Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

interface InvestigationCard {
  id: string
  title: string
  category: string
  officialNarrative: string
  alternativeTheory: string
  evidenceFor: { point: string; source?: string; strength: "strong" | "moderate" | "weak" }[]
  evidenceAgainst: { point: string; source?: string; strength: "strong" | "moderate" | "weak" }[]
  whoBenefits: string[]
  whoLoses: string[]
  unansweredQuestions: string[]
  sources: { title: string; url?: string }[]
  confidenceInOfficial: number // 0-100
  status: "confirmed" | "debunked" | "unresolved" | "partially-confirmed"
}

const INVESTIGATIONS: InvestigationCard[] = [
  {
    id: "mass-surveillance",
    title: "Mass Surveillance Programs",
    category: "Government",
    officialNarrative: "Government surveillance is limited, targeted, and requires warrants. Intelligence agencies operate within legal frameworks and oversight.",
    alternativeTheory: "Governments conduct mass warrantless surveillance of their own citizens' communications, collecting metadata and content on a global scale.",
    evidenceFor: [
      { point: "Edward Snowden's 2013 NSA document leak revealed PRISM program — direct access to Google, Facebook, Apple, Microsoft servers", source: "The Guardian / Washington Post, June 2013", strength: "strong" },
      { point: "FISA court approved bulk collection of all Verizon call metadata (millions of Americans)", source: "FISA Court Order, leaked June 2013", strength: "strong" },
      { point: "XKeyscore program allows analysts to search ALL intercepted data without warrant", source: "NSA documents published by The Guardian", strength: "strong" },
      { point: "Five Eyes alliance (US/UK/Canada/Australia/NZ) shares intelligence to circumvent domestic surveillance laws", source: "Snowden documents, multiple publications", strength: "strong" },
    ],
    evidenceAgainst: [
      { point: "Programs were authorized under Section 215 of the Patriot Act (legal framework existed)", source: "Congressional reports", strength: "moderate" },
      { point: "FISA court provides judicial oversight (though critics call it a 'rubber stamp')", source: "FISA court records", strength: "weak" },
    ],
    whoBenefits: ["Intelligence agencies (expanded power/budget)", "Defense contractors (surveillance tech contracts)", "Politicians (access to information on opponents)"],
    whoLoses: ["Citizens (privacy rights)", "Journalists (source protection)", "Whistleblowers (exposure risk)", "Democracy (chilling effect on free speech)"],
    unansweredQuestions: [
      "Full extent of data collection still unknown — Snowden released a fraction of documents",
      "How much of the collected data is actually used vs stored indefinitely?",
      "Have surveillance tools been used for political purposes domestically?",
      "What programs exist that haven't been leaked yet?",
    ],
    sources: [
      { title: "The Guardian — NSA Files", url: "https://www.theguardian.com/us-news/the-nsa-files" },
      { title: "Washington Post — PRISM", url: "https://www.washingtonpost.com/investigations/us-intelligence-mining-data-from-nine-us-internet-companies-in-broad-secret-program/2013/06/06/3a0c0da8-cebf-11e2-8845-d970ccb04497_story.html" },
      { title: "EFF — NSA Spying", url: "https://www.eff.org/nsa-spying" },
    ],
    confidenceInOfficial: 10,
    status: "confirmed",
  },
  {
    id: "pharma-opioid",
    title: "Opioid Crisis & Pharmaceutical Industry",
    category: "Corporate",
    officialNarrative: "The opioid crisis was an unforeseen consequence of treating chronic pain. Pharmaceutical companies acted within FDA guidelines and medical best practices.",
    alternativeTheory: "Pharmaceutical companies (primarily Purdue Pharma / Sackler family) deliberately misrepresented addiction risks of OxyContin, aggressively marketed to doctors, and lobbied against regulation — knowingly causing the addiction epidemic for profit.",
    evidenceFor: [
      { point: "Purdue Pharma pled guilty to federal criminal charges (2007 and 2020) for misleading regulators and the public about OxyContin's addiction risk", source: "DOJ Press Release, 2020", strength: "strong" },
      { point: "Internal Purdue documents showed they knew OxyContin was addictive but marketed it as having 'less than 1%' addiction rate", source: "Court filings, multiple state AG lawsuits", strength: "strong" },
      { point: "Purdue spent $200M+ marketing OxyContin directly to doctors, including branded merchandise and paid speaker programs", source: "Senate investigation, GAO reports", strength: "strong" },
      { point: "Sackler family extracted $10.7B from Purdue while the crisis killed 500,000+ Americans", source: "House Oversight Committee report", strength: "strong" },
      { point: "McKinsey & Company advised Purdue on how to 'turbocharge' opioid sales and offered to pay rebates for OD deaths", source: "Massachusetts AG lawsuit, McKinsey settlement $573M", strength: "strong" },
    ],
    evidenceAgainst: [
      { point: "FDA approved OxyContin — regulatory system failed, not just one company", source: "FDA records", strength: "moderate" },
      { point: "Doctors had prescribing responsibility and many over-prescribed independently", source: "Medical literature", strength: "moderate" },
    ],
    whoBenefits: ["Sackler family ($10.7B extracted)", "Purdue Pharma executives", "Pharmaceutical distributors (McKesson, Cardinal, AmerisourceBergen)", "McKinsey ($573M in consulting fees)", "Pain management industry"],
    whoLoses: ["500,000+ Americans dead from opioid overdoses (1999-2020)", "Millions addicted", "Healthcare system ($78.5B/year in costs)", "Families and communities devastated", "Trust in pharmaceutical industry"],
    unansweredQuestions: [
      "Why did FDA approve the misleading 'less than 1% addiction' label?",
      "How many FDA officials later worked for pharmaceutical companies (revolving door)?",
      "Full extent of lobbying spending to prevent regulation?",
      "Sackler family has immunity from future lawsuits — is this just?",
    ],
    sources: [
      { title: "DOJ — Purdue Guilty Plea", url: "https://www.justice.gov/opa/pr/opioid-manufacturer-purdue-pharma-admits-guilt-federal-criminal-charges" },
      { title: "Empire of Pain (Patrick Radden Keefe)", url: "https://www.penguinrandomhouse.com/books/612000/empire-of-pain-by-patrick-radden-keefe/" },
      { title: "House Oversight — Sackler Family Investigation", url: "https://oversight.house.gov/blog/new-documents-show-sacklers-involvement-in-opioid-crisis/" },
    ],
    confidenceInOfficial: 5,
    status: "confirmed",
  },
  {
    id: "lab-leak",
    title: "COVID-19 Origin",
    category: "Science/Government",
    officialNarrative: "SARS-CoV-2 emerged through natural zoonotic spillover from animals to humans at the Huanan Seafood Market in Wuhan, China.",
    alternativeTheory: "SARS-CoV-2 may have accidentally leaked from the Wuhan Institute of Virology (WIV), which conducted gain-of-function research on bat coronaviruses, located miles from the first outbreak cluster.",
    evidenceFor: [
      { point: "WIV conducted gain-of-function research on bat coronaviruses, published in peer-reviewed journals pre-pandemic", source: "Shi Zhengli et al., Nature Medicine 2015, Virologica Sinica 2018", strength: "strong" },
      { point: "FBI and DOE assessed lab leak as most likely origin (low-to-moderate confidence)", source: "US Intelligence Community assessment, Feb 2023", strength: "moderate" },
      { point: "No intermediate animal host has been identified despite 3+ years of searching", source: "WHO, multiple studies", strength: "moderate" },
      { point: "WIV researchers reportedly fell ill with COVID-like symptoms in November 2019 (before official outbreak)", source: "Wall Street Journal, US intelligence", strength: "moderate" },
      { point: "SARS-CoV-2 has a furin cleavage site not found in closest known bat coronaviruses — unusual for natural evolution", source: "Multiple virology papers, Science 2022", strength: "moderate" },
    ],
    evidenceAgainst: [
      { point: "Early cases clustered around Huanan Market, consistent with zoonotic origin", source: "Worobey et al., Science 2022", strength: "moderate" },
      { point: "Two SARS-CoV-2 lineages suggest two separate animal-to-human spillover events", source: "Pekar et al., Science 2022", strength: "moderate" },
      { point: "Raccoon dogs at the market tested positive for SARS-CoV-2 genetic material", source: "Crits-Christoph et al., 2023 preprint", strength: "moderate" },
      { point: "CIA, NIC, and 4 other agencies lean toward natural origin (low confidence)", source: "US IC assessment", strength: "weak" },
    ],
    whoBenefits: ["China (if natural origin narrative holds — avoids accountability)", "EcoHealth Alliance / Peter Daszak (funded WIV research — conflict of interest in investigation)", "NIH/NIAID (funded gain-of-function through EcoHealth)", "Pharmaceutical industry (pandemic = vaccine market)"],
    whoLoses: ["7 million+ dead worldwide", "Global economy ($16T+ in losses)", "Public trust in science and government", "Gain-of-function researchers (if lab leak confirmed → stricter oversight)"],
    unansweredQuestions: [
      "China has refused independent investigation of WIV — what are they hiding?",
      "WIV database of bat virus sequences was taken offline Sept 2019 — why?",
      "Full scope of US-funded gain-of-function research at WIV still classified",
      "Were safety protocols at WIV adequate for BSL-4 work?",
      "Why did the WHO initial investigation include Peter Daszak who funded WIV?",
    ],
    sources: [
      { title: "US IC Assessment on COVID Origins", url: "https://www.dni.gov/files/ODNI/documents/assessments/Report-on-Potential-Links-Between-the-Wuhan-Institute-of-Virology-and-the-Origin-of-COVID-19.pdf" },
      { title: "Worobey et al. — Huanan Market Analysis", url: "https://www.science.org/doi/10.1126/science.abp8715" },
      { title: "Shi Zhengli — Bat Coronavirus Research", url: "https://www.nature.com/articles/nm.3985" },
      { title: "WSJ — WIV Researcher Illness", url: "https://www.wsj.com/articles/intelligence-agency-covid-origin-china-lab-leak-b4e1c83c" },
    ],
    confidenceInOfficial: 40,
    status: "unresolved",
  },
]

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed True", color: "border-emerald-300 text-emerald-700 bg-emerald-50" },
  debunked: { label: "Debunked", color: "border-red-300 text-red-700 bg-red-50" },
  unresolved: { label: "Unresolved", color: "border-amber-300 text-amber-700 bg-amber-50" },
  "partially-confirmed": { label: "Partially Confirmed", color: "border-blue-300 text-blue-700 bg-blue-50" },
}

const STRENGTH_COLORS = { strong: "text-emerald-700", moderate: "text-blue-700", weak: "text-amber-700" }

export default function InvestigatePage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [savedItems, setSavedItems] = useState<string[]>([])

  useEffect(() => {
    try { setSavedItems(JSON.parse(localStorage.getItem("hfp-research-saved") || "[]")) } catch {}
  }, [])

  function toggleSave(id: string) {
    const updated = savedItems.includes(id) ? savedItems.filter(i => i !== id) : [...savedItems, id]
    setSavedItems(updated)
    localStorage.setItem("hfp-research-saved", JSON.stringify(updated))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-zinc-900">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Investigate: Evidence Evaluation</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Official narratives vs alternative theories. Evidence for and against. Who benefits, who loses. Sources on everything. You decide.
        </p>
      </div>

      <Card className="border-2 border-slate-200 bg-slate-50/20">
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Our framework:</strong> For every major event or claim, we present: (1) the official narrative,
            (2) the alternative theory, (3) evidence supporting each with source links and strength ratings,
            (4) who benefits and who loses from each narrative being true, (5) unanswered questions, and
            (6) a confidence assessment. We do not tell you what to believe. We show you the evidence and
            <Explain tip="Cui bono — Latin for 'who benefits?' The most important question in any investigation. Follow the incentives to understand the motivations."> follow the incentives</Explain>.
            90%+ of "conspiracy theories" from the last decade have had significant elements confirmed.
            Dismissing without investigating is as intellectually lazy as believing without evidence.
          </p>
        </CardContent>
      </Card>

      {/* Investigation cards */}
      {INVESTIGATIONS.map(inv => {
        const isExpanded = expanded === inv.id
        const isSaved = savedItems.includes(inv.id)
        const status = STATUS_CONFIG[inv.status]
        const forScore = inv.evidenceFor.length
        const againstScore = inv.evidenceAgainst.length
        const totalEvidence = forScore + againstScore

        return (
          <Card key={inv.id} className={cn("border-2", isExpanded ? "border-violet-200" : "")}>
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold">{inv.title}</p>
                    <Badge variant="outline" className={cn("text-[8px]", status.color)}>{status.label}</Badge>
                    <Badge variant="outline" className="text-[8px]">{inv.category}</Badge>
                  </div>
                  {/* Evidence balance bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-emerald-600">{forScore} for</span>
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-400" style={{ width: `${(forScore / totalEvidence) * 100}%` }} />
                      <div className="h-full bg-red-400" style={{ width: `${(againstScore / totalEvidence) * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-red-600">{againstScore} against</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleSave(inv.id)} className={cn("p-1.5 rounded border transition-colors", isSaved ? "bg-violet-100 border-violet-300" : "hover:bg-muted/50")} title="Save to research">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setExpanded(isExpanded ? null : inv.id)} className="p-1.5 rounded border hover:bg-muted/50">
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Collapsed summary */}
              {!isExpanded && (
                <p className="text-[10px] text-muted-foreground line-clamp-2">{inv.alternativeTheory}</p>
              )}

              {/* Expanded full view */}
              {isExpanded && (
                <div className="space-y-3 mt-3">
                  {/* Official narrative */}
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                    <p className="text-[9px] font-semibold text-blue-700 mb-1">Official Narrative</p>
                    <p className="text-[10px] text-muted-foreground">{inv.officialNarrative}</p>
                  </div>

                  {/* Alternative theory */}
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-[9px] font-semibold text-amber-700 mb-1">Alternative Theory</p>
                    <p className="text-[10px] text-muted-foreground">{inv.alternativeTheory}</p>
                  </div>

                  {/* Evidence FOR alternative */}
                  <div>
                    <p className="text-[10px] font-semibold text-emerald-700 mb-1 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Evidence Supporting Alternative ({inv.evidenceFor.length})</p>
                    {inv.evidenceFor.map((e, i) => (
                      <div key={i} className="flex items-start gap-2 ml-4 mb-1">
                        <span className={cn("text-[9px] shrink-0 font-medium", STRENGTH_COLORS[e.strength])}>[{e.strength}]</span>
                        <div>
                          <p className="text-[10px] text-muted-foreground">{e.point}</p>
                          {e.source && <p className="text-[9px] text-blue-600">{e.source}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Evidence AGAINST alternative */}
                  <div>
                    <p className="text-[10px] font-semibold text-red-700 mb-1 flex items-center gap-1"><XCircle className="h-3 w-3" /> Evidence Against Alternative ({inv.evidenceAgainst.length})</p>
                    {inv.evidenceAgainst.map((e, i) => (
                      <div key={i} className="flex items-start gap-2 ml-4 mb-1">
                        <span className={cn("text-[9px] shrink-0 font-medium", STRENGTH_COLORS[e.strength])}>[{e.strength}]</span>
                        <div>
                          <p className="text-[10px] text-muted-foreground">{e.point}</p>
                          {e.source && <p className="text-[9px] text-blue-600">{e.source}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Who benefits / who loses */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                      <p className="text-[9px] font-semibold text-emerald-700 flex items-center gap-1"><DollarSign className="h-3 w-3" /> Who Benefits</p>
                      {inv.whoBenefits.map((b, i) => <p key={i} className="text-[9px] text-muted-foreground ml-3">• {b}</p>)}
                    </div>
                    <div className="rounded-lg bg-red-50 border border-red-200 p-2">
                      <p className="text-[9px] font-semibold text-red-700 flex items-center gap-1"><Users className="h-3 w-3" /> Who Loses</p>
                      {inv.whoLoses.map((l, i) => <p key={i} className="text-[9px] text-muted-foreground ml-3">• {l}</p>)}
                    </div>
                  </div>

                  {/* Unanswered questions */}
                  <div className="rounded-lg bg-violet-50 border border-violet-200 p-2">
                    <p className="text-[9px] font-semibold text-violet-700 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Unanswered Questions</p>
                    {inv.unansweredQuestions.map((q, i) => <p key={i} className="text-[9px] text-muted-foreground ml-3">• {q}</p>)}
                  </div>

                  {/* Sources */}
                  <div className="rounded-lg border p-2">
                    <p className="text-[9px] font-semibold mb-1">Sources</p>
                    {inv.sources.map((s, i) => (
                      <p key={i} className="text-[9px]">
                        {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{s.title} <ExternalLink className="h-2 w-2 inline" /></a> : s.title}
                      </p>
                    ))}
                  </div>

                  {/* Confidence meter */}
                  <div className="text-center">
                    <p className="text-[9px] text-muted-foreground mb-1">Confidence in official narrative</p>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", inv.confidenceInOfficial > 60 ? "bg-emerald-400" : inv.confidenceInOfficial > 30 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${inv.confidenceInOfficial}%` }} />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{inv.confidenceInOfficial}% — based on available evidence</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>This is a starting framework.</strong> As users contribute data and the Aletheia integration deepens,
            every investigation will have more evidence, more sources, and more connections. The goal is not to
            confirm or debunk — it is to <strong>organize the evidence so you can evaluate it yourself</strong>.
            The platform never tells you what to think. It shows you what the data shows, who benefits, and
            lets you follow the threads.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/scientific-literacy" className="text-sm text-teal-600 hover:underline">Scientific Literacy</a>
        <a href="/climate-data" className="text-sm text-green-600 hover:underline">Climate Data</a>
        <a href="/cognitive-biases" className="text-sm text-red-600 hover:underline">Cognitive Biases</a>
        <a href="/mental-models" className="text-sm text-amber-600 hover:underline">Mental Models</a>
        <a href="/canada" className="text-sm text-red-600 hover:underline">Canada Analysis</a>
      </div>
    </div>
  )
}
