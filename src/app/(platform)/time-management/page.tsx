"use client"

import { useState } from "react"
import { Clock, ChevronDown, AlertTriangle, Lightbulb, ClipboardList } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const TECHNIQUES = [
  {
    name: "Eisenhower Matrix",
    badge: "Prioritization",
    color: "from-indigo-500 to-blue-600",
    what: "Divide every task into 4 quadrants: Urgent+Important (do now), Important+Not Urgent (schedule), Urgent+Not Important (delegate), Neither (eliminate).",
    how: "Each morning, write your task list. Assign each to a quadrant. Only Quadrant 1 gets today. Quadrant 2 gets a calendar block. Quadrant 3 finds another person. Quadrant 4 gets deleted.",
    when: "When you feel overwhelmed with competing demands and can't figure out what to tackle first.",
    mistake: "Treating everything as urgent. Most 'urgent' tasks are just noisy — they feel urgent but aren't actually important to your goals.",
  },
  {
    name: "Time Blocking",
    badge: "Scheduling",
    color: "from-violet-500 to-purple-600",
    what: "Assign every hour of your workday to a specific task or category. No blank calendar space — intentional use of every hour.",
    how: "At the end of each workday, plan tomorrow in time blocks. Group similar work. Protect deep-work blocks (90–120 min) from meetings. Build in buffer blocks for the unexpected.",
    when: "When you end days feeling busy but unproductive. When reactive work crowds out important work.",
    mistake: "Over-scheduling. Leave 20% of your day as buffer. If every block is full, one disruption cascades into everything.",
  },
  {
    name: "Parkinson's Law",
    badge: "Focus",
    color: "from-amber-500 to-orange-600",
    what: "Work expands to fill the time available for its completion. Give a task 3 hours and it takes 3 hours. Give it 45 minutes and it takes 45 minutes.",
    how: "Set aggressive but achievable deadlines for each task. Use a visible timer. Create artificial constraints: 'I will finish this draft before lunch, no exceptions.'",
    when: "When tasks balloon indefinitely. When you procrastinate by perfecting rather than finishing.",
    mistake: "Setting unrealistic deadlines that create anxiety without productivity. The goal is a tight-but-doable constraint, not panic.",
  },
  {
    name: "Pomodoro Technique",
    badge: "Focus Rhythm",
    color: "from-red-500 to-rose-600",
    what: "Work in 25-minute focused sprints (Pomodoros), then take a 5-minute break. After 4 Pomodoros, take a 20–30 minute break.",
    how: "Pick one task only. Set a timer for 25 min. Work with zero interruptions. When it rings, stop — even mid-sentence. Record completion. Short break. Repeat.",
    when: "For tasks requiring deep focus. When you're prone to distraction. When you need to build momentum on something you've been avoiding.",
    mistake: "Breaking the Pomodoro to 'just check one thing.' The entire value is in the unbroken focus. One check makes it worthless.",
  },
  {
    name: "Batch Processing",
    badge: "Efficiency",
    color: "from-teal-500 to-cyan-600",
    what: "Group similar low-value tasks and do them all at once in a single designated window rather than responding to them throughout the day.",
    how: "Designate two 30-minute email windows (morning and afternoon). Batch all calls. Batch all errands. Batch administrative work. Guard the rest of your day ruthlessly.",
    when: "When interruptions and context-switching are fragmenting your day. Each switch costs 15–20 minutes of recovery time.",
    mistake: "Not enforcing boundaries. If you check email 'just quickly' outside batch windows, you've defeated the system entirely.",
  },
  {
    name: "Elimination",
    badge: "Most Powerful",
    color: "from-green-500 to-emerald-600",
    what: "The most powerful time management technique is simply stopping doing things that don't matter. You can't optimize your way out of doing the wrong things.",
    how: "Audit every recurring commitment: meetings, reports, obligations. Ask 'What happens if I just stop this?' Often: nothing. Then stop. Default to 'no' for new commitments.",
    when: "Always. Before you optimize how you do anything, ask whether you should be doing it at all.",
    mistake: "Optimizing instead of eliminating. Spending time making an unnecessary task more efficient is still wasted time. Kill it first.",
  },
]

const AUDIT_STEPS = [
  "For one full week, track every hour in a simple spreadsheet or notebook — just 3 columns: time, activity, category.",
  "Categories: Deep Work, Shallow Work, Meetings, Email/Messages, Admin, Personal, Wasted/Unknown.",
  "At the end of the week, total each category. The results are almost always shocking.",
  "Ask: what percentage of my hours actually moved my most important goals forward?",
  "Identify the single largest time sink that isn't contributing to your goals. Eliminate or radically reduce it first.",
]

export default function TimeManagementPage() {
  const [openTech, setOpenTech] = useState<number | null>(null)
  const [auditOpen, setAuditOpen] = useState(false)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30">
            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold">Time Management Masterclass</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Time is the only resource that can't be earned back. These 6 techniques — used by the most productive people alive — will help you spend it on what actually matters.
        </p>
      </div>

      <div className="space-y-3">
        {TECHNIQUES.map((t, i) => {
          const open = openTech === i
          return (
            <Card key={i} className={cn("transition-all", open && "ring-2 ring-orange-500/30")}>
              <button
                className="w-full text-left p-4 flex items-center justify-between gap-3"
                onClick={() => setOpenTech(open ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-8 rounded-full bg-gradient-to-b", t.color)} />
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <Badge variant="secondary" className="text-xs mt-0.5">{t.badge}</Badge>
                  </div>
                </div>
                <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
              </button>
              {open && (
                <CardContent className="pt-0 pb-5 px-5 space-y-3 border-t">
                  <div className="grid gap-3 pt-4">
                    {[["What it is", t.what, "text-foreground"], ["How to do it", t.how, "text-blue-700 dark:text-blue-300"], ["When to use it", t.when, "text-muted-foreground"]].map(([label, text, cls]) => (
                      <div key={label as string} className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label as string}</p>
                        <p className={cn("text-sm", cls as string)}>{text as string}</p>
                      </div>
                    ))}
                    <div className="flex gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-0.5">Common Mistake</p>
                        <p className="text-sm text-red-700 dark:text-red-300">{t.mistake}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <Card className={cn("transition-all", auditOpen && "ring-2 ring-green-500/30")}>
        <button
          className="w-full text-left p-4 flex items-center justify-between gap-3"
          onClick={() => setAuditOpen(!auditOpen)}
        >
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold">Your Time Audit</p>
              <p className="text-sm text-muted-foreground">Track where your hours actually go for 1 week</p>
            </div>
          </div>
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform shrink-0", auditOpen && "rotate-180")} />
        </button>
        {auditOpen && (
          <CardContent className="pt-0 pb-5 px-5 border-t">
            <div className="pt-4 space-y-3">
              <div className="flex gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300">Most people overestimate how much time they spend on important work by 2–3x. The audit is the intervention.</p>
              </div>
              <ol className="space-y-2">
                {AUDIT_STEPS.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold text-xs shrink-0 mt-0.5">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="border-t pt-6">
        <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Related on this platform</p>
        <div className="flex flex-wrap gap-2">
          {[["Routine Builder", "/routine"], ["Goals & Vision", "/vision"], ["Screen Time", "/screen-time"], ["Decisions", "/decisions"]].map(([label, href]) => (
            <a key={href} href={href} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
