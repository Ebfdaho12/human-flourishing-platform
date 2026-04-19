import { describe, it, expect } from "vitest"
import { MODULES, TOKEN_AWARDS, MODULE_MAP } from "@/lib/constants"

describe("Module Configuration", () => {
  it("has 9 modules defined", () => {
    expect(MODULES.length).toBe(9)
  })

  it("all modules have required fields", () => {
    for (const mod of MODULES) {
      expect(mod.id).toBeTruthy()
      expect(mod.title).toBeTruthy()
      expect(mod.slug).toBeTruthy()
      expect(mod.description).toBeTruthy()
      expect(mod.tagline).toBeTruthy()
      expect(mod.icon).toBeTruthy()
      expect(mod.color).toBeTruthy()
      expect(mod.capabilities.length).toBeGreaterThan(0)
      expect(["ACTIVE", "COMING_SOON"]).toContain(mod.status)
    }
  })

  it("all module slugs are unique", () => {
    const slugs = MODULES.map((m) => m.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("all module IDs are unique", () => {
    const ids = MODULES.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("MODULE_MAP has all modules", () => {
    for (const mod of MODULES) {
      expect(MODULE_MAP[mod.id]).toBeDefined()
      expect(MODULE_MAP[mod.id].slug).toBe(mod.slug)
    }
  })

  it("includes core modules", () => {
    const ids = MODULES.map((m) => m.id)
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
})

describe("Token Awards", () => {
  it("all awards are BigInt", () => {
    for (const [key, value] of Object.entries(TOKEN_AWARDS)) {
      expect(typeof value).toBe("bigint")
    }
  })

  it("all awards are positive", () => {
    for (const [key, value] of Object.entries(TOKEN_AWARDS)) {
      expect(value > 0n).toBe(true)
    }
  })

  it("signup bonus is 100 FOUND", () => {
    expect(TOKEN_AWARDS.ACCOUNT_CREATED).toBe(100_000_000n)
  })

  it("first claim bonus is 50 FOUND", () => {
    expect(TOKEN_AWARDS.FIRST_CLAIM).toBe(50_000_000n)
  })

  it("profile complete is 200 FOUND", () => {
    expect(TOKEN_AWARDS.PROFILE_COMPLETE).toBe(200_000_000n)
  })

  it("week streaks award more than daily actions", () => {
    expect(TOKEN_AWARDS.HEALTH_WEEK_STREAK).toBeGreaterThan(TOKEN_AWARDS.HEALTH_FIRST_LOG)
    expect(TOKEN_AWARDS.MOOD_WEEK_STREAK).toBeGreaterThan(TOKEN_AWARDS.MOOD_FIRST_LOG)
  })

  it("month streaks award more than week streaks", () => {
    expect(TOKEN_AWARDS.HEALTH_MONTH_STREAK).toBeGreaterThan(TOKEN_AWARDS.HEALTH_WEEK_STREAK)
  })

  it("DeSci pre-registration awards most in that category", () => {
    expect(TOKEN_AWARDS.DESCI_PRE_REGISTER).toBeGreaterThanOrEqual(TOKEN_AWARDS.DESCI_PEER_REVIEW)
    expect(TOKEN_AWARDS.DESCI_PRE_REGISTER).toBeGreaterThanOrEqual(TOKEN_AWARDS.DESCI_REPLICATION)
  })
})
