"use client"
import { useSession, signOut } from "next-auth/react"
import useSWR from "swr"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatFound, formatVoice } from "@/lib/utils"
import { Search } from "lucide-react"
import { MobileNav } from "./MobileNav"
import { SearchBar } from "./SearchBar"
import { ThemeToggle } from "./ThemeToggle"
import { NotificationBell } from "./NotificationBell"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function TopNav() {
  const { data: session } = useSession()
  const { data: wallet } = useSWR("/api/wallet", fetcher, { refreshInterval: 30000 })

  const initials = session?.user?.email?.slice(0, 2).toUpperCase() ?? "??"
  const foundBalance = wallet ? BigInt(wallet.foundBalance) : 0n
  const voiceBalance = wallet ? BigInt(wallet.voiceBalance) : 0n

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <MobileNav />
      <SearchBar />

      <div className="flex items-center gap-4">
        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Search pages (Cmd+K)"
        >
          <Search className="h-3.5 w-3.5" />
          <kbd className="hidden lg:inline-flex h-5 items-center rounded border border-border bg-background px-1.5 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>
        <NotificationBell />
        <ThemeToggle />

        {/* Token pill — abbreviated on mobile */}
        <Link
          href="/wallet"
          className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs transition-colors hover:border-primary/50"
        >
          <span className="text-violet-400 font-medium">◈ {formatFound(foundBalance)} <span className="hidden sm:inline">FOUND</span></span>
          <span className="text-muted-foreground hidden sm:inline">|</span>
          <span className="text-indigo-400 font-medium hidden sm:inline">⬡ {formatVoice(voiceBalance)} VOICE</span>
        </Link>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none">
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/50 transition-all">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            <DropdownMenuLabel className="font-normal">
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Identity</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/wallet">Wallet</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
