"use client"

import { useState } from "react"
import {
  ArrowBigDown,
  ArrowBigUp,
  Bot,
  ChevronDown,
  ChevronRight,
  EyeOff,
  MessageCircle,
  Repeat2,
  UserX,
  X,
} from "lucide-react"
import type { Post } from "@/lib/posts"
import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"
import { ChainDot } from "./chain-badge"
import { TierBadge } from "./tier-badge"

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return `${n}`
}

const actionBtnBase =
  "inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"

export function PostCard({
  post,
  onReply,
  depth = 0,
  hasReplies = false,
  replyCount = 0,
  isCollapsed = false,
  onToggleCollapse,
  isSuspectedBot = false,
  onSuspectBot,
  onHidePost,
  onHideUser,
  canInteract = true,
  onRequireConnect,
  showTierBadges = false,
}: {
  post: Post
  onReply: (parentId: string, text: string) => void
  depth?: number
  hasReplies?: boolean
  replyCount?: number
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  isSuspectedBot?: boolean
  onSuspectBot?: (postId: string) => void
  onHidePost?: (postId: string) => void
  onHideUser?: (handle: string, address: string) => void
  canInteract?: boolean
  onRequireConnect?: () => void
  /** Holder / whale / exited badges — only on Live Holders & Alumni. */
  showTierBadges?: boolean
}) {
  const [vote, setVote] = useState<"up" | "down" | null>(null)
  const [recast, setRecast] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState("")

  const isReply = depth > 0

  const up = post.upvotes + (vote === "up" ? 1 : 0)
  const down = post.downvotes + (vote === "down" ? 1 : 0)
  const recasts = post.recasts + (recast ? 1 : 0)

  function guardInteract(action: () => void) {
    if (!canInteract) {
      onRequireConnect?.()
      return
    }
    action()
  }

  const handleReplySubmit = () => {
    if (!canInteract) {
      onRequireConnect?.()
      return
    }
    const trimmed = replyText.trim()
    if (!trimmed) return
    onReply(post.id, trimmed)
    setReplyText("")
    setIsReplying(false)
  }

  const handleCancelReply = () => {
    setIsReplying(false)
    setReplyText("")
  }

  return (
    <article
      className={cn(
        "border-b border-border transition-colors hover:bg-card/40",
        isReply ? "px-3 py-2.5" : "px-4 py-4",
        isSuspectedBot && "bg-amber-400/5 ring-1 ring-inset ring-amber-400/20",
      )}
    >
      <div className={cn("flex gap-3", isReply && "gap-2")}>
        <Avatar
          handle={post.handle}
          color={post.avatarColor}
          src={post.avatarUrl}
          className={isReply ? "size-8" : undefined}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={cn(
                "truncate font-semibold text-foreground",
                isReply ? "text-sm" : "text-base",
              )}
            >
              {post.handle}
            </span>
            <ChainDot chain={post.chain} />
            <span className="font-mono text-[10px] text-muted-foreground sm:text-xs">
              {post.address}
            </span>

            <div className="ml-auto flex items-center gap-2">
              {isSuspectedBot && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                  <Bot className="size-3" />
                  Flagged
                </span>
              )}
              {showTierBadges && post.tier !== "non-holder" && (
                <TierBadge tier={post.tier} />
              )}
            </div>
          </div>

          <p
            className={cn(
              "mt-1.5 leading-relaxed text-foreground/90",
              isReply ? "text-[13px]" : "mt-2 text-[15px]",
            )}
          >
            {post.body}
          </p>

          {hasReplies && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-blue-300 transition-colors hover:bg-blue-400/10 hover:text-blue-200"
            >
              {isCollapsed ? (
                <ChevronRight className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </button>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                guardInteract(() => setVote(vote === "up" ? null : "up"))
              }
              className={cn(
                actionBtnBase,
                vote === "up" && "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
              )}
            >
              <ArrowBigUp
                className="size-4"
                fill={vote === "up" ? "currentColor" : "none"}
              />
              {formatCount(up)}
            </button>
            <button
              type="button"
              onClick={() =>
                guardInteract(() => setVote(vote === "down" ? null : "down"))
              }
              className={cn(
                actionBtnBase,
                vote === "down" && "border-destructive/40 bg-destructive/10 text-destructive",
              )}
            >
              <ArrowBigDown
                className="size-4"
                fill={vote === "down" ? "currentColor" : "none"}
              />
              {formatCount(down)}
            </button>
            <button
              type="button"
              onClick={() => guardInteract(() => setRecast((r) => !r))}
              className={cn(
                actionBtnBase,
                recast && "border-primary/40 bg-primary/10 text-primary",
              )}
            >
              <Repeat2 className="size-4" />
              {formatCount(recasts)}
            </button>
            <button
              type="button"
              onClick={() =>
                guardInteract(() => setIsReplying(!isReplying))
              }
              className={cn(
                actionBtnBase,
                isReplying && "border-blue-400/40 bg-blue-400/10 text-blue-300",
              )}
            >
              <MessageCircle className="size-4" />
              Reply
            </button>
            <button
              type="button"
              onClick={() => onSuspectBot?.(post.id)}
              className={cn(
                actionBtnBase,
                isSuspectedBot && "border-amber-400/40 bg-amber-400/10 text-amber-300",
              )}
            >
              <Bot className="size-4" />
              Suspected Bot
            </button>
            <button
              type="button"
              onClick={() => onHidePost?.(post.id)}
              className={actionBtnBase}
            >
              <EyeOff className="size-4" />
              Hide Post
            </button>
            <button
              type="button"
              onClick={() => onHideUser?.(post.handle, post.address)}
              className={actionBtnBase}
            >
              <UserX className="size-4" />
              Hide User
            </button>
          </div>

          {isReplying && (
            <div className={cn("mt-3", isReply && "mt-2")}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleReplySubmit()
                  }
                }}
                className={cn(
                  "w-full rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary",
                  isReply ? "p-2 text-xs" : "p-3 text-sm",
                )}
                placeholder="Write your reply..."
                rows={2}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelReply}
                  className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-card hover:text-destructive"
                >
                  <X className="size-3" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReplySubmit}
                  className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
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
