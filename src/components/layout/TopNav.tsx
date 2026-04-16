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

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function TopNav() {
  const { data: session } = useSession()
  const { data: wallet } = useSWR("/api/wallet", fetcher, { refreshInterval: 30000 })

  const initials = session?.user?.email?.slice(0, 2).toUpperCase() ?? "??"
  const foundBalance = wallet ? BigInt(wallet.foundBalance) : 0n
  const voiceBalance = wallet ? BigInt(wallet.voiceBalance) : 0n

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {/* Token pill */}
        <Link
          href="/wallet"
          className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs transition-colors hover:border-primary/50"
        >
          <span className="text-violet-400 font-medium">◈ {formatFound(foundBalance)} FOUND</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-indigo-400 font-medium">⬡ {formatVoice(voiceBalance)} VOICE</span>
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
