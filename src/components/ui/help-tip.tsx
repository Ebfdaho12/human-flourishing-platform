"use client"

import { useState } from "react"
import { HelpCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * HelpTip — Contextual help that explains what something is and why it matters
 *
 * Two modes:
 * 1. Inline: <HelpTip tip="explanation" /> — small ? icon, hover/click shows tooltip
 * 2. Card: <HelpTip title="What is this?" simple="..." technical="..." /> — expandable help section
 *
 * Every feature on the platform should be self-explanatory.
 * If someone doesn't know what something is, they should be able to find out
 * without leaving the page, without Googling, without feeling stupid.
 */

interface HelpTipProps {
  /** Short inline tooltip (hover/click) */
  tip?: string
  /** Title for card mode */
  title?: string
  /** Simple explanation anyone can understand */
  simple?: string
  /** Technical explanation for those who want depth */
  technical?: string
  /** Custom className */
  className?: string
}

export function HelpTip({ tip, title, simple, technical, className }: HelpTipProps) {
  const [open, setOpen] = useState(false)

  // Inline mode — just a ? with tooltip
  if (tip && !simple && !technical) {
    return (
      <span className="relative inline-flex group">
        <button
          onClick={() => setOpen(!open)}
          className={cn("inline-flex items-center justify-center h-4 w-4 rounded-full border border-muted-foreground/30 text-muted-foreground/50 hover:text-muted-foreground hover:border-muted-foreground/60 transition-colors cursor-help", className)}
          aria-label="Help"
        >
          <HelpCircle className="h-3 w-3" />
        </button>
        {/* Hover tooltip */}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-lg bg-foreground text-background text-[10px] p-2 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
          {tip}
        </span>
        {/* Click tooltip (mobile-friendly) */}
        {open && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-foreground text-background text-[10px] p-2.5 leading-relaxed z-50 shadow-lg">
            {tip}
            <button onClick={() => setOpen(false)} className="absolute top-1 right-1 text-background/50 hover:text-background">
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        )}
      </span>
    )
  }

  // Card mode — expandable help section with simple + technical
  return (
    <div className={cn("rounded-lg border border-blue-200/50", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-blue-50/50 transition-colors rounded-lg"
      >
        <HelpCircle className="h-3.5 w-3.5 text-blue-400 shrink-0" />
        <span className="text-[10px] text-blue-600 font-medium">{title || "What is this?"}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {simple && (
            <div className="rounded bg-blue-50 border border-blue-200 p-2">
              <p className="text-[9px] font-semibold text-blue-700 mb-0.5">Simple</p>
              <p className="text-[10px] text-muted-foreground">{simple}</p>
            </div>
          )}
          {technical && (
            <div className="rounded bg-slate-50 border border-slate-200 p-2">
              <p className="text-[9px] font-semibold text-slate-700 mb-0.5">Technical</p>
              <p className="text-[10px] text-muted-foreground">{technical}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
