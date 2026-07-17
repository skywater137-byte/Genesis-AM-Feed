"use client"

import { ExternalLink, Wallet } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

/** Uniswap Base swap deep-link (token address can be swapped later). */
export const BASE_BUY_URL =
  "https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=0x85d809585BFE271c73a9AAEfeCF0be1204FDB2fd"

export const CONNECT_LABEL = "Connect to Wallet"
export const BUY_LABEL = "Purchase Genesis AM on Base"

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.02] disabled:opacity-50"

const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"

/**
 * Header / primary connect control — opens RainbowKit.
 * When already connected, falls through to account UI via RainbowKit ConnectButton.
 */
export function ConnectWalletButton({
  className,
  fullWidth = false,
}: {
  className?: string
  fullWidth?: boolean
}) {
  const width = fullWidth ? "w-full" : ""

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, mounted, account, chain, openAccountModal }) => {
        const ready = mounted
        const connected = ready && account && chain

        if (connected) {
          return (
            <button
              type="button"
              onClick={openAccountModal}
              className={`${className ?? primaryBtn} ${width}`}
            >
              <Wallet className="size-4 shrink-0" />
              {account.displayName}
            </button>
          )
        }

        return (
          <button
            type="button"
            disabled={!ready}
            onClick={openConnectModal}
            className={`${className ?? primaryBtn} ${width}`}
          >
            <Wallet className="size-4 shrink-0" />
            {CONNECT_LABEL}
          </button>
        )
      }}
    </ConnectButton.Custom>
  )
}

/** Secondary purchase CTA — Uniswap on Base. */
export function BuyOnBaseButton({
  className,
  fullWidth = false,
}: {
  className?: string
  fullWidth?: boolean
}) {
  return (
    <a
      href={BASE_BUY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className ?? secondaryBtn} ${fullWidth ? "w-full" : ""}`}
    >
      {BUY_LABEL}
      <ExternalLink className="size-3.5 shrink-0 opacity-70" />
    </a>
  )
}

/**
 * Split auth panel for modals / composer gate:
 * 1) Connect to Wallet (holders)
 * 2) Not a holder? → purchase on Base
 */
export function WalletAuthActions({
  showConnect = true,
}: {
  /** Hide connect when the wallet is already connected but lacking tokens. */
  showConnect?: boolean
}) {
  const { isConnected } = useAccount()
  const connectVisible = showConnect && !isConnected

  return (
    <div className="flex w-full flex-col gap-4">
      {connectVisible && (
        <div className="flex flex-col gap-2">
          <ConnectWalletButton fullWidth />
          <p className="text-center text-[11px] text-muted-foreground">
            Already hold Genesis AM? Connect the wallet that holds your key.
          </p>
        </div>
      )}

      <div
        className={`flex flex-col gap-2 ${
          connectVisible ? "border-t border-border/60 pt-4" : ""
        }`}
      >
        <p className="text-center text-xs text-muted-foreground text-pretty leading-relaxed">
          {isConnected
            ? "Not enough Genesis AM in this wallet? Purchase on Base to broadcast to the feed."
            : "Not a holder? Purchase Genesis AM on Base to broadcast to the feed."}
        </p>
        <BuyOnBaseButton fullWidth />
      </div>
    </div>
  )
}
