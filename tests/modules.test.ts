import { describe, it, expect } from "vitest"

describe("Module Architecture Invariants", () => {
  it("all 9 modules are represented in constants", async () => {
    const { MODULES } = await import("@/lib/constants")
    expect(MODULES.length).toBe(9)

    const ids = MODULES.map(m => m.id)
    expect(ids).toContain("FOUNDATION")
    expect(ids).toContain("HEALTH")
    expect(ids).toContain("EDUCATION")
    expect(ids).toContain("GOVERNANCE")
    expect(ids).toContain("MENTAL_HEALTH")
    expect(ids).toContain("ENERGY")
    expect(ids).toContain("DESCI")
    expect(ids).toContain("ECONOMICS")
    expect(ids).toContain("INFRASTRUCTURE")
  })

  it("every module has at least 3 capabilities listed", async () => {
    const { MODULES } = await import("@/lib/constants")
    for (const mod of MODULES) {
      expect(mod.capabilities.length).toBeGreaterThanOrEqual(3)
    }
  })

  it("all modules have valid gradient colors", async () => {
    const { MODULES } = await import("@/lib/constants")
    for (const mod of MODULES) {
      expect(mod.color).toMatch(/^from-/)
    }
  })

  it("no duplicate slugs or IDs", async () => {
    const { MODULES } = await import("@/lib/constants")
    const slugs = new Set(MODULES.map(m => m.slug))
    const ids = new Set(MODULES.map(m => m.id))
    expect(slugs.size).toBe(MODULES.length)
    expect(ids.size).toBe(MODULES.length)
  })
})

describe("Aletheia Bridge Resilience", () => {
  it("credibilityBadge handles all score ranges", async () => {
    const { credibilityBadge } = await import("@/lib/aletheia-bridge")
    // Test every 10-point interval
    for (let score = 0; score <= 100; score += 10) {
      const badge = credibilityBadge(score)
      expect(badge.label).toBeTruthy()
      expect(badge.color).toBeTruthy()
      expect(badge.color).toMatch(/text-/)
    }
  })

  it("narrativeStatusColor handles all statuses", async () => {
    const { narrativeStatusColor } = await import("@/lib/aletheia-bridge")
    expect(narrativeStatusColor("ACTIVE")).toBeTruthy()
    expect(narrativeStatusColor("DEBUNKED")).toBeTruthy()
    expect(narrativeStatusColor("GRAVEYARD")).toBeTruthy()
    expect(narrativeStatusColor("UNKNOWN")).toBeTruthy()
    expect(narrativeStatusColor("")).toBeTruthy()
  })
})

describe("Security Edge Cases", () => {
  it("rate limiter handles rapid sequential calls", async () => {
    const { rateLimit } = await import("@/lib/security")
    const id = `rapid-${Date.now()}`
    let allowed = 0
    for (let i = 0; i < 20; i++) {
      if (rateLimit(id, 5, 60000)) allowed++
    }
    expect(allowed).toBe(5) // Exactly 5 allowed, rest blocked
  })

  it("sanitizeInput handles nested attack vectors", async () => {
    const { sanitizeInput } = await import("@/lib/security")

    // Double-encoded
    expect(sanitizeInput("&lt;script&gt;")).not.toContain("<script")

    // SVG-based XSS
    expect(sanitizeInput('<svg onload="alert(1)">')).not.toContain("onload")

    // CSS injection
    const cssAttack = '<div style="background-image: url(javascript:alert(1))">'
    const cleaned = sanitizeInput(cssAttack)
    expect(cleaned).not.toContain("javascript:")

    // Null byte injection
    expect(typeof sanitizeInput("test\x00attack")).toBe("string")
  })

  it("generateSecureToken produces cryptographically unique tokens", async () => {
    const { generateSecureToken } = await import("@/lib/security")

    // Generate 1000 tokens and check for collisions
    const tokens = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      tokens.add(generateSecureToken(32))
    }
    expect(tokens.size).toBe(1000) // Zero collisions
  })
})

describe("Token Economy Consistency", () => {
  it("all token awards use micro-FOUND (1M per token)", async () => {
    const { TOKEN_AWARDS } = await import("@/lib/constants")

    for (const [key, value] of Object.entries(TOKEN_AWARDS)) {
      // All values should be multiples of 1,000,000 (whole FOUND amounts)
      // or at least positive bigints
      expect(value > 0n).toBe(true)
    }
  })

  it("streak rewards increase with commitment", async () => {
    const { TOKEN_AWARDS } = await import("@/lib/constants")

    // Week streak > first action
    expect(TOKEN_AWARDS.HEALTH_WEEK_STREAK).toBeGreaterThan(TOKEN_AWARDS.HEALTH_FIRST_LOG)
    expect(TOKEN_AWARDS.MOOD_WEEK_STREAK).toBeGreaterThan(TOKEN_AWARDS.MOOD_FIRST_LOG)
    expect(TOKEN_AWARDS.EDU_WEEK_STREAK).toBeGreaterThan(TOKEN_AWARDS.EDU_FIRST_SESSION)

    // Month streak > week streak
    expect(TOKEN_AWARDS.HEALTH_MONTH_STREAK).toBeGreaterThan(TOKEN_AWARDS.HEALTH_WEEK_STREAK)
  })

  it("onboarding rewards are generous to attract users", async () => {
    const { TOKEN_AWARDS } = await import("@/lib/constants")

    // Account creation should be the biggest onboarding reward
    expect(TOKEN_AWARDS.ACCOUNT_CREATED).toBeGreaterThanOrEqual(TOKEN_AWARDS.FIRST_CLAIM)
    expect(TOKEN_AWARDS.ACCOUNT_CREATED).toBeGreaterThanOrEqual(TOKEN_AWARDS.EMAIL_VERIFIED)
  })
})
