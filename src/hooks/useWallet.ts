import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const connectWallet = () => {
    const injected = connectors.find(c => c.id === 'injected') || connectors[0];
    if (injected) connect({ connector: injected });
  };

  const ensureBase = () => {
    if (chain?.id !== base.id) switchChain({ chainId: base.id });
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return { address, isConnected, chain, connectWallet, disconnect, isPending, shortAddress, ensureBase };
}
