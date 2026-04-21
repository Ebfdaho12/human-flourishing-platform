"use client"

import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Aletheia Deep Link — search Aletheia for a figure or topic directly
 *
 * Usage:
 *   <AletheiaSearch query="Mark Carney" />
 *   <AletheiaSearch query="housing crisis" label="Research this on Aletheia" />
 */
export function AletheiaSearch({ query, label, className }: {
  query: string
  label?: string
  className?: string
}) {
  const aletheiaUrl = process.env.NEXT_PUBLIC_ALETHEIA_URL || "https://aletheia-truth.vercel.app"
  const searchUrl = `${aletheiaUrl}/search?q=${encodeURIComponent(query)}`

  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 hover:underline font-medium",
        className
      )}
    >
      <ExternalLink className="h-3 w-3" />
      {label || `Search "${query}" on Aletheia`}
    </a>
  )
}

/**
 * Aletheia Figure Link — link directly to a figure's profile
 */
export function AletheiaFigure({ name, className }: {
  name: string
  className?: string
}) {
  const aletheiaUrl = process.env.NEXT_PUBLIC_ALETHEIA_URL || "https://aletheia-truth.vercel.app"
  const searchUrl = `${aletheiaUrl}/search?q=${encodeURIComponent(name)}`

  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 hover:underline",
        className
      )}
      title={`View ${name} on Aletheia Truth Protocol`}
    >
      {name}
      <ExternalLink className="h-2.5 w-2.5" />
    </a>
  )
}
