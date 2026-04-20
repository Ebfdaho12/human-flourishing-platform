"use client"

import { useState } from "react"
import { Heart, ChevronDown, Phone, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STAGES = [
  {
    name: "Denial",
    color: "from-slate-400 to-slate-600",
    honest: "This doesn't feel like a stage — it feels like your nervous system protecting you from a reality too large to absorb at once. Shock. Numbness. 'This can't be real.' It is not lying to yourself. It is surviving.",
    looks: "Going through the motions. Feeling strangely calm. Continuing normal routines because stopping would make it real. Expecting them to walk through the door.",
    note: "Denial is not the same as denial-the-coping-mechanism. It is a temporary buffer. It lifts on its own timeline.",
  },
  {
    name: "Anger",
    color: "from-red-500 to-rose-600",
    honest: "Anger is grief with nowhere to go. It comes out at doctors, at God, at the person who died, at yourself, at the unfairness of existence. It is one of the most misunderstood stages because people think they should not feel it.",
    looks: "Rage at small things. Resentment toward people who still have what you lost. Anger at the deceased for leaving. Self-blame. Irritability that makes no sense to others.",
    note: "Anger needs to move through you — not be suppressed. Exercise, journaling, talking to a therapist, physical labour. Anger unexpressed calcifies into bitterness.",
  },
  {
    name: "Bargaining",
    color: "from-amber-500 to-yellow-600",
    honest: "The mind's attempt to find control in a situation where control was lost. 'If I had just...' 'What if we had done...' 'Maybe if...' It is a form of magical thinking — reaching backward for a lever that no longer exists.",
    looks: "Replaying events obsessively. Guilt about things said or not said. 'What if' thoughts. In anticipatory grief (before death), bargaining with God/fate for more time.",
    note: "Bargaining is not irrational — it is human. It only becomes harmful if it produces sustained guilt that blocks the path forward.",
  },
  {
    name: "Depression",
    color: "from-blue-500 to-indigo-600",
    honest: "This is not pathological depression that needs to be fixed. It is appropriate sadness. The world is dimmer because someone who made it brighter is gone. This is the appropriate response to a real loss.",
    looks: "Withdrawal. Crying without warning. Profound sadness. Loss of interest in things that normally matter. Fatigue. The absence of joy. Wondering what the point is.",
    note: "There is a difference between grief depression and clinical depression. If it does not lift at all over months, or if you cannot function, please speak with a doctor.",
  },
  {
    name: "Acceptance",
    color: "from-emerald-500 to-teal-600",
    honest: "Acceptance does not mean 'okay with it.' It means learning to carry it. The loss becomes integrated into your life rather than standing in front of it. You do not 'get over' a significant loss — you grow around it.",
    looks: "Being able to talk about the person without falling apart. Reinvesting in life. Finding meaning or purpose. Acknowledging that life goes on — without guilt for going on.",
    note: "Acceptance comes and goes. You can be in acceptance on Tuesday and back in anger on Thursday. That is normal. Grief is not a staircase.",
  },
]

const PRACTICAL_STEPS: {
  title: string
  urgency: string
  urgencyColor: string
  items: string[]
}[] = [
  {
    title: "Immediate (days 1-7)",
    urgency: "First",
    urgencyColor: "text-red-500 border-red-300",
    items: [
      "Contact a funeral home — they guide you through the next steps. You do not need to know what to do.",
      "Obtain the death certificate (the funeral home helps with this). You will need multiple certified copies — order at least 10.",
      "Notify immediate family and close friends personally. Everything else can wait.",
      "Do not make major financial decisions in the first week. Nothing is that urgent.",
    ],
  },
  {
    title: "Funeral & Cremation Costs",
    urgency: "Budget",
    urgencyColor: "text-amber-600 border-amber-300",
    items: [
      "Traditional funeral with burial: $8,000-$15,000+ (casket, embalming, viewing, service, burial plot, marker).",
      "Direct cremation: $1,500-$3,500 (no service, ashes returned in a basic container). This is the lowest-cost option.",
      "Cremation with memorial service: $3,000-$7,000 (service held after cremation, no embalming or burial).",
      "Pre-planning your own funeral locks in today's prices and removes the burden from your family. Consider it.",
    ],
  },
  {
    title: "Government Notifications (Canada)",
    urgency: "Within 30 Days",
    urgencyColor: "text-blue-500 border-blue-300",
    items: [
      "Service Canada: notify CPP, OAS, and any GIS payments — overpayments must be returned. Call 1-800-277-9914.",
      "CPP Death Benefit: a one-time payment of up to $2,500 to the estate. Apply using form ISP1200 or online.",
      "CRA: file a final tax return ('terminal return') for the year of death. Due April 30 of the following year (or 6 months after death if it occurs after October 31).",
      "Cancel provincial health card, driver's licence, SIN (do not discard the SIN — needed for the final tax return).",
      "If the deceased had a pension, contact the pension administrator immediately — payments must be stopped and survivor benefits claimed.",
    ],
  },
  {
    title: "Estate & Financial",
    urgency: "Within 60 Days",
    urgencyColor: "text-violet-500 border-violet-300",
    items: [
      "Locate the will (if any). The named executor is responsible for the estate process.",
      "Open an estate bank account to collect incoming funds and pay final expenses.",
      "Do NOT distribute assets until all debts and taxes are settled — the executor can be personally liable.",
      "Probate (court validation of will) is required if the estate has real estate or assets over certain thresholds. A lawyer can advise.",
      "Cancel credit cards, subscriptions, and any automatic payments after debts are settled.",
    ],
  },
]

const CHILDREN = [
  { age: "2-4 years", approach: "Use simple, honest language. 'Grandma died. That means her body stopped working and we won't see her anymore.' Avoid euphemisms like 'went to sleep' (creates fear of sleep) or 'passed away' (confusing). Expect the child to move on quickly — that is normal." },
  { age: "5-8 years", approach: "Children this age often ask very direct questions: 'Is it my fault?' 'Will you die?' 'Where did they go?' Answer honestly and simply. Reassure them about their own safety. Let them attend the funeral if they want to — exclusion creates fear and mystery." },
  { age: "9-12 years", approach: "Children understand the permanence of death. They may not express grief the same way adults do — often through behaviour changes, school performance, or physical complaints. Ask open questions. Do not force them to talk. Let them grieve in their own way." },
  { age: "Teenagers", approach: "Teens often grieve in private or with peers rather than family. They may seem unaffected — they are not. They may also take on too much responsibility to support parents. Make space for their grief without requiring them to perform it." },
]

const RESOURCES = [
  { name: "988 Suicide & Crisis Lifeline", number: "988", detail: "Call or text 988 — also covers crisis grief. Available 24/7 in Canada and the US." },
  { name: "Distress Centres Canada", number: "1-800-456-4566", detail: "Free, 24/7 crisis support and emotional support lines across Canada." },
  { name: "Canadian Virtual Hospice", number: "canadianvirtualhospice.ca", detail: "Free grief resources, counselling referrals, and support for families after loss." },
  { name: "GriefShare", number: "griefshare.org", detail: "Community grief support groups. Find one near you by postal code. Free to attend." },
]

export default function GriefPage() {
  const [expandedStage, setExpandedStage] = useState<number | null>(null)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [expandedChild, setExpandedChild] = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-blue-700">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Grief & Loss</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          What grief actually looks like, practical steps after a death, and resources for when you need support.
        </p>
      </div>

      <Card className="border-2 border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-slate-700 mb-1">"There is no right way to grieve. There is only your way."</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Grief is not a problem to solve. It is not a process to complete. It is not weakness.
            It is what love looks like after the person is gone. The goal is not to stop feeling it —
            the goal is to learn to carry it so you can still live fully. This page will not fix grief.
            It will help you understand it, navigate the practical realities, and know where to find help.
          </p>
        </CardContent>
      </Card>

      {/* Stages */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">The 5 Stages — Honestly Explained</p>
        <p className="text-[10px] text-muted-foreground mb-2">These stages are not linear, not mandatory, and not a checklist. They are a map of what grief can feel like — not what it must.</p>
        <div className="space-y-2">
          {STAGES.map((s, i) => {
            const isOpen = expandedStage === i
            return (
              <Card key={i} className="card-hover cursor-pointer overflow-hidden" onClick={() => setExpandedStage(isOpen ? null : i)}>
                <CardContent className="p-0">
                  <div className="p-3 flex items-center gap-3">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white text-xs font-bold", s.color)}>
                      {i + 1}
                    </div>
                    <p className="text-sm font-semibold flex-1">{s.name}</p>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-1 border-t border-border space-y-2">
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.honest}</p>
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">What it looks like</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.looks}</p>
                      </div>
                      <p className="text-xs text-blue-700 leading-relaxed italic">{s.note}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Practical steps */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Practical Steps After a Death</p>
        <div className="space-y-2">
          {PRACTICAL_STEPS.map((p, i) => {
            const isOpen = expandedStep === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedStep(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{p.title}</p>
                        <Badge variant="outline" className={cn("text-[9px]", p.urgencyColor)}>{p.urgency}</Badge>
                      </div>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <ul className="mt-3 space-y-1.5">
                      {p.items.map((item, j) => (
                        <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                          <span className="text-slate-400 shrink-0">→</span>{item}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Children and grief */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Children & Grief</p>
        <div className="space-y-2">
          {CHILDREN.map((c, i) => {
            const isOpen = expandedChild === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedChild(isOpen ? null : i)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] shrink-0">{c.age}</Badge>
                    <p className="text-xs text-muted-foreground flex-1 line-clamp-1">{c.approach.slice(0, 60)}...</p>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed pl-1">{c.approach}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Crisis resources */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-500" /> Crisis & Grief Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {RESOURCES.map((r, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Phone className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold">{r.name} — <span className="text-blue-600">{r.number}</span></p>
                <p className="text-xs text-muted-foreground">{r.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>One last thing:</strong> grief does not have an expiration date. You do not owe anyone a timeline.
            The anniversary, the empty chair at Christmas, the song on the radio — grief resurfaces. That is not
            regression. That is love making itself known. If you are supporting someone who is grieving, your presence
            matters more than your words. Show up. Listen. Say their name. That is what people remember.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/mental-health" className="text-sm text-blue-600 hover:underline">Mental Health</a>
        <a href="/estate-planning" className="text-sm text-slate-600 hover:underline">Estate Planning</a>
        <a href="/elder-care" className="text-sm text-amber-600 hover:underline">Elder Care</a>
        <a href="/community-resources" className="text-sm text-rose-600 hover:underline">Community Resources</a>
        <a href="/difficult-conversations" className="text-sm text-violet-600 hover:underline">Difficult Conversations</a>
      </div>
    </div>
  )
}
