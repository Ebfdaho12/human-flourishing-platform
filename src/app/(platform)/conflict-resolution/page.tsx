"use client"

import { useState } from "react"
import { Users, ChevronDown, MessageCircle, Shield, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    number: "1",
    label: "Pause",
    color: "from-blue-500 to-indigo-600",
    what: "Stop before reacting. The first words spoken in anger are rarely the right ones.",
    how: "Take 3 slow breaths. Count to 10. If needed, say 'I need a moment before I respond.' A 10-second pause is not weakness — it is the difference between a productive conversation and an escalated one.",
    why: "When you are emotionally activated, your prefrontal cortex (rational decision-making) goes offline and your amygdala (threat response) takes over. Pausing lets your brain return to thinking mode. You cannot have a rational conversation in fight-or-flight.",
  },
  {
    number: "2",
    label: "Understand Their Perspective",
    color: "from-violet-500 to-purple-600",
    what: "Before stating your position, make sure you genuinely understand theirs.",
    how: "Ask questions: 'Help me understand what you were thinking.' 'What about this situation bothers you most?' Summarize back: 'So what I hear you saying is...' Do not interrupt. Do not prepare your rebuttal while they are talking. Just listen.",
    why: "Most conflicts persist because each person feels unheard. When someone genuinely feels understood, their defensiveness drops — and they become capable of hearing you. Understanding their view does not mean agreeing with it.",
  },
  {
    number: "3",
    label: "Express Your Need (I Statements)",
    color: "from-emerald-500 to-teal-600",
    what: "State what you feel and what you need — without blame.",
    how: "Formula: 'I feel [emotion] when [specific behaviour] because [impact on me]. What I need is [clear request].' Example: 'I feel dismissed when decisions are made without my input, because it makes me feel like my perspective doesn't matter. What I need is to be consulted before changes are made.' Avoid: 'You always...' 'You never...' 'You made me feel...'",
    why: "'You' statements trigger defensiveness immediately. 'I' statements describe your experience — which cannot be argued with — and open space for the other person to respond with empathy rather than a counter-attack.",
  },
  {
    number: "4",
    label: "Find Common Ground",
    color: "from-amber-500 to-orange-600",
    what: "Identify what you both agree on or both want.",
    how: "Ask: 'What outcome would work for both of us?' 'What do we both care about here?' Even in a difficult conflict, there is usually shared ground: both want respect, both want the relationship to work, both want the situation resolved. Start there.",
    why: "Conflicts feel irresolvable when people focus on positions ('I want X') rather than interests ('I need Y'). Underlying interests almost always overlap. Identifying them turns a fight into a problem to solve together.",
  },
  {
    number: "5",
    label: "Agree on Next Steps",
    color: "from-rose-500 to-pink-600",
    what: "End with a specific, concrete agreement — not a vague 'we'll do better.'",
    how: "Name what will change, who will do it, and by when. Write it down if needed. 'Going forward, we will discuss major purchases over $500 before making them' is actionable. 'We'll communicate better' is not. Check in on the agreement in one week.",
    why: "Conversations without commitments produce temporary relief but not lasting change. A clear agreement creates accountability and gives both people something concrete to point to if the same issue arises again.",
  },
]

const TYPES: {
  type: string
  color: string
  context: string
  approach: string
  watch: string
}[] = [
  {
    type: "Family",
    color: "bg-rose-100 text-rose-700 border-rose-300",
    context: "Involves deep history, unspoken expectations, and roles that have been established for decades. Old wounds resurface easily.",
    approach: "Choose a calm time — not mid-argument, not at dinner, not when tired. State what you want the relationship to look like, not just what went wrong. Be willing to hear things about your own behaviour you may not want to hear.",
    watch: "Triangulation (involving others to take sides), silent treatment used as punishment, bringing up unrelated past grievances. These escalate and do not resolve.",
  },
  {
    type: "Workplace",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    context: "Power dynamics matter. A conflict with your manager is structurally different from a conflict with a peer.",
    approach: "Focus on the work impact, not the personal grievance. 'When X happens, the project is affected in Y way' is heard better than 'When you do X, it makes me feel Y.' Request a private meeting. Document important agreements in writing (follow-up email after conversation).",
    watch: "Going to HR before attempting direct resolution (unless it involves harassment or discrimination). It permanently changes the relationship and is often perceived as escalation.",
  },
  {
    type: "Neighbour",
    color: "bg-amber-100 text-amber-700 border-amber-300",
    context: "You will live near this person for years. The goal is a workable long-term relationship — not winning.",
    approach: "Approach in person, politely, on a calm day — not immediately after the incident when you are frustrated. Give them the benefit of the doubt: assume they didn't realize it was a problem. Most neighbour conflicts are about assumptions, not malice.",
    watch: "Skipping the direct conversation and going straight to bylaw officers, landlords, or legal threats. This poisons the relationship permanently for issues that a 5-minute conversation would have resolved.",
  },
  {
    type: "Online",
    color: "bg-slate-100 text-slate-700 border-slate-300",
    context: "The internet removes tone of voice, facial expression, and social inhibition. People say things online they would never say in person.",
    approach: "Ask yourself: does this need to be resolved, or can it be disengaged from? Most online conflicts have no stakes and no resolution path. For genuine misunderstandings, move to a direct message or — better — a phone call.",
    watch: "Public comment threads. You are not going to change minds in a Twitter reply. You will only harden positions and attract spectators. If you must respond publicly, respond once — calmly — then disengage.",
  },
]

