"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Users, Target, Plus, Send, CheckCircle, Clock, ChevronDown, AlertCircle, TrendingUp, Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AccountabilityPage() {
  const { data, mutate } = useSWR("/api/community/partners", fetcher)
  const [showAdd, setShowAdd] = useState(false)
  const [email, setEmail] = useState("")
  const [goal, setGoal] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const partnerships = data?.partnerships || []

  const stats = useMemo(() => {
    if (partnerships.length === 0) return null
    const allCheckIns: { createdAt: string }[] = partnerships.flatMap((p: any) => p.checkIns ?? [])
    if (allCheckIns.length === 0) return { totalCheckIns: 0, mostRecentDays: null, streak: 0, overdue: false }

    const sorted = [...allCheckIns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const mostRecent = new Date(sorted[0].createdAt).getTime()
    const mostRecentDays = Math.floor((Date.now() - mostRecent) / 86400000)

    const weekSet = new Set<string>()
    sorted.forEach(c => {
      const d = new Date(c.createdAt)
      const year = d.getFullYear()
      const start = new Date(year, 0, 1)
      const week = Math.floor(((d.getTime() - start.getTime()) / 86400000 + start.getDay()) / 7)
      weekSet.add(`${year}-${week}`)
    })
    let streak = 0
    const now = new Date()
    for (let i = 0; i < 52; i++) {
      const d = new Date(now.getTime() - i * 7 * 86400000)
      const year = d.getFullYear()
      const start = new Date(year, 0, 1)
      const week = Math.floor(((d.getTime() - start.getTime()) / 86400000 + start.getDay()) / 7)
      if (weekSet.has(`${year}-${week}`)) streak++
      else if (i > 0) break
    }

    return { totalCheckIns: allCheckIns.length, mostRecentDays, streak, overdue: mostRecentDays >= 10 }
  }, [partnerships])

  async function createPartnership() {
    if (!email || !goal) return
    setCreating(true)
    setError("")
    const res = await fetch("/api/community/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerEmail: email, goal }),
    })
    const result = await res.json()
    if (!res.ok) setError(result.error)
    else { setEmail(""); setGoal(""); setShowAdd(false); mutate() }
    setCreating(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Accountability Partners</h1>
          </div>
          <p className="text-sm text-muted-foreground">Pair up with someone working on similar goals. Weekly check-ins. Shared accountability.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4" /> Add Partner</Button>
      </div>

      {/* Your accountability stats */}
      {stats && partnerships.length > 0 && (
        <>
          {stats.overdue && (
            <Card className="border-amber-300 bg-amber-50/40">
              <CardContent className="p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-900">
                  Last check-in was <span className="font-bold">{stats.mostRecentDays} days ago</span>. Weekly cadence keeps accountability alive — reach out this week.
                </p>
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Partners</p><p className="text-lg font-bold text-emerald-600 tabular-nums">{partnerships.length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Check-ins</p><p className="text-lg font-bold text-teal-600 tabular-nums">{stats.totalCheckIns}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Flame className="h-2.5 w-2.5" /> Week streak</p><p className="text-lg font-bold text-amber-600 tabular-nums">{stats.streak}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Last check-in</p><p className={cn("text-lg font-bold tabular-nums", stats.overdue ? "text-rose-600" : "text-emerald-600")}>{stats.mostRecentDays !== null ? `${stats.mostRecentDays}d` : "—"}</p></CardContent></Card>
          </div>
        </>
      )}

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why accountability works:</strong> The American Society of Training and Development found that people
            who commit to someone else have a <strong>95% chance of achieving their goal</strong> vs 10% chance alone.
            Not 50%. Not 70%. Ninety-five percent. The simple act of telling another person "I will do X by Y"
            and checking in weekly is the most powerful goal-achievement technique known to behavioral science.
          </p>
        </CardContent>
      </Card>

      {/* Add partner */}
      {showAdd && (
        <Card className="border-2 border-emerald-200">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">Invite someone on the platform to be your accountability partner. They need to have an HFP account.</p>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Partner's email address" type="email" />
            <Input value={goal} onChange={e => setGoal(e.target.value)} placeholder="What goal are you working on together? (e.g., 'Pay off $10K debt by December')" />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button onClick={createPartnership} disabled={creating || !email || !goal} className="w-full">
              {creating ? "Creating..." : "Start Partnership"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Partnerships */}
      {partnerships.length > 0 ? (
        <div className="space-y-3">
          {partnerships.map((p: any) => {
            const partnerProfile = p.user?.profile || p.partner?.profile
            const partnerName = partnerProfile?.displayName || "Partner"
            const lastCheckIn = p.checkIns?.[0]
            return (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                      {partnerName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{partnerName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" /> {p.goal}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-300">{p.status}</Badge>
                  </div>
                  {lastCheckIn ? (
                    <div className="rounded-lg bg-muted/30 p-2.5 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1 mb-0.5"><Clock className="h-3 w-3" /> Last check-in: {new Date(lastCheckIn.createdAt).toLocaleDateString()}</p>
                      <p>{lastCheckIn.progress}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No check-ins yet. Do your first weekly check-in!</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : !showAdd && (
        <Card><CardContent className="py-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No accountability partners yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Invite someone who is working on a similar goal — financial, health, career, or personal.</p>
        </CardContent></Card>
      )}

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>How it works:</strong> 1) Invite a partner by email. 2) Set a shared goal. 3) Check in weekly
            (what you accomplished, what is blocking you, what you'll do next week). 4) Rate your week 1-10.
            The check-in takes 5 minutes. The accountability lasts all week. Your partner's success is your success.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/community/hub" className="text-sm text-violet-600 hover:underline">Community Hub</a>
        <a href="/challenges" className="text-sm text-orange-600 hover:underline">30-Day Challenges</a>
        <a href="/goals" className="text-sm text-blue-600 hover:underline">Goals</a>
        <a href="/progress" className="text-sm text-emerald-600 hover:underline">Progress</a>
      </div>
    </div>
  )
}
