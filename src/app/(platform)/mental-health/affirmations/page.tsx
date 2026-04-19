"use client"

import { useState, useEffect } from "react"
import { Sparkles, RefreshCw, Heart, Share2, Volume2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const AFFIRMATIONS = [
  // Self-worth
  "I am enough, exactly as I am right now.",
  "My worth is not determined by my productivity.",
  "I deserve rest without earning it.",
  "I am allowed to take up space in this world.",
  "I am not my mistakes. I am what I learn from them.",

  // Growth
  "Every expert was once a beginner.",
  "I do not need to be perfect to be valuable.",
  "Small steps still move me forward.",
  "I am capable of figuring things out.",
  "My potential is not limited by my past.",

  // Resilience
  "Difficult days are not failed days.",
  "I have survived 100% of my worst days so far.",
  "Setbacks are setups for comebacks.",
  "I am stronger than I think and braver than I feel.",
  "This too shall pass, and I will be okay.",

  // Health
  "My body is doing its best for me. I will do my best for it.",
  "Taking care of myself is not selfish. It is necessary.",
  "I choose to fuel my body with what makes it feel good.",
  "Rest is not laziness. Rest is recovery.",
  "I listen to what my body needs.",

  // Mindset
  "I control my response, even when I cannot control the situation.",
  "Comparison is the thief of joy. My journey is my own.",
  "I release what I cannot change and focus on what I can.",
  "Today I choose progress over perfection.",
  "I am the author of my story, and I can write a new chapter anytime.",

  // Connection
  "I am worthy of love and belonging.",
  "Asking for help is a sign of strength, not weakness.",
  "I attract people who genuinely care about me.",
  "My vulnerability is my superpower.",
  "I do not need everyone to understand me. I understand me.",

  // Purpose
  "I am here for a reason, even when I cannot see it clearly.",
  "My contributions matter, even the small ones.",
  "The world needs what I have to offer.",
  "I am not behind. I am exactly where I need to be.",
  "Every day is a chance to begin again.",

  // Financial
  "I am capable of building financial security.",
  "Money is a tool. I am learning to use it wisely.",
  "I deserve abundance and I am working toward it.",
  "My financial past does not define my financial future.",

  // Learning
  "I am a lifelong learner and every day I grow.",
  "Not knowing something is not failure. It is an opportunity.",
  "I embrace confusion as the beginning of understanding.",
  "My curiosity is one of my greatest strengths.",
]

const CATEGORIES = [
  { name: "Self-Worth", color: "from-rose-400 to-pink-500", range: [0, 5] },
  { name: "Growth", color: "from-emerald-400 to-teal-500", range: [5, 10] },
  { name: "Resilience", color: "from-amber-400 to-orange-500", range: [10, 15] },
  { name: "Health", color: "from-cyan-400 to-blue-500", range: [15, 20] },
  { name: "Mindset", color: "from-violet-400 to-purple-500", range: [20, 25] },
  { name: "Connection", color: "from-pink-400 to-rose-500", range: [25, 30] },
  { name: "Purpose", color: "from-indigo-400 to-violet-500", range: [30, 35] },
  { name: "Financial", color: "from-green-400 to-emerald-500", range: [35, 39] },
  { name: "Learning", color: "from-blue-400 to-cyan-500", range: [39, 43] },
]

function speak(text: string) {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.85
    u.pitch = 1.05
    u.volume = 0.9
    const voices = speechSynthesis.getVoices()
    const preferred = voices.find(v => v.name.includes("Aria") || v.name.includes("Samantha") || v.name.includes("Google") && v.lang === "en-US")
    if (preferred) u.voice = preferred
    speechSynthesis.speak(u)
  }
}

