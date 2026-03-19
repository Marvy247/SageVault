import { useState } from 'react';
import { motion } from 'framer-motion';
import { useVaultStats } from '../hooks/yoExtras';
import type { VaultStatsItem } from '@yo-protocol/core';
import DepositModal from './DepositModal';

interface Allocation { vault: string; pct: number }

interface SageRecommendationProps {
  risk: string;
  alloc: Allocation[];
  monthly: string;
}

const VAULT_ICONS: Record<string, string> = { yoUSD: '💵', yoETH: '⟠', yoBTC: '₿' };

export default function SageRecommendation({ risk, alloc, monthly }: SageRecommendationProps) {
  const [depositVault, setDepositVault] = useState<string | null>(null);
  const { stats } = useVaultStats();
  const vaultStats = stats as VaultStatsItem[];
  const monthlyNum = parseFloat(monthly);

  const getApy = (vaultId: string) => {
    const s = vaultStats?.find(v => v.id === vaultId);
    return s ? parseFloat(s.yield?.['7d'] ?? '0').toFixed(2) : '—';
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="card border-accent-green/40 bg-gradient-to-br from-accent-green/5 to-white"
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green to-accent-teal flex items-center justify-center text-white font-bold flex-shrink-0">S</div>
          <div>
            <p className="font-bold text-text-main">Sage recommends for you</p>
            <p className="text-xs text-text-muted capitalize">{risk} profile · ${monthly}/month</p>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          {alloc.map(({ vault, pct }) => {
            const amount = ((monthlyNum * pct) / 100).toFixed(0);
            return (
              <div key={vault} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{VAULT_ICONS[vault] ?? '🏦'}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-text-main">{vault}</span>
                    <span className="text-accent-green font-semibold">{getApy(vault)}% APY</span>
                  </div>
                  <div className="h-2 bg-app-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent-green rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>{pct}% of savings</span>
                    <span>~${amount}/mo</span>
                  </div>
                </div>
                <button
                  onClick={() => setDepositVault(vault)}
                  className="flex-shrink-0 px-3 py-1.5 bg-accent-green text-white text-xs font-semibold rounded-lg hover:bg-accent-green-hover transition-colors"
                >
                  Deposit →
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-text-muted bg-app-hover rounded-xl p-3 border border-app-border">
          💡 YO's risk engine automatically rebalances across Lido, Morpho, and Pendle to protect your principal while maximizing yield.
        </p>
      </motion.div>

      {depositVault && (
        <DepositModal vault={depositVault} vaultName={depositVault} isOpen={true} onClose={() => setDepositVault(null)} />
      )}
    </>
  );
}
