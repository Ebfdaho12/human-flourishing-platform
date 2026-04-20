"use client"

import { useState } from "react"
import { Heart, RotateCcw, Clock, DollarSign, Star, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const DATE_IDEAS: { idea: string; cost: string; time: string; type: string; description: string }[] = [
  // Free / At Home
  { idea: "Cook a new recipe together", cost: "Free", time: "1-2 hrs", type: "At Home", description: "Pick a cuisine neither of you has tried. Cook it together. The mess is part of the fun." },
  { idea: "Backyard fire pit + conversation cards", cost: "Free", time: "1-2 hrs", type: "At Home", description: "No phones. Ask each other questions you have never asked. 'What is your happiest memory?' 'What scares you most?' 'Where do you see us in 10 years?'" },
  { idea: "Movie marathon (your era)", cost: "Free", time: "3-4 hrs", type: "At Home", description: "Watch the movies you loved when you first started dating. Nostalgia is a powerful reconnection tool." },
  { idea: "Living room dance night", cost: "Free", time: "1 hr", type: "At Home", description: "Put on music from your wedding or early relationship. Dance in your living room. It sounds cheesy. It works." },
  { idea: "Stargazing", cost: "Free", time: "1-2 hrs", type: "At Home", description: "Blanket in the backyard. Download a constellation app. Talk about the universe. Perspective changes everything." },
  { idea: "Write letters to each other", cost: "Free", time: "30 min", type: "At Home", description: "Write what you appreciate about each other. Read them aloud. Keep them. Read them when things get hard." },
  { idea: "Board game / card game night", cost: "Free", time: "1-2 hrs", type: "At Home", description: "Competitive or cooperative — both work. No phones. Just each other and some friendly competition." },
  { idea: "Dream planning session", cost: "Free", time: "1-2 hrs", type: "At Home", description: "Where do you want to be in 5 years? What house, what lifestyle, what experiences? Plan the dream together." },

  // Budget ($)
  { idea: "Sunrise coffee at a scenic spot", cost: "$5-$10", time: "1 hr", type: "Outdoors", description: "Wake up early, grab coffee, watch the sunrise from the best viewpoint in your area. The effort of waking up makes it special." },
  { idea: "Farmers market + picnic", cost: "$15-$30", time: "2-3 hrs", type: "Outdoors", description: "Browse a local farmers market, buy ingredients, make a picnic in the park. Fresh air, fresh food, no distractions." },
  { idea: "Hiking a new trail", cost: "Free-$10", time: "2-4 hrs", type: "Outdoors", description: "Find a trail neither of you has done. Moderate difficulty. The shared challenge creates bonding." },
  { idea: "Ice cream and a walk", cost: "$10-$15", time: "1-2 hrs", type: "Outdoors", description: "Simple. Classic. Walk and talk. Sometimes the best dates are the ones without a plan." },
  { idea: "Bookstore browse + coffee", cost: "$10-$30", time: "1-2 hrs", type: "Out", description: "Browse a bookstore together. Each pick a book for the other. Coffee after to discuss your choices." },
  { idea: "Free community event", cost: "Free", time: "2-3 hrs", type: "Out", description: "Concerts in the park, art walks, festivals, open mic nights. Check your city's events calendar." },

  // Bigger ($$$)
  { idea: "Cooking class together", cost: "$60-$120", time: "2-3 hrs", type: "Out", description: "Learn sushi, pasta, Thai, or pastry making together. You leave with a new skill and a shared memory." },
  { idea: "Day trip to a nearby town", cost: "$50-$100", time: "Full day", type: "Adventure", description: "Pick a town 1-2 hours away that neither of you has visited. Explore like tourists. Eat local." },
  { idea: "Hotel night (no kids)", cost: "$100-$200", time: "Overnight", description: "Even a basic hotel in your own city feels different. Sleep in. Room service breakfast. Reset.", type: "Adventure" },
  { idea: "Escape room", cost: "$50-$80", time: "1.5 hrs", type: "Out", description: "Solve puzzles together under pressure. Nothing reveals teamwork dynamics like an escape room." },
]

const TYPES = [...new Set(DATE_IDEAS.map(d => d.type))]

export default function DateNightsPage() {
  const [currentIdea, setCurrentIdea] = useState<number | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)

  function randomize() {
    const pool = filterType ? DATE_IDEAS.filter(d => d.type === filterType) : DATE_IDEAS
    setCurrentIdea(DATE_IDEAS.indexOf(pool[Math.floor(Math.random() * pool.length)]))
  }

  const filtered = filterType ? DATE_IDEAS.filter(d => d.type === filterType) : DATE_IDEAS

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Date Night Ideas</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Your relationship is the foundation your family is built on. Invest in it intentionally.
        </p>
      </div>

      {/* Random generator */}
      <Card className="border-2 border-rose-200 bg-rose-50/20">
        <CardContent className="p-5 text-center">
          {currentIdea !== null ? (
            <div>
              <p className="text-xs text-rose-500 uppercase tracking-wider font-semibold mb-2">Your date night:</p>
              <p className="text-xl font-bold mb-1">{DATE_IDEAS[currentIdea].idea}</p>
              <p className="text-xs text-muted-foreground mb-2">{DATE_IDEAS[currentIdea].description}</p>
              <div className="flex gap-3 justify-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {DATE_IDEAS[currentIdea].cost}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {DATE_IDEAS[currentIdea].time}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Hit the button for a random date idea</p>
          )}
          <Button onClick={randomize} className="mt-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white">
            <Sparkles className="h-4 w-4" /> {currentIdea !== null ? "Another One" : "Surprise Me"}
          </Button>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterType(null)}
          className={cn("text-xs rounded-full px-3 py-1 border",
            !filterType ? "bg-rose-100 border-rose-300 text-rose-700 font-semibold" : "border-border text-muted-foreground"
          )}>All ({DATE_IDEAS.length})</button>
        {TYPES.map(t => (
          <button key={t} onClick={() => setFilterType(filterType === t ? null : t)}
            className={cn("text-xs rounded-full px-3 py-1 border",
              filterType === t ? "bg-rose-100 border-rose-300 text-rose-700 font-semibold" : "border-border text-muted-foreground"
            )}>{t}</button>
        ))}
      </div>

      {/* All ideas */}
      <div className="space-y-2">
        {filtered.map((d, i) => (
          <Card key={i} className="card-hover">
            <CardContent className="p-3 flex items-start gap-3">
              <Heart className="h-4 w-4 text-rose-300 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{d.idea}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{d.description}</p>
                <div className="flex gap-3 mt-1">
                  <Badge variant="outline" className="text-[9px]">{d.type}</Badge>
                  <span className="text-[10px] text-muted-foreground">{d.cost} · {d.time}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-rose-200 bg-rose-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why date nights matter:</strong> The National Marriage Project found that couples who have a weekly
            date night are 3.5x more likely to report being &quot;very happy&quot; in their relationship. It does not have
            to be expensive — the act of prioritizing each other IS the investment. Put it on the calendar. Protect
            it like any other important appointment. Your children benefit most from parents who love each other well.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/relationships" className="text-sm text-rose-600 hover:underline">Relationships</a>
        <a href="/family-meeting" className="text-sm text-violet-600 hover:underline">Family Meeting</a>
        <a href="/budget" className="text-sm text-emerald-600 hover:underline">Budget Calculator</a>
      </div>
    </div>
  )
}
