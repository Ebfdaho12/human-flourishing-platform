"use client"

import { useState } from "react"
import { BookOpen, ChevronDown, Brain, Heart, Sparkles, DollarSign, Users, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

interface Book { emoji: string; title: string; author: string; summary: string; takeaways: string[]; links: { label: string; href: string }[] }

const categories: { title: string; color: string; icon: React.ReactNode; books: Book[] }[] = [
  {
    title: "Thinking", color: "violet", icon: <Brain className="h-4 w-4" />,
    books: [
      { emoji: "🧠", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", summary: "The definitive work on the two systems that drive how we think — fast intuition and slow deliberation — and how each leads us astray in predictable ways.", takeaways: ["System 1 (fast) handles 95% of decisions automatically — and gets many of them wrong", "Anchoring, loss aversion, and framing effects shape every financial and life decision you make", "Overconfidence is the most dangerous bias: experts are often no better than dart-throwing chimps", "Pre-mortems beat post-mortems — imagine failure before it happens"], links: [{ label: "Mental Models", href: "/mental-models" }, { label: "Cognitive Biases", href: "/cognitive-biases" }, { label: "Decision Journal", href: "/decision-journal" }] },
      { emoji: "📚", title: "Poor Charlie's Almanack", author: "Charlie Munger", summary: "The collected wisdom of Warren Buffett's partner — a masterclass in multidisciplinary thinking, mental models, and the art of consistently not being stupid.", takeaways: ["Invert, always invert — avoid stupidity instead of seeking brilliance", "Build a latticework of mental models from every major discipline", "The best investment you can make is in your own learning machine", "Avoid ideology like poison — it rots the mind from the inside"], links: [{ label: "Mental Models", href: "/mental-models" }, { label: "Investing", href: "/investing" }, { label: "Cognitive Biases", href: "/cognitive-biases" }] },
      { emoji: "💡", title: "The Art of Thinking Clearly", author: "Rolf Dobelli", summary: "99 short chapters, each exposing a cognitive error that costs you money, time, or happiness. A practical field guide to cleaner thinking.", takeaways: ["Survivorship bias makes success look easier than it is — study failures too", "The sunk cost fallacy keeps you in bad jobs, relationships, and investments", "Social proof makes crowds powerful and dangerous simultaneously", "Action bias causes more harm than inaction in most complex situations"], links: [{ label: "Cognitive Biases", href: "/cognitive-biases" }, { label: "Scientific Literacy", href: "/scientific-literacy" }] },
    ],
  },
  {
    title: "Health", color: "green", icon: <Heart className="h-4 w-4" />,
    books: [
      { emoji: "😴", title: "Why We Sleep", author: "Matthew Walker", summary: "Sleep is the single most effective thing you can do for brain and body health. Walker makes the case that sleep deprivation is a slow-motion catastrophe hiding in plain sight.", takeaways: ["Less than 7 hours of sleep demolishes immune function, memory, and emotional regulation", "Drowsy driving kills more people than alcohol and drugs combined", "REM sleep is when your brain processes emotions and consolidates learning", "No pill, supplement, or hack replaces actual sleep — it is non-negotiable"], links: [{ label: "Sleep Optimization", href: "/sleep" }, { label: "Body Composition", href: "/body-composition" }] },
      { emoji: "🧬", title: "Anatomy Trains", author: "Thomas Myers", summary: "The body is not a collection of separate muscles — it is a continuous web of fascia. Understanding these myofascial meridians changes how you train, stretch, and heal.", takeaways: ["Fascia connects everything — a tight foot can cause a headache", "Posture is a whole-body pattern, not a single muscle problem", "Chronic pain often originates far from where you feel it", "Movement variety matters more than movement volume"], links: [{ label: "Fascia & Flexibility", href: "/fascia" }, { label: "Posture", href: "/posture" }] },
      { emoji: "⚡", title: "Dopamine Nation", author: "Anna Lembke", summary: "Modern life is a dopamine trap. Lembke explains how the pleasure-pain balance works and why the path to lasting satisfaction runs through voluntary discomfort.", takeaways: ["Pleasure and pain are processed in the same brain region — they operate like a balance", "Chronic overstimulation leads to a dopamine deficit state that feels like depression", "A 30-day dopamine fast can reset your baseline", "Cold exposure, exercise, and fasting restore healthy dopamine function"], links: [{ label: "Dopamine Guide", href: "/dopamine" }, { label: "Anxiety Toolkit", href: "/anxiety-toolkit" }] },
      { emoji: "🌬️", title: "Breath", author: "James Nestor", summary: "How you breathe affects every system in your body. Nestor's research journey reveals that most modern humans breathe wrong — and the fix is simple.", takeaways: ["Mouth breathing causes sleep apnea, anxiety, crooked teeth, and chronic inflammation", "Nasal breathing produces nitric oxide, which fights infection and lowers blood pressure", "Slow breathing (5.5 breaths/min) optimizes heart rate variability and nervous system balance", "Ancient breathwork practices have measurable, dramatic physiological effects"], links: [{ label: "Breathwork", href: "/breathwork" }, { label: "Fascia & Flexibility", href: "/fascia" }] },
      { emoji: "🔬", title: "Lifespan", author: "David Sinclair", summary: "Aging is a disease — and it is treatable. Sinclair presents the science of why we age and the emerging interventions that could dramatically extend healthy lifespan.", takeaways: ["Aging is driven by epigenetic information loss, not just genetic damage", "Caloric restriction and fasting activate longevity genes (sirtuins)", "NMN, resveratrol, and metformin are among the most promising longevity compounds", "Cold exposure and exercise are the two most proven anti-aging interventions available today"], links: [{ label: "Fasting Guide", href: "/fasting" }, { label: "Supplements", href: "/supplements" }] },
    ],
  },
  {
    title: "Habits & Psychology", color: "amber", icon: <Sparkles className="h-4 w-4" />,
    books: [
      { emoji: "⚛️", title: "Atomic Habits", author: "James Clear", summary: "Tiny changes compound into remarkable results. Clear provides a complete system for building good habits and breaking bad ones by focusing on identity, systems, and environment.", takeaways: ["1% better every day = 37x better in one year. 1% worse = nearly zero", "You do not rise to the level of your goals — you fall to the level of your systems", "Habit stacking: attach new habits to existing ones for automatic triggers", "Make good habits obvious, attractive, easy, and satisfying"], links: [{ label: "Daily Habits", href: "/daily-habits" }, { label: "30-Day Challenges", href: "/30-day-challenges" }] },
      { emoji: "🏛️", title: "Meditations", author: "Marcus Aurelius", summary: "Private journal entries from the most powerful man in the world, written not for publication but for self-improvement. The foundational text of practical Stoicism.", takeaways: ["You control your mind, not outside events — realize this and you find strength", "Memento mori: remembering death clarifies what actually matters", "The obstacle is the way — every difficulty is training for your character", "Compare yourself only to who you were yesterday, never to others"], links: [{ label: "Stoicism", href: "/stoicism" }, { label: "Evening Review", href: "/evening-review" }] },
      { emoji: "🕯️", title: "Man's Search for Meaning", author: "Viktor Frankl", summary: "A Holocaust survivor's account of finding purpose in the worst conditions imaginable. Frankl proves that meaning — not pleasure — is what sustains the human spirit.", takeaways: ["Those who had a 'why' to live survived conditions that broke others", "You cannot control what happens to you, but you can control your response", "Meaning comes from three sources: work, love, and courage in suffering", "The last of human freedoms is choosing one's attitude in any circumstance"], links: [{ label: "Stoicism", href: "/stoicism" }, { label: "Mental Health", href: "/mental-health" }] },
      { emoji: "🌅", title: "The Power of Now", author: "Eckhart Tolle", summary: "Most suffering is created by the mind replaying the past or fearing the future. Tolle teaches presence — the practice of anchoring awareness in the only moment that exists.", takeaways: ["The present moment is the only thing that is real — past and future exist only in thought", "The 'pain body' feeds on negative thinking and seeks out drama", "Watching your thoughts without identifying with them dissolves anxiety", "Consciousness is not the same as thinking — you can be aware without narrating"], links: [{ label: "Breathwork", href: "/breathwork" }, { label: "Anxiety Toolkit", href: "/anxiety-toolkit" }] },
    ],
  },
  {
    title: "Wealth", color: "emerald", icon: <DollarSign className="h-4 w-4" />,
    books: [
      { emoji: "💰", title: "The Psychology of Money", author: "Morgan Housel", summary: "Financial success is not about intelligence — it is about behavior. Housel reveals how emotions, ego, and personal history shape every money decision you make.", takeaways: ["Wealth is what you don't see — it is the money you don't spend", "Compounding is the single most powerful force in finance and it requires patience above all", "Getting wealthy and staying wealthy are completely different skills", "Room for error is the most underrated financial concept"], links: [{ label: "Financial Independence", href: "/financial-independence" }, { label: "Compound Interest", href: "/compound-interest" }] },
      { emoji: "🏠", title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", summary: "The book that taught a generation the difference between assets and liabilities. Controversial in specifics but transformative in shifting how you think about money and work.", takeaways: ["Assets put money in your pocket; liabilities take money out — most people confuse them", "The rich don't work for money — they make money work for them", "Financial literacy is not taught in schools, which keeps most people on the treadmill", "Mind your own business: build assets outside your day job"], links: [{ label: "Financial Literacy", href: "/financial-literacy" }, { label: "Budget", href: "/budget" }] },
      { emoji: "🧭", title: "The Almanack of Naval Ravikant", author: "Eric Jorgenson", summary: "A curated collection of Naval's wisdom on building wealth without getting lucky and finding happiness without depending on external circumstances.", takeaways: ["Seek wealth (assets that earn while you sleep), not money or status", "Arm yourself with specific knowledge, accountability, and leverage", "Code and media are permissionless leverage — use them", "A calm mind, a fit body, and a house full of love cannot be bought — they must be earned"], links: [{ label: "Wealth", href: "/financial-independence" }, { label: "Mental Models", href: "/mental-models" }] },
    ],
  },
  {
    title: "Relationships", color: "rose", icon: <Users className="h-4 w-4" />,
    books: [
      { emoji: "🗣️", title: "Nonviolent Communication", author: "Marshall Rosenberg", summary: "A framework for expressing needs without blame and hearing others without defensiveness. Transforms conflict into connection by separating observations from evaluations.", takeaways: ["Observe without evaluating — 'You're always late' vs. 'You arrived at 9:15 the last three times'", "Identify and express feelings tied to unmet needs, not accusations", "Make specific, actionable requests instead of vague demands", "Empathic listening means reflecting feelings, not offering solutions"], links: [{ label: "Communication", href: "/communication" }, { label: "Conflict Resolution", href: "/conflict-resolution" }] },
      { emoji: "🔗", title: "Attached", author: "Amir Levine & Rachel Heller", summary: "Attachment theory applied to adult relationships. Understanding your attachment style (secure, anxious, or avoidant) explains most of your relationship patterns.", takeaways: ["Three attachment styles shape every romantic relationship: secure, anxious, avoidant", "Anxious-avoidant pairings are the most common and most painful dynamic", "Secure people are not boring — they are the gold standard for healthy love", "You can earn secure attachment through awareness and deliberate practice"], links: [{ label: "Relationships", href: "/relationships" }, { label: "Communication", href: "/communication" }] },
      { emoji: "💍", title: "The Seven Principles for Making Marriage Work", author: "John Gottman", summary: "Decades of research distilled into the specific behaviors that predict whether a marriage thrives or dies. Gottman can predict divorce with 94% accuracy.", takeaways: ["The Four Horsemen (criticism, contempt, defensiveness, stonewalling) predict divorce", "A 5:1 ratio of positive to negative interactions predicts relationship stability", "Friendship and fondness are the foundation — not passion", "Turning toward your partner's bids for connection is the single most important habit"], links: [{ label: "Marriage Health", href: "/marriage-health" }, { label: "Communication", href: "/communication" }] },
    ],
  },
  {
    title: "Society", color: "blue", icon: <Globe className="h-4 w-4" />,
    books: [
      { emoji: "🌍", title: "Sapiens", author: "Yuval Noah Harari", summary: "The story of how an unremarkable ape conquered the planet. Harari argues that our superpower is collective fiction — money, religion, nations, and corporations are all shared stories.", takeaways: ["Humans dominate because we can cooperate flexibly in large numbers through shared myths", "The Agricultural Revolution may have been history's biggest fraud — it made life harder for individuals", "Money is the most universal and efficient system of mutual trust ever invented", "We are far more powerful than our ancestors but not measurably happier"], links: [{ label: "Civilizations", href: "/civilizations" }, { label: "Philosophy", href: "/philosophy" }] },
      { emoji: "📊", title: "The Changing World Order", author: "Ray Dalio", summary: "Dalio studies the rise and fall of reserve currencies and empires over 500 years, revealing patterns that predict which nations rise next and why the current order is shifting.", takeaways: ["Every empire follows a predictable cycle: rise, top, decline, replacement", "The three big forces: debt/money cycles, internal conflict, and external power shifts", "Education, innovation, and rule of law drive a nation's ascent; inequality and debt drive its decline", "Understanding where your country sits in the cycle changes every long-term decision you make"], links: [{ label: "Canada Analysis", href: "/canada" }, { label: "Economics", href: "/economics" }] },
    ],
  },
]

const colorMap: Record<string, { badge: string; border: string; bg: string; text: string }> = {
  violet: { badge: "bg-violet-100 text-violet-700", border: "border-violet-200", bg: "bg-violet-50/30", text: "text-violet-600" },
  green: { badge: "bg-green-100 text-green-700", border: "border-green-200", bg: "bg-green-50/30", text: "text-green-600" },
  amber: { badge: "bg-amber-100 text-amber-700", border: "border-amber-200", bg: "bg-amber-50/30", text: "text-amber-600" },
  emerald: { badge: "bg-emerald-100 text-emerald-700", border: "border-emerald-200", bg: "bg-emerald-50/30", text: "text-emerald-600" },
  rose: { badge: "bg-rose-100 text-rose-700", border: "border-rose-200", bg: "bg-rose-50/30", text: "text-rose-600" },
  blue: { badge: "bg-blue-100 text-blue-700", border: "border-blue-200", bg: "bg-blue-50/30", text: "text-blue-600" },
}

export default function BookLibraryPage() {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setOpen(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">The Essential Library</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          The books that inform this platform and can transform your thinking.
        </p>
      </div>

      {categories.map(cat => {
        const c = colorMap[cat.color]
        return (
          <div key={cat.title} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", c.badge)}>{cat.icon}</span>
              <h2 className="text-sm font-bold">{cat.title}</h2>
              <Badge variant="outline" className={cn("text-[9px]", c.badge)}>{cat.books.length} books</Badge>
            </div>
            {cat.books.map((b, i) => {
              const key = `${cat.title}-${i}`
              const isOpen = open[key]
              return (
                <Card key={key} className={cn("transition-all cursor-pointer", isOpen && c.border)} onClick={() => toggle(key)}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
                      <span className="text-base">{b.emoji}</span>
                      <div className="min-w-0">
                        <span className="text-sm font-semibold">{b.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">by {b.author}</span>
                      </div>
                    </div>
                    {isOpen && (
                      <div className={cn("mt-3 ml-8 space-y-3 rounded-lg p-3 text-xs leading-relaxed", c.bg)}>
                        <p className="text-muted-foreground">{b.summary}</p>
                        <div>
                          <strong className={c.text}>Key takeaways:</strong>
                          <ul className="mt-1 space-y-1 list-disc list-inside text-muted-foreground">{b.takeaways.map((t, ti) => <li key={ti}>{t}</li>)}</ul>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <strong className={cn(c.text, "shrink-0")}>Connected pages:</strong>
                          {b.links.map(l => <a key={l.href} href={l.href} className={cn("underline", c.text)} onClick={e => e.stopPropagation()}>{l.label}</a>)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      })}

      <div className="flex gap-3 flex-wrap">
        <a href="/mental-models" className="text-sm text-violet-600 hover:underline">Mental Models</a>
        <a href="/cognitive-biases" className="text-sm text-red-600 hover:underline">Cognitive Biases</a>
        <a href="/negotiation-guide" className="text-sm text-emerald-600 hover:underline">Negotiation Guide</a>
        <a href="/daily-habits" className="text-sm text-amber-600 hover:underline">Daily Habits</a>
        <a href="/stoicism" className="text-sm text-stone-600 hover:underline">Stoicism</a>
      </div>
    </div>
  )
}