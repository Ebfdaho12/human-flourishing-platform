"use client"

import { useState } from "react"
import { Brain, Search, AlertTriangle, CheckCircle, ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const FALLACIES: {
  name: string
  category: string
  definition: string
  simple: string
  example: string
  realWorld: string
  counter: string
}[] = [
  {
    name: "Ad Hominem",
    category: "Relevance",
    definition: "Attacking the person making the argument instead of the argument itself.",
    simple: "You are wrong because you are a bad person.",
    example: "\"You cannot talk about healthcare — you are not even a doctor!\"",
    realWorld: "Politicians dismiss opponents' policy ideas by attacking their character, past mistakes, or personal life instead of addressing the actual policy.",
    counter: "Ask: \"Even if that is true about the person, does their argument still hold? Can we address the argument itself?\"",
  },
  {
    name: "Straw Man",
    category: "Relevance",
    definition: "Misrepresenting someone's argument to make it easier to attack.",
    simple: "Pretending someone said something they did not, then arguing against the fake version.",
    example: "Person A: \"We should have better gun regulations.\" Person B: \"So you want to take away everyone's guns?\"",
    realWorld: "Media and politicians constantly do this — take a nuanced position and present it as an extreme one, then attack the extreme version.",
    counter: "Ask: \"Is that actually what they said? Can you quote their exact words?\"",
  },
  {
    name: "Appeal to Authority",
    category: "Relevance",
    definition: "Claiming something is true because an authority figure said it, even when they are not an expert in that area or the claim is not supported by evidence.",
    simple: "It must be true because a famous/powerful person said it.",
    example: "\"This supplement works — a celebrity endorses it!\" or \"The WHO says it is safe, so it must be.\"",
    realWorld: "Celebrity endorsements, expert opinions outside their field, appeals to institutions that have been wrong before. Authority is a shortcut — not proof.",
    counter: "Ask: \"Is this person actually an expert in THIS specific area? What does the evidence say independent of who said it?\"",
  },
  {
    name: "False Dilemma",
    category: "Presumption",
    definition: "Presenting only two options when more exist.",
    simple: "You are either with us or against us — when actually there are many positions in between.",
    example: "\"You either support this war or you hate your country.\"",
    realWorld: "Political tribalism relies entirely on this: you are left or right, conservative or liberal. In reality, most people hold views from multiple positions.",
    counter: "Ask: \"Are these really the only two options? What other possibilities exist?\"",
  },
  {
    name: "Slippery Slope",
    category: "Presumption",
    definition: "Claiming that one event will inevitably lead to a chain of negative consequences without evidence for each link.",
    simple: "If we allow X, then Y will happen, then Z, then the world ends — without proving any of those connections.",
    example: "\"If we legalize cannabis, everyone will move to harder drugs, society will collapse.\"",
    realWorld: "Used to block any change: \"If we raise minimum wage, all businesses will close.\" Each step in the chain needs its own evidence.",
    counter: "Ask: \"What evidence is there that step A actually leads to step B? Can each link in the chain be verified?\"",
  },
  {
    name: "Appeal to Emotion",
    category: "Relevance",
    definition: "Using emotional manipulation instead of evidence to support an argument.",
    simple: "Making you feel scared, angry, or sad to get you to agree — instead of giving you facts.",
    example: "\"Think of the children!\" used to justify any policy without data showing it actually helps children.",
    realWorld: "News media uses fear (crime statistics out of context), anger (outrage stories), and sympathy (individual stories) to shape opinion instead of presenting data.",
    counter: "Ask: \"What does the data actually show? Am I being asked to FEEL something or to THINK about evidence?\"",
  },
  {
    name: "Bandwagon (Ad Populum)",
    category: "Relevance",
    definition: "Claiming something is true or good because many people believe it or do it.",
    simple: "Everyone is doing it, so it must be right.",
    example: "\"Millions of people bought this product — it must be the best!\"",
    realWorld: "Social media amplifies this — trending topics feel true because they are popular. But popularity has never been a measure of truth.",
    counter: "Ask: \"Does the number of people who believe something have any bearing on whether it is actually true?\"",
  },
  {
    name: "Red Herring",
    category: "Relevance",
    definition: "Introducing an irrelevant topic to divert attention from the original issue.",
    simple: "Changing the subject when you are losing the argument.",
    example: "\"Why are we talking about the senator's financial scandal? What about the economy?\"",
    realWorld: "Politicians are masters of this — when asked a direct question, they pivot to a different topic entirely. Watch for it in every interview.",
    counter: "Ask: \"That may be important, but can we return to the original question?\"",
  },
  {
    name: "Circular Reasoning",
    category: "Presumption",
    definition: "Using the conclusion as a premise — the argument assumes what it is trying to prove.",
    simple: "It is true because it is true.",
    example: "\"The Bible is true because God wrote it. We know God exists because the Bible says so.\"",
    realWorld: "\"This policy works because it is effective.\" \"Trust the science\" without showing the science. The claim and the evidence are the same thing.",
    counter: "Ask: \"What is the independent evidence? Is the conclusion being used as its own proof?\"",
  },
  {
    name: "Tu Quoque (You Too)",
    category: "Relevance",
    definition: "Dismissing someone's argument because they do not practice what they preach.",
    simple: "You do it too, so your argument does not count.",
    example: "\"You say smoking is bad, but you used to smoke!\" — the health effects of smoking are real regardless of who says it.",
    realWorld: "\"How can you talk about climate change when you fly in private jets?\" The hypocrisy is real, but it does not change whether climate data is accurate.",
    counter: "Ask: \"Is the argument valid on its own merits, regardless of who is making it?\"",
  },
  {
    name: "False Cause (Post Hoc)",
    category: "Causation",
    definition: "Assuming that because one event followed another, the first caused the second.",
    simple: "This happened, then that happened, so this must have caused that.",
    example: "\"I wore my lucky socks and my team won, therefore the socks caused the win.\"",
    realWorld: "\"The economy improved after the president took office, so the president fixed the economy.\" Correlation is not causation — many other factors could explain the change.",
    counter: "Ask: \"Is there a direct causal mechanism? Could something else explain both events? Is this correlation or causation?\"",
  },
  {
    name: "Loaded Question",
    category: "Presumption",
    definition: "Asking a question that contains an assumption that has not been proven.",
    simple: "The question itself traps you — any answer admits something you have not agreed to.",
    example: "\"Have you stopped cheating on your taxes?\" assumes you were cheating in the first place.",
    realWorld: "Interview questions like \"Why is your policy failing?\" assume the policy is failing before discussing whether it actually is.",
    counter: "Refuse the premise: \"I reject the assumption in that question. Let me address what is actually happening.\"",
  },
  {
    name: "Appeal to Nature",
    category: "Relevance",
    definition: "Claiming something is good because it is natural, or bad because it is unnatural.",
    simple: "Natural = good, unnatural = bad. But arsenic is natural and vaccines are unnatural.",
    example: "\"This supplement is all-natural!\" — so is poison ivy.",
    realWorld: "Used heavily in food marketing (\"natural flavors\" has no legal meaning), medicine (\"natural remedies\" vs evidence-based treatment), and lifestyle choices.",
    counter: "Ask: \"Does the evidence show this is effective/safe, regardless of whether it is natural?\"",
  },
  {
    name: "Moving the Goalposts",
    category: "Presumption",
    definition: "Changing the criteria for proof after the original criteria have been met.",
    simple: "You meet the challenge, they change the rules.",
    example: "\"Show me one study.\" *shows study* \"That is only one study — show me ten.\" *shows ten* \"Those are all from the same decade.\"",
    realWorld: "Happens in political debates constantly. No amount of evidence is ever enough because the standard keeps changing.",
    counter: "Ask: \"What specific evidence would change your mind? Let us agree on that before we continue.\"",
  },
  {
    name: "Hasty Generalization",
    category: "Induction",
    definition: "Drawing a broad conclusion from a small or unrepresentative sample.",
    simple: "I met two rude people from that city, so everyone from that city must be rude.",
    example: "\"My uncle smoked his whole life and lived to 95, so smoking cannot be that bad.\"",
    realWorld: "Stereotypes of entire groups based on a few encounters. Anecdotal evidence treated as data. \"I know someone who...\" is not a study.",
    counter: "Ask: \"How large and representative is the sample? Does one example disprove a trend supported by millions of data points?\"",
  },
  {
    name: "No True Scotsman",
    category: "Presumption",
    definition: "Redefining a group to exclude counterexamples rather than addressing them.",
    simple: "When someone shows an exception, you say they do not really count.",
    example: "\"No real Christian would do that.\" \"No true patriot would question the government.\"",
    realWorld: "Used to protect ideologies from criticism by dismissing any member who contradicts the narrative as not a \"real\" member.",
    counter: "Ask: \"What is the objective definition? Are you changing it to avoid the counterexample?\"",
  },
  {
    name: "Whataboutism",
    category: "Relevance",
    definition: "Responding to a criticism by pointing to someone else's wrongdoing instead of addressing the criticism.",
    simple: "But what about them? They did something bad too!",
    example: "\"Your party is corrupt.\" \"What about YOUR party's scandal in 2015?\"",
    realWorld: "The dominant fallacy in modern political discourse. Both sides use it to avoid accountability by pointing at the other side.",
    counter: "Ask: \"We can discuss that separately. Right now, can we address the original issue?\"",
  },
  {
    name: "Sunk Cost Fallacy",
    category: "Causation",
    definition: "Continuing a course of action because of previously invested resources (time, money, effort) rather than future value.",
    simple: "I have already spent so much on this, I cannot quit now — even though quitting is the smart move.",
    example: "\"I have been in this degree program for 3 years — I cannot switch now.\" But 3 more years in the wrong field costs more than switching.",
    realWorld: "Governments continue failing programs because they already spent billions. People stay in bad jobs, bad relationships, and bad investments because of what they already put in.",
    counter: "Ask: \"If I were starting from zero today, would I choose this? The past cost is gone regardless.\"",
  },
  {
    name: "Genetic Fallacy",
    category: "Relevance",
    definition: "Judging something as good or bad based on where it comes from rather than its current merit.",
    simple: "Rejecting an idea because of who said it or where it originated, not because of the idea itself.",
    example: "\"That research was funded by a pharmaceutical company, so it must be wrong.\" Maybe — but the data either holds up or it does not.",
    realWorld: "Dismissing information based on the source (\"That is from Fox News / CNN\") without examining whether the specific claim is accurate.",
    counter: "Ask: \"Regardless of the source, is the data verifiable? Can we check the methodology?\"",
  },
  {
    name: "Survivorship Bias",
    category: "Induction",
    definition: "Drawing conclusions only from examples that survived a process, ignoring the ones that did not.",
    simple: "Looking at winners and assuming their method works — without seeing the thousands who tried the same method and failed.",
    example: "\"Steve Jobs dropped out of college and became a billionaire, so college is not needed.\" For every Jobs, there are millions of dropouts who did not become billionaires.",
    realWorld: "Business advice from survivors (\"Just follow your passion!\"), military strategy (planes that returned had bullet holes — but the ones that DIDN'T return were hit in different places), health advice from the elderly (\"I ate bacon every day and lived to 90!\").",
    counter: "Ask: \"What about all the cases where this approach failed? Am I only seeing the winners?\"",
  },
]

const CATEGORIES = [...new Set(FALLACIES.map(f => f.category))]

export default function LogicalFallaciesPage() {
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<number | null>(0)
  const [filterCat, setFilterCat] = useState<string | null>(null)

  const filtered = FALLACIES.filter(f => {
    const matchesSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.definition.toLowerCase().includes(search.toLowerCase())
    const matchesCat = !filterCat || f.category === filterCat
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-amber-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Logical Fallacies</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          20 tricks people use to win arguments without being right. Once you see them, you cannot unsee them.
        </p>
      </div>

      {/* Search + filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fallacies..." className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterCat(null)}
            className={cn("text-xs rounded-full px-3 py-1 border transition-colors",
              !filterCat ? "bg-violet-100 border-violet-300 text-violet-700 font-semibold" : "border-border text-muted-foreground"
            )}>All ({FALLACIES.length})</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilterCat(filterCat === cat ? null : cat)}
              className={cn("text-xs rounded-full px-3 py-1 border transition-colors",
                filterCat === cat ? "bg-violet-100 border-violet-300 text-violet-700 font-semibold" : "border-border text-muted-foreground"
              )}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Fallacy cards */}
      <div className="space-y-2">
        {filtered.map((f, i) => {
          const globalIdx = FALLACIES.indexOf(f)
          const isOpen = expanded === globalIdx
          return (
            <Card key={f.name} className="card-hover cursor-pointer" onClick={() => setExpanded(isOpen ? null : globalIdx)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 text-xs font-bold">
                    {globalIdx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{f.name}</p>
                      <Badge variant="outline" className="text-[9px]">{f.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.simple}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="mt-3 pl-11 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Definition</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{f.definition}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50/50 border border-amber-200 p-2.5">
                      <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Example</p>
                      <p className="text-xs text-amber-700 italic">{f.example}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-1">Real-World Usage</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{f.realWorld}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-2.5">
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> How to Counter
                      </p>
                      <p className="text-xs text-emerald-700">{f.counter}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-red-200 bg-red-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why this matters:</strong> Every advertisement, political speech, news segment, and social media argument
            uses at least one of these fallacies. Once you learn to recognize them, you stop being manipulated by them.
            The goal is not to &quot;win&quot; arguments — it is to think clearly. Teach these to your children. A person who
            can spot a logical fallacy is almost impossible to deceive.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/education/economics" className="text-sm text-amber-600 hover:underline">Economics Education</a>
        <a href="/civilizations" className="text-sm text-red-600 hover:underline">Civilizations</a>
        <a href="/governance" className="text-sm text-blue-600 hover:underline">Governance</a>
      </div>
    </div>
  )
}
