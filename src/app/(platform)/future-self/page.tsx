"use client"

import { useState, useEffect, useMemo } from "react"
import { Mail, Send, Lock, BookOpen, Clock, Trash2, TrendingUp, DollarSign, Activity, Brain, Target, Sparkles } from "lucide-react"
import { useSyncedStorage } from "@/hooks/use-synced-storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

type NetWorthSnap = { date: string; netWorth: number }
type FlourishingSnap = { date: string; score: number }
type DailyHabit = { id: string; name: string; completions?: string[]; completedDates?: string[]; createdAt?: string }

interface Letter { id: string; content: string; createdAt: string; deliveryDate: string; read: boolean }
const PROMPTS = ["What are you working on right now?", "What are you afraid of?", "What do you hope is different?", "What would you tell your future self to remember?"]
const DELAYS = [{ label: "1 month", months: 1 }, { label: "3 months", months: 3 }, { label: "6 months", months: 6 }, { label: "1 year", months: 12 }, { label: "5 years", months: 60 }]

function daysUntil(date: string) { return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000) }

export default function FutureSelfPage() {
  const [letters, saveLetters] = useSyncedStorage<Letter[]>("hfp-future-letters", [])
  const [nwHistory] = useSyncedStorage<NetWorthSnap[] | Record<string, NetWorthSnap>>("hfp-networth-history", [])
  const [flourishingHistory] = useSyncedStorage<FlourishingSnap[]>("hfp-flourishing-history", [])
  const [habits] = useSyncedStorage<DailyHabit[]>("hfp-daily-habits", [])
  const [content, setContent] = useState("")
  const [delay, setDelay] = useState(3)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const projections = useMemo(() => {
    const nwArr: NetWorthSnap[] = Array.isArray(nwHistory) ? nwHistory : Object.values(nwHistory ?? {})
    const nwSorted = [...nwArr].filter(s => s && typeof s.netWorth === "number").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let nwRatePerYear = 0
    let nwToday = 0
    if (nwSorted.length >= 2) {
      const first = nwSorted[0]
      const last = nwSorted[nwSorted.length - 1]
      const years = Math.max(0.1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / (365 * 86400000))
      nwRatePerYear = (last.netWorth - first.netWorth) / years
      nwToday = last.netWorth
    } else if (nwSorted.length === 1) {
      nwToday = nwSorted[0].netWorth
    }

    const flSorted = [...flourishingHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let flRatePerYear = 0
    let flToday = 0
    if (flSorted.length >= 2) {
      const first = flSorted[0]
      const last = flSorted[flSorted.length - 1]
      const years = Math.max(0.1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / (365 * 86400000))
      flRatePerYear = (last.score - first.score) / years
      flToday = last.score
    } else if (flSorted.length === 1) {
      flToday = flSorted[0].score
    }

    const weekAgo = Date.now() - 7 * 86400000
    const completionsThisWeek = habits.reduce((s, h) => s + ((h.completions ?? h.completedDates ?? []).filter(d => new Date(d).getTime() >= weekAgo).length), 0)
    const totalAll = habits.reduce((s, h) => s + (h.completions?.length ?? h.completedDates?.length ?? 0), 0)
    const habitsPerYear = (completionsThisWeek / 7) * 365

    const weakestHabit = (() => {
      if (habits.length === 0) return null
      const scored = habits.map(h => {
        const all = (h.completions ?? h.completedDates ?? [])
        const recent = all.filter(d => new Date(d).getTime() >= weekAgo).length
        return { name: h.name, ratio: recent / 7 }
      }).sort((a, b) => a.ratio - b.ratio)
      return scored[0]
    })()

    return {
      nwToday, nwRatePerYear,
      flToday, flRatePerYear,
      completionsThisWeek, totalAll, habitsPerYear,
      weakestHabit,
    }
  }, [nwHistory, flourishingHistory, habits])

  const hasData = projections.nwToday > 0 || projections.flToday > 0 || projections.totalAll > 0
  const fmt$ = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${Math.round(n)}`

  function sendLetter() {
    if (!content.trim()) return
    const delivery = new Date()
    delivery.setMonth(delivery.getMonth() + delay)
    const letter: Letter = {
      id: crypto.randomUUID(), content: content.trim(),
      createdAt: new Date().toISOString(), deliveryDate: delivery.toISOString(), read: false,
    }
    const next = [letter, ...letters]
    saveLetters(next); setContent("")
  }

  function markRead(id: string) {
    saveLetters(letters.map(l => l.id === id ? { ...l, read: true } : l))
  }

  function deleteLetter(id: string) {
    saveLetters(letters.filter(l => l.id !== id))
  }

  const sealed = letters.filter(l => daysUntil(l.deliveryDate) > 0)
  const ready = letters.filter(l => daysUntil(l.deliveryDate) <= 0 && !l.read)
  const opened = letters.filter(l => l.read)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Letter to Your Future Self</h1>
        </div>
        <p className="text-sm text-muted-foreground">Write a time capsule. Seal it. Open it when the time comes.</p>
      </div>

      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why this matters:</strong> Your future self is a stranger who will inherit the consequences of your
            current decisions. Writing to them creates accountability and perspective that nothing else can. You will be
            surprised what you forgot, what you feared, and what actually happened.
          </p>
        </CardContent>
      </Card>

      {/* If-you-keep-this-pace projection */}
      {mounted && hasData && (
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50/40 to-purple-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-600" /> If You Keep This Pace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Pulled from your net-worth history, flourishing score, and habit completions. Straight-line projection — reality varies.</p>

            <div className="grid grid-cols-3 gap-2">
              {[1, 5, 10].map(years => (
                <div key={years} className="rounded-lg border bg-white p-3">
                  <p className="text-[10px] uppercase tracking-wide text-violet-600 font-semibold mb-2">{years} year{years > 1 ? "s" : ""}</p>
                  <div className="space-y-1.5">
                    {projections.nwToday > 0 && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <DollarSign className="h-3 w-3 text-emerald-600" />
                        <span className="tabular-nums font-semibold">{fmt$(projections.nwToday + projections.nwRatePerYear * years)}</span>
                      </div>
                    )}
                    {projections.flToday > 0 && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Brain className="h-3 w-3 text-violet-600" />
                        <span className="tabular-nums font-semibold">{Math.max(0, Math.min(100, Math.round(projections.flToday + projections.flRatePerYear * years)))}<span className="text-muted-foreground">/100</span></span>
                      </div>
                    )}
                    {projections.habitsPerYear > 0 && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Activity className="h-3 w-3 text-rose-600" />
                        <span className="tabular-nums font-semibold">{Math.round(projections.habitsPerYear * years)}</span>
                        <span className="text-[10px] text-muted-foreground">reps</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {projections.weakestHabit && projections.weakestHabit.ratio < 0.5 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-2.5 flex items-start gap-2">
                <Target className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-900 leading-snug">
                  Lever: if you raise <span className="font-semibold">{projections.weakestHabit.name}</span> from {Math.round(projections.weakestHabit.ratio * 100)}% to daily,
                  that's <span className="font-semibold tabular-nums">+{Math.round((1 - projections.weakestHabit.ratio) * 365 * 5)}</span> extra reps over 5 years — more than anyone could do in a crash program.
                </p>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground italic">
              Your future self inherits these numbers. Write to them about the decisions that shape them.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Writing prompts */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Need help starting?</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROMPTS.map(p => (
              <button key={p} onClick={() => setContent(prev => prev ? prev + "\n\n" + p + "\n" : p + "\n")}
                className="text-left text-xs p-2 rounded-lg border hover:bg-violet-50 hover:border-violet-300 transition-colors text-muted-foreground">
                {p}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compose */}
      <Card className="border-2 border-violet-200">
        <CardContent className="p-4 space-y-3">
          <Textarea value={content} onChange={e => setContent(e.target.value)} rows={6}
            placeholder="Dear future me..." className="resize-none" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Open in:</span>
            {DELAYS.map(d => (
              <button key={d.months} onClick={() => setDelay(d.months)}
                className={cn("text-xs px-3 py-1 rounded-full border transition-colors",
                  delay === d.months ? "bg-violet-600 text-white border-violet-600" : "hover:border-violet-300")}>
                {d.label}
              </button>
            ))}
          </div>
          <Button onClick={sendLetter} disabled={!content.trim()} className="w-full gap-2 bg-violet-600 hover:bg-violet-700">
            <Send className="h-4 w-4" /> Seal &amp; Send to the Future
          </Button>
        </CardContent>
      </Card>

      {/* Ready to open */}
      {mounted && ready.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4 text-amber-500" /> Ready to Open</h2>
          {ready.map(l => (
            <Card key={l.id} className="border-amber-300 bg-amber-50/30">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Written {new Date(l.createdAt).toLocaleDateString()}</p>
                  <Badge className="bg-amber-100 text-amber-700 text-[9px]">Ready</Badge>
                </div>
                <Button onClick={() => markRead(l.id)} variant="outline" className="w-full gap-2 border-amber-300 text-amber-700 hover:bg-amber-100">
                  <BookOpen className="h-4 w-4" /> Read This Letter
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sealed */}
      {mounted && sealed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Lock className="h-4 w-4 text-violet-500" /> Sealed Letters</h2>
          {sealed.map(l => {
            const days = daysUntil(l.deliveryDate)
            return (
              <Card key={l.id} className="border-violet-100">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Written {new Date(l.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-violet-500" />
                      <Explain tip="This letter is sealed until its delivery date arrives.">Opens in {days} day{days !== 1 ? "s" : ""}</Explain>
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[9px] text-violet-600 border-violet-300">Sealed</Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Opened history */}
      {mounted && opened.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4 text-emerald-500" /> Opened Letters</h2>
          {opened.map(l => (
            <Card key={l.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Written {new Date(l.createdAt).toLocaleDateString()} &middot; Delivered {new Date(l.deliveryDate).toLocaleDateString()}
                  </p>
                  <button onClick={() => deleteLetter(l.id)} className="text-muted-foreground/40 hover:text-red-500 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{l.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <a href="/journal" className="text-sm text-violet-600 hover:underline">Journal</a>
        <a href="/goals" className="text-sm text-blue-600 hover:underline">Goals</a>
        <a href="/gratitude" className="text-sm text-amber-600 hover:underline">Gratitude</a>
        <a href="/character-sheet" className="text-sm text-emerald-600 hover:underline">Character Sheet</a>
      </div>
    </div>
  )
}
