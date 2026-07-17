"use client"

import { useEffect, useState } from "react"
import { Lock, Sparkles } from "lucide-react"
import { WalletAuthActions } from "./connect-buy-button"

const MAX_CHARS = 280

export function PostComposer({
  hasToken,
  isConnected,
  onBroadcast,
  onRequireConnect,
}: {
  hasToken: boolean
  isConnected: boolean
  onBroadcast: (text: string) => void
  onRequireConnect: () => void
}) {
  const [text, setText] = useState("")

  function handleBroadcast() {
    if (!hasToken) {
      onRequireConnect()
      return
    }
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

      {/* Gate overlay — connect holders vs purchase path */}
      {!hasToken && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="flex w-full max-w-lg flex-col items-center rounded-2xl border border-border bg-card/90 px-6 py-6 text-center shadow-2xl backdrop-blur-md">
            <span className="flex size-12 items-center justify-center rounded-full bg-amber-400/10 ring-1 ring-amber-400/30">
              <Lock className="size-6 text-amber-300" />
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground">
              Genesis AM
            </p>
            <p className="mt-1 mb-4 max-w-sm text-xs text-muted-foreground text-pretty">
              Browse the public feed freely. Posting requires a Genesis AM key
              on Base.
            </p>

            <div className="w-full max-w-xs">
              <WalletAuthActions showConnect={!isConnected} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
