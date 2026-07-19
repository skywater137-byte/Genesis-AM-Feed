"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

export type SortKey = "weighted" | "recent"
export type FeedSegment = "general" | "live-holders" | "alumni"

const SORT_LABELS: Record<SortKey, string> = {
  weighted: "Top Weighted",
  recent: "Most Recent",
}

const SEGMENTS: { id: FeedSegment; label: string; hint: string }[] = [
  { id: "general", label: "General", hint: "Public discovery feed" },
  { id: "live-holders", label: "Live Holders", hint: "Current token holders" },
  { id: "alumni", label: "Alumni", hint: "Past holders & legacy" },
]

export function SubToolbar({
  segment,
  onSegmentChange,
  sort,
  onSortChange,
}: {
  segment: FeedSegment
  onSegmentChange: (s: FeedSegment) => void
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
    <div className="sticky top-[93px] z-20 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl flex-col gap-2.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Three-way segmented feed control */}
        <div
          role="tablist"
          aria-label="Feed segment"
          className="inline-flex w-full rounded-full border border-border bg-muted/40 p-1 sm:w-auto"
        >
          {SEGMENTS.map((s) => {
            const active = segment === s.id
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                title={s.hint}
                onClick={() => onSegmentChange(s.id)}
                className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none sm:px-3.5 sm:text-sm ${
                  active
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Sort dropdown */}
        <div ref={ref} className="relative self-end sm:self-auto">
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
