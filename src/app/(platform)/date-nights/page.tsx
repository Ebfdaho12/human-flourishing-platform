"use client"

import { useState, useMemo } from "react"
import { Heart, RotateCcw, Clock, DollarSign, Star, Sparkles, Plus, Calendar, TrendingUp, AlertCircle, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useSyncedStorage } from "@/hooks/use-synced-storage"

type DateLog = { id: string; date: string; activity: string; type: string; cost?: string; partner?: string; rating: number; notes?: string }

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}
const daysBetween = (a: string, b: string) => Math.abs(Math.floor((new Date(a).getTime() - new Date(b).getTime()) / 86400000))

const DATE_IDEAS: { idea: string; cost: string; time: string; type: string; description: string }[] = [
  // Free / At Home
  { idea: "Cook a new recipe together", cost: "Free", time: "1-2 hrs", type: "At Home", description: "Pick a cuisine neither of you has tried. Cook it together. The mess is part of the fun." },
  { idea: "Backyard fire pit + conversation cards", cost: "Free", time: "1-2 hrs", type: "At Home", description: "No phones. Ask each other questions you have never asked. 'What is your happiest memory?' 'What scares you most?' 'Where do you see us in 10 years?'" },
  { idea: "Movie marathon (your era)", cost: "Free", time: "3-4 hrs", type: "At Home", description: "Watch the movies you loved when you first started dating. Nostalgia is a powerful reconnection tool." },
  { idea: "Living room dance night", cost: "Free", time: "1 hr", type: "At Home", description: "Put on music from your wedding or early relationship. Dance in your living room. It sounds cheesy. It works." },
  { idea: "Stargazing", cost: "Free", time: "1-2 hrs", type: "At Home", description: "Blanket in the backyard. Download a constellation app. Talk about the universe. Perspective changes everything." },
  { idea: "Write letters to each other", cost: "Free", time: "30 min", type: "At Home", description: "Write what you appreciate about each other. Read them aloud. Keep them. Read them when things get hard." },
  { idea: "Board game / card game night", cost: "Free", time: "1-2 hrs", type: "At Home", description: "Competitive or cooperative — both work. No phones. Just each other and some friendly competition." },
  { idea: "Dream planning session", cost: "Free", time: "1-2 hrs", type: "At Home", description: "Where do you want to be in 5 years? What house, what lifestyle, what experiences? Plan the dream together." },

  // Budget ($)
  { idea: "Sunrise coffee at a scenic spot", cost: "$5-$10", time: "1 hr", type: "Outdoors", description: "Wake up early, grab coffee, watch the sunrise from the best viewpoint in your area. The effort of waking up makes it special." },
  { idea: "Farmers market + picnic", cost: "$15-$30", time: "2-3 hrs", type: "Outdoors", description: "Browse a local farmers market, buy ingredients, make a picnic in the park. Fresh air, fresh food, no distractions." },
  { idea: "Hiking a new trail", cost: "Free-$10", time: "2-4 hrs", type: "Outdoors", description: "Find a trail neither of you has done. Moderate difficulty. The shared challenge creates bonding." },
  { idea: "Ice cream and a walk", cost: "$10-$15", time: "1-2 hrs", type: "Outdoors", description: "Simple. Classic. Walk and talk. Sometimes the best dates are the ones without a plan." },
  { idea: "Bookstore browse + coffee", cost: "$10-$30", time: "1-2 hrs", type: "Out", description: "Browse a bookstore together. Each pick a book for the other. Coffee after to discuss your choices." },
  { idea: "Free community event", cost: "Free", time: "2-3 hrs", type: "Out", description: "Concerts in the park, art walks, festivals, open mic nights. Check your city's events calendar." },

  // Bigger ($$$)
  { idea: "Cooking class together", cost: "$60-$120", time: "2-3 hrs", type: "Out", description: "Learn sushi, pasta, Thai, or pastry making together. You leave with a new skill and a shared memory." },
  { idea: "Day trip to a nearby town", cost: "$50-$100", time: "Full day", type: "Adventure", description: "Pick a town 1-2 hours away that neither of you has visited. Explore like tourists. Eat local." },
  { idea: "Hotel night (no kids)", cost: "$100-$200", time: "Overnight", description: "Even a basic hotel in your own city feels different. Sleep in. Room service breakfast. Reset.", type: "Adventure" },
  { idea: "Escape room", cost: "$50-$80", time: "1.5 hrs", type: "Out", description: "Solve puzzles together under pressure. Nothing reveals teamwork dynamics like an escape room." },
]

