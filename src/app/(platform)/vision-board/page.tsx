"use client"

import { useState, useEffect } from "react"
import { Sparkles, Plus, ChevronUp, ChevronDown, Trash2, Trophy, Filter, Eye, Brain, Link, BarChart3, Target, CheckCircle } from "lucide-react"
import { useSyncedStorage } from "@/hooks/use-synced-storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Milestone { id: string; text: string; done: boolean }
interface Vision { id: string; title: string; category: string; description: string; targetDate: string; status: string; progress: number; milestones: Milestone[]; achievedDate?: string }
const CATEGORIES = ["Health", "Wealth", "Relationships", "Career", "Personal Growth", "Adventure", "Family", "Contribution"] as const
const STATUSES = ["dream", "planning", "in progress", "achieved"] as const
const CAT_COLORS: Record<string, string> = {
  Health: "from-green-500 to-emerald-600", Wealth: "from-amber-500 to-yellow-600",
  Relationships: "from-pink-500 to-rose-600", Career: "from-blue-500 to-indigo-600",
  "Personal Growth": "from-violet-500 to-purple-600", Adventure: "from-orange-500 to-red-500",
  Family: "from-teal-500 to-cyan-600", Contribution: "from-fuchsia-500 to-pink-600",
}
const STATUS_COLORS: Record<string, string> = { dream: "bg-slate-100 text-slate-700", planning: "bg-blue-100 text-blue-700", "in progress": "bg-amber-100 text-amber-700", achieved: "bg-green-100 text-green-700" }

