/**
 * Client-Side Encryption — Zero-Knowledge Architecture
 *
 * ALL sensitive user data is encrypted IN THE BROWSER before being sent
 * to the server. The server NEVER sees plaintext. The encryption key is
 * derived from the user's password and NEVER leaves the browser.
 *
 * This means:
 * - The platform owner CANNOT read user data (no key)
 * - A court subpoena gets encrypted blobs (useless without user's password)
 * - A database breach exposes ONLY encrypted data (useless without keys)
 * - The user's password IS the encryption key (lose password = lose data)
 *
 * How it works:
 * 1. User logs in with password
 * 2. Browser derives an AES-256-GCM encryption key from the password using PBKDF2
 * 3. The derived key is stored ONLY in browser memory (sessionStorage, cleared on tab close)
 * 4. All sensitive data is encrypted with this key BEFORE any API call
 * 5. Server stores encrypted blobs — it cannot read them
 * 6. When user loads data, browser decrypts it locally
 *
 * The server NEVER receives the password-derived key.
 * The server NEVER receives plaintext sensitive data.
 * Even if the entire database is stolen, the data is worthless without individual user passwords.
 */

// Browser-native Web Crypto API — no external dependencies
const ALGORITHM = "AES-GCM"
const KEY_LENGTH = 256
const IV_LENGTH = 12
const SALT_LENGTH = 16
const ITERATIONS = 100000

/**
 * Derive an encryption key from the user's password
 * Uses PBKDF2 with 100,000 iterations — computationally expensive to brute-force
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  )
}

/**
 * Encrypt plaintext data — returns base64 string containing salt + iv + ciphertext
 */
export async function encryptData(plaintext: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(password, salt)

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  )

  // Combine salt + iv + ciphertext into one blob
  const combined = new Uint8Array(salt.length + iv.length + new Uint8Array(ciphertext).length)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length)

  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypt encrypted data — expects base64 string from encryptData
 */
export async function decryptData(encrypted: string, password: string): Promise<string> {
  const combined = new Uint8Array(atob(encrypted).split("").map(c => c.charCodeAt(0)))

  const salt = combined.slice(0, SALT_LENGTH)
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH)

  const key = await deriveKey(password, salt)

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  )

  return new TextDecoder().decode(decrypted)
}

/**
 * Encrypt a JSON object
 */
export async function encryptJSON(data: any, password: string): Promise<string> {
  return encryptData(JSON.stringify(data), password)
}

/**
 * Decrypt a JSON object
 */
export async function decryptJSON<T = any>(encrypted: string, password: string): Promise<T> {
  const decrypted = await decryptData(encrypted, password)
  return JSON.parse(decrypted)
}

// ─── Session Key Management ──────────────────────────────────────

const SESSION_KEY = "hfp-encryption-key"

/**
 * Store the encryption key material in sessionStorage (cleared when tab closes)
 * NEVER stored in localStorage (persists) or cookies (sent to server)
 *
 * SECURITY NOTE: We store the password in sessionStorage because PBKDF2 needs
 * it to derive the AES key on each encrypt/decrypt operation. sessionStorage is:
 * - Cleared when the tab closes (not persistent)
 * - Not sent to the server (unlike cookies)
 * - Only accessible from the same origin (same-origin policy)
 * - Vulnerable to XSS — but if an attacker has XSS, they can already
 *   intercept the password at login time, so sessionStorage is not the
 *   weakest link. The real defense is preventing XSS (which we do via
 *   CSP headers, input sanitization, and DOMPurify).
 *
 * The stored value is base64-encoded to prevent casual inspection in
 * browser dev tools (not encryption — just obfuscation for shoulder-surfing).
 */
export function storeSessionKey(password: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, btoa(password))
  }
}

/**
 * Retrieve the session key
 */
export function getSessionKey(): string | null {
  if (typeof window === "undefined") return null
  const stored = sessionStorage.getItem(SESSION_KEY)
  if (!stored) return null
  try { return atob(stored) } catch { return stored } // fallback for pre-encoding values
}

/**
 * Clear the session key (logout)
 */
export function clearSessionKey(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_KEY)
  }
}

/**
 * Check if client-side encryption is available (key is in session)
 */
export function isEncryptionReady(): boolean {
  return getSessionKey() !== null
}
