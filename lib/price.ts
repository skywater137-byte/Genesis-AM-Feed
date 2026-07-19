import { ACTIVE_TOKEN, type TokenConfig } from "@/lib/tokens"

export type TokenPriceQuote = {
  priceUsd: number | null
  change24h: number | null
  volume24h: number | null
  liquidityUsd: number | null
  source: "dexscreener" | "coingecko" | "none"
  updatedAt: number
}

type DexPair = {
  priceUsd?: string
  priceChange?: { h24?: number }
  volume?: { h24?: number }
  liquidity?: { usd?: number }
  chainId?: string
}

async function fetchDexScreener(
  token: TokenConfig,
): Promise<TokenPriceQuote | null> {
  const url = `https://api.dexscreener.com/tokens/v1/${token.chainSlug}/${token.address}`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) return null

  const pairs = (await res.json()) as DexPair[]
  if (!Array.isArray(pairs) || pairs.length === 0) return null

  const ranked = [...pairs].sort(
    (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0),
  )
  const top = ranked[0]
  const price = top.priceUsd ? Number(top.priceUsd) : NaN

  return {
    priceUsd: Number.isFinite(price) ? price : null,
    change24h:
      typeof top.priceChange?.h24 === "number" ? top.priceChange.h24 : null,
    volume24h: typeof top.volume?.h24 === "number" ? top.volume.h24 : null,
    liquidityUsd:
      typeof top.liquidity?.usd === "number" ? top.liquidity.usd : null,
    source: "dexscreener",
    updatedAt: Date.now(),
  }
}

async function fetchCoinGecko(
  token: TokenConfig,
): Promise<TokenPriceQuote | null> {
  const url =
    `https://api.coingecko.com/api/v3/simple/token_price/${token.coingeckoPlatformId}` +
    `?contract_addresses=${token.address.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`

  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) return null

  const data = (await res.json()) as Record<
    string,
    { usd?: number; usd_24h_change?: number }
  >
  const entry = data[token.address.toLowerCase()]
  if (!entry?.usd && entry?.usd !== 0) return null

  return {
    priceUsd: entry.usd ?? null,
    change24h:
      typeof entry.usd_24h_change === "number" ? entry.usd_24h_change : null,
    volume24h: null,
    liquidityUsd: null,
    source: "coingecko",
    updatedAt: Date.now(),
  }
}

/** Server-side price fetch — DexScreener first (new Base tokens), CoinGecko fallback. */
export async function fetchTokenPrice(
  token: TokenConfig = ACTIVE_TOKEN,
): Promise<TokenPriceQuote> {
  try {
    const dex = await fetchDexScreener(token)
    if (dex?.priceUsd != null) return dex
  } catch {
    // fall through
  }

  try {
    const cg = await fetchCoinGecko(token)
    if (cg?.priceUsd != null) return cg
  } catch {
    // fall through
  }

  return {
    priceUsd: null,
    change24h: null,
    volume24h: null,
    liquidityUsd: null,
    source: "none",
    updatedAt: Date.now(),
  }
}
