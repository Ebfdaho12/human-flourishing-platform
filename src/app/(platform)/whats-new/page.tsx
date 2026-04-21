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
