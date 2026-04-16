import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFound(microFound: bigint): string {
  const whole = microFound / 1_000_000n
  const frac = microFound % 1_000_000n
  const fracStr = frac.toString().padStart(6, "0").replace(/0+$/, "")
  return fracStr ? `${whole.toLocaleString()}.${fracStr}` : whole.toLocaleString()
}

export function formatVoice(microVoice: bigint): string {
  return microVoice.toLocaleString()
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function generateCuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
