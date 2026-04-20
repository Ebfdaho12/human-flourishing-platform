"use client"

import { useState } from "react"
import { Brain, ChevronDown, AlertCircle, TrendingUp, Globe, Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const DATA_POINTS = [
  { stat: "1 in 5", label: "Canadians experience a mental health problem each year", source: "CAMH, 2023" },
  { stat: "50%", label: "of Canadians who will ever have a mental illness show symptoms by age 14", source: "Mental Health Commission" },
  { stat: "6–18 months", label: "Average wait time for a psychiatrist in Canada", source: "CMHA Wait Times Survey" },
  { stat: "72%", label: "Increase in anxiety disorder diagnoses among teens 2016–2022", source: "Statistics Canada" },
  { stat: "$51B", label: "Annual economic cost of mental illness in Canada (lost productivity + healthcare)", source: "MHCC estimate" },
  { stat: "75%", label: "Canadians who need mental health care don't receive it", source: "CAMH" },
]

const PROVINCIAL = [
  { province: "Ontario", spend_per_capita: "$42", wait_psych: "6–12 months", notes: "Largest province, highest absolute spend but not per-capita leader. OHIP+ covers 24 psychotherapy sessions for OHIP-insured." },
  { province: "BC", spend_per_capita: "$51", wait_psych: "4–8 months", notes: "Higher per-capita spend. Stepped Care 2.0 model expanding digital and community-based care." },
  { province: "Alberta", spend_per_capita: "$46", wait_psych: "6–14 months", notes: "Recovery Alberta created 2024, separating mental health and addictions from AHS." },
  { province: "Quebec", spend_per_capita: "$38", wait_psych: "8–18 months", notes: "Lower per-capita spend. Heavy reliance on CLSCs for mental health — often underfunded." },
  { province: "Saskatchewan", spend_per_capita: "$35", wait_psych: "10–18 months", notes: "Rural access is a major challenge. Many residents have no local psychiatrist." },
  { province: "Manitoba", spend_per_capita: "$37", wait_psych: "8–16 months", notes: "Indigenous communities face particularly severe mental health access gaps." },
]

const TEEN_SECTION = [
  { title: "The numbers", body: "Since 2012 — the year smartphones became ubiquitous — rates of teen depression, anxiety, and self-harm have risen sharply in Canada, the US, UK, and Australia simultaneously. Statistics Canada data shows anxiety disorder diagnoses among 15–24 year olds increased 72% from 2016 to 2022. Emergency room visits for teen self-harm increased 60% over the same period." },
  { title: "Social media correlation", body: "Psychologist Jonathan Haidt's research (The Anxious Generation, 2024) documents that girls are more severely affected (compare-based platforms: Instagram, TikTok), boys less so but still meaningfully. The displacement of in-person socialization with screen-based interaction coincides with the mental health deterioration. Causation vs. correlation is still debated, but the timing and cross-national simultaneity is striking." },
  { title: "What's not happening", body: "Childhood poverty, academic pressure, and parental stress haven't dramatically changed since 2012. The smartphone/social media hypothesis fits the data pattern better than most alternatives. Australia has passed legislation banning social media for under-16s (2024). Canada has not acted." },
]

const SOLUTIONS = [
  { country: "UK", program: "IAPT (Improving Access to Psychological Therapies)", desc: "Launched 2008. Trained 10,000+ new therapists. Created a stepped-care model: mild → guided self-help; moderate → group CBT; severe → individual therapy. Wait times under 6 weeks for initial assessment. Recovery rates 50%+. Cost: ~£250/patient for a course of treatment. Canada could replicate this — the barriers are political will and training capacity, not money." },
  { country: "Australia", program: "headspace", desc: "Youth-focused (12–25) mental health network launched 2006. 160+ centres nationally. Integrates mental health, physical health, alcohol/drugs, and vocational support in one location. Destigmatized, youth-designed spaces. Serves 100,000+ young people annually. Canada has pilot sites but no national rollout." },
  { country: "Netherlands", program: "Mental Health in Primary Care", desc: "GP-integrated mental health: every GP office has an embedded mental health nurse. First-contact mental health support without referral. Reduces specialist wait lists by handling mild-to-moderate cases in primary care. Canada's siloed system has no equivalent." },
  { country: "Canada pilot", program: "BC Stepped Care 2.0", desc: "BC's current innovation: digital tools (apps, online CBT) at Step 1; peer support at Step 2; brief therapy at Step 3; specialist care at Step 4. Most people need lower-intensity interventions — matching need to intensity reduces wait lists. Early results promising but not yet provincial standard." },
]

const CRISIS_RESOURCES = [
  { name: "988 Suicide Crisis Helpline", contact: "Call or text 988", desc: "National. Launched November 2023. Free, 24/7, connects to local crisis services." },
  { name: "Crisis Services Canada", contact: "1-833-456-4566", desc: "National, 24/7 suicide prevention." },
  { name: "Kids Help Phone", contact: "1-800-668-6868 / text HELLO to 686868", desc: "Youth-focused (under 25), bilingual, 24/7." },
  { name: "First Nations and Inuit Hope for Wellness", contact: "1-855-242-3310", desc: "Culturally competent crisis support for Indigenous peoples." },
  { name: "Trans Lifeline", contact: "1-877-330-6366", desc: "Peer support for trans and gender-diverse people." },
]

export default function MentalHealthCrisisPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada's Mental Health Crisis</h1>
        </div>
        <p className="text-sm text-muted-foreground">Data-driven overview: rates, wait times, provincial spending, teen mental health, what works elsewhere, and crisis resources.</p>
      </div>

      <Card className="border-2 border-violet-200 bg-violet-50/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-medium text-violet-900">Key insight: Canada underfunds mental health relative to its GDP and peers.</p>
          <p className="text-sm text-violet-700 mt-1">Canada spends approximately 7% of health care dollars on mental health. The UK and Netherlands spend 13–14%. The OECD average is 12%. The result: 6–18 month psychiatrist wait times and 75% of people who need care not receiving it.</p>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-violet-600" />
          <p className="text-sm font-semibold">The Numbers</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DATA_POINTS.map((d, i) => (
            <Card key={i} className="border">
              <CardContent className="pt-3 pb-3">
                <p className="text-2xl font-bold text-violet-600">{d.stat}</p>
                <p className="text-xs text-muted-foreground mt-1">{d.label}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{d.source}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">Provincial Spending Comparison</p>
        <div className="space-y-2">
          {PROVINCIAL.map((p, i) => (
            <Card key={i} className="border">
              <CardContent className="pt-0 pb-0">
                <button onClick={() => setExpanded(expanded === `prov-${i}` ? null : `prov-${i}`)} className="w-full flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{p.province}</span>
                    <Badge variant="secondary" className="text-xs">{p.spend_per_capita}/capita</Badge>
                    <Badge variant="outline" className="text-xs text-muted-foreground">{p.wait_psych} wait</Badge>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", expanded === `prov-${i}` && "rotate-180")} />
                </button>
                {expanded === `prov-${i}` && <p className="pb-3 text-sm text-muted-foreground border-t pt-3">{p.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Per-capita figures approximate mental health-specific spending from provincial budgets. Methodology varies.</p>
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">Teen Mental Health: What the Data Shows</p>
        <div className="space-y-2">
          {TEEN_SECTION.map((item, i) => (
            <Card key={i} className="border">
              <CardContent className="pt-0 pb-0">
                <button onClick={() => setExpanded(expanded === `teen-${i}` ? null : `teen-${i}`)} className="w-full flex items-center justify-between py-3">
                  <span className="text-sm font-semibold">{item.title}</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", expanded === `teen-${i}` && "rotate-180")} />
                </button>
                {expanded === `teen-${i}` && <p className="pb-4 text-sm text-muted-foreground border-t pt-3">{item.body}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-emerald-600" />
          <p className="text-sm font-semibold">What Works Elsewhere</p>
        </div>
        <div className="space-y-2">
          {SOLUTIONS.map((s, i) => (
            <Card key={i} className="border border-emerald-100">
              <CardContent className="pt-0 pb-0">
                <button onClick={() => setExpanded(expanded === `sol-${i}` ? null : `sol-${i}`)} className="w-full flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 text-left">
                    <Badge className="text-xs bg-emerald-100 text-emerald-700 shrink-0">{s.country}</Badge>
                    <span className="text-sm font-semibold">{s.program}</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", expanded === `sol-${i}` && "rotate-180")} />
                </button>
                {expanded === `sol-${i}` && <p className="pb-4 text-sm text-muted-foreground border-t pt-3">{s.desc}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-2 border-red-200 bg-red-50/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="h-4 w-4 text-red-600" />
            <p className="text-sm font-semibold text-red-900">Crisis Resources</p>
          </div>
          <div className="space-y-3">
            {CRISIS_RESOURCES.map((r, i) => (
              <div key={i}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <Badge className="bg-red-100 text-red-700 text-xs">{r.contact}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/canada/healthcare" className="hover:underline text-foreground">Canada Healthcare</a>
        <a href="/screen-time" className="hover:underline text-foreground">Screen Time</a>
        <a href="/sleep-calculator" className="hover:underline text-foreground">Sleep</a>
        <a href="/canada/spending" className="hover:underline text-foreground">Canada Spending</a>
      </div>
    </div>
  )
}
