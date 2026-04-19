"use client"

import { useState } from "react"
import { MessageSquare, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit() {
    if (!type || !description) return
    setLoading(true)
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title, description, page: window.location.pathname }),
    })
    setLoading(false)
    setSent(true)
    setTimeout(() => { setOpen(false); setSent(false); setType(""); setTitle(""); setDescription("") }, 2000)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl shadow-violet-500/25 hover:scale-105 transition-transform"
        aria-label="Send feedback"
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>

      {/* Feedback panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-40 w-80 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4">
            <h3 className="font-semibold text-white">Send Feedback</h3>
            <p className="text-white/70 text-xs mt-0.5">Help us improve the platform</p>
          </div>

          {sent ? (
            <div className="p-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-3">
                <Send className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="font-medium">Thank you!</p>
              <p className="text-xs text-muted-foreground mt-1">Your feedback helps build a better platform.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUG">Bug Report</SelectItem>
                    <SelectItem value="FEATURE">Feature Request</SelectItem>
                    <SelectItem value="ACCESSIBILITY">Accessibility Issue</SelectItem>
                    <SelectItem value="GENERAL">General Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Title (optional)</Label>
                <Input className="h-9 text-sm" placeholder="Brief summary" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea className="text-sm min-h-[80px]" placeholder="What happened? What did you expect?" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button onClick={submit} disabled={loading || !type || !description} className="w-full h-9 text-sm">
                {loading ? "Sending..." : "Send Feedback"}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
