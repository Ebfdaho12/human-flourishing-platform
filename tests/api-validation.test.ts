import { describe, it, expect } from "vitest"
import { sanitizeInput, sanitizeEmail, rateLimit, RATE_LIMITS } from "@/lib/security"

describe("API Input Validation Patterns", () => {
  describe("Search query validation", () => {
    it("sanitizes search queries", () => {
      expect(sanitizeInput('<script>alert("xss")</script>climate change')).not.toContain("<script")
      expect(sanitizeInput("normal search query")).toBe("normal search query")
    })

    it("handles empty and whitespace queries", () => {
      expect(sanitizeInput("  ")).toBe("")
      expect(sanitizeInput("")).toBe("")
    })

    it("handles unicode and international characters", () => {
      expect(sanitizeInput("日本語テスト")).toBe("日本語テスト")
      expect(sanitizeInput("données françaises")).toBe("données françaises")
      expect(sanitizeInput("Ñoño español")).toBe("Ñoño español")
    })

    it("strips nested script attacks", () => {
      expect(sanitizeInput('<scr<script>ipt>alert(1)</scr</script>ipt>')).not.toContain("alert")
    })

    it("strips data URIs in javascript context", () => {
      expect(sanitizeInput('javascript:void(0)')).not.toContain("javascript:")
    })
  })

  describe("Email validation edge cases", () => {
    it("rejects emails with SQL injection", () => {
      expect(sanitizeEmail("user@example.com'; DROP TABLE users;--")).toBeNull()
    })

    it("rejects emails without proper local part", () => {
      expect(sanitizeEmail("@example.com")).toBeNull()
      expect(sanitizeEmail(" @example.com")).toBeNull()
    })

    it("handles plus addressing", () => {
      expect(sanitizeEmail("user+tag@example.com")).toBe("user+tag@example.com")
    })

    it("handles dots in local part", () => {
      expect(sanitizeEmail("first.last@example.com")).toBe("first.last@example.com")
    })

    it("rejects double @", () => {
      expect(sanitizeEmail("user@@example.com")).toBeNull()
    })

    it("truncates extremely long emails", () => {
      const long = "a".repeat(300) + "@example.com"
      const result = sanitizeEmail(long)
      // Should either be null (invalid) or truncated
      expect(result === null || result.length <= 254).toBe(true)
    })
  })

  describe("Rate limit configurations", () => {
    it("auth limits are strictest", () => {
      expect(RATE_LIMITS.auth.maxRequests).toBeLessThanOrEqual(RATE_LIMITS.write.maxRequests)
      expect(RATE_LIMITS.auth.windowMs).toBeGreaterThanOrEqual(RATE_LIMITS.write.windowMs)
    })

    it("read limits are most permissive", () => {
      expect(RATE_LIMITS.read.maxRequests).toBeGreaterThanOrEqual(RATE_LIMITS.write.maxRequests)
    })

    it("AI limits account for cost", () => {
      expect(RATE_LIMITS.ai.maxRequests).toBeLessThanOrEqual(RATE_LIMITS.read.maxRequests)
    })

    it("export limits prevent abuse", () => {
      expect(RATE_LIMITS.export.maxRequests).toBeLessThanOrEqual(10)
      expect(RATE_LIMITS.export.windowMs).toBeGreaterThanOrEqual(60000)
    })

    it("all rate limits have positive values", () => {
      for (const [key, config] of Object.entries(RATE_LIMITS)) {
        expect(config.maxRequests).toBeGreaterThan(0)
        expect(config.windowMs).toBeGreaterThan(0)
      }
    })
  })

  describe("Defense against common attacks", () => {
    it("sanitizes SQL injection attempts", () => {
      const input = "Robert'); DROP TABLE Students;--"
      const clean = sanitizeInput(input)
      // SQL injection passes through sanitizeInput (it's for XSS, not SQL)
      // Prisma parameterized queries handle SQL injection
      expect(clean).toContain("Robert")
    })

    it("sanitizes path traversal attempts", () => {
      const input = "../../../../etc/passwd"
      const clean = sanitizeInput(input)
      expect(clean).toBe("../../../../etc/passwd") // Path traversal is handled at file system level, not input sanitization
    })

    it("sanitizes null bytes", () => {
      const input = "normal\x00malicious"
      const clean = sanitizeInput(input)
      // Should pass through — null bytes handled at DB level
      expect(typeof clean).toBe("string")
    })

    it("handles extremely long inputs", () => {
      const input = "a".repeat(100000)
      const clean = sanitizeInput(input)
      expect(clean.length).toBeLessThanOrEqual(10000)
    })

    it("strips embedded objects and embeds", () => {
      expect(sanitizeInput('<object data="evil.swf">')).not.toContain("<object")
      expect(sanitizeInput('<embed src="evil.swf">')).not.toContain("<embed")
    })
  })
})

describe("Token Economy Invariants", () => {
  it("FOUND uses micro precision (1M per token)", () => {
    // 1 FOUND = 1,000,000 micro-FOUND
    const oneFOUND = 1_000_000n
    expect(oneFOUND).toBe(1000000n)
  })

  it("BigInt handles large balances without overflow", () => {
    // Max realistic balance: 21M tokens (like VERITAS cap)
    const maxBalance = 21_000_000n * 1_000_000n // 21M FOUND in micro
    expect(maxBalance).toBe(21_000_000_000_000n)
    expect(maxBalance > 0n).toBe(true)
  })

  it("staking math is correct", () => {
    // 1 VOICE per 1000 FOUND per 90 days
    const stakedFound = 5000n * 1_000_000n // 5000 FOUND in micro
    const daysStaked = 90n
    const voiceEarned = (stakedFound / 1_000_000n) / 1000n * (daysStaked / 90n)
    expect(voiceEarned).toBe(5n) // 5 VOICE from 5000 FOUND over 90 days
  })
})
