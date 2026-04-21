"use client"

/**
 * useSecureApi — React hook for encrypted API calls
 *
 * Wraps securePost/secureGet for easy use in components.
 * Falls back to unencrypted if no session key (backwards compatible).
 */

import { securePost, secureGet } from "@/lib/secure-api"

export function useSecureApi() {
  return { securePost, secureGet }
}
