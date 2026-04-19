"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const SHORTCUTS = [
  { key: "d", label: "Dashboard", path: "/dashboard" },
  { key: "h", label: "Health", path: "/health" },
  { key: "m", label: "Mental Health", path: "/mental-health" },
  { key: "e", label: "Education", path: "/education" },
  { key: "g", label: "Governance", path: "/governance" },
  { key: "n", label: "Energy", path: "/energy" },
  { key: "s", label: "DeSci", path: "/desci" },
  { key: "c", label: "Community", path: "/community" },
  { key: "w", label: "Wallet", path: "/wallet" },
  { key: "p", label: "Profile", path: "/profile" },
  { key: "/", label: "Search", path: null }, // Handled by SearchBar
]

export function KeyboardShortcuts() {
  const router = useRouter()
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if typing in an input
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return

      // ? for help overlay
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowHelp((prev) => !prev)
        return
      }

      // Escape to close help
      if (e.key === "Escape" && showHelp) {
        setShowHelp(false)
        return
      }

      // Ctrl/Cmd + key shortcuts
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        const shortcut = SHORTCUTS.find((s) => s.key === e.key)
        if (shortcut?.path) {
          e.preventDefault()
          router.push(shortcut.path)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router, showHelp])

  if (!showHelp) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-bold text-lg mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-1.5">
          {SHORTCUTS.filter(s => s.path).map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono">Ctrl</kbd>
                <span className="text-xs text-muted-foreground">+</span>
                <kbd className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono">{s.key.toUpperCase()}</kbd>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between py-1.5 border-t border-border mt-2 pt-3">
            <span className="text-sm text-muted-foreground">Show this help</span>
            <kbd className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono">?</kbd>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">Press Escape or click outside to close</p>
      </div>
    </div>
  )
}
