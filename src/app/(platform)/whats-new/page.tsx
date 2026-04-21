"use client"

import { useState } from "react"
import { Bell, Star, Shield, Heart, Brain, DollarSign, Users, Zap, TrendingUp, Moon, Activity, BookOpen, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Update {
  date: string
  title: string
  description: string
  category: "feature" | "security" | "health" | "finance" | "community" | "data" | "content"
  link?: string
  major?: boolean
}

const UPDATES: Update[] = [
  { date: "2026-04-21", title: "Lunar Cycle Tracker", description: "Track your mood, sleep, energy, and pain against moon phases. Includes real-time moon phase calculation, daily logging, and 10 documented correlation domains (sleep, markets, births, animal behavior). Measure first, understand later.", category: "feature", link: "/lunar-cycles", major: true },
  { date: "2026-04-21", title: "Chinese Zodiac Compatibility", description: "3,000-year-old pattern matching system. Add people in your life by birth year and see compatibility — triangles of affinity, secret friends, clashes, and harms. Data-driven, not newspaper horoscopes.", category: "feature", link: "/chinese-zodiac", major: true },
  { date: "2026-04-21", title: "Fascia: The Hidden System", description: "Comprehensive fascia health page featuring Jason Van Blerk / Human Garage fascial maneuvers, Tom Myers' anatomy trains, 6 fascial lines mapped, 8 conditions linked to fascia, 6 protocol sections, and the science of emotional storage in connective tissue.", category: "health", link: "/fascia", major: true },
  { date: "2026-04-21", title: "Life Trajectory Simulator", description: "If you keep doing exactly what you're doing today — where will you be in 1, 5, 10, and 20 years? Projects finances (compound interest), health (exercise/sleep scoring), and growth (books/screen time). Adjust inputs to see YOUR trajectory change in real-time.", category: "feature", link: "/trajectory", major: true },
  { date: "2026-04-21", title: "Zero-Knowledge Encryption Activated", description: "Client-side AES-256-GCM encryption now wired into 12 components. Health data, mood entries, journal, family messages, and wallet data are encrypted IN YOUR BROWSER before reaching our servers. We literally cannot read your data.", category: "security", major: true },
  { date: "2026-04-21", title: "CSRF Protection", description: "All state-changing API requests now require CSRF token validation. Combined with session auth and client-side encryption, this creates three layers of defense.", category: "security" },
  { date: "2026-04-21", title: "Morning Briefing", description: "Personalized daily dashboard with greeting, year progress, mood/health snapshot, streaks, active goals, moon phase, and daily wisdom quote. Start every day with clarity.", category: "feature", link: "/morning-briefing" },
  { date: "2026-04-21", title: "Milestone Celebrations", description: "The platform now celebrates your wins — streak milestones (7/14/30/60/100/365 days), token milestones, health logging milestones, and page visit milestones. With confetti.", category: "feature" },
  { date: "2026-04-21", title: "Audit Logging System", description: "Every sensitive data operation (health entries, mood logs, journal CRUD, profile updates, data exports, account deletions) is now logged in an audit trail. Visible to admins.", category: "security" },
  { date: "2026-04-21", title: "GDPR Compliance", description: "Full data export (download ALL your data as JSON) and complete account deletion (irreversible, requires typing 'DELETE MY ACCOUNT'). Your data, your control.", category: "data", link: "/settings/data" },
  { date: "2026-04-21", title: "Error Handling Hardened", description: "All 75+ API route handlers now have proper try-catch error handling. No stack traces leak to the client. Consistent error responses across the entire platform.", category: "security" },
  { date: "2026-04-21", title: "Redis-Ready Rate Limiting", description: "Rate limiting system upgraded to support Upstash Redis for distributed rate limiting across horizontal instances. Falls back to in-memory when Redis is unavailable.", category: "security" },
  { date: "2026-04-21", title: "Aletheia Connection Indicator", description: "Canada analysis pages now show related figures and narratives available on the Aletheia Truth Protocol, with direct links to search for accountability data.", category: "content" },
  { date: "2026-04-21", title: "Admin Panel Enhanced", description: "Admin dashboard now has Overview, Audit Logs (with filtering), and Feedback tabs. Monitor platform health, review user feedback, and track all system activity.", category: "feature" },
  { date: "2026-04-21", title: "Breathwork & Meditation", description: "Guided breathwork protocols — Box Breathing, Wim Hof, 4-7-8, physiological sigh, and more. Visual breathing timer, session tracking, and the science behind each technique.", category: "health", link: "/breathwork" },
  { date: "2026-04-21", title: "Body Composition Tracker", description: "Track weight, body fat %, muscle mass, waist, and more over time. Visual trend charts, BMI/FFMI calculators, and realistic body recomposition timelines.", category: "health", link: "/body-composition" },
  { date: "2026-04-21", title: "RPG Character Sheet", description: "Your real-life RPG stats — VIT, RES, WIS, AWR, WLT, SOC. XP from every action. Level up from Novice to Transcendent. 12 achievement badges. Active buffs from streaks.", category: "feature", link: "/character-sheet", major: true },
  { date: "2026-04-21", title: "Flourishing Score", description: "One number (0-100) that captures how well you're doing across mood, sleep, exercise, habits, gratitude, and consistency. Animated ring visualization with history.", category: "feature", link: "/flourishing-score" },
  { date: "2026-04-21", title: "Daily Habits Checklist", description: "10 default habits + custom. Check off with one click, visual 7-day grid, streak tracking per habit, progress bar. The operating system of people who flourish.", category: "feature", link: "/daily-habits" },
  { date: "2026-04-21", title: "Gratitude Journal", description: "Three things every day. Science: 21 days rewires your brain (UC Davis). Word cloud of what you're most grateful for. 90 seconds that change neurology.", category: "feature", link: "/gratitude" },
  { date: "2026-04-21", title: "Evening Review", description: "Close the day with intention. Rate your day, log your win, capture lessons, set tomorrow's priority. Weekly averages for day rating, energy, and stress.", category: "feature", link: "/evening-review" },
  { date: "2026-04-21", title: "Visual Trends Dashboard", description: "Sparkline charts for mood, sleep, exercise, weight, and heart rate. Trend arrows (improving/declining/stable). Period selector. Active streaks summary.", category: "feature", link: "/trends" },
  { date: "2026-04-21", title: "Cold Exposure & Hormesis", description: "Wim Hof/Huberman/Soberg research. 250% dopamine increase. Progressive protocols. Session tracker. Immune boost (29% fewer sick days).", category: "health", link: "/cold-exposure" },
  { date: "2026-04-21", title: "Sauna & Heat Exposure", description: "Laukkanen Finnish study: 63% reduced cardiac death at 4-7x/week. Heat shock proteins, growth hormone surge (up to 16x). Three protocols.", category: "health", link: "/sauna" },
  { date: "2026-04-21", title: "Sleep Optimization", description: "Matthew Walker research, sleep architecture, circadian rhythm, 7 protocols (temperature, light, timing, nutrition, environment, supplements, exercise).", category: "health", link: "/sleep-optimization" },
  { date: "2026-04-21", title: "Nutrition Fundamentals", description: "Macros, micronutrient deficiencies, hydration, meal timing, gut health connection, anti-inflammatory foods. Top 5 highest-ROI nutrition changes.", category: "health", link: "/nutrition" },
  { date: "2026-04-21", title: "Posture & Structural Health", description: "Chain of dysfunction from phone/desk use. Forward head, rounded shoulders, anterior pelvic tilt correction protocols. 5-minute daily reset.", category: "health", link: "/posture" },
  { date: "2026-04-21", title: "Strength Training Programs", description: "3 structured programs: beginner full-body 3x/wk, intermediate upper/lower 4x/wk, advanced PPL 6x/wk. Progressive overload science.", category: "health", link: "/strength-training" },
  { date: "2026-04-21", title: "Peptides: The Complete Guide", description: "20+ peptides across 7 categories with research data, mechanisms, protocols, side effects, and regulatory status. The most comprehensive reference anywhere.", category: "health", link: "/peptides", major: true },
  { date: "2026-04-21", title: "Testosterone Optimization", description: "Natural optimization ranked by impact: sleep, training, body fat, stress, nutrition. Supplements with RCT data. When to test. Women's section too.", category: "health", link: "/testosterone" },
  { date: "2026-04-21", title: "Supplements: Evidence-Based Guide", description: "19 supplements across 3 tiers rated A-D by evidence. Effective doses, timing, interactions. 'The Stack' — if you could only take 5.", category: "health", link: "/supplements" },
  { date: "2026-04-21", title: "Fasting Protocols & Autophagy", description: "Ohsumi Nobel Prize research. Hour-by-hour timeline. 6 protocols. 2025 clinical trial data. What breaks a fast. Who should NOT fast.", category: "health", link: "/fasting" },
  { date: "2026-04-21", title: "Dopamine & The Attention Economy", description: "What dopamine actually is (Lembke/Huberman). Supernormal stimuli. Healthy sources (+250% from cold). Reset protocols. Finance connection.", category: "health", link: "/dopamine" },
  { date: "2026-04-21", title: "Anxiety & Stress Toolkit", description: "Research-backed techniques by speed: immediate (physiological sigh), short-term (cold, journaling), daily (exercise, magnesium), cognitive (STOP method).", category: "health", link: "/anxiety-toolkit" },
  { date: "2026-04-21", title: "Mental Models", description: "20 thinking frameworks: first principles, inversion, second-order thinking, Pareto, compounding, incentives, survivorship bias, and more.", category: "content", link: "/mental-models", major: true },
  { date: "2026-04-21", title: "Cognitive Biases", description: "25 bugs in human thinking across 5 categories. Each with what it is, the real-life cost, and how to counter it. Plus the meta-bias.", category: "content", link: "/cognitive-biases" },
  { date: "2026-04-21", title: "Practical Stoicism", description: "6 actionable frameworks from Marcus Aurelius, Seneca, Epictetus. Dichotomy of control, memento mori, amor fati. Daily Stoic practice.", category: "content", link: "/stoicism" },
  { date: "2026-04-21", title: "Scientific Literacy", description: "How to evaluate claims yourself. Evidence hierarchy, p-values, correlation vs causation, publication bias. Read a study in 5 minutes.", category: "content", link: "/scientific-literacy" },
  { date: "2026-04-21", title: "Decision Journal", description: "TradeZilla-style: record decisions with reasoning and confidence. Review outcomes. Track accuracy and calibration gap over time.", category: "feature", link: "/decision-journal" },
  { date: "2026-04-21", title: "Negotiation Playbook", description: "6 scenarios with scripts: salary, rent, car, medical bills, subscriptions, freelance. Chris Voss techniques. Saves thousands.", category: "content", link: "/negotiation-guide" },
  { date: "2026-04-21", title: "Book Library", description: "20 essential books across 6 categories with key takeaways and links to which platform pages they connect to.", category: "content", link: "/book-library" },
  { date: "2026-04-21", title: "Communication Toolkit", description: "NVC (4-step template), attachment styles, active listening, Gottman's Four Horsemen, repair attempts, difficult conversations.", category: "content", link: "/communication" },
  { date: "2026-04-21", title: "Emergency Preparedness", description: "72-hour kit, financial emergency, medical emergency (CPR/choking/bleeding), power outage, natural disasters, document checklist.", category: "content", link: "/emergency-prep" },
  { date: "2026-04-21", title: "Focus Timer", description: "Pomodoro technique with configurable sessions, auto-cycling, session history, and 14-day focus minutes chart.", category: "feature", link: "/focus-timer" },
  { date: "2026-04-21", title: "Water Tracker", description: "Visual water glass with quick-add buttons, daily goal, streak tracking, and fascia hydration connection.", category: "health", link: "/water-tracker" },
  { date: "2026-04-21", title: "Energy Management", description: "Four dimensions (Physical, Emotional, Mental, Spiritual). Ultradian rhythms. Energy audit logging. Tony Schwartz + Huberman.", category: "feature", link: "/energy-management" },
  { date: "2026-04-21", title: "Vision Board", description: "Goal visualization with category cards, status cycling (dream→achieved), reorder, and the science of RAS priming.", category: "feature", link: "/vision-board" },
  { date: "2026-04-21", title: "30-Day Challenges", description: "12 built-in challenges (cold, gratitude, digital detox, reading, etc.) + custom. Daily check-off, calendar grid, completion badges.", category: "feature", link: "/30-day-challenges" },
  { date: "2026-04-21", title: "Life Operating System", description: "Unified command center pulling from every data source: mood, sleep, habits, water, focus, tokens, streaks, challenges, goals.", category: "feature", link: "/life-os", major: true },
  { date: "2026-04-21", title: "People Tracker", description: "Personal CRM for relationships. Contact recency, quality scores, birthday calendar, reach-out reminders. Harvard Study validated.", category: "feature", link: "/people" },
  { date: "2026-04-21", title: "Skill Tree", description: "RPG-style skill progression across 7 categories. Level 1-10 per skill. Focus areas. Feeds into character sheet stats.", category: "feature", link: "/skill-tree" },
  { date: "2026-04-21", title: "Letter to Future Self", description: "Time-capsule letters with delivery dates (1 month to 5 years). Sealed with countdown, revealed on date.", category: "feature", link: "/future-self" },
  { date: "2026-04-21", title: "Universal Search (Cmd+K)", description: "Spotlight-style search overlay indexing 112 pages. Keyboard navigation, category grouping. Find any tool instantly.", category: "feature" },
  { date: "2026-04-21", title: "Hive Mind (Preview)", description: "Anonymous aggregate data visualization concept. Crowdsourced health science — your data stays encrypted, patterns become visible to all.", category: "data", link: "/hive-mind" },
  { date: "2026-04-21", title: "Cloud-Synced Storage", description: "All trackers now backup to encrypted database. Cross-device persistence. Offline-capable with automatic sync when online.", category: "security" },
  { date: "2026-04-21", title: "Financial Independence Calculator", description: "Interactive FI calculator with 4% rule, 25x rule, projection chart. What changes your timeline. The psychology of enough.", category: "finance", link: "/financial-independence" },
]

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  feature: { icon: Star, color: "text-violet-500 bg-violet-50 border-violet-200", label: "Feature" },
  security: { icon: Shield, color: "text-emerald-500 bg-emerald-50 border-emerald-200", label: "Security" },
  health: { icon: Heart, color: "text-rose-500 bg-rose-50 border-rose-200", label: "Health" },
  finance: { icon: DollarSign, color: "text-blue-500 bg-blue-50 border-blue-200", label: "Finance" },
  community: { icon: Users, color: "text-amber-500 bg-amber-50 border-amber-200", label: "Community" },
  data: { icon: Activity, color: "text-cyan-500 bg-cyan-50 border-cyan-200", label: "Data" },
  content: { icon: BookOpen, color: "text-indigo-500 bg-indigo-50 border-indigo-200", label: "Content" },
}

