import { motion } from 'framer-motion';
import { useVaults } from '@yo-protocol/react';
import type { VaultStatsItem } from '@yo-protocol/core';
import VaultCard from '../components/VaultCard';

const FALLBACK_VAULTS = ['yoUSD', 'yoETH', 'yoBTC'];

export default function Vaults() {
  const { vaults, isLoading } = useVaults();
  const vaultList = vaults as VaultStatsItem[] | undefined;
  const displayVaults = vaultList && vaultList.length > 0
    ? vaultList.map(v => v.id)
    : FALLBACK_VAULTS;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif font-bold text-4xl text-text-main mb-1">
          YO <span className="italic text-accent-green">Vaults</span>
        </h1>
        <p className="text-text-muted">Risk-adjusted yield vaults powered by YO Protocol. Deposit and earn.</p>
      </motion.div>

      <div className="p-4 bg-accent-green/5 border border-accent-green/20 rounded-2xl flex items-start gap-3">
        <span className="text-xl flex-shrink-0">🔒</span>
        <div>
          <p className="text-sm font-medium text-text-main">Non-custodial & transparent</p>
          <p className="text-xs text-text-muted mt-0.5">
            YO vaults deploy your funds across audited protocols (Lido, Morpho, Pendle). The risk engine dynamically rebalances to protect principal while maximizing yield. All transactions are verifiable onchain.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-12 w-12 bg-app-border rounded-2xl mb-4" />
              <div className="h-6 bg-app-border rounded w-1/3 mb-2" />
              <div className="h-10 bg-app-border rounded w-1/2 mb-4" />
              <div className="h-4 bg-app-border rounded w-full mb-2" />
              <div className="h-10 bg-app-border rounded w-full mt-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {displayVaults.map((id, i) => (
            <VaultCard key={id} vaultId={id} index={i} />
          ))}
        </div>
      )}

      <div className="card">
        <h3 className="font-serif font-bold text-2xl text-text-main mb-4">Suggested Allocations</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { profile: '🛡️ Conservative', alloc: [{ vault: 'yoUSD', pct: 80 }, { vault: 'yoETH', pct: 20 }], desc: 'Stable yield, minimal volatility' },
            { profile: '⚖️ Balanced', alloc: [{ vault: 'yoUSD', pct: 50 }, { vault: 'yoETH', pct: 30 }, { vault: 'yoBTC', pct: 20 }], desc: 'Growth with downside protection' },
            { profile: '🚀 Aggressive', alloc: [{ vault: 'yoUSD', pct: 30 }, { vault: 'yoETH', pct: 40 }, { vault: 'yoBTC', pct: 30 }], desc: 'Maximum yield, higher volatility' },
          ].map(({ profile, alloc, desc }) => (
            <div key={profile} className="p-4 bg-app-hover rounded-xl border border-app-border">
              <p className="font-bold text-text-main mb-1">{profile}</p>
              <p className="text-xs text-text-muted mb-3">{desc}</p>
              {alloc.map(({ vault, pct }) => (
                <div key={vault} className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-app-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent-green rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium text-text-dim w-16">{vault} {pct}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
