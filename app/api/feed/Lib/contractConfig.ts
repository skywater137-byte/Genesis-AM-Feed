import { erc20Abi } from "viem"
import { ACTIVE_TOKEN } from "@/lib/tokens"

/** @deprecated Prefer ACTIVE_TOKEN from @/lib/tokens — kept for existing imports. */
export const GENAM_CONTRACT_ADDRESS = ACTIVE_TOKEN.address

export const contractConfig = {
  address: ACTIVE_TOKEN.address,
  abi: erc20Abi,
} as const
