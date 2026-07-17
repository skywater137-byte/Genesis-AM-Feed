export type Chain = "base"
export type Tier = "whale" | "holder" | "exited" | "non-holder"

export type Post = {
  id: string
  handle: string
  address: string
  avatarColor: string
  avatarUrl?: string
  chain: Chain
  tier: Tier
  timestamp: string
  createdAt: number
  weight: number
  body: string
  upvotes: number
  downvotes: number
  recasts: number
  recast: boolean
  parentId?: string
}

export const POSTS: Post[] = [
  {
    id: "1",
    handle: "@vitalik.gm",
    address: "0x7a3f...e21d",
    avatarColor: "oklch(0.62 0.17 255)",
    chain: "base",
    tier: "whale",
    timestamp: "2m",
    createdAt: Date.now() - 2 * 60_000,
    weight: 9820,
    body: "Liquidity is finally unified on Base. Holder-weighted threads, verified keys, and a timeline that actually rewards skin in the game.",
    upvotes: 1284,
    downvotes: 12,
    recasts: 312,
    recast: false,
  },
  {
    id: "2",
    handle: "@base_maxi",
    address: "0x4z9x...7Qa2",
    avatarColor: "oklch(0.6 0.2 255)",
    chain: "base",
    tier: "whale",
    timestamp: "8m",
    createdAt: Date.now() - 8 * 60_000,
    weight: 7640,
    body: "Genesis Key holders only feed hits different. No bots, no farmers, no engagement bait. Just signal from people with skin in the game.",
    upvotes: 902,
    downvotes: 31,
    recasts: 188,
    recast: false,
  },
  {
    id: "3",
    handle: "@onchain_anna",
    address: "0x1c8b...9f04",
    avatarColor: "oklch(0.7 0.15 145)",
    chain: "base",
    tier: "holder",
    timestamp: "21m",
    createdAt: Date.now() - 21 * 60_000,
    weight: 1420,
    body: "The Live Holders segment is genuinely the killer feature. Flip to it and every exited paper-hand vanishes from the timeline instantly.",
    upvotes: 564,
    downvotes: 8,
    recasts: 97,
    recast: false,
  },
  {
    id: "4",
    handle: "@degenduck",
    address: "0x9mPq...Lk31",
    avatarColor: "oklch(0.68 0.18 60)",
    chain: "base",
    tier: "holder",
    timestamp: "44m",
    createdAt: Date.now() - 44 * 60_000,
    weight: 980,
    body: "Broadcast weighting by token balance keeps the timeline clean. Whales surface first, but holders still get heard. Elegant.",
    upvotes: 311,
    downvotes: 19,
    recasts: 41,
    recast: false,
  },
  {
    id: "5",
    handle: "@former_holder",
    address: "0xab44...7c10",
    avatarColor: "oklch(0.55 0.02 264)",
    chain: "base",
    tier: "exited",
    timestamp: "1h",
    createdAt: Date.now() - 60 * 60_000,
    weight: 0,
    body: "Sold too early and now my posts are tagged Exited. Brutal but fair. The badge of shame is real accountability.",
    upvotes: 88,
    downvotes: 204,
    recasts: 9,
    recast: false,
  },
  {
    id: "demo-exited",
    handle: "@paperhands_pete",
    address: "0x55dd...01ab",
    avatarColor: "oklch(0.55 0.02 264)",
    chain: "base",
    tier: "exited",
    timestamp: "1h",
    createdAt: Date.now() - 90 * 60_000,
    weight: 0,
    body: "Dumped my whole Genesis bag at the local top, ngl. Still lurking here though. Watch this post vanish the second someone flips to Live Holders.",
    upvotes: 24,
    downvotes: 311,
    recasts: 3,
    recast: false,
  },
  {
    id: "6",
    handle: "@quietbuilder",
    address: "0x7Hn2...Wd88",
    avatarColor: "oklch(0.66 0.16 200)",
    chain: "base",
    tier: "holder",
    timestamp: "2h",
    createdAt: Date.now() - 2 * 60 * 60_000,
    weight: 1670,
    body: "Shipped a Base tipping prototype this weekend that reads the same holder graph Genesis uses. Open-sourcing soon.",
    upvotes: 472,
    downvotes: 6,
    recasts: 130,
    recast: false,
  },
]
