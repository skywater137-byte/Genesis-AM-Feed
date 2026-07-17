"use client"

import { ExternalLink, Sparkles } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

/** Uniswap Base swap deep-link (token address can be swapped later). */
export const BASE_BUY_URL =
  "https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=0x85d809585BFE271c73a9AAEfeCF0be1204FDB2fd"

const CTA_LABEL = "Connect & Buy on Base"

/**
 * Primary CTA: RainbowKit connect when disconnected; Uniswap Base buy when connected.
 * Always surfaces Base-native phrasing.
 */
export function ConnectBuyButton({
  className,
  fullWidth = false,
}: {
  className?: string
  fullWidth?: boolean
}) {
  const { isConnected } = useAccount()

  const baseClass =
    className ??
    "inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.02]"

  if (isConnected) {
    return (
      <a
        href={BASE_BUY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} ${fullWidth ? "w-full" : ""}`}
      >
        <Sparkles className="size-4 shrink-0" />
        {CTA_LABEL}
        <ExternalLink className="size-3.5 shrink-0 opacity-70" />
      </a>
    )
  }

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, mounted }) => {
        const ready = mounted
        return (
          <button
            type="button"
            disabled={!ready}
            onClick={openConnectModal}
            className={`${baseClass} ${fullWidth ? "w-full" : ""} disabled:opacity-50`}
          >
            <Sparkles className="size-4 shrink-0" />
            {CTA_LABEL}
          </button>
        )
      }}
    </ConnectButton.Custom>
  )
}

export { CTA_LABEL }
