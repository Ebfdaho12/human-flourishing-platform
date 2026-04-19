import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-6">
        <ShieldCheck className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-lg text-muted-foreground mb-6">This page doesn't exist yet.</p>
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        The Human Flourishing Platform is growing. This page may be coming soon,
        or you might have followed an outdated link.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}
