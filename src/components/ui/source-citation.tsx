"use client"

import { useState } from "react"
import { ExternalLink, BookOpen, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * SourceCitation — Inline clickable source reference
 *
 * Usage:
 *   <Source id="1" /> — inline [1] that links to source section
 *   <SourceList sources={[...]} /> — numbered source list at bottom of section
 *
 * Every claim on the platform should have a source.
 * "Always show your work."
 */

interface SourceRef {
  id: number
  title: string
  authors?: string
  journal?: string
  year?: number
  url?: string
  type: "study" | "review" | "book" | "dataset" | "report" | "article" | "government"
  notes?: string
}

// Inline citation [1]
export function Source({ id, url }: { id: number; url?: string }) {
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[9px] text-blue-600 hover:text-blue-800 font-mono align-super ml-0.5 no-underline hover:underline">
        [{id}]
      </a>
    )
  }
  return (
    <a href={`#source-${id}`} className="inline-flex items-center text-[9px] text-blue-600 hover:text-blue-800 font-mono align-super ml-0.5">
      [{id}]
    </a>
  )
}

// Source list at bottom of section
export function SourceList({ sources, title }: { sources: SourceRef[]; title?: string }) {
  const [expanded, setExpanded] = useState(false)

  const TYPE_COLORS: Record<string, string> = {
    study: "border-blue-300 text-blue-700",
    review: "border-violet-300 text-violet-700",
    book: "border-amber-300 text-amber-700",
    dataset: "border-emerald-300 text-emerald-700",
    report: "border-slate-300 text-slate-700",
    article: "border-cyan-300 text-cyan-700",
    government: "border-red-300 text-red-700",
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/30 mt-4">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-100/50 transition-colors">
        <BookOpen className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        <span className="text-[10px] font-semibold text-slate-700 flex-1">{title || "Sources"} ({sources.length})</span>
        {expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-1.5">
          {sources.map((s) => (
            <div key={s.id} id={`source-${s.id}`} className="flex items-start gap-2">
              <span className="text-[9px] font-mono text-muted-foreground shrink-0 mt-0.5 w-5 text-right">[{s.id}]</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline font-medium">
                      {s.title} <ExternalLink className="h-2.5 w-2.5 inline" />
                    </a>
                  ) : (
                    <span className="text-[10px] font-medium">{s.title}</span>
                  )}
                  <Badge variant="outline" className={cn("text-[7px] py-0", TYPE_COLORS[s.type])}>{s.type}</Badge>
                </div>
                <p className="text-[9px] text-muted-foreground">
                  {s.authors && <>{s.authors}. </>}
                  {s.journal && <em>{s.journal}</em>}
                  {s.year && <> ({s.year})</>}
                  {s.notes && <> — {s.notes}</>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
