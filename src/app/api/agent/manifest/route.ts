import { NextResponse } from "next/server"

/**
 * GET /api/agent/manifest
 *
 * Public, unauthenticated manifest describing the agent API surface.
 * External AIs (ChatGPT, Claude, Gemini, local LLMs) can fetch this to
 * discover what actions the platform exposes.
 *
 * This is the foundation for ambient-agent integration — the "API docs
 * an AI reads itself". Loosely inspired by the MCP tool manifest shape.
 */

export async function GET() {
  return NextResponse.json({
    schemaVersion: "1.0",
    platform: "Human Flourishing Platform",
    description: "Unified personal sovereignty platform — health, wealth, mind, growth. Data is yours, cross-domain, exportable.",
    authentication: {
      type: "session-cookie (NextAuth)",
      note: "All endpoints except /manifest require an authenticated session. External agents must authenticate via OAuth-style flow (not yet implemented — roadmap).",
    },
    tools: [
      {
        name: "getLifeState",
        method: "GET",
        path: "/api/agent/state",
        description: "Structured snapshot of the user's current state: mood, sleep, exercise, streaks, goals, achievements over 24h/7d/30d windows.",
        parameters: {
          detail: { type: "string", enum: ["summary", "full"], default: "summary" },
        },
        returns: "LifeState object with schemaVersion, summary, streaks, goals, achievements, wallet.",
      },
      {
        name: "getInsights",
        method: "GET",
        path: "/api/agent/insights",
        description: "Proactive insights ranked by surprise + actionability. First result is the single headline for voice/AR surfaces.",
        parameters: {
          top: { type: "number", min: 1, max: 10, default: 3 },
          tone: { type: "string", enum: ["neutral", "concerned", "celebratory"], optional: true },
        },
        returns: "Array of Insight objects with headline, body, tone, suggestedAction.",
      },
      {
        name: "logMoment",
        method: "POST",
        path: "/api/agent/log",
        description: "Freeform capture — log mood/sleep/exercise/water/note. Voice/text agents should parse to a typed payload before calling.",
        parameters: {
          type: { type: "string", enum: ["mood", "sleep", "exercise", "water", "note"], required: true },
          value: { type: "number", note: "score 1-10 for mood, hours for sleep, minutes for exercise, ounces for water" },
          text: { type: "string", optional: true, note: "freeform note — required for type=note" },
          at: { type: "string", format: "iso8601", optional: true, default: "now" },
        },
        returns: "{ ok, type, id, at }",
      },
    ],
    schemas: {
      Insight: {
        id: "string",
        headline: "string — one sentence, voice-ready",
        body: "string — 1-2 sentence expansion",
        tone: "neutral | concerned | celebratory",
        surpriseScore: "number 0-100",
        suggestedAction: "{ label, href? }",
        sources: "string[]",
      },
    },
    principles: {
      privacy: "Data is user-owned. Server stores encrypted blobs where possible. Never fabricate — missing data returns null, not guesses.",
      surface_agnostic: "Same JSON drives web UI, voice, AR, MCP, ambient displays. Design agents to consume this manifest, not hand-coded integrations.",
      proactive_or_passive: "Agents should prefer passive (answer when asked) for most categories; only surface insights proactively when surpriseScore is high.",
    },
    roadmap: [
      "OAuth-style token flow for cross-agent authentication",
      "MCP tool export mirroring these REST endpoints",
      "WebSocket stream for real-time ambient updates",
      "Portable signed data capsule export",
    ],
  }, {
    headers: { "Cache-Control": "public, max-age=60" },
  })
}
