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
    <span className="relative inline">
      <span>{children}</span>
      <button
        onClick={(e) => { e.stopPropagation(); setShow(!show) }}
        className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-violet-100 text-violet-600 text-[9px] font-bold ml-0.5 align-super cursor-pointer hover:bg-violet-200 transition-colors"
        title="Click for simple explanation"
        aria-label="Show simple explanation"
      >?</button>
      {show && (
        <span className="block mt-1 mb-2 rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-xs text-violet-700 leading-relaxed">
          <Lightbulb className="h-3 w-3 inline mr-1" />
          <strong>Simply put:</strong> {tip}
        </span>
      )}
    </span>
  )
}
