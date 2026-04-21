"use client"

import { useState, useMemo } from "react"
import { Star, Users, TrendingUp, AlertTriangle, Heart, Zap, Shield, Brain, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const ANIMALS = [
  { name: "Rat", emoji: "🐀", element: "Water", years: [1924,1936,1948,1960,1972,1984,1996,2008,2020], traits: "Resourceful, quick-witted, adaptable, charming. Natural strategists. Can be opportunistic.", yin: false },
  { name: "Ox", emoji: "🐂", element: "Earth", years: [1925,1937,1949,1961,1973,1985,1997,2009,2021], traits: "Dependable, patient, methodical, strong. Builds slowly but solidly. Can be stubborn.", yin: true },
  { name: "Tiger", emoji: "🐅", element: "Wood", years: [1926,1938,1950,1962,1974,1986,1998,2010,2022], traits: "Brave, competitive, confident, magnetic. Natural leaders. Can be impulsive and domineering.", yin: false },
  { name: "Rabbit", emoji: "🐇", element: "Wood", years: [1927,1939,1951,1963,1975,1987,1999,2011,2023], traits: "Gentle, elegant, diplomatic, perceptive. Conflict-averse peacemakers. Can avoid hard truths.", yin: true },
  { name: "Dragon", emoji: "🐉", element: "Earth", years: [1928,1940,1952,1964,1976,1988,2000,2012,2024], traits: "Ambitious, energetic, fearless, charismatic. High expectations of self and others. Can be arrogant.", yin: false },
  { name: "Snake", emoji: "🐍", element: "Fire", years: [1929,1941,1953,1965,1977,1989,2001,2013,2025], traits: "Wise, intuitive, analytical, private. Deep thinkers. Can be secretive and distrustful.", yin: true },
  { name: "Horse", emoji: "🐎", element: "Fire", years: [1930,1942,1954,1966,1978,1990,2002,2014,2026], traits: "Energetic, free-spirited, adventurous, sociable. Need independence. Can be restless and uncommitted.", yin: false },
  { name: "Goat", emoji: "🐐", element: "Earth", years: [1931,1943,1955,1967,1979,1991,2003,2015,2027], traits: "Creative, empathetic, gentle, artistic. Need security and harmony. Can be indecisive.", yin: true },
  { name: "Monkey", emoji: "🐒", element: "Metal", years: [1932,1944,1956,1968,1980,1992,2004,2016,2028], traits: "Clever, inventive, playful, versatile. Problem-solvers. Can be manipulative and restless.", yin: false },
  { name: "Rooster", emoji: "🐓", element: "Metal", years: [1933,1945,1957,1969,1981,1993,2005,2017,2029], traits: "Observant, hardworking, honest, direct. Perfectionists. Can be critical and inflexible.", yin: true },
  { name: "Dog", emoji: "🐕", element: "Earth", years: [1934,1946,1958,1970,1982,1994,2006,2018,2030], traits: "Loyal, honest, protective, reliable. Deeply principled. Can be anxious and pessimistic.", yin: false },
  { name: "Pig", emoji: "🐖", element: "Water", years: [1935,1947,1959,1971,1983,1995,2007,2019,2031], traits: "Generous, compassionate, honest, patient. Genuinely kind. Can be naive and overindulgent.", yin: true },
]

const ELEMENTS_CYCLE = ["Wood", "Fire", "Earth", "Metal", "Water"]
const ELEMENT_COLORS: Record<string, string> = { Wood: "text-green-600 bg-green-50 border-green-200", Fire: "text-red-600 bg-red-50 border-red-200", Earth: "text-amber-700 bg-amber-50 border-amber-200", Metal: "text-slate-600 bg-slate-50 border-slate-200", Water: "text-blue-600 bg-blue-50 border-blue-200" }

// Compatibility based on traditional Chinese zodiac relationships
// Allies (triangles of affinity), secret friends, clashes, and harms
const TRIANGLES: string[][] = [
  ["Rat", "Dragon", "Monkey"],    // 1st triangle
  ["Ox", "Snake", "Rooster"],     // 2nd triangle
  ["Tiger", "Horse", "Dog"],      // 3rd triangle
  ["Rabbit", "Goat", "Pig"],      // 4th triangle
]

const SECRET_FRIENDS: [string, string][] = [
  ["Rat", "Ox"], ["Tiger", "Pig"], ["Rabbit", "Dog"],
  ["Dragon", "Rooster"], ["Snake", "Monkey"], ["Horse", "Goat"],
]

const CLASHES: [string, string][] = [
  ["Rat", "Horse"], ["Ox", "Goat"], ["Tiger", "Monkey"],
  ["Rabbit", "Rooster"], ["Dragon", "Dog"], ["Snake", "Pig"],
]

const HARMS: [string, string][] = [
  ["Rat", "Goat"], ["Ox", "Horse"], ["Tiger", "Snake"],
  ["Rabbit", "Dragon"], ["Monkey", "Pig"], ["Rooster", "Dog"],
]

function getYearElement(year: number): string {
  const idx = Math.floor(((year - 4) % 10) / 2)
  return ELEMENTS_CYCLE[idx]
}

function getAnimal(year: number) {
  const idx = (year - 4) % 12
  return ANIMALS[idx]
}

function getCompatibility(a: string, b: string): { level: string; score: number; reason: string } {
  if (a === b) return { level: "Same sign", score: 65, reason: "Similar energy — understand each other deeply but can amplify shared weaknesses" }
  for (const tri of TRIANGLES) {
    if (tri.includes(a) && tri.includes(b)) return { level: "Triangle of Affinity", score: 95, reason: "Natural allies — complementary strengths, shared vision, energize each other" }
  }
  for (const [x, y] of SECRET_FRIENDS) {
    if ((x === a && y === b) || (x === b && y === a)) return { level: "Secret Friends", score: 90, reason: "Deep, quiet compatibility — understand each other on an intuitive level, protect each other's blind spots" }
  }
  for (const [x, y] of CLASHES) {
    if ((x === a && y === b) || (x === b && y === a)) return { level: "Clash", score: 25, reason: "Opposing energy — friction and misunderstanding likely. Can work with conscious effort but naturally draining" }
  }
  for (const [x, y] of HARMS) {
    if ((x === a && y === b) || (x === b && y === a)) return { level: "Harm", score: 35, reason: "Subtle undermining energy — not dramatic conflict but gradual erosion. One often drains the other unintentionally" }
  }
  return { level: "Neutral", score: 55, reason: "No strong traditional affinity or conflict. Compatibility depends more on individual character and elements" }
}

export default function ChineseZodiacPage() {
  const [birthYear, setBirthYear] = useState(1994)
  const [otherYears, setOtherYears] = useState<number[]>([1996, 1992, 1990])
  const [newYear, setNewYear] = useState("")

  const myAnimal = getAnimal(birthYear)
  const myElement = getYearElement(birthYear)
  const myYin = myAnimal.yin

  const comparisons = useMemo(() => otherYears.map(y => {
    const animal = getAnimal(y)
    const element = getYearElement(y)
    const compat = getCompatibility(myAnimal.name, animal.name)
    return { year: y, animal, element, compat }
  }), [otherYears, birthYear, myAnimal.name])

  function addPerson() {
    const y = parseInt(newYear)
    if (y >= 1900 && y <= 2030 && !otherYears.includes(y)) {
      setOtherYears([...otherYears, y])
      setNewYear("")
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-amber-600">
            <Star className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Chinese Zodiac & Compatibility</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          A 3,000-year-old system of pattern recognition. Not newspaper horoscopes — structured relationship
          mapping based on cyclical archetypes. Track it, log it, see what the data shows.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/20">
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Our approach: data, not dogma.</strong> The Chinese zodiac is a pattern-matching framework
            developed over thousands of years of observation. We are not claiming it is "real" in a scientific sense.
            We are saying: it is a remarkably consistent system for describing how certain personality archetypes
            interact, and the compatibility patterns are worth tracking against your actual experience.
            Log your interactions, rate your relationships, and over time <strong>see if the patterns hold for you
            personally</strong>. That is how you evaluate any system — not by believing or dismissing it, but by
            <strong> testing it against your own data</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Your sign */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Your Profile</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground">Birth year</label>
              <Input type="number" value={birthYear} onChange={e => setBirthYear(Number(e.target.value) || 1994)} className="h-8 text-sm w-24" />
            </div>
          </div>
          <div className="rounded-xl border-2 border-rose-200 bg-rose-50/20 p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{myAnimal.emoji}</span>
              <div>
                <p className="font-bold text-lg">{myAnimal.name}</p>
                <div className="flex gap-2">
                  <Badge className={cn("text-[9px]", ELEMENT_COLORS[myElement])} variant="outline">{myElement}</Badge>
                  <Badge variant="outline" className="text-[9px]">{myYin ? "Yin ☽" : "Yang ☀"}</Badge>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{myAnimal.traits}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded bg-emerald-50 border border-emerald-200 p-2">
                <p className="font-semibold text-emerald-800">Best allies</p>
                <p className="text-muted-foreground">{TRIANGLES.find(t => t.includes(myAnimal.name))?.filter(n => n !== myAnimal.name).join(", ")}</p>
              </div>
              <div className="rounded bg-blue-50 border border-blue-200 p-2">
                <p className="font-semibold text-blue-800">Secret friend</p>
                <p className="text-muted-foreground">{SECRET_FRIENDS.find(([a, b]) => a === myAnimal.name || b === myAnimal.name)?.find(n => n !== myAnimal.name)}</p>
              </div>
              <div className="rounded bg-red-50 border border-red-200 p-2">
                <p className="font-semibold text-red-800">Clash sign</p>
                <p className="text-muted-foreground">{CLASHES.find(([a, b]) => a === myAnimal.name || b === myAnimal.name)?.find(n => n !== myAnimal.name)}</p>
              </div>
              <div className="rounded bg-amber-50 border border-amber-200 p-2">
                <p className="font-semibold text-amber-800">Harm sign</p>
                <p className="text-muted-foreground">{HARMS.find(([a, b]) => a === myAnimal.name || b === myAnimal.name)?.find(n => n !== myAnimal.name)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Element cycle */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">The Five Elements</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">
            Each year has both an animal AND an element. Your element adds a layer to your archetype.
            Elements follow a <Explain tip="A generating/productive cycle (Wood feeds Fire, Fire creates Earth/ash, Earth produces Metal/ore, Metal collects Water/condensation, Water nourishes Wood) and a controlling/destructive cycle (Wood parts Earth, Earth dams Water, Water extinguishes Fire, Fire melts Metal, Metal chops Wood)">productive and controlling cycle</Explain> that
            describes how energies interact.
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[
              { name: "Wood", traits: "Growth, flexibility, creativity, compassion. Spring energy.", generates: "Fire", controls: "Earth", color: "bg-green-50 border-green-200" },
              { name: "Fire", traits: "Passion, joy, dynamism, warmth. Summer energy.", generates: "Earth", controls: "Metal", color: "bg-red-50 border-red-200" },
              { name: "Earth", traits: "Stability, patience, nourishment, grounding. Late summer.", generates: "Metal", controls: "Water", color: "bg-amber-50 border-amber-200" },
              { name: "Metal", traits: "Precision, discipline, structure, clarity. Autumn energy.", generates: "Water", controls: "Wood", color: "bg-slate-50 border-slate-200" },
              { name: "Water", traits: "Wisdom, adaptability, depth, persistence. Winter energy.", generates: "Wood", controls: "Fire", color: "bg-blue-50 border-blue-200" },
            ].map((el, i) => (
              <div key={i} className={cn("rounded-lg border p-2", el.color, el.name === myElement ? "ring-2 ring-rose-400" : "")}>
                <p className="text-[10px] font-bold">{el.name}</p>
                <p className="text-[9px] text-muted-foreground">{el.traits}</p>
                <p className="text-[9px] mt-1"><span className="text-emerald-600">→ {el.generates}</span></p>
                <p className="text-[9px]"><span className="text-red-500">⊣ {el.controls}</span></p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compatibility checker */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Compatibility Checker</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Add birth years of people in your life — partner, family, friends, coworkers — and see the
            traditional compatibility mapping. Then track whether it matches your experience.
          </p>
          <div className="flex gap-2">
            <Input placeholder="Birth year..." value={newYear} onChange={e => setNewYear(e.target.value)} onKeyDown={e => e.key === "Enter" && addPerson()} className="h-8 text-sm w-32" />
            <button onClick={addPerson} className="px-3 h-8 rounded-md bg-rose-600 text-white text-xs hover:bg-rose-700 transition-colors">Add</button>
          </div>

          <div className="space-y-2">
            {comparisons.map((c, i) => (
              <div key={i} className={cn("rounded-lg border p-3", c.compat.score >= 80 ? "border-emerald-200 bg-emerald-50/20" : c.compat.score <= 35 ? "border-red-200 bg-red-50/20" : "")}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.animal.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold">{c.animal.name} ({c.year})</p>
                      <div className="flex gap-1">
                        <Badge className={cn("text-[8px] py-0", ELEMENT_COLORS[c.element])} variant="outline">{c.element}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-xs font-bold", c.compat.score >= 80 ? "text-emerald-600" : c.compat.score <= 35 ? "text-red-600" : "text-amber-600")}>
                      {c.compat.score}/100
                    </div>
                    <Badge variant="outline" className={cn("text-[8px]",
                      c.compat.level === "Triangle of Affinity" ? "border-emerald-300 text-emerald-700" :
                      c.compat.level === "Secret Friends" ? "border-blue-300 text-blue-700" :
                      c.compat.level === "Clash" ? "border-red-300 text-red-700" :
                      c.compat.level === "Harm" ? "border-amber-300 text-amber-700" :
                      "border-slate-300 text-slate-600"
                    )}>{c.compat.level}</Badge>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">{c.compat.reason}</p>
                <button onClick={() => setOtherYears(otherYears.filter(y => y !== c.year))} className="text-[9px] text-red-400 hover:text-red-600 mt-1">Remove</button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All 12 animals reference */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">The 12 Animals</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {ANIMALS.map((animal, i) => (
              <div key={i} className={cn("rounded-lg border p-2.5", animal.name === myAnimal.name ? "border-rose-300 bg-rose-50/30" : "")}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span>{animal.emoji}</span>
                  <p className="text-xs font-semibold">{animal.name}</p>
                  <Badge variant="outline" className="text-[8px] py-0">{animal.yin ? "Yin" : "Yang"}</Badge>
                </div>
                <p className="text-[9px] text-muted-foreground">{animal.traits}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Years: {animal.years.slice(-4).join(", ")}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* The system explained */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Why This System Persists</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>
            <strong>It is not the newspaper horoscopes.</strong> Western pop astrology ("Libras will find love this Tuesday")
            is what discredits the entire field. The Chinese zodiac is a different system entirely — it is a
            <strong> structural framework for personality archetypes and relationship dynamics</strong> refined over
            3,000 years of observation by Chinese scholars, physicians, and philosophers.
          </p>
          <p>
            The system encodes several layers: the <strong>12-year animal cycle</strong> (personality archetype),
            the <strong>5-element cycle</strong> (energy quality), <strong>Yin/Yang</strong> (receptive vs. active),
            and the <strong>4 compatibility triangles</strong> plus clash/harm relationships. These create 60
            unique year-types (the sexagenary cycle) that repeat every 60 years.
          </p>
          <p>
            <strong>What makes it interesting for data:</strong> the compatibility predictions are specific and testable.
            "Rat and Horse clash" is a falsifiable claim. "Tiger, Horse, and Dog are natural allies" is a testable
            pattern. You can log your actual relationship quality with people of different signs and see if the
            patterns hold statistically across your personal network.
          </p>
          <p>
            <strong>The scientific question is not "is this magic?" — it is "does this pattern-matching system
            capture something real about human personality clusters?"</strong> People born in the same year share
            the same cultural moment, parenting trends, economic conditions, and generational psychology. Whether
            the system captures celestial influence or simply encodes observable generational patterns — the correlations
            are worth examining rather than dismissing.
          </p>
        </CardContent>
      </Card>

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Future feature:</strong> Relationship logging — rate your interactions with people by their sign
            over time. The platform will aggregate anonymous data across all users to show whether compatibility
            patterns hold statistically. Your data stays encrypted. The aggregate patterns become visible to everyone.
            Crowdsourced pattern validation — not belief, not dismissal, just data.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/lunar-cycles" className="text-sm text-blue-600 hover:underline">Lunar Cycles</a>
        <a href="/correlations" className="text-sm text-violet-600 hover:underline">Correlations</a>
        <a href="/trajectory" className="text-sm text-indigo-600 hover:underline">Life Trajectory</a>
        <a href="/relationships" className="text-sm text-rose-600 hover:underline">Relationships</a>
      </div>
    </div>
  )
}
