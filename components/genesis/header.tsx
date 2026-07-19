"use client"

import { Search } from "lucide-react"
import { ReactNode } from "react"

export function Header({
  query,
  onQueryChange,
  children,
}: {
  query: string
  onQueryChange: (v: string) => void
  children?: ReactNode
}) {
  return (
    <header className="sticky top-9 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
        <h1 className="shrink-0 text-base font-bold tracking-tight text-foreground sm:text-lg">
          Genesis
          <span className="text-primary"> AM</span>
        </h1>

        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search Genesis feed..."
            aria-label="Search Genesis feed"
            className="h-9 w-full rounded-full border border-border bg-muted/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* This container now hosts the RainbowKit ConnectButton from page.tsx */}
        <div className="shrink-0">
          {children}
        </div>
      </div>
    </header>
  )
}