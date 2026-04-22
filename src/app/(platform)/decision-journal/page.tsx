"use client"

import { useState } from "react"
import { Scale, Plus, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Brain, Target, AlertTriangle, Trash2, BarChart3, TrendingUp } from "lucide-react"
import { useSyncedStorage } from "@/hooks/use-synced-storage"
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
  const [decisions, save] = useSyncedStorage<Decision[]>("hfp-decisions", [])
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

      {/* Calibration Visualization */}
      {(() => {
        if (reviewed.length < 5) return null

        const buckets = [
          { label: "0-30%", min: 0, max: 30 },
          { label: "30-50%", min: 30, max: 50 },
          { label: "50-70%", min: 50, max: 70 },
          { label: "70-90%", min: 70, max: 90 },
          { label: "90-100%", min: 90, max: 100 },
        ]

        const bucketData = buckets.map(bucket => {
          const inBucket = reviewed.filter(d => d.confidence >= bucket.min && d.confidence < (bucket.max === 100 ? 101 : bucket.max))
          const total = inBucket.length
          const correct = inBucket.filter(d => d.wasRight).length
          const actualAccuracy = total > 0 ? Math.round((correct / total) * 100) : null
          const midpoint = (bucket.min + bucket.max) / 2
          return { ...bucket, total, correct, actualAccuracy, midpoint }
        })

        const filledBuckets = bucketData.filter(b => b.total > 0)
        const overallGap = filledBuckets.length > 0
          ? Math.round(filledBuckets.reduce((sum, b) => sum + Math.abs((b.actualAccuracy ?? 0) - b.midpoint), 0) / filledBuckets.length)
          : null

        const gapInterpretation = overallGap === null ? "" :
          overallGap <= 5 ? "Exceptional calibration — near professional forecaster level." :
          overallGap <= 10 ? "Good calibration — your confidence closely tracks reality." :
          overallGap <= 20 ? "Moderate calibration — room for improvement, keep tracking." :
          "Significant gap — pay close attention to where confidence diverges from outcomes."

        return (
          <Card className="border-2 border-blue-200 bg-blue-50/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" /> Calibration Visualization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[10px] text-muted-foreground">Confidence vs actual accuracy. Perfect calibration = bars match the diagonal.</p>
              <div className="space-y-1.5">
                {bucketData.map(b => (
                  <div key={b.label} className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground w-14 text-right shrink-0">{b.label}</span>
                    <div className="flex-1 relative h-5 bg-muted rounded-md overflow-hidden">
                      {/* Perfect calibration reference line */}
                      <div className="absolute top-0 bottom-0 border-r-2 border-dashed border-violet-300 z-10" style={{ left: `${b.midpoint}%` }} />
                      {/* Actual accuracy bar */}
                      {b.actualAccuracy !== null ? (
                        <div
                          className={cn("h-full rounded-md transition-all duration-500", b.actualAccuracy > b.midpoint ? "bg-emerald-400" : b.actualAccuracy < b.midpoint ? "bg-amber-400" : "bg-blue-400")}
                          style={{ width: `${b.actualAccuracy}%` }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-[8px] text-muted-foreground">No data</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-mono w-10 shrink-0">
                      {b.actualAccuracy !== null ? `${b.actualAccuracy}%` : "—"}
                    </span>
                    <span className="text-[8px] text-muted-foreground w-6 shrink-0">n={b.total}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Under-confident</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Calibrated</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Over-confident</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 border-r-2 border-dashed border-violet-300" /> Perfect line</span>
              </div>
              {overallGap !== null && (
                <p className="text-xs text-muted-foreground">
                  Your calibration gap is <strong className="text-foreground">{overallGap}%</strong> — {gapInterpretation}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })()}

      {/* Decision Patterns */}
      {(() => {
        if (reviewed.length < 3) return null

        // Confidence bias direction
        const avgReviewedConfidence = Math.round(reviewed.reduce((s, d) => s + d.confidence, 0) / reviewed.length)
        const reviewedAccuracy = Math.round((reviewed.filter(d => d.wasRight).length / reviewed.length) * 100)
        const confDiff = avgReviewedConfidence - reviewedAccuracy
        const biasDirection = confDiff > 3 ? "over" : confDiff < -3 ? "under" : "well"
        const biasMagnitude = Math.abs(confDiff)

        // Average time between decision and review
        const reviewDelays = reviewed.map(d => {
          const decisionDate = new Date(d.date).getTime()
          const reviewDateVal = new Date(d.reviewDate).getTime()
          return (reviewDateVal - decisionDate) / (1000 * 60 * 60 * 24)
        }).filter(d => d > 0)
        const avgDelay = reviewDelays.length > 0 ? Math.round(reviewDelays.reduce((s, d) => s + d, 0) / reviewDelays.length) : null

        // Check if longer decisions correlate with better accuracy
        const medianDelay = reviewDelays.length > 0 ? [...reviewDelays].sort((a, b) => a - b)[Math.floor(reviewDelays.length / 2)] : 0
        const longerDecisions = reviewed.filter(d => {
          const delay = (new Date(d.reviewDate).getTime() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24)
          return delay > medianDelay
        })
        const shorterDecisions = reviewed.filter(d => {
          const delay = (new Date(d.reviewDate).getTime() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24)
          return delay <= medianDelay
        })
        const longerAccuracy = longerDecisions.length > 0 ? longerDecisions.filter(d => d.wasRight).length / longerDecisions.length : 0
        const shorterAccuracy = shorterDecisions.length > 0 ? shorterDecisions.filter(d => d.wasRight).length / shorterDecisions.length : 0
        const longerIsBetter = longerAccuracy > shorterAccuracy + 0.05

        // Most common keywords in titles (simple heuristic)
        const titleWords = reviewed.flatMap(d => d.title.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !["this", "that", "with", "from", "about", "should", "would", "could", "have", "been", "will", "what", "when", "where", "which", "their", "there", "than", "then"].includes(w)))
        const wordCounts: Record<string, number> = {}
        titleWords.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1 })
        const topTopic = Object.entries(wordCounts).sort((a, b) => b[1] - a[1])[0]

        return (
          <Card className="border-2 border-indigo-200 bg-indigo-50/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" /> Decision Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border p-2">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Confidence Bias</p>
                  <p className={cn("text-sm font-bold", biasDirection === "over" ? "text-amber-600" : biasDirection === "under" ? "text-blue-600" : "text-emerald-600")}>
                    {biasDirection === "well" ? "Well Calibrated" : `${biasDirection === "over" ? "Over" : "Under"}-confident by ${biasMagnitude}%`}
                  </p>
                </div>
                <div className="rounded-lg border p-2">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Avg Review Time</p>
                  <p className="text-sm font-bold">{avgDelay !== null ? `${avgDelay} days` : "—"}</p>
                </div>
              </div>
              {topTopic && topTopic[1] >= 2 && (
                <p className="text-xs text-muted-foreground">
                  Most common decision topic: <strong className="text-foreground">{topTopic[0]}</strong> ({topTopic[1]} decisions)
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                You tend to be <strong className={cn(biasDirection === "over" ? "text-amber-600" : biasDirection === "under" ? "text-blue-600" : "text-emerald-600")}>
                  {biasDirection === "well" ? "well-calibrated" : `${biasDirection}-confident by ${biasMagnitude}%`}
                </strong>.
              </p>
              {longerIsBetter && reviewed.length >= 5 && (
                <p className="text-xs text-muted-foreground">
                  Your accuracy improves when you take longer to decide — consider giving important decisions more time.
                </p>
              )}
            </CardContent>
          </Card>
        )
      })()}

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
