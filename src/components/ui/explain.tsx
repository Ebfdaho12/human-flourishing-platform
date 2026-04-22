"use client"

import { useState } from "react"
import { Lightbulb } from "lucide-react"

/**
 * Universal "?" explanation button used throughout the platform.
 *
 * Wrap any text/term and provide a simple explanation. Clicking the "?"
 * reveals an easy-to-understand version that anyone can follow.
 *
 * Usage:
 *   <Explain tip="A stock is a tiny piece of ownership in a company">stocks</Explain>
 *   <Explain tip="How much prices go up over time — your money buys less each year">inflation rate</Explain>
 */
export function Explain({ children, tip }: { children: React.ReactNode; tip: string }) {
  const [show, setShow] = useState(false)

  return (
    <span className="relative inline group">
      <span className="border-b border-dotted border-violet-400/60">{children}</span>
      <button
        onClick={(e) => { e.stopPropagation(); setShow(!show) }}
        className="inline-flex items-center justify-center h-[18px] w-[18px] rounded-full bg-violet-500 text-white text-[10px] font-bold ml-1 align-middle cursor-pointer hover:bg-violet-600 hover:scale-110 transition-all shadow-sm"
        title="Click for simple explanation"
        aria-label="Show simple explanation"
      >?</button>
      {/* Hover tooltip */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-lg bg-violet-900 text-white text-[10px] p-2.5 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg text-center">
        {tip}
      </span>
      {/* Click expanded explanation */}
      {show && (
        <span className="block mt-1 mb-2 rounded-lg bg-violet-50 border-2 border-violet-200 px-3 py-2.5 text-xs text-violet-700 leading-relaxed shadow-sm">
          <Lightbulb className="h-3.5 w-3.5 inline mr-1 text-violet-500" />
          <strong>Simply put:</strong> {tip}
        </span>
      )}
    </span>
  )
}
