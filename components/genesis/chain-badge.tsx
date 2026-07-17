import type { Chain } from "@/lib/posts"

export function ChainDot({ chain: _chain }: { chain: Chain }) {
  return (
    <span
      className="inline-block size-2.5 shrink-0 rounded-full bg-[#3b82f6] shadow-[0_0_8px_1px_rgba(59,130,246,0.7)]"
      aria-hidden
      title="Base"
    />
  )
}

export function ChainLabel({ chain: _chain }: { chain: Chain }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <ChainDot chain={chain} />
      <span className="text-xs font-medium text-muted-foreground">Base</span>
      <span className="sr-only">Base network user</span>
    </span>
  )
}
