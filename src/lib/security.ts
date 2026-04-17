/**
 * Security utilities for the Human Flourishing Platform.
 * Rate limiting, input validation, password strength.
 */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
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

export function rateLimitResponse() {
  return { error: "Too many requests. Please try again later." }
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) return { valid: false, error: "Password must be at least 8 characters" }
  if (password.length > 128) return { valid: false, error: "Password too long" }
  if (!/[A-Z]/.test(password)) return { valid: false, error: "Password must contain at least one uppercase letter" }
  if (!/[a-z]/.test(password)) return { valid: false, error: "Password must contain at least one lowercase letter" }
  if (!/[0-9]/.test(password)) return { valid: false, error: "Password must contain at least one number" }
  return { valid: true }
}