const DEESCALATION = [
  { technique: "Lower your voice", detail: "Volume is interpreted as aggression. Speaking quietly forces the other person to calm down to hear you — and signals that you are not in attack mode." },
  { technique: "Ask questions instead of making statements", detail: "'What did you mean when you said that?' advances the conversation. 'You clearly think...' triggers defensiveness. Questions create information; statements create positions." },
  { technique: "Find one thing to agree with", detail: "'You're right that this situation has been frustrating for both of us.' Agreement on even a small point reduces the binary win/lose framing and opens space for nuance." },
  { technique: "Take breaks intentionally", detail: "If a conversation is going in circles or someone is getting louder, say: 'I want to keep talking about this — can we take 20 minutes and come back?' This is not avoidance. It is management." },
  { technique: "Name what is happening", detail: "'I notice we're both getting frustrated. I don't want to say something I'll regret — can we slow down?' Meta-communication (talking about the conversation) often defuses what content alone cannot." },
]

export default function ConflictResolutionPage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(0)
  const [expandedType, setExpandedType] = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Conflict Resolution</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          A practical framework for navigating difficult conversations — in families, workplaces, and relationships.
        </p>
      </div>

      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-violet-900 mb-1">"The goal is not to win — it is to solve."</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every unresolved conflict costs something: energy, trust, sleep, relationships, or opportunities.
            The people who handle conflict well do not avoid it — they move through it with skill. These skills
            are learnable. They require practice. They are worth more than almost anything else in adult life.
          </p>
        </CardContent>
      </Card>

      {/* 5-Step Framework */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">The 5-Step Framework</p>
        <div className="space-y-2">
          {STEPS.map((s, i) => {
            const isOpen = expandedStep === i
            return (
              <Card key={i} className="card-hover cursor-pointer overflow-hidden" onClick={() => setExpandedStep(isOpen ? null : i)}>
                <CardContent className="p-0">
                  <div className="p-3 flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white text-sm font-bold", s.color)}>
                      {s.number}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">{s.what}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-1 border-t border-border space-y-2">
                      <div>
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">How</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.how}</p>
                      </div>
                      <div className="rounded-lg bg-violet-50 border border-violet-200 p-2.5">
                        <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider mb-0.5">Why it works</p>
                        <p className="text-xs text-violet-700 leading-relaxed">{s.why}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Conflict types */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">By Conflict Type</p>
        <div className="space-y-2">
          {TYPES.map((t, i) => {
            const isOpen = expandedType === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedType(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Badge className={cn("text-xs border font-semibold", t.color)}>{t.type}</Badge>
                    <p className="text-xs text-muted-foreground flex-1 line-clamp-1">{t.context}</p>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground leading-relaxed"><strong>Context: </strong>{t.context}</p>
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                        <p className="text-xs text-emerald-700 leading-relaxed"><strong>Approach: </strong>{t.approach}</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                        <p className="text-xs text-amber-800 leading-relaxed"><strong>Watch out for: </strong>{t.watch}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* De-escalation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" /> De-escalation Techniques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DEESCALATION.map((d, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-blue-400 font-bold text-xs shrink-0 pt-0.5">{i + 1}.</span>
              <div>
                <p className="text-xs font-semibold">{d.technique}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{d.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Walk away vs push through */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-red-200 bg-red-50/20">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-red-600 mb-2">Walk Away When:</p>
            <ul className="space-y-1">
              {["The conversation has become verbally abusive", "You or they are too activated to think clearly", "The same argument is going in circles with no new information", "Safety is a concern"].map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5"><span className="text-red-400 shrink-0">→</span>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-emerald-600 mb-2">Push Through When:</p>
            <ul className="space-y-1">
              {["It is hard but not abusive — discomfort is not danger", "The relationship matters and avoidance is eroding it", "The issue will keep recurring if not resolved", "Both people are willing to stay engaged"].map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5"><span className="text-emerald-400 shrink-0">→</span>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <a href="/difficult-conversations" className="text-sm text-violet-600 hover:underline">Difficult Conversations</a>
        <a href="/relationships" className="text-sm text-rose-600 hover:underline">Relationships</a>
        <a href="/mental-health" className="text-sm text-blue-600 hover:underline">Mental Health</a>
        <a href="/parenting" className="text-sm text-amber-600 hover:underline">Parenting</a>
      </div>
    </div>
  )
}
