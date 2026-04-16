import { ShieldCheck } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold">Human Flourishing Platform</h1>
          <p className="text-sm text-muted-foreground">Sovereignty first. Built to last.</p>
        </div>
      </div>
      {children}
    </div>
  )
}
