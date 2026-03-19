import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { YieldProvider } from '@yo-protocol/react';
import { wagmiConfig } from './wagmi.config';
import './index.css';
import App from './App.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <YieldProvider partnerId={9999} defaultSlippageBps={50}>
          <App />
        </YieldProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
