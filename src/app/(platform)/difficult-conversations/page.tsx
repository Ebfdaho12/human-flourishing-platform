"use client"

import { useState } from "react"
import { MessageCircle, ChevronDown, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const CONVERSATIONS: {
  title: string
  category: string
  color: string
  when: string
  howToStart: string
  scripts: { label: string; line: string }[]
  avoid: string[]
  outcome: string
}[] = [
  {
    title: "Money with Your Spouse",
    category: "Relationship",
    color: "from-emerald-500 to-teal-600",
    when: "Before you merge finances, when spending is causing tension, when one partner feels blindsided by bills, when financial goals are misaligned, or when a big purchase is planned.",
    howToStart: "Pick a calm evening — not during or after a fight. \"I want us to be on the same page about money so we are working as a team. Can we look at our finances together this weekend?\"",
    scripts: [
      { label: "Opening", line: "\"I feel stressed when I don't know where we stand financially. I don't want to fight about money — I want us to plan together. Can we spend an hour looking at this?\"" },
      { label: "On different spending styles", line: "\"I know we handle money differently and I don't want to control you. Can we agree on a system where we each have personal spending money, no questions asked, and still save toward our shared goals?\"" },
      { label: "On debt they haven't disclosed", line: "\"I found out about [debt]. I'm not angry — I just need us to be honest with each other about this. Can we talk about it?\"" },
      { label: "On saving vs spending", line: "\"What does our future look like to you? Where do you want to be in 10 years? I want to make sure we're building toward the same thing.\"" },
    ],
    avoid: [
      "\"You always spend too much\" — always/never language triggers defensiveness, not problem-solving",
      "Having this conversation during an argument about something else",
      "Surprising your partner with financial information in front of others",
      "Making it about who earns more",
    ],
    outcome: "A shared budget or financial system you both designed. Monthly money dates. Agreed amounts of personal spending without accountability. Same-team feeling.",
  },
  {
    title: "Boundaries with Parents",
    category: "Family",
    color: "from-violet-500 to-purple-600",
    when: "When a parent is overstepping with parenting decisions, when unannounced visits are disruptive, when critical comments about your choices affect your relationship, or when you feel emotionally drained after every visit.",
    howToStart: "Not in the heat of the moment. Not via text. \"Mom/Dad, I want to talk to you about something important. Can we have coffee or a call this week?\"",
    scripts: [
      { label: "On parenting decisions", line: "\"I appreciate that you love [grandchild] and want to help. We want you in their life. We also need you to follow our rules when we're not there — it confuses [child] when the rules change.\"" },
      { label: "On unsolicited advice", line: "\"I love you and I know you're coming from a good place. I need you to trust that I have thought things through. When I want your advice, I will ask for it.\"" },
      { label: "On unannounced visits", line: "\"We would love to see you more. We need to know in advance so we can make sure we're home and ready. Can we set up a regular time each week?\"" },
      { label: "On criticism of your spouse", line: "\"When you criticize [spouse], it puts me in a very difficult position. They are my partner and I need you to treat them with respect. This is not negotiable for me.\"" },
    ],
    avoid: [
      "Asking your spouse to set the boundary instead of doing it yourself — that creates triangulation and resentment",
      "Setting a boundary as an ultimatum in the heat of anger",
      "Expecting them to respond well in the moment — they may not, and that's okay",
      "Over-explaining and justifying the boundary — state it once, calmly, and hold it",
    ],
    outcome: "Clearer expectations that reduce ongoing friction. The relationship may be uncomfortable for a few weeks, then it improves. Most people respect boundaries more than they resent them.",
  },
  {
    title: "Discipline with Kids",
    category: "Parenting",
    color: "from-amber-500 to-orange-600",
    when: "When a child's behaviour is repeatedly crossing a line, when consequences aren't working, when co-parents disagree on approach, or when you find yourself yelling more than you want to.",
    howToStart: "NOT in the moment of the behaviour. When everyone is calm: \"I want to talk to you about something. You're not in trouble — I just want us to understand each other.\"",
    scripts: [
      { label: "Connecting before correcting", line: "\"I love you. I need to tell you that what happened earlier wasn't okay. Can you help me understand what was going on for you?\"" },
      { label: "On repeated behaviour", line: "\"This is the third time this week. I'm not going to yell about it. But I need you to hear me: when you do [X], [consequence] will happen. Every time. That's not a threat — it's just how it's going to work.\"" },
      { label: "On big emotions", line: "\"I can see you're really upset. I'm not going to talk about consequences right now. When you're ready, we can figure this out together.\"" },
      { label: "On co-parent disagreement (with partner, not child)", line: "\"We need to agree in front of the kids even if we disagree privately. Can we talk about this later when they're in bed?\"" },
    ],
    avoid: [
      "Consequences delivered in anger — kids hear the emotion, not the message",
      "Inconsistent follow-through — threatening consequences you don't actually enforce teaches kids to ignore you",
      "Shaming or comparing them to siblings",
      "The 'wait until your father/mother gets home' delay — creates dread and disconnects consequence from behaviour",
    ],
    outcome: "Kids who understand expectations. Fewer repeated conflicts about the same issue. A relationship where they feel safe to come to you when things go wrong.",
  },
  {
    title: "End-of-Life with Aging Parents",
    category: "Family",
    color: "from-slate-500 to-gray-600",
    when: "While your parent is healthy enough to participate. After a health scare is often the catalyst. Don't wait for a crisis — the goal is a plan everyone agrees on before it's urgently needed.",
    howToStart: "Frame it as love, not logistics: \"I want to make sure that if anything ever happens, we know what you want. I don't want to be guessing when I'm already scared. Can we talk about it?\"",
    scripts: [
      { label: "Opening", line: "\"This is one of the most important conversations we can have. I want to get it right. What do you want your life to look like as you get older? What matters most to you?\"" },
      { label: "On care preferences", line: "\"If you ever couldn't care for yourself, where would you want to live? Who would you want making decisions for you?\"" },
      { label: "On medical wishes", line: "\"If you were ever very sick and couldn't speak for yourself, what would you want? Would you want everything done to keep you alive? Is there a point where you wouldn't want intervention?\"" },
      { label: "On finances and legal documents", line: "\"Do you have a will and a Power of Attorney? If not, I can help you set that up — it protects you, and it protects all of us.\"" },
    ],
    avoid: [
      "Waiting until your parent has dementia or is in a health crisis — by then they may not be able to legally consent to documents",
      "Having this conversation with the whole family at once the first time — start one on one",
      "Making it about their death — frame it around their wishes and what matters to them",
      "Letting cultural discomfort keep you from having it at all — the regret of not having it is far heavier",
    ],
    outcome: "Legal documents completed. Care preferences documented. The family knows the plan. The weight of future guessing is gone.",
  },
  {
    title: "Asking for a Raise",
    category: "Career",
    color: "from-blue-500 to-violet-600",
    when: "After a significant accomplishment, during or after a performance review, when you have been in the role 12+ months at the same rate, or when you have market data showing your pay is below rate.",
    howToStart: "Request a dedicated meeting — don't ambush: \"I'd like to schedule time to discuss my compensation. When works for you this week?\"",
    scripts: [
      { label: "The ask", line: "\"I've been here [X time] and I've taken on [new responsibilities]. I've researched the market rate for this role and it ranges from $[X] to $[Y]. I'm asking for $[specific number].\"" },
      { label: "On your contributions", line: "\"In the past [period], I've [specific accomplishment: closed X clients, reduced Y time by Z%, led the A project]. I want my compensation to reflect that.\"" },
      { label: "If they say no", line: "\"I understand there may be budget constraints. Can we set specific goals and a defined timeline — 3 to 6 months — after which we revisit this? I'd like to know exactly what success looks like.\"" },
      { label: "If they ask for a range", line: "\"Based on my research and contribution, I'm looking for $[single number].\" Hold the line. Giving a range means getting the bottom of it." },
    ],
    avoid: [
      "\"I need more money because my rent went up\" — personal financial need is not the employer's concern and weakens your position",
      "Accepting the first no without asking about a future review timeline",
      "Comparing yourself to a specific named colleague — focus on market data, not co-workers",
      "Giving an ultimatum unless you genuinely intend to leave and have an offer in hand",
    ],
    outcome: "The raise, or a documented plan with a timeline and clear milestones. Either way, you have created a professional record of this conversation.",
  },
  {
    title: "Conflict with Neighbour or Coworker",
    category: "Community",
    color: "from-rose-500 to-red-600",
    when: "When a problem has happened more than once and you've been avoiding it. The longer you wait, the more resentment builds and the worse the conversation becomes.",
    howToStart: "In private. Not in front of others. Not via passive-aggressive notes. \"I wanted to talk to you directly because I'd rather work this out than have it become a bigger issue.\"",
    scripts: [
      { label: "Opening — neutral and non-blaming", line: "\"I wanted to talk to you about something that's been bothering me. I'm not trying to start a fight — I just think if we address it now we can both move on.\"" },
      { label: "Neighbour noise or boundary issue", line: "\"When [specific thing] happens, it affects [specific impact on me]. I don't think you're doing it intentionally, but I wanted to let you know.\"" },
      { label: "Coworker taking credit or undermining", line: "\"I noticed in the meeting that [specific thing] happened. I want to address it directly with you before it becomes a pattern. Can we talk about how we handle that going forward?\"" },
      { label: "After they get defensive", line: "\"I hear that. I'm not trying to attack you. I just need us to find a way to make this work for both of us.\"" },
    ],
    avoid: [
      "Venting to others first — gossip and triangulation make direct resolution almost impossible",
      "Bringing up a list of every grievance at once — address one issue per conversation",
      "Apologizing for having the conversation — you have every right to address problems",
      "Expecting them to admit fault — focus on future behaviour, not past blame",
    ],
    outcome: "Most direct, private, non-blaming conversations resolve the issue or at least de-escalate it. The relationship may not become close, but the tension usually drops significantly.",
  },
]

const FRAMEWORK = [
  { step: "Prepare", detail: "Know what you want to say before you say it. Write it out if needed. Know your goal: are you seeking change, understanding, or a decision?" },
  { step: "Choose the right time", detail: "Never when either person is angry, hungry, exhausted, or distracted. Ask for dedicated time rather than ambushing in passing." },
  { step: "Lead with empathy", detail: "Start by acknowledging the other person's perspective, even if you disagree with it. This disarms defensiveness." },
  { step: "State your need clearly", detail: "Use 'I' statements. 'I feel [X] when [Y]' is far less triggering than 'You always [Y].' Be specific about what you're asking for." },
  { step: "Listen fully", detail: "Their response matters. Don't prepare your counter-argument while they're speaking. Reflect back what you heard before responding." },
  { step: "Find common ground", detail: "Almost every conflict has a shared goal underneath it. Name it: 'We both want the same thing here — we just see the path differently.'" },
]

export default function DifficultConversationsPage() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-rose-600">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Difficult Conversations</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          When to have it, how to start, what to say, and what not to say. Six conversations that change relationships.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">The Framework</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {FRAMEWORK.map((f, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-[10px] font-bold bg-violet-100 text-violet-700 rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <div>
                <p className="text-xs font-semibold">{f.step}</p>
                <p className="text-xs text-muted-foreground">{f.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {CONVERSATIONS.map((c, i) => {
          const isOpen = expanded === i
          return (
            <Card key={i} className="overflow-hidden cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", c.color)}>
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{c.title}</p>
                      <Badge variant="outline" className="text-[9px]">{c.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.when.split(",")[0]}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
                </div>

                {isOpen && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">When to Have It</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.when}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">How to Start</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.howToStart}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 space-y-2">
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">What to Say</p>
                      {c.scripts.map((s, j) => (
                        <div key={j}>
                          <p className="text-[10px] font-medium text-slate-500 mb-0.5">{s.label}</p>
                          <p className="text-xs text-slate-700 leading-relaxed italic">{s.line}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg bg-red-50 border border-red-200 p-2.5">
                      <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> What NOT to Say or Do
                      </p>
                      <ul className="space-y-1">
                        {c.avoid.map((a, j) => (
                          <li key={j} className="text-xs text-red-700 flex gap-2">
                            <span className="shrink-0">✗</span><span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Expected Outcome
                      </p>
                      <p className="text-xs text-emerald-700">{c.outcome}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The conversation you're avoiding is the one you need most.</strong> Unspoken resentments do not
            disappear — they compound. Every week you avoid a hard conversation, you are making the eventual one
            harder. Most difficult conversations, when handled directly and kindly, take less than 30 minutes
            and save years of silent friction.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/relationships" className="text-sm text-rose-600 hover:underline">Relationships</a>
        <a href="/negotiation" className="text-sm text-emerald-600 hover:underline">Negotiation Scripts</a>
        <a href="/mental-health" className="text-sm text-blue-600 hover:underline">Mental Health</a>
        <a href="/parenting" className="text-sm text-amber-600 hover:underline">Parenting</a>
      </div>
    </div>
  )
}
