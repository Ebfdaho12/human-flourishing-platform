"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Globe2, Search, Clock, ChevronRight, Shield, Landmark, Zap,
  FlaskConical, Heart, Brain, Swords, DollarSign, Eye, BookOpen,
  Building2, Cpu
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const CATEGORY_ICONS: Record<string, { icon: any; color: string }> = {
  civilization: { icon: Globe2, color: "text-violet-500" },
  governance: { icon: Landmark, color: "text-amber-500" },
  politics: { icon: Landmark, color: "text-orange-500" },
  military: { icon: Swords, color: "text-red-500" },
  economics: { icon: DollarSign, color: "text-emerald-500" },
  science: { icon: FlaskConical, color: "text-cyan-500" },
  technology: { icon: Cpu, color: "text-blue-500" },
  religion: { icon: BookOpen, color: "text-purple-500" },
  health: { icon: Heart, color: "text-rose-500" },
  intelligence: { icon: Eye, color: "text-slate-500" },
  surveillance: { icon: Eye, color: "text-gray-500" },
  energy: { icon: Zap, color: "text-yellow-500" },
  philosophy: { icon: Brain, color: "text-indigo-500" },
  knowledge: { icon: BookOpen, color: "text-teal-500" },
  architecture: { icon: Building2, color: "text-stone-500" },
}

export default function KnowledgePage() {
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any>(null)
  const [searching, setSearching] = useState(false)
  const { data } = useSWR("/api/aletheia/timeline", fetcher)

  async function searchKnowledge() {
    if (query.length < 2) return
    setSearching(true)
    try {
      const [timelineRes, aletheiaRes] = await Promise.all([
        fetch(`/api/aletheia/timeline?q=${encodeURIComponent(query)}`).then(r => r.json()),
        fetch(`/api/aletheia?action=universal&q=${encodeURIComponent(query)}`).then(r => r.json()).catch(() => null),
      ])
      setSearchResults({ timeline: timelineRes, aletheia: aletheiaRes })
    } catch { setSearchResults(null) }
    setSearching(false)
  }

  const timeline = data?.timeline

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <Globe2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Knowledge Graph</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The archive of human history. Search across 30,000+ figures, thousands of events, and centuries of interconnected knowledge.
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchKnowledge()}
          placeholder="Search history: Federal Reserve, Watergate, CRISPR, Mongol Empire..."
          className="h-12 text-base"
        />
        <Button onClick={searchKnowledge} disabled={searching || query.length < 2} className="h-12 px-6">
          <Search className="h-4 w-4" /> {searching ? "..." : "Search"}
        </Button>
      </div>

      {/* Search results */}
      {searchResults && (
        <div className="space-y-4">
          {searchResults.aletheia?.figures?.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">People ({searchResults.aletheia.figures.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {searchResults.aletheia.figures.slice(0, 8).map((f: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 p-2.5">
                      <div>
                        <p className="text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.title} {f.country ? `· ${f.country}` : ""}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{f.credibilityScore ?? 50}/100</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {searchResults.aletheia?.narratives?.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Narratives ({searchResults.aletheia.narratives.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {searchResults.aletheia.narratives.slice(0, 5).map((n: any, i: number) => (
                    <div key={i} className="rounded-lg border border-border/50 p-2.5">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Timeline */}
      {timeline && !searchResults && (
        <div className="space-y-8">
          <h2 className="text-lg font-semibold">Timeline of Human History</h2>

          {timeline.eras.map((era: any) => (
            <div key={era.name}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{era.name}</h3>
                  <p className="text-xs text-muted-foreground">{era.period}</p>
                </div>
              </div>

              <div className="ml-4 border-l-2 border-violet-200 pl-6 space-y-3">
                {era.events.map((event: any, i: number) => {
                  const meta = CATEGORY_ICONS[event.category] ?? CATEGORY_ICONS.civilization
                  const Icon = meta.icon
                  return (
                    <div key={i} className="relative">
                      <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-violet-300 bg-background" />
                      <div className="flex items-start gap-3">
                        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", meta.color)} />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-violet-600">
                              {event.year < 0 ? `${Math.abs(event.year)} BCE` : event.year}
                            </span>
                            <Badge variant="outline" className="text-[9px] py-0">{event.category}</Badge>
                          </div>
                          <p className="text-sm">{event.title}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className="border-indigo-200 bg-indigo-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This knowledge graph connects to Aletheia's database of 30,000+ public figures, thousands of narratives,
            and funding connections spanning all of human history. Search for any person, event, organization, or concept
            to explore how everything connects. We present the evidence — you decide what it means.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
