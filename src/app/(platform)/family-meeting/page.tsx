"use client"

import { useState, useEffect } from "react"
import { Users, CheckCircle, Clock, Heart, DollarSign, Calendar, Star, MessageCircle, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface MeetingLog {
  id: string
  date: string
  budgetNotes: string
  scheduleNotes: string
  kidsWins: string
  relationshipCheck: string
  oneImprovement: string
  gratitude: string
  completed: boolean
}

const AGENDA_SECTIONS = [
  {
    key: "budgetNotes",
    title: "Budget Check-In",
    icon: DollarSign,
    color: "text-emerald-600 bg-emerald-100",
    time: "5 min",
    prompts: [
      "How are we tracking against our budget this week?",
      "Any unexpected expenses?",
      "Are we on track for our savings goal?",
      "Anything we can cut or reduce?",
    ],
  },
  {
    key: "scheduleNotes",
    title: "Upcoming Week",
    icon: Calendar,
    color: "text-blue-600 bg-blue-100",
    time: "5 min",
    prompts: [
      "What does next week look like?",
      "Any appointments, deadlines, or events?",
      "Who is handling pickup/dropoff?",
      "Meal plan for the week?",
    ],
  },
  {
    key: "kidsWins",
    title: "Kids' Wins & Updates",
    icon: Star,
    color: "text-amber-600 bg-amber-100",
    time: "5 min",
    prompts: [
      "What did the kids do well this week?",
      "Any concerns at school or socially?",
      "What are they excited about?",
      "How can we support them better?",
    ],
  },
  {
    key: "relationshipCheck",
    title: "Relationship Check",
    icon: Heart,
    color: "text-rose-600 bg-rose-100",
    time: "5 min",
    prompts: [
      "How are WE doing? Not the household — us.",
      "Is there anything unsaid that needs to be said?",
      "What did your partner do this week that you appreciated?",
      "When is our next date night or quality time?",
    ],
  },
  {
    key: "oneImprovement",
    title: "One Thing to Improve",
    icon: MessageCircle,
    color: "text-violet-600 bg-violet-100",
    time: "5 min",
    prompts: [
      "What is ONE thing we could do better next week?",
      "Not five things — one. Focus creates change.",
      "Last week's improvement — did we follow through?",
    ],
  },
  {
    key: "gratitude",
    title: "Gratitude & Close",
    icon: Heart,
    color: "text-emerald-600 bg-emerald-100",
    time: "5 min",
    prompts: [
      "One thing you are grateful for about this family.",
      "End on a high note. This is the moment that sets the tone for the week.",
    ],
  },
]

export default function FamilyMeetingPage() {
  const [logs, setLogs] = useState<MeetingLog[]>([])
  const [currentMeeting, setCurrentMeeting] = useState<Partial<MeetingLog>>({})
  const [activeSection, setActiveSection] = useState(0)
  const [mode, setMode] = useState<"agenda" | "history">("agenda")

  useEffect(() => {
    const stored = localStorage.getItem("hfp-family-meetings")
    if (stored) setLogs(JSON.parse(stored))
  }, [])

  function save(updated: MeetingLog[]) {
    setLogs(updated)
    localStorage.setItem("hfp-family-meetings", JSON.stringify(updated))
  }

  function updateField(key: string, value: string) {
    setCurrentMeeting(prev => ({ ...prev, [key]: value }))
  }

  function completeMeeting() {
    const log: MeetingLog = {
      id: Date.now().toString(36),
      date: new Date().toISOString(),
      budgetNotes: currentMeeting.budgetNotes || "",
      scheduleNotes: currentMeeting.scheduleNotes || "",
      kidsWins: currentMeeting.kidsWins || "",
      relationshipCheck: currentMeeting.relationshipCheck || "",
      oneImprovement: currentMeeting.oneImprovement || "",
      gratitude: currentMeeting.gratitude || "",
      completed: true,
    }
    save([log, ...logs])
    setCurrentMeeting({})
    setActiveSection(0)
  }

  const streak = logs.filter(l => {
    const d = new Date(l.date)
    const now = new Date()
    const weeksAgo = Math.floor((now.getTime() - d.getTime()) / (7 * 24 * 60 * 60 * 1000))
    return weeksAgo < logs.length
  }).length

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Weekly Family Meeting</h1>
        </div>
        <p className="text-sm text-muted-foreground">30 minutes. 6 topics. The single most powerful habit for a strong family.</p>
      </div>

      {/* Stats */}
      {logs.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-violet-600">{logs.length}</p>
            <p className="text-xs text-muted-foreground">Meetings held</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{streak}</p>
            <p className="text-xs text-muted-foreground">Week streak</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">30</p>
            <p className="text-xs text-muted-foreground">Minutes/week</p>
          </CardContent></Card>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setMode("agenda")}
          className={cn("px-3 py-2 text-sm font-medium border-b-2 -mb-px",
            mode === "agenda" ? "border-violet-500 text-violet-700" : "border-transparent text-muted-foreground"
          )}>This Week's Meeting</button>
        <button onClick={() => setMode("history")}
          className={cn("px-3 py-2 text-sm font-medium border-b-2 -mb-px",
            mode === "history" ? "border-violet-500 text-violet-700" : "border-transparent text-muted-foreground"
          )}>History ({logs.length})</button>
      </div>

      {mode === "agenda" ? (
        <div className="space-y-3">
          {/* Progress */}
          <div className="flex gap-1">
            {AGENDA_SECTIONS.map((_, i) => (
              <div key={i} className={cn("h-1.5 flex-1 rounded-full",
                i < activeSection ? "bg-emerald-400" : i === activeSection ? "bg-violet-400" : "bg-muted"
              )} />
            ))}
          </div>

          {/* Active section */}
          {AGENDA_SECTIONS.map((section, i) => {
            const Icon = section.icon
            const isActive = i === activeSection
            const isDone = i < activeSection
            return (
              <Card key={section.key} className={cn("transition-all",
                isActive ? "border-2 border-violet-300 shadow-sm" : isDone ? "opacity-60" : "opacity-40"
              )}>
                <div className="cursor-pointer" onClick={() => setActiveSection(i)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", section.color)}>
                      {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{section.title}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> {section.time}
                      </p>
                    </div>
                    {isActive && <Badge variant="outline" className="text-[9px] text-violet-600 border-violet-300">Current</Badge>}
                  </CardContent>
                </div>
                {isActive && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="rounded-lg bg-violet-50/50 p-3">
                      <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider mb-1">Discussion prompts</p>
                      <ul className="space-y-1">
                        {section.prompts.map((p, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-violet-400">-</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Textarea
                      value={(currentMeeting as any)[section.key] || ""}
                      onChange={e => updateField(section.key, e.target.value)}
                      placeholder="Notes from this discussion..."
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      {i > 0 && <Button variant="ghost" size="sm" onClick={() => setActiveSection(i - 1)}>← Back</Button>}
                      {i < AGENDA_SECTIONS.length - 1 ? (
                        <Button size="sm" onClick={() => setActiveSection(i + 1)} className="ml-auto">Next →</Button>
                      ) : (
                        <Button size="sm" onClick={completeMeeting} className="ml-auto bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle className="h-4 w-4" /> Complete Meeting
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        /* History */
        <div className="space-y-3">
          {logs.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">No meetings yet. Start your first one above.</p>
            </CardContent></Card>
          ) : logs.map(log => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{new Date(log.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {log.budgetNotes && <p><strong>Budget:</strong> {log.budgetNotes}</p>}
                  {log.kidsWins && <p><strong>Kids:</strong> {log.kidsWins}</p>}
                  {log.relationshipCheck && <p><strong>Relationship:</strong> {log.relationshipCheck}</p>}
                  {log.oneImprovement && <p><strong>Improve:</strong> {log.oneImprovement}</p>}
                  {log.gratitude && <p><strong>Grateful for:</strong> {log.gratitude}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why weekly family meetings?</strong> Research from the University of Georgia found that families who hold
            regular structured meetings report 40% better communication, 30% fewer financial disagreements, and
            significantly stronger parent-child relationships. The key is consistency — same day, same time, every week.
            30 minutes. No phones. Everyone participates. The meeting is not about perfection — it is about showing up.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/relationships" className="text-sm text-rose-600 hover:underline">Relationships</a>
        <a href="/budget" className="text-sm text-emerald-600 hover:underline">Budget Calculator</a>
        <a href="/planner" className="text-sm text-blue-600 hover:underline">Daily Planner</a>
      </div>
    </div>
  )
}
