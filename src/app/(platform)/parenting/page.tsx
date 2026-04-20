"use client"

import { useState } from "react"
import { Baby, Heart, Brain, BookOpen, ChevronDown, Users, Star, Clock, Monitor } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const AGES: {
  range: string
  label: string
  color: string
  milestones: string[]
  activities: string[]
  screenGuideline: string
  nutritionTip: string
  sleepNeeded: string
  parentTip: string
}[] = [
  {
    range: "0-12 months",
    label: "Infant",
    color: "from-pink-500 to-rose-600",
    milestones: ["Lifts head (2-3mo)", "Rolls over (4-6mo)", "Sits up (6-8mo)", "First words — 'mama', 'dada' (8-12mo)", "Crawls (7-10mo)", "Pulls to standing (9-12mo)"],
    activities: ["Tummy time (builds neck/core strength)", "Talk constantly — narrate everything you do", "Read board books (touch and feel)", "Sing — music is foundational for language", "Floor play — let them explore safely", "Peek-a-boo (teaches object permanence)"],
    screenGuideline: "ZERO screen time (AAP). Except video calls with family.",
    nutritionTip: "Breastmilk or formula exclusively until 6 months. Introduce solids at 6mo — start with iron-rich foods (pureed meat, fortified cereal). Allergenic foods (peanut butter, eggs) early reduces allergy risk.",
    sleepNeeded: "14-17 hours (newborn), 12-15 hours (4-12mo)",
    parentTip: "You cannot spoil a baby. Responding to cries builds secure attachment — the foundation of emotional health for life. Hold them as much as possible.",
  },
  {
    range: "1-3 years",
    label: "Toddler",
    color: "from-amber-500 to-orange-600",
    milestones: ["Walks (12-15mo)", "First sentences (18-24mo)", "Runs, climbs (2yr)", "250+ word vocabulary (2yr)", "Toilet training readiness (2-3yr)", "Imaginary play begins (2-3yr)"],
    activities: ["Sand, water, dirt — sensory play builds neural pathways", "Building blocks and stacking — spatial reasoning", "Coloring and painting (process, not product — the mess IS the learning)", "Nature walks — name everything: trees, birds, bugs", "Simple puzzles (3-6 pieces)", "Let them 'help' with cooking and cleaning (builds responsibility)"],
    screenGuideline: "Max 1 hour/day of high-quality programming with a parent present (PBS Kids, Sesame Street). No solo screen time. No screens during meals or before bed.",
    nutritionTip: "Picky eating is normal. Offer variety but don't force. It can take 15+ exposures before a toddler accepts a new food. Family meals at the table (no screens) — they learn by watching you eat.",
    sleepNeeded: "11-14 hours including naps",
    parentTip: "Tantrums are not misbehavior — they are overwhelm. A toddler's brain cannot regulate emotions yet. Stay calm, be present, name their emotion: 'You are frustrated because...' This teaches emotional vocabulary.",
  },
  {
    range: "4-6 years",
    label: "Preschool / Kindergarten",
    color: "from-green-500 to-emerald-600",
    milestones: ["Dresses independently (4-5yr)", "Writes own name (5yr)", "Counts to 20+ (5yr)", "Rides bike (5-6yr)", "Reads simple words (5-6yr)", "Understands rules and fairness (5-6yr)"],
    activities: ["Read together every day — 20 min changes everything", "Free play (unstructured, child-directed — the most important activity)", "Drawing, cutting, gluing — fine motor skills for writing", "Board games — turn-taking, counting, strategy, losing gracefully", "Outdoor exploration — build forts, dig, climb trees", "Cooking together — measuring = math, following steps = executive function"],
    screenGuideline: "1-2 hours max. Prioritize creative apps (drawing, building) over passive watching. Co-view when possible. No screens in bedroom.",
    nutritionTip: "Involve them in food prep — children eat what they help make. Teach where food comes from (garden, farm). Limit juice (water is better). Don't use food as reward or punishment.",
    sleepNeeded: "10-13 hours",
    parentTip: "This age is when values are absorbed, not taught. They learn by watching YOU — how you treat people, handle frustration, keep promises. What you DO matters 10x more than what you SAY.",
  },
  {
    range: "7-12 years",
    label: "Elementary / Preteen",
    color: "from-blue-500 to-indigo-600",
    milestones: ["Abstract thinking begins (8-10yr)", "Reads chapter books (8yr)", "Social awareness and peer pressure (9-12yr)", "Puberty begins (10-12yr)", "Developing sense of identity (10-12yr)", "Can handle real responsibility (chores, money, time management)"],
    activities: ["Sports or physical activity (team sports teach cooperation, individual sports teach discipline)", "Musical instrument (proven to improve math, reading, and executive function)", "Real responsibilities — chores, pet care, managing an allowance", "Family discussions about current events (age-appropriate)", "Projects — building things, science experiments, gardening", "Social time with peers (supervised but not micromanaged)"],
    screenGuideline: "2 hours recreational max. Distinguish between productive (coding, learning, creating) and passive (scrolling, watching). No phone before 13 (Wait Until 8th movement). No social media before 15.",
    nutritionTip: "Teach them to cook simple meals. This is the age where food independence starts. Make healthy food the default, not the rule — they rebel against rules but accept defaults.",
    sleepNeeded: "9-12 hours",
    parentTip: "Start having real conversations. Ask 'What was the hardest part of your day?' instead of 'How was school?' (which gets 'Fine'). Listen more than you advise. This is when they decide whether they trust you enough to come to you as teens.",
  },
  {
    range: "13-17 years",
    label: "Teenager",
    color: "from-violet-500 to-purple-600",
    milestones: ["Identity formation (who am I?)", "Risk-taking behavior increases (brain development)", "Romantic interest begins", "Abstract and moral reasoning", "Increasing independence", "Career/future thinking begins"],
    activities: ["Part-time work (teaches responsibility, money management, real-world skills)", "Volunteer work (builds empathy and perspective)", "Financial literacy — open a bank account, budget their money, learn about investing", "Teach them to cook 10 meals from scratch (they need this for independence)", "Encourage passion projects — what they pursue outside of school reveals their real interests", "Physical activity (critical for mental health during high-stress teen years)"],
    screenGuideline: "Social media is the biggest risk. Delay as long as possible — every study shows it harms teen mental health, especially girls. If they have it: no phones in bedrooms at night, open conversation about what they see, model healthy phone use yourself.",
    nutritionTip: "They will eat junk with friends — that is normal. Make home the place where good food is available and easy. Teach them to meal prep for the week. This skill saves them thousands of dollars in their 20s.",
    sleepNeeded: "8-10 hours (they need MORE sleep than you think — their brain is doing massive development)",
    parentTip: "Your job shifts from director to consultant. They will make mistakes — that is how they learn. Be the safe place they can come to when things go wrong, not the judge they hide from. The relationship you built in earlier years pays off NOW.",
  },
]