export default function WhatsNewPage() {
  const [filter, setFilter] = useState<string | null>(null)
  const filtered = filter ? UPDATES.filter(u => u.category === filter) : UPDATES

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">What's New</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Latest additions, improvements, and security updates to the platform.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter(null)} className={cn("px-3 py-1 rounded-full text-xs border transition-colors", !filter ? "bg-violet-100 border-violet-300 text-violet-700" : "hover:bg-muted/50")}>All</button>
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilter(filter === key ? null : key)} className={cn("px-3 py-1 rounded-full text-xs border transition-colors", filter === key ? cfg.color : "hover:bg-muted/50")}>{cfg.label}</button>
        ))}
      </div>

      {/* Updates */}
      <div className="space-y-3">
        {filtered.map((update, i) => {
          const cfg = CATEGORY_CONFIG[update.category]
          const Icon = cfg.icon
          return (
            <Card key={i} className={cn(update.major ? "border-2 border-violet-200" : "")}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", cfg.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold">{update.title}</p>
                      {update.major && <Badge className="bg-violet-500 text-[8px] py-0">Major</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{update.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-[8px]">{update.date}</Badge>
                      {update.link && <a href={update.link} className="text-[10px] text-violet-600 hover:underline">Open →</a>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex gap-3 flex-wrap">
        <a href="/dashboard" className="text-sm text-violet-600 hover:underline">Dashboard</a>
        <a href="/morning-briefing" className="text-sm text-amber-600 hover:underline">Morning Briefing</a>
        <a href="/tools" className="text-sm text-blue-600 hover:underline">All Tools</a>
      </div>
    </div>
  )
}
