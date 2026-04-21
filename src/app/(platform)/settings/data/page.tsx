"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Download, Trash2, AlertTriangle, Loader2, Shield } from "lucide-react"

export default function DataSettingsPage() {
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch("/api/user/export")
      if (!res.ok) throw new Error("Export failed")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `hfp-data-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert("Failed to export data. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  async function handleDelete() {
    if (confirmText !== "DELETE MY ACCOUNT") return

    setDeleting(true)
    setDeleteError("")
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE MY ACCOUNT" }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Deletion failed")
      }

      // Redirect to home after successful deletion
      window.location.href = "/"
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Data</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your personal data. Export everything or permanently delete your account.
        </p>
      </div>

      {/* Export Data Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Download className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <CardTitle>Export Your Data</CardTitle>
              <CardDescription>
                Download a complete copy of all your data in JSON format (GDPR-compliant)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            This includes your profile, health entries, mood logs, journal entries, wallet and
            transaction history, learning progress, governance records, research studies, community
            posts, messages, and all other associated data.
          </p>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing Export...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export All Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Card */}
      <Card className="border-red-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-red-500">Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div className="text-sm">
                <p className="font-semibold text-red-500">This action is irreversible</p>
                <p className="mt-1 text-muted-foreground">
                  All your data will be permanently deleted, including your profile, health records,
                  journal entries, wallet, tokens, community contributions, and messages. This
                  cannot be undone. We recommend exporting your data first.
                </p>
              </div>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setConfirmText("")
              setDeleteError("")
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-500">
                  <Shield className="h-5 w-5" />
                  Confirm Account Deletion
                </DialogTitle>
                <DialogDescription>
                  This will permanently delete your account and erase all data from our systems.
                  There is no way to recover your account after this.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">
                  Type <span className="font-mono font-bold text-red-500">DELETE MY ACCOUNT</span> below to confirm:
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE MY ACCOUNT"
                  className="border-red-500/30 focus-visible:ring-red-500"
                />
                {deleteError && (
                  <p className="text-sm text-red-500">{deleteError}</p>
                )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={confirmText !== "DELETE MY ACCOUNT" || deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Permanently Delete Everything"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
