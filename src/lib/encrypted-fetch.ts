"use client"

/**
 * Encrypted Fetch Utilities — Drop-in replacements for fetch()
 *
 * These wrap standard fetch with automatic encryption/decryption of sensitive fields.
 * Components can switch from plain fetch to encrypted fetch with minimal changes:
 *
 *   Before: await fetch("/api/health/entries", { method: "POST", body: JSON.stringify(data) })
 *   After:  await encryptedPost("/api/health/entries", data)
 *
 *   Before: const fetcher = (url) => fetch(url).then(r => r.json())
 *   After:  const fetcher = secureFetcher
 */

import { encryptJSON, decryptJSON, getSessionKey } from "./client-encryption"

// Fields that contain sensitive user data and must be encrypted
const SENSITIVE_FIELDS = new Set([
  "content", "notes", "description", "data", "message",
  "symptoms", "timeline", "analysis", "treatment",
  "amount", "balance", "income", "expenses",
  "thoughts", "emotions", "triggers", "journal",
  "goal", "progress", "blockers",
])

/**
 * Encrypt sensitive fields in a request body before sending
 */
async function encryptBody(body: Record<string, any>): Promise<Record<string, any>> {
  const key = getSessionKey()
  if (!key) return body // No key = no encryption (backwards compatible)

  const encrypted: Record<string, any> = { ...body }
  for (const [field, value] of Object.entries(body)) {
    if (SENSITIVE_FIELDS.has(field) && value != null && value !== "") {
      encrypted[field] = await encryptJSON(value, key)
      encrypted[`_${field}_encrypted`] = true
    }
  }
  return encrypted
}

/**
 * Decrypt sensitive fields in a response object
 */
async function decryptObject(obj: Record<string, any>): Promise<Record<string, any>> {
  const key = getSessionKey()
  if (!key) return obj

  const decrypted: Record<string, any> = { ...obj }
  for (const [field, value] of Object.entries(obj)) {
    if (obj[`_${field}_encrypted`] && typeof value === "string") {
      try {
        decrypted[field] = await decryptJSON(value, key)
      } catch {
        // Legacy unencrypted data — leave as-is
        decrypted[field] = value
      }
      delete decrypted[`_${field}_encrypted`]
    }
  }
  return decrypted
}

/**
 * Decrypt response data — handles arrays, nested arrays, and single objects
 */
async function decryptResponse(data: any): Promise<any> {
  if (!getSessionKey()) return data

  if (Array.isArray(data)) {
    return Promise.all(data.map(item =>
      typeof item === "object" && item !== null ? decryptObject(item) : item
    ))
  }

  if (typeof data === "object" && data !== null) {
    const decrypted: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        decrypted[key] = await Promise.all(value.map((item: any) =>
          typeof item === "object" && item !== null ? decryptObject(item) : item
        ))
      } else if (typeof value === "object" && value !== null) {
        decrypted[key] = await decryptObject(value as Record<string, any>)
      } else {
        decrypted[key] = value
      }
    }
    // Also decrypt top-level fields
    return decryptObject(decrypted)
  }

  return data
}

/**
 * SWR-compatible fetcher with automatic decryption
 * Drop-in replacement: const fetcher = secureFetcher
 */
export async function secureFetcher(url: string): Promise<any> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return decryptResponse(data)
}

/**
 * Encrypted POST — encrypts sensitive fields, sends request, returns response
 */
export async function encryptedPost(url: string, body: Record<string, any>): Promise<Response> {
  const encryptedBody = await encryptBody(body)
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(encryptedBody),
  })
}

/**
 * Encrypted PATCH — same as POST but PATCH method
 */
export async function encryptedPatch(url: string, body: Record<string, any>): Promise<Response> {
  const encryptedBody = await encryptBody(body)
  return fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(encryptedBody),
  })
}

/**
 * Encrypted DELETE with body
 */
export async function encryptedDelete(url: string, body?: Record<string, any>): Promise<Response> {
  return fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}
