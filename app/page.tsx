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

  // Load initial data
  useEffect(() => {
    const saved = localStorage.getItem("user-posts")
    if (saved) setUserPosts(JSON.parse(saved))
    
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
    localStorage.setItem("user-posts", JSON.stringify(userPosts))
  }, [userPosts])

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
      weight: 9999,
      body: text,
      upvotes: 0,
      downvotes: 0,
      recast: false,
      recasts: 0,
    }
    setUserPosts((prev) => [post, ...prev])
  }

  const posts = useMemo(() => {
    let list = [...feed]
    if (liveHoldersOnly && address) {
      list = list.filter((p) => p.address.toLowerCase() === address.toLowerCase())
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((p) => p.body.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q))
    }
    list.sort((a, b) => sort === "weighted" ? b.weight - a.weight : b.createdAt - a.createdAt)
    return list
  }, [feed, query, sort, liveHoldersOnly, address])

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
        <PostComposer hasToken={hasToken} onBroadcast={handleBroadcast} />
        
        {loading ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasToken ? (
          <ul>
            {userPosts.map((post) => <li key={post.id}><PostCard post={post} /></li>)}
            {posts.map((post) => <li key={post.id}><PostCard post={post} /></li>)}
          </ul>
        ) : (
          <div className="px-4 py-16 text-center text-muted-foreground">
            <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
            <p>You must hold at least 5 GENTEST tokens to view the Genesis feed.</p>
          </div>
        )}
      </main>
    </div>
  )
}