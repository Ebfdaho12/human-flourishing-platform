"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MODULES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { ShieldCheck, Menu, X, Sun, CheckSquare, Heart, Moon as MoonIcon, TrendingUp, BarChart3 } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Slide-out nav */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-xl overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">HFP</p>
                  <p className="text-[10px] text-muted-foreground">Human Flourishing</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="py-3 px-2">
              {/* Daily Rhythm */}
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Daily Rhythm</p>
              <ul className="space-y-0.5 mb-3">
                {[
                  { href: "/morning-briefing", label: "Morning Briefing", icon: Sun, color: "text-amber-500" },
                  { href: "/daily-habits", label: "Daily Habits", icon: CheckSquare, color: "text-emerald-500" },
                  { href: "/gratitude", label: "Gratitude", icon: Heart, color: "text-rose-400" },
                  { href: "/evening-review", label: "Evening Review", icon: MoonIcon, color: "text-indigo-500" },
                  { href: "/trends", label: "Your Trends", icon: TrendingUp, color: "text-violet-500" },
                  { href: "/correlations", label: "Correlations", icon: BarChart3, color: "text-blue-500" },
                ].map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link href={item.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors", isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground")}>
                        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : item.color)} />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {/* Health */}
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Health</p>
              <ul className="space-y-0.5 mb-3">
                {["/health", "/sleep-optimization", "/nutrition", "/strength-training", "/supplements", "/breathwork", "/fascia"].map(href => {
                  const label = href.slice(1).split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")
                  return (
                    <li key={href}><Link href={href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors", pathname === href ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground")}>{label}</Link></li>
                  )
                })}
              </ul>

              {/* Modules */}
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Modules</p>
              <ul className="space-y-0.5">
                {MODULES.map((mod) => {
                  const isActive = pathname.startsWith(`/${mod.slug}`)
                  const Icon = mod.icon
                  return (
                    <li key={mod.id}>
                      <Link href={`/${mod.slug}`} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors", isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground")}>
                        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                        <span>{mod.title}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {/* Discover */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Discover</p>
                <ul className="space-y-0.5">
                  {[
                    { href: "/dashboard", label: "Dashboard" },
                    { href: "/life-os", label: "Life OS" },
                    { href: "/character-sheet", label: "Character Sheet" },
                    { href: "/tools", label: "All Tools" },
                    { href: "/my-path", label: "My Path" },
                    { href: "/30-day-challenges", label: "Challenges" },
                    { href: "/canada/index", label: "Canada" },
                    { href: "/community/hub", label: "Community" },
                    { href: "/people", label: "People" },
                    { href: "/book-library", label: "Book Library" },
                    { href: "/whats-new", label: "What's New" },
                  ].map((item) => (
                    <li key={item.href}><Link href={item.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors", pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground")}>{item.label}</Link></li>
                  ))}
                </ul>
              </div>

              {/* Account */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Account</p>
                <ul className="space-y-0.5">
                  {[
                    { href: "/profile", label: "Identity" },
                    { href: "/wallet", label: "Wallet" },
                    { href: "/privacy-architecture", label: "Privacy" },
                    { href: "/settings", label: "Settings" },
                    { href: "/report-issue", label: "Report Issue" },
                    { href: "/admin", label: "Admin" },
                  ].map((item) => (
                    <li key={item.href}><Link href={item.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors", pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground")}>{item.label}</Link></li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
