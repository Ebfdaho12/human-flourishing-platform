"use client"

import { useState, useEffect } from "react"
import { Scale, Plus, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Brain, Target, AlertTriangle, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface Decision {
  id: string
  date: string
  title: string
  context: string
  options: string
  reasoning: string
  choice: string
  expectedOutcome: string
  confidence: number
  reviewDate: string
  actualOutcome?: string
  wasRight?: boolean
  lessons?: string
  status: "pending" | "reviewed"
}

function getToday(): string { return new Date().toISOString().split("T")[0] }

export default function DecisionJournalPage() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [context, setContext] = useState("")
  const [options, setOptions] = useState("")
  const [reasoning, setReasoning] = useState("")
  const [choice, setChoice] = useState("")
  const [expectedOutcome, setExpectedOutcome] = useState("")
  const [confidence, setConfidence] = useState([60])
  const [reviewDate, setReviewDate] = useState("")

  // Review state
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [actualOutcome, setActualOutcome] = useState("")
  const [wasRight, setWasRight] = useState<boolean | null>(null)
  const [lessons, setLessons] = useState("")

  useEffect(() => {
    try { const saved = localStorage.getItem("hfp-decisions"); if (saved) setDecisions(JSON.parse(saved)) } catch {}
  }, [])

  function save(updated: Decision[]) { setDecisions(updated); localStorage.setItem("hfp-decisions", JSON.stringify(updated)) }

  function submit() {
    if (!title.trim() || !choice.trim()) return
    const decision: Decision = {
      id: `d-${Date.now()}`, date: getToday(), title: title.trim(), context: context.trim(),
      options: options.trim(), reasoning: reasoning.trim(), choice: choice.trim(),
      expectedOutcome: expectedOutcome.trim(), confidence: confidence[0],
      reviewDate: reviewDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      status: "pending",
    }
    save([decision, ...decisions])
    setTitle(""); setContext(""); setOptions(""); setReasoning(""); setChoice("")
    setExpectedOutcome(""); setConfidence([60]); setReviewDate(""); setShowForm(false)
  }

  function submitReview(id: string) {
    save(decisions.map(d => d.id === id ? { ...d, actualOutcome, wasRight: wasRight!, lessons, status: "reviewed" as const } : d))
    setReviewId(null); setActualOutcome(""); setWasRight(null); setLessons("")
  }

  function remove(id: string) { save(decisions.filter(d => d.id !== id)) }

  const today = getToday()
  const pendingReview = decisions.filter(d => d.status === "pending" && d.reviewDate <= today)
  const pending = decisions.filter(d => d.status === "pending" && d.reviewDate > today)
  const reviewed = decisions.filter(d => d.status === "reviewed")

  // Accuracy stats
  const reviewedCount = reviewed.length
  const correctCount = reviewed.filter(d => d.wasRight).length
  const accuracy = reviewedCount > 0 ? Math.round((correctCount / reviewedCount) * 100) : null
  const avgConfidence = decisions.length > 0 ? Math.round(decisions.reduce((s, d) => s + d.confidence, 0) / decisions.length) : null
  const calibrationGap = accuracy !== null && avgConfidence !== null ? Math.abs(accuracy - avgConfidence) : null

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Decision Journal</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Record decisions, revisit outcomes, calibrate your judgment. The only way to get better at deciding is to track how your decisions actually turn out.
        </p>
      </div>

      <Card className="border-2 border-blue-200 bg-blue-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why this works:</strong> Daniel Kahneman's research shows humans are overconfident in their predictions and forget their reasoning after the fact. By writing down your thinking BEFORE the outcome, you create an honest record. Over time, you learn where your judgment is calibrated (confidence matches accuracy) and where it isn't. This is how professional forecasters, poker players, and intelligence analysts improve.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      {decisions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold">{decisions.length}</p>
            <p className="text-[10px] text-muted-foreground">Decisions tracked</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className={cn("text-xl font-bold", accuracy !== null && accuracy >= 60 ? "text-emerald-600" : "text-amber-600")}>{accuracy !== null ? `${accuracy}%` : "—"}</p>
            <p className="text-[10px] text-muted-foreground">Accuracy rate</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold">{avgConfidence !== null ? `${avgConfidence}%` : "—"}</p>
            <p className="text-[10px] text-muted-foreground">Avg confidence</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className={cn("text-xl font-bold", calibrationGap !== null && calibrationGap <= 10 ? "text-emerald-600" : "text-amber-600")}>{calibrationGap !== null ? `${calibrationGap}%` : "—"}</p>
            <p className="text-[10px] text-muted-foreground">Calibration gap</p>
          </CardContent></Card>
        </div>
      )}

      {/* Ready for review */}
      {pendingReview.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/20">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> Ready for Review ({pendingReview.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pendingReview.map(d => (
              <div key={d.id} className="rounded-lg border border-amber-200 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{d.title}</p>
                  <Badge variant="outline" className="text-[8px]">{d.confidence}% confident</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1"><strong>Choice:</strong> {d.choice}</p>
                <p className="text-[10px] text-muted-foreground mb-2"><strong>Expected:</strong> {d.expectedOutcome}</p>
                {reviewId === d.id ? (
                  <div className="space-y-2 border-t pt-2 mt-2">
                    <Textarea value={actualOutcome} onChange={e => setActualOutcome(e.target.value)} placeholder="What actually happened?" className="text-sm min-h-[60px]" />
                    <div className="flex gap-2">
                      <Button size="sm" variant={wasRight === true ? "default" : "outline"} onClick={() => setWasRight(true)} className={wasRight === true ? "bg-emerald-600" : ""}><CheckCircle className="h-3 w-3 mr-1" /> Right</Button>
                      <Button size="sm" variant={wasRight === false ? "default" : "outline"} onClick={() => setWasRight(false)} className={wasRight === false ? "bg-red-600" : ""}><XCircle className="h-3 w-3 mr-1" /> Wrong</Button>
                    </div>
                    <Input value={lessons} onChange={e => setLessons(e.target.value)} placeholder="What did you learn?" className="h-8 text-sm" />
                    <Button size="sm" onClick={() => submitReview(d.id)} disabled={wasRight === null}>Save Review</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setReviewId(d.id)}>Review This Decision</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* New decision form */}
      {showForm ? (
        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-base">Record a Decision</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><label className="text-xs font-medium">What are you deciding?</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Accept job offer at Company X" className="h-9 text-sm mt-1" /></div>
            <div><label className="text-xs font-medium">Context — what's the situation?</label>
            <Textarea value={context} onChange={e => setContext(e.target.value)} placeholder="Background, constraints, stakes..." className="text-sm min-h-[60px] mt-1" /></div>
            <div><label className="text-xs font-medium">Options considered</label>
            <Textarea value={options} onChange={e => setOptions(e.target.value)} placeholder="Option A: ... Option B: ... Option C: ..." className="text-sm min-h-[50px] mt-1" /></div>
            <div><label className="text-xs font-medium">Your reasoning — WHY this choice?</label>
            <Textarea value={reasoning} onChange={e => setReasoning(e.target.value)} placeholder="The mental models, data, and intuition behind your choice..." className="text-sm min-h-[60px] mt-1" /></div>
            <div><label className="text-xs font-medium">Your choice</label>
            <Input value={choice} onChange={e => setChoice(e.target.value)} placeholder="I'm choosing to..." className="h-9 text-sm mt-1" /></div>
            <div><label className="text-xs font-medium">Expected outcome</label>
            <Input value={expectedOutcome} onChange={e => setExpectedOutcome(e.target.value)} placeholder="I expect that..." className="h-9 text-sm mt-1" /></div>
            <div>
              <label className="text-xs font-medium">Confidence: <span className="text-blue-600">{confidence[0]}%</span></label>
              <Slider min={5} max={99} step={5} value={confidence} onValueChange={setConfidence} className="mt-2" />
            </div>
            <div><label className="text-xs font-medium">Review date</label>
            <Input type="date" value={reviewDate} onChange={e => setReviewDate(e.target.value)} className="h-9 text-sm mt-1 w-40" /></div>
            <div className="flex gap-2">
              <Button onClick={submit} disabled={!title.trim() || !choice.trim()} className="bg-blue-600 hover:bg-blue-700">Record Decision</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowForm(true)} className="w-full"><Plus className="h-4 w-4 mr-1" /> Record a New Decision</Button>
      )}

      {/* Pending decisions */}
      {pending.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pending Decisions ({pending.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pending.map(d => (
              <div key={d.id} className="rounded-lg border p-3 group">
                <div className="flex items-center justify-between">
                  <button onClick={() => setExpanded(expanded === d.id ? null : d.id)} className="flex items-center gap-2 text-left flex-1">
                    <p className="text-xs font-semibold">{d.title}</p>
                    {expanded === d.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[8px]">{d.confidence}%</Badge>
                    <Badge variant="outline" className="text-[8px]">Review: {d.reviewDate}</Badge>
                    <button onClick={() => remove(d.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
                {expanded === d.id && (
                  <div className="mt-2 pt-2 border-t space-y-1 text-[10px] text-muted-foreground">
                    <p><strong>Recorded:</strong> {d.date}</p>
                    {d.context && <p><strong>Context:</strong> {d.context}</p>}
                    {d.options && <p><strong>Options:</strong> {d.options}</p>}
                    <p><strong>Choice:</strong> {d.choice}</p>
                    {d.reasoning && <p><strong>Reasoning:</strong> {d.reasoning}</p>}
                    <p><strong>Expected:</strong> {d.expectedOutcome}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reviewed decisions */}
      {reviewed.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Reviewed ({reviewed.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {reviewed.slice(0, 10).map(d => (
              <div key={d.id} className={cn("rounded-lg border p-3", d.wasRight ? "border-emerald-200 bg-emerald-50/10" : "border-red-200 bg-red-50/10")}>
                <div className="flex items-center gap-2 mb-1">
                  {d.wasRight ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <p className="text-xs font-semibold flex-1">{d.title}</p>
                  <Badge variant="outline" className="text-[8px]">{d.confidence}% confident</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground"><strong>Choice:</strong> {d.choice}</p>
                {d.actualOutcome && <p className="text-[10px] text-muted-foreground"><strong>Actual:</strong> {d.actualOutcome}</p>}
                {d.lessons && <p className="text-[10px] text-muted-foreground"><strong>Lesson:</strong> {d.lessons}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-violet-900 mb-2 flex items-center gap-2"><Brain className="h-4 w-4" /> Calibration</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The goal is not 100% accuracy — it is <strong>calibration</strong>. When you say you are 70% confident,
            you should be right about 70% of the time. If your accuracy is 90% but your average confidence is 60%,
            you are underconfident — trust yourself more. If your accuracy is 50% but confidence is 80%, you are
            overconfident — seek more information before deciding. The calibration gap narrows with practice.
            Professional forecasters get it within 5%.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/mental-models" className="text-sm text-amber-600 hover:underline">Mental Models</a>
        <a href="/cognitive-biases" className="text-sm text-red-600 hover:underline">Cognitive Biases</a>
        <a href="/stoicism" className="text-sm text-slate-600 hover:underline">Stoicism</a>
        <a href="/character-sheet" className="text-sm text-orange-600 hover:underline">Character Sheet</a>
        <a href="/decisions" className="text-sm text-violet-600 hover:underline">Quick Decisions</a>
      </div>
    </div>
  )
}
