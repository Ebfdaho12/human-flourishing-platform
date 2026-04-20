"use client"

import { useState } from "react"
import useSWR from "swr"
import { Users, Plus, Send, Copy, CheckCircle, MessageCircle, Shield, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function FamilyGroupPage() {
  const { data, mutate } = useSWR("/api/community/family", fetcher)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [newName, setNewName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [copied, setCopied] = useState(false)

  const groups = data?.groups || []

  async function createGroup() {
    if (!newName.trim()) return
    await fetch("/api/community/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", name: newName }),
    })
    setNewName(""); setShowCreate(false); mutate()
  }

  async function joinGroup() {
    if (!joinCode.trim()) return
    const res = await fetch("/api/community/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", inviteCode: joinCode }),
    })
    if (res.ok) { setJoinCode(""); setShowJoin(false); mutate() }
  }

  async function sendMessage(groupId: string) {
    if (!newMessage.trim()) return
    await fetch("/api/community/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "message", groupId, message: newMessage }),
    })
    setNewMessage(""); mutate()
  }

  function copyInvite(code: string) {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const active = groups.find((g: any) => g.id === activeGroup)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Family Groups</h1>
          </div>
          <p className="text-sm text-muted-foreground">Private spaces for your family. Share progress, coordinate, and support each other.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowJoin(!showJoin)}>Join</Button>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}><Plus className="h-3 w-3" /> Create</Button>
        </div>
      </div>

      <Card className="border-rose-200 bg-rose-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Private by design.</strong> Family groups are encrypted spaces only visible to members.
            Share meal plans, budget progress, challenge check-ins, or just chat. Nobody outside your group
            can see the messages. Create a group, share the invite code with family members, and they join instantly.
          </p>
        </CardContent>
      </Card>

      {/* Create */}
      {showCreate && (
        <Card className="border-2 border-rose-200">
          <CardContent className="p-4 space-y-2">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Family group name (e.g., 'The Fowlers')"
              onKeyDown={e => e.key === "Enter" && createGroup()} />
            <Button onClick={createGroup} disabled={!newName.trim()} className="w-full">Create Family Group</Button>
          </CardContent>
        </Card>
      )}

      {/* Join */}
      {showJoin && (
        <Card className="border-2 border-blue-200">
          <CardContent className="p-4 space-y-2">
            <Input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Paste invite code here"
              onKeyDown={e => e.key === "Enter" && joinGroup()} />
            <Button onClick={joinGroup} disabled={!joinCode.trim()} variant="outline" className="w-full">Join Group</Button>
          </CardContent>
        </Card>
      )}

      {/* Groups list or active group */}
      {!activeGroup ? (
        groups.length > 0 ? (
          <div className="space-y-3">
            {groups.map((group: any) => (
              <Card key={group.id} className="card-hover cursor-pointer" onClick={() => setActiveGroup(group.id)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 text-lg font-bold">
                    {group.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{group.name}</p>
                      {group.role === "ADMIN" && <Badge variant="outline" className="text-[8px] text-rose-600 border-rose-300">Admin</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{group._count?.members || 0} members · {group._count?.messages || 0} messages</p>
                  </div>
                  <MessageCircle className="h-4 w-4 text-muted-foreground/20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No family groups yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Create one and invite your family members, or join with an invite code.</p>
          </CardContent></Card>
        )
      ) : active && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setActiveGroup(null)}>← All Groups</Button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Invite code:</span>
              <button onClick={() => copyInvite(active.inviteCode)}
                className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded hover:bg-muted/80 flex items-center gap-1">
                {active.inviteCode?.substring(0, 12)}...
                {copied ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
              </button>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
            <CardContent className="p-4">
              <p className="text-lg font-bold">{active.name}</p>
              <p className="text-white/80 text-xs">{active.members?.length || 0} members</p>
            </CardContent>
          </Card>

          {/* Members */}
          <div className="flex gap-2 flex-wrap">
            {active.members?.map((m: any) => (
              <Badge key={m.id} variant="outline" className="text-xs">
                {m.user?.profile?.displayName || "Member"}
                {m.role === "ADMIN" && " (admin)"}
              </Badge>
            ))}
          </div>

          {/* Messages */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {active.messages?.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No messages yet. Say hello!</p>
                )}
                {[...(active.messages || [])].reverse().map((msg: any) => (
                  <div key={msg.id} className="flex items-start gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold">
                      {(msg.sender?.profile?.displayName || "M").charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">{msg.sender?.profile?.displayName || "Member"}</span>
                        <span className="text-[9px] text-muted-foreground">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Send message */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <Input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  placeholder="Message your family..." className="flex-1"
                  onKeyDown={e => e.key === "Enter" && sendMessage(active.id)} />
                <Button size="sm" onClick={() => sendMessage(active.id)} disabled={!newMessage.trim()}>
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <a href="/community/hub" className="text-sm text-violet-600 hover:underline">Community Hub</a>
        <a href="/accountability" className="text-sm text-emerald-600 hover:underline">Accountability Partners</a>
        <a href="/family-meeting" className="text-sm text-blue-600 hover:underline">Family Meeting</a>
      </div>
    </div>
  )
}
