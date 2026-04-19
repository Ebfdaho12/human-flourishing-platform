import { describe, it, expect } from "vitest"
import { credibilityBadge, narrativeStatusColor } from "@/lib/aletheia-bridge"

describe("Aletheia Bridge — Display Helpers", () => {
  describe("credibilityBadge", () => {
    it("returns 'Highly Credible' for scores >= 80", () => {
      const badge = credibilityBadge(85)
      expect(badge.label).toBe("Highly Credible")
      expect(badge.color).toContain("green")
    })

    it("returns 'Generally Credible' for scores 60-79", () => {
      expect(credibilityBadge(70).label).toBe("Generally Credible")
      expect(credibilityBadge(60).label).toBe("Generally Credible")
    })

    it("returns 'Mixed Record' for scores 40-59", () => {
      expect(credibilityBadge(50).label).toBe("Mixed Record")
      expect(credibilityBadge(40).label).toBe("Mixed Record")
    })

    it("returns 'Low Credibility' for scores 20-39", () => {
      expect(credibilityBadge(30).label).toBe("Low Credibility")
    })

    it("returns 'Very Low Credibility' for scores < 20", () => {
      expect(credibilityBadge(10).label).toBe("Very Low Credibility")
      expect(credibilityBadge(0).label).toBe("Very Low Credibility")
    })

    it("handles boundary values", () => {
      expect(credibilityBadge(80).label).toBe("Highly Credible")
      expect(credibilityBadge(79).label).toBe("Generally Credible")
      expect(credibilityBadge(60).label).toBe("Generally Credible")
      expect(credibilityBadge(59).label).toBe("Mixed Record")
      expect(credibilityBadge(40).label).toBe("Mixed Record")
      expect(credibilityBadge(39).label).toBe("Low Credibility")
      expect(credibilityBadge(20).label).toBe("Low Credibility")
      expect(credibilityBadge(19).label).toBe("Very Low Credibility")
    })
  })

  describe("narrativeStatusColor", () => {
    it("returns green for ACTIVE", () => {
      expect(narrativeStatusColor("ACTIVE")).toContain("emerald")
    })

    it("returns red for DEBUNKED", () => {
      expect(narrativeStatusColor("DEBUNKED")).toContain("red")
    })

    it("returns muted for GRAVEYARD", () => {
      expect(narrativeStatusColor("GRAVEYARD")).toContain("muted")
    })

    it("returns amber for unknown status", () => {
      expect(narrativeStatusColor("UNKNOWN")).toContain("amber")
    })
  })
})
