"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MODULES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { ShieldCheck, Sun, CheckSquare, Heart, Moon, TrendingUp, BarChart3, Sparkles, Compass } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
          <ShieldCheck className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">HFP</p>
          <p className="text-[10px] text-muted-foreground">Human Flourishing</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {/* Daily Rhythm — the core engagement loop */}
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Daily Rhythm
        </p>
        <ul className="space-y-0.5 mb-3">
          {[
            { href: "/morning-briefing", label: "Morning Briefing", icon: Sun, color: "text-amber-500" },
            { href: "/daily-habits", label: "Daily Habits", icon: CheckSquare, color: "text-emerald-500" },
            { href: "/gratitude", label: "Gratitude", icon: Heart, color: "text-rose-400" },
            { href: "/evening-review", label: "Evening Review", icon: Moon, color: "text-indigo-500" },
            { href: "/trends", label: "Your Trends", icon: TrendingUp, color: "text-violet-500" },
            { href: "/correlations", label: "Correlations", icon: BarChart3, color: "text-blue-500" },
          ].map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : item.color)} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Modules
        </p>
        <ul className="space-y-0.5">
          {MODULES.map((mod) => {
            const isActive = pathname.startsWith(`/${mod.slug}`)
            const Icon = mod.icon
            return (
              <li key={mod.id}>
                <Link
                  href={`/${mod.slug}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-primary" : mod.status === "ACTIVE" ? "text-muted-foreground" : "text-muted-foreground/50"
                    )}
                  />
                  <span className={mod.status === "COMING_SOON" ? "text-muted-foreground/60" : ""}>
                    {mod.title}
                  </span>
                  {mod.status === "COMING_SOON" && (
                    <Badge variant="outline" className="ml-auto text-[9px] px-1.5 py-0 h-4 border-border text-muted-foreground">
                      Soon
                    </Badge>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Discover
          </p>
          <ul className="space-y-0.5">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/tools", label: "All Tools" },
              { href: "/my-path", label: "My Path" },
              { href: "/whats-new", label: "What's New" },
              { href: "/canada/index", label: "Canada" },
              { href: "/explore", label: "Explore" },
              { href: "/community/hub", label: "Community" },
              { href: "/goals", label: "Goals" },
              { href: "/progress", label: "Progress" },
              { href: "/weekly-reflection", label: "Weekly Reflection" },
              { href: "/trajectory", label: "Life Trajectory" },
              { href: "/digest", label: "Weekly Digest" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Account
          </p>
          <ul className="space-y-0.5">
            {[
              { href: "/profile", label: "Identity" },
              { href: "/wallet", label: "Wallet" },
              { href: "/privacy-architecture", label: "Privacy" },
              { href: "/settings", label: "Settings" },
              { href: "/report-issue", label: "Report Issue" },
              { href: "/admin", label: "Admin" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Version */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground">v0.1.0-mvp · Open Source</p>
      </div>
    </aside>
  )
}
