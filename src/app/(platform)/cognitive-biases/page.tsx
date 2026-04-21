"use client"

import { useState } from "react"
import { Brain, AlertTriangle, ChevronDown, Eye, Scale, Users, Clock, Ghost } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

interface Bias {
  name: string
  what: string
  cost: string
  counter: string
}

const categories: { title: string; color: string; icon: React.ReactNode; biases: Bias[] }[] = [
  {
    title: "Judgment Biases",
    color: "red",
    icon: <Eye className="h-4 w-4" />,
    biases: [
      { name: "Confirmation Bias", what: "Seeking information that confirms what you already believe while ignoring contradictions.", cost: "Bad decisions built on a filtered view of reality. You become more wrong while feeling more right.", counter: "Actively seek disconfirming evidence. Ask: 'What would change my mind?' If nothing would, you are not reasoning — you are defending." },
      { name: "Anchoring", what: "The first number you hear disproportionately influences all subsequent judgment.", cost: "Overpaying for everything from cars to salaries. Negotiations are won by whoever sets the anchor.", counter: "Set your own anchor first. Research independently before hearing others' numbers. Ignore listed prices as starting points." },
      { name: "Dunning-Kruger Effect", what: "Incompetent people overestimate their ability; genuine experts underestimate theirs.", cost: "Overconfident beginners make reckless decisions. Skilled people hesitate and defer when they should lead.", counter: "Seek honest, specific feedback. Track your predictions vs. outcomes. Calibrate by measuring, not guessing." },
      { name: "Availability Heuristic", what: "Overweighting recent or vivid events because they come to mind easily.", cost: "Fear of flying (extremely safe) while casually driving (40,000 deaths/year in the US). Distorted risk assessment.", counter: "Look at base rates and actual statistics. Ask: 'Am I afraid because it is likely, or because I can picture it vividly?'" },
      { name: "Hindsight Bias", what: "'I knew it all along.' After an event occurs, you believe you predicted it.", cost: "Overconfidence in your ability to predict the future. You learn less from outcomes because you think you already knew.", counter: "Keep a decision journal. Write down your predictions and reasoning BEFORE outcomes are known. Review honestly." },
    ],
  },
  {
    title: "Decision Biases",
    color: "amber",
    icon: <Scale className="h-4 w-4" />,
    biases: [
      { name: "Sunk Cost Fallacy", what: "Continuing something because you have already invested time, money, or effort — not because it is still good.", cost: "Staying in bad relationships, dead-end jobs, failing projects. Throwing good resources after bad.", counter: "Ask: 'If I were starting fresh today, would I choose this?' Ignore what you have spent. Only future costs and benefits matter." },
      { name: "Loss Aversion", what: "Losses feel roughly twice as painful as equivalent gains feel good.", cost: "Holding losing investments hoping they recover. Selling winners too early to 'lock in gains.' Risk-averse when you should be bold.", counter: "Reframe losses as opportunity costs. Ask: 'If I didn't already own this, would I buy it today at this price?'" },
      { name: "Status Quo Bias", what: "Defaulting to the current state simply because it is the current state.", cost: "Missed opportunities. Staying at jobs, in cities, with habits that no longer serve you — because change feels risky.", counter: "Actively evaluate alternatives on a regular schedule. Ask: 'Am I choosing this, or just not un-choosing it?'" },
      { name: "Bandwagon Effect", what: "Doing something because everyone else is doing it.", cost: "Investment bubbles, groupthink in organizations, adopting beliefs without examination.", counter: "Ask: 'Would I believe this if nobody else did?' Practice forming opinions before checking what the crowd thinks." },
      { name: "Choice Overload", what: "Too many options leads to paralysis, anxiety, and less satisfaction with whatever you choose.", cost: "Decision fatigue, procrastination, perpetual 'grass is greener' dissatisfaction.", counter: "Limit options deliberately. Satisfice (choose good enough) instead of maximizing. Set decision deadlines." },
    ],
  },
  {
    title: "Social Biases",
    color: "violet",
    icon: <Users className="h-4 w-4" />,
    biases: [
      { name: "In-group Bias", what: "Favoring people who belong to your group — and distrusting outsiders.", cost: "Discrimination, tribalism, echo chambers. You miss talent and ideas from people who don't look or think like you.", counter: "Deliberately seek out-group perspectives. Evaluate ideas on merit, blinding yourself to the source when possible." },
      { name: "Halo Effect", what: "Assuming that someone who excels in one area (e.g., attractiveness) excels in others (e.g., competence).", cost: "Hiring the charismatic person over the competent one. Trusting celebrities on topics outside their expertise.", counter: "Evaluate each trait independently. Use structured criteria for decisions about people." },
      { name: "Authority Bias", what: "Trusting authority figures over evidence, even when the authority is wrong or speaking outside their domain.", cost: "Following bad medical advice from a confident doctor. Obeying unethical orders. Deferring to titles over truth.", counter: "Evaluate the argument, not the source. Ask: 'Is this person an authority on THIS specific topic?'" },
      { name: "Fundamental Attribution Error", what: "Attributing others' bad behavior to their character, but your own to your circumstances.", cost: "Harsh judgment of others, excessive forgiveness of yourself. Damaged relationships and blind spots.", counter: "When judging others, ask: 'What situation might cause a good person to act this way?' Grant them the context you give yourself." },
      { name: "Projection Bias", what: "Assuming others think, feel, and value the same things you do.", cost: "Miscommunication, failed negotiations, giving gifts people don't want, building products nobody needs.", counter: "Ask people directly what they want. Observe behavior, don't infer from your own preferences." },
    ],
  },
  {
    title: "Memory & Perception Biases",
    color: "blue",
    icon: <Clock className="h-4 w-4" />,
    biases: [
      { name: "Recency Bias", what: "Overweighting the most recent events and underweighting older data.", cost: "Chasing last quarter's hot stock. Judging a decade-long relationship by last week's argument.", counter: "Zoom out. Look at long-term trends and base rates, not just recent data points." },
      { name: "Peak-End Rule", what: "You judge experiences by their peak intensity and how they ended, not by the average.", cost: "A great vacation with a bad last day feels like a bad vacation. A painful procedure with a gentle ending feels okay.", counter: "Design endings deliberately. In presentations, conversations, and experiences — end strong." },
      { name: "Negativity Bias", what: "Negative events carry more psychological weight than equally intense positive events.", cost: "One criticism outweighs ten compliments. Bad news dominates good news. Pessimism feels more realistic than it is.", counter: "Consciously track positive outcomes alongside negative ones. Gratitude practices work because they counterbalance this bias." },
      { name: "Optimism Bias", what: "Believing you are less likely than others to experience negative events.", cost: "Underinsuring, under-preparing, underestimating risk. 'It won't happen to me' — until it does.", counter: "Use reference class forecasting: look at what happened to others in similar situations, not what you hope will happen to you." },
      { name: "Framing Effect", what: "Reacting differently to the same information depending on how it is presented.", cost: "'90% survival rate' and '10% mortality rate' are identical — but one makes you choose surgery, the other makes you refuse.", counter: "Reframe every important piece of information in multiple ways before reacting. Ask: 'How would this sound stated differently?'" },
    ],
  },
  {
    title: "Self-Deception Biases",
    color: "stone",
    icon: <Ghost className="h-4 w-4" />,
    biases: [
      { name: "Self-Serving Bias", what: "Attributing successes to your skill and failures to external factors.", cost: "You never learn from mistakes because you don't own them. Repeated failures with no course correction.", counter: "After success, ask: 'What role did luck play?' After failure, ask: 'What could I have done differently?'" },
      { name: "Illusion of Control", what: "Believing you can influence outcomes that are actually random or beyond your control.", cost: "Gamblers blowing on dice. Traders believing they control the market. Wasted effort on uncontrollable variables.", counter: "Distinguish between what you can control (your actions, preparation) and what you cannot (outcomes, other people). Focus only on the former." },
      { name: "Planning Fallacy", what: "Chronically underestimating how long tasks will take and how much they will cost.", cost: "Every project goes over budget and past deadline. Chronic over-commitment and under-delivery.", counter: "Use reference class forecasting: how long did similar projects ACTUALLY take? Multiply your estimate by 1.5 to 3x." },
      { name: "Normalcy Bias", what: "Assuming that because something has never happened, it won't happen.", cost: "Ignoring evacuation warnings. Dismissing pandemic risk. Failing to prepare for black swan events.", counter: "Study history. Unprecedented events happen regularly — they are only unprecedented until they happen the first time." },
      { name: "Curse of Knowledge", what: "Once you know something, you cannot imagine not knowing it. You assume others know what you know.", cost: "Bad teaching, unclear communication, products designed for experts that confuse beginners.", counter: "Explain things as if the listener is smart but uninformed. Test your communication with someone outside your field." },
    ],
  },
]

