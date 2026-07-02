"use client"

import { useState } from "react"
import { ArrowBigDown, ArrowBigUp, Repeat2, MessageCircle, X } from "lucide-react"
import type { Post } from "@/lib/posts"
import { Avatar } from "./avatar"
import { ChainDot } from "./chain-badge"
import { TierBadge } from "./tier-badge"

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return `${n}`
}

export function PostCard({ post }: { post: Post }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null)
  const [recast, setRecast] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState("")

  const up = post.upvotes + (vote === "up" ? 1 : 0)
  const down = post.downvotes + (vote === "down" ? 1 : 0)
  const recasts = post.recasts + (recast ? 1 : 0)

  const handleReply = () => {
    if (!replyText.trim()) return
    setReplyText("")
    setIsReplying(false)
    alert("Reply submitted")
  }

  return (
    <article className="border-b border-border px-4 py-4 transition-colors hover:bg-card/40">
      <div className="flex gap-3">
        <Avatar handle={post.handle} color={post.avatarColor} src={post.avatarUrl} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate font-semibold text-foreground">{post.handle}</span>
            <ChainDot chain={post.chain} />
            <span className="font-mono text-xs text-muted-foreground">{post.address}</span>
            
            <div className="ml-auto flex items-center gap-2">
              <TierBadge tier={post.tier} />
            </div>
          </div>

          <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{post.body}</p>

          <div className="mt-3 flex items-center gap-1 text-muted-foreground">
            <button onClick={() => setVote(vote === "up" ? null : "up")} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm hover:text-emerald-300">
              <ArrowBigUp className="size-[18px]" fill={vote === "up" ? "currentColor" : "none"} />
              {formatCount(up)}
            </button>
            <button onClick={() => setVote(vote === "down" ? null : "down")} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm hover:text-destructive">
              <ArrowBigDown className="size-[18px]" fill={vote === "down" ? "currentColor" : "none"} />
              {formatCount(down)}
            </button>
            <button onClick={() => setRecast((r) => !r)} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm hover:text-primary">
              <Repeat2 className="size-[18px]" />
              {formatCount(recasts)}
            </button>
            <button onClick={() => setIsReplying(!isReplying)} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm hover:text-blue-300">
              <MessageCircle className="size-[18px]" />
            </button>
          </div>

          {isReplying && (
            <div className="mt-3">
              <textarea 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Write your reply..."
                rows={2}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={() => setIsReplying(false)} className="px-3 py-1 text-xs hover:text-destructive"><X className="inline size-3" /> Cancel</button>
                <button onClick={handleReply} className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}