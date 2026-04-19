import { describe, it, expect } from "vitest"
import { formatFound, formatVoice, formatDate, formatDateTime, cn } from "@/lib/utils"

describe("Token Formatting", () => {
  it("formats zero balance", () => {
    expect(formatFound(0n)).toBe("0")
  })

  it("formats whole FOUND amounts", () => {
    expect(formatFound(100_000_000n)).toBe("100")
    expect(formatFound(1_000_000n)).toBe("1")
    expect(formatFound(1_000_000_000n)).toBe("1,000")
  })

  it("formats fractional FOUND amounts", () => {
    expect(formatFound(1_500_000n)).toBe("1.5")
    expect(formatFound(500_000n)).toBe("0.5")
  })

  it("formats large FOUND amounts", () => {
    const billion = 1_000_000_000_000_000n // 1 billion FOUND
    const formatted = formatFound(billion)
    expect(formatted).toContain("1,000,000,000")
  })

  it("formats VOICE amounts", () => {
    expect(formatVoice(0n)).toBe("0")
    expect(formatVoice(100n)).toBe("100")
    expect(formatVoice(1_000_000n)).toBe("1,000,000")
  })
})

describe("Date Formatting", () => {
  it("formats dates correctly", () => {
    // Use noon UTC to avoid timezone boundary issues
    const result = formatDate("2026-04-18T12:00:00Z")
    expect(result).toContain("Apr")
    expect(result).toContain("2026")
  })

  it("formats datetime correctly", () => {
    const result = formatDateTime("2026-04-18T14:30:00Z")
    expect(result).toContain("Apr")
    expect(result).toContain("2026")
  })

  it("returns a non-empty string for Date objects", () => {
    const result = formatDate(new Date("2026-06-15T12:00:00Z"))
    expect(result.length).toBeGreaterThan(0)
    expect(result).toContain("2026")
  })
})

describe("cn (className merger)", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional classes", () => {
    expect(cn("base", true && "active", false && "hidden")).toBe("base active")
  })

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null)).toBe("base")
  })

  it("deduplicates Tailwind classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })
})
