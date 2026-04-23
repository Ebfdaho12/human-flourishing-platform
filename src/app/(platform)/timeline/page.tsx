"use client"

import { useState, useMemo, useEffect } from "react"
import useSWR from "swr"
import {
  Clock, Heart, Brain, GraduationCap, Landmark, Zap, FlaskConical,
  TrendingUp, Building2, BookOpen, Trophy, Target, Flame, Scale,
  Sparkles, CheckSquare, Star, Calendar, Filter, ArrowDown,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type EventKind =
  | "win" | "goal" | "habit-start" | "habit-milestone" | "decision"
  | "reflection" | "first-log" | "mood-shift" | "achievement" | "level"

type TimelineEvent = {
  id: string
  kind: EventKind
  title: string
  detail?: string
  timestamp: string // ISO
  module?: string
}

const KIND_META: Record<EventKind, { icon: any; color: string; bg: string; ring: string; label: string }> = {
  "win":             { icon: Trophy,       color: "text-amber-600",    bg: "bg-amber-100",    ring: "ring-amber-200",   label: "Wins" },
  "goal":            { icon: Target,       color: "text-violet-600",   bg: "bg-violet-100",   ring: "ring-violet-200",  label: "Goals" },
  "habit-start":     { icon: CheckSquare,  color: "text-emerald-600",  bg: "bg-emerald-100",  ring: "ring-emerald-200", label: "Habit starts" },
  "habit-milestone": { icon: Flame,        color: "text-orange-600",   bg: "bg-orange-100",   ring: "ring-orange-200",  label: "Milestones" },
  "decision":        { icon: Scale,        color: "text-blue-600",     bg: "bg-blue-100",     ring: "ring-blue-200",    label: "Decisions" },
  "reflection":      { icon: BookOpen,     color: "text-indigo-600",   bg: "bg-indigo-100",   ring: "ring-indigo-200",  label: "Reflections" },
  "first-log":       { icon: Sparkles,     color: "text-fuchsia-600",  bg: "bg-fuchsia-100",  ring: "ring-fuchsia-200", label: "First logs" },
  "mood-shift":      { icon: Brain,        color: "text-rose-600",     bg: "bg-rose-100",     ring: "ring-rose-200",    label: "Mood shifts" },
  "achievement":     { icon: Star,         color: "text-yellow-600",   bg: "bg-yellow-100",   ring: "ring-yellow-200",  label: "Achievements" },
  "level":           { icon: TrendingUp,   color: "text-teal-600",     bg: "bg-teal-100",     ring: "ring-teal-200",    label: "Level-ups" },
}

const MODULE_ICON: Record<string, any> = {
  HEALTH: Heart, MENTAL_HEALTH: Brain, EDUCATION: GraduationCap,
  GOVERNANCE: Landmark, ENERGY: Zap, DESCI: FlaskConical,
  ECONOMICS: TrendingUp, INFRASTRUCTURE: Building2,
}

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try { return JSON.parse(json) as T } catch { return fallback }
}

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

function formatDateFull(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.floor(days / 365)
  return `${years}y ago`
}

