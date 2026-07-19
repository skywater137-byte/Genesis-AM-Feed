"use client"

import { useQuery } from "@tanstack/react-query"
import { TrendingDown, TrendingUp } from "lucide-react"
import type { TokenPriceQuote } from "@/lib/price"
import { ACTIVE_TOKEN, getDexScreenerUrl } from "@/lib/tokens"

async function fetchPrice(): Promise<TokenPriceQuote> {
  const res = await fetch("/api/price", { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch price")
  return res.json() as Promise<TokenPriceQuote>
}

function formatUsd(n: number) {
  if (n >= 1) {
    return n.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
  }
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  })
}

export function PriceHeader() {
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["token-price", ACTIVE_TOKEN.address],
    queryFn: fetchPrice,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  const change = data?.change24h
  const up = typeof change === "number" && change >= 0
  const down = typeof change === "number" && change < 0

  return (
    <div className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2 text-xs sm:text-sm">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-[#3b82f6] shadow-[0_0_8px_1px_rgba(59,130,246,0.7)]" />
          <span className="font-semibold text-foreground">
            {ACTIVE_TOKEN.symbol}
          </span>
          <span className="hidden text-muted-foreground sm:inline">· Base</span>
          {isFetching && !isLoading && (
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60" />
          )}
        </div>

        <div className="flex items-center gap-3 tabular-nums">
          {isLoading ? (
            <span className="text-muted-foreground">Fetching price…</span>
          ) : isError || data?.priceUsd == null ? (
            <a
              href={getDexScreenerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Price pending — view on DexScreener
            </a>
          ) : (
            <>
              <span className="font-semibold text-foreground">
                {formatUsd(data.priceUsd)}
              </span>
              {typeof change === "number" && (
                <span
                  className={`inline-flex items-center gap-0.5 font-medium ${
                    up
                      ? "text-emerald-400"
                      : down
                        ? "text-red-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {up ? (
                    <TrendingUp className="size-3.5" />
                  ) : down ? (
                    <TrendingDown className="size-3.5" />
                  ) : null}
                  {`${up ? "+" : ""}${change.toFixed(2)}%`}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
