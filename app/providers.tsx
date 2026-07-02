'use client';

import * as React from 'react';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { baseSepolia } from 'wagmi/chains';

// Using getDefaultConfig ensures all internal connectors are 
// properly initialized with your Project ID
const config = getDefaultConfig({
  appName: 'Genesis AM',
  projectId: 'c59e3775aa8518b92f5ed7b2ff6cb187',
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://base-sepolia.g.alchemy.com/v2/zvrtUXOQHxIlfXaGrLjeo'),
  },
  ssr: true, // Required for Next.js to prevent hydration issues
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}