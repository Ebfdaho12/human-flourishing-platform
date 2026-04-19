"use client"
import { useState, useCallback } from "react"
import useSWR from "swr"
import { Brain, Plus, BookOpen, Phone, Sparkles, Heart, Smile, Frown, Meh, Edit3, Trash2, Shield, Wind, Leaf, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const EMOTION_OPTIONS = [
  "Happy", "Grateful", "Calm", "Hopeful", "Energized",
  "Sad", "Anxious", "Stressed", "Angry", "Lonely",
  "Overwhelmed", "Confused", "Numb", "Tired", "Content",
  "Excited", "Irritable", "Fearful", "Proud", "Loved",
]

const TRIGGER_OPTIONS = [
  "Work", "Family", "Relationships", "Health", "Finance",
  "Sleep", "Social media", "News", "Weather", "Exercise",
]

function moodColor(score: number) {
  if (score >= 8) return "text-emerald-400"
  if (score >= 6) return "text-green-400"
  if (score >= 4) return "text-yellow-400"
  if (score >= 2) return "text-orange-400"
  return "text-red-400"
}

function moodLabel(score: number) {
  if (score >= 9) return "Excellent"
  if (score >= 7) return "Good"
  if (score >= 5) return "Okay"
  if (score >= 3) return "Low"
  return "Very low"
}

function MoodIcon({ score }: { score: number }) {
  if (score >= 6) return <Smile className="h-5 w-5" />
  if (score >= 4) return <Meh className="h-5 w-5" />
  return <Frown className="h-5 w-5" />
}

function MoodCheckInDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [score, setScore] = useState([5])
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  function toggleEmotion(e: string) {
    setSelectedEmotions((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e])
  }
  function toggleTrigger(t: string) {
    setSelectedTriggers((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  async function handleSubmit() {
    setLoading(true)
    await fetch("/api/mental-health/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: score[0],
        emotions: selectedEmotions,
        triggers: selectedTriggers,
        notes: notes || null,
      }),
    })
    setLoading(false)
    setOpen(false)
    setSelectedEmotions([])
    setSelectedTriggers([])
    setNotes("")
    setScore([5])
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Heart className="h-4 w-4" /> Check In</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daily Mood Check-In</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div className="space-y-3">
            <Label>How are you feeling? <span className={cn("font-bold", moodColor(score[0]))}>{score[0]}/10 — {moodLabel(score[0])}</span></Label>
            <Slider
              min={1} max={10} step={1}
              value={score}
              onValueChange={setScore}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very low</span><span>Excellent</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Emotions (select all that apply)</Label>
            <div className="flex flex-wrap gap-1.5">
              {EMOTION_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => toggleEmotion(e)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs border transition-colors",
                    selectedEmotions.includes(e)
                      ? "border-violet-500 bg-violet-500/20 text-violet-300"
                      : "border-border text-muted-foreground hover:border-border/80"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Contributing factors (optional)</Label>
            <div className="flex flex-wrap gap-1.5">
              {TRIGGER_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTrigger(t)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs border transition-colors",
                    selectedTriggers.includes(t)
                      ? "border-pink-500 bg-pink-500/20 text-pink-300"
                      : "border-border text-muted-foreground hover:border-border/80"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="What's on your mind today?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save check-in · +25 FOUND (first)"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function NewJournalDialog({ onSaved, editEntry }: { onSaved: () => void; editEntry?: any }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(editEntry?.title ?? "")
  const [content, setContent] = useState(editEntry?.content ?? "")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!content.trim()) return
    setLoading(true)
    if (editEntry) {
      await fetch("/api/mental-health/journal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: editEntry.id, title, content }),
      })
    } else {
      await fetch("/api/mental-health/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      })
    }
    setLoading(false)
    setOpen(false)
    setTitle("")
    setContent("")
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><BookOpen className="h-4 w-4" /> New Entry</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editEntry ? "Edit Journal Entry" : "New Journal Entry"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Title (optional)</Label>
            <Input placeholder="What's this entry about?" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Entry</Label>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !content.trim()}>
            {loading ? "Saving..." : editEntry ? "Save changes" : "Save entry · +25 FOUND (first)"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SelfCarePanel() {
  const { data } = useSWR("/api/mental-health/resources", fetcher)
  const [activeExercise, setActiveExercise] = useState<number | null>(null)

  const crisis: any[] = data?.crisis ?? []
  const selfCare: any[] = data?.selfCare ?? []

  return (
    <div className="space-y-6">
      {/* Self-care exercises */}
      <div>
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Leaf className="h-4 w-4 text-emerald-500" />
          Grounding & Coping Exercises
        </h3>
        <div className="grid gap-3">
          {selfCare.map((exercise: any, i: number) => (
            <Card
              key={i}
              className={cn(
                "cursor-pointer transition-all",
                activeExercise === i ? "border-emerald-300 bg-emerald-50/50" : "hover:border-border/80"
              )}
              onClick={() => setActiveExercise(activeExercise === i ? null : i)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{exercise.title}</p>
                  <Wind className={cn("h-4 w-4 transition-transform", activeExercise === i ? "text-emerald-500 rotate-45" : "text-muted-foreground/30")} />
                </div>
                {activeExercise === i && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <p className="text-sm text-muted-foreground leading-relaxed">{exercise.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Crisis resources */}
      <div>
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-rose-500" />
          Crisis Resources — Real, Verified Helplines
        </h3>
        <div className="grid gap-2">
          {crisis.map((resource: any, i: number) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{resource.name}</p>
                      <Badge variant="outline" className="text-[10px] py-0">{resource.country}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{resource.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-medium text-rose-600">{resource.phone}</span>
                      <span className="text-[10px] text-muted-foreground">{resource.available}</span>
                    </div>
                  </div>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground/50 hover:text-rose-500 transition-colors shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-border/30 bg-card/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            All helplines listed are real, verified services available 24/7. If you or someone you know is in crisis, please reach out immediately.
            You are not alone.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MentalHealthPage() {
  const { data: moodData, mutate: mutateMood } = useSWR("/api/mental-health/mood?limit=14", fetcher)
  const { data: journalData, mutate: mutateJournal } = useSWR("/api/mental-health/journal?limit=10", fetcher)
  const { data: insightsData, mutate: mutateInsights } = useSWR("/api/mental-health/insights", fetcher)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const moodEntries: any[] = moodData?.entries ?? []
  const journalEntries: any[] = journalData?.entries ?? []
  const insights: any[] = insightsData?.insights ?? []
  const hasApiKey: boolean = insightsData?.hasApiKey ?? false

  const refreshAll = useCallback(() => {
    mutateMood()
    mutateJournal()
    mutateInsights()
  }, [mutateMood, mutateJournal, mutateInsights])

  const avgMood = moodEntries.length > 0
    ? (moodEntries.reduce((sum, e) => sum + e.score, 0) / moodEntries.length).toFixed(1)
    : null

  async function deleteJournal(entryId: string) {
    setDeletingId(entryId)
    await fetch(`/api/mental-health/journal?entryId=${entryId}`, { method: "DELETE" })
    setDeletingId(null)
    mutateJournal()
  }

  async function requestInsight() {
    setLoadingInsight(true)
    await fetch("/api/mental-health/insights", { method: "POST" })
    setLoadingInsight(false)
    mutateInsights()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Mental Health</h1>
          </div>
          <p className="text-sm text-muted-foreground">Human connection first. AI as bridge, not destination.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <NewJournalDialog onSaved={refreshAll} />
          <MoodCheckInDialog onSaved={refreshAll} />
        </div>
      </div>

      {/* Crisis banner — always visible */}
      <Card className="border-rose-500/30 bg-rose-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Phone className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-rose-300">Crisis support is always available</p>
            <p className="text-xs text-muted-foreground mt-1">
              988 Suicide & Crisis Lifeline: call or text <strong>988</strong> · Crisis Text Line: text HOME to <strong>741741</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="mood">
        <TabsList>
          <TabsTrigger value="mood">Mood</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="selfcare">Self-Care</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* ── Mood ── */}
        <TabsContent value="mood" className="mt-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Card><CardContent className="p-4 text-center">
              <p className={cn("text-2xl font-bold", avgMood ? moodColor(parseFloat(avgMood)) : "text-muted-foreground")}>
                {avgMood ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Avg mood (14d)</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-pink-400">{moodEntries.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Check-ins</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-violet-400">{journalEntries.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Journal entries</p>
            </CardContent></Card>
          </div>

          {/* Mood trend — simple visual */}
          {moodEntries.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Mood Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-16">
                  {moodEntries.slice(0, 14).reverse().map((entry: any, i: number) => (
                    <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={cn("w-full rounded-sm transition-all", moodColor(entry.score).replace("text-", "bg-"))}
                        style={{ height: `${(entry.score / 10) * 100}%`, minHeight: "4px", opacity: 0.8 }}
                      />
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(entry.recordedAt).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mood entries */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Check-In History</CardTitle></CardHeader>
            <CardContent>
              {moodEntries.length === 0 ? (
                <div className="py-10 text-center">
                  <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No check-ins yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Daily mood tracking earns you FOUND tokens.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {moodEntries.map((entry: any) => (
                    <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/40 px-3 py-2.5">
                      <div className={cn("mt-0.5 shrink-0", moodColor(entry.score))}>
                        <MoodIcon score={entry.score} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("text-sm font-bold", moodColor(entry.score))}>{entry.score}/10</span>
                          <span className="text-sm text-muted-foreground">{moodLabel(entry.score)}</span>
                          <Badge variant="outline" className="text-xs py-0">
                            {new Date(entry.recordedAt).toLocaleDateString()}
                          </Badge>
                        </div>
                        {entry.emotions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.emotions.map((e: string) => (
                              <span key={e} className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{e}</span>
                            ))}
                          </div>
                        )}
                        {entry.notes && <p className="text-xs text-muted-foreground/70 mt-1 italic">{entry.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Journal ── */}
        <TabsContent value="journal" className="mt-4 space-y-3">
          {journalEntries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Your journal is empty.</p>
                <p className="text-xs text-muted-foreground mt-1">Writing regularly earns 25 FOUND for your first entry, 100 FOUND at 10 entries.</p>
              </CardContent>
            </Card>
          ) : (
            journalEntries.map((entry: any) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      {entry.title && <p className="font-medium text-sm mb-0.5">{entry.title}</p>}
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString(undefined, {
                          weekday: "short", month: "short", day: "numeric", year: "numeric",
                        })}
                        {entry.mood && <span className={cn("ml-2 font-medium", moodColor(entry.mood))}> · {entry.mood}/10</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteJournal(entry.id)}
                      disabled={deletingId === entry.id}
                      className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{entry.content}</p>
                  {entry.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.map((tag: string) => (
                        <span key={tag} className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ── Self-Care & Resources ── */}
        <TabsContent value="selfcare" className="mt-4 space-y-4">
          <SelfCarePanel />
        </TabsContent>

        {/* ── AI Insights ── */}
        <TabsContent value="insights" className="mt-4 space-y-4">
          {!hasApiKey && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-300">AI insights not yet enabled</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your Anthropic API key to unlock compassionate mood pattern analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {hasApiKey && moodEntries.length > 0 && (
            <Button onClick={requestInsight} disabled={loadingInsight} className="w-full" variant="outline">
              <Sparkles className="h-4 w-4" />
              {loadingInsight ? "Reflecting on your data..." : "Generate wellbeing insight"}
            </Button>
          )}

          {insights.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No insights yet.</p>
                {moodEntries.length === 0 && <p className="text-xs text-muted-foreground mt-1">Complete a mood check-in first.</p>}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {insights.map((insight: any) => (
                <Card key={insight.id} className={cn(!insight.isRead && "border-pink-500/30")}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-4 w-4 text-pink-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm leading-relaxed">{insight.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(insight.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="border-border/30 bg-card/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground/70">Privacy note:</strong> Your journal and mood data are stored only on this server and never shared. AI insights are generated on-demand using only your data.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
