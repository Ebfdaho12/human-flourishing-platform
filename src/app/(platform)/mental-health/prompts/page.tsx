"use client"

import { useState } from "react"
import useSWR from "swr"
import { BookOpen, Sparkles, RefreshCw, PenTool, Heart, Brain, TrendingUp, Users, Shield, Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const CATEGORY_META: Record<string, { icon: any; color: string; bg: string }> = {
  Gratitude: { icon: Heart, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  "Self-Awareness": { icon: Brain, color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
  "Stress Relief": { icon: Shield, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  Growth: { icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  Relationships: { icon: Users, color: "text-pink-600", bg: "bg-pink-50 border-pink-200" },
  Values: { icon: Sparkles, color: "text-teal-600", bg: "bg-teal-50 border-teal-200" },
  Processing: { icon: Flame, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
}

export default function JournalPromptsPage() {
  const { data, mutate } = useSWR("/api/mental-health/prompts", fetcher)
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null)
  const [journalText, setJournalText] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  if (!data) return <div className="p-8 text-center text-muted-foreground">Loading prompts...</div>

  const { todayPrompt, allPrompts, categories } = data
  const filtered = filterCategory ? allPrompts.filter((p: any) => p.category === filterCategory) : allPrompts

  async function saveJournalEntry() {
    if (!journalText.trim() || !selectedPrompt) return
    setSaving(true)
    await fetch("/api/mental-health/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Prompt: ${selectedPrompt.prompt.slice(0, 50)}...`,
        content: journalText,
      }),
    })
    setSaving(false)
    setSaved(true)
    setJournalText("")
    setTimeout(() => { setSaved(false); setSelectedPrompt(null) }, 2000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <PenTool className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Journal Prompts</h1>
        </div>
        <p className="text-sm text-muted-foreground">Guided writing prompts for self-reflection. {allPrompts.length} prompts across {categories.length} categories.</p>
      </div>

      {/* Today's prompt */}
      {!selectedPrompt && (
        <Card className={cn("border-2", CATEGORY_META[todayPrompt.category]?.bg ?? "bg-violet-50 border-violet-200")}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">Today's Prompt</p>
              <Badge variant="outline" className="text-[10px]">{todayPrompt.category}</Badge>
            </div>
            <p className="text-lg font-medium leading-relaxed">{todayPrompt.prompt}</p>
            <Button className="mt-4" onClick={() => setSelectedPrompt(todayPrompt)}>
              <PenTool className="h-4 w-4" /> Write about this
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Writing area */}
      {selectedPrompt && (
        <Card className="border-violet-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Responding to prompt</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedPrompt(null); setJournalText("") }}>
                Choose different prompt
              </Button>
            </div>
            <CardDescription className="font-medium text-foreground">{selectedPrompt.prompt}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Start writing... there's no wrong answer. This is for you."
              className="min-h-[200px]"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{journalText.length} characters</p>
              <Button onClick={saveJournalEntry} disabled={saving || !journalText.trim()}>
                {saving ? "Saving..." : saved ? "Saved!" : "Save to journal"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category filter */}
      {!selectedPrompt && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterCategory === null ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setFilterCategory(null)}
            >All</Button>
            {categories.map((cat: string) => {
              const meta = CATEGORY_META[cat]
              const Icon = meta?.icon ?? BookOpen
              return (
                <Button
                  key={cat}
                  variant={filterCategory === cat ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setFilterCategory(cat)}
                >
                  <Icon className="h-3 w-3" /> {cat}
                </Button>
              )
            })}
          </div>

          {/* All prompts */}
          <div className="space-y-2">
            {filtered.map((prompt: any, i: number) => {
              const meta = CATEGORY_META[prompt.category] ?? CATEGORY_META.Growth
              const Icon = meta.icon
              return (
                <Card
                  key={i}
                  className={cn("card-hover cursor-pointer", meta.bg)}
                  onClick={() => setSelectedPrompt(prompt)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", meta.color)} />
                    <div className="flex-1">
                      <p className="text-sm">{prompt.prompt}</p>
                      <Badge variant="outline" className="text-[9px] mt-2">{prompt.category}</Badge>
                    </div>
                    <PenTool className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}

      <a href="/mental-health" className="text-sm text-pink-600 hover:underline block">← Mental Health</a>
    </div>
  )
}
