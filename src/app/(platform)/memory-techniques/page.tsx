"use client"

import { useState } from "react"
import { Brain, ChevronDown, BookOpen, Zap, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const TECHNIQUES: {
  name: string
  tagline: string
  color: string
  what: string
  how: string[]
  whenToUse: string
  science: string
  effort: string
  payoff: string
}[] = [
  {
    name: "Spaced Repetition",
    tagline: "Review information at increasing intervals, right before you would forget it",
    color: "from-blue-500 to-indigo-600",
    effort: "Medium setup",
    payoff: "Extremely high",
    what: "Spaced repetition is an algorithm-driven review system that shows you information just as you are about to forget it. Instead of reviewing everything every day, you review each item at precisely the right moment — getting maximum retention for minimum time invested.",
    how: [
      "Download Anki (free — anki.app). It is the gold standard for spaced repetition.",
      "Create a deck. Each card: a question on the front, the answer on the back. One concept per card — never mix multiple facts.",
      "Review daily. Anki shows you cards based on when you last got them right. Rate yourself honestly (Again / Hard / Good / Easy).",
      "Import pre-made decks for medical school, language learning, history — thousands are available free at AnkiWeb.",
      "10-20 minutes of daily review is more effective than 2 hours of cramming the night before.",
    ],
    whenToUse: "Anything that requires memorization: languages, medical terms, legal cases, historical dates, chemical formulas, names and faces, musical theory.",
    science: "The 'forgetting curve' (Ebbinghaus, 1885) shows we forget most new information within hours. Each review resets the curve and lengthens retention. Reviewing at the moment of forgetting maximizes the strength of the memory trace. Studies show spaced repetition produces retention rates 2-3x higher than massed practice (cramming).",
  },
  {
    name: "Memory Palace (Method of Loci)",
    tagline: "Store information as vivid images in a familiar physical location",
    color: "from-violet-500 to-purple-600",
    effort: "High setup, fast retrieval",
    payoff: "Extraordinary for lists/sequences",
    what: "The memory palace uses spatial memory — one of the brain's most robust memory systems — to anchor abstract information to physical locations you already know. Used by memory champions to memorize decks of cards in minutes.",
    how: [
      "Choose a familiar location: your home, your commute route, your school. You will 'walk' through this place mentally.",
      "Identify 10-20 distinct 'stations' along a clear path: front door → hallway → kitchen → living room, etc.",
      "Convert each item you want to remember into a vivid, bizarre, multi-sensory image.",
      "Place each image at a station. The more ridiculous, the better — your brain remembers unusual things.",
      "To recall: mentally walk through your palace in order. The images appear at each station.",
    ],
    whenToUse: "Ordered lists, speeches, presentations, historical sequences, the order of a deck of cards, key points of an argument. Less useful for isolated facts — use Anki for those.",
    science: "Spatial memory evolved for navigation and is extraordinarily powerful. Brain imaging studies show hippocampal activation when using memory palace technique identical to actual navigation. Memory champions use this exclusively. A 2017 study (Science) found that with 40 days of training, ordinary people memorized an average of 62 words using memory palace, vs 26 words using standard rehearsal.",
  },
  {
    name: "Feynman Technique",
    tagline: "Explain it simply enough that a child could understand it — that reveals exactly what you don't know",
    color: "from-amber-500 to-orange-600",
    effort: "Low setup",
    payoff: "Deep understanding",
    what: "The Feynman Technique, developed by Nobel Prize physicist Richard Feynman, uses the constraint of simple explanation to force genuine understanding. If you can explain it simply, you understand it. If you cannot, you have identified exactly where your understanding breaks down.",
    how: [
      "Pick a concept you are trying to learn.",
      "Explain it out loud (or in writing) as if teaching it to a 12-year-old. No jargon. No hiding behind complex terms.",
      "Identify every point where you get stuck, go vague, or use words you cannot define simply.",
      "Return to your source material and fill in those gaps specifically.",
      "Repeat until the explanation flows clearly and completely without references.",
    ],
    whenToUse: "Understanding complex concepts rather than memorizing facts. Science, economics, philosophy, programming, mathematics. Before exams, before presentations, before teaching anyone else.",
    science: "The 'illusion of explanatory depth' (Rozenblit & Keil, 2002) shows that people grossly overestimate their understanding of complex systems. Attempting to explain reveals this illusion immediately. The act of generating explanations (generative processing) produces far stronger learning than passive re-reading.",
  },
  {
    name: "Active Recall",
    tagline: "Test yourself instead of re-reading — retrieval practice is the most powerful learning method known",
    color: "from-emerald-500 to-teal-600",
    effort: "Medium",
    payoff: "Highest return per minute for exam prep",
    what: "Active recall means forcing your brain to retrieve information without looking at the source. The act of retrieval itself strengthens the memory far more than re-reading. This is the most research-backed learning technique available.",
    how: [
      "After reading a section, close the book and write down everything you remember. All of it.",
      "Make flashcards as you learn — then test yourself with them before bed.",
      "Use past exams, practice problems, and question banks. Attempt the question before reading the answer.",
      "Teach it to someone else (or pretend to). Teaching is retrieval under pressure.",
      "The blank page method: take a piece of paper and reproduce everything you know about a topic from memory.",
    ],
    whenToUse: "All formal learning environments. Any time you have a test, exam, or need to actually retain what you are learning. Replace re-reading entirely — every minute of re-reading is a worse investment than a minute of self-testing.",
    science: "The 'testing effect' (Roediger & Karpicke, 2006) is one of the most replicated findings in cognitive science. Students who studied then tested themselves retained 80% of material one week later. Students who re-read four times retained 36%. Active retrieval produces structural changes in neural connections. Re-reading is passive and produces an illusion of learning — the text feels familiar, but familiarity is not memory.",
  },
  {
    name: "Interleaving",
    tagline: "Mix different subjects and problem types — blocked practice feels easier but produces less learning",
    color: "from-rose-500 to-pink-600",
    effort: "Easy (just rearrange)",
    payoff: "High for skill application",
    what: "Instead of practicing all of one type before moving to the next (blocked practice), interleaving mixes different types of problems randomly. It feels harder and makes slower immediate progress — but produces dramatically superior long-term retention and the ability to apply knowledge flexibly.",
    how: [
      "Instead of: 10 algebra problems, then 10 geometry, then 10 statistics — mix them randomly.",
      "When studying multiple subjects in a session, switch between them every 25-30 minutes.",
      "For language learning: mix new vocabulary with reviewing old, reading with writing, grammar with conversation.",
      "In skill practice: alternate between different techniques or scenarios rather than drilling one until perfect.",
      "Embrace the discomfort — the feeling that it is harder means it is working.",
    ],
    whenToUse: "Mathematics, science problem sets, language learning, music practice, sports training, any skill with multiple related sub-types. Less critical for reading or conceptual understanding.",
    science: "Bjork & Bjork (2011) introduced the concept of 'desirable difficulties' — learning conditions that slow apparent progress but accelerate actual learning. In one study, students who used interleaved practice scored 43% higher on a delayed test than those using blocked practice, despite feeling less confident after learning. The brain forms stronger, more flexible representations when forced to discriminate between problem types rather than executing one type in bulk.",
  },
]

const MYTHS = [
  {
    myth: "Highlighting and underlining",
    verdict: "Does not work",
    detail: "Decades of research find highlighting has minimal benefit over reading without highlighting. It feels productive because it is active — but it is not retrieval. You are not learning; you are marking things you already read. If you must highlight, use it only as a retrieval cue: go back later and cover the text, try to recall what you highlighted, then check.",
  },
  {
    myth: "Re-reading",
    verdict: "Almost useless",
    detail: "Re-reading produces familiarity — not memory. When you read something again, it feels easier, which your brain interprets as 'I know this.' But recognition is not recall. In test conditions, students who re-read outperformed students who read once by almost nothing — while students who tested themselves dramatically outperformed both.",
  },
  {
    myth: "Massed practice (cramming)",
    verdict: "Works for tomorrow, gone in a week",
    detail: "Cramming produces enough short-term memory to pass an exam — then forgets the material almost entirely within days. This is why students 'study' the same things repeatedly every semester. Spaced repetition with the same amount of total time produces retention that lasts years, not days.",
  },
  {
    myth: "Learning styles (visual/auditory/kinesthetic)",
    verdict: "Not supported by evidence",
    detail: "The 'learning styles' theory — that people learn best through their preferred sensory modality — has been tested extensively and consistently fails to produce results. People have preferences, but those preferences do not translate into better learning outcomes when matched. Effective learning strategies work for everyone regardless of supposed style.",
  },
]

export default function MemoryTechniquesPage() {
  const [expanded, setExpanded] = useState<number | null>(0)
  const [expandedMyth, setExpandedMyth] = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Memory & Learning Techniques</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          5 evidence-based methods that actually work — and the common study habits that cognitive science has proven useless.
        </p>
      </div>

      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Most people were never taught how to learn.</strong> They use the strategies that feel
            productive — re-reading, highlighting, reviewing notes — which cognitive science consistently shows
            are among the least effective methods available. The 5 techniques below are backed by decades
            of research and used by the world's best learners. The effort to change your approach is real.
            The payoff is permanent.
          </p>
        </CardContent>
      </Card>

      {/* Techniques */}
      <div className="space-y-2">
        {TECHNIQUES.map((t, i) => {
          const isOpen = expanded === i
          return (
            <Card key={i} className="card-hover cursor-pointer overflow-hidden" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white text-xs font-bold", t.color)}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-snug">{t.tagline}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[9px]">Effort: {t.effort}</Badge>
                      <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-300">Payoff: {t.payoff}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t.what}</p>
                    <div>
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">How to do it</p>
                      <ol className="space-y-1">
                        {t.how.map((step, j) => (
                          <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                            <span className="text-emerald-500 font-bold shrink-0">{j + 1}.</span>{step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="rounded-lg bg-amber-50/50 border border-amber-200 p-2.5">
                      <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-0.5">When to use it</p>
                      <p className="text-xs text-amber-800">{t.whenToUse}</p>
                    </div>
                    <div className="rounded-lg bg-violet-50 border border-violet-200 p-2.5">
                      <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider mb-0.5">The science</p>
                      <p className="text-xs text-violet-700 leading-relaxed">{t.science}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Myths */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Why Common Study Habits Don't Work</p>
        <div className="space-y-2">
          {MYTHS.map((m, i) => {
            const isOpen = expandedMyth === i
            return (
              <Card key={i} className="card-hover cursor-pointer border-red-100" onClick={() => setExpandedMyth(isOpen ? null : i)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                    <p className="text-sm font-semibold flex-1">{m.myth}</p>
                    <Badge variant="outline" className="text-[9px] text-red-500 border-red-300 shrink-0">{m.verdict}</Badge>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed pl-7">{m.detail}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Start here:</strong> Download Anki tonight and make 10 flashcards on something you are learning.
            Before your next study session, spend 5 minutes doing active recall on the previous session before
            reading anything new. These two changes alone will outperform most people's study methods.
            The goal is not more time studying — it is smarter time studying.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/habit-science" className="text-sm text-violet-600 hover:underline">Habit Science</a>
        <a href="/reading" className="text-sm text-blue-600 hover:underline">Reading List</a>
        <a href="/focus" className="text-sm text-amber-600 hover:underline">Focus & Deep Work</a>
        <a href="/education" className="text-sm text-emerald-600 hover:underline">Education</a>
        <a href="/skills" className="text-sm text-rose-600 hover:underline">Skill Building</a>
      </div>
    </div>
  )
}
