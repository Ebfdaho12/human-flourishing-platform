"use client"

import { useState, useEffect } from "react"
import { Flame, Play, CheckCircle2, Trophy, Plus, X, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChallengeData { id: string; name: string; emoji: string; description: string; color: string }
interface ActiveChallenge { challengeId: string; startDate: string; completedDays: string[] }

const CHALLENGES: ChallengeData[] = [
  { id: "cold", name: "Cold Exposure", emoji: "\u{1F9CA}", description: "Daily cold shower (start 30s, add 15s each week)", color: "border-cyan-300 bg-cyan-50/30" },
  { id: "gratitude", name: "Gratitude", emoji: "\u{1F64F}", description: "Write 3 gratitudes every day", color: "border-amber-300 bg-amber-50/30" },
  { id: "detox", name: "Digital Detox", emoji: "\u{1F4F5}", description: "No social media for 30 days", color: "border-slate-300 bg-slate-50/30" },
  { id: "reading", name: "Reading", emoji: "\u{1F4D6}", description: "Read 20 minutes every day", color: "border-emerald-300 bg-emerald-50/30" },
  { id: "exercise", name: "Exercise", emoji: "\u{1F3CB}\uFE0F", description: "Move your body every day (any form)", color: "border-red-300 bg-red-50/30" },
  { id: "breathwork", name: "Breathwork", emoji: "\u{1F9D8}", description: "5 minutes of breathwork daily", color: "border-blue-300 bg-blue-50/30" },
  { id: "hydration", name: "Hydration", emoji: "\u{1F4A7}", description: "Drink 3L water every day", color: "border-sky-300 bg-sky-50/30" },
  { id: "journaling", name: "Journaling", emoji: "\u{1F4DD}", description: "Write 1 page every morning", color: "border-violet-300 bg-violet-50/30" },
  { id: "sleep", name: "Sleep", emoji: "\u{1F634}", description: "In bed by 10pm, 7+ hours every night", color: "border-indigo-300 bg-indigo-50/30" },
  { id: "wholefood", name: "No Processed Food", emoji: "\u{1F34E}", description: "Whole foods only for 30 days", color: "border-green-300 bg-green-50/30" },
  { id: "nocomplain", name: "No Complaining", emoji: "\u{1F9E0}", description: "Catch yourself, redirect to solution", color: "border-pink-300 bg-pink-50/30" },
  { id: "nospend", name: "No Spend", emoji: "\u{1F4B0}", description: "Only essentials for 30 days (except bills)", color: "border-yellow-300 bg-yellow-50/30" },
]

const LS_KEY = "hfp-challenges"

function loadChallenges(): ActiveChallenge[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]") } catch { return [] }
}
function saveChallenges(c: ActiveChallenge[]) { localStorage.setItem(LS_KEY, JSON.stringify(c)) }

function todayStr() { return new Date().toISOString().split("T")[0] }

