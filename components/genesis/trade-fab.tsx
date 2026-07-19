"use client"

import { useState } from "react"
import {
  ArrowLeftRight,
  Copy,
  Check,
  ExternalLink,
  Wallet,
  X,
} from "lucide-react"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import {
  ACTIVE_TOKEN,
  getUniswapSwapUrl,
  shortenAddress,
} from "@/lib/tokens"
import { ConnectWalletButton } from "./connect-buy-button"

export function TradeFab() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Trade Genesis AM"
        className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_30px_-6px] shadow-primary/50 transition-transform hover:scale-105 active:scale-95"
      >
        <ArrowLeftRight className="size-6" />
      </button>

      {open && <TradeModal onClose={() => setOpen(false)} />}
    </>
  )
}

function TradeModal({ onClose }: { onClose: () => void }) {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [copied, setCopied] = useState(false)

  const swapUrl = getUniswapSwapUrl(ACTIVE_TOKEN)

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(ACTIVE_TOKEN.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // ignore
    }
  }

  function handleSwap() {
    if (!isConnected) {
      openConnectModal?.()
      return
    }
    window.open(swapUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-modal-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <h2
          id="trade-modal-title"
          className="pr-8 text-lg font-bold text-foreground"
        >
          Trade {ACTIVE_TOKEN.symbol}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Swap ETH → {ACTIVE_TOKEN.name} on Base. Target token is pre-filled.
        </p>

        <div className="mt-5 space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Network</span>
            <span className="font-medium text-foreground">Base</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>You pay</span>
            <span className="font-medium text-foreground">ETH</span>
          </div>
          <div className="flex items-start justify-between gap-3 text-xs text-muted-foreground">
            <span className="shrink-0 pt-0.5">You receive</span>
            <div className="min-w-0 text-right">
              <p className="font-semibold text-foreground">
                {ACTIVE_TOKEN.symbol}
              </p>
              <p className="mt-0.5 break-all font-mono text-[11px] text-muted-foreground">
                {ACTIVE_TOKEN.address}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={copyAddress}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copy {shortenAddress(ACTIVE_TOKEN.address)}
              </>
            )}
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {!isConnected ? (
            <>
              <p className="text-center text-xs text-muted-foreground">
                Connect your wallet before starting a swap.
              </p>
              <ConnectWalletButton fullWidth />
            </>
          ) : (
            <button
              type="button"
              onClick={handleSwap}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-[0_0_20px_-4px] shadow-primary/50 transition-colors hover:bg-primary/90"
            >
              <Wallet className="size-4" />
              Swap on Uniswap
              <ExternalLink className="size-3.5 opacity-80" />
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Opens Uniswap with output token set to{" "}
          <span className="font-mono">{shortenAddress(ACTIVE_TOKEN.address)}</span>
        </p>
      </div>
    </div>
  )
}
