"use client"

import useSWR from "swr"
import { ArrowRight, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function RelatedContent({ module }: { module: string }) {
  const { data } = useSWR(`/api/related?module=${module}`, fetcher)

  if (!data?.suggestions?.length) return null

  return (
    <Card className="mt-6 border-violet-200 bg-violet-50/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <p className="text-sm font-semibold text-violet-700">Connected Modules</p>
        </div>
        <div className="space-y-2">
          {data.suggestions.slice(0, 3).map((s: any) => (
            <a
              key={s.href}
              href={s.href}
              className="flex items-center justify-between rounded-lg border border-violet-100 bg-white/60 p-3 hover:bg-white transition-colors group"
            >
              <div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-violet-500 transition-colors shrink-0" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
