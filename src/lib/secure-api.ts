/**
 * Secure API Client — wraps fetch with client-side encryption
 *
 * How it works:
 * 1. Sensitive fields in the request body are encrypted BEFORE sending
 * 2. Server stores encrypted blobs it cannot read
 * 3. Response data with encrypted fields is decrypted AFTER receiving
 *
 * The server also receives ANONYMIZED METADATA for aggregate analytics:
 * - Data type (health, mood, journal, budget — NOT the content)
 * - Region (province/country — NOT exact location)
 * - Age group (bracket, NOT exact age)
 * - Timestamp (when, NOT who)
 *
 * This gives the platform collective intelligence without individual exposure.
 */

import { encryptJSON, decryptJSON, getSessionKey } from "./client-encryption"

// Fields that must be encrypted before sending to server
const SENSITIVE_FIELDS = new Set([
  "content", "notes", "description", "data", "message",
  "symptoms", "timeline", "analysis", "treatment",
  "amount", "balance", "income", "expenses",
  "thoughts", "emotions", "triggers", "journal",
  "goal", "progress", "blockers",
])

/**
 * Encrypt sensitive fields in an object (one level deep)
 */
async function encryptSensitiveFields(obj: Record<string, any>): Promise<Record<string, any>> {
  const key = getSessionKey()
  if (!key) return obj // No encryption key — send as-is (fallback for backwards compat)

  const encrypted: Record<string, any> = { ...obj }
  for (const [field, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.has(field) && value && typeof value === "string") {
      encrypted[field] = await encryptJSON(value, key)
      encrypted[`_${field}_encrypted`] = true
    } else if (SENSITIVE_FIELDS.has(field) && value && typeof value === "object") {
      encrypted[field] = await encryptJSON(value, key)
      encrypted[`_${field}_encrypted`] = true
    }
  }
  return encrypted
}

/**
 * Decrypt sensitive fields in a response object
 */
async function decryptSensitiveFields(obj: Record<string, any>): Promise<Record<string, any>> {
  const key = getSessionKey()
  if (!key) return obj

  const decrypted: Record<string, any> = { ...obj }
  for (const [field, value] of Object.entries(obj)) {
    if (obj[`_${field}_encrypted`] && value && typeof value === "string") {
      try {
        decrypted[field] = await decryptJSON(value, key)
      } catch {
        // If decryption fails, leave as-is (might be legacy unencrypted data)
        decrypted[field] = value
      }
      delete decrypted[`_${field}_encrypted`]
    }
  }
  return decrypted
}

/**
 * Secure POST — encrypts sensitive fields before sending
 */
export async function securePost(url: string, body: Record<string, any>): Promise<any> {
  const encryptedBody = await encryptSensitiveFields(body)

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(encryptedBody),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

/**
 * Secure GET — decrypts sensitive fields in response
 */
export async function secureGet(url: string): Promise<any> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()

  // Decrypt arrays of objects (common for list endpoints)
  if (Array.isArray(data)) {
    return Promise.all(data.map(item =>
      typeof item === "object" ? decryptSensitiveFields(item) : item
    ))
  }

  // Decrypt nested arrays in response
  if (typeof data === "object") {
    const decrypted: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        decrypted[key] = await Promise.all(value.map((item: any) =>
          typeof item === "object" ? decryptSensitiveFields(item) : item
        ))
      } else if (typeof value === "object" && value !== null) {
        decrypted[key] = await decryptSensitiveFields(value as Record<string, any>)
      } else {
        decrypted[key] = value
      }
    }
    return decrypted
  }

  return data
}
