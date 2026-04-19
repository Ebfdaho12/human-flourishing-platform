import { describe, it, expect } from "vitest"
import {
  rateLimit,
  validatePassword,
  sanitizeInput,
  sanitizeEmail,
  generateSecureToken,
} from "@/lib/security"

describe("Rate Limiter", () => {
  it("allows requests within limit", () => {
    const id = `test-${Date.now()}-allow`
    expect(rateLimit(id, 3, 60000)).toBe(true)
    expect(rateLimit(id, 3, 60000)).toBe(true)
    expect(rateLimit(id, 3, 60000)).toBe(true)
  })

  it("blocks requests over limit", () => {
    const id = `test-${Date.now()}-block`
    expect(rateLimit(id, 2, 60000)).toBe(true)
    expect(rateLimit(id, 2, 60000)).toBe(true)
    expect(rateLimit(id, 2, 60000)).toBe(false)
  })

  it("uses separate windows per identifier", () => {
    const id1 = `test-${Date.now()}-win1`
    const id2 = `test-${Date.now()}-win2`
    // Fill id1's window
    expect(rateLimit(id1, 1, 60000)).toBe(true)
    expect(rateLimit(id1, 1, 60000)).toBe(false)
    // id2 should still work — separate window
    expect(rateLimit(id2, 1, 60000)).toBe(true)
  })

  it("handles different identifiers independently", () => {
    const id1 = `test-${Date.now()}-a`
    const id2 = `test-${Date.now()}-b`
    expect(rateLimit(id1, 1, 60000)).toBe(true)
    expect(rateLimit(id1, 1, 60000)).toBe(false)
    expect(rateLimit(id2, 1, 60000)).toBe(true) // Different user, still allowed
  })
})

describe("Password Validation", () => {
  it("rejects short passwords", () => {
    const result = validatePassword("Ab1")
    expect(result.valid).toBe(false)
    expect(result.error).toContain("8 characters")
  })

  it("rejects passwords without uppercase", () => {
    const result = validatePassword("abcdefgh1")
    expect(result.valid).toBe(false)
    expect(result.error).toContain("uppercase")
  })

  it("rejects passwords without lowercase", () => {
    const result = validatePassword("ABCDEFGH1")
    expect(result.valid).toBe(false)
    expect(result.error).toContain("lowercase")
  })

  it("rejects passwords without numbers", () => {
    const result = validatePassword("Abcdefghi")
    expect(result.valid).toBe(false)
    expect(result.error).toContain("number")
  })

  it("accepts valid passwords", () => {
    expect(validatePassword("StrongPass1").valid).toBe(true)
    expect(validatePassword("MyP@ssw0rd").valid).toBe(true)
    expect(validatePassword("Abcdefg1").valid).toBe(true)
  })

  it("rejects extremely long passwords", () => {
    const long = "A".repeat(100) + "a".repeat(20) + "1".repeat(10)
    expect(validatePassword(long).valid).toBe(false)
  })
})

describe("Input Sanitization", () => {
  it("strips script tags", () => {
    const result = sanitizeInput('<script>alert("xss")</script>Hello')
    expect(result).not.toContain("<script")
    expect(result).toContain("Hello")
  })

  it("strips event handlers", () => {
    const result = sanitizeInput('<img onerror="alert(1)" src="x">')
    expect(result).not.toContain("onerror")
  })

  it("strips iframes", () => {
    const result = sanitizeInput('<iframe src="evil.com"></iframe>')
    expect(result).not.toContain("<iframe")
  })

  it("strips javascript: URIs", () => {
    const result = sanitizeInput('javascript:alert(1)')
    expect(result).not.toContain("javascript:")
  })

  it("strips form tags", () => {
    const result = sanitizeInput('<form action="evil"><input></form>')
    expect(result).not.toContain("<form")
  })

  it("preserves normal text", () => {
    expect(sanitizeInput("Hello, world!")).toBe("Hello, world!")
    expect(sanitizeInput("I have 3 < 5 items")).toBe("I have 3 < 5 items")
  })

  it("truncates to 10000 chars", () => {
    const long = "a".repeat(20000)
    expect(sanitizeInput(long).length).toBe(10000)
  })

  it("trims whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello")
  })
})

describe("Email Sanitization", () => {
  it("accepts valid emails", () => {
    expect(sanitizeEmail("user@example.com")).toBe("user@example.com")
    expect(sanitizeEmail("USER@EXAMPLE.COM")).toBe("user@example.com")
    expect(sanitizeEmail("  user@example.com  ")).toBe("user@example.com")
  })

  it("rejects invalid emails", () => {
    expect(sanitizeEmail("not-an-email")).toBeNull()
    expect(sanitizeEmail("@example.com")).toBeNull()
    expect(sanitizeEmail("user@")).toBeNull()
    expect(sanitizeEmail("")).toBeNull()
    expect(sanitizeEmail("user @example.com")).toBeNull()
  })

  it("normalizes to lowercase", () => {
    expect(sanitizeEmail("User@Example.COM")).toBe("user@example.com")
  })
})

describe("Secure Token Generation", () => {
  it("generates tokens of correct length", () => {
    expect(generateSecureToken(16).length).toBe(16)
    expect(generateSecureToken(32).length).toBe(32)
    expect(generateSecureToken(64).length).toBe(64)
  })

  it("generates unique tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateSecureToken()))
    expect(tokens.size).toBe(100) // All unique
  })

  it("only contains alphanumeric characters", () => {
    const token = generateSecureToken(100)
    expect(token).toMatch(/^[A-Za-z0-9]+$/)
  })
})