const TYPES = [...new Set(DATE_IDEAS.map(d => d.type))]

export default function DateNightsPage() {
  const [currentIdea, setCurrentIdea] = useState<number | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [logs, setLogs] = useSyncedStorage<DateLog[]>("hfp-date-nights", [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<DateLog>>({ date: new Date().toISOString().slice(0, 10), rating: 5, type: "At Home" })

  const analytics = useMemo(() => {
    const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const last = sorted[0]
    const daysSinceLast = last ? daysBetween(last.date, new Date().toISOString()) : null

    const byMonth: Record<string, number> = {}
    sorted.forEach(l => {
      const k = monthKey(new Date(l.date))
      byMonth[k] = (byMonth[k] ?? 0) + 1
    })
    const monthsArr: { key: string; count: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const k = monthKey(d)
      monthsArr.push({ key: k, count: byMonth[k] ?? 0 })
    }

    const byType: Record<string, { count: number; totalRating: number }> = {}
    sorted.forEach(l => {
      if (!byType[l.type]) byType[l.type] = { count: 0, totalRating: 0 }
      byType[l.type].count++
      byType[l.type].totalRating += l.rating
    })
    const typeStats = Object.entries(byType).map(([type, s]) => ({ type, count: s.count, avgRating: s.totalRating / s.count })).sort((a, b) => b.avgRating - a.avgRating)

    const avgRating = sorted.length ? sorted.reduce((s, l) => s + l.rating, 0) / sorted.length : 0
    const topRated = sorted.filter(l => l.rating === 5).slice(0, 3)
    const monthPace = monthsArr.slice(-3).reduce((s, m) => s + m.count, 0) / 3

    const bySeason: Record<string, number> = { Winter: 0, Spring: 0, Summer: 0, Fall: 0 }
    sorted.forEach(l => {
      const m = new Date(l.date).getMonth()
      const season = m < 2 || m === 11 ? "Winter" : m < 5 ? "Spring" : m < 8 ? "Summer" : "Fall"
      bySeason[season]++
    })

    return { total: sorted.length, daysSinceLast, monthsArr, typeStats, avgRating, topRated, monthPace, bySeason, last }
  }, [logs])

  function addLog() {
    if (!form.activity || !form.date) return
    const log: DateLog = {
      id: crypto.randomUUID(),
      date: form.date!,
      activity: form.activity!,
      type: form.type ?? "At Home",
      cost: form.cost,
      partner: form.partner,
      rating: form.rating ?? 5,
      notes: form.notes,
    }
    setLogs([log, ...logs])
    setForm({ date: new Date().toISOString().slice(0, 10), rating: 5, type: "At Home" })
    setShowForm(false)
  }

  function suggestFromHistory() {
    if (analytics.topRated.length === 0) { randomize(); return }
    const topTypes = new Set(analytics.typeStats.slice(0, 2).map(t => t.type))
    const pool = DATE_IDEAS.filter(d => topTypes.has(d.type))
    const recentActivities = new Set(logs.slice(0, 5).map(l => l.activity.toLowerCase()))
    const fresh = pool.filter(d => !recentActivities.has(d.idea.toLowerCase()))
    const picks = fresh.length > 0 ? fresh : pool
    setCurrentIdea(DATE_IDEAS.indexOf(picks[Math.floor(Math.random() * picks.length)]))
  }

  function randomize() {
    const pool = filterType ? DATE_IDEAS.filter(d => d.type === filterType) : DATE_IDEAS
    setCurrentIdea(DATE_IDEAS.indexOf(pool[Math.floor(Math.random() * pool.length)]))
  }

  const filtered = filterType ? DATE_IDEAS.filter(d => d.type === filterType) : DATE_IDEAS

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Date Night Ideas</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Your relationship is the foundation your family is built on. Invest in it intentionally.
        </p>
      </div>

      {/* Analytics — only show if user has logged dates */}
      {analytics.total > 0 && (
        <>
          {analytics.daysSinceLast !== null && analytics.daysSinceLast >= 21 && (
            <Card className="border-amber-300 bg-amber-50/40">
              <CardContent className="p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-900">
                  It&apos;s been <span className="font-bold">{analytics.daysSinceLast} days</span> since your last date night. Put one on the calendar this week.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Dates</p><p className="text-xl font-bold text-rose-600 tabular-nums">{analytics.total}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Rating</p><p className="text-xl font-bold text-amber-600 tabular-nums">{analytics.avgRating.toFixed(1)}<span className="text-xs text-muted-foreground">/5</span></p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pace (3mo)</p><p className="text-xl font-bold text-pink-600 tabular-nums">{analytics.monthPace.toFixed(1)}<span className="text-xs text-muted-foreground">/mo</span></p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Days Since</p><p className={cn("text-xl font-bold tabular-nums", (analytics.daysSinceLast ?? 0) > 21 ? "text-amber-600" : "text-emerald-600")}>{analytics.daysSinceLast ?? "—"}</p></CardContent></Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1"><Calendar className="h-3 w-3" /> Last 12 Months</p>
              <div className="flex items-end gap-1 h-14 mb-1">
                {analytics.monthsArr.map((m, i) => {
                  const max = Math.max(...analytics.monthsArr.map(x => x.count), 2)
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className={cn("w-full rounded-t transition-all", m.count >= 4 ? "bg-emerald-400" : m.count >= 2 ? "bg-rose-400" : m.count >= 1 ? "bg-rose-300" : "bg-slate-100")} style={{ height: `${(m.count / max) * 100}%`, minHeight: m.count > 0 ? 4 : 0 }} title={`${monthLabel(m.key)}: ${m.count} dates`} />
                      <span className="text-[8px] text-muted-foreground">{monthLabel(m.key).slice(0, 1)}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {analytics.typeStats.length >= 2 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Top-rated types</p>
                <div className="space-y-1.5">
                  {analytics.typeStats.map(t => (
                    <div key={t.type} className="flex items-center gap-2 text-xs">
                      <span className="w-20 text-muted-foreground">{t.type}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-400 to-pink-500" style={{ width: `${(t.avgRating / 5) * 100}%` }} />
                      </div>
                      <span className="w-14 text-right tabular-nums font-mono text-[10px]">{t.avgRating.toFixed(1)} · {t.count}x</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analytics.topRated.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1"><Trophy className="h-3 w-3" /> Your 5-star dates</p>
                <div className="space-y-1">
                  {analytics.topRated.map(l => (
                    <div key={l.id} className="flex items-center gap-2 text-xs">
                      <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />)}</div>
                      <span className="flex-1 font-medium">{l.activity}</span>
                      <span className="text-muted-foreground text-[10px]">{new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Log a date */}
      <Card>
        <CardContent className="p-4">
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-rose-300 py-2.5 text-sm text-rose-700 hover:bg-rose-50/40 transition">
              <Plus className="h-4 w-4" /> Log a date night
            </button>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={form.date ?? ""} onChange={e => setForm({ ...form, date: e.target.value })} className="rounded-md border px-2 py-1 text-xs" />
                <select value={form.type ?? "At Home"} onChange={e => setForm({ ...form, type: e.target.value })} className="rounded-md border px-2 py-1 text-xs">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <input placeholder="What did you do?" value={form.activity ?? ""} onChange={e => setForm({ ...form, activity: e.target.value })} className="w-full rounded-md border px-2 py-1.5 text-xs" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Cost (optional)" value={form.cost ?? ""} onChange={e => setForm({ ...form, cost: e.target.value })} className="rounded-md border px-2 py-1 text-xs" />
                <input placeholder="Partner name (optional)" value={form.partner ?? ""} onChange={e => setForm({ ...form, partner: e.target.value })} className="rounded-md border px-2 py-1 text-xs" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground mr-1">Rating:</span>
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} onClick={() => setForm({ ...form, rating: r })} type="button">
                    <Star className={cn("h-5 w-5", (form.rating ?? 0) >= r ? "text-amber-400 fill-amber-400" : "text-slate-300")} />
                  </button>
                ))}
              </div>
              <textarea placeholder="Notes (optional)" value={form.notes ?? ""} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full rounded-md border px-2 py-1.5 text-xs" rows={2} />
              <div className="flex gap-2">
                <Button onClick={addLog} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white">Save</Button>
                <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Random generator */}
      <Card className="border-2 border-rose-200 bg-rose-50/20">
        <CardContent className="p-5 text-center">
          {currentIdea !== null ? (
            <div>
              <p className="text-xs text-rose-500 uppercase tracking-wider font-semibold mb-2">Your date night:</p>
              <p className="text-xl font-bold mb-1">{DATE_IDEAS[currentIdea].idea}</p>
              <p className="text-xs text-muted-foreground mb-2">{DATE_IDEAS[currentIdea].description}</p>
              <div className="flex gap-3 justify-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {DATE_IDEAS[currentIdea].cost}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {DATE_IDEAS[currentIdea].time}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Hit the button for a random date idea</p>
          )}
          <div className="flex gap-2 justify-center mt-3">
            <Button onClick={randomize} className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
              <Sparkles className="h-4 w-4" /> {currentIdea !== null ? "Another One" : "Surprise Me"}
            </Button>
            {analytics.total >= 2 && (
              <Button onClick={suggestFromHistory} variant="outline" className="border-rose-300 text-rose-700">
                <TrendingUp className="h-4 w-4" /> Suggest from my history
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterType(null)}
          className={cn("text-xs rounded-full px-3 py-1 border",
            !filterType ? "bg-rose-100 border-rose-300 text-rose-700 font-semibold" : "border-border text-muted-foreground"
          )}>All ({DATE_IDEAS.length})</button>
        {TYPES.map(t => (
          <button key={t} onClick={() => setFilterType(filterType === t ? null : t)}
            className={cn("text-xs rounded-full px-3 py-1 border",
              filterType === t ? "bg-rose-100 border-rose-300 text-rose-700 font-semibold" : "border-border text-muted-foreground"
            )}>{t}</button>
        ))}
      </div>

      {/* All ideas */}
      <div className="space-y-2">
        {filtered.map((d, i) => (
          <Card key={i} className="card-hover">
            <CardContent className="p-3 flex items-start gap-3">
              <Heart className="h-4 w-4 text-rose-300 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{d.idea}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{d.description}</p>
                <div className="flex gap-3 mt-1">
                  <Badge variant="outline" className="text-[9px]">{d.type}</Badge>
                  <span className="text-[10px] text-muted-foreground">{d.cost} · {d.time}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-rose-200 bg-rose-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why date nights matter:</strong> The National Marriage Project found that couples who have a weekly
            date night are 3.5x more likely to report being &quot;very happy&quot; in their relationship. It does not have
            to be expensive — the act of prioritizing each other IS the investment. Put it on the calendar. Protect
            it like any other important appointment. Your children benefit most from parents who love each other well.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/relationships" className="text-sm text-rose-600 hover:underline">Relationships</a>
        <a href="/family-meeting" className="text-sm text-violet-600 hover:underline">Family Meeting</a>
        <a href="/budget" className="text-sm text-emerald-600 hover:underline">Budget Calculator</a>
      </div>
    </div>
  )
}
