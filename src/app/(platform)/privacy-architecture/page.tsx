"use client"

import { Shield, Lock, Eye, EyeOff, Server, Smartphone, Key, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"

export default function PrivacyArchitecturePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Privacy Architecture</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          How your data is protected — technically, not just legally. We cannot access your data. Not "we choose not to." We literally cannot.
        </p>
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">The Guarantee</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your sensitive data (health logs, journal entries, financial information, family messages) is encrypted
            <strong> in your browser</strong> before it ever reaches our servers. The encryption key is derived from
            your password and <strong>never leaves your device</strong>. Our servers store encrypted blobs that we
            cannot read. Even if a court orders us to hand over your data, we can only provide encrypted text
            that is useless without your password. This is not a policy — it is <strong>mathematics</strong>.
          </p>
        </CardContent>
      </Card>

      {/* How it works visually */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">How It Works</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
              <Smartphone className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">1. You type your data</p>
              <p className="text-xs text-muted-foreground">Journal entry, health log, budget data — anything sensitive</p>
            </div>
          </div>
          <div className="flex justify-center"><div className="w-0.5 h-4 bg-emerald-300" /></div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <Key className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">2. Your browser encrypts it</p>
              <p className="text-xs text-muted-foreground">
                <Explain tip="Advanced Encryption Standard with 256-bit key in Galois/Counter Mode. The same encryption used by governments, banks, and military. Would take billions of years to crack with current technology">AES-256-GCM</Explain> encryption
                using a key derived from your password via <Explain tip="Password-Based Key Derivation Function 2. Takes your password and runs it through 100,000 rounds of hashing to create a strong encryption key. Makes brute-force attacks computationally impractical">PBKDF2</Explain> (100,000 iterations).
                The key exists ONLY in your browser's memory.
              </p>
            </div>
          </div>
          <div className="flex justify-center"><div className="w-0.5 h-4 bg-emerald-300" /></div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
              <Server className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">3. Server stores encrypted blob</p>
              <p className="text-xs text-muted-foreground">
                The server receives and stores: <code className="text-[10px] bg-muted px-1 rounded">U2FsdGVkX1+3q...</code> — encrypted text that looks like random characters. The server has NO key and CANNOT decrypt this.
              </p>
            </div>
          </div>
          <div className="flex justify-center"><div className="w-0.5 h-4 bg-emerald-300" /></div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
              <Smartphone className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">4. You retrieve and decrypt</p>
              <p className="text-xs text-muted-foreground">When you load your data, your browser downloads the encrypted blob and decrypts it locally using your password-derived key. Plaintext only exists on YOUR device.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What this protects against */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">What This Protects Against</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { threat: "Database breach", protection: "Attackers get encrypted blobs — useless without individual passwords. Each user's data requires their specific password to decrypt.", icon: CheckCircle },
            { threat: "Court subpoena / government order", protection: "We can only hand over encrypted data we cannot read. Like giving someone a locked safe without the combination. The math is the protection, not our willingness.", icon: CheckCircle },
            { threat: "Rogue employee / insider threat", protection: "No employee, admin, or developer has access to encryption keys. Keys exist only in users' browsers during active sessions.", icon: CheckCircle },
            { threat: "Platform acquisition / ownership change", protection: "Even if the company is sold, the new owner gets encrypted data they cannot read. Your privacy survives any corporate change.", icon: CheckCircle },
            { threat: "Server compromise", protection: "If someone hacks the server, they get encrypted blobs + password hashes (Argon2, GPU-resistant). Individual decryption requires brute-forcing each password separately.", icon: CheckCircle },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/10 p-3">
                <Icon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">{item.threat}</p>
                  <p className="text-[10px] text-muted-foreground">{item.protection}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* The tradeoff */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold text-amber-900">The Tradeoff (Honesty)</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>If you lose your password, we cannot recover your data.</strong> This is the inherent tradeoff
            of zero-knowledge encryption. The same property that protects you from us also means we cannot help
            you if you forget your password. Your password IS the key. We recommend: use a password manager,
            write your password down and store it securely (safe, safety deposit box), and keep regular local
            backups via the <a href="/data-backup" className="text-violet-600 hover:underline">Data Backup</a> page.
          </p>
        </CardContent>
      </Card>

      {/* Layers of protection */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Complete Security Stack</CardTitle></CardHeader>
        <CardContent className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex gap-2 items-center"><Lock className="h-3 w-3 text-emerald-500 shrink-0" /> <span><strong>Encryption at rest:</strong> AES-256-GCM (client-side, password-derived key)</span></div>
          <div className="flex gap-2 items-center"><Lock className="h-3 w-3 text-emerald-500 shrink-0" /> <span><strong>Encryption in transit:</strong> TLS 1.3 (HTTPS) + HSTS</span></div>
          <div className="flex gap-2 items-center"><Lock className="h-3 w-3 text-emerald-500 shrink-0" /> <span><strong>Password hashing:</strong> Argon2id (GPU-resistant, 65MB memory cost)</span></div>
          <div className="flex gap-2 items-center"><Lock className="h-3 w-3 text-emerald-500 shrink-0" /> <span><strong>Key derivation:</strong> PBKDF2 (100,000 iterations, SHA-256)</span></div>
          <div className="flex gap-2 items-center"><Lock className="h-3 w-3 text-emerald-500 shrink-0" /> <span><strong>Session management:</strong> JWT with 30-day expiry, encryption key in sessionStorage only</span></div>
          <div className="flex gap-2 items-center"><Lock className="h-3 w-3 text-emerald-500 shrink-0" /> <span><strong>Rate limiting:</strong> Login (5/5min), API (varies), AI (10/min)</span></div>
          <div className="flex gap-2 items-center"><Lock className="h-3 w-3 text-emerald-500 shrink-0" /> <span><strong>Headers:</strong> HSTS, X-Frame-Options DENY, CSP, nosniff, Permissions-Policy</span></div>
          <div className="flex gap-2 items-center"><Lock className="h-3 w-3 text-emerald-500 shrink-0" /> <span><strong>Content sanitization:</strong> DOMPurify for AI content, input validation on all routes</span></div>
          <div className="flex gap-2 items-center"><Lock className="h-3 w-3 text-emerald-500 shrink-0" /> <span><strong>Future:</strong> ZK-proofs for identity claims, blockchain-anchored data integrity, DePIN distributed storage</span></div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50/10">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Open source verification:</strong> Every security claim on this page can be verified by reading
            the source code. The encryption library is at <code className="text-[10px] bg-muted px-1 rounded">src/lib/client-encryption.ts</code>.
            The password hashing is at <code className="text-[10px] bg-muted px-1 rounded">src/lib/auth.ts</code>.
            The security headers are in <code className="text-[10px] bg-muted px-1 rounded">next.config.ts</code>.
            We do not ask you to trust us. We ask you to verify.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/privacy" className="text-sm text-emerald-600 hover:underline">Privacy Policy</a>
        <a href="/data-backup" className="text-sm text-blue-600 hover:underline">Data Backup</a>
        <a href="/why" className="text-sm text-violet-600 hover:underline">Why This Exists</a>
        <a href="/settings" className="text-sm text-slate-600 hover:underline">Settings</a>
      </div>
    </div>
  )
}