function daysBetween(a: string, b: string) {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

function streak(days: string[]): number {
  if (!days.length) return 0
  const sorted = [...days].sort().reverse()
  let s = 1
  for (let i = 1; i < sorted.length; i++) {
    if (daysBetween(sorted[i], sorted[i - 1]) === 1) s++; else break
  }
  return s
}

export default function ThirtyDayChallengesPage() {
  const [actives, setActives] = useState<ActiveChallenge[]>([])
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customDesc, setCustomDesc] = useState("")
  const [customs, setCustoms] = useState<ChallengeData[]>([])

  useEffect(() => {
    setActives(loadChallenges())
    try { setCustoms(JSON.parse(localStorage.getItem("hfp-custom-challenges") || "[]")) } catch { /* */ }
  }, [])

  function save(next: ActiveChallenge[]) { setActives(next); saveChallenges(next) }

  function startChallenge(id: string) {
    if (actives.find(a => a.challengeId === id)) return
    save([...actives, { challengeId: id, startDate: todayStr(), completedDays: [] }])
  }

  function checkToday(id: string) {
    const today = todayStr()
    save(actives.map(a => a.challengeId === id
      ? { ...a, completedDays: a.completedDays.includes(today) ? a.completedDays.filter(d => d !== today) : [...a.completedDays, today] }
      : a))
  }

  function abandon(id: string) { save(actives.filter(a => a.challengeId !== id)) }

  function addCustom() {
    if (!customName.trim()) return
    const c: ChallengeData = { id: `custom-${Date.now()}`, name: customName, emoji: "\u2B50", description: customDesc || "Custom challenge", color: "border-orange-300 bg-orange-50/30" }
    const next = [...customs, c]
    setCustoms(next); localStorage.setItem("hfp-custom-challenges", JSON.stringify(next))
    setCustomName(""); setCustomDesc(""); setShowCustom(false)
  }

  const allChallenges = [...CHALLENGES, ...customs]

  function renderActive(ac: ActiveChallenge) {
    const meta = allChallenges.find(c => c.id === ac.challengeId)
    if (!meta) return null
    const completed = ac.completedDays.length >= 30
    const today = todayStr()
    const checkedToday = ac.completedDays.includes(today)
    const days: { date: string; status: "done" | "missed" | "future" }[] = []
    for (let i = 0; i < 30; i++) {
      const d = new Date(ac.startDate); d.setDate(d.getDate() + i)
      const ds = d.toISOString().split("T")[0]
      days.push({ date: ds, status: ac.completedDays.includes(ds) ? "done" : ds <= today ? "missed" : "future" })
    }
    return (
      <Card key={ac.challengeId} className={cn("border-2", completed ? "border-amber-400 bg-amber-50/20" : meta.color)}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{meta.emoji}</span>
              <p className="text-sm font-semibold">{meta.name}</p>
              {completed && <Badge className="bg-amber-500 text-white text-[9px]"><Trophy className="h-3 w-3 mr-1" />Completed!</Badge>}
            </div>
            {!completed && <Button variant="ghost" size="sm" className="text-[10px] text-red-400 h-6" onClick={() => abandon(ac.challengeId)}><X className="h-3 w-3" /></Button>}
          </div>
          {completed ? (
            <p className="text-xs text-amber-700 font-medium">You did it! 30 days completed. This challenge is part of your history now.</p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <p className="text-xs font-medium">Day {Math.min(ac.completedDays.length, 30)}/30</p>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(ac.completedDays.length / 30) * 100}%` }} />
                </div>
                <Badge variant="outline" className="text-[9px]">{streak(ac.completedDays)} streak</Badge>
              </div>
              <Button size="sm" className={cn("w-full text-xs", checkedToday ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-700")} onClick={() => checkToday(ac.challengeId)}>
                {checkedToday ? <><CheckCircle2 className="h-3 w-3 mr-1" />Done Today!</> : "Check Off Today"}
              </Button>
            </>
          )}
          <div className="grid grid-cols-10 gap-1">
            {days.map((d, i) => (
              <div key={i} className={cn("h-5 w-full rounded text-[8px] flex items-center justify-center font-medium",
                d.status === "done" ? "bg-emerald-500 text-white" : d.status === "missed" ? "bg-red-300/60 text-red-800" : "bg-muted text-muted-foreground"
              )}>{i + 1}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">30-Day Challenges</h1>
        </div>
        <p className="text-sm text-muted-foreground italic">21 days builds a habit. 30 days transforms an identity.</p>
      </div>

      {actives.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-orange-500" /> Active Challenges</h2>
          {actives.map(a => renderActive(a))}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Available Challenges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allChallenges.filter(c => !actives.find(a => a.challengeId === c.id)).map(c => (
            <Card key={c.id} className={cn("border", c.color, "hover:shadow-md transition-shadow")}>
              <CardContent className="p-3 flex items-center gap-3">
                <span className="text-xl">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{c.description}</p>
                </div>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-[10px] h-7 shrink-0" onClick={() => startChallenge(c.id)}>
                  <Play className="h-3 w-3 mr-1" />Start
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {!showCustom ? (
        <Button variant="outline" className="w-full text-xs" onClick={() => setShowCustom(true)}><Plus className="h-3 w-3 mr-1" /> Create Custom Challenge</Button>
      ) : (
        <Card className="border-dashed border-2 border-orange-300">
          <CardContent className="p-4 space-y-2">
            <p className="text-xs font-semibold">Create Custom Challenge</p>
            <input className="w-full rounded border px-2 py-1 text-xs" placeholder="Challenge name" value={customName} onChange={e => setCustomName(e.target.value)} />
            <input className="w-full rounded border px-2 py-1 text-xs" placeholder="Description (optional)" value={customDesc} onChange={e => setCustomDesc(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-xs" onClick={addCustom}>Create</Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowCustom(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <a href="/hive-mind" className="text-sm text-violet-600 hover:underline">Hive Mind</a>
        <a href="/health-protocols" className="text-sm text-emerald-600 hover:underline">Health Protocols</a>
        <a href="/breathwork" className="text-sm text-cyan-600 hover:underline">Breathwork</a>
        <a href="/cold-exposure" className="text-sm text-blue-600 hover:underline">Cold Exposure</a>
        <a href="/character-sheet" className="text-sm text-amber-600 hover:underline">Character Sheet</a>
      </div>
    </div>
  )
}
