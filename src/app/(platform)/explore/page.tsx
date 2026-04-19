"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Search, Globe2, Users, FileText, DollarSign, Shield,
  ChevronRight, ExternalLink
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/**
 * Explore page — unified search across both HFP and Aletheia
 * Your personal data + truth database in one search
 */
export default function ExplorePage() {
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [hfpResults, setHfpResults] = useState<any[]>([])
  const [aletheiaResults, setAletheiaResults] = useState<any>(null)

  async function search() {
    if (query.length < 2) return
    setSearching(true)

    // Search both platforms in parallel
    const [hfpRes, aletheiaRes] = await Promise.all([
      fetch(`/api/search?q=${encodeURIComponent(query)}`).then(r => r.json()).catch(() => ({ results: [] })),
      fetch(`/api/aletheia?action=universal&q=${encodeURIComponent(query)}`).then(r => r.json()).catch(() => null),
    ])

    setHfpResults(hfpRes.results ?? [])
    setAletheiaResults(aletheiaRes)
    setSearching(false)
  }

  const aletheiaFigures = aletheiaResults?.figures ?? []
  const aletheiaNarratives = aletheiaResults?.narratives ?? []
  const aletheiaClaims = aletheiaResults?.claims ?? []
  const totalAletheia = aletheiaFigures.length + aletheiaNarratives.length + aletheiaClaims.length

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Globe2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Explore</h1>
        </div>
        <p className="text-sm text-muted-foreground">Search your personal data and Aletheia's truth database in one place</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search anything — health data, politicians, narratives, journal entries..."
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button onClick={search} disabled={searching || query.length < 2} className="h-12 px-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          {searching ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Results */}
      {(hfpResults.length > 0 || totalAletheia > 0) && (
        <Tabs defaultValue={hfpResults.length > 0 ? "personal" : "truth"}>
          <TabsList>
            <TabsTrigger value="personal">Your Data ({hfpResults.length})</TabsTrigger>
            <TabsTrigger value="truth">Truth Database ({totalAletheia})</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4 space-y-2">
            {hfpResults.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No personal data matches "{query}"</CardContent></Card>
            ) : (
              hfpResults.map((r: any) => (
                <a key={r.id} href={`/${r.module.toLowerCase().replace("_", "-")}`} className="block">
                  <Card className="card-hover">
                    <CardContent className="p-3 flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px] shrink-0">{r.module}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.detail}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                    </CardContent>
                  </Card>
                </a>
              ))
            )}
          </TabsContent>

          <TabsContent value="truth" className="mt-4 space-y-4">
            {/* Figures */}
            {aletheiaFigures.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-500" /> Public Figures
                </h3>
                <div className="space-y-2">
                  {aletheiaFigures.map((f: any, i: number) => (
                    <Card key={i} className="card-hover">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{f.name}</p>
                          <p className="text-xs text-muted-foreground">{f.title} {f.party ? `· ${f.party}` : ""} {f.country ? `· ${f.country}` : ""}</p>
                        </div>
                        <div className="text-right">
                          <p className={cn("text-sm font-bold", (f.credibilityScore ?? 50) >= 70 ? "text-emerald-600" : (f.credibilityScore ?? 50) >= 40 ? "text-amber-600" : "text-red-600")}>
                            {f.credibilityScore ?? 50}/100
                          </p>
                          <p className="text-[10px] text-muted-foreground">Credibility</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Narratives */}
            {aletheiaNarratives.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-amber-500" /> Narratives
                </h3>
                <div className="space-y-2">
                  {aletheiaNarratives.map((n: any, i: number) => (
                    <Card key={i} className="card-hover">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{n.title}</p>
                          <Badge variant="outline" className="text-[10px]">{n.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Claims */}
            {aletheiaClaims.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-violet-500" /> Claims
                </h3>
                <div className="space-y-2">
                  {aletheiaClaims.map((c: any, i: number) => (
                    <Card key={i} className="card-hover">
                      <CardContent className="p-3">
                        <p className="text-sm">{c.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                          {c.figureName && <span className="text-xs text-muted-foreground">{c.figureName}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {totalAletheia === 0 && (
              <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
                No Aletheia results. {query.length >= 2 ? "Try a different search or connect Aletheia on port 3001." : ""}
              </CardContent></Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Quick searches */}
      {hfpResults.length === 0 && totalAletheia === 0 && !searching && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Searches</CardTitle>
            <CardDescription>Try searching for these topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["climate change", "FDA", "Goldman Sachs", "healthcare", "Bitcoin",
                "surveillance", "lobbying", "education", "energy", "infrastructure"
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => { setQuery(term); setTimeout(search, 100) }}
                  className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
