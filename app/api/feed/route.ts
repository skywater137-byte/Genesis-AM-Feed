import { NextResponse } from "next/server"
import { POSTS, type Chain, type Post, type Tier } from "@/lib/posts"

// ────────────────────────────────────────────────────────────────────────────
// NEYNAR API KEY (server-only)
// Paste your real Neynar API key below. Because this is a SERVER route handler,
// the key is never exposed to the browser or network tab.
// When the key is a real value (not the placeholder), the route will fetch
// the live trending feed and return { live: true, posts: [...] }.
// ────────────────────────────────────────────────────────────────────────────
const NEYNAR_API_KEY = "B8AD811D-4A31-4DF1-9B05-1C5373074666"
const PLACEHOLDER = "PASTE_YOUR_NEYNAR_API_KEY_HERE"

const NEYNAR_FEED_URL =
  "https://api.neynar.com/v2/farcaster/feed/trending/?limit=10&time_window=24h"

// ── Mapping helpers: Farcaster cast → Genesis AM Post ───────────────────────
function shorten(addr: string): string {
  if (!addr) return ""
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return "now"
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000))
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

// Pick a deterministic accent color from the handle (avatar fallback).
function colorFor(handle: string): string {
  let hash = 0
  for (let i = 0; i < handle.length; i++) {
    hash = (hash * 31 + handle.charCodeAt(i)) % 360
  }
  return `oklch(0.65 0.15 ${hash})`
}

// Derive a mock "skin-in-the-game" tier from engagement so the Live Holders
// filter stays meaningful against real data.
function tierFor(likes: number): Tier {
  if (likes >= 100) return "whale"
  if (likes >= 10) return "holder"
  return "exited"
}

type NeynarAuthor = {
  username?: string
  display_name?: string
  pfp_url?: string
  custody_address?: string
  verified_addresses?: {
    eth_addresses?: string[]
    sol_addresses?: string[]
  }
}

type NeynarCast = {
  hash: string
  text: string
  timestamp: string
  author: NeynarAuthor
  reactions?: { likes_count?: number; recasts_count?: number }
  replies?: { count?: number }
}

function mapCast(cast: NeynarCast): Post {
  const author = cast.author ?? {}
  const handle = `@${author.username ?? "unknown"}`
  const eth = author.verified_addresses?.eth_addresses?.[0]
  const sol = author.verified_addresses?.sol_addresses?.[0]
  // Solana users get the purple→green chain dot; everyone else maps to Base.
  const chain: Chain = !eth && sol ? "solana" : "base"
  const address = shorten(eth ?? sol ?? author.custody_address ?? "")
  const likes = cast.reactions?.likes_count ?? 0
  const recasts = cast.reactions?.recasts_count ?? 0
  const createdAt = new Date(cast.timestamp).getTime() || Date.now()
  return {
    id: cast.hash,
    handle,
    address,
    avatarColor: colorFor(handle),
    avatarUrl: author.pfp_url,
    chain,
    tier: tierFor(likes),
    timestamp: relativeTime(cast.timestamp),
    createdAt,
    weight: likes,
    body: cast.text ?? "",
    upvotes: likes,
    downvotes: cast.replies?.count ?? 0,
    recasts,
  }
}

export async function GET() {
  // If no real Neynar key is configured, serve the static sample feed
  // so the demo UI continues to work without errors.
  if (!NEYNAR_API_KEY) {
    return NextResponse.json({ live: false, posts: POSTS })
  }

  try {
    const res = await fetch(NEYNAR_FEED_URL, {
      headers: {
        accept: "application/json",
        "x-api-key": NEYNAR_API_KEY,
      },
      // Always fetch fresh casts (no caching in this demo route).
      cache: "no-store",
    })

    if (!res.ok) {
      const detail = await res.text()
      console.log("[v0] Neynar feed error:", res.status, detail)
      return NextResponse.json(
        { live: false, error: `Neynar responded ${res.status}`, posts: POSTS },
        { status: 200 },
      )
    }

    const data = (await res.json()) as { casts?: NeynarCast[] }
    const posts = (data.casts ?? []).map(mapCast)
    return NextResponse.json({ live: true, posts })
  } catch (err) {
    console.log("[v0] Neynar fetch failed:", (err as Error).message)
    return NextResponse.json(
      { live: false, error: "Fetch failed", posts: POSTS },
      { status: 200 },
    )
  }
}