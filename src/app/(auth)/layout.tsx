import { ShieldCheck, Lock, Eye, Database } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between">
        {/* Decorative shapes */}
        <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

        <div>
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Human Flourishing</span>
          </Link>

          <h2 className="text-4xl font-bold text-white leading-tight mb-6">
            Nine systems.<br />One identity.<br />Your data.
          </h2>
          <p className="text-white/70 text-lg max-w-md leading-relaxed">
            Health intelligence. Socratic education. Governance transparency.
            All connected by a sovereignty-first identity layer.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>End-to-end encrypted with AES-256-GCM</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Zero-knowledge proofs for identity</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Export everything. Delete everything. No lock-in.</span>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 bg-background">
        <div className="lg:hidden mb-8 flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold">Human Flourishing</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
