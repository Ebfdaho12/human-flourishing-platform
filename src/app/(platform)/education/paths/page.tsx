"use client"

import { useState } from "react"
import { GraduationCap, BookOpen, ChevronRight, CheckCircle, Circle, Lock, Clock, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Pre-built learning paths — these don't need AI or database, they're curated curricula
const LEARNING_PATHS = [
  {
    id: "critical-thinking",
    title: "Critical Thinking & Media Literacy",
    description: "Learn to evaluate claims, spot logical fallacies, understand bias, and navigate information warfare.",
    color: "from-violet-500 to-purple-600",
    icon: "brain",
    duration: "4 weeks",
    modules: [
      { title: "What is Critical Thinking?", subject: "Philosophy", topic: "Introduction to critical thinking and why it matters", level: "BEGINNER" },
      { title: "Logical Fallacies", subject: "Philosophy", topic: "Common logical fallacies: ad hominem, straw man, false dichotomy, appeal to authority", level: "BEGINNER" },
      { title: "Cognitive Biases", subject: "Psychology", topic: "Confirmation bias, anchoring, Dunning-Kruger effect, and how they affect judgment", level: "BEGINNER" },
      { title: "Evaluating Sources", subject: "Philosophy", topic: "How to evaluate the credibility of a source: primary vs secondary, peer review, conflict of interest", level: "INTERMEDIATE" },
      { title: "Statistics & Misleading Data", subject: "Mathematics", topic: "How statistics are manipulated: cherry-picking, p-hacking, correlation vs causation", level: "INTERMEDIATE" },
      { title: "Media Literacy", subject: "Philosophy", topic: "How media frames stories, manufacturing consent, identifying propaganda techniques", level: "INTERMEDIATE" },
      { title: "Scientific Method", subject: "Philosophy", topic: "What makes something scientific: falsifiability, reproducibility, peer review", level: "INTERMEDIATE" },
      { title: "Applying Critical Thinking", subject: "Philosophy", topic: "Analyze a real-world controversial claim using everything you've learned", level: "ADVANCED" },
    ],
  },
  {
    id: "financial-literacy",
    title: "Financial Literacy & Economics",
    description: "Understand money, banking, investing, taxes, inflation, and how the economic system actually works.",
    color: "from-emerald-500 to-teal-600",
    icon: "money",
    duration: "6 weeks",
    modules: [
      { title: "How Money Works", subject: "Economics", topic: "History of money: barter, gold, fiat currency, fractional reserve banking", level: "BEGINNER" },
      { title: "Central Banking", subject: "Economics", topic: "What the Federal Reserve does, how interest rates affect everything, quantitative easing", level: "BEGINNER" },
      { title: "Personal Finance Basics", subject: "Economics", topic: "Budgeting, saving, compound interest, emergency funds", level: "BEGINNER" },
      { title: "Understanding Debt", subject: "Economics", topic: "Good debt vs bad debt, how credit works, student loans, mortgages", level: "BEGINNER" },
      { title: "Investing Fundamentals", subject: "Economics", topic: "Stocks, bonds, index funds, risk tolerance, dollar cost averaging", level: "INTERMEDIATE" },
      { title: "Taxes & Government Revenue", subject: "Economics", topic: "How income tax works, tax brackets, capital gains, how government spending is funded", level: "INTERMEDIATE" },
      { title: "Inflation & Purchasing Power", subject: "Economics", topic: "What causes inflation, how it erodes savings, the CPI, and real vs nominal values", level: "INTERMEDIATE" },
      { title: "Cryptocurrency & Digital Money", subject: "Economics", topic: "Bitcoin, blockchain, stablecoins, CBDCs — what they are and what they mean", level: "INTERMEDIATE" },
      { title: "Global Economics", subject: "Economics", topic: "Trade agreements, currency manipulation, IMF, World Bank, and how global economics affects you", level: "ADVANCED" },
      { title: "Economic Systems Compared", subject: "Economics", topic: "Capitalism, socialism, mixed economies — evidence-based comparison, not ideology", level: "ADVANCED" },
    ],
  },
  {
    id: "civic-engagement",
    title: "Civic Engagement & Governance",
    description: "How government works, your rights, how to participate, and how to hold power accountable.",
    color: "from-amber-500 to-orange-600",
    icon: "landmark",
    duration: "4 weeks",
    modules: [
      { title: "How Government Works", subject: "History", topic: "Three branches, checks and balances, federalism, how a bill becomes law", level: "BEGINNER" },
      { title: "Your Constitutional Rights", subject: "History", topic: "The Bill of Rights explained: what each amendment actually means in practice", level: "BEGINNER" },
      { title: "How Elections Work", subject: "History", topic: "Electoral college, primaries, gerrymandering, campaign finance, voter registration", level: "BEGINNER" },
      { title: "Local Government", subject: "History", topic: "City councils, school boards, zoning, property taxes — where most policy happens", level: "INTERMEDIATE" },
      { title: "How to Read Legislation", subject: "History", topic: "How to read a bill, find your representatives' votes, and understand policy language", level: "INTERMEDIATE" },
      { title: "Freedom of Information", subject: "History", topic: "How to file FOIA requests, public records, government transparency laws", level: "INTERMEDIATE" },
      { title: "Running for Office", subject: "History", topic: "How to run for local office: requirements, filing, campaigning, the reality of public service", level: "ADVANCED" },
    ],
  },
  {
    id: "health-science",
    title: "Health Science & Wellness",
    description: "Evidence-based health: nutrition, exercise, sleep, mental health, and how to evaluate medical claims.",
    color: "from-rose-500 to-red-600",
    icon: "health",
    duration: "5 weeks",
    modules: [
      { title: "How Your Body Works", subject: "Biology", topic: "Basic anatomy and physiology: cardiovascular, nervous, digestive, immune systems", level: "BEGINNER" },
      { title: "Nutrition Science", subject: "Biology", topic: "Macronutrients, micronutrients, how metabolism works, evidence vs fads", level: "BEGINNER" },
      { title: "Exercise Science", subject: "Biology", topic: "How exercise affects the body: cardiovascular health, muscle building, hormones, longevity", level: "BEGINNER" },
      { title: "Sleep Science", subject: "Biology", topic: "Sleep cycles, circadian rhythm, why sleep deprivation is dangerous, how to improve sleep", level: "BEGINNER" },
      { title: "Mental Health Fundamentals", subject: "Psychology", topic: "Anxiety, depression, stress response, neuroplasticity, evidence-based treatments", level: "INTERMEDIATE" },
      { title: "Evaluating Medical Claims", subject: "Biology", topic: "How to read a medical study, understand clinical trials, spot pharma marketing vs science", level: "INTERMEDIATE" },
      { title: "The Microbiome", subject: "Biology", topic: "Gut health, probiotics, the gut-brain connection, what the evidence actually says", level: "INTERMEDIATE" },
      { title: "Preventive Medicine", subject: "Biology", topic: "Screening guidelines, vaccination science, lifestyle medicine, risk factor management", level: "ADVANCED" },
    ],
  },
  {
    id: "tech-literacy",
    title: "Technology & Digital Sovereignty",
    description: "Understand how technology works, protect your privacy, and think critically about the digital world.",
    color: "from-blue-500 to-cyan-600",
    icon: "tech",
    duration: "4 weeks",
    modules: [
      { title: "How the Internet Works", subject: "Computer Science", topic: "DNS, HTTP, TCP/IP, servers, encryption, how data travels from server to your screen", level: "BEGINNER" },
      { title: "Digital Privacy", subject: "Computer Science", topic: "VPNs, encryption, tracking cookies, metadata, how tech companies collect and sell your data", level: "BEGINNER" },
      { title: "How Algorithms Shape Your Reality", subject: "Computer Science", topic: "Recommendation algorithms, filter bubbles, engagement optimization, algorithmic bias", level: "INTERMEDIATE" },
      { title: "Artificial Intelligence", subject: "Computer Science", topic: "How AI actually works: machine learning, neural networks, LLMs, capabilities and limitations", level: "INTERMEDIATE" },
      { title: "Cybersecurity Basics", subject: "Computer Science", topic: "Password security, two-factor authentication, phishing, social engineering, protecting yourself", level: "INTERMEDIATE" },
      { title: "Blockchain & Decentralization", subject: "Computer Science", topic: "How blockchain works, smart contracts, decentralized systems, self-sovereign identity", level: "ADVANCED" },
    ],
  },
]

export default function LearningPathsPage() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  const activePath = LEARNING_PATHS.find(p => p.id === selectedPath)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Learning Paths</h1>
        </div>
        <p className="text-sm text-muted-foreground">Structured curricula for self-directed learning. Every path uses the AI tutor.</p>
      </div>

      {!activePath ? (
        <div className="space-y-4">
          {LEARNING_PATHS.map((path) => (
            <Card key={path.id} className="card-hover cursor-pointer" onClick={() => setSelectedPath(path.id)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={cn("inline-flex px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r mb-3", path.color)}>
                      {path.modules.length} lessons · {path.duration}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{path.title}</h3>
                    <p className="text-sm text-muted-foreground">{path.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/30 shrink-0 mt-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedPath(null)} className="text-sm">
            ← All paths
          </Button>

          <Card className={cn("bg-gradient-to-r text-white", activePath.color)}>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold">{activePath.title}</h2>
              <p className="text-white/80 text-sm mt-1">{activePath.description}</p>
              <div className="flex gap-3 mt-3 text-white/70 text-xs">
                <span>{activePath.modules.length} lessons</span>
                <span>·</span>
                <span>{activePath.duration}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {activePath.modules.map((mod, i) => (
              <a key={i} href={`/education`} className="block">
                <Card className="card-hover">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{mod.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{mod.topic}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{mod.level.toLowerCase()}</Badge>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>

          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Click any lesson to start a tutoring session with the AI. The tutor will guide you through the topic using the Socratic method.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
