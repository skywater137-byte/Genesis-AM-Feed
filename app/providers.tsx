'use client';

import * as React from 'react';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { base } from 'wagmi/chains';
import { ACTIVE_TOKEN } from '@/lib/tokens';

// Production: Base mainnet — token address lives in lib/tokens.ts
const config = getDefaultConfig({
  appName: 'Genesis AM',
  projectId: 'c59e3775aa8518b92f5ed7b2ff6cb187',
  chains: [base],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={ACTIVE_TOKEN.chainId}
          appInfo={{ appName: 'Genesis AM' }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
