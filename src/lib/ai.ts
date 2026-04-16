/**
 * Multi-provider AI client
 * Priority: xAI (Grok) → Google Gemini → Anthropic Claude
 * Uses whichever API key is present in .env.local
 */

import Anthropic from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"

export type ChatMessage = { role: "user" | "assistant"; content: string }

type Provider = "xai" | "gemini" | "anthropic" | "none"

function detectProvider(): Provider {
  if (process.env.ANTHROPIC_API_KEY?.length ?? 0 > 10) return "anthropic"
  if (process.env.XAI_API_KEY?.length ?? 0 > 10) return "xai"
  if (process.env.GEMINI_API_KEY?.length ?? 0 > 10) return "gemini"
  return "none"
}

export const activeProvider: Provider = detectProvider()
export const hasApiKey: boolean = activeProvider !== "none"

export const providerName: Record<Provider, string> = {
  xai: "Grok (xAI)",
  gemini: "Gemini (Google)",
  anthropic: "Claude (Anthropic)",
  none: "None",
}

export const NO_KEY_RESPONSE =
  "AI features are not yet enabled. Add XAI_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY to .env.local and restart the server."

// ── xAI (Grok) — OpenAI-compatible ──────────────────────────────────────────

let _xai: OpenAI | null = null
function getXai(): OpenAI {
  if (!_xai) {
    _xai = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
    })
  }
  return _xai
}

async function chatXai(messages: ChatMessage[], system: string, maxTokens: number): Promise<string> {
  const response = await getXai().chat.completions.create({
    model: "grok-3",
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  })
  return response.choices[0]?.message?.content ?? ""
}

// ── Google Gemini ────────────────────────────────────────────────────────────

let _gemini: GoogleGenerativeAI | null = null
function getGemini(): GoogleGenerativeAI {
  if (!_gemini) _gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "")
  return _gemini
}

async function chatGemini(messages: ChatMessage[], system: string, maxTokens: number): Promise<string> {
  const genAI = getGemini()
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: system,
    generationConfig: { maxOutputTokens: maxTokens },
  })

  // Convert to Gemini history format (all but last message)
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }))

  const chat = model.startChat({ history })
  const lastMsg = messages[messages.length - 1]
  const result = await chat.sendMessage(lastMsg.content)
  return result.response.text()
}

// ── Anthropic Claude ─────────────────────────────────────────────────────────

let _anthropic: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _anthropic
}

async function chatAnthropic(messages: ChatMessage[], system: string, maxTokens: number): Promise<string> {
  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system,
    messages,
  })
  const block = response.content[0]
  return block.type === "text" ? block.text : ""
}

// ── Unified interface ────────────────────────────────────────────────────────

export async function chat(
  messages: ChatMessage[],
  systemPrompt: string,
  maxTokens = 1024
): Promise<string> {
  if (!hasApiKey) return NO_KEY_RESPONSE

  switch (activeProvider) {
    case "xai":      return chatXai(messages, systemPrompt, maxTokens)
    case "gemini":   return chatGemini(messages, systemPrompt, maxTokens)
    case "anthropic": return chatAnthropic(messages, systemPrompt, maxTokens)
    default:         return NO_KEY_RESPONSE
  }
}

// ── Domain helpers ───────────────────────────────────────────────────────────

export async function analyzeHealth(entries: object[], goals: object[]): Promise<string> {
  if (!hasApiKey) return NO_KEY_RESPONSE

  const system = `You are a compassionate health intelligence assistant for the Human Flourishing Platform.
Analyze health data and provide actionable, evidence-based insights.
Keep responses to 2-4 sentences — warm, practical, and specific. Never diagnose.
Always suggest professional consultation for medical concerns.`

  const userMsg = `Analyze this health data and give one key insight or recommendation:
Recent entries (last 10): ${JSON.stringify(entries.slice(-10))}
Active goals: ${JSON.stringify(goals)}`

  return chat([{ role: "user", content: userMsg }], system, 512)
}

export async function analyzeMood(moodEntries: object[], journalEntries: object[]): Promise<string> {
  if (!hasApiKey) return NO_KEY_RESPONSE

  const system = `You are a compassionate mental wellness assistant for the Human Flourishing Platform.
Identify emotional patterns and offer gentle, supportive guidance.
Be warm and non-judgmental. Never replace professional mental health care.
If you detect signs of crisis or distress, always recommend professional resources (988 Lifeline).
Keep insights to 2-4 sentences.`

  const userMsg = `Review this mood and journal data and provide a supportive insight:
Mood entries (last 7): ${JSON.stringify(moodEntries.slice(-7))}
Recent journal themes: ${JSON.stringify(journalEntries.slice(-3))}`

  return chat([{ role: "user", content: userMsg }], system, 512)
}

export async function tutor(
  subject: string,
  topic: string,
  level: string,
  history: ChatMessage[]
): Promise<string> {
  if (!hasApiKey) return NO_KEY_RESPONSE

  const system = `You are an expert Socratic tutor for the Human Flourishing Platform.
Subject: ${subject} | Topic: ${topic} | Level: ${level}

Teaching principles:
- Ask one guiding question at a time rather than lecturing
- Build on what the student already knows
- Celebrate correct reasoning, gently redirect errors
- Use concrete examples and analogies
- Keep responses focused and conversational (2-4 paragraphs max)
- End with a question or small challenge to check understanding`

  return chat(history, system, 1024)
}
