"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Heart, Brain, GraduationCap, Landmark, FlaskConical, TrendingUp, Building2, Zap, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const MODULE_META: Record<string, { icon: any; color: string; slug: string }> = {
  HEALTH: { icon: Heart, color: "text-rose-500", slug: "health" },
  MENTAL_HEALTH: { icon: Brain, color: "text-pink-500", slug: "mental-health" },
  EDUCATION: { icon: GraduationCap, color: "text-blue-500", slug: "education" },
  GOVERNANCE: { icon: Landmark, color: "text-amber-500", slug: "governance" },
  DESCI: { icon: FlaskConical, color: "text-teal-500", slug: "desci" },
  ECONOMICS: { icon: TrendingUp, color: "text-emerald-500", slug: "economics" },
  INFRASTRUCTURE: { icon: Building2, color: "text-slate-500", slug: "infrastructure" },
  ENERGY: { icon: Zap, color: "text-yellow-500", slug: "energy" },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
        const data = await res.json()
        setResults(data.results ?? [])
      } catch { setResults([]) }
      setLoading(false)
    }, 300)
  }

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Search your data...</span>
          <kbd className="hidden lg:inline-flex h-5 items-center rounded border border-border bg-background px-1.5 text-[10px] font-mono text-muted-foreground">
            /
          </kbd>
        </button>
      ) : (
        <div className="w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Search health, journal, studies, records..."
              className="pl-9 pr-8 h-9"
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            />
            <button onClick={() => { setOpen(false); setQuery(""); setResults([]) }} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Results dropdown */}
          {(results.length > 0 || loading) && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-xl max-h-80 overflow-y-auto z-50">
              {loading && results.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
              )}
              {results.map((r) => {
                const meta = MODULE_META[r.module] ?? MODULE_META.HEALTH
                const Icon = meta.icon
                return (
                  <a
                    key={r.id}
                    href={`/${meta.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0"
                  >
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", meta.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.detail}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{timeAgo(r.date)}</span>
                  </a>
                )
              })}
              {results.length > 0 && !loading && (
                <div className="px-3 py-2 text-center text-[10px] text-muted-foreground border-t border-border/30">
                  {results.length} results for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