const colorMap: Record<string, { badge: string; border: string; bg: string; text: string }> = {
  red: { badge: "bg-red-100 text-red-700", border: "border-red-200", bg: "bg-red-50/30", text: "text-red-600" },
  amber: { badge: "bg-amber-100 text-amber-700", border: "border-amber-200", bg: "bg-amber-50/30", text: "text-amber-600" },
  violet: { badge: "bg-violet-100 text-violet-700", border: "border-violet-200", bg: "bg-violet-50/30", text: "text-violet-600" },
  blue: { badge: "bg-blue-100 text-blue-700", border: "border-blue-200", bg: "bg-blue-50/30", text: "text-blue-600" },
  stone: { badge: "bg-stone-100 text-stone-700", border: "border-stone-200", bg: "bg-stone-50/30", text: "text-stone-600" },
}

export default function CognitiveBiasesPage() {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setOpen(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Cognitive Biases: Bugs in Human Thinking</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Your brain is running on 200,000-year-old hardware in a world that changes yearly. These are the known bugs.
        </p>
      </div>

      {/* Warning Card */}
      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <Explain tip="Cognitive biases are systematic errors in how your brain processes information — they are not random mistakes, they are predictable patterns built into human thinking">Cognitive biases</Explain> are
            not personal flaws — they are features of human cognition that evolved for survival but misfire in the modern world. You cannot eliminate them. You can learn to recognize them in real time and build systems that compensate.
          </p>
        </CardContent>
      </Card>

      {/* Categories */}
      {categories.map(cat => {
        const c = colorMap[cat.color]
        return (
          <div key={cat.title} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", c.badge)}>{cat.icon}</span>
              <h2 className="text-sm font-bold">{cat.title}</h2>
              <Badge variant="outline" className={cn("text-[9px]", c.badge)}>{cat.biases.length} biases</Badge>
            </div>
            {cat.biases.map((b, i) => {
              const key = `${cat.title}-${i}`
              const isOpen = open[key]
              return (
                <Card key={key} className={cn("transition-all cursor-pointer", isOpen && c.border)} onClick={() => toggle(key)}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
                      <span className="text-sm font-semibold">{b.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">{b.what}</p>
                    {isOpen && (
                      <div className={cn("mt-3 ml-6 space-y-2 rounded-lg p-3 text-xs leading-relaxed", c.bg)}>
                        <p><strong className={c.text}>Real-life cost:</strong> {b.cost}</p>
                        <p><strong className={c.text}>How to counter it:</strong> {b.counter}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      })}

      {/* The Meta-Bias */}
      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" /> The Meta-Bias: Bias Blind Spot
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Here is the cruel twist: <strong>knowing about biases does not make you immune to them.</strong> This is called the
            <Explain tip="The bias blind spot is the tendency to recognize cognitive biases in others while failing to see them in yourself. Ironically, learning about biases can make this worse — you feel 'inoculated' when you are not">bias blind spot</Explain> —
            the tendency to see biases in others while believing you are objective.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In fact, people who score highest on cognitive bias tests often have the <em>strongest</em> bias blind spots. Intelligence does not protect you. Awareness alone does not protect you. What protects you is <strong>systems</strong>: decision journals, checklists, devil's advocates, pre-mortems, and structured frameworks that force you to confront your blind spots before they cost you.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The goal is not to think you are unbiased. The goal is to assume you are biased and build accordingly.
          </p>
        </CardContent>
      </Card>

      {/* Nav Links */}
      <div className="flex gap-3 flex-wrap">
        <a href="/mental-models" className="text-sm text-amber-600 hover:underline">Mental Models</a>
        <a href="/scientific-literacy" className="text-sm text-blue-600 hover:underline">Scientific Literacy</a>
        <a href="/logical-fallacies" className="text-sm text-orange-600 hover:underline">Logical Fallacies</a>
        <a href="/stoicism" className="text-sm text-stone-600 hover:underline">Stoicism</a>
        <a href="/decision-journal" className="text-sm text-violet-600 hover:underline">Decision Journal</a>
      </div>
    </div>
  )
}
