"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MODULES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { ShieldCheck } from "lucide-react"
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
            Account
          </p>
          <ul className="space-y-0.5">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/explore", label: "Explore" },
              { href: "/goals", label: "Goals" },
              { href: "/timeline", label: "Timeline" },
              { href: "/digest", label: "Weekly Digest" },
              { href: "/privacy", label: "Privacy" },
              { href: "/resources", label: "Resources" },
              { href: "/about", label: "About" },
              { href: "/community", label: "Community" },
              { href: "/profile", label: "Identity" },
              { href: "/wallet", label: "Wallet" },
              { href: "/settings", label: "Settings" },
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