export default function AffirmationsPage() {
  const [current, setCurrent] = useState(0)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [filterCat, setFilterCat] = useState<string | null>(null)

  useEffect(() => {
    // Random affirmation on load based on time of day
    const hour = new Date().getHours()
    let startRange = 0
    if (hour < 10) startRange = 0 // morning: self-worth, growth
    else if (hour < 14) startRange = 10 // midday: resilience, health
    else if (hour < 18) startRange = 20 // afternoon: mindset, connection
    else startRange = 30 // evening: purpose, reflection

    setCurrent(startRange + Math.floor(Math.random() * 5))
  }, [])

  function nextAffirmation() {
    if (filterCat) {
      const cat = CATEGORIES.find(c => c.name === filterCat)
      if (cat) {
        const range = cat.range
        const options = AFFIRMATIONS.slice(range[0], range[1])
        const randomIndex = range[0] + Math.floor(Math.random() * options.length)
        setCurrent(randomIndex)
        return
      }
    }
    setCurrent(Math.floor(Math.random() * AFFIRMATIONS.length))
  }

  function toggleFavorite() {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(current)) next.delete(current)
      else next.add(current)
      return next
    })
  }

  const currentCategory = CATEGORIES.find(c => current >= c.range[0] && current < c.range[1])

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Daily Affirmations</h1>
        </div>
        <p className="text-sm text-muted-foreground">{AFFIRMATIONS.length} affirmations across {CATEGORIES.length} categories. Read it. Believe it. Repeat it.</p>
      </div>

      {/* Main affirmation card */}
      <Card className={cn("overflow-hidden border-2", currentCategory ? "border-violet-200" : "border-border")}>
        <div className={cn("bg-gradient-to-r p-2 text-center", currentCategory?.color ?? "from-violet-500 to-purple-500")}>
          <p className="text-xs text-white/80 font-medium">{currentCategory?.name ?? "Affirmation"}</p>
        </div>
        <CardContent className="p-8 text-center">
          <p className="text-xl md:text-2xl font-medium leading-relaxed text-foreground">
            "{AFFIRMATIONS[current]}"
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="outline" size="sm" onClick={nextAffirmation}>
              <RefreshCw className="h-4 w-4" /> Next
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFavorite}>
              <Heart className={cn("h-4 w-4", favorites.has(current) ? "fill-rose-500 text-rose-500" : "")} />
              {favorites.has(current) ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => speak(AFFIRMATIONS[current])}>
              <Volume2 className="h-4 w-4" /> Hear it
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category filter */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Browse by category:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCat(null)}
            className={cn("rounded-full px-3 py-1 text-xs transition-colors", !filterCat ? "bg-violet-100 text-violet-700 font-medium" : "bg-muted text-muted-foreground")}
          >All</button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => { setFilterCat(cat.name); const idx = cat.range[0] + Math.floor(Math.random() * (cat.range[1] - cat.range[0])); setCurrent(idx) }}
              className={cn("rounded-full px-3 py-1 text-xs transition-colors", filterCat === cat.name ? "bg-violet-100 text-violet-700 font-medium" : "bg-muted text-muted-foreground")}
            >{cat.name}</button>
          ))}
        </div>
      </div>

      {/* Favorites */}
      {favorites.size > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Your favorites ({favorites.size}):</p>
          <div className="space-y-2">
            {[...favorites].map(idx => (
              <div key={idx} className="rounded-lg border border-rose-100 bg-rose-50/30 p-3 text-sm italic text-muted-foreground">
                "{AFFIRMATIONS[idx]}"
              </div>
            ))}
          </div>
        </div>
      )}

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The science:</strong> A 2016 study in Social Cognitive and Affective Neuroscience found that
            self-affirmation activates the ventromedial prefrontal cortex — the brain region involved in positive
            self-valuation and reward. Regular practice physically changes how your brain processes self-relevant
            information, making positive self-perception the default rather than the exception.
          </p>
        </CardContent>
      </Card>

      <a href="/mental-health" className="text-sm text-pink-600 hover:underline block">Back to Mental Health</a>
    </div>
  )
}
