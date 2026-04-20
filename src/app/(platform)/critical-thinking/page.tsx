"use client"

import { useState } from "react"
import { Brain, ChevronDown, Star, AlertTriangle, CheckCircle, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const AGE_EXERCISES: {
  range: string
  label: string
  color: string
  skills: string[]
  activities: string[]
  questions: string[]
}[] = [
  {
    range: "4-6 years",
    label: "Curiosity & Observation",
    color: "from-pink-500 to-rose-600",
    skills: ["Asking 'why' and 'how'", "Noticing details others miss", "Understanding that things are not always what they seem", "Sorting true from pretend"],
    activities: [
      "Observation walks: 'How many red things can you find? What do you hear? What smells different?' — trains attention to detail",
      "True or silly game: 'Dogs can fly — true or silly? Fish live in water — true or silly? The moon is made of cheese...'",
      "Magic trick debrief: do a simple magic trick. Ask 'How did I do that? What did you see vs what actually happened?' — introduces the concept of deception",
      "Two versions game: tell them a short story. Then tell a slightly different version. 'What changed? Which one is right? How do you know?'",
    ],
    questions: ["Why do you think that happened?", "How do you know that's true?", "What would happen if...?", "Can you think of another way?"],
  },
  {
    range: "7-9 years",
    label: "Evidence & Reasoning",
    color: "from-amber-500 to-orange-600",
    skills: ["Distinguishing fact from opinion", "Understanding that people can disagree and both be partly right", "Looking for evidence before believing", "Recognizing when someone is trying to persuade you"],
    activities: [
      "Fact vs opinion sorting: write statements on cards. 'The sky is blue' (fact). 'Blue is the best color' (opinion). 'This cereal is delicious' (opinion). 'This cereal has 12g of sugar' (fact). Sort them.",
      "Ad detective: watch TV commercials together. 'What are they SAYING? What are they NOT saying? What do they want you to DO? Would you buy this based only on facts?'",
      "News comparison: find the same story on 2 different news sites. 'What's the same? What's different? Why might they tell it differently?'",
      "The 'prove it' game: make claims and challenge each other to prove them. 'Chocolate is better than vanilla — prove it!' (They can't — it's an opinion.) 'Canada is bigger than the US — prove it!' (They can — with a map.)",
    ],
    questions: ["Is that a fact or an opinion?", "What evidence do you have?", "Who told you that and why might they say it?", "What's the other side of this argument?"],
  },
  {
    range: "10-12 years",
    label: "Bias & Perspective",
    color: "from-blue-500 to-indigo-600",
    skills: ["Recognizing bias in themselves and others", "Understanding that everyone has a perspective shaped by their experience", "Evaluating sources — not all information is equal", "Understanding correlation vs causation"],
    activities: [
      "Bias detection: read a news article together. 'Who wrote this? What might they believe? What words did they choose that show their opinion? How would someone who disagrees write this differently?'",
      "Perspective swap: pick a conflict (historical or current). Have them argue BOTH sides convincingly. 'First, argue that homework is important. Now argue that homework should be abolished.' The ability to argue a position you disagree with is the highest form of critical thinking.",
      "Correlation game: 'Ice cream sales and drowning deaths both go up in summer. Does ice cream cause drowning?' — introduce the concept that two things happening together doesn't mean one caused the other.",
      "Source evaluation: show them 3 'sources' on the same topic — a Wikipedia article, a random blog, and a research paper. 'Which would you trust most? Why? How can you tell if a source is reliable?'",
    ],
    questions: ["What bias might this person have?", "If you were them, would you see it the same way?", "Just because A and B happened together, did A cause B?", "Who benefits from you believing this?"],
  },
  {
    range: "13-17 years",
    label: "Systems Thinking & Media Literacy",
    color: "from-violet-500 to-purple-600",
    skills: ["Understanding complex systems (economics, politics, media)", "Identifying logical fallacies", "Evaluating statistical claims", "Recognizing propaganda and manipulation techniques", "Forming independent opinions based on evidence, not popularity"],
    activities: [
      "Logical fallacies in the wild: watch a political debate or news panel together. Pause and identify fallacies: 'That was an ad hominem attack.' 'That's a straw man — they misrepresented the argument.' See /logical-fallacies for the full guide.",
      "Follow the money: pick any issue (housing, healthcare, environment). Ask: 'Who benefits from the current system? Who pays for lobbying? Who funds the politicians making decisions?' Use Aletheia to research.",
      "Statistics challenge: find a headline with a statistic ('Crime is up 50%!'). Investigate: 50% of what base number? Over what period? In what area? Is the data cherry-picked? Teach them to ask 'compared to what?'",
      "Social media audit: go through their feed together. 'Why did the algorithm show you this? What emotion does it trigger? Is it designed to inform or to engage? How many of these posts have you fact-checked?'",
      "Steel-man exercise: pick an issue they feel strongly about. Ask them to construct the STRONGEST possible argument for the opposing side — not a weak version, the strongest version. This is the opposite of a straw man and the most valuable critical thinking skill that exists.",
    ],
    questions: ["What would change your mind about this?", "What's the strongest argument against your position?", "Who benefits from you believing this?", "If everyone believes it, does that make it true?", "What information are you missing?"],
  },
]

export default function CriticalThinkingPage() {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Teach Kids Critical Thinking</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The skill that makes every other skill more powerful. A child who thinks critically cannot be easily deceived, manipulated, or misled.
        </p>
      </div>

      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-violet-900 mb-2">Why This Matters More Than Any Subject</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Schools teach children WHAT to think. This page teaches them HOW to think. A child who can evaluate evidence,
            detect bias, question authority respectfully, and form independent opinions based on facts — not popularity —
            is equipped for ANY challenge. They cannot be manipulated by advertising, propaganda, peer pressure, or
            misinformation. Critical thinking is not a subject — it is the operating system that every other skill runs on.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {AGE_EXERCISES.map((a, i) => {
          const isOpen = expanded === i
          return (
            <Card key={i} className="overflow-hidden card-hover cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white text-xs font-bold", a.color)}>
                    {a.range.split("-")[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{a.label}</p>
                    <p className="text-[10px] text-muted-foreground">Ages {a.range}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Skills to Develop</p>
                      <div className="flex flex-wrap gap-1.5">
                        {a.skills.map((s, j) => <Badge key={j} variant="outline" className="text-[10px]">{s}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Activities</p>
                      <ul className="space-y-1.5">
                        {a.activities.map((act, j) => (
                          <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                            <span className="text-emerald-400 font-bold shrink-0">{j + 1}.</span>{act}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-violet-50 border border-violet-200 p-2.5">
                      <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider mb-1">Questions to Ask Regularly</p>
                      <ul className="space-y-0.5">
                        {a.questions.map((q, j) => (
                          <li key={j} className="text-xs text-violet-700 italic flex gap-1">
                            <span>"</span>{q}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The most important rule:</strong> Never punish your child for questioning you. When they ask "why?"
            or "how do you know?" — that is critical thinking in action. If you shut it down ("Because I said so"),
            you teach them to accept authority without question. If you engage with it ("Good question — here is why,
            and here is how I know"), you teach them that evidence and reasoning matter more than authority. The parent
            who welcomes questions raises a child who can think. The parent who demands obedience raises a child who
            can follow.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/logical-fallacies" className="text-sm text-red-600 hover:underline">Logical Fallacies</a>
        <a href="/parenting" className="text-sm text-rose-600 hover:underline">Parenting Guide</a>
        <a href="/kids-finance" className="text-sm text-amber-600 hover:underline">Kids Finance</a>
        <a href="/media-ownership" className="text-sm text-blue-600 hover:underline">Media Ownership</a>
        <a href="/rights" className="text-sm text-violet-600 hover:underline">Your Rights</a>
      </div>
    </div>
  )
}
