"use client"

import { useState } from "react"
import { BookOpen, ChevronDown, Quote, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const SCHOOLS = [
  {
    name: "Stoicism",
    tagline: "Control what you can. Release what you can't.",
    badge: "Ancient Greece/Rome",
    color: "from-slate-600 to-gray-700",
    core: "Distinguish between what's 'up to you' (your thoughts, choices, responses) and what isn't (other people, outcomes, events). Spend zero energy on the second category. Direct all energy to the first.",
    applications: [
      "When something goes wrong, ask: 'Is this in my control?' If not, let it go completely. If yes, act decisively.",
      "Use negative visualization: briefly imagine losing what you value. It creates gratitude and reduces fear of loss.",
      "Before reacting emotionally, pause and ask: 'Is this event bad, or is it my judgment of the event that's bad?'",
    ],
    quote: "You have power over your mind, not outside events. Realize this, and you will find strength. — Marcus Aurelius",
    book: "Meditations by Marcus Aurelius — written as a private journal, never meant to be published. Raw and honest.",
  },
  {
    name: "Existentialism",
    tagline: "There is no pre-written script. Write your own.",
    badge: "20th Century France",
    color: "from-neutral-700 to-stone-800",
    core: "Existence precedes essence — you exist first, then you define what you are through your choices. There's no cosmic purpose handed to you. This is terrifying and also the most liberating idea in philosophy.",
    applications: [
      "When you feel lost or purposeless, recognize that this is the correct starting point — meaning is built, not found.",
      "Stop asking 'what am I supposed to do with my life' and start asking 'what do I choose to make my life about?'",
      "Own your choices completely. You are not a product of circumstance — you are the sum of what you choose to do with your circumstances.",
    ],
    quote: "Man is condemned to be free. — Jean-Paul Sartre",
    book: "Man's Search for Meaning by Viktor Frankl — Existentialism from a Holocaust survivor who found meaning in the camps.",
  },
  {
    name: "Pragmatism",
    tagline: "An idea is only as good as what it produces.",
    badge: "American Philosophy",
    color: "from-blue-700 to-indigo-800",
    core: "Truth isn't abstract — it's what works. Judge ideas, beliefs, and plans by their consequences and practical results, not by how elegant or traditional they are.",
    applications: [
      "When debating beliefs, ask: 'What difference does it make in practice?' Ideas with zero practical difference aren't worth arguing about.",
      "When planning, ask: 'What does success actually look like? How will I know if this worked?' Work backward from outcomes.",
      "Be willing to change a belief the moment evidence shows it's not working. Conviction without flexibility is just stubbornness.",
    ],
    quote: "The greatest use of a life is to spend it on something that will outlast it. — William James",
    book: "Pragmatism by William James — accessible and genuinely life-changing in how it reframes what 'being right' means.",
  },
  {
    name: "Buddhism Basics",
    tagline: "Suffering comes from clinging. Release the grip.",
    badge: "Ancient India",
    color: "from-amber-600 to-orange-700",
    core: "Suffering arises from craving things to be different than they are — either clinging to what we want to keep, or pushing away what we don't want. The path out is acceptance, impermanence, and presence.",
    applications: [
      "When anxious or unhappy, identify what you're clinging to or resisting. Name it specifically. Then practice accepting it as it is, right now.",
      "Remember that everything is impermanent — good and bad. 'This too shall pass' isn't resignation; it's wisdom.",
      "Practice being fully present in one activity daily — no phone, no planning, just the single thing. This is the seed of meditation.",
    ],
    quote: "Pain is inevitable. Suffering is optional. — Buddhist teaching",
    book: "The Mind Illuminated by Culadasa — rigorous and practical. Bridges ancient practice with modern neuroscience.",
  },
  {
    name: "Minimalism",
    tagline: "Own less. Want less. Live more.",
    badge: "Modern Philosophy",
    color: "from-green-700 to-teal-800",
    core: "Accumulation of things, commitments, and information beyond your needs creates friction, anxiety, and distraction. Every possession you own also owns a piece of your attention. Deliberately design a life with less.",
    applications: [
      "Do a possession audit: for each category of stuff, ask 'does this add clear value to my life?' If unsure, it doesn't. Remove it.",
      "Apply minimalism to commitments too: every 'yes' is a 'no' to something else. Default to 'no' and protect your time ruthlessly.",
      "Before buying anything, wait 72 hours. Most desire evaporates. What remains is a genuine need or considered want.",
    ],
    quote: "The things you own end up owning you. — Tyler Durden, Fight Club",
    book: "The More of Less by Joshua Becker — the most practical entry point into minimalism without the ascetic extremes.",
  },
]

export default function PhilosophyPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
            <BookOpen className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          </div>
          <h1 className="text-3xl font-bold">Philosophy for Everyday Life</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Not academic theory — practical tools for living better. Five of the most useful schools of thought, stripped down to what actually helps.
        </p>
      </div>

      <div className="space-y-3">
        {SCHOOLS.map((s, i) => {
          const isOpen = open === i
          return (
            <Card key={i} className={cn("transition-all", isOpen && "ring-2 ring-slate-400/40")}>
              <button
                className="w-full text-left p-4 flex items-center justify-between gap-3"
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-10 rounded-full bg-gradient-to-b", s.color)} />
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.tagline}</p>
                    <Badge variant="outline" className="text-xs mt-1">{s.badge}</Badge>
                  </div>
                </div>
                <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <CardContent className="pt-0 pb-5 px-5 space-y-4 border-t">
                  <div className="pt-4 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Core Idea</p>
                    <p className="text-sm">{s.core}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">3 Practical Applications</p>
                    <ol className="space-y-2">
                      {s.applications.map((app, j) => (
                        <li key={j} className="flex gap-3 text-sm">
                          <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>{app}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex gap-2">
                    <Quote className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-sm italic text-slate-600 dark:text-slate-300">{s.quote}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Read This</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{s.book}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <div className="border-t pt-6">
        <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Related on this platform</p>
        <div className="flex flex-wrap gap-2">
          {[["Values", "/values"], ["Reading", "/reading"], ["Critical Thinking", "/critical-thinking"], ["Decisions", "/decisions"]].map(([label, href]) => (
            <a key={href} href={href} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
