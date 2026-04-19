"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, Heart, Brain, GraduationCap, Zap, Shield, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const NOTIFICATION_SETTINGS = [
  { id: "health_reminder", label: "Health check-in reminder", desc: "Gentle nudge if you haven't logged health data today", icon: Heart, color: "text-rose-500", default: true },
  { id: "mood_reminder", label: "Mood check-in", desc: "Daily mood tracking reminder", icon: Brain, color: "text-pink-500", default: true },
  { id: "streak_alert", label: "Streak alerts", desc: "Warn when your streak is about to break", icon: Clock, color: "text-orange-500", default: true },
  { id: "education_reminder", label: "Learning reminder", desc: "Encourage daily learning sessions", icon: GraduationCap, color: "text-blue-500", default: false },
  { id: "energy_reminder", label: "Energy logging", desc: "Remind to log energy production", icon: Zap, color: "text-yellow-500", default: false },
  { id: "case_proposals", label: "Health case proposals", desc: "When a practitioner responds to your case", icon: Shield, color: "text-emerald-500", default: true },
  { id: "achievements", label: "Achievement unlocked", desc: "When you earn a new badge", icon: Heart, color: "text-violet-500", default: true },
  { id: "weekly_digest", label: "Weekly digest", desc: "Summary of your week's activity", icon: Clock, color: "text-indigo-500", default: true },
]

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("hfp-notifications")
    if (stored) {
      setSettings(JSON.parse(stored))
    } else {
      const defaults: Record<string, boolean> = {}
      NOTIFICATION_SETTINGS.forEach(s => { defaults[s.id] = s.default })
      setSettings(defaults)
    }
  }, [])

  function toggle(id: string) {
    const next = { ...settings, [id]: !settings[id] }
    setSettings(next)
    localStorage.setItem("hfp-notifications", JSON.stringify(next))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function enableAll() {
    const all: Record<string, boolean> = {}
    NOTIFICATION_SETTINGS.forEach(s => { all[s.id] = true })
    setSettings(all)
    localStorage.setItem("hfp-notifications", JSON.stringify(all))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function disableAll() {
    const none: Record<string, boolean> = {}
    NOTIFICATION_SETTINGS.forEach(s => { none[s.id] = false })
    setSettings(none)
    localStorage.setItem("hfp-notifications", JSON.stringify(none))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const enabledCount = Object.values(settings).filter(Boolean).length

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Notification Preferences</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Control what reminders you see. The platform should support you, not nag you.
          {saved && <span className="text-emerald-500 ml-2 font-medium">Saved!</span>}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{enabledCount} of {NOTIFICATION_SETTINGS.length} enabled</p>
        <div className="flex gap-2">
          <button onClick={enableAll} className="text-xs text-violet-600 hover:underline">Enable all</button>
          <span className="text-muted-foreground">·</span>
          <button onClick={disableAll} className="text-xs text-muted-foreground hover:underline">Disable all</button>
        </div>
      </div>

      <div className="space-y-2">
        {NOTIFICATION_SETTINGS.map(setting => {
          const Icon = setting.icon
          const enabled = settings[setting.id] ?? setting.default
          return (
            <Card key={setting.id} className={cn("transition-all", !enabled && "opacity-60")}>
              <CardContent className="p-4 flex items-center gap-4">
                <Icon className={cn("h-5 w-5 shrink-0", enabled ? setting.color : "text-muted-foreground/30")} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{setting.label}</p>
                  <p className="text-xs text-muted-foreground">{setting.desc}</p>
                </div>
                <button
                  onClick={() => toggle(setting.id)}
                  className={cn("relative h-6 w-11 rounded-full transition-colors shrink-0", enabled ? "bg-violet-500" : "bg-muted")}
                >
                  <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", enabled ? "translate-x-5" : "translate-x-0.5")} />
                </button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Our philosophy:</strong> Notifications should feel like a supportive friend, not a demanding boss.
            We'll never guilt-trip you for missing a day. Life happens. The platform is here when you're ready,
            not the other way around. Disable anything that feels like pressure.
          </p>
        </CardContent>
      </Card>

      <a href="/settings" className="text-sm text-violet-600 hover:underline block">← Back to Settings</a>
    </div>
  )
}
