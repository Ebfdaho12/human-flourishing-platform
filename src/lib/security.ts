/**
 * Security utilities for the Human Flourishing Platform.
 * Rate limiting, input validation, password strength.
 *
 * Built for scale: rate limiter self-cleans, handles concurrent access,
 * and operates within bounded memory.
 */

// ─── Rate Limiter ────────────────────────────────────────────────────────────
// Uses Redis (Upstash) when UPSTASH_REDIS_REST_URL is set, falls back to in-memory.
// Redis mode survives deployments and works across horizontal instances.

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const CLEANUP_INTERVAL = 60000
const MAX_ENTRIES = 100000

let lastCleanup = Date.now()

function cleanupExpiredEntries() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key)
    }
  }

  if (rateLimitMap.size > MAX_ENTRIES) {
    const entries = Array.from(rateLimitMap.entries())
    entries.sort((a, b) => a[1].resetAt - b[1].resetAt)
    const toRemove = entries.slice(0, Math.floor(MAX_ENTRIES * 0.3))
    for (const [key] of toRemove) {
      rateLimitMap.delete(key)
    }
  }
}

/**
 * Redis-based rate limit (when UPSTASH_REDIS_REST_URL is configured)
 * Uses Upstash REST API — no SDK dependency needed.
 */
async function redisRateLimit(identifier: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return memoryRateLimit(identifier, maxRequests, windowMs)

  try {
    const key = `rl:${identifier}`
    const windowSec = Math.ceil(windowMs / 1000)

    // INCR + EXPIRE in a pipeline
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSec],
      ]),
    })

    const data = await res.json()
    const count = data?.[0]?.result ?? 1
    return count <= maxRequests
  } catch {
    // Redis unavailable — fall back to in-memory
    return memoryRateLimit(identifier, maxRequests, windowMs)
  }
}

/**
 * In-memory rate limit (fallback when Redis is unavailable)
 */
function memoryRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  cleanupExpiredEntries()

  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) return false
  entry.count++
  return true
}

/**
 * Check rate limit for an identifier (userId, IP, etc.)
 * Returns true if request is allowed, false if rate limited.
 *
 * Automatically uses Redis when UPSTASH_REDIS_REST_URL is set,
 * falls back to in-memory otherwise.
 */
export function rateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
  // Synchronous API for backwards compatibility — uses in-memory
  // For async Redis rate limiting, use rateLimitAsync()
  return memoryRateLimit(identifier, maxRequests, windowMs)
}

/**
 * Async rate limit — uses Redis when available, in-memory fallback
 */
export async function rateLimitAsync(identifier: string, maxRequests = 10, windowMs = 60000): Promise<boolean> {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    return redisRateLimit(identifier, maxRequests, windowMs)
  }
  return memoryRateLimit(identifier, maxRequests, windowMs)
}

export function rateLimitResponse() {
  return { error: "Too many requests. Please try again later." }
}

/**
 * Rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  auth: { maxRequests: 5, windowMs: 300000 },      // 5 per 5 min
  write: { maxRequests: 30, windowMs: 60000 },      // 30 per min
  read: { maxRequests: 60, windowMs: 60000 },       // 60 per min
  ai: { maxRequests: 10, windowMs: 60000 },          // 10 per min (API cost)
  export: { maxRequests: 5, windowMs: 300000 },      // 5 per 5 min
  search: { maxRequests: 30, windowMs: 60000 },      // 30 per min
} as const

// ─── Input Validation ────────────────────────────────────────────────────────

/**
 * Sanitize user input — strip potential XSS/injection vectors
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/<iframe/gi, "")
    .replace(/<object/gi, "")
    .replace(/<embed/gi, "")
    .replace(/<form/gi, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, 10000) // Max 10k chars per field
}

/**
 * Validate and sanitize an email address
 */
export function sanitizeEmail(email: string): string | null {
  const cleaned = email.trim().toLowerCase().slice(0, 254)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(cleaned) ? cleaned : null
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) return { valid: false, error: "Password must be at least 8 characters" }
  if (password.length > 128) return { valid: false, error: "Password too long" }
  if (!/[A-Z]/.test(password)) return { valid: false, error: "Password must contain at least one uppercase letter" }
  if (!/[a-z]/.test(password)) return { valid: false, error: "Password must contain at least one lowercase letter" }
  if (!/[0-9]/.test(password)) return { valid: false, error: "Password must contain at least one number" }
  return { valid: true }
}

/**
 * Generate a cryptographically strong random string
 */
export function generateSecureToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const values = new Uint8Array(length)
  crypto.getRandomValues(values)
  return Array.from(values, (v) => chars[v % chars.length]).join("")
}
