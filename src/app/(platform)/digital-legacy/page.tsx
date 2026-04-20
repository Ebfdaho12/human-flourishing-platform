"use client"

import { useState } from "react"
import { Lock, ChevronDown, AlertTriangle, Key, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const TOPICS: {
  title: string
  tag: string
  tagColor: string
  icon: string
  summary: string
  body: { label: string; text: string }[]
  warning?: string
  action?: string
}[] = [
  {
    title: "What Happens to Your Online Accounts",
    tag: "Overview",
    tagColor: "text-slate-500 border-slate-300",
    icon: "🌐",
    summary: "Most platforms have no idea you are dead — and your family has no legal right to access your accounts without planning.",
    body: [
      { label: "Google / Gmail", text: "Google's Inactive Account Manager lets you designate a trusted contact to access your account after 3-18 months of inactivity, or to delete it. Without this, your emails, Drive files, and photos are locked forever. Set this up now at myaccount.google.com → Data & Privacy → Inactive Account Manager." },
      { label: "Facebook / Instagram", text: "Facebook allows you to designate a Legacy Contact — someone who can manage your memorialized profile after your death. They cannot read your messages or log in, but they can change the profile photo, pin a post, and respond to friend requests. You can also choose to delete your account after death." },
      { label: "Banking accounts", text: "Your bank accounts pass through your estate — they are NOT digital legacy issues. They require probate or a beneficiary designation. However, online-only accounts (Wealthsimple, EQ Bank, cryptocurrency exchanges) may have unique access challenges if no one knows the login." },
      { label: "Streaming & subscriptions", text: "Netflix, Spotify, and similar services will continue charging your card indefinitely if no one cancels them. Someone needs to know these exist and how to cancel them. A digital asset inventory (see below) solves this." },
    ],
    action: "Go to myaccount.google.com → Inactive Account Manager and set up a trusted contact today. Takes 5 minutes.",
  },
  {
    title: "Password Management",
    tag: "Access",
    tagColor: "text-blue-500 border-blue-300",
    icon: "🔑",
    summary: "A password manager is not just a security tool — it is your digital estate plan. Without it, your accounts are inaccessible forever.",
    body: [
      { label: "Use a password manager", text: "1Password, Bitwarden, or Dashlane — pick one and use it for everything. Every account you own, every password, every 2FA code. This is the foundation of both security AND digital legacy planning." },
      { label: "Share the master password securely", text: "Write your password manager's master password on paper. Store it in a fireproof safe or a sealed envelope with your will. Tell your executor it exists and where it is. Do NOT store it digitally only — that defeats the purpose." },
      { label: "Emergency access feature", text: "1Password and Bitwarden both have Emergency Access features — you designate a trusted person who can request access. You are notified and have a window (you set it — 24 hours to 30 days) to deny the request. If you don't respond, they gain access. This is the digital equivalent of a key to your house." },
      { label: "Two-factor authentication", text: "If all your accounts use 2FA sent to your phone, and no one has your phone PIN, access is blocked even with the password. Include your device PIN in your emergency access plan." },
    ],
    warning: "If your only copy of your master password is in your head, your digital estate is inaccessible. Write it down. Store it safely. Tell someone where it is.",
  },
  {
    title: "Social Media Memorial Settings",
    tag: "Accounts",
    tagColor: "text-rose-500 border-rose-300",
    icon: "💬",
    summary: "You can control what happens to your social media after you die — but only if you set it up in advance.",
    body: [
      { label: "Facebook memorialization", text: "A memorialized Facebook account shows 'Remembering' next to your name. Your Legacy Contact can manage the profile. To set yours: Settings → General → Memorialization Settings. You can also request account deletion after death here." },
      { label: "Instagram", text: "Instagram accounts can be memorialized (frozen as-is) or removed upon request from a family member. There is no legacy contact feature — but you can request it through Facebook's Help Center." },
      { label: "X (Twitter)", text: "Family members can request account deactivation with proof of death. There is no legacy contact or memorialization feature — accounts are simply removed." },
      { label: "LinkedIn", text: "Family members can request profile removal. LinkedIn also has a 'Notification of Deceased Member' form. Without action, accounts persist indefinitely and show up in birthday reminders — an uncomfortable experience for connections." },
      { label: "What to ask your family to do", text: "Include in your digital inventory: which accounts to memorialize, which to delete, what to do with any posted content you care about (save it, or let it disappear). The simpler the instructions, the more likely they will be followed." },
    ],
    action: "Set your Facebook Legacy Contact now: Facebook Settings → General → Memorialization Settings.",
  },
  {
    title: "Cryptocurrency — The Irreversible Risk",
    tag: "CRITICAL",
    tagColor: "text-red-600 border-red-400",
    icon: "₿",
    summary: "If nobody has your private keys or seed phrase, the cryptocurrency is gone forever. There is no customer service. There is no recovery.",
    body: [
      { label: "Self-custody wallets", text: "If you hold crypto in a hardware wallet (Ledger, Trezor) or a software wallet (MetaMask, Trust Wallet), you have a 12-24 word seed phrase. This phrase IS the money. Anyone with it can access all funds. Anyone without it cannot — not even your family, not even a court order, not even the blockchain protocol." },
      { label: "Exchange accounts", text: "Crypto held on an exchange (Coinbase, Kraken, Newton) can be accessed by your estate if someone knows the login, has access to the email, and can pass identity verification. This is somewhat recoverable — but it still requires planning." },
      { label: "How to protect it", text: "Write your seed phrase on paper (or engrave it on steel — paper burns). Store it in a fireproof safe. Tell your executor it exists, where it is, and that they should not enter it on any website — only into the official wallet app on a trusted device." },
      { label: "The math of lost crypto", text: "Approximately 20% of all Bitcoin — worth hundreds of billions of dollars — is estimated to be permanently inaccessible due to lost keys and forgotten passwords. This is not hypothetical. It happens constantly." },
    ],
    warning: "Never store your seed phrase digitally — not in a photo, not in a note app, not in email, not in cloud storage. If a device is compromised, your funds are stolen. Paper in a safe is safer than any digital option.",
  },
  {
    title: "Digital Asset Inventory Template",
    tag: "Action",
    tagColor: "text-emerald-600 border-emerald-300",
    icon: "📋",
    summary: "A complete list of your digital accounts, locations, and access instructions — stored with your will.",
    body: [
      { label: "What to document", text: "For each account: Platform name, URL, email/username used to register, password (or 'in password manager'), 2FA method, what to do with it (memorialize / delete / transfer), and any special notes." },
      { label: "Categories to cover", text: "Email accounts. Social media. Banking & investments (including crypto). Streaming services. Shopping accounts with saved payment methods. Domain names and websites. Cloud storage (Google Drive, iCloud, Dropbox). Work accounts. Gaming accounts with real-money value. Reward programs (Aeroplan, Air Miles, credit card points)." },
      { label: "Where to store it", text: "Print a copy and store it with your will in a fireproof safe. Also store a copy in your password manager (encrypted). Tell your executor it exists. Update it once a year — put it in your calendar." },
      { label: "What NOT to do", text: "Do not email this document to anyone. Do not store it on a shared drive. Do not create a Google Doc titled 'All My Passwords.' This document is extremely sensitive — treat it like cash." },
    ],
    action: "Create a spreadsheet with columns: Platform | URL | Username | Password Location | 2FA | Instructions | Last Updated. Print it. File it with your will.",
  },
]

export default function DigitalLegacyPage() {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-blue-700">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Digital Legacy Plan</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          What happens to your online life when you die — and how to make sure your family is not locked out of what matters.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The problem nobody prepares for:</strong> the average person has 90+ online accounts.
            Their family has no idea most of them exist, no way to access them, and no instructions on what to do.
            Photos trapped in iCloud. Bitcoin gone forever. Bank accounts accessible only to people who know a dead
            person's password. This guide takes 30 minutes to act on — and it matters more than most people realize.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {TOPICS.map((t, i) => {
          const isOpen = expanded === i
          return (
            <Card key={i} className={cn("card-hover cursor-pointer", t.tag === "CRITICAL" && "border-red-200")}
              onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                    {t.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{t.title}</p>
                      <Badge variant="outline" className={cn("text-[9px]", t.tagColor)}>{t.tag}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.summary}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="mt-3 pl-13 space-y-2">
                    {t.body.map((b, j) => (
                      <p key={j} className="text-xs text-muted-foreground leading-relaxed">
                        <strong>{b.label}: </strong>{b.text}
                      </p>
                    ))}
                    {t.warning && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-2.5">
                        <p className="text-xs text-red-700"><strong>Warning:</strong> {t.warning}</p>
                      </div>
                    )}
                    {t.action && (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                        <p className="text-xs text-emerald-700"><strong>Do this now:</strong> {t.action}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The kindest thing you can do for your family</strong> is leave clear instructions and access for
            everything that matters. Grief is hard enough without also battling tech companies for access to a loved
            one's accounts. The work is small. The gift is enormous. Update your digital inventory once a year —
            set a reminder in January.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/estate-planning" className="text-sm text-slate-600 hover:underline">Will & Estate Planning</a>
        <a href="/data-backup" className="text-sm text-blue-600 hover:underline">Data Backup</a>
        <a href="/privacy" className="text-sm text-violet-600 hover:underline">Privacy Guide</a>
        <a href="/insurance-guide" className="text-sm text-amber-600 hover:underline">Insurance Guide</a>
      </div>
    </div>
  )
}
