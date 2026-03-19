import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useUserPositions, useUserBalances } from '@yo-protocol/react';
import { useVaultStats } from '../hooks/yoExtras';
import type { VaultStatsItem, UserBalances } from '@yo-protocol/core';
import { formatUSD, formatAPY } from '../utils/format';
import { useWallet } from '../hooks/useWallet';
import { Link } from 'react-router-dom';
import SageRecommendation from './SageRecommendation';
import AllocationPanel from './AllocationPanel';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { connectWallet } = useWallet();
  const { positions, isLoading: posLoading } = useUserPositions(address);
  const { stats, isLoading: statsLoading } = useVaultStats();
  const { balances } = useUserBalances(address);

  const totalValue = parseFloat((balances as UserBalances | undefined)?.totalBalanceUsd ?? '0');
  const vaultStats = stats as VaultStatsItem[];
  const totalTvl = vaultStats?.reduce((acc, s) => acc + parseFloat(s.tvl?.formatted ?? '0'), 0) ?? 0;
  const avgApy = vaultStats?.length
    ? vaultStats.reduce((acc, s) => acc + parseFloat(s.yield?.['7d'] ?? '0'), 0) / vaultStats.length
    : 0;

  // Load Sage recommendation from onboarding
  const savedRec = (() => {
    try { return JSON.parse(localStorage.getItem('sage_recommendation') ?? 'null'); } catch { return null; }
  })();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="text-6xl mb-6">🌿</div>
        <h2 className="font-serif font-bold text-4xl text-text-main mb-4">Connect to View Dashboard</h2>
        <p className="text-text-muted max-w-md mb-8">Connect your wallet to see your positions, portfolio value, and start earning yield with YO vaults.</p>
        <button onClick={connectWallet} className="btn-primary text-base px-8 py-4">Connect Wallet</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif font-bold text-4xl text-text-main mb-1">
          Your <span className="italic text-accent-green">Savings Dashboard</span>
        </h1>
        <p className="text-text-muted">Real-time overview of your YO vault positions</p>
      </motion.div>

      {/* Portfolio summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Portfolio Value', value: formatUSD(totalValue), sub: 'Across all vaults', icon: '💰', highlight: true },
          { label: 'Protocol TVL', value: statsLoading ? '...' : formatUSD(totalTvl), sub: 'Total locked in YO', icon: '🏦', highlight: false },
          { label: 'Avg 7d APY', value: statsLoading ? '...' : formatAPY(avgApy), sub: 'Blended across vaults', icon: '📈', highlight: false },
        ].map(({ label, value, sub, icon, highlight }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card ${highlight ? 'border-accent-green/40 bg-accent-green/5' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{icon}</span>
              {highlight && <span className="text-xs font-medium px-2 py-1 bg-accent-green/10 text-accent-green rounded-lg">Live</span>}
            </div>
            <p className={`font-serif font-bold text-3xl mb-1 ${highlight ? 'text-accent-green' : 'text-text-main'}`}>{value}</p>
            <p className="text-xs text-text-muted">{label}</p>
            <p className="text-xs text-text-pale mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Sage recommendation — shown after onboarding */}
      {savedRec && (
        <SageRecommendation risk={savedRec.risk} alloc={savedRec.alloc} monthly={savedRec.monthly} />
      )}

      {/* Active positions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-2xl text-text-main">Active Positions</h2>
          <Link to="/vaults" className="text-sm text-accent-green font-medium hover:underline">View all vaults →</Link>
        </div>

        {posLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 bg-app-border rounded w-1/3 mb-3" />
                <div className="h-8 bg-app-border rounded w-1/2 mb-2" />
                <div className="h-4 bg-app-border rounded w-full" />
              </div>
            ))}
          </div>
        ) : positions && positions.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {positions.map((pos, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card border-accent-green/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-text-main">{String((pos.vault as { id?: string })?.id ?? 'Vault')}</span>
                  <span className="text-xs px-2 py-1 bg-accent-green/10 text-accent-green rounded-lg font-medium">Active</span>
                </div>
                <p className="font-serif font-bold text-2xl text-accent-green mb-1">
                  {formatUSD(Number(pos.position.assets) / 1e6)}
                </p>
                <p className="text-xs text-text-muted">{pos.position.shares.toString().slice(0, 10)}... shares</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="font-bold text-lg text-text-main mb-2">No active positions yet</h3>
            <p className="text-text-muted text-sm mb-6">Start earning yield by depositing into a YO vault</p>
            <Link to="/vaults" className="btn-primary inline-flex">Explore Vaults →</Link>
          </div>
        )}
      </div>

      {/* Allocation transparency */}
      <div className="grid md:grid-cols-2 gap-4">
        <AllocationPanel vaultId="yoUSD" />
        <AllocationPanel vaultId="yoETH" />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/sage" className="card flex items-center gap-4 hover:border-accent-green/40 cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-green to-accent-teal flex items-center justify-center text-white font-bold text-lg flex-shrink-0">S</div>
          <div>
            <h3 className="font-bold text-text-main group-hover:text-accent-green transition-colors">Chat with Sage AI</h3>
            <p className="text-sm text-text-muted">Get a personalized savings strategy</p>
          </div>
          <span className="ml-auto text-text-muted group-hover:text-accent-green transition-colors">→</span>
        </Link>
        <Link to="/portfolio" className="card flex items-center gap-4 hover:border-accent-green/40 cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-accent-green/10 border border-accent-green/30 flex items-center justify-center text-2xl flex-shrink-0">📊</div>
          <div>
            <h3 className="font-bold text-text-main group-hover:text-accent-green transition-colors">Yield Projector</h3>
            <p className="text-sm text-text-muted">Simulate your savings growth</p>
          </div>
          <span className="ml-auto text-text-muted group-hover:text-accent-green transition-colors">→</span>
        </Link>
      </div>
    </div>
  );
}
