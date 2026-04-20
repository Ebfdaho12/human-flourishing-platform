"use client"

import { useState, useEffect } from "react"
import { Download, Upload, Shield, CheckCircle, AlertTriangle, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const LOCAL_KEYS = [
  { key: "hfp-budget", label: "Budget Calculator", icon: "💰" },
  { key: "hfp-debts", label: "Debt Payoff", icon: "���" },
  { key: "hfp-networth", label: "Net Worth", icon: "📈" },
  { key: "hfp-subscriptions", label: "Subscriptions", icon: "💳" },
  { key: "hfp-decisions", label: "Decision Journal", icon: "⚖️" },
  { key: "hfp-wins", label: "Wins & Gratitude", icon: "🏆" },
  { key: "hfp-notes", label: "Quick Notes", icon: "📝" },
  { key: "hfp-relationships", label: "Relationships", icon: "👥" },
  { key: "hfp-reading", label: "Reading List", icon: "📚" },
  { key: "hfp-skills", label: "Skill Inventory", icon: "🧠" },
  { key: "hfp-challenges", label: "30-Day Challenges", icon: "🔥" },
  { key: "hfp-habit-stacks", label: "Habit Stacking", icon: "📋" },
  { key: "hfp-meal-plan", label: "Meal Planner", icon: "🍽️" },
  { key: "hfp-family-meetings", label: "Family Meetings", icon: "👨‍👩‍👧‍👦" },
  { key: "hfp-kids-chores", label: "Kids Chores", icon: "⭐" },
  { key: "hfp-screen-time", label: "Screen Time", icon: "📱" },
  { key: "hfp-home-maintenance", label: "Home Maintenance", icon: "🔧" },
  { key: "hfp-preparedness", label: "Emergency Prep", icon: "🛡️" },
  { key: "hfp-vision", label: "Vision Board", icon: "🎯" },
  { key: "hfp-daily-checkins", label: "Daily Check-Ins", icon: "☀️" },
]

export default function DataBackupPage() {
  const [dataStatus, setDataStatus] = useState<Record<string, { exists: boolean; size: number }>>({})
  const [exported, setExported] = useState(false)
  const [imported, setImported] = useState(false)
  const [importError, setImportError] = useState("")

  useEffect(() => {
    const status: Record<string, { exists: boolean; size: number }> = {}
    for (const { key } of LOCAL_KEYS) {
      const data = localStorage.getItem(key)
      status[key] = { exists: !!data, size: data ? data.length : 0 }
    }
    setDataStatus(status)
  }, [imported])

  const totalKeys = LOCAL_KEYS.filter(k => dataStatus[k.key]?.exists).length
  const totalSize = Object.values(dataStatus).reduce((s, d) => s + d.size, 0)

  function exportAll() {
    const backup: Record<string, any> = {
      _meta: {
        exportedAt: new Date().toISOString(),
        platform: "Human Flourishing Platform",
        version: "1.0",
        keys: totalKeys,
      },
    }
    for (const { key } of LOCAL_KEYS) {
      const data = localStorage.getItem(key)
      if (data) {
        try { backup[key] = JSON.parse(data) }
        catch { backup[key] = data }
      }
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hfp-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  function importBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError("")

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string)
        if (!data._meta?.platform) {
          setImportError("This does not appear to be an HFP backup file.")
          return
        }
        let restored = 0
        for (const { key } of LOCAL_KEYS) {
          if (data[key]) {
            localStorage.setItem(key, typeof data[key] === "string" ? data[key] : JSON.stringify(data[key]))
            restored++
          }
        }
        setImported(true)
        setTimeout(() => setImported(false), 3000)
      } catch {
        setImportError("Could not read the backup file. Make sure it is a valid HFP JSON backup.")
      }
    }
    reader.readAsText(file)
    e.target.value = "" // reset file input
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Data Backup & Export</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Your data is stored on YOUR device. Export it to keep it safe. Import it to restore on a new device.
        </p>
      </div>

      {/* Status */}
      <div className="grid grid-cols-2 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalKeys}</p>
          <p className="text-xs text-muted-foreground">Tools with data</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-violet-600">{(totalSize / 1024).toFixed(1)} KB</p>
          <p className="text-xs text-muted-foreground">Total data size</p>
        </CardContent></Card>
      </div>

      {/* Export / Import */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex gap-3">
            <Button onClick={exportAll} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Download className="h-4 w-4" /> Export All Data
            </Button>
            <label className="flex-1">
              <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Import Backup</span>
              </div>
              <input type="file" accept=".json" onChange={importBackup} className="hidden" />
            </label>
          </div>

          {exported && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle className="h-4 w-4" /> Backup downloaded successfully!
            </div>
          )}
          {imported && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle className="h-4 w-4" /> Data restored from backup! Refresh pages to see your data.
            </div>
          )}
          {importError && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertTriangle className="h-4 w-4" /> {importError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* What is backed up */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Your Data Inventory</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {LOCAL_KEYS.map(({ key, label, icon }) => {
            const status = dataStatus[key]
            return (
              <div key={key} className="flex items-center gap-2 py-1">
                <span className="text-sm">{icon}</span>
                <span className="text-xs flex-1">{label}</span>
                {status?.exists ? (
                  <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-300">
                    {(status.size / 1024).toFixed(1)} KB
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] text-muted-foreground">Empty</Badge>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why backup matters:</strong> Your budget, debts, decisions, notes, meal plans, and other tool
            data is stored in your browser's localStorage. If you clear your browser data, switch browsers, or
            get a new device — this data is gone. Export a backup regularly (we recommend weekly) and store the
            JSON file somewhere safe (Google Drive, Dropbox, USB). The import function restores everything instantly.
            <br /><br />
            <strong>Your privacy:</strong> This backup contains ONLY your tool data. It does not contain your password,
            session tokens, or any server-side data (health logs, mood entries, journal — those are in the database and
            safe). The backup file never leaves your device unless you choose to save it somewhere.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/settings" className="text-sm text-blue-600 hover:underline">Settings</a>
        <a href="/privacy" className="text-sm text-violet-600 hover:underline">Privacy</a>
        <a href="/financial-dashboard" className="text-sm text-emerald-600 hover:underline">Financial Dashboard</a>
      </div>
    </div>
  )
}
