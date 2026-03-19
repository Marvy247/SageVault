import { http, createConfig } from 'wagmi';
import { base, mainnet, arbitrum } from 'wagmi/chains';
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [base, mainnet, arbitrum],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'Sage Vault' }),
  ],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
  },
});
