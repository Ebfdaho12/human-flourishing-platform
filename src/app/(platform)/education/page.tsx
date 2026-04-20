"use client"
import { useState, useCallback, useRef, useEffect } from "react"
import DOMPurify from "isomorphic-dompurify"
import useSWR from "swr"
import {
  GraduationCap, Plus, Send, Sparkles, BookOpen, Target, ChevronRight, Bot, User, Loader2, Flame, Clock, BarChart3, Trophy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "History", "Geography", "Literature", "Philosophy",
  "Computer Science", "Economics", "Psychology", "Astronomy",
  "Music Theory", "Art History", "Language Learning", "Other",
]

const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
]

type Message = { role: "user" | "assistant"; content: string }

function NewGoalDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [level, setLevel] = useState("BEGINNER")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!subject || !topic) return
    setLoading(true)
    await fetch("/api/education/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, topic, level, description: description || null }),
    })
    setLoading(false)
    setOpen(false)
    setSubject("")
    setTopic("")
    setDescription("")
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Target className="h-4 w-4" /> New Goal</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Set Learning Goal</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Topic</Label>
            <Input placeholder="e.g. Calculus derivatives, World War II, Python loops" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>What do you want to learn? (optional)</Label>
            <Textarea
              placeholder="Describe what you're trying to understand or achieve..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !subject || !topic}>
            {loading ? "Saving..." : "Create goal · +25 FOUND"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function QuickStartDialog({ onStart }: { onStart: (subject: string, topic: string, level: string) => void }) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [level, setLevel] = useState("BEGINNER")

  function handleStart() {
    if (!subject || !topic) return
    setOpen(false)
    onStart(subject, topic, level)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Start Tutoring</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Start a Tutoring Session</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>What do you want to learn?</Label>
            <Input placeholder="e.g. How do derivatives work?" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Your level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleStart} disabled={!subject || !topic}>
            Start session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TutorChat({
  subject,
  topic,
  level,
  goalId,
  onClose,
}: {
  subject: string
  topic: string
  level: string
  goalId?: string
  onClose: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Welcome message
  useEffect(() => {
    setMessages([{
      role: "assistant",
      content: `Hello! I'm your Socratic tutor for **${topic}** in ${subject}. I'm here to help you think through concepts rather than just giving you answers.\n\nWhat would you like to explore first? What do you already know about this topic?`,
    }])
  }, [subject, topic])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMessage: Message = { role: "user", content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    const res = await fetch("/api/education/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject, topic, level, goalId,
        messages: newMessages,
        sessionId,
      }),
    })
    const data = await res.json()
    setLoading(false)
    setHasApiKey(data.hasApiKey ?? false)
    if (data.reply) {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
    }
    if (data.sessionId && !sessionId) {
      setSessionId(data.sessionId)
    }
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function renderMessage(content: string) {
    // Convert markdown-style bold and newlines to HTML
    const html = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>")
    // Sanitize with DOMPurify — only allow safe formatting tags
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["strong", "em", "br", "p", "ul", "li", "ol", "code", "pre", "b", "i"],
      ALLOWED_ATTR: [],
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
      {/* Chat header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium">{subject}: {topic}</span>
            <Badge variant="outline" className="text-xs">{level.toLowerCase()}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
          End session
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4">
        {hasApiKey === false && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-300">
            <Sparkles className="h-4 w-4 inline mr-1.5" />
            AI tutoring requires an Anthropic API key. Add one to <code className="bg-black/20 px-1 rounded">.env.local</code> to enable.
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            <div className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
              msg.role === "user" ? "bg-violet-500/20 text-violet-400" : "bg-blue-500/20 text-blue-400"
            )}>
              {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-violet-500/20 text-foreground rounded-tr-sm"
                : "bg-muted text-foreground rounded-tl-sm"
            )}
              dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
            />
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-border/50">
        <Input
          ref={inputRef}
          placeholder="Ask a question or share your thinking..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="flex-1"
          autoFocus
        />
        <Button size="icon" onClick={sendMessage} disabled={!input.trim() || loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ProgressPanel() {
  const { data } = useSWR("/api/education/progress", fetcher)

  if (!data) return <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">Loading progress...</CardContent></Card>

  const { streak, totalSessions, totalMinutes, activeGoals, completedGoals, subjects, weeklyActivity } = data

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <Flame className={cn("h-5 w-5 mx-auto mb-1", streak > 0 ? "text-orange-500" : "text-muted-foreground/30")} />
          <p className="text-2xl font-bold text-orange-500">{streak}</p>
          <p className="text-xs text-muted-foreground">Day streak</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <BookOpen className="h-5 w-5 mx-auto mb-1 text-blue-500" />
          <p className="text-2xl font-bold text-blue-500">{totalSessions}</p>
          <p className="text-xs text-muted-foreground">Total sessions</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Clock className="h-5 w-5 mx-auto mb-1 text-violet-500" />
          <p className="text-2xl font-bold text-violet-500">{totalMinutes}</p>
          <p className="text-xs text-muted-foreground">Minutes learned</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Trophy className="h-5 w-5 mx-auto mb-1 text-amber-500" />
          <p className="text-2xl font-bold text-amber-500">{completedGoals}</p>
          <p className="text-xs text-muted-foreground">Goals completed</p>
        </CardContent></Card>
      </div>

      {/* Weekly activity */}
      {weeklyActivity && weeklyActivity.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Weekly Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weeklyActivity.map((w: any) => (
                <div key={w.week} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">{w.week}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (w.sessions / Math.max(1, ...weeklyActivity.map((x: any) => x.sessions))) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 w-20 text-right">
                    {w.sessions} sessions
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject mastery */}
      {subjects && subjects.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Subject Mastery</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjects.map((s: any) => (
                <div key={s.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{s.name}</p>
                      <span className="text-xs text-muted-foreground">{s.topicCount} topics</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{s.sessions} sessions</span>
                      <span>{s.totalMinutes} min</span>
                      {s.avgScore !== null && (
                        <Badge variant="outline" className={cn("text-xs", s.avgScore >= 80 ? "border-emerald-300 text-emerald-600" : s.avgScore >= 60 ? "border-blue-300 text-blue-600" : "border-amber-300 text-amber-600")}>
                          {s.avgScore}/100
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", s.avgScore !== null && s.avgScore >= 80 ? "bg-emerald-500" : s.avgScore !== null && s.avgScore >= 60 ? "bg-blue-500" : "bg-amber-500")}
                      style={{ width: `${s.avgScore ?? Math.min(100, s.sessions * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {totalSessions === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No learning data yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Complete tutoring sessions to see your progress here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function EducationPage() {
  const { data: goalsData, mutate: mutateGoals } = useSWR("/api/education/goals", fetcher)
  const { data: sessionsData } = useSWR("/api/education/tutor?limit=10", fetcher)

  const [activeSession, setActiveSession] = useState<{
    subject: string; topic: string; level: string; goalId?: string
  } | null>(null)

  const goals: any[] = goalsData?.goals ?? []
  const sessions: any[] = sessionsData?.sessions ?? []
  const hasApiKey: boolean = sessionsData?.hasApiKey ?? false

  const activeGoals = goals.filter((g) => g.isActive)

  function startFromGoal(goal: any) {
    setActiveSession({ subject: goal.subject, topic: goal.topic, level: goal.level, goalId: goal.id })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Education Intelligence</h1>
          </div>
          <p className="text-sm text-muted-foreground">Learning that meets you where you are.</p>
        </div>
        {!activeSession && (
          <div className="flex gap-2">
            <NewGoalDialog onSaved={() => mutateGoals()} />
            <QuickStartDialog onStart={(s, t, l) => setActiveSession({ subject: s, topic: t, level: l })} />
          </div>
        )}
      </div>

      {/* Active tutor session */}
      {activeSession ? (
        <Card>
          <CardContent className="p-4">
            <TutorChat
              subject={activeSession.subject}
              topic={activeSession.topic}
              level={activeSession.level}
              goalId={activeSession.goalId}
              onClose={() => {
                setActiveSession(null)
                mutateGoals()
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="tutor">
          <TabsList>
            <TabsTrigger value="tutor">AI Tutor</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* ── Tutor tab ── */}
          <TabsContent value="tutor" className="mt-4 space-y-4">
            {!hasApiKey && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-300">AI tutor not yet enabled</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add your Anthropic API key to enable Socratic tutoring across any subject.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-400" />
                  Start a New Session
                </CardTitle>
                <CardDescription>
                  Your AI tutor uses the Socratic method — asking questions to help you discover answers, not just giving them.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuickStartDialog onStart={(s, t, l) => setActiveSession({ subject: s, topic: t, level: l })} />
              </CardContent>
            </Card>

            {/* Start from goals */}
            {activeGoals.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Or continue a learning goal:</p>
                <div className="space-y-2">
                  {activeGoals.map((goal: any) => (
                    <button
                      key={goal.id}
                      onClick={() => startFromGoal(goal)}
                      className="w-full flex items-center justify-between rounded-lg border border-border/50 bg-card/40 hover:bg-card/80 px-4 py-3 text-left transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{goal.subject}</p>
                        <p className="text-xs text-muted-foreground">{goal.topic} · {goal.level.toLowerCase()}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Progress ── */}
          <TabsContent value="progress" className="mt-4">
            <ProgressPanel />
          </TabsContent>

          {/* ── Goals ── */}
          <TabsContent value="goals" className="mt-4 space-y-3">
            {goals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No learning goals yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Set a goal to earn 25 FOUND and track your progress.</p>
                </CardContent>
              </Card>
            ) : (
              goals.map((goal: any) => (
                <Card key={goal.id} className={cn(!goal.isActive && "opacity-60")}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{goal.subject}</p>
                          <Badge variant="outline" className="text-xs">{goal.level.toLowerCase()}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{goal.topic}</p>
                        {goal.description && <p className="text-xs text-muted-foreground/70 mt-1">{goal.description}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {goal.sessions?.length > 0
                            ? `Last session: ${new Date(goal.sessions[0].createdAt).toLocaleDateString()}`
                            : "No sessions yet"}
                        </p>
                      </div>
                      {goal.isActive && (
                        <Button variant="outline" size="sm" onClick={() => startFromGoal(goal)}>
                          <Bot className="h-3.5 w-3.5" /> Tutor
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ── History ── */}
          <TabsContent value="history" className="mt-4 space-y-3">
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No sessions yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Your tutoring history will appear here. Each session earns 10 FOUND.</p>
                </CardContent>
              </Card>
            ) : (
              sessions.map((s: any) => (
                <Card key={s.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{s.subject}</p>
                          <Badge variant="outline" className="text-xs">{s.level?.toLowerCase()}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{s.topic}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(s.createdAt).toLocaleDateString(undefined, {
                            weekday: "short", month: "short", day: "numeric",
                          })}
                          {s.durationS > 0 && ` · ${Math.round(s.durationS / 60)} min`}
                        </p>
                      </div>
                      {s.score !== null && (
                        <Badge className="text-sm">{s.score}/100</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
