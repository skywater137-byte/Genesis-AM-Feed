import type { Tier } from "@/lib/posts"

const TIER_CONFIG: Record<
  Tier,
  { label: string; className: string }
> = {
  whale: {
    label: "Whale",
    className:
      "border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-[0_0_12px_-2px_rgba(251,191,36,0.5)]",
  },
  holder: {
    label: "Holder",
    className:
      "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 shadow-[0_0_12px_-2px_rgba(52,211,153,0.4)]",
  },
  exited: {
    label: "Exited",
    className:
      "border-border bg-muted/60 text-muted-foreground line-through decoration-1",
  },
  "non-holder": {
    label: "Non-Holder",
    className: "border-border bg-muted/30 text-muted-foreground",
  },
}

export function TierBadge({ tier }: { tier: Tier }) {
  // Use a fallback to 'non-holder' if the tier is not found to prevent crashes
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG["non-holder"]
  
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cfg.className}`}
    >
      {cfg.label}
    </span>
  )
}
