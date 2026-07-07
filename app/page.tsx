"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { type Post } from "@/lib/posts"
import { Header } from "@/components/genesis/header"
import { SubToolbar, type SortKey } from "@/components/genesis/sub-toolbar"
import { PostComposer } from "@/components/genesis/post-composer"
import { PostCard } from "@/components/genesis/post-card"
import { useAccount, useReadContract } from "wagmi"
import { erc20Abi } from "viem"

export const dynamic = 'force-dynamic';

type BlocklistState = {
  blockedPosts: string[]
  blockedUsers: string[]
}

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
}) {
  const children = posts.filter((p) => p.parentId === post.id)
  const isCollapsed = collapsedThreads.has(post.id)

  return (
    <>
      <div className={depth > 0 ? "ml-8 border-l-2 border-border/50" : undefined}>
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
        />
      </div>
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
          />
        ))}
    </>
  )
}

export default function Page() {
  const { isConnected, address } = useAccount()

  const TOKEN_CONTRACT = '0x85d809585BFE271c73a9AAEfeCF0be1204FDB2fd'
  
  const { data: balance } = useReadContract({
    address: TOKEN_CONTRACT as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: isConnected }
  })

  const hasToken = isConnected && balance !== undefined && balance >= BigInt(5 * 10**18)

  const [query, setQuery] = useState("")
  const [liveHoldersOnly, setLiveHoldersOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>("weighted")
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [feed, setFeed] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [suspectedBots, setSuspectedBots] = useState<Set<string>>(new Set())
  const [blockedPosts, setBlockedPosts] = useState<string[]>([])
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(new Set())

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
        const res = await fetch("/api/feed", { cache: 'no-store' })
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

  function handleBroadcast(text: string) {
    const post: Post = {
      id: `user-${Date.now()}`,
      handle: "@user_test",
      address: address ?? "0x0000000000000000000000000000000000000000",
      avatarColor: "oklch(0.66 0.16 200)",
      chain: "base",
      tier: hasToken ? "holder" : "non-holder",
      timestamp: "now",
      createdAt: Date.now(),
      weight: hasToken ? 9999 : 0,
      body: text,
      upvotes: 0,
      downvotes: 0,
      recast: false,
      recasts: 0,
    }
    setUserPosts((prev) => [post, ...prev])
  }

  function handleReply(parentId: string, text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    const replyPost: Post = {
      id: `reply-${Date.now()}`,
      handle: "@user_test",
      address: address ?? "0x0000000000000000000000000000000000000000",
      avatarColor: "oklch(0.66 0.16 200)",
      chain: "base",
      tier: hasToken ? "holder" : "non-holder",
      timestamp: "now",
      createdAt: Date.now(),
      weight: hasToken ? 1 : 0,
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
    console.log("[Genesis AM] Suspected bot flagged:", postId)
  }

  function handleHidePost(postId: string) {
    setBlockedPosts((prev) =>
      prev.includes(postId) ? prev : [...prev, postId],
    )
  }

  function handleHideUser(handle: string, userAddress: string) {
    setBlockedUsers((prev) => {
      const next = [...prev]
      if (!next.includes(handle)) next.push(handle)
      if (userAddress && !next.includes(userAddress)) next.push(userAddress)
      return next
    })
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

    if (liveHoldersOnly && address) {
      list = list.filter((p) => p.address.toLowerCase() === address.toLowerCase())
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((p) => p.body.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q))
    }
    list.sort((a, b) => sort === "weighted" ? b.weight - a.weight : b.createdAt - a.createdAt)
    return list
  }, [allPosts, query, sort, liveHoldersOnly, address, blockedPosts, blockedUsers])

  const rootPosts = useMemo(() => posts.filter((p) => !p.parentId), [posts])

  return (
    <div className="min-h-dvh bg-background">
      <Header query={query} onQueryChange={setQuery}>
        <ConnectButton />
      </Header>

      <SubToolbar
        liveHoldersOnly={liveHoldersOnly}
        onToggleLiveHolders={setLiveHoldersOnly}
        sort={sort}
        onSortChange={setSort}
      />

      <main className="mx-auto max-w-2xl">
        <PostComposer hasToken={hasToken} isConnected={isConnected} onBroadcast={handleBroadcast} />
        
        {loading ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasToken ? (
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
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-16 text-center text-muted-foreground">
            <h2 className="text-xl font-bold mb-2">Genesis AM</h2>
            <p>You must hold Genesis AM tokens in your wallet to enter.</p>
          </div>
        )}
      </main>
    </div>
  )
}
