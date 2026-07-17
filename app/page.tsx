"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, EyeOff, RotateCcw, X } from "lucide-react"
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit"
import { type Post } from "@/lib/posts"
import { Header } from "@/components/genesis/header"
import {
  SubToolbar,
  type FeedSegment,
  type SortKey,
} from "@/components/genesis/sub-toolbar"
import { PostComposer } from "@/components/genesis/post-composer"
import { PostCard } from "@/components/genesis/post-card"
import { ConnectBuyButton } from "@/components/genesis/connect-buy-button"
import { useAccount, useReadContract } from "wagmi"
import { erc20Abi } from "viem"

export const dynamic = "force-dynamic"

type BlocklistState = {
  blockedPosts: string[]
  blockedUsers: string[]
}

const LIVE_HOLDER_TIERS = new Set(["whale", "holder"])
const ALUMNI_TIERS = new Set(["exited"])

function Thread({
  post,
  posts,
  onReply,
  depth = 0,
  collapsedThreads,
  onToggleCollapse,
  suspectedBots,
  onSuspectBot,
  onHidePost,
  onHideUser,
  canInteract,
  onRequireConnect,
}: {
  post: Post
  posts: Post[]
  onReply: (parentId: string, text: string) => void
  depth?: number
  collapsedThreads: Set<string>
  onToggleCollapse: (postId: string) => void
  suspectedBots: Set<string>
  onSuspectBot: (postId: string) => void
  onHidePost: (postId: string) => void
  onHideUser: (handle: string, address: string) => void
  canInteract: boolean
  onRequireConnect: () => void
}) {
  const children = posts.filter((p) => p.parentId === post.id)
  const isCollapsed = collapsedThreads.has(post.id)

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l-2 border-border/40 my-2" : "my-3"}>
      <div className="relative">
        <PostCard
          post={post}
          onReply={onReply}
          depth={depth}
          hasReplies={children.length > 0}
          replyCount={children.length}
          isCollapsed={isCollapsed}
          onToggleCollapse={
            children.length > 0 ? () => onToggleCollapse(post.id) : undefined
          }
          isSuspectedBot={suspectedBots.has(post.id)}
          onSuspectBot={onSuspectBot}
          onHidePost={onHidePost}
          onHideUser={onHideUser}
          canInteract={canInteract}
          onRequireConnect={onRequireConnect}
        />
      </div>

      {children.length > 0 && (
        <div className="flex items-center gap-1.5 my-1 ml-1 text-xs">
          <button
            onClick={() => onToggleCollapse(post.id)}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium py-0.5 px-1.5 rounded hover:bg-muted/50"
          >
            {isCollapsed ? (
              <>
                <span>Show {children.length} hidden {children.length === 1 ? "reply" : "replies"}</span>
              </>
            ) : (
              <span>Collapse thread</span>
            )}
          </button>
        </div>
      )}

      {!isCollapsed &&
        children.map((child) => (
          <Thread
            key={child.id}
            post={child}
            posts={posts}
            onReply={onReply}
            depth={depth + 1}
            collapsedThreads={collapsedThreads}
            onToggleCollapse={onToggleCollapse}
            suspectedBots={suspectedBots}
            onSuspectBot={onSuspectBot}
            onHidePost={onHidePost}
            onHideUser={onHideUser}
            canInteract={canInteract}
            onRequireConnect={onRequireConnect}
          />
        ))}
    </div>
  )
}

