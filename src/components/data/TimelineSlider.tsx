"use client"

import { useState, useMemo } from "react"
import { Calendar, ZoomIn, ZoomOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * TimelineSlider — Filter any data by date range
 *
 * Two modes:
 * 1. Dual slider: drag start/end year
 * 2. Type-in: enter exact years or dates
 *
 * Usage:
 *   <TimelineSlider
 *     minYear={1900} maxYear={2026}
 *     startYear={startYear} endYear={endYear}
 *     onChange={(start, end) => { setStartYear(start); setEndYear(end) }}
 *   />
 */

interface TimelineSliderProps {
  minYear: number
  maxYear: number
  startYear: number
  endYear: number
  onChange: (start: number, end: number) => void
  events?: { year: number; label: string; color?: string }[]
}

export function TimelineSlider({ minYear, maxYear, startYear, endYear, onChange, events }: TimelineSliderProps) {
  const [dragging, setDragging] = useState<"start" | "end" | null>(null)
  const range = maxYear - minYear

  // Preset ranges
  const presets = [
    { label: "All Time", start: minYear, end: maxYear },
    { label: "Last 5yr", start: maxYear - 5, end: maxYear },
    { label: "Last 10yr", start: maxYear - 10, end: maxYear },
    { label: "Last 20yr", start: maxYear - 20, end: maxYear },
    { label: "2000s", start: 2000, end: 2009 },
    { label: "2010s", start: 2010, end: 2019 },
    { label: "2020s", start: 2020, end: maxYear },
  ].filter(p => p.start >= minYear)

  // Event markers within range
  const visibleEvents = events?.filter(e => e.year >= startYear && e.year <= endYear) || []

  function handleTrackClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const year = Math.round(minYear + pct * range)

    // Click closer to start or end handle?
    const distToStart = Math.abs(year - startYear)
    const distToEnd = Math.abs(year - endYear)
    if (distToStart < distToEnd) onChange(Math.min(year, endYear - 1), endYear)
    else onChange(startYear, Math.max(year, startYear + 1))
  }

  const startPct = ((startYear - minYear) / range) * 100
  const endPct = ((endYear - minYear) / range) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold">Timeline</span>
        </div>
        <div className="flex items-center gap-2">
          <input type="number" value={startYear} onChange={e => { const v = Number(e.target.value); if (v >= minYear && v < endYear) onChange(v, endYear) }} className="w-16 h-6 text-[10px] text-center border rounded px-1" />
          <span className="text-[10px] text-muted-foreground">to</span>
          <input type="number" value={endYear} onChange={e => { const v = Number(e.target.value); if (v <= maxYear && v > startYear) onChange(startYear, v) }} className="w-16 h-6 text-[10px] text-center border rounded px-1" />
        </div>
      </div>

      {/* Track */}
      <div className="relative h-8 cursor-pointer" onClick={handleTrackClick}>
        {/* Background track */}
        <div className="absolute top-3 left-0 right-0 h-2 bg-muted rounded-full" />

        {/* Selected range */}
        <div className="absolute top-3 h-2 bg-gradient-to-r from-violet-400 to-blue-500 rounded-full" style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }} />

        {/* Event markers */}
        {visibleEvents.map((event, i) => {
          const pct = ((event.year - minYear) / range) * 100
          return (
            <div key={i} className="absolute top-1 w-1 h-6 rounded-full" style={{ left: `${pct}%`, backgroundColor: event.color || "#8b5cf6" }} title={`${event.year}: ${event.label}`} />
          )
        })}

        {/* Start handle */}
        <div className="absolute top-1.5 w-4 h-4 bg-white border-2 border-violet-500 rounded-full shadow cursor-grab -translate-x-1/2 hover:scale-125 transition-transform" style={{ left: `${startPct}%` }} />

        {/* End handle */}
        <div className="absolute top-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow cursor-grab -translate-x-1/2 hover:scale-125 transition-transform" style={{ left: `${endPct}%` }} />
      </div>

      {/* Year labels */}
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>{minYear}</span>
        <span>{Math.round(minYear + range * 0.25)}</span>
        <span>{Math.round(minYear + range * 0.5)}</span>
        <span>{Math.round(minYear + range * 0.75)}</span>
        <span>{maxYear}</span>
      </div>

      {/* Presets */}
      <div className="flex gap-1 flex-wrap">
        {presets.map(p => (
          <button key={p.label} onClick={() => onChange(p.start, p.end)} className={cn("px-2 py-0.5 rounded text-[9px] border transition-colors", startYear === p.start && endYear === p.end ? "bg-violet-100 border-violet-300 text-violet-700" : "hover:bg-muted/50")}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Range summary */}
      <p className="text-[9px] text-muted-foreground text-center">
        Showing: <strong>{startYear} – {endYear}</strong> ({endYear - startYear} years)
        {visibleEvents.length > 0 && <> · {visibleEvents.length} events in range</>}
      </p>
    </div>
  )
}
