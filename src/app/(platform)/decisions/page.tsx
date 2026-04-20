"use client"

import { useState, useEffect } from "react"
import { Scale, Plus, Clock, CheckCircle, XCircle, HelpCircle, ChevronDown, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Decision {
  id: string
  title: string
  context: string // what was happening
  options: string // what were the options
  reasoning: string // why you chose what you chose
  decision: string // what you decided
  expectedOutcome: string
  actualOutcome: string
  rating: number // 1-5 how good was this decision in hindsight
  date: string
  reviewDate: string
  reviewed: boolean
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "", context: "", options: "", reasoning: "", decision: "", expectedOutcome: "",
  })

  useEffect(() => {
    const stored = localStorage.getItem("hfp-decisions")
    if (stored) setDecisions(JSON.parse(stored))
  }, [])

  function save(updated: Decision[]) {
    setDecisions(updated)
    localStorage.setItem("hfp-decisions", JSON.stringify(updated))
  }

  function addDecision() {
    if (!form.title.trim() || !form.decision.trim()) return
    const reviewDate = new Date()
    reviewDate.setMonth(reviewDate.getMonth() + 3)
    save([{
      id: Date.now().toString(36),
      ...form,
      actualOutcome: "",
      rating: 0,
      date: new Date().toISOString(),
      reviewDate: reviewDate.toISOString(),
      reviewed: false,
    }, ...decisions])
    setForm({ title: "", context: "", options: "", reasoning: "", decision: "", expectedOutcome: "" })
    setShowAdd(false)
  }

  function reviewDecision(id: string, actualOutcome: string, rating: number) {
    save(decisions.map(d => d.id === id ? { ...d, actualOutcome, rating, reviewed: true } : d))
  }

  function removeDecision(id: string) {
    save(decisions.filter(d => d.id !== id))
  }

  const needsReview = decisions.filter(d => !d.reviewed && new Date(d.reviewDate) <= new Date())
  const reviewed = decisions.filter(d => d.reviewed)
  const avgRating = reviewed.length > 0 ? Math.round(reviewed.reduce((s, d) => s + d.rating, 0) / reviewed.length * 10) / 10 : 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Decision Journal</h1>
          </div>
          <p className="text-sm text-muted-foreground">Record big decisions BEFORE you know the outcome. Review later. Learn from patterns.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4" /> Log Decision</Button>
      </div>

      {/* Stats */}
      {decisions.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-indigo-600">{decisions.length}</p>
              <p className="text-xs text-muted-foreground">Decisions logged</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{needsReview.length}</p>
              <p className="text-xs text-muted-foreground">Need review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{avgRating || "—"}/5</p>
              <p className="text-xs text-muted-foreground">Avg rating</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <Card className="border-2 border-indigo-200">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Write this BEFORE you know the outcome. The power is in capturing your reasoning in the moment — not after hindsight bias kicks in.
            </p>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="What decision are you making?" />
            <Textarea value={form.context} onChange={e => setForm({ ...form, context: e.target.value })}
              placeholder="What is the context? What is happening in your life right now that led to this decision?" className="min-h-[60px]" />
            <Textarea value={form.options} onChange={e => setForm({ ...form, options: e.target.value })}
              placeholder="What are the options you are considering?" className="min-h-[60px]" />
            <Input value={form.decision} onChange={e => setForm({ ...form, decision: e.target.value })}
              placeholder="What did you decide?" />
            <Textarea value={form.reasoning} onChange={e => setForm({ ...form, reasoning: e.target.value })}
              placeholder="WHY did you choose this? What is your reasoning?" className="min-h-[60px]" />
            <Input value={form.expectedOutcome} onChange={e => setForm({ ...form, expectedOutcome: e.target.value })}
              placeholder="What do you expect to happen as a result?" />
            <p className="text-[10px] text-muted-foreground">You will be prompted to review this decision in 3 months.</p>
            <Button onClick={addDecision} disabled={!form.title.trim() || !form.decision.trim()} className="w-full">
              Log This Decision
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Needs review */}
      {needsReview.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Ready for Review
          </p>
          <div className="space-y-2">
            {needsReview.map(d => (
              <ReviewCard key={d.id} decision={d} onReview={reviewDecision} onRemove={removeDecision} />
            ))}
          </div>
        </div>
      )}

      {/* All decisions */}
      {decisions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">All Decisions</p>
          {decisions.map(d => {
            const isOpen = expanded === d.id
            return (
              <Card key={d.id} className="card-hover">
                <div className="cursor-pointer" onClick={() => setExpanded(isOpen ? null : d.id)}>
                  <CardContent className="p-3 flex items-center gap-3">
                    {d.reviewed ? (
                      d.rating >= 4 ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> :
                      d.rating >= 3 ? <HelpCircle className="h-4 w-4 text-amber-500 shrink-0" /> :
                      <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.title}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(d.date).toLocaleDateString()} · {d.decision}</p>
                    </div>
                    {d.reviewed && (
                      <Badge variant="outline" className={cn("text-[9px] shrink-0",
                        d.rating >= 4 ? "text-emerald-600 border-emerald-300" :
                        d.rating >= 3 ? "text-amber-600 border-amber-300" : "text-red-500 border-red-300"
                      )}>{d.rating}/5</Badge>
                    )}
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
                  </CardContent>
                </div>
                {isOpen && (
                  <div className="px-3 pb-3 border-t border-border pt-3 space-y-2 text-xs text-muted-foreground">
                    {d.context && <div><strong>Context:</strong> {d.context}</div>}
                    {d.options && <div><strong>Options considered:</strong> {d.options}</div>}
                    <div><strong>Decision:</strong> {d.decision}</div>
                    {d.reasoning && <div><strong>Reasoning:</strong> {d.reasoning}</div>}
                    {d.expectedOutcome && <div><strong>Expected outcome:</strong> {d.expectedOutcome}</div>}
                    {d.reviewed && d.actualOutcome && (
                      <div className="rounded-lg bg-muted/30 p-2.5 mt-2">
                        <strong>Actual outcome:</strong> {d.actualOutcome}
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <div key={s} className={cn("h-2 w-6 rounded-full",
                              s <= d.rating ? (d.rating >= 4 ? "bg-emerald-400" : d.rating >= 3 ? "bg-amber-400" : "bg-red-400") : "bg-muted"
                            )} />
                          ))}
                        </div>
                      </div>
                    )}
                    <button onClick={() => removeDecision(d.id)} className="text-[10px] text-muted-foreground/40 hover:text-destructive flex items-center gap-1 mt-2">
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      ) : !showAdd && (
        <Card>
          <CardContent className="py-12 text-center">
            <Scale className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No decisions logged yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Next time you face a big decision — career, financial, relationship — log it here before you decide.</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-indigo-200 bg-indigo-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why keep a decision journal?</strong> Daniel Kahneman (Nobel Prize, psychology) found that humans are terrible
            at remembering WHY they made decisions. After the outcome is known, your brain rewrites history — &quot;I always knew
            that would happen.&quot; A decision journal captures your actual reasoning in the moment. Over time, you see patterns:
            when your gut was right, when your analysis was wrong, and what biases consistently mislead you. Billionaire
            investors like Ray Dalio and Annie Duke (professional poker player turned decision scientist) consider this
            the single most valuable thinking tool they use.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/notes" className="text-sm text-violet-600 hover:underline">Quick Notes</a>
        <a href="/life-wheel" className="text-sm text-cyan-600 hover:underline">Life Wheel</a>
        <a href="/values" className="text-sm text-amber-600 hover:underline">Core Values</a>
      </div>
    </div>
  )
}

function ReviewCard({ decision, onReview, onRemove }: {
  decision: Decision
  onReview: (id: string, outcome: string, rating: number) => void
  onRemove: (id: string) => void
}) {
  const [outcome, setOutcome] = useState("")
  const [rating, setRating] = useState(3)

  return (
    <Card className="border-amber-200 bg-amber-50/20">
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold">{decision.title}</p>
          <p className="text-xs text-muted-foreground">Decided: {decision.decision}</p>
          <p className="text-xs text-muted-foreground">Expected: {decision.expectedOutcome}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Logged {new Date(decision.date).toLocaleDateString()}</p>
        </div>
        <Textarea value={outcome} onChange={e => setOutcome(e.target.value)}
          placeholder="What actually happened? Was the decision good or bad? What did you learn?" className="min-h-[60px]" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Rating:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(s)}
                className={cn("h-6 w-8 rounded text-xs font-bold transition-colors",
                  s <= rating ? (rating >= 4 ? "bg-emerald-100 text-emerald-700" : rating >= 3 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700") : "bg-muted text-muted-foreground"
                )}>{s}</button>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {rating >= 4 ? "Great decision" : rating >= 3 ? "Okay decision" : "Would do differently"}
          </span>
        </div>
        <Button onClick={() => onReview(decision.id, outcome, rating)} disabled={!outcome.trim()} className="w-full" size="sm">
          Complete Review
        </Button>
      </CardContent>
    </Card>
  )
}
