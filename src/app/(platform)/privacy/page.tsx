"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Shield, Eye, EyeOff, Download, Trash2, Lock, Database,
  AlertTriangle, CheckCircle, FileText
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function PrivacyDashboardPage() {
  const { data: streaks } = useSWR("/api/streaks", fetcher)
  const { data: admin } = useSWR("/api/admin/stats", fetcher)
  const [deleting, setDeleting] = useState<string | null>(null)

  const userContent = admin?.content ?? {}

  const dataInventory = [
    { key: "health", label: "Health Entries", count: userContent.healthEntries ?? 0, encrypted: true, href: "/api/export?type=health&format=json" },
    { key: "mood", label: "Mood Check-ins", count: userContent.moodEntries ?? 0, encrypted: false, href: "/api/export?type=mood&format=json" },
    { key: "journal", label: "Journal Entries", count: userContent.journalEntries ?? 0, encrypted: true, href: "/api/export?type=journal&format=json" },
    { key: "education", label: "Tutoring Sessions", count: userContent.tutoringSessions ?? 0, encrypted: false, href: "/api/export?type=education&format=json" },
    { key: "governance", label: "Governance Records", count: userContent.govRecords ?? 0, encrypted: false, href: "/api/export?type=governance&format=json" },
    { key: "energy", label: "Energy Logs", count: userContent.energyLogs ?? 0, encrypted: false, href: "/api/export?type=energy&format=json" },
    { key: "cases", label: "Health Cases", count: userContent.healthCases ?? 0, encrypted: true, href: "#" },
    { key: "proposals", label: "Case Proposals", count: userContent.caseProposals ?? 0, encrypted: false, href: "#" },
  ]

  const totalRecords = dataInventory.reduce((s, d) => s + d.count, 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Privacy Dashboard</h1>
        </div>
        <p className="text-sm text-muted-foreground">Complete transparency about your data. Nothing hidden.</p>
      </div>

      {/* Privacy score */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold">Privacy Level</p>
              <p className="text-3xl font-bold text-emerald-700">Maximum</p>
              <p className="text-xs text-muted-foreground mt-1">AES-256-GCM encryption · Zero tracking · No third-party analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What we know */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-violet-500" />
            Your Data Inventory
          </CardTitle>
          <CardDescription>Every piece of data we store about you — {totalRecords.toLocaleString()} total records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dataInventory.map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div className="flex items-center gap-3">
                  {item.encrypted ? (
                    <Lock className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.count.toLocaleString()} records
                      {item.encrypted && " · encrypted at rest"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {item.href !== "#" && (
                    <a href={item.href} download>
                      <Button variant="ghost" size="sm" className="text-xs h-7">
                        <Download className="h-3 w-3" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <a href="/api/export?type=all&format=json" download>
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5" /> Export everything (JSON)
              </Button>
            </a>
            <a href="/api/export?type=all&format=csv" download>
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5" /> Export everything (CSV)
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* What we DON'T do */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-emerald-500" />
            What We Don't Do
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { text: "We don't track your browsing behavior", verified: true },
              { text: "We don't sell your data to anyone", verified: true },
              { text: "We don't use third-party analytics (no Google Analytics, no Mixpanel)", verified: true },
              { text: "We don't show you ads", verified: true },
              { text: "We don't share your health data with insurance companies", verified: true },
              { text: "We don't store your password (only an Argon2 hash)", verified: true },
              { text: "We can't read your encrypted identity claims", verified: true },
              { text: "We don't log your IP address", verified: true },
              { text: "We don't fingerprint your browser", verified: true },
              { text: "We don't use tracking cookies", verified: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What we DO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-500" />
            What We Do Store
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              "Your email address (for login and optional notifications)",
              "Your password hash (Argon2, not the actual password)",
              "Health data you explicitly log (vitals, exercise, sleep, etc.)",
              "Mood check-ins and journal entries you write",
              "Tutoring session history and scores",
              "Governance records you add",
              "Energy production and consumption logs",
              "Research studies you pre-register",
              "FOUND and VOICE token balances and transaction history",
              "Identity claims (AES-256-GCM encrypted, unreadable without your key)",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span className="text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Your rights */}
      <Card className="border-violet-200 bg-violet-50/30">
        <CardHeader>
          <CardTitle className="text-base">Your Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: "Right to Export", desc: "Download all your data anytime in CSV or JSON format", icon: Download },
              { title: "Right to Delete", desc: "Delete your entire account and all associated data", icon: Trash2 },
              { title: "Right to Privacy", desc: "Your data is never shared, sold, or analyzed without consent", icon: Shield },
              { title: "Right to Verify", desc: "The entire codebase is open source — audit everything", icon: Eye },
            ].map((right) => {
              const Icon = right.icon
              return (
                <div key={right.title} className="flex gap-3 rounded-lg border border-violet-200 bg-white/60 p-3">
                  <Icon className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">{right.title}</p>
                    <p className="text-xs text-muted-foreground">{right.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        This privacy dashboard is always available. No legalese, no hidden clauses. Your data is yours.
      </p>
    </div>
  )
}
