"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

export type SortKey = "weighted" | "recent"

const SORT_LABELS: Record<SortKey, string> = {
  weighted: "Top Weighted",
  recent: "Most Recent",
}

export function SubToolbar({
  liveHoldersOnly,
  onToggleLiveHolders,
  sort,
  onSortChange,
}: {
  liveHoldersOnly: boolean
  onToggleLiveHolders: (v: boolean) => void
  sort: SortKey
  onSortChange: (s: SortKey) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  return (
    <div className="sticky top-[57px] z-20 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2.5">
        {/* Live Holders toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={liveHoldersOnly}
          onClick={() => onToggleLiveHolders(!liveHoldersOnly)}
          className="flex items-center gap-2.5"
        >
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              liveHoldersOnly
                ? "bg-emerald-500 shadow-[0_0_12px_-1px_rgba(16,185,129,0.8)]"
                : "bg-muted"
            }`}
          >
            <span
              className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${
                liveHoldersOnly ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
          <span className="text-sm font-medium text-foreground">
            Live Holders Only
          </span>
        </button>

        {/* Sort dropdown */}
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <span className="text-muted-foreground">Sort by:</span>
            <span className="font-medium">{SORT_LABELS[sort]}</span>
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <ul
              role="listbox"
              className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-2xl"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={sort === key}
                    onClick={() => {
                      onSortChange(key)
                      setOpen(false)
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-muted"
                  >
                    {SORT_LABELS[key]}
                    {sort === key && (
                      <Check className="size-4 text-primary" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