const CONVERSATION_STARTERS = [
  { age: "3-5", questions: ["What made you laugh today?", "If you could be any animal, what would you be?", "What is your favorite thing about our family?", "What are you most excited about tomorrow?"] },
  { age: "6-10", questions: ["What was the best part of your day? What was the hardest?", "If you could change one rule at school, what would it be?", "Who did you play with today? What did you do?", "What is something you learned today that surprised you?"] },
  { age: "11-14", questions: ["What is something you wish adults understood about being your age?", "If you could master any skill instantly, what would it be?", "What is something you are proud of that nobody knows about?", "Is there anything you are worried about that I can help with?"] },
  { age: "15-17", questions: ["What kind of life do you want to build for yourself?", "What is the biggest pressure you feel right now?", "Is there anything you wish we talked about more?", "What is one thing you think I do well as a parent? One thing I could improve?"] },
]

export default function ParentingPage() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
            <Baby className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Parenting Resources</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Age-by-age guide: milestones, activities, screen time, nutrition, sleep, and the one thing that matters most at each stage.
        </p>
      </div>

      {/* Age stages */}
      <div className="space-y-3">
        {AGES.map((a, i) => {
          const isOpen = expanded === i
          return (
            <Card key={i} className="card-hover cursor-pointer overflow-hidden" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white text-xs font-bold", a.color)}>
                    {a.range.split(" ")[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{a.label}</p>
                    <p className="text-[10px] text-muted-foreground">{a.range}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Star className="h-3 w-3" /> Milestones</p>
                      <div className="flex flex-wrap gap-1.5">
                        {a.milestones.map((m, j) => (
                          <Badge key={j} variant="outline" className="text-[10px]">{m}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1"><Brain className="h-3 w-3" /> Best Activities</p>
                      <ul className="space-y-0.5">
                        {a.activities.map((act, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-emerald-400 shrink-0">-</span>{act}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-blue-50 border border-blue-200 p-2">
                        <p className="text-[10px] font-semibold text-blue-700 flex items-center gap-1"><Monitor className="h-3 w-3" /> Screen Time</p>
                        <p className="text-[10px] text-blue-600 mt-0.5">{a.screenGuideline}</p>
                      </div>
                      <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-2">
                        <p className="text-[10px] font-semibold text-indigo-700 flex items-center gap-1"><Clock className="h-3 w-3" /> Sleep Needed</p>
                        <p className="text-[10px] text-indigo-600 mt-0.5">{a.sleepNeeded}</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
                      <p className="text-[10px] font-semibold text-amber-700">Nutrition</p>
                      <p className="text-[10px] text-amber-600 mt-0.5">{a.nutritionTip}</p>
                    </div>
                    <div className="rounded-lg bg-rose-50 border border-rose-200 p-2">
                      <p className="text-[10px] font-semibold text-rose-700 flex items-center gap-1"><Heart className="h-3 w-3" /> The Most Important Thing</p>
                      <p className="text-xs text-rose-700 mt-0.5">{a.parentTip}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Conversation starters */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-violet-500" /> Conversation Starters by Age
        </CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {CONVERSATION_STARTERS.map((c, i) => (
            <div key={i}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Ages {c.age}</p>
              <div className="space-y-1">
                {c.questions.map((q, j) => (
                  <p key={j} className="text-xs text-muted-foreground italic flex gap-2">
                    <span className="text-violet-400 shrink-0">"</span>{q}"
                  </p>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-rose-200 bg-rose-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The one thing every study agrees on:</strong> The quality of the parent-child relationship
            predicts outcomes better than income, education, neighborhood, or school quality. A child who feels
            genuinely seen, heard, and loved by at least one adult will be okay — even in difficult circumstances.
            Your presence is the most powerful intervention that exists. Everything on this page is secondary to that.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/family-meeting" className="text-sm text-violet-600 hover:underline">Family Meeting</a>
        <a href="/screen-time" className="text-sm text-blue-600 hover:underline">Screen Time</a>
        <a href="/kids-chores" className="text-sm text-amber-600 hover:underline">Kids Chores</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
        <a href="/reading" className="text-sm text-emerald-600 hover:underline">Reading List</a>
      </div>
    </div>
  )
}
