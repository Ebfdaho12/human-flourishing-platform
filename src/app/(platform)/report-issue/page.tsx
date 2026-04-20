"use client"

import { useState } from "react"
import useSWR from "swr"
import { Bug, Send, CheckCircle, AlertTriangle, Lightbulb, Eye, Camera, Mic, MicOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const ISSUE_TYPES = [
  { value: "BUG", label: "Bug / Something broken", icon: Bug, color: "text-red-500" },
  { value: "UI", label: "Design / UI issue", icon: Eye, color: "text-amber-500" },
  { value: "FEATURE", label: "Feature idea", icon: Lightbulb, color: "text-emerald-500" },
  { value: "CONFUSING", label: "Confusing / unclear", icon: AlertTriangle, color: "text-blue-500" },
]

const SEVERITY = [
  { value: "low", label: "Low — cosmetic or minor" },
  { value: "medium", label: "Medium — something doesn't work right" },
  { value: "high", label: "High — can't use a feature" },
  { value: "critical", label: "Critical — app crashes or data loss" },
]

export default function ReportIssuePage() {
  const { data: reportsData, mutate } = useSWR("/api/feedback?view=all", fetcher)
  const [type, setType] = useState("")
  const [severity, setSeverity] = useState("")
  const [page, setPage] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [steps, setSteps] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordingField, setRecordingField] = useState<"title" | "description" | "steps" | null>(null)

  function startVoiceInput(field: "title" | "description" | "steps") {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      if (field === "title") setTitle(prev => prev ? prev + " " + text : text)
      if (field === "description") setDescription(prev => prev ? prev + " " + text : text)
      if (field === "steps") setSteps(prev => prev ? prev + " " + text : text)
      setRecording(false)
      setRecordingField(null)
    }

    recognition.onend = () => { setRecording(false); setRecordingField(null) }
    recognition.onerror = () => { setRecording(false); setRecordingField(null) }

    setRecording(true)
    setRecordingField(field)
    recognition.start()
  }

  // Auto-detect current page
  const currentPage = typeof window !== "undefined" ? window.location.pathname : ""

  async function handleSubmit() {
    if (!type || !title || !description) return
    setSubmitting(true)

    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title,
        description: `[${severity || "medium"}] ${description}\n\n${steps ? `Steps to reproduce:\n${steps}\n\n` : ""}Page: ${page || currentPage}\nBrowser: ${typeof navigator !== "undefined" ? navigator.userAgent.split(" ").slice(-2).join(" ") : "unknown"}`,
        page: page || currentPage,
      }),
    })

    setSubmitting(false)
    setSubmitted(true)
    setTitle("")
    setDescription("")
    setSteps("")
    setPage("")
    setType("")
    setSeverity("")
    mutate()
    setTimeout(() => setSubmitted(false), 3000)
  }

  const reports = (reportsData?.feedback ?? []).map((r: any) => ({
    ...r,
    metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata,
  }))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
            <Bug className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Report an Issue</h1>
        </div>
        <p className="text-sm text-muted-foreground">Found a bug? Something confusing? Have an idea? Tell us here. Every report helps make the platform better.</p>
      </div>

      {/* Quick guide */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">How to write a great bug report:</p>
          <p className="text-xs text-amber-700">1. What page were you on? 2. What did you click/do? 3. What did you expect to happen? 4. What actually happened? — That's it. Copy/paste error messages if you see any.</p>
        </CardContent>
      </Card>

      {submitted && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-700">Report submitted! Thank you for helping improve the platform.</p>
          </CardContent>
        </Card>
      )}

      {/* Report form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ISSUE_TYPES.map(t => {
              const Icon = t.icon
              return (
                <button key={t.value} onClick={() => setType(t.value)}
                  className={cn("flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all",
                    type === t.value ? "border-violet-400 bg-violet-50 shadow-sm" : "border-border hover:bg-muted/50"
                  )}>
                  <Icon className={cn("h-5 w-5", t.color)} />
                  <span className="text-xs">{t.label}</span>
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue placeholder="How bad is it?" /></SelectTrigger>
                <SelectContent>
                  {SEVERITY.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Page (auto-detected)</Label>
              <Input value={page || currentPage} onChange={e => setPage(e.target.value)} placeholder="/energy" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Title — what's wrong in one sentence?</Label>
            <div className="flex gap-2">
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Energy page doesn't show the new content after refresh" className="flex-1" />
              <Button type="button" variant="outline" size="icon" onClick={() => startVoiceInput("title")}
                className={cn("shrink-0", recordingField === "title" && "bg-red-100 border-red-300 text-red-600 animate-pulse")}>
                {recordingField === "title" ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Description — what happened?</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => startVoiceInput("description")}
                className={cn("text-xs h-7", recordingField === "description" && "text-red-600 animate-pulse")}>
                {recordingField === "description" ? <><MicOff className="h-3 w-3" /> Recording...</> : <><Mic className="h-3 w-3" /> Speak it</>}
              </Button>
            </div>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What did you expect to happen? What actually happened? Copy/paste any error messages you see."
              className="min-h-[100px]" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Steps to reproduce (optional but very helpful)</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => startVoiceInput("steps")}
                className={cn("text-xs h-7", recordingField === "steps" && "text-red-600 animate-pulse")}>
                {recordingField === "steps" ? <><MicOff className="h-3 w-3" /> Recording...</> : <><Mic className="h-3 w-3" /> Speak it</>}
              </Button>
            </div>
            <Textarea value={steps} onChange={e => setSteps(e.target.value)}
              placeholder="1. Go to /energy&#10;2. Click 'How does P2P trading work?'&#10;3. Page shows old content instead of the new explanation"
              className="min-h-[80px]" />
          </div>

          <Button onClick={handleSubmit} disabled={submitting || !type || !title || !description} className="w-full">
            <Send className="h-4 w-4" />
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </CardContent>
      </Card>

      {/* Previous reports with status + rewards */}
      {reports.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Reports</h2>
          <div className="space-y-2">
            {reports.map((r: any, i: number) => {
              const meta = r.metadata || {}
              const hasResponse = !!meta.adminResponse || !!meta.status
              const statusColors: Record<string, string> = {
                RECEIVED: "text-blue-600 border-blue-300 bg-blue-50",
                IN_PROGRESS: "text-amber-600 border-amber-300 bg-amber-50",
                FIXED: "text-emerald-600 border-emerald-300 bg-emerald-50",
                IMPLEMENTED: "text-emerald-600 border-emerald-300 bg-emerald-50",
                WONT_FIX: "text-slate-600 border-slate-300 bg-slate-50",
                DUPLICATE: "text-slate-600 border-slate-300 bg-slate-50",
              }
              return (
                <Card key={i} className={hasResponse ? "border-emerald-200" : ""}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className={cn("text-[10px] shrink-0",
                        meta.type === "BUG" ? "border-red-200 text-red-600" :
                        meta.type === "UI" ? "border-amber-200 text-amber-600" :
                        meta.type === "FEATURE" ? "border-emerald-200 text-emerald-600" :
                        "border-blue-200 text-blue-600"
                      )}>{meta.type ?? "REPORT"}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{meta.title ?? "Report"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{meta.description}</p>

                        {/* Status + response from admin */}
                        {meta.status && (
                          <div className="mt-2 rounded-lg border p-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={cn("text-[9px]", statusColors[meta.status] || "")}>
                                {meta.status.replace("_", " ")}
                              </Badge>
                              {meta.rewardAmount > 0 && (
                                <Badge className="text-[9px] bg-violet-500 text-white">
                                  +{meta.rewardAmount} FOUND earned!
                                </Badge>
                              )}
                            </div>
                            {meta.adminResponse && (
                              <p className="text-xs text-emerald-700">{meta.adminResponse}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Responded {meta.respondedAt ? new Date(meta.respondedAt).toLocaleDateString() : ""}
                            </p>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Reward info */}
      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Your feedback earns FOUND tokens!</strong> When we fix a bug or implement a feature you suggested,
            you get rewarded based on the impact: 25 FOUND for minor feedback, 100 for helpful, 250 for significant,
            and 500 FOUND for critical issues. The better your feedback (specific, reproducible, actionable), the
            more valuable it is — and the more you earn. You are helping build the platform for everyone.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