export default function Page() {
  const { isConnected, address } = useAccount()
  const { openConnectModal } = useConnectModal()

  const TOKEN_CONTRACT = "0x85d809585BFE271c73a9AAEfeCF0be1204FDB2fd"

  const { data: balance } = useReadContract({
    address: TOKEN_CONTRACT as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: isConnected },
  })

  const hasToken =
    isConnected && balance !== undefined && balance >= BigInt(5 * 10 ** 18)

  const [query, setQuery] = useState("")
  const [segment, setSegment] = useState<FeedSegment>("general")
  const [sort, setSort] = useState<SortKey>("weighted")
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [feed, setFeed] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [suspectedBots, setSuspectedBots] = useState<Set<string>>(new Set())
  const [blockedPosts, setBlockedPosts] = useState<string[]>([])
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(new Set())
  const [showBlocklistModal, setShowBlocklistModal] = useState(false)
  const [showConnectPrompt, setShowConnectPrompt] = useState(false)

  useEffect(() => {
    const savedPosts = localStorage.getItem("user-posts")
    if (savedPosts) {
      try {
        setUserPosts(JSON.parse(savedPosts))
      } catch {
        localStorage.removeItem("user-posts")
      }
    }

    const savedBlocklist = localStorage.getItem("genesis-blocklist")
    if (savedBlocklist) {
      try {
        const parsed = JSON.parse(savedBlocklist) as BlocklistState
        setBlockedPosts(parsed.blockedPosts ?? [])
        setBlockedUsers(parsed.blockedUsers ?? [])
      } catch {
        localStorage.removeItem("genesis-blocklist")
      }
    }

    const savedBots = localStorage.getItem("genesis-suspected-bots")
    if (savedBots) {
      try {
        setSuspectedBots(new Set(JSON.parse(savedBots) as string[]))
      } catch {
        localStorage.removeItem("genesis-suspected-bots")
      }
    }

    setHydrated(true)

    async function loadFeed() {
      try {
        const res = await fetch("/api/feed", { cache: "no-store" })
        const data = (await res.json()) as { posts: Post[] }
        setFeed(data.posts ?? [])
      } catch {
        setFeed([])
      } finally {
        setLoading(false)
      }
    }
    loadFeed()
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem("user-posts", JSON.stringify(userPosts))
  }, [userPosts, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(
      "genesis-blocklist",
      JSON.stringify({ blockedPosts, blockedUsers }),
    )
  }, [blockedPosts, blockedUsers, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(
      "genesis-suspected-bots",
      JSON.stringify([...suspectedBots]),
    )
  }, [suspectedBots, hydrated])

  // Close the connect prompt once the user has a qualifying key.
  useEffect(() => {
    if (hasToken) setShowConnectPrompt(false)
  }, [hasToken])

  function requireConnect() {
    if (hasToken) return
    setShowConnectPrompt(true)
    if (!isConnected) {
      openConnectModal?.()
    }
  }

  function handleBroadcast(text: string) {
    if (!hasToken) {
      requireConnect()
      return
    }
    const post: Post = {
      id: `user-${Date.now()}`,
      handle: "@user_test",
      address: address ?? "0x0000000000000000000000000000000000000000",
      avatarColor: "oklch(0.66 0.16 200)",
      chain: "base",
      tier: "holder",
      timestamp: "now",
      createdAt: Date.now(),
      weight: 9999,
      body: text,
      upvotes: 0,
      downvotes: 0,
      recast: false,
      recasts: 0,
    }
    setUserPosts((prev) => [post, ...prev])
  }

  function handleReply(parentId: string, text: string) {
    if (!hasToken) {
      requireConnect()
      return
    }
    const trimmed = text.trim()
    if (!trimmed) return

    const replyPost: Post = {
      id: `reply-${Date.now()}`,
      handle: "@user_test",
      address: address ?? "0x0000000000000000000000000000000000000000",
      avatarColor: "oklch(0.66 0.16 200)",
      chain: "base",
      tier: "holder",
      timestamp: "now",
      createdAt: Date.now(),
      weight: 1,
      body: trimmed,
      upvotes: 0,
      downvotes: 0,
      recast: false,
      recasts: 0,
      parentId: parentId,
    }
    setUserPosts((prev) => [replyPost, ...prev])
  }

  function handleSuspectBot(postId: string) {
    setSuspectedBots((prev) => {
      const next = new Set(prev)
      next.add(postId)
      return next
    })
  }

  function handleHidePost(postId: string) {
    setBlockedPosts((prev) =>
      prev.includes(postId) ? prev : [...prev, postId],
    )
  }

  function handleUnhidePost(postId: string) {
    setBlockedPosts((prev) => prev.filter((id) => id !== postId))
  }

  function handleHideUser(handle: string, userAddress: string) {
    setBlockedUsers((prev) => {
      const next = [...prev]
      if (!next.includes(handle)) next.push(handle)
      if (userAddress && !next.includes(userAddress)) next.push(userAddress)
      return next
    })
  }

  function handleUnhideUser(identifier: string) {
    setBlockedUsers((prev) => prev.filter((item) => item !== identifier))
  }

  function handleToggleCollapse(postId: string) {
    setCollapsedThreads((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  const allPosts = useMemo(() => [...feed, ...userPosts], [feed, userPosts])

  const posts = useMemo(() => {
    let list = [...allPosts]

    list = list.filter(
      (p) =>
        !blockedPosts.includes(p.id) &&
        !blockedUsers.includes(p.handle) &&
        !blockedUsers.includes(p.address),
    )

    if (segment === "live-holders") {
      list = list.filter((p) => LIVE_HOLDER_TIERS.has(p.tier))
    } else if (segment === "alumni") {
      list = list.filter((p) => ALUMNI_TIERS.has(p.tier))
    }

    if (query.trim()) {
      const q = query.toLowerCase().replace(/[^\w\s]/gi, "").trim()
      list = list.filter((p) => {
        const bodyClean = p.body.toLowerCase().replace(/[^\w\s]/gi, "")
        const handleClean = p.handle.toLowerCase().replace(/[^\w\s]/gi, "")
        return bodyClean.includes(q) || handleClean.includes(q)
      })
    }

    list.sort((a, b) =>
      sort === "weighted" ? b.weight - a.weight : b.createdAt - a.createdAt,
    )
    return list
  }, [allPosts, query, sort, segment, blockedPosts, blockedUsers])

  const rootPosts = useMemo(() => posts.filter((p) => !p.parentId), [posts])

  const segmentEmptyCopy: Record<FeedSegment, string> = {
    general: "No posts yet. Be the first to broadcast.",
    "live-holders": "No live holder posts in this view.",
    alumni: "No alumni / legacy posts in this view.",
  }

  return (
    <div className="min-h-dvh bg-background">
      <Header query={query} onQueryChange={setQuery}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBlocklistModal(true)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/60 relative"
            title="Hidden Items"
          >
            <EyeOff className="size-4" />
            {(blockedPosts.length > 0 || blockedUsers.length > 0) && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
            )}
          </button>
          {isConnected ? (
            <ConnectButton />
          ) : (
            <ConnectBuyButton className="inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-bold text-background transition-transform hover:scale-[1.02] sm:text-sm sm:px-4 sm:py-2" />
          )}
        </div>
      </Header>

      <SubToolbar
        segment={segment}
        onSegmentChange={setSegment}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Connect / buy prompt when gated actions are attempted */}
      {showConnectPrompt && !hasToken && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <button
              type="button"
              onClick={() => setShowConnectPrompt(false)}
              className="absolute right-3 top-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-lg font-bold pr-8">Connect & Buy on Base</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Browsing is public. Posting, replying, and other interactions
              require holding Genesis AM on Base.
            </p>
            <div className="mt-5">
              <ConnectBuyButton fullWidth />
            </div>
          </div>
        </div>
      )}

      {/* Hidden Items Management Modal */}
      {showBlocklistModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-lg font-bold">Hidden Posts & Blocked Users</h3>
              <button
                onClick={() => setShowBlocklistModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-medium"
              >
                Close
              </button>
            </div>

            <div className="py-4 overflow-y-auto flex-1 space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Hidden Posts ({blockedPosts.length})
                </h4>
                {blockedPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No hidden posts.</p>
                ) : (
                  <ul className="space-y-2">
                    {blockedPosts.map((id) => {
                      const hiddenPost = allPosts.find((p) => p.id === id)
                      return (
                        <li
                          key={id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50 text-xs"
                        >
                          <span className="truncate max-w-[320px]">
                            {hiddenPost ? hiddenPost.body : `Post ID: ${id}`}
                          </span>
                          <button
                            onClick={() => handleUnhidePost(id)}
                            className="inline-flex items-center gap-1 text-primary hover:underline font-medium shrink-0 ml-2"
                          >
                            <RotateCcw className="size-3" /> Unhide
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Blocked Users / Handles ({blockedUsers.length})
                </h4>
                {blockedUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No blocked users.</p>
                ) : (
                  <ul className="space-y-2">
                    {blockedUsers.map((user) => (
                      <li
                        key={user}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50 text-xs"
                      >
                        <span className="font-mono">{user}</span>
                        <button
                          onClick={() => handleUnhideUser(user)}
                          className="inline-flex items-center gap-1 text-primary hover:underline font-medium shrink-0 ml-2"
                        >
                          <RotateCcw className="size-3" /> Unblock
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => setShowBlocklistModal(false)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-2xl px-4 py-2">
        {!hasToken && (
          <div className="my-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-center text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Public town square.</span>{" "}
            Browse freely — post, reply, or vote after you{" "}
            <button
              type="button"
              onClick={requireConnect}
              className="font-semibold text-primary hover:underline"
            >
              Connect & Buy on Base
            </button>
            .
          </div>
        )}

        <PostComposer
          hasToken={hasToken}
          isConnected={isConnected}
          onBroadcast={handleBroadcast}
          onRequireConnect={requireConnect}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : rootPosts.length === 0 ? (
          <div className="px-4 py-16 text-center text-sm text-muted-foreground">
            {segmentEmptyCopy[segment]}
          </div>
        ) : (
          <ul>
            {rootPosts.map((post) => (
              <li key={post.id}>
                <Thread
                  post={post}
                  posts={posts}
                  onReply={handleReply}
                  collapsedThreads={collapsedThreads}
                  onToggleCollapse={handleToggleCollapse}
                  suspectedBots={suspectedBots}
                  onSuspectBot={handleSuspectBot}
                  onHidePost={handleHidePost}
                  onHideUser={handleHideUser}
                  canInteract={hasToken}
                  onRequireConnect={requireConnect}
                />
              </li>
            ))}
          </ul>
        )}

        <footer className="mt-10 mb-8 px-2 text-center text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground font-medium text-sm">About Genesis AM</strong>
          <p className="mt-2 max-w-md mx-auto">
            Genesis AM ($GENAM) is an autonomous, bot-resistant microblogging
            protocol on Base. We replace corporate gatekeepers with
            cryptographic proof-of-key access.
          </p>
        </footer>
      </main>
    </div>
  )
}