function startOfMonth(iso: string): string {
  const d = new Date(iso)
  d.setDate(1); d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function movingAvg(arr: number[], window: number): number[] {
  const out: number[] = []
  for (let i = 0; i < arr.length; i++) {
    const s = Math.max(0, i - window + 1)
    const slice = arr.slice(s, i + 1)
    out.push(slice.reduce((a, b) => a + b, 0) / slice.length)
  }
  return out
}

export default function TimelinePage() {
  const { data: activityData } = useSWR("/api/dashboard/activity", fetcher)
  const { data: achievementsData } = useSWR("/api/achievements", secureFetcher)
  const { data: moodData } = useSWR("/api/mental-health/mood?limit=90", secureFetcher)
  const { data: goalsData } = useSWR("/api/goals/all", secureFetcher)

  // Local sources
  const [local, setLocal] = useState<{
    wins: any[]; decisions: any[]; habits: any[];
    reflections: any[]; flourishingHistory: any[];
  }>({ wins: [], decisions: [], habits: [], reflections: [], flourishingHistory: [] })

  useEffect(() => {
    setLocal({
      wins:               safeParse(localStorage.getItem("hfp-wins"), []),
      decisions:          safeParse(localStorage.getItem("hfp-decisions"), []),
      habits:             safeParse(localStorage.getItem("hfp-daily-habits"), []),
      reflections:        safeParse(localStorage.getItem("hfp-weekly-reflections"), []),
      flourishingHistory: safeParse(localStorage.getItem("hfp-flourishing-history"), []),
    })
  }, [])

  const [activeFilters, setActiveFilters] = useState<Set<EventKind>>(new Set())

  // ===== Aggregate timeline events =====
  const events = useMemo<TimelineEvent[]>(() => {
    const out: TimelineEvent[] = []

    // 1. Wins (localStorage)
    for (const w of local.wins) {
      if (!w?.date) continue
      out.push({
        id: `win-${w.id}`, kind: "win",
        title: w.size === "big" ? "Major win" : w.size === "medium" ? "Weekly win" : "Win logged",
        detail: w.text, timestamp: w.date,
      })
    }

    // 2. Goals completed (from API) + goals created
    const goals = goalsData?.goals ?? []
    for (const g of goals) {
      if (g.completedAt) {
        out.push({
          id: `goal-done-${g.id}`, kind: "goal",
          title: "Goal completed",
          detail: `${g.title}${g.target ? ` — ${g.target}` : ""}`,
          timestamp: g.completedAt, module: g.module,
        })
      }
    }

    // 3. Habits — start dates + milestone streaks
    const MILESTONES = [7, 30, 100, 365]
    for (const h of local.habits) {
      const dates: string[] = Array.isArray(h.completedDates) ? [...h.completedDates].sort() : []
      if (dates.length === 0) continue
      // Start date = first completion
      out.push({
        id: `habit-start-${h.id}`, kind: "habit-start",
        title: "Started habit",
        detail: h.name || h.title || "New habit",
        timestamp: new Date(dates[0] + "T12:00:00").toISOString(),
      })
      // Consecutive-run milestones
      let run = 1
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1] + "T12:00:00").getTime()
        const curr = new Date(dates[i] + "T12:00:00").getTime()
        const gap = Math.round((curr - prev) / 86400000)
        if (gap === 1) {
          run++
          if (MILESTONES.includes(run)) {
            out.push({
              id: `habit-milestone-${h.id}-${run}-${dates[i]}`, kind: "habit-milestone",
              title: `${run}-day streak`,
              detail: `${h.name || "Habit"} — ${run} days consecutive`,
              timestamp: new Date(dates[i] + "T12:00:00").toISOString(),
            })
          }
        } else {
          run = 1
        }
      }
    }

    // 4. Decisions (journal)
    for (const d of local.decisions) {
      if (!d?.date) continue
      out.push({
        id: `dec-${d.id}`, kind: "decision",
        title: "Major decision",
        detail: d.title,
        timestamp: new Date(d.date + "T12:00:00").toISOString(),
      })
      if (d.status === "reviewed" && d.reviewDate) {
        out.push({
          id: `dec-rev-${d.id}`, kind: "decision",
          title: d.wasRight ? "Decision paid off" : "Decision reviewed",
          detail: d.title,
          timestamp: new Date(d.reviewDate + "T12:00:00").toISOString(),
        })
      }
    }

    // 5. Weekly reflections (only substantive ones)
    for (const r of local.reflections) {
      if (!r?.date) continue
      const wordCount = (r.biggestWin || "").split(/\s+/).length + (r.lesson || "").split(/\s+/).length
      if (wordCount < 6) continue
      out.push({
        id: `refl-${r.id || r.date}`, kind: "reflection",
        title: "Weekly reflection",
        detail: r.biggestWin || r.lesson || "Reflected on the week",
        timestamp: new Date(r.date + "T12:00:00").toISOString(),
      })
    }

    // 6. Achievements earned (server-side, timestamp approximated by joining with activity feed)
    // We only know earned/not earned, so we anchor them to the newest platform activity as approximate earned dates.
    const badges = achievementsData?.badges ?? []
    const feed = activityData?.feed ?? []
    const feedByModule: Record<string, string> = {}
    for (const f of feed) {
      if (!feedByModule[f.module]) feedByModule[f.module] = f.timestamp
    }
    for (const b of badges) {
      if (!b.earned) continue
      // Best guess: use the most recent activity timestamp, or now.
      const approx = feed[0]?.timestamp || new Date().toISOString()
      out.push({
        id: `ach-${b.id}`, kind: "achievement",
        title: `Achievement: ${b.name}`,
        detail: b.description, timestamp: approx,
      })
    }

    // 7. First-ever logs per module (from activity feed — take oldest per module)
    const oldestByModule: Record<string, { ts: string; detail: string }> = {}
    for (const f of feed) {
      const cur = oldestByModule[f.module]
      if (!cur || new Date(f.timestamp).getTime() < new Date(cur.ts).getTime()) {
        oldestByModule[f.module] = { ts: f.timestamp, detail: f.action }
      }
    }
    for (const [mod, v] of Object.entries(oldestByModule)) {
      out.push({
        id: `first-${mod}`, kind: "first-log",
        title: `First ${mod.replace("_", " ").toLowerCase()} entry`,
        detail: v.detail, timestamp: v.ts, module: mod,
      })
    }

    // 8. Mood shifts — detect significant week-over-week changes in 7-day moving average
    const moods = (moodData?.entries ?? []).slice().reverse() // chrono order
    if (moods.length >= 14) {
      const scores = moods.map((m: any) => Number(m.score) || 0)
      const ma = movingAvg(scores, 7)
      // Look for shifts of >= 1.5 points between consecutive days
      const seen = new Set<string>()
      for (let i = 7; i < ma.length; i++) {
        const delta = ma[i] - ma[i - 7]
        if (Math.abs(delta) >= 1.5) {
          const ts = (moods[i]?.recordedAt || moods[i]?.createdAt) as string
          if (!ts) continue
          const monthKey = ts.slice(0, 7)
          if (seen.has(monthKey)) continue // cap at one per month
          seen.add(monthKey)
          out.push({
            id: `mood-shift-${ts}`, kind: "mood-shift",
            title: delta > 0 ? "Mood trending up" : "Mood trending down",
            detail: `7-day average shifted ${delta > 0 ? "+" : ""}${delta.toFixed(1)} points`,
            timestamp: ts,
          })
        }
      }
    }

    // 9. Flourishing level-ups (score crossed a threshold)
    const fh = [...local.flourishingHistory].reverse() // chrono
    const thresholds = [40, 60, 75, 90]
    const crossed = new Set<number>()
    for (let i = 1; i < fh.length; i++) {
      for (const t of thresholds) {
        if (crossed.has(t)) continue
        if (fh[i - 1].score < t && fh[i].score >= t) {
          crossed.add(t)
          out.push({
            id: `level-${t}-${fh[i].date}`, kind: "level",
            title: `Flourishing level ${t}+ reached`,
            detail: `Composite score crossed ${t}`,
            timestamp: new Date(fh[i].date + "T12:00:00").toISOString(),
          })
        }
      }
    }

    // Sort newest first
    return out.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [local, goalsData, achievementsData, activityData, moodData])

  // ===== Filter chips =====
  const kindCounts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const e of events) c[e.kind] = (c[e.kind] ?? 0) + 1
    return c
  }, [events])

  const filtered = activeFilters.size === 0
    ? events
    : events.filter(e => activeFilters.has(e.kind))

  function toggleFilter(k: EventKind) {
    const next = new Set(activeFilters)
    if (next.has(k)) next.delete(k)
    else next.add(k)
    setActiveFilters(next)
  }

  // ===== Quick jumps =====
  const now = Date.now()
  const weekAgo = now - 7 * 86400000
  const monthAgo = now - 30 * 86400000

  const thisWeekCount = events.filter(e => new Date(e.timestamp).getTime() >= weekAgo).length
  const thisMonthCount = events.filter(e => new Date(e.timestamp).getTime() >= monthAgo).length

  function scrollTo(daysAgo: number) {
    const target = now - daysAgo * 86400000
    // Find first event id that falls into the cutoff
    const el = filtered.find(e => new Date(e.timestamp).getTime() <= target)
    if (!el) return
    const node = document.getElementById(`evt-${el.id}`)
    if (node) node.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // ===== Year in review =====
  const hasYearOfData = useMemo(() => {
    if (events.length < 2) return false
    const oldest = events[events.length - 1]?.timestamp
    const newest = events[0]?.timestamp
    if (!oldest || !newest) return false
    const months = (new Date(newest).getTime() - new Date(oldest).getTime()) / (30 * 86400000)
    return months >= 12
  }, [events])

  const yearInReview = useMemo(() => {
    if (!hasYearOfData) return null
    const yearAgo = now - 365 * 86400000
    const y = events.filter(e => new Date(e.timestamp).getTime() >= yearAgo)
    const wins = y.filter(e => e.kind === "win").length
    const goalsDone = y.filter(e => e.kind === "goal").length
    const habitMilestones = y.filter(e => e.kind === "habit-milestone").length
    const decisions = y.filter(e => e.kind === "decision").length
    const reflections = y.filter(e => e.kind === "reflection").length
    const levelUps = y.filter(e => e.kind === "level").length
    return { wins, goalsDone, habitMilestones, decisions, reflections, levelUps, total: y.length }
  }, [events, hasYearOfData, now])

  // ===== Group by month =====
  const grouped = useMemo(() => {
    const g: Record<string, TimelineEvent[]> = {}
    for (const e of filtered) {
      const key = startOfMonth(e.timestamp)
      if (!g[key]) g[key] = []
      g[key].push(e)
    }
    return g
  }, [filtered])

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Your Life Timeline</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Every win, milestone, decision, and shift — assembled chronologically from everything you track.
        </p>
      </div>

      {/* Empty state */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No timeline events yet.</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Log a win, complete a habit, journal a decision — this page assembles itself as you live.
            </p>
            <div className="flex gap-2 justify-center mt-4 flex-wrap">
              <a href="/wins" className="text-xs text-amber-600 hover:underline">Log a win</a>
              <a href="/daily-habits" className="text-xs text-emerald-600 hover:underline">Track habits</a>
              <a href="/decision-journal" className="text-xs text-blue-600 hover:underline">Journal a decision</a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Year in review */}
          {yearInReview && (
            <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50/40 to-indigo-50/40">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <p className="text-sm font-semibold">Year in Review</p>
                  <Badge variant="outline" className="text-[9px] ml-auto">last 365 days</Badge>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {[
                    { label: "Wins",        value: yearInReview.wins,            icon: Trophy,      color: "text-amber-600" },
                    { label: "Goals",       value: yearInReview.goalsDone,       icon: Target,      color: "text-violet-600" },
                    { label: "Milestones",  value: yearInReview.habitMilestones, icon: Flame,       color: "text-orange-600" },
                    { label: "Decisions",   value: yearInReview.decisions,       icon: Scale,       color: "text-blue-600" },
                    { label: "Reflections", value: yearInReview.reflections,     icon: BookOpen,    color: "text-indigo-600" },
                    { label: "Level-ups",   value: yearInReview.levelUps,        icon: TrendingUp,  color: "text-teal-600" },
                  ].map((s, i) => {
                    const Icon = s.icon
                    return (
                      <div key={i} className="rounded-lg bg-background/70 border p-2.5 text-center">
                        <Icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
                        <p className="text-xl font-bold leading-none">{s.value}</p>
                        <p className="text-[9px] text-muted-foreground mt-1">{s.label}</p>
                      </div>
                    )
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                  {yearInReview.total} events across every dimension of your life. This is evidence of who you have been becoming.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick jumps */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => scrollTo(7)}
              className="text-xs rounded-lg border px-3 py-1.5 hover:bg-muted/50 transition-colors inline-flex items-center gap-1.5"
            >
              <Calendar className="h-3 w-3" />
              This week
              <Badge variant="outline" className="text-[9px] ml-1">{thisWeekCount}</Badge>
            </button>
            <button
              onClick={() => scrollTo(30)}
              className="text-xs rounded-lg border px-3 py-1.5 hover:bg-muted/50 transition-colors inline-flex items-center gap-1.5"
            >
              <Calendar className="h-3 w-3" />
              This month
              <Badge variant="outline" className="text-[9px] ml-1">{thisMonthCount}</Badge>
            </button>
            {events.length > 10 && (
              <button
                onClick={() => {
                  const last = events[events.length - 1]
                  const node = document.getElementById(`evt-${last.id}`)
                  if (node) node.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
                className="text-xs rounded-lg border px-3 py-1.5 hover:bg-muted/50 transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowDown className="h-3 w-3" />
                Beginning
              </button>
            )}
          </div>

          {/* Filter chips */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Filter by type</p>
                {activeFilters.size > 0 && (
                  <button
                    onClick={() => setActiveFilters(new Set())}
                    className="text-[10px] text-blue-600 hover:underline ml-auto"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(KIND_META) as EventKind[]).map(k => {
                  const meta = KIND_META[k]
                  const count = kindCounts[k] ?? 0
                  if (count === 0) return null
                  const active = activeFilters.has(k)
                  const Icon = meta.icon
                  return (
                    <button
                      key={k}
                      onClick={() => toggleFilter(k)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] transition-all",
                        active
                          ? `${meta.bg} ${meta.color} border-transparent font-medium ring-2 ${meta.ring}`
                          : "bg-background hover:bg-muted/50 border-border text-muted-foreground",
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {meta.label}
                      <span className={cn("text-[9px] opacity-70", active && "opacity-100")}>{count}</span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-xs text-muted-foreground">No events match the current filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="relative pb-4">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-violet-200 via-border to-transparent" />

              {Object.entries(grouped).map(([monthStart, items]) => (
                <div key={monthStart} className="mb-6">
                  {/* Month divider */}
                  <div className="relative flex items-center gap-3 mb-3 sticky top-0 z-10 bg-background/90 backdrop-blur py-1">
                    <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 border-2 border-background shadow-sm">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{monthLabel(monthStart)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {items.length} {items.length === 1 ? "event" : "events"}
                      </p>
                    </div>
                  </div>

                  {/* Items for this month */}
                  <div className="ml-[19px] pl-8 space-y-2">
                    {items.map((e) => {
                      const meta = KIND_META[e.kind]
                      const Icon = meta.icon
                      const ModIcon = e.module ? MODULE_ICON[e.module] : null
                      return (
                        <div key={e.id} id={`evt-${e.id}`} className="group flex items-start gap-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 p-2 -ml-2 transition-colors">
                          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", meta.bg)}>
                            <Icon className={cn("h-4 w-4", meta.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 flex-wrap">
                              <p className="text-sm font-medium leading-tight">{e.title}</p>
                              {ModIcon && (
                                <ModIcon className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                              )}
                              <span className="text-[10px] text-muted-foreground shrink-0 ml-auto">
                                {timeAgo(e.timestamp)}
                              </span>
                            </div>
                            {e.detail && (
                              <p className="text-xs text-muted-foreground mt-0.5 leading-snug break-words">
                                {e.detail}
                              </p>
                            )}
                            <p className="text-[9px] text-muted-foreground/70 mt-1">
                              {formatDateFull(e.timestamp)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Footer links */}
      <div className="flex gap-3 flex-wrap text-xs border-t pt-4">
        <a href="/life-os" className="text-violet-600 hover:underline">Life OS</a>
        <a href="/progress" className="text-emerald-600 hover:underline">Progress</a>
        <a href="/wins" className="text-amber-600 hover:underline">Wins</a>
        <a href="/weekly-reflection" className="text-indigo-600 hover:underline">Weekly Reflection</a>
        <a href="/decision-journal" className="text-blue-600 hover:underline">Decision Journal</a>
      </div>
    </div>
  )
}
