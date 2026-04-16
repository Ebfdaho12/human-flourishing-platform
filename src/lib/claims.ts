import { createHash, createCipheriv, createDecipheriv, randomBytes, hkdfSync } from "crypto"

export const CLAIM_TYPES = [
  { value: "FULL_NAME", label: "Full Name" },
  { value: "DATE_OF_BIRTH", label: "Date of Birth" },
  { value: "EMAIL_ADDRESS", label: "Email Address" },
  { value: "PHONE_NUMBER", label: "Phone Number" },
  { value: "NATIONALITY", label: "Nationality" },
  { value: "RESIDENTIAL_REGION", label: "Residential Region" },
  { value: "PROFESSIONAL_CREDENTIAL", label: "Professional Credential" },
  { value: "EDUCATIONAL_CREDENTIAL", label: "Educational Credential" },
] as const

export type ClaimTypeValue = (typeof CLAIM_TYPES)[number]["value"]

export function validateClaim(type: string, value: string): { valid: boolean; error?: string } {
  if (!value.trim()) return { valid: false, error: "Value cannot be empty" }

  switch (type) {
    case "DATE_OF_BIRTH": {
      const d = new Date(value)
      if (isNaN(d.getTime())) return { valid: false, error: "Invalid date format" }
      if (d > new Date()) return { valid: false, error: "Date of birth cannot be in the future" }
      break
    }
    case "EMAIL_ADDRESS": {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return { valid: false, error: "Invalid email address" }
      break
    }
    case "PHONE_NUMBER": {
      if (!/^\+?[\d\s\-().]{7,20}$/.test(value))
        return { valid: false, error: "Invalid phone number" }
      break
    }
  }

  return { valid: true }
}

export function computeLeafHash(claimType: string, value: string): string {
  return createHash("sha256")
    .update(`${claimType}:${value}`)
    .digest("hex")
}

export function computeMerkleRoot(
  leaves: Array<{ claimType: string; valueHash: string | null }>
): string {
  if (leaves.length === 0) return ""
  const hashes = leaves
    .filter((l) => l.valueHash)
    .map((l) => l.valueHash as string)
    .sort()

  if (hashes.length === 0) return ""

  let level = hashes
  while (level.length > 1) {
    const next: string[] = []
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = level[i + 1] ?? level[i]
      next.push(createHash("sha256").update(left + right).digest("hex"))
    }
    level = next
  }
  return level[0]
}

// ─── AES-256-GCM encryption ───────────────────────────────────────────────
// Format: "v2:<iv_b64>:<tag_b64>:<ciphertext_b64>"
// Prefix "v2:" distinguishes from the old XOR format ("v1:" or no prefix).

function deriveKey(userId: string): Buffer {
  const secret = process.env.CLAIM_ENCRYPTION_SECRET ?? "dev-secret-change-in-production"
  // HKDF-SHA256 — deterministic 32-byte key per user
  return Buffer.from(
    hkdfSync("sha256", Buffer.from(secret), Buffer.from(userId), Buffer.from("hfp-claim-v2"), 32)
  )
}

export function encryptClaimValue(value: string, userId: string): string {
  const key = deriveKey(userId)
  const iv = randomBytes(12) // 96-bit IV for GCM
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v2:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`
}

export function decryptClaimValue(encrypted: string, userId: string): string {
  if (encrypted.startsWith("v2:")) {
    // AES-256-GCM
    const parts = encrypted.split(":")
    if (parts.length !== 4) throw new Error("Invalid ciphertext format")
    const iv = Buffer.from(parts[1], "base64")
    const tag = Buffer.from(parts[2], "base64")
    const ciphertext = Buffer.from(parts[3], "base64")
    const key = deriveKey(userId)
    const decipher = createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8")
  }

  // Legacy XOR fallback for values encrypted before the upgrade
  const secret = process.env.CLAIM_ENCRYPTION_SECRET ?? "dev-secret"
  const key = createHash("sha256").update(`${secret}:${userId}`).digest()
  const buf = Buffer.from(encrypted, "base64")
  const decrypted = Buffer.alloc(buf.length)
  for (let i = 0; i < buf.length; i++) {
    decrypted[i] = buf[i] ^ key[i % key.length]
  }
  return decrypted.toString("utf8")
}
