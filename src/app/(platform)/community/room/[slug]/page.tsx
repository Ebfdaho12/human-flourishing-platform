"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { MessageCircle, Send, ThumbsUp, ThumbsDown, ArrowLeft, Clock, Reply } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function RoomPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data, mutate } = useSWR(`/api/community/posts?room=${slug}`, fetcher)
  const [newPost, setNewPost] = useState("")
  const [posting, setPosting] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const room = data?.room
  const posts = data?.posts || []

  async function submitPost() {
    if (!newPost.trim() || newPost.length < 10) return
    setPosting(true)
    await fetch("/api/community/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomSlug: slug, content: newPost }),
    })
    setNewPost("")
    setPosting(false)
    mutate()
  }

  async function submitReply(parentId: string) {
    if (!replyContent.trim() || replyContent.length < 10) return
    await fetch("/api/community/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomSlug: slug, content: replyContent, parentId }),
    })
    setReplyContent("")
    setReplyTo(null)
    mutate()
  }

  async function vote(postId: string, value: number) {
    await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, value }),
    })
    mutate()
  }

  function timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <a href="/community/hub" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3 w-3" /> Back to Community
        </a>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{room?.name || slug.replace(/-/g, " ")}</h1>
            <p className="text-sm text-muted-foreground">{room?.description || "Loading..."}</p>
          </div>
        </div>
      </div>

      {/* New post */}
      <Card className="border-violet-200">
        <CardContent className="p-4 space-y-2">
          <Textarea value={newPost} onChange={e => setNewPost(e.target.value)}
            placeholder="Share a thought, question, or insight (min 10 characters)..."
            className="min-h-[80px]" />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">{newPost.length}/2000 characters</p>
            <Button onClick={submitPost} disabled={posting || newPost.length < 10} size="sm">
              <Send className="h-3 w-3" /> {posting ? "Posting..." : "Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {posts.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <MessageCircle className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No posts yet. Be the first to start a conversation!</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post: any) => {
            const authorName = post.author?.profile?.displayName || "Community Member"
            const userVote = post.votes?.[0]?.value || 0
            return (
              <Card key={post.id}>
                <CardContent className="p-4">
                  {/* Post content */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{authorName}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" /> {timeAgo(post.createdAt)}
                        </span>
                        {post.type !== "DISCUSSION" && (
                          <Badge variant="outline" className="text-[8px]">{post.type}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      {post.toolLink && (
                        <a href={post.toolLink} className="text-[10px] text-violet-600 hover:underline mt-1 block">
                          Related tool: {post.toolLink}
                        </a>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => vote(post.id, 1)}
                          className={cn("flex items-center gap-1 text-xs transition-colors",
                            userVote === 1 ? "text-emerald-600 font-medium" : "text-muted-foreground hover:text-emerald-500"
                          )}>
                          <ThumbsUp className="h-3 w-3" /> {post.upvotes}
                        </button>
                        <button onClick={() => vote(post.id, -1)}
                          className={cn("flex items-center gap-1 text-xs transition-colors",
                            userVote === -1 ? "text-red-500 font-medium" : "text-muted-foreground hover:text-red-400"
                          )}>
                          <ThumbsDown className="h-3 w-3" /> {post.downvotes}
                        </button>
                        <button onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-violet-500">
                          <Reply className="h-3 w-3" /> {post.replyCount} replies
                        </button>
                      </div>

                      {/* Reply input */}
                      {replyTo === post.id && (
                        <div className="mt-2 flex gap-2">
                          <Textarea value={replyContent} onChange={e => setReplyContent(e.target.value)}
                            placeholder="Write a reply..." className="min-h-[50px] text-xs" />
                          <Button size="sm" onClick={() => submitReply(post.id)} disabled={replyContent.length < 10}>
                            <Send className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {/* Existing replies */}
                      {post.replies?.length > 0 && (
                        <div className="mt-2 pl-4 border-l-2 border-violet-100 space-y-2">
                          {post.replies.map((reply: any) => (
                            <div key={reply.id} className="text-xs">
                              <span className="font-medium">{reply.author?.profile?.displayName || "Member"}</span>
                              <span className="text-muted-foreground ml-1">{timeAgo(reply.createdAt)}</span>
                              <p className="text-muted-foreground mt-0.5">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {data?.pages > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          Page {data.page} of {data.pages} · {data.total} posts total
        </p>
      )}
    </div>
  )
}
