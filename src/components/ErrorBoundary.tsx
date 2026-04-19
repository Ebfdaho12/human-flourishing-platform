"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <h3 className="font-semibold text-sm mb-1">Something went wrong</h3>
          <p className="text-xs text-muted-foreground mb-4">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