export default function VisionBoardPage() {
  const [visions, update] = useSyncedStorage<Vision[]>("hfp-vision-board", [])
  const [mounted, setMounted] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState(""); const [category, setCategory] = useState(CATEGORIES[0])
  const [description, setDescription] = useState(""); const [targetDate, setTargetDate] = useState("")
  const [filterCat, setFilterCat] = useState("All"); const [filterStatus, setFilterStatus] = useState("All")
  const [milestoneText, setMilestoneText] = useState<Record<string, string>>({})

  useEffect(() => { setMounted(true) }, [])

  function addVision() {
    if (!title.trim()) return
    const v: Vision = { id: crypto.randomUUID(), title: title.trim(), category, description: description.trim(), targetDate, status: "dream", progress: 0, milestones: [] }
    update([v, ...visions]); setTitle(""); setDescription(""); setTargetDate(""); setShowForm(false)
  }
  function remove(id: string) { update(visions.filter(v => v.id !== id)) }
  function cycle(id: string) {
    update(visions.map(v => {
      if (v.id !== id) return v
      const nextIdx = (STATUSES.indexOf(v.status as typeof STATUSES[number]) + 1) % STATUSES.length
      const nextStatus = STATUSES[nextIdx]
      return { ...v, status: nextStatus, achievedDate: nextStatus === "achieved" ? new Date().toISOString().split("T")[0] : v.achievedDate }
    }))
  }
  function updateProgress(id: string, progress: number) {
    update(visions.map(v => v.id === id ? { ...v, progress: Math.max(0, Math.min(100, progress)) } : v))
  }
  function addMilestone(id: string) {
    const text = milestoneText[id]?.trim()
    if (!text) return
    const ms: Milestone = { id: crypto.randomUUID(), text, done: false }
    update(visions.map(v => v.id === id ? { ...v, milestones: [...(v.milestones || []), ms] } : v))
    setMilestoneText(prev => ({ ...prev, [id]: "" }))
  }
  function toggleMilestone(visionId: string, msId: string) {
    update(visions.map(v => v.id === visionId ? { ...v, milestones: (v.milestones || []).map(m => m.id === msId ? { ...m, done: !m.done } : m) } : v))
  }
  function removeMilestone(visionId: string, msId: string) {
    update(visions.map(v => v.id === visionId ? { ...v, milestones: (v.milestones || []).filter(m => m.id !== msId) } : v))
  }
  function move(id: string, dir: -1 | 1) {
    const i = visions.findIndex(v => v.id === id); if (i < 0) return
    const j = i + dir; if (j < 0 || j >= visions.length) return
    const next = [...visions]; [next[i], next[j]] = [next[j], next[i]]; update(next)
  }

  const filtered = visions.filter(v => (filterCat === "All" || v.category === filterCat) && (filterStatus === "All" || v.status === filterStatus))
  const achieved = visions.filter(v => v.status === "achieved").length
  const inProgress = visions.filter(v => v.status === "in progress").length

  if (!mounted) return null
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Vision Board</h1>
        </div>
        <p className="text-sm text-muted-foreground">Visualize the life you are building — pin your dreams where you can see them every day</p>
      </div>

      <Card className="border-violet-200 bg-violet-50/50 dark:bg-violet-950/20 dark:border-violet-800">
        <CardContent className="pt-5 text-sm text-muted-foreground">
          <p className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5 text-violet-500 shrink-0" />Research from Dominican University shows people who write goals are 42% more likely to achieve them. Visualizing them adds emotional weight. This board is your North Star.</p>
        </CardContent>
      </Card>

      {/* Vision Board Stats */}
      {visions.length > 0 && (() => {
        const achievementRate = visions.length > 0 ? Math.round((achieved / visions.length) * 100) : 0
        const achievedVisions = visions.filter(v => v.status === "achieved" && v.achievedDate && v.targetDate)
        let avgDays: number | null = null
        if (achievedVisions.length > 0) {
          const totalDays = achievedVisions.reduce((sum, v) => {
            const created = new Date(v.targetDate).getTime()
            const done = new Date(v.achievedDate!).getTime()
            return sum + Math.max(0, Math.abs(done - created)) / 86400000
          }, 0)
          avgDays = Math.round(totalDays / achievedVisions.length)
        }
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <Sparkles className="h-4 w-4 mx-auto mb-1 text-violet-500" />
                <p className="text-xl font-bold">{visions.length}</p>
                <p className="text-[10px] text-muted-foreground">Total visions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Trophy className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                <p className="text-xl font-bold text-emerald-600">{achieved}</p>
                <p className="text-[10px] text-muted-foreground">Achieved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Target className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                <p className="text-xl font-bold text-amber-600">{inProgress}</p>
                <p className="text-[10px] text-muted-foreground">In progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <BarChart3 className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                <p className="text-xl font-bold text-blue-600">{achievementRate}%</p>
                <p className="text-[10px] text-muted-foreground">Achievement rate</p>
              </CardContent>
            </Card>
            {avgDays !== null && (
              <div className="col-span-2 md:col-span-4 text-center">
                <p className="text-xs text-muted-foreground">Average time from dream to achieved: <strong className="text-foreground">{avgDays} days</strong></p>
              </div>
            )}
          </div>
        )
      })()}

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary">{visions.length} visions</Badge>
        <Badge variant="secondary" className="bg-green-100 text-green-700">{achieved} achieved</Badge>
        <Badge variant="secondary" className="bg-amber-100 text-amber-700">{inProgress} in progress</Badge>
        <div className="ml-auto"><Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" />{showForm ? "Cancel" : "New Vision"}</Button></div>
      </div>

      {showForm && (
        <Card><CardContent className="pt-5 space-y-3">
          <Input placeholder="Vision title (e.g. Own a home by 30)" value={title} onChange={e => setTitle(e.target.value)} />
          <div className="flex gap-2 flex-wrap">
            <select className="border rounded-md px-3 py-2 text-sm bg-background" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <Input type="date" className="w-auto" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>
          <Textarea placeholder="Why does this matter to you?" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          <Button onClick={addVision} disabled={!title.trim()}>Add to Board</Button>
        </CardContent></Card>
      )}

      <div className="flex gap-2 flex-wrap items-center text-sm">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select className="border rounded-md px-2 py-1 text-sm bg-background" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option>All</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="border rounded-md px-2 py-1 text-sm bg-background" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(v => (
          <Card key={v.id} className={cn("transition-all", v.status === "achieved" && "border-2 border-amber-400 shadow-amber-100 shadow-md")}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={cn("h-3 w-3 rounded-full bg-gradient-to-br", CAT_COLORS[v.category])} />
                  <CardTitle className="text-base leading-tight">{v.title}</CardTitle>
                </div>
                {v.status === "achieved" && <Badge className="bg-amber-400 text-amber-900 shrink-0"><Trophy className="h-3 w-3 mr-1" />Achieved</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs">{v.category}</Badge>
                <Badge className={cn("text-xs cursor-pointer", STATUS_COLORS[v.status])} onClick={() => cycle(v.id)}>{v.status} ↻</Badge>
                {v.targetDate && <Badge variant="outline" className="text-xs">Target: {new Date(v.targetDate).toLocaleDateString()}</Badge>}
              </div>
              {v.description && <p className="text-sm text-muted-foreground">{v.description}</p>}

              {/* Progress tracking for in-progress visions */}
              {v.status === "in progress" && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">Progress</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all" style={{ width: `${v.progress || 0}%` }} />
                    </div>
                    <span className="text-xs font-mono font-bold w-10 text-right">{v.progress || 0}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[0, 25, 50, 75, 100].map(p => (
                      <Button key={p} variant="outline" size="sm" className={cn("h-6 px-2 text-[10px]", (v.progress || 0) === p && "bg-amber-100 border-amber-300")} onClick={() => updateProgress(v.id, p)}>{p}%</Button>
                    ))}
                  </div>

                  {/* Milestones */}
                  <div className="pt-1">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">Milestones</p>
                    {(v.milestones || []).length > 0 && (
                      <div className="space-y-1 mb-1.5">
                        {(v.milestones || []).map(ms => (
                          <div key={ms.id} className="flex items-center gap-1.5 text-xs">
                            <button onClick={() => toggleMilestone(v.id, ms.id)} className={cn("h-4 w-4 rounded border flex items-center justify-center shrink-0", ms.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30")}>
                              {ms.done && <CheckCircle className="h-3 w-3" />}
                            </button>
                            <span className={cn("flex-1", ms.done && "line-through text-muted-foreground")}>{ms.text}</span>
                            <button onClick={() => removeMilestone(v.id, ms.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1">
                      <Input className="h-7 text-xs" placeholder="Add milestone..." value={milestoneText[v.id] || ""} onChange={e => setMilestoneText(prev => ({ ...prev, [v.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addMilestone(v.id)} />
                      <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => addMilestone(v.id)}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-1 pt-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => move(v.id, -1)}><ChevronUp className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => move(v.id, 1)}><ChevronDown className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-auto text-destructive" onClick={() => remove(v.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No visions yet — add your first one above</p>}

      <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/20 dark:border-purple-800">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-purple-500" />The Science of Visualization</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Visualization works because it primes the reticular activating system (RAS) — the brain&apos;s filter that decides what to pay attention to. When you vividly imagine a goal, your RAS starts noticing opportunities, resources, and connections aligned with it.</p>
          <p>Elite athletes like Michael Phelps, top business leaders, and world-class performers all use systematic visualization as part of their preparation. The mental rehearsal creates neural pathways nearly identical to physical practice.</p>
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Link className="h-4 w-4 text-violet-500" />Your Future Self</CardTitle></CardHeader>
        <CardContent><div className="flex flex-wrap gap-2">
          {[{ href: "/future-self", label: "Letters to Future Self" }, { href: "/goals", label: "Goals" }, { href: "/trajectory", label: "Life Trajectory" }, { href: "/life-wheel", label: "Life Wheel" }].map(l => (
            <a key={l.href} href={l.href}><Badge variant="outline" className="cursor-pointer hover:bg-accent">{l.label}</Badge></a>
          ))}
        </div></CardContent>
      </Card>

      <nav className="flex flex-wrap gap-2 text-sm pt-4 border-t">
        {["/dashboard", "/goals", "/future-self", "/life-wheel", "/trajectory", "/values", "/habits"].map(p => (
          <a key={p} href={p} className="text-muted-foreground hover:text-foreground transition-colors">{p.slice(1).replace(/-/g, " ")}</a>
        ))}
      </nav>
    </div>
  )
}
