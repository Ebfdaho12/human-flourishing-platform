import { MetadataRoute } from "next"

/**
 * Dynamic sitemap for SEO — lists all public-facing pages
 * Google will crawl this to index the platform
 */

const BASE = "https://human-flourishing-platform.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  // Public pages (no auth required)
  const publicPages = [
    { url: `${BASE}`, priority: 1.0 },
    { url: `${BASE}/login`, priority: 0.8 },
    { url: `${BASE}/register`, priority: 0.9 },
  ]

  // Main platform pages (auth required, but still indexable for SEO)
  const platformPages = [
    // Core
    "dashboard", "life-os", "morning-briefing", "daily-habits", "gratitude",
    "evening-review", "trends", "correlations", "flourishing-score",
    "character-sheet", "daily-quests", "30-day-challenges",
    // Health
    "health", "sleep-optimization", "nutrition", "strength-training",
    "supplements", "breathwork", "fascia", "cold-exposure", "sauna",
    "fasting", "peptides", "testosterone", "posture", "body-composition",
    "anxiety-toolkit", "dopamine", "water-tracker", "energy-management",
    "gut-health", "dental-health", "eye-health", "hormone-health",
    "pain-management", "mens-health", "womens-health",
    // Mind
    "mental-models", "cognitive-biases", "stoicism", "scientific-literacy",
    "decision-journal", "communication", "book-library", "negotiation-guide",
    "emergency-prep", "logical-fallacies", "critical-thinking",
    "propaganda", "philosophy", "memory-techniques",
    // Finance
    "budget", "financial-independence", "trajectory", "compound-interest",
    "financial-dashboard", "real-hourly-rate", "debt-payoff",
    "net-worth", "tax-estimator", "retirement", "investing",
    // Life systems
    "vision-board", "people", "skill-tree", "future-self", "focus-timer",
    "my-path", "goals", "habits", "routine", "planner",
    // Social
    "community", "hive-mind", "whats-new",
    // Platform
    "why", "about", "privacy", "privacy-architecture", "tools", "explore",
    "glossary", "investigate", "connections", "research-compiler",
    "world-data", "climate-data", "earn", "depin", "staking-guide",
    "contribute", "tokens",
    // Canada
    "canada", "canada/sovereignty", "canada/spending", "canada/housing",
    "canada/healthcare", "canada/root-causes", "canada/blueprint",
    "canada/oligopolies", "canada/tax-burden", "canada/immigration",
    "canada/energy", "canada/defence", "canada/food-security",
    "canada/infrastructure", "canada/demographics",
    // Chinese zodiac, lunar
    "chinese-zodiac", "lunar-cycles",
  ]

  return [
    ...publicPages.map(p => ({ ...p, lastModified: now, changeFrequency: "weekly" as const })),
    ...platformPages.map(page => ({
      url: `${BASE}/${page}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: page === "dashboard" || page === "life-os" ? 0.9 : 0.7,
    })),
  ]
}
