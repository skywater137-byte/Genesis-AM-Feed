import { NextResponse } from "next/server"
import { fetchTokenPrice } from "@/lib/price"
import { ACTIVE_TOKEN } from "@/lib/tokens"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const quote = await fetchTokenPrice(ACTIVE_TOKEN)
    return NextResponse.json(quote, {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
      },
    })
  } catch (err) {
    return NextResponse.json(
      {
        priceUsd: null,
        change24h: null,
        volume24h: null,
        liquidityUsd: null,
        source: "none",
        updatedAt: Date.now(),
        error: (err as Error).message,
      },
      { status: 200 },
    )
  }
}
