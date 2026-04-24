"use client"

import { useState } from "react"
import { Bot, Radio, Eye, Mic, Copy, Check, ArrowRight, Terminal, Sparkles, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const ENDPOINTS = [
  {
    name: "getLifeState",
    method: "GET",
    path: "/api/agent/state",
    purpose: "Current life-state snapshot — mood, sleep, exercise, goals, 24h/7d/30d windows.",
    example: `curl -s https://human-flourishing-platform.vercel.app/api/agent/state?detail=full`,
  },
  {
    name: "getInsights",
    method: "GET",
    path: "/api/agent/insights",
    purpose: "Proactive insights ranked by surprise. First result is the voice-ready headline.",
    example: `curl -s https://human-flourishing-platform.vercel.app/api/agent/insights?top=3`,
  },
  {
    name: "logMoment",
    method: "POST",
    path: "/api/agent/log",
    purpose: "Capture mood / sleep / exercise / water / note. Voice agent parses transcript, then POSTs.",
    example: `curl -X POST https://human-flourishing-platform.vercel.app/api/agent/log \\
  -H "Content-Type: application/json" \\
  -d '{"type":"mood","value":7,"text":"grateful but tired"}'`,
  },
  {
    name: "getManifest",
    method: "GET",
    path: "/api/agent/manifest",
    purpose: "Public discovery document — no auth required. External AIs read this to learn the API.",
    example: `curl -s https://human-flourishing-platform.vercel.app/api/agent/manifest`,
  },
]

const PRINCIPLES = [
  { icon: Radio, label: "Surface-agnostic", body: "Same JSON drives web, voice, AR, MCP, ambient displays. The UI is one of N surfaces, not the product." },
  { icon: Eye, label: "API-first, UI-incidental", body: "Every feature reachable programmatically. Agents never need to render pixels — they query data and take action." },
  { icon: Mic, label: "Voice/text capture", body: "One endpoint swallows mood, sleep, exercise, water, note. Whisper + LLM → structured payload → POST /api/agent/log." },
  { icon: Sparkles, label: "Proactive-capable", body: "Insights endpoint returns ranked, voice-ready headlines. Ambient surfaces pull on an interval and speak only when surpriseScore is high." },
  { icon: ShieldCheck, label: "Trust-check as a service", body: "Pair with Aletheia's verification layer to cross-check any claim an external AI makes before trusting it." },
]

export default function AgentHubPage() {
  const [copied, setCopied] = useState<string | null>(null)

  function copy(text: string, id: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 1800)
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Agent Hub</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The API layer for the post-app future. Voice assistants, AR overlays, MCP clients, ambient displays — all speak the same structured JSON.
        </p>
      </div>

      <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50/40 to-fuchsia-50/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why this exists:</strong> Apps-as-destinations are a transitional form. As glasses, voice, and agents mature, your data has to reach any surface without a rewrite. Every page in this platform is also addressable here. When the UI layer changes shape, the substrate persists.
          </p>
        </CardContent>
      </Card>

      {/* Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {PRINCIPLES.map(p => (
          <div key={p.label} className="rounded-lg border p-3 flex gap-3 items-start">
            <p.icon className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">{p.label}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Endpoints */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Terminal className="h-4 w-4 text-violet-600" /> Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ENDPOINTS.map(ep => (
            <div key={ep.name} className="rounded-lg border bg-slate-50/40 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={cn("text-[9px] font-mono", ep.method === "GET" ? "text-emerald-700 border-emerald-300" : "text-amber-700 border-amber-300")}>{ep.method}</Badge>
                <code className="text-xs font-mono">{ep.path}</code>
                <span className="text-[10px] text-muted-foreground ml-auto">{ep.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{ep.purpose}</p>
              <div className="relative">
                <pre className="text-[10px] bg-slate-900 text-emerald-300 rounded-md p-2 overflow-x-auto whitespace-pre-wrap break-all">{ep.example}</pre>
                <button
                  onClick={() => copy(ep.example, ep.name)}
                  className="absolute top-1.5 right-1.5 rounded bg-slate-800 text-slate-300 hover:text-white p-1"
                  aria-label="Copy"
                >
                  {copied === ep.name ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Flow diagram */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">A voice interaction, end-to-end</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
            {[
              { step: "1", label: "Voice", body: "\"Log mood 7, grateful but tired.\"" },
              { step: "2", label: "STT", body: "Whisper / browser transcribes." },
              { step: "3", label: "Parse", body: "Your agent extracts type + value + note." },
              { step: "4", label: "POST", body: "/api/agent/log receives structured payload." },
              { step: "5", label: "Ack", body: "Agent reads headline from /insights." },
            ].map((s, i) => (
              <div key={i} className="rounded-lg border p-2.5 text-center">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Step {s.step}</p>
                <p className="text-xs font-semibold mt-0.5">{s.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 italic">
            The only app the user opens is the one that speaks back.
          </p>
        </CardContent>
      </Card>

      {/* Auth + roadmap */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Auth & Roadmap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>
            <strong className="text-foreground">Today:</strong> Endpoints require an authenticated session (NextAuth cookie). The manifest is public.
          </p>
          <p>
            <strong className="text-foreground">Next:</strong> OAuth-style token flow so external agents (ChatGPT, Claude, local LLMs, voice hubs) can authenticate without a browser session. MCP tool export mirroring these REST routes. WebSocket stream for real-time ambient updates. Signed portable data-capsule export for when users want to walk.
          </p>
          <p>
            <strong className="text-foreground">Philosophy:</strong> The data is yours. The UI is yours. The agents are yours. We build the substrate; you pick the surfaces.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/api/agent/manifest" className="text-sm text-violet-600 hover:underline">View manifest JSON</a>
        <a href="/api/agent/state" className="text-sm text-violet-600 hover:underline">Try state endpoint (auth required)</a>
        <a href="/api-docs" className="text-sm text-violet-600 hover:underline">Full API docs</a>
        <a href="/settings/data" className="text-sm text-emerald-600 hover:underline">Export my data</a>
      </div>
    </div>
  )
}
