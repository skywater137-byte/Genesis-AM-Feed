import { erc20Abi } from 'viem';

// IMPORTANT: Replace this with the address from your Hardhat deployment log
export const GENAM_CONTRACT_ADDRESS = '0x85d809585bfe271c73a9aaefecf0be1204fdb2fd'; 

export const contractConfig = {
  address: GENAM_CONTRACT_ADDRESS as `0x${string}`,
  abi: erc20Abi,
} as const;