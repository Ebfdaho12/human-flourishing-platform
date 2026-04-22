"use client"
import { useState, useEffect } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, User, Download, Database } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SettingsPage() {
  const { data, mutate } = useSWR("/api/user/profile", fetcher)

  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (data?.profile) {
      setDisplayName(data.profile.displayName ?? "")
      setBio(data.profile.bio ?? "")
      setAvatarUrl(data.profile.avatarUrl ?? "")
    }
  }, [data])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio, avatarUrl }),
    })
    setSaving(false)
    setSaved(true)
    mutate()
    setTimeout(() => setSaved(false), 2500)
  }

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : data?.email?.[0]?.toUpperCase() ?? "?"

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and account</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>How others see you on the platform</CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-5">
            {/* Avatar preview */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                <AvatarFallback className="text-lg bg-violet-500/20 text-violet-300">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1.5">
                <Label>Avatar URL</Label>
                <Input
                  placeholder="https://example.com/your-photo.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Paste a link to any image (Gravatar, GitHub avatar, etc.)</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Display name</Label>
              <Input
                placeholder="How you want to be known"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Input
                placeholder="A short description of yourself (optional)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? "Saving..." : saved ? (
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Saved</span>
              ) : "Save profile"}
            </Button>
          </CardContent>
        </form>
      </Card>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground">{data?.email ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-sm font-medium">Member since</p>
              <p className="text-xs text-muted-foreground">
                {data?.createdAt ? new Date(data.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Platform version</p>
              <p className="text-xs text-muted-foreground">v0.1.0-mvp</p>
            </div>
            <Badge variant="outline">MVP</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Platform Experience Toggles */}
      <ExperienceToggles />

      {/* Notifications */}
      <Card className="card-hover">
        <a href="/settings/notifications">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="h-4 w-4 text-violet-500" />
              <div>
                <p className="text-sm font-medium">Notification Preferences</p>
                <p className="text-xs text-muted-foreground">Control what reminders you see — supportive, not nagging</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">→</span>
          </CardContent>
        </a>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-violet-500" />
            Data Export
          </CardTitle>
          <CardDescription>Your data belongs to you. Download everything, anytime.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Health Data", type: "health" },
              { label: "Mood Check-ins", type: "mood" },
              { label: "Journal Entries", type: "journal" },
              { label: "Education Sessions", type: "education" },
              { label: "Energy Logs", type: "energy" },
              { label: "Governance Records", type: "governance" },
            ].map((item) => (
              <div key={item.type} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <span className="text-sm">{item.label}</span>
                <div className="flex gap-1">
                  <a href={`/api/export?type=${item.type}&format=csv`} download className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="Download CSV">
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <a href="/api/export?type=all&format=json" download>
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5" /> Export all (JSON)
              </Button>
            </a>
            <a href="/api/export?type=all&format=csv" download>
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5" /> Export all (CSV)
              </Button>
            </a>
          </div>
          <p className="text-xs text-muted-foreground">Downloads include all your data in the selected format. No restrictions, no waiting periods.</p>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Privacy</CardTitle>
          <CardDescription>Your data is yours.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Identity claims are encrypted at rest with AES-256-GCM using a per-user HKDF-derived key</p>
          <p>• No third-party analytics or tracking</p>
          <p>• Your raw data is never transmitted to any external service</p>
          <p>• Full data export available — CSV, JSON, take everything</p>
          <p>• ZK proof upgrade path planned for v0.2</p>
        </CardContent>
      </Card>

      {/* Data management */}
      <Card className="card-hover">
        <a href="/settings/data">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Data & Account</p>
                <p className="text-xs text-muted-foreground">Export all data or delete your account</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">→</span>
          </CardContent>
        </a>
      </Card>
    </div>
  )
}

// ─── Experience Toggles Component ─────────────────────────────────

function ExperienceToggles() {
  const TOGGLES = [
    { key: "gamification", label: "Gamification", description: "XP, levels, character sheet, achievements, combo multipliers", default: true },
    { key: "dailyQuests", label: "Daily Quests", description: "Quest system with variable rewards and bonus XP", default: true },
    { key: "hiveActivity", label: "Hive Activity", description: "Social proof showing what the community is doing", default: true },
    { key: "milestones", label: "Milestone Celebrations", description: "Confetti and celebrations when you hit milestones", default: true },
    { key: "smartSuggestions", label: "Smart Suggestions", description: "AI-powered recommendations based on your data", default: true },
    { key: "levelUnlocks", label: "Level Unlock Teasers", description: "Show upcoming level rewards on dashboard", default: true },
    { key: "streakWarnings", label: "Streak Warnings", description: "Notifications when streaks are at risk", default: true },
    { key: "lunarTracking", label: "Lunar Cycle Tracking", description: "Moon phase correlations with your data", default: true },
    { key: "zodiacFeatures", label: "Chinese Zodiac", description: "Zodiac compatibility and archetype features", default: true },
    { key: "soundEffects", label: "Sound Effects", description: "Satisfying sounds on completions (coming soon)", default: false },
  ]

  const [settings, setSettings] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hfp-experience-settings")
      if (saved) setSettings(JSON.parse(saved))
      else {
        const defaults: Record<string, boolean> = {}
        TOGGLES.forEach(t => { defaults[t.key] = t.default })
        setSettings(defaults)
      }
    } catch {}
  }, [])

  function toggle(key: string) {
    const updated = { ...settings, [key]: !settings[key] }
    setSettings(updated)
    localStorage.setItem("hfp-experience-settings", JSON.stringify(updated))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Platform Experience</CardTitle>
        <CardDescription>Toggle features on or off. The platform adapts to how YOU want to use it. No judgment — your way.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {TOGGLES.map(t => (
          <div key={t.key} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-[10px] text-muted-foreground">{t.description}</p>
            </div>
            <button
              onClick={() => toggle(t.key)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors shrink-0",
                settings[t.key] ? "bg-violet-500" : "bg-muted"
              )}
            >
              <span className={cn(
                "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                settings[t.key] ? "translate-x-5" : "translate-x-0"
              )} />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
