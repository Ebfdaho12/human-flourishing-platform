"use client"

import { useState } from "react"
import { Eye, Search, AlertTriangle, ChevronDown, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const TECHNIQUES: {
  name: string
  category: string
  definition: string
  simple: string
  example: string
  counter: string
}[] = [
  {
    name: "Emotional Appeal",
    category: "Emotion",
    definition: "Using feelings — fear, anger, hope, sadness — to persuade instead of evidence and logic.",
    simple: "Make you feel something strong enough that you stop thinking critically.",
    example: "A pharmaceutical ad shows a family laughing in a sunny field, never mentioning risks until the fast-talking 10-second disclaimer at the end. Or: a political ad shows a grieving family to oppose a policy, without any data on whether the policy actually caused harm.",
    counter: "Ask: what is the actual evidence here? Am I being asked to feel, or to think? Emotion is not evidence.",
  },
  {
    name: "Bandwagon",
    category: "Social Proof",
    definition: "Creating the impression that everyone is doing or believing something, so you should too.",
    simple: "Everyone is doing it — you don't want to be left behind, do you?",
    example: "\"4 out of 5 dentists recommend...\" \"The #1 selling product in Canada.\" Political coverage showing massive crowds to make a movement seem inevitable. Social media trending topics that make fringe views seem mainstream.",
    counter: "Ask: does the popularity of a belief have any bearing on whether it's true? Popularity has never been a measure of accuracy.",
  },
  {
    name: "Fear Mongering",
    category: "Emotion",
    definition: "Exaggerating or fabricating threats to keep an audience in a state of anxiety, making them more compliant and less analytical.",
    simple: "Keep people scared. Scared people make poor decisions and accept things they otherwise wouldn't.",
    example: "24-hour news cycles filled with crime stories far out of proportion to actual crime rates. Politicians claiming immigrants or opposing parties will 'destroy the country.' Health products marketed with exaggerated disease statistics.",
    counter: "Ask: what does the actual data show? Is the risk as large as presented, or am I being shown isolated examples to imply a widespread trend?",
  },
  {
    name: "False Dilemma",
    category: "Logic",
    definition: "Presenting only two options when more exist — usually one desirable and one terrifying.",
    simple: "You're either with us or against us.",
    example: "\"You either support this bill or you support criminals.\" \"You either trust the science or you believe in conspiracy theories.\" \"You're either pro-this-country or you hate it.\" In reality, almost every issue has more than two positions.",
    counter: "Ask: are these really the only options? What other positions exist between or outside these two extremes?",
  },
  {
    name: "Cherry Picking",
    category: "Logic",
    definition: "Selecting only the data, studies, or facts that support your position while ignoring the evidence that contradicts it.",
    simple: "Show only the part of the picture that makes your case look good.",
    example: "A pharmaceutical company publishes 3 studies showing their drug works and buries 12 showing it doesn't. A politician cites only the economic indicators that improved during their term, ignoring those that worsened. A news outlet covers crimes by one group extensively and similar crimes by another group not at all.",
    counter: "Ask: what is the full body of evidence? Is there data that contradicts this? Why might only this evidence be shown?",
  },
  {
    name: "Appeal to Authority",
    category: "Credibility",
    definition: "Claiming something is true because an authority figure said it, especially when they are not an expert in that specific field.",
    simple: "A famous or powerful person said it, so it must be true.",
    example: "Celebrity endorsements for medical treatments. An economist commenting on climate science. A military general commenting on vaccine safety. A politician presented as a 'science believer' citing one study. Authority is a shortcut — not proof.",
    counter: "Ask: is this person an expert in THIS specific area? What does the peer-reviewed evidence say, independent of who is making the claim?",
  },
  {
    name: "Repetition",
    category: "Conditioning",
    definition: "Repeating a message so often that it begins to feel true, regardless of evidence. Sometimes called the 'illusory truth effect.'",
    simple: "Say it enough times and people start to believe it.",
    example: "Political slogans repeated until they feel self-evident. News networks repeating unverified claims until they become 'common knowledge.' Advertising jingles and taglines designed to lodge in memory. The Big Lie strategy: repeat a false claim confidently enough and loudly enough that corrections can't keep up.",
    counter: "Ask: how often have I heard this, and from how many independent sources? Frequency of repetition is not evidence of truth.",
  },
  {
    name: "Loaded Language",
    category: "Language",
    definition: "Using words with strong emotional connotations to frame an issue before the argument is even made.",
    simple: "The choice of words prejudges the issue.",
    example: "\"Pro-life\" vs \"anti-abortion.\" \"Freedom fighters\" vs \"terrorists.\" \"Undocumented workers\" vs \"illegal aliens.\" \"Enhanced interrogation\" instead of \"torture.\" \"Collateral damage\" instead of \"civilian deaths.\" The words chosen signal which side is right before any analysis happens.",
    counter: "Notice the framing of language. Ask: what neutral term could be used here? What is the word choice designed to make me feel?",
  },
  {
    name: "Scapegoating",
    category: "Blame",
    definition: "Blaming a single group — a minority, an institution, a class — for complex, systemic problems.",
    simple: "Assign all blame to one group to avoid addressing the actual causes.",
    example: "Economic problems blamed on immigrants rather than trade policy, automation, or corporate consolidation. Social problems blamed on a religion, ethnicity, or political group. Historical examples are extreme — but the pattern continues in milder forms constantly in modern media and politics.",
    counter: "Ask: how complex is this problem actually? Is it plausible that one group is responsible for all of it? What are the actual structural causes?",
  },
  {
    name: "Testimonial",
    category: "Social Proof",
    definition: "Using a specific person's endorsement — celebrity, 'ordinary citizen,' or supposed expert — to transfer credibility to a product, idea, or candidate.",
    simple: "A relatable or admired person says it's good, so it must be.",
    example: "Athlete endorsing a sports drink with no nutritional benefit. A 'real customer' testimonial in an ad that is legally a paid actor. A politician surrounded by teachers to imply educational support. The person sharing the experience is irrelevant to whether the claim is actually true.",
    counter: "Ask: is this person qualified to evaluate this claim? Is this anecdote representative, or a hand-picked outlier?",
  },
  {
    name: "Card Stacking",
    category: "Logic",
    definition: "Presenting only the arguments that support your position and omitting all counterarguments, making a one-sided case look complete.",
    simple: "Tell the truth, but not the whole truth.",
    example: "A food label highlighting that a product is 'low in fat' while hiding that it's very high in sugar. A government report citing only favourable economic indicators. A political ad showing only clips of an opponent mistreaking without context. Technically accurate, deeply misleading.",
    counter: "Ask: what arguments exist on the other side? What is NOT being said here? What would a fair presentation look like?",
  },
  {
    name: "Plain Folks",
    category: "Credibility",
    definition: "Politicians, executives, or celebrities presenting themselves as ordinary, everyday people to gain trust and likability.",
    simple: "I'm just like you — so you can trust me.",
    example: "A wealthy politician rolling up their sleeves, eating at a diner, or talking about their 'humble origins.' A CEO being photographed in jeans in the factory floor. A candidate's campaign ads showing them coaching a kids' sports team. The performance of ordinariness, not the reality of it.",
    counter: "Ask: what are the actual policies, decisions, and track record here? Likability is not competence. Relatability is not alignment of interests.",
  },
  {
    name: "Transfer",
    category: "Association",
    definition: "Associating a product, idea, or person with something that carries positive or negative symbolic weight — a flag, a religious figure, a revered institution — to transfer that feeling.",
    simple: "Stand next to something respected so that respect rubs off on you.",
    example: "Politicians photographed at churches or wrapped in flags. Products advertised alongside Olympic athletes. Companies sponsoring charities while lobbying against the very issues the charities address. Conversely: associating opponents with enemies, criminals, or foreign threats.",
    counter: "Ask: is the association meaningful or manufactured? Does proximity to something good or bad actually tell me anything about this product/person/idea?",
  },
  {
    name: "Glittering Generalities",
    category: "Language",
    definition: "Using vague, emotionally positive words — freedom, family, justice, progress, patriotism — that mean everything to everyone and nothing specific to anyone.",
    simple: "Wrapping vague ideas in virtuous-sounding words that no one can argue against.",
    example: "\"We believe in freedom.\" \"This is about protecting our values.\" \"We stand for families.\" \"We need real change.\" These phrases get enthusiastic applause without ever committing to a specific policy, action, or measurement. They invite projection — you fill in what you want to hear.",
    counter: "Ask: what specifically does this mean? What measurable action is being proposed? What would change, and how would we know?",
  },
  {
    name: "Name Calling",
    category: "Emotion",
    definition: "Attaching a negative label to a person or group to undermine their credibility and generate emotional rejection without engaging their arguments.",
    simple: "Call them a bad name so people stop listening to what they actually say.",
    example: "\"Snowflake,\" \"fascist,\" \"radical,\" \"elitist,\" \"conspiracy theorist,\" \"extremist\" — applied to dismiss people without addressing their arguments. Used by every political direction. The label ends the conversation before it starts.",
    counter: "Ask: regardless of the label, is the argument valid? Can we evaluate what they're actually saying on its merits?",
  },
]

const CATEGORIES = [...new Set(TECHNIQUES.map(t => t.category))]

export default function PropagandaPage() {
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<number | null>(null)
  const [filterCat, setFilterCat] = useState<string | null>(null)

  const filtered = TECHNIQUES.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCat || t.category === filterCat
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Propaganda & Manipulation Techniques</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          15 techniques used in media, politics, and advertising. Once you see them, you can't unsee them.
        </p>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search techniques..." className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterCat(null)}
            className={cn("text-xs rounded-full px-3 py-1 border transition-colors",
              !filterCat ? "bg-red-100 border-red-300 text-red-700 font-semibold" : "border-border text-muted-foreground"
            )}>All ({TECHNIQUES.length})</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilterCat(filterCat === cat ? null : cat)}
              className={cn("text-xs rounded-full px-3 py-1 border transition-colors",
                filterCat === cat ? "bg-red-100 border-red-300 text-red-700 font-semibold" : "border-border text-muted-foreground"
              )}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((t) => {
          const globalIdx = TECHNIQUES.indexOf(t)
          const isOpen = expanded === globalIdx
          return (
            <Card key={t.name} className="card-hover cursor-pointer" onClick={() => setExpanded(isOpen ? null : globalIdx)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 text-xs font-bold">
                    {globalIdx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <Badge variant="outline" className="text-[9px]">{t.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.simple}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
                </div>

                {isOpen && (
                  <div className="mt-3 pl-11 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Definition</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.definition}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50/50 border border-amber-200 p-2.5">
                      <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Real-World Example</p>
                      <p className="text-xs text-amber-700 leading-relaxed">{t.example}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-2.5">
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Shield className="h-3 w-3" /> How to Counter It
                      </p>
                      <p className="text-xs text-emerald-700">{t.counter}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-red-200 bg-red-50/20">
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Why This Matters</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every advertisement you have seen today used at least one of these techniques. Every political speech
            you have heard used several. Every news segment is structured around at least one. This is not a
            fringe concern — these techniques are the primary tools of commercial and political persuasion in
            modern societies. They are taught in marketing programs and political strategy rooms.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The difference between being a person who is influenced by these techniques and a person who is not
            is simply awareness. You do not need to become cynical — you need to become observant. Once you
            learn to identify them, you start noticing them in real time. And once you notice them, you can
            decide what you actually think rather than what you have been guided to feel.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Teach these to your children. A person who can recognize manipulation is much harder to manipulate.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/logical-fallacies" className="text-sm text-red-600 hover:underline">Logical Fallacies</a>
        <a href="/critical-thinking" className="text-sm text-violet-600 hover:underline">Critical Thinking</a>
        <a href="/media-ownership" className="text-sm text-blue-600 hover:underline">Media Ownership</a>
        <a href="/governance" className="text-sm text-emerald-600 hover:underline">Governance</a>
      </div>
    </div>
  )
}
