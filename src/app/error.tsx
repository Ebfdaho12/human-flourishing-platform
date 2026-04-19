"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        An unexpected error occurred. This has been noted. Your data is safe.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground mb-4 font-mono">Error ID: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <Button onClick={reset}>
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
          <Home className="h-4 w-4" /> Dashboard
        </Button>
      </div>
    </div>
  )
}
