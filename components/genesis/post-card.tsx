"use client"

import { useState } from "react"
import { ArrowBigDown, ArrowBigUp, Repeat2, MessageCircle } from "lucide-react"
import type { Post } from "@/lib/posts"
import { Avatar } from "./avatar"
import { ChainDot } from "./chain-badge"
import { TierBadge } from "./tier-badge"

const KNOWN_HOLDER_ADDRESS = "0x85d809585BFE271c73a9AAEfeCF0be1204FDB2fd".toLowerCase()

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return `${n}`
}

export function PostCard({ post }: { post: Post }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null)
  const [recast, setRecast] = useState(false)

  const up = post.upvotes + (vote === "up" ? 1 : 0)
  const down = post.downvotes + (vote === "down" ? 1 : 0)
  const recasts = post.recasts + (recast ? 1 : 0)

  const isVerifiedHolder = post.address?.toLowerCase().trim() === KNOWN_HOLDER_ADDRESS.trim();
  const displayTier = (isVerifiedHolder || post.tier === "holder") ? "holder" : post.tier;

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
              <button className="text-xs text-primary font-bold hover:underline">Follow</button>
              <TierBadge tier={displayTier} />
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
            <button onClick={() => alert("Comment feature active")} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm hover:text-blue-300">
              <MessageCircle className="size-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}