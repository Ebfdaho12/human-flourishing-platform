"use client"

import { useState } from "react"
import {
  GraduationCap, TrendingDown, AlertTriangle, ArrowRight, ChevronDown,
  Globe2, DollarSign, Monitor, BookOpen, Users, Brain
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const PISA_SCORES = [
  { country: "Singapore", math: 575, reading: 543, science: 561, trend: "Rising", note: "World #1. Rigorous curriculum, highly paid teachers, national standard." },
  { country: "Japan", math: 536, reading: 516, science: 547, trend: "Stable", note: "Strong discipline, less screen time in schools, emphasis on problem-solving." },
  { country: "South Korea", math: 527, reading: 515, science: 528, trend: "Stable", note: "Intense academic culture. High scores but mental health concerns." },
  { country: "Estonia", math: 510, reading: 511, science: 530, trend: "Rising", note: "Best in Europe. Teacher autonomy, low-tech classrooms, play-based early years." },
  { country: "Finland", math: 484, reading: 490, science: 511, trend: "Declining", note: "Was #1 — declining since introducing more tech in schools. Still strong in equity." },
  { country: "Canada", math: 497, reading: 507, science: 515, trend: "Declining", note: "Was top 5 — now middle of pack. Math declining fastest. Reading held longer." },
  { country: "UK", math: 489, reading: 494, science: 503, trend: "Stable", note: "Mixed results. Strong private schools pull up averages." },
  { country: "United States", math: 465, reading: 504, science: 499, trend: "Declining", note: "Math scores worst in 20 years (PISA 2023). Reading held steady." },
  { country: "OECD Average", math: 472, reading: 476, science: 485, trend: "Declining", note: "Global decline since screens entered classrooms at scale." },
]

const PROVINCIAL_SPENDING = [
  { province: "Ontario", perStudent: 14800, teachers: 130000, classSize: 24, pisaMath: "Below national avg", note: "Largest system. Chronic underfunding claims despite being near national average spending. Teacher shortages in math/science." },
  { province: "Quebec", perStudent: 13200, teachers: 95000, classSize: 22, pisaMath: "ABOVE national avg", note: "Spends LESS per student but scores HIGHER in math. French immersion + less tech focus. Teacher shortage is severe." },
  { province: "Alberta", perStudent: 15600, teachers: 48000, classSize: 23, pisaMath: "Above national avg", note: "Historically highest scores. Strong curriculum standards. Recently introduced new curriculum (controversial)." },
  { province: "British Columbia", perStudent: 14200, teachers: 45000, classSize: 25, pisaMath: "At national avg", note: "New curriculum focuses on 'competencies' over content. Mixed results. Teacher pay among highest." },
  { province: "Saskatchewan", perStudent: 16200, teachers: 14000, classSize: 20, pisaMath: "Below national avg", note: "Highest per-student spending. Small class sizes. Rural delivery challenges. Indigenous education gap significant." },
  { province: "Manitoba", perStudent: 15400, teachers: 16000, classSize: 22, pisaMath: "Below national avg", note: "High spending but low outcomes. Northern and Indigenous communities face extreme challenges." },
  { province: "Nova Scotia", perStudent: 14000, teachers: 10000, classSize: 24, pisaMath: "At national avg", note: "Teacher shortage. Aging population means declining enrollment in some areas." },
]

const PROBLEMS = [
  {
    issue: "Screens in Classrooms",
    data: "PISA 2023: students who used devices 1+ hours/day in class scored 40 points LOWER in math than those who didn't",
    explanation: "Sweden removed tablets from classrooms in 2023 — scores immediately improved. The OECD's own analysis concluded that technology in schools has NOT improved learning outcomes and may be harming them. Yet Canada continues to invest in classroom technology while scores decline.",
    fix: "Follow Sweden's lead: remove tablets/laptops from K-8 classrooms. Use technology only for specific purposes (coding, research) in secondary school. Invest in books, manipulatives, and trained teachers instead of screens.",
  },
  {
    issue: "Teacher Shortage (Math & Science)",
    data: "Ontario alone needs 3,000+ math/science teachers. Many classes taught by teachers without subject specialization",
    explanation: "Teaching pays less than comparable private-sector careers for STEM graduates. A math graduate can earn $90K+ in tech or finance vs $55-65K starting as a teacher. The result: not enough qualified math/science teachers, so schools fill positions with teachers qualified in other subjects. Your child's 'math teacher' may have a history degree.",
    fix: "Pay math/science teachers more (subject-specific premiums, as done in the UK and Singapore). Fast-track STEM professionals into teaching (8-month alternative certification vs 2-year B.Ed). Loan forgiveness for math/science teachers who stay 5+ years.",
  },
  {
    issue: "Declining Literacy & Numeracy",
    data: "25% of Canadian adults score below Level 2 in literacy (can't understand a newspaper article). 50% score below Level 2 in numeracy.",
    explanation: "Phonics-based reading instruction (proven by research) was abandoned by many provinces in favor of 'whole language' / 'balanced literacy' approaches in the 1990s-2000s. The result: a generation of weak readers. Ontario recently mandated a return to phonics after the 'Right to Read' report found the system was failing children with dyslexia and other learning differences.",
    fix: "Mandate structured literacy (phonics-based) instruction in all provinces. Screen all children for reading difficulties in Grade 1 (not Grade 3 when it's harder to catch up). Math: return to fundamentals — memorize multiplication tables, practice computation. Discovery-based math failed.",
  },
  {
    issue: "University Costs & Credential Inflation",
    data: "Average Canadian undergraduate debt: $28,000. Many jobs requiring degrees didn't 10 years ago",
    explanation: "Credential inflation: jobs that used to require a high school diploma now require a degree. Jobs that required a degree now require a master's. This benefits universities (more tuition revenue) but not students or employers. Meanwhile, skilled trades pay $70-130K with 4-year apprenticeships that PAY you to learn — and face critical shortages.",
    fix: "Stop subsidizing demand (student loans inflate tuition). Promote trades as equally valuable to degrees. Employer education tax credits for on-the-job training. German model: 50%+ of students enter apprenticeships directly from high school, earning while they learn.",
  },
  {
    issue: "Indigenous Education Gap",
    data: "On-reserve graduation rate: ~40% vs national average ~90%. Funding is 30-40% below provincial levels",
    explanation: "Education on reserves is federally funded (unlike provincially-funded schools) at significantly lower per-student rates. Facilities are often inadequate. Teacher turnover is high because reserves are remote and pay is lower. The residential school system deliberately destroyed Indigenous education systems — the current system has not adequately replaced them.",
    fix: "Funding parity: federal per-student spending must match or exceed provincial levels. Community-controlled education (Indigenous-designed curricula incorporating language, culture, and land-based learning). Teacher housing and pay incentives for remote communities. High-speed internet for every school.",
  },
  {
    issue: "No National Standards",
    data: "Every province has its own curriculum, graduation requirements, and teacher certification. A math credit in Ontario ≠ a math credit in Quebec",
    explanation: "Education is provincially controlled (Constitution Act, 1867). There are no national standards, no national testing, and no national accountability. This means quality varies dramatically by province, and moving between provinces disrupts children's education. Countries with national standards (Singapore, Finland, Estonia) consistently outperform fragmented systems.",
    fix: "National assessment standards (not necessarily a national curriculum — but agreed benchmarks). CMEC (Council of Ministers of Education) should set minimum standards that all provinces meet. National teacher certification portability — a qualified teacher in Ontario should be qualified in BC without recertification.",
  },
]

const WHAT_WORKS = [
  { country: "Finland", approach: "Play-based until age 7. No standardized testing until 16. Teachers are the most respected profession (requires master's degree). Short school days (4-5 hours). Almost no homework. Yet consistently top 5 globally.", key: "Trust teachers. Less testing, more learning. Play in early years builds foundations that drilling destroys." },
  { country: "Singapore", approach: "Rigorous, structured curriculum. Master teaching method (teach one concept deeply before moving on). Teachers paid equivalently to engineers/doctors. National standard — every student gets the same quality.", key: "High standards + high support + high teacher pay = high outcomes." },
  { country: "Estonia", approach: "Teacher autonomy within a national framework. Low-tech classrooms (books, not tablets). Strong early childhood education. Equity-focused — smallest achievement gap between rich and poor students.", key: "Proof that you don't need expensive technology to educate well. You need well-trained teachers and good books." },
  { country: "Germany", approach: "50%+ of students enter apprenticeships at 16. No stigma — apprenticeships are respected equally to university. Earn while you learn. Businesses help design curricula because they need the graduates.", key: "Not every student needs university. A system that respects multiple pathways produces better outcomes for everyone." },
]

export default function CanadaEducationPage() {
  const [expandedProblem, setExpandedProblem] = useState<number | null>(null)
  const [showComparisons, setShowComparisons] = useState(false)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-blue-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada's Education System</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Spending more, learning less. What is going wrong, what works elsewhere, and what would fix it.
        </p>
      </div>

      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-red-900 mb-2">The Decline</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada was a top-5 education country 15 years ago. PISA 2023 shows <strong>Canadian math scores have declined
            every cycle since 2012</strong>. Reading is holding but not improving. Meanwhile, spending per student has increased
            25%+ in real terms. More money, worse results. The problem is not funding — it is how we teach, what we
            teach, and the introduction of screens into classrooms without evidence that they help.
          </p>
        </CardContent>
      </Card>

      {/* PISA scores */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-blue-500" /> <Explain tip="Programme for International Student Assessment — a global test given every 3 years to 15-year-olds in 80+ countries. The most comprehensive international comparison of education quality">PISA</Explain> 2023 Scores
        </CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {PISA_SCORES.map((p, i) => (
            <div key={i} className={cn("rounded-lg border p-2.5 flex items-center gap-3",
              p.country === "Canada" ? "border-red-200 bg-red-50/10" : "border-border"
            )}>
              <span className="text-xs font-medium w-28 shrink-0">{p.country}</span>
              <div className="flex gap-3 flex-1 text-xs">
                <span>Math: <strong className={p.math >= 510 ? "text-emerald-600" : p.math >= 480 ? "text-amber-600" : "text-red-500"}>{p.math}</strong></span>
                <span>Read: <strong>{p.reading}</strong></span>
                <span>Sci: <strong>{p.science}</strong></span>
              </div>
              <Badge variant="outline" className={cn("text-[9px]",
                p.trend === "Rising" ? "text-emerald-600 border-emerald-300" :
                p.trend === "Declining" ? "text-red-500 border-red-300" : "text-muted-foreground"
              )}>{p.trend}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Provincial spending */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Provincial Spending vs Results</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {PROVINCIAL_SPENDING.map((p, i) => (
            <div key={i} className="rounded-lg border border-border p-2.5">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-medium">{p.province}</span>
                <span className="text-xs font-bold">${p.perStudent.toLocaleString()}/student</span>
              </div>
              <div className="flex gap-3 text-[10px] text-muted-foreground">
                <span>Teachers: {p.teachers.toLocaleString()}</span>
                <span>Class size: {p.classSize}</span>
                <span className={cn(p.pisaMath.includes("ABOVE") ? "text-emerald-600" : p.pisaMath.includes("Below") ? "text-red-500" : "")}>
                  Math: {p.pisaMath}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{p.note}</p>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground italic mt-2">
            Note: Quebec spends the LEAST per student but scores the HIGHEST in math. Saskatchewan spends the MOST but scores below average. More money ≠ better education.
          </p>
        </CardContent>
      </Card>

      {/* Problems */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" /> 6 Problems Driving the Decline
        </h2>
        <div className="space-y-3">
          {PROBLEMS.map((p, i) => {
            const isOpen = expandedProblem === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedProblem(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{p.issue}</p>
                      <p className="text-[10px] text-red-500">{p.data}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-7">
                      <p className="text-xs text-muted-foreground leading-relaxed">{p.explanation}</p>
                      <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-2.5">
                        <p className="text-xs text-emerald-700"><strong>Fix:</strong> {p.fix}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* What works */}
      <Card className="cursor-pointer" onClick={() => setShowComparisons(!showComparisons)}>
        <CardContent className="p-4 flex items-center gap-3">
          <Globe2 className="h-5 w-5 text-emerald-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold">What Works Elsewhere</p>
            <p className="text-[10px] text-muted-foreground">4 countries that consistently outperform — and how</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showComparisons && "rotate-180")} />
        </CardContent>
      </Card>
      {showComparisons && (
        <div className="space-y-3">
          {WHAT_WORKS.map((c, i) => (
            <Card key={i} className="border-emerald-200">
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-1">{c.country}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{c.approach}</p>
                <div className="rounded-lg bg-emerald-50 p-2">
                  <p className="text-xs text-emerald-700"><strong>Key lesson:</strong> {c.key}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> OECD PISA 2023, Statistics Canada (education spending), provincial education ministry reports,
            Right to Read Inquiry (Ontario), CMEC, OECD Education at a Glance, Programme for International Assessment of Adult Competencies (PIAAC).
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/root-causes" className="text-sm text-violet-600 hover:underline">Root Causes</a>
        <a href="/screen-time" className="text-sm text-blue-600 hover:underline">Screen Time</a>
        <a href="/education" className="text-sm text-emerald-600 hover:underline">Learning Paths</a>
      </div>
    </div>
  )
}
