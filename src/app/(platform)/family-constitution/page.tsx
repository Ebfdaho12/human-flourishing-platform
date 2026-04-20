"use client"

import { useState } from "react"
import { BookOpen, ChevronDown, Scroll, Users, DollarSign, Scale, GraduationCap, Star, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const SECTIONS = [
  {
    id: "values",
    icon: Star,
    label: "Core Family Values",
    badge: "Foundation",
    prompt: "What principles do we stand for as a family? What values do we want our children to have internalized by age 18?",
    guiding: [
      "If our children were asked in 20 years 'what did your family believe in?', what would we want them to say?",
      "What values do we both share? What was missing from our childhoods that we want to give our children?",
    ],
    example: "Example: 'We value honesty above comfort, generosity over accumulation, curiosity over certainty, and hard work over entitlement. We treat all people with dignity and leave things better than we found them.'",
  },
  {
    id: "traditions",
    icon: Scroll,
    label: "Family Traditions",
    badge: "Belonging",
    prompt: "What rituals, celebrations, and recurring practices define our family culture?",
    guiding: [
      "What weekly rituals create our family rhythm?",
      "How do we celebrate milestones and birthdays?",
      "What traditions do we carry forward, and which do we create anew?",
    ],
    example: "Example: 'Every Sunday is device-free family dinner with one topic chosen by a rotating family member. We celebrate birthdays with a handwritten letter. We camp once a year somewhere new.'",
  },
  {
    id: "money",
    icon: DollarSign,
    label: "Financial Principles",
    badge: "Wealth & Values",
    prompt: "What is our family's philosophy about money — earning it, spending it, saving it, and giving it?",
    guiding: [
      "What do we want our children to understand about money before they leave home?",
      "Allowance: at what age, and is it tied to chores or unconditional?",
      "How do we balance saving, spending, and giving as a family?",
    ],
    example: "Example: 'We live below our means and invest the difference. Allowance is earned. We give 10% to causes we believe in. We will fund education, not adult lifestyles. Money is discussed openly in this family.'",
  },
  {
    id: "decisions",
    icon: Scale,
    label: "Decision-Making Framework",
    badge: "Governance",
    prompt: "How do we make major decisions as a family? Who has a voice, and how do we resolve disagreement?",
    guiding: [
      "What decisions require both partners to agree?",
      "At what age do children have input on decisions that affect them?",
      "What is our process when we deeply disagree?",
    ],
    example: "Example: 'Decisions over $1,000 require both partners. Children over 10 have a voice (not a vote) on decisions that affect them. When we disagree, we each write our position before discussing. No major decisions under stress — 48-hour pause rule.'",
  },
  {
    id: "conflict",
    icon: Users,
    label: "Conflict Resolution",
    badge: "Repair Culture",
    prompt: "How do we fight fair? How do we repair? What are the rules of engagement in this family?",
    guiding: [
      "What behaviours are off the table in conflict (contempt, stonewalling)?",
      "How do we signal needing a break vs. shutting down?",
      "What does a genuine apology look like in our family?",
    ],
    example: "Example: 'No contempt, name-calling, or relitigating resolved issues. Either person can call a 20-minute break. We always repair before sleep. An apology includes acknowledgment, accountability, and a different choice — not just \"sorry.\"'",
  },
  {
    id: "education",
    icon: GraduationCap,
    label: "Education Philosophy",
    badge: "Growth",
    prompt: "What do we believe about learning, schooling, and raising capable humans?",
    guiding: [
      "What is education for — credentials, curiosity, capability, character?",
      "What do we want our children to know how to do before they leave home?",
      "How do we handle academic struggle or underperformance?",
    ],
    example: "Example: 'School is one input, not the whole of education. Our children will cook, manage money, and do hard things before leaving home. We value effort over outcome, curiosity over grades.'",
  },
  {
    id: "legacy",
    icon: BookOpen,
    label: "Legacy Vision",
    badge: "The Long View",
    prompt: "What do we want to have stood for? What mark do we want to leave?",
    guiding: [
      "At our funerals, what do we want our children to say about the family we built?",
      "What do we want to pass on to grandchildren — financially, culturally, spiritually?",
      "If one paragraph in a family history book 100 years from now described us, what would it say?",
    ],
    example: "Example: 'The [name] family believed people matter more than things, hard work is dignity, and generosity is the highest wealth. They built a home where children felt safe, loved, and expected to contribute.'",
  },
]

export default function FamilyConstitutionPage() {
  const [expanded, setExpanded] = useState<string | null>("values")
  const [notes, setNotes] = useState<Record<string, string>>({})

  const completed = Object.values(notes).filter(v => v.trim().length > 20).length

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Family Constitution</h1>
        </div>
        <p className="text-sm text-muted-foreground">The document your grandchildren will treasure. Write your family's values, traditions, financial principles, and legacy vision.</p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-medium text-amber-900">The most powerful families are intentional, not accidental.</p>
          <p className="text-sm text-amber-800 mt-1">A family constitution is a living document — a shared understanding of who you are and what you're building together. Takes 2–3 hours for a first draft; most families revise it annually.</p>
        </CardContent>
      </Card>

      {completed > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-muted rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${(completed / SECTIONS.length) * 100}%` }} /></div>
          <span className="text-xs text-muted-foreground">{completed}/{SECTIONS.length} sections</span>
        </div>
      )}

      <div className="space-y-3">
        {SECTIONS.map(section => {
          const Icon = section.icon
          const isOpen = expanded === section.id
          const hasContent = notes[section.id]?.trim().length > 20
          return (
            <Card key={section.id} className={cn("border", hasContent && "border-amber-300")}>
              <CardContent className="pt-0 pb-0">
                <button
                  onClick={() => setExpanded(isOpen ? null : section.id)}
                  className="w-full flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{section.label}</span>
                    <Badge variant="secondary" className="text-xs">{section.badge}</Badge>
                    {hasContent && <Badge className="text-xs bg-amber-100 text-amber-700">Written</Badge>}
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                  <div className="pb-4 space-y-4 border-t pt-4">
                    <div>
                      <p className="text-sm font-semibold mb-1">Central question</p>
                      <p className="text-sm text-muted-foreground italic">{section.prompt}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Guiding prompts</p>
                      <ul className="space-y-1">
                        {section.guiding.map((g, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-foreground">•</span>{g}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">{section.example}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">Your family's answer</p>
                      <textarea
                        value={notes[section.id] || ""}
                        onChange={e => setNotes(n => ({ ...n, [section.id]: e.target.value }))}
                        placeholder="Write your family's position here..."
                        className="w-full min-h-[100px] text-sm p-3 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/values" className="hover:underline text-foreground">Personal Values</a>
        <a href="/marriage-health" className="hover:underline text-foreground">Marriage Health</a>
        <a href="/parenting" className="hover:underline text-foreground">Parenting</a>
        <a href="/vision" className="hover:underline text-foreground">Life Vision</a>
      </div>
    </div>
  )
}
