/**
 * Design Constants — Visual consistency across the entire platform
 *
 * EVERY page should use these constants for colors, gradients, and styling.
 * This prevents the "Frankenstein" effect where pages look assembled rather than designed.
 *
 * Usage:
 *   import { PAGE_HEADER_GRADIENT, CATEGORY_COLORS } from "@/lib/design"
 */

// ─── Page Header Gradients ─────────────────────────────────────
// Each category has a consistent gradient used for the page icon

export const PAGE_GRADIENTS = {
  // Health pages — warm reds/roses
  health: "from-rose-500 to-red-600",
  sleep: "from-indigo-500 to-violet-600",
  nutrition: "from-green-500 to-emerald-600",
  exercise: "from-red-500 to-orange-600",
  fascia: "from-rose-500 to-orange-600",
  breathwork: "from-cyan-500 to-blue-600",
  cold: "from-blue-500 to-cyan-600",
  sauna: "from-orange-500 to-red-600",

  // Mind pages — cool blues/violets
  mind: "from-violet-500 to-purple-600",
  stoicism: "from-slate-600 to-zinc-800",
  science: "from-teal-500 to-cyan-600",
  biases: "from-red-500 to-orange-600",

  // Finance pages — greens
  finance: "from-emerald-500 to-green-600",
  budget: "from-emerald-500 to-green-600",

  // Platform/system — violets
  platform: "from-violet-500 to-purple-600",
  gamification: "from-amber-500 to-orange-600",
  data: "from-blue-600 to-indigo-700",

  // Canada — reds
  canada: "from-red-600 to-amber-600",

  // Aletheia — ambers
  truth: "from-amber-500 to-orange-600",
} as const

// ─── Category Colors for Badges and Tags ───────────────────────

export const CATEGORY_BADGE_COLORS = {
  health: "border-rose-300 text-rose-700 bg-rose-50",
  mind: "border-violet-300 text-violet-700 bg-violet-50",
  finance: "border-emerald-300 text-emerald-700 bg-emerald-50",
  social: "border-blue-300 text-blue-700 bg-blue-50",
  canada: "border-red-300 text-red-700 bg-red-50",
  platform: "border-slate-300 text-slate-700 bg-slate-50",
  gamification: "border-amber-300 text-amber-700 bg-amber-50",
  data: "border-cyan-300 text-cyan-700 bg-cyan-50",
} as const

// ─── Score Colors (0-100) ──────────────────────────────────────

export function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600"
  if (score >= 60) return "text-blue-600"
  if (score >= 40) return "text-amber-600"
  if (score >= 20) return "text-orange-600"
  return "text-red-600"
}

export function scoreBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-blue-500"
  if (score >= 40) return "bg-amber-500"
  if (score >= 20) return "bg-orange-500"
  return "bg-red-500"
}

// ─── Mood Colors (1-10) ────────────────────────────────────────

export function moodColor(score: number): string {
  if (score >= 8) return "text-emerald-500"
  if (score >= 6) return "text-blue-500"
  if (score >= 4) return "text-amber-500"
  if (score >= 2) return "text-orange-500"
  return "text-red-500"
}

// ─── Spacing Constants ─────────────────────────────────────────

export const LAYOUT = {
  maxWidth: "max-w-3xl",        // Default content width
  wideMaxWidth: "max-w-4xl",    // For dashboards with more columns
  fullMaxWidth: "max-w-6xl",    // For admin/data pages
  pageSpacing: "space-y-6",     // Standard gap between sections
  cardPadding: "p-4",           // Standard card padding
  sectionPadding: "p-5",        // Larger sections
} as const

// ─── Animation Durations ───────────────────────────────────────

export const ANIMATION = {
  fast: "duration-200",
  normal: "duration-300",
  slow: "duration-500",
  verySlow: "duration-1000",
} as const
