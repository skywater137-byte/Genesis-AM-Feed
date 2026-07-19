/**
 * Single source of truth for Genesis AM token metadata.
 * Swap this object (or point ACTIVE_TOKEN at another entry) to retarget the app.
 */
export type TokenConfig = {
  address: `0x${string}`
  symbol: string
  name: string
  decimals: number
  /** EVM chain id — Base mainnet = 8453 */
  chainId: number
  /** DexScreener / Uniswap chain slug */
  chainSlug: "base"
  /** Minimum ERC-20 balance required to post / interact */
  minHoldRaw: bigint
  coingeckoPlatformId: string
}

/** Production Genesis AM on Base */
export const GENESIS_AM_TOKEN: TokenConfig = {
  address: "0x6Bc6dFE45e1823512eF30Cf3465C74d533101B07",
  symbol: "GENAM",
  name: "Genesis AM",
  decimals: 18,
  chainId: 8453,
  chainSlug: "base",
  minHoldRaw: BigInt(5) * BigInt(10 ** 18),
  coingeckoPlatformId: "base",
}

/** Active token used across the app — change here to retarget. */
export const ACTIVE_TOKEN = GENESIS_AM_TOKEN

export function getUniswapSwapUrl(
  token: TokenConfig = ACTIVE_TOKEN,
  inputCurrency: string = "ETH",
) {
  const params = new URLSearchParams({
    chain: token.chainSlug,
    inputCurrency,
    outputCurrency: token.address,
  })
  return `https://app.uniswap.org/swap?${params.toString()}`
}

export function getDexScreenerUrl(token: TokenConfig = ACTIVE_TOKEN) {
  return `https://dexscreener.com/${token.chainSlug}/${token.address}`
}

export function shortenAddress(address: string, chars = 4) {
  if (!address || address.length < chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`
}
