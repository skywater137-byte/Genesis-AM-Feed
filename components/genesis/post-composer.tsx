"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLink, Lock, Sparkles } from "lucide-react"

const MAX_CHARS = 280

export function PostComposer({
  hasToken,
  isConnected,
  onBroadcast,
}: {
  hasToken: boolean
  isConnected: boolean
  onBroadcast: (text: string) => void
}) {
  const [text, setText] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  function handleBroadcast() {
    const trimmed = text.trim()
    if (!trimmed) return
    onBroadcast(trimmed)
    setText("")
  }

  // When the wallet disconnects (gate re-locks), clear any draft text so the
  // overlay slides back over an empty composer.
  useEffect(() => {
    if (!hasToken) setText("")
  }, [hasToken])

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [menuOpen])

  const remaining = MAX_CHARS - text.length
  const near = remaining <= 40

  return (
    <div className="relative border-b border-border px-4 py-4">
      {/* Composer (blurred when locked) */}
      <div
        className={
          hasToken
            ? ""
            : "pointer-events-none select-none blur-[6px] saturate-50 brightness-75"
        }
        aria-hidden={!hasToken}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          rows={3}
          placeholder="Broadcast to the Genesis network..."
          disabled={!hasToken}
          className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <span
            className={`text-xs tabular-nums ${
              near ? "text-amber-400" : "text-muted-foreground"
            }`}
          >
            {remaining}
          </span>
          <button
            type="button"
            disabled={!hasToken || text.trim().length === 0}
            onClick={handleBroadcast}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_-4px] shadow-primary/60 transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            <Sparkles className="size-4" />
            Broadcast
          </button>
        </div>
      </div>

      {/* The Gate overlay */}
      {!hasToken && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="flex w-full max-w-lg flex-col items-center rounded-2xl border border-border bg-card/90 px-6 py-6 text-center shadow-2xl backdrop-blur-md">
            <span className="flex size-12 items-center justify-center rounded-full bg-amber-400/10 ring-1 ring-amber-400/30">
              <Lock className="size-6 text-amber-300" />
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground">
              Genesis AM
            </p>

            <div ref={menuRef} className="relative mt-4 w-full">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-3 py-2.5 text-xs font-bold leading-snug text-background whitespace-normal transition-transform hover:scale-[1.02] sm:px-4 sm:text-sm"
              >
                <Sparkles className="size-4 shrink-0" />
                Purchase Genesis AM Token (Base or Solana)
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute left-1/2 z-20 mt-2 w-full -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-2xl"
                >
                  <a
                    role="menuitem"
                    href="https://app.uniswap.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-popover-foreground transition-colors hover:bg-[#3b82f6]/10"
                  >
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_1px_rgba(59,130,246,0.7)]" />
                      Buy on Base (Uniswap)
                    </span>
                    <ExternalLink className="size-3.5 text-muted-foreground" />
                  </a>
                  <a
                    role="menuitem"
                    href="https://raydium.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-popover-foreground transition-colors hover:bg-[#9945ff]/10"
                  >
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-[linear-gradient(135deg,#9945ff_0%,#14f195_100%)] shadow-[0_0_8px_1px_rgba(153,69,255,0.6)]" />
                      Buy on Solana (Raydium)
                    </span>
                    <ExternalLink className="size-3.5 text-muted-foreground" />
                  </a>
                </div>
              )}
            </div>

            <p className="mt-3 max-w-sm text-xs text-muted-foreground text-pretty">
              {isConnected
                ? "Purchase Genesis AM tokens to enter."
                : "Connect to wallet holding Genesis AM tokens or purchase Genesis AM tokens to enter."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
