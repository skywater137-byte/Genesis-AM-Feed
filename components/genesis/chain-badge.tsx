import type { Chain } from "@/lib/posts"

export function ChainDot({ chain }: { chain: Chain }) {
  if (chain === "base") {
    return (
      <span
        className="inline-block size-2.5 shrink-0 rounded-full bg-[#3b82f6] shadow-[0_0_8px_1px_rgba(59,130,246,0.7)]"
        aria-hidden
      />
    )
  }
  return (
    <span
      className="inline-block size-2.5 shrink-0 rounded-full bg-[linear-gradient(135deg,#9945ff_0%,#14f195_100%)] shadow-[0_0_8px_1px_rgba(153,69,255,0.6)]"
      aria-hidden
    />
  )
}

export function ChainLabel({ chain }: { chain: Chain }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <ChainDot chain={chain} />
      <span className="text-xs font-medium text-muted-foreground">
        {chain === "base" ? "Base" : "Solana"}
      </span>
      <span className="sr-only">
        {chain === "base" ? "Base network user" : "Solana network user"}
      </span>
    </span>
  )
}
