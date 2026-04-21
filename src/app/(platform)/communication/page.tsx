"use client"

import { useState } from "react"
import { Users, MessageCircle, Heart, Shield, AlertTriangle, Wrench, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

const NVC_STEPS = [
  { step: "Observation", desc: "State facts without evaluation. What you literally saw or heard — no interpretation, no judgment.", wrong: "You never help around the house", right: "When I see dishes in the sink after dinner" },
  { step: "Feeling", desc: "Name the emotion YOU feel. Not 'I feel that you...' — that is a thought disguised as a feeling.", wrong: "I feel like you don't care", right: "I feel overwhelmed" },
  { step: "Need", desc: "Identify the universal human need behind the feeling. Needs are never about a specific person doing a specific thing.", wrong: "I need you to do the dishes", right: "I need shared responsibility" },
  { step: "Request", desc: "Make a concrete, positive, doable request. Not a demand — the other person can say no.", wrong: "You have to start cleaning up", right: "Would you be willing to take turns with dishes?" },
]

const ATTACHMENT_STYLES = [
  { style: "Secure", pct: "50-60%", color: "text-emerald-600", desc: "Comfortable with intimacy and independence. Can communicate needs directly. Not threatened by partner's autonomy." },
  { style: "Anxious", pct: "~20%", color: "text-amber-600", desc: "Fear of abandonment, need constant reassurance, hypervigilant to signs of withdrawal. Protest behaviors (calling repeatedly, testing partner)." },
  { style: "Avoidant", pct: "~25%", color: "text-blue-600", desc: "Uncomfortable with closeness, value independence above all. Deactivating strategies: suppress feelings, focus on partner's flaws, keep emotional distance." },
  { style: "Disorganized", pct: "~5%", color: "text-rose-600", desc: "Combination of anxious + avoidant, often from childhood trauma. Want closeness but fear it. Most challenging pattern to navigate." },
]

const FOUR_HORSEMEN = [
  { name: "Criticism", desc: "Attacking character, not behavior. 'You always...' 'You never...'", antidote: "Use 'I' statements. Complain about the behavior, not the person.", color: "text-red-600" },
  { name: "Contempt", desc: "Superiority, mockery, eye-rolling, sarcasm. The single strongest predictor of divorce.", antidote: "Build a culture of appreciation. Express gratitude daily. Remember what you admire about them.", color: "text-red-700" },
  { name: "Defensiveness", desc: "Deflecting responsibility. 'It's not my fault.' 'Yeah but YOU...'", antidote: "Take some responsibility, even small. 'You're right, I could have handled that better.'", color: "text-orange-600" },
  { name: "Stonewalling", desc: "Withdrawing, shutting down, going silent. Often happens when flooded (heart rate >100 BPM).", antidote: "Physiological self-soothing. Say: 'I need 20 minutes to calm down, then I want to continue this conversation.'", color: "text-amber-700" },
]

const ACTIVE_LISTENING = [
  "Full attention — put phone down, face them, make eye contact",
  "Reflect back: 'What I'm hearing is...' or 'It sounds like...'",
  "Ask clarifying questions, not leading questions ('Tell me more' not 'Don't you think...')",
  "Do not interrupt. Do not prepare your response while they are talking.",
  "Validate emotion BEFORE solving: 'That sounds really frustrating' before 'Have you tried...'",
]

export default function CommunicationPage() {
  const [expanded, setExpanded] = useState<string | null>("nvc")

  const toggle = (key: string) => setExpanded(expanded === key ? null : key)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Relationship Communication Toolkit</h1>
        </div>
        <p className="text-sm text-muted-foreground italic">
          "The #1 predictor of life satisfaction is relationship quality. The #1 predictor of relationship quality is communication." — Harvard Study of Adult Development (1938-present, 80+ years)
        </p>
      </div>

      {/* NVC */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("nvc")} className="flex items-center gap-2 w-full text-left">
            <Heart className="h-4 w-4 text-rose-500" />
            <CardTitle className="text-sm flex-1">Nonviolent Communication (NVC) — Marshall Rosenberg</CardTitle>
            <Badge variant="outline" className="text-[8px] border-rose-300 text-rose-700 mr-2">Foundation</Badge>
            {expanded === "nvc" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "nvc" && (
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="rounded-lg border border-rose-200 bg-rose-50/30 p-3">
              <p className="text-[10px] font-semibold text-rose-800 mb-1">The Template</p>
              <p className="text-xs text-muted-foreground italic">"When I see/hear <strong>[observation]</strong>, I feel <strong>[emotion]</strong> because I need <strong>[need]</strong>. Would you be willing to <strong>[request]</strong>?"</p>
            </div>
            {NVC_STEPS.map((s, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold text-rose-600 bg-rose-100 rounded-full h-4 w-4 flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="text-xs font-semibold">{s.step}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1.5">{s.desc}</p>
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <p className="text-red-600"><strong>Instead of:</strong> "{s.wrong}"</p>
                  <p className="text-emerald-600"><strong>Try:</strong> "{s.right}"</p>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground"><strong>Common mistake:</strong> "I feel <em>that</em> you..." — the word "that" signals a thought, not a feeling. "I feel ignored" is a feeling. "I feel that you don't care" is a judgment.</p>
          </CardContent>
        )}
      </Card>

      {/* Attachment Styles */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("attachment")} className="flex items-center gap-2 w-full text-left">
            <Shield className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-sm flex-1">Attachment Styles — Levine & Heller</CardTitle>
            <Badge variant="outline" className="text-[8px] border-blue-300 text-blue-700 mr-2">Self-Awareness</Badge>
            {expanded === "attachment" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "attachment" && (
          <CardContent className="p-4 pt-0 space-y-2">
            {ATTACHMENT_STYLES.map((a, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-semibold", a.color)}>{a.style}</span>
                  <Badge variant="outline" className="text-[8px]">{a.pct}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{a.desc}</p>
              </div>
            ))}
            <div className="rounded-lg border border-amber-200 bg-amber-50/30 p-2.5">
              <p className="text-[10px] text-muted-foreground"><strong className="text-amber-800">The anxious-avoidant trap:</strong> The most toxic combination. Anxious partner pursues, avoidant partner withdraws, which increases pursuit, which increases withdrawal. A self-reinforcing spiral.</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-2.5">
              <p className="text-[10px] text-muted-foreground"><strong className="text-emerald-800">"Earned secure":</strong> You can change your attachment style through awareness, therapy, and secure relationships. Secure + anything tends to work well — the secure partner models healthy communication.</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Active Listening */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("listening")} className="flex items-center gap-2 w-full text-left">
            <MessageCircle className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-sm flex-1">Active Listening — Carl Rogers</CardTitle>
            <Badge variant="outline" className="text-[8px] border-emerald-300 text-emerald-700 mr-2">Skill</Badge>
            {expanded === "listening" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "listening" && (
          <CardContent className="p-4 pt-0 space-y-2">
            {ACTIVE_LISTENING.map((item, i) => (
              <div key={i} className="rounded-lg border p-2.5 flex items-start gap-2">
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 rounded-full h-4 w-4 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-[10px] text-muted-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Four Horsemen */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("horsemen")} className="flex items-center gap-2 w-full text-left">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <CardTitle className="text-sm flex-1">Gottman's Four Horsemen</CardTitle>
            <Badge variant="outline" className="text-[8px] border-red-300 text-red-700 mr-2">Warning Signs</Badge>
            {expanded === "horsemen" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "horsemen" && (
          <CardContent className="p-4 pt-0 space-y-2">
            <p className="text-[10px] text-muted-foreground mb-1">Gottman can predict divorce with 93% accuracy by watching for these four patterns:</p>
            {FOUR_HORSEMEN.map((h, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-semibold", h.color)}>{i + 1}. {h.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1">{h.desc}</p>
                <p className="text-[10px] text-emerald-700"><strong>Antidote:</strong> {h.antidote}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Repair Attempts */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("repair")} className="flex items-center gap-2 w-full text-left">
            <Wrench className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-sm flex-1">Repair Attempts</CardTitle>
            <Badge variant="outline" className="text-[8px] border-violet-300 text-violet-700 mr-2">Key Finding</Badge>
            {expanded === "repair" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "repair" && (
          <CardContent className="p-4 pt-0 space-y-2">
            <p className="text-[10px] text-muted-foreground">Gottman found the <strong>#1 predictor of relationship success</strong> is not the absence of conflict but the ability to <Explain tip="A repair attempt is any statement or action that prevents negativity from escalating out of control. It is the secret weapon of emotionally intelligent couples.">repair</Explain> after conflict. Successful couples make and accept repair attempts.</p>
            <div className="grid grid-cols-2 gap-2">
              {["'I'm sorry — I overreacted'", "Using humor to break tension", "Physical touch (hand on arm, hug)", "'Can we start over?'", "'I see your point'", "'Let's take a break and come back to this'"].map((r, i) => (
                <div key={i} className="rounded-lg border p-2 text-[10px] text-muted-foreground">{r}</div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Difficult Conversations */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("difficult")} className="flex items-center gap-2 w-full text-left">
            <MessageCircle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm flex-1">Difficult Conversations Framework</CardTitle>
            <Badge variant="outline" className="text-[8px] border-amber-300 text-amber-700 mr-2">Advanced</Badge>
            {expanded === "difficult" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "difficult" && (
          <CardContent className="p-4 pt-0 space-y-2">
            <p className="text-[10px] text-muted-foreground mb-1">Every difficult conversation has three layers:</p>
            {[
              { q: "What happened?", desc: "Separate intention from impact. They may not have meant to hurt you. You may not have meant to hurt them. Impact matters regardless of intent." },
              { q: "How do I feel?", desc: "Identify your emotions before speaking. Unprocessed emotions leak out as blame, sarcasm, or withdrawal." },
              { q: "What does this mean about me?", desc: "The identity threat. Am I competent? Am I a good person? Am I worthy of love? This is often the real source of defensiveness." },
            ].map((l, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <span className="text-xs font-semibold text-amber-700">{i + 1}. {l.q}</span>
                <p className="text-[10px] text-muted-foreground mt-1">{l.desc}</p>
              </div>
            ))}
            <div className="rounded-lg border border-amber-200 bg-amber-50/30 p-3">
              <p className="text-[10px] font-semibold text-amber-800 mb-1">Opening Template</p>
              <p className="text-[10px] text-muted-foreground italic">"I want to talk about <strong>[topic]</strong>. My intention is <strong>[positive intent]</strong>. What I experienced was <strong>[impact]</strong>. What was happening for you?"</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Connections */}
      <Card className="border-rose-200 bg-rose-50/20">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-rose-900 mb-2">Connected Systems</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Communication does not exist in isolation. Your <Explain tip="Stoic philosophy teaches that we cannot control others' actions, only our own perceptions and responses — the foundation of non-reactive communication">perception control</Explain> from stoicism determines whether you react or respond. Your <Explain tip="Anxiety floods the nervous system with cortisol, which narrows thinking to threat-detection mode — making calm communication nearly impossible">anxiety level</Explain> directly affects your capacity for hard conversations. Your evening review is the place to reflect on what went well and what you would do differently.
          </p>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 flex-wrap">
        <a href="/stoicism" className="text-sm text-amber-600 hover:underline">Stoicism</a>
        <a href="/anxiety-toolkit" className="text-sm text-teal-600 hover:underline">Anxiety Toolkit</a>
        <a href="/evening-review" className="text-sm text-indigo-600 hover:underline">Evening Review</a>
        <a href="/mental-health" className="text-sm text-violet-600 hover:underline">Mental Health</a>
        <a href="/cognitive-biases" className="text-sm text-rose-600 hover:underline">Cognitive Biases</a>
      </div>
    </div>
  )
}