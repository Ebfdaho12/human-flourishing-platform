"use client"

import { useState } from "react"
import useSWR from "swr"
import { Sparkles, CheckCircle, Brain, Lightbulb, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const INTEREST_LABELS: Record<string, { emoji: string; label: string }> = {
  wrestling: { emoji: "🤼", label: "Wrestling" },
  gaming: { emoji: "🎮", label: "Gaming" },
  sports: { emoji: "⚽", label: "Sports" },
  music: { emoji: "🎵", label: "Music" },
  cooking: { emoji: "🍳", label: "Cooking" },
  fitness: { emoji: "💪", label: "Fitness" },
  art: { emoji: "🎨", label: "Art" },
  movies: { emoji: "🎬", label: "Movies" },
  anime: { emoji: "⚡", label: "Anime" },
  cars: { emoji: "🚗", label: "Cars" },
  nature: { emoji: "🌿", label: "Nature" },
  travel: { emoji: "✈️", label: "Travel" },
  fashion: { emoji: "👗", label: "Fashion" },
  technology: { emoji: "💻", label: "Technology" },
  photography: { emoji: "📷", label: "Photography" },
  dance: { emoji: "💃", label: "Dance" },
  martial_arts: { emoji: "🥋", label: "Martial Arts" },
  skateboarding: { emoji: "🛹", label: "Skateboarding" },
  surfing: { emoji: "🏄", label: "Surfing" },
  fishing: { emoji: "🎣", label: "Fishing" },
  gardening: { emoji: "🌱", label: "Gardening" },
  crafts: { emoji: "🔨", label: "Crafts" },
  comedy: { emoji: "😂", label: "Comedy" },
  podcasts: { emoji: "🎙️", label: "Podcasts" },
  animals: { emoji: "🐾", label: "Animals" },
  space: { emoji: "🚀", label: "Space" },
  history_buff: { emoji: "📜", label: "History Buff" },
}

const LEARNING_TOPICS = [
  { id: "history", label: "History & Civilizations", icon: "📜" },
  { id: "economics", label: "Economics & Money", icon: "💰" },
  { id: "science", label: "Science & Nature", icon: "🔬" },
  { id: "politics", label: "Politics & Governance", icon: "🏛️" },
  { id: "mathematics", label: "Mathematics", icon: "📐" },
  { id: "psychology", label: "Psychology & Mind", icon: "🧠" },
  { id: "philosophy", label: "Philosophy", icon: "💭" },
  { id: "technology", label: "Technology & AI", icon: "💻" },
]

export default function PersonalizedLearningPage() {
  const { data, mutate } = useSWR("/api/education/personalized", fetcher)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const { data: analogyData } = useSWR(
    selectedTopic && data?.interests?.length > 0 ? `/api/education/personalized?topic=${selectedTopic}` : null,
    fetcher
  )

  const currentInterests: string[] = data?.interests ?? []
  const availableInterests: string[] = data?.availableInterests ?? Object.keys(INTEREST_LABELS)
  const hasProfile = currentInterests.length > 0

  function toggleInterest(interest: string) {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  }

  async function saveInterests() {
    setSaving(true)
    await fetch("/api/education/personalized", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests: selectedInterests }),
    })
    setSaving(false)
    mutate()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Personalized Learning</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Tell us what you're passionate about. We'll teach new subjects through the lens of what you already love.
        </p>
      </div>

      {/* Science explainer */}
      <Card className="border-violet-200 bg-violet-50/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Why this works</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Your brain learns by connecting new information to existing neural pathways. If you deeply understand
                wrestling, you already have thousands of mental models for competition, strategy, power dynamics,
                storytelling, and physical mechanics. We hook new subjects onto those existing pathways — so history
                feels like something you already know, not something foreign. Research shows analogical learning
                improves retention by 40-60% compared to traditional methods.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interest selection */}
      {!hasProfile || selectedInterests.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What are you passionate about?</CardTitle>
            <CardDescription>Select everything you genuinely enjoy. The more we know, the better the analogies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {availableInterests.map(interest => {
                const meta = INTEREST_LABELS[interest] ?? { emoji: "✨", label: interest }
                const isSelected = selectedInterests.includes(interest) || (selectedInterests.length === 0 && currentInterests.includes(interest))
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-all",
                      isSelected
                        ? "border-violet-400 bg-violet-100 text-violet-800 shadow-sm"
                        : "border-border hover:border-violet-200 hover:bg-violet-50/50"
                    )}
                  >
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                    {isSelected && <CheckCircle className="h-3.5 w-3.5 text-violet-500" />}
                  </button>
                )
              })}
            </div>
            {selectedInterests.length > 0 && (
              <Button onClick={saveInterests} disabled={saving} className="w-full">
                {saving ? "Saving..." : `Save ${selectedInterests.length} interests`}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Your interests: {currentInterests.map(i => INTEREST_LABELS[i]?.emoji ?? "✨").join(" ")} {currentInterests.map(i => INTEREST_LABELS[i]?.label ?? i).join(", ")}</p>
              <button onClick={() => setSelectedInterests(currentInterests)} className="text-xs text-violet-600 hover:underline mt-0.5">Edit interests</button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topic selection — only show if interests are set */}
      {hasProfile && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" /> What do you want to learn?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {LEARNING_TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={cn(
                  "rounded-xl border p-3 text-center transition-all",
                  selectedTopic === topic.id
                    ? "border-violet-400 bg-violet-50 shadow-sm"
                    : "border-border hover:border-violet-200"
                )}
              >
                <span className="text-2xl">{topic.icon}</span>
                <p className="text-xs font-medium mt-1">{topic.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Personalized analogies */}
      {analogyData?.analogies?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Learning {selectedTopic} through your interests
          </h2>
          {analogyData.analogies.map((group: any) => {
            const meta = INTEREST_LABELS[group.interest] ?? { emoji: "✨", label: group.interest }
            return (
              <Card key={group.interest} className="mb-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{meta.emoji}</span> Through the lens of {meta.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {group.analogies.map((analogy: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 rounded-lg border border-violet-100 bg-violet-50/30 p-3">
                        <Lightbulb className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                        <p className="text-sm leading-relaxed">{analogy}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
          <p className="text-xs text-muted-foreground text-center">
            {analogyData.tip}
          </p>
        </div>
      )}

      {analogyData && analogyData.analogies?.length === 0 && selectedTopic && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-amber-700">
              We don't have pre-built analogies for this combination yet.
              When AI tutoring is available, it will generate custom analogies connecting {selectedTopic} to your interests in real-time.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <a href="/education" className="text-sm text-violet-600 hover:underline">← Education</a>
        <a href="/education/paths" className="text-sm text-blue-600 hover:underline">Learning Paths →</a>
      </div>
    </div>
  )
}
