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
    </div>
  )
}
