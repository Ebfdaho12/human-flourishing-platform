"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AletheiaData {
  figures: number
  narratives: number
}

export function AletheiaConnection({ topic }: { topic: string }) {
  const [data, setData] = useState<AletheiaData | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/aletheia?action=universal&q=${encodeURIComponent(topic + " canada")}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json && (json.figures > 0 || json.narratives > 0)) {
          setData({ figures: json.figures ?? 0, narratives: json.narratives ?? 0 })
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [topic])

  if (!data) return null

  const aletheiaUrl = process.env.NEXT_PUBLIC_ALETHEIA_URL || "https://aletheia-truth.vercel.app"
  const searchUrl = `${aletheiaUrl}/search?q=${encodeURIComponent(topic + " canada")}`

  return (
    <Card className="border-amber-300/60 bg-amber-50/30">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white text-xs font-bold">
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900">
            {data.figures} figures and {data.narratives} narratives found on Aletheia
          </p>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 hover:underline"
          >
            View on Aletheia <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-300 shrink-0 hidden sm:inline-flex">
          Powered by Aletheia Truth Protocol
        </Badge>
      </CardContent>
    </Card>
  )
}
