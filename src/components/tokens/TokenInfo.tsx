"use client"

import { useState } from "react"
import { Coins, Vote, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Hoverable/clickable token info tooltip
 * Use anywhere tokens are displayed for instant education
 *
 * Usage: <TokenInfo type="FOUND" /> or <TokenInfo type="VOICE" />
 */
export function TokenInfo({ type, className }: { type: "FOUND" | "VOICE"; className?: string }) {
  const [show, setShow] = useState(false)

  const info = type === "FOUND" ? {
    icon: Coins,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    name: "FOUND",
    tagline: "Utility token — earned through meaningful activity",
    bullets: [
      "Capped supply: 369,369,369 total",
      "Earned by: health logs, learning, civic actions, research",
      "Can stake for VOICE governance power",
      "Transferable between users",
    ],
    link: "/tokens",
  } : {
    icon: Vote,
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
    name: "VOICE",
    tagline: "Governance power — your say in platform decisions",
    bullets: [
      "Earned by staking FOUND (1 per 1,000 FOUND / 90 days)",
      "Non-transferable (soulbound)",
      "Vote on features, policies, token economics",
      "Burns if you unstake — commitment required",
    ],
    link: "/tokens",
  }

  const Icon = info.icon

  return (
    <span className={cn("relative inline-block", className)}>
      <button
        onClick={() => setShow(!show)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className={cn("inline-flex items-center gap-0.5 cursor-help", info.color)}
        aria-label={`Learn about ${info.name}`}
      >
        <HelpCircle className="h-3 w-3 opacity-50" />
      </button>

      {show && (
        <div className={cn("absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-xl border shadow-xl p-3 z-50", info.bg)}>
          <div className="flex items-center gap-2 mb-2">
            <Icon className={cn("h-4 w-4", info.color)} />
            <span className={cn("font-bold text-sm", info.color)}>{info.name}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{info.tagline}</p>
          <ul className="space-y-1">
            {info.bullets.map((b, i) => (
              <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <span className="mt-1 h-1 w-1 rounded-full bg-current shrink-0" />
                {b}
              </li>
            ))}
          </ul>
          <a href={info.link} className={cn("text-[10px] font-medium mt-2 block hover:underline", info.color)}>
            Learn more →
          </a>
          {/* Arrow */}
          <div className={cn("absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-b border-r -mt-1", info.bg.split(" ")[0], info.bg.split(" ")[1])} />
        </div>
      )}
    </span>
  )
}

/**
 * Inline token display with built-in tooltip
 * Shows the balance and token name with hoverable info
 *
 * Usage: <TokenBadge type="FOUND" amount="1,250" />
 */
export function TokenBadge({ type, amount }: { type: "FOUND" | "VOICE"; amount: string }) {
  const color = type === "FOUND" ? "text-violet-600 bg-violet-50 border-violet-200" : "text-indigo-600 bg-indigo-50 border-indigo-200"
  const icon = type === "FOUND" ? "◈" : "⬡"

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", color)}>
      {icon} {amount} {type}
      <TokenInfo type={type} />
    </span>
  )
}
