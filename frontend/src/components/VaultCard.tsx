import { useState } from 'react';
import { motion } from 'framer-motion';
import { useVaultSnapshot } from '../hooks/yoExtras';
import { useUserPosition } from '@yo-protocol/react';
import type { VaultId } from '@yo-protocol/core';
import { useAccount } from 'wagmi';
import { formatUSD, formatBigInt } from '../utils/format';
import DepositModal from './DepositModal';
import RedeemModal from './RedeemModal';

const VAULT_META: Record<string, { icon: string; color: string; description: string; risk: string }> = {
  yoUSD: { icon: '💵', color: 'bg-emerald-50 border-emerald-200', description: 'Stable USDC yield via Morpho & Pendle', risk: 'Low' },
  yoETH: { icon: '⟠', color: 'bg-blue-50 border-blue-200', description: 'ETH-denominated yield via Lido & Morpho', risk: 'Medium' },
  yoBTC: { icon: '₿', color: 'bg-orange-50 border-orange-200', description: 'BTC-denominated yield via top protocols', risk: 'Medium' },
};

interface VaultCardProps {
  vaultId: string;
  index?: number;
}

export default function VaultCard({ vaultId, index = 0 }: VaultCardProps) {
  const [depositOpen, setDepositOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const { address } = useAccount();
  const { snapshot, isLoading } = useVaultSnapshot(vaultId as VaultId);
  const { position } = useUserPosition(vaultId as VaultId, address);

  const meta = VAULT_META[vaultId] ?? { icon: '🏦', color: 'bg-gray-50 border-gray-200', description: 'YO Vault', risk: 'Medium' };
  const apy7d = parseFloat(snapshot?.stats?.yield?.['7d'] ?? '0');
  const tvl = parseFloat(snapshot?.stats?.tvl?.formatted ?? '0');
  const hasPosition = position?.shares != null && position.shares > 0n;

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-12 w-12 bg-app-border rounded-2xl mb-4" />
        <div className="h-6 bg-app-border rounded w-1/3 mb-2" />
        <div className="h-10 bg-app-border rounded w-1/2 mb-4" />
        <div className="h-4 bg-app-border rounded w-full mb-2" />
        <div className="h-10 bg-app-border rounded w-full mt-4" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className="card group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${meta.color} border flex items-center justify-center text-2xl`}>
              {meta.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg text-text-main">{vaultId}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.risk === 'Low' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {meta.risk} Risk
              </span>
            </div>
          </div>
        {hasPosition && (
            <span className="text-xs font-medium px-2 py-1 bg-accent-green/10 text-accent-green rounded-lg border border-accent-green/20">
              ✓ Active
            </span>
          )}
        </div>

        <div className="mb-4">
          <p className="text-xs text-text-muted mb-1">7d APY</p>
          <p className="font-serif font-bold text-4xl text-accent-green">{apy7d.toFixed(2)}%</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-app-hover rounded-xl">
            <p className="text-xs text-text-muted mb-1">TVL</p>
            <p className="font-semibold text-text-main">{formatUSD(tvl)}</p>
          </div>
          <div className="p-3 bg-app-hover rounded-xl">
            <p className="text-xs text-text-muted mb-1">Your Position</p>
            <p className="font-semibold text-accent-green">
              {hasPosition ? formatUSD(Number(formatBigInt(position!.assets, 6, 2))) : '—'}
            </p>
          </div>
        </div>

        <p className="text-sm text-text-muted mb-5">{meta.description}</p>

        <div className="flex gap-2">
          <button onClick={() => setDepositOpen(true)} className="btn-primary flex-1 text-sm py-2.5">
            Deposit
          </button>
          <button
            onClick={() => setRedeemOpen(true)}
            disabled={!hasPosition}
            className="btn-secondary flex-1 text-sm py-2.5 disabled:opacity-40"
          >
            Redeem
          </button>
        </div>
      </motion.div>

      <DepositModal vault={vaultId} vaultName={vaultId} isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
      <RedeemModal vault={vaultId} vaultName={vaultId} isOpen={redeemOpen} onClose={() => setRedeemOpen(false)} />
    </>
  );
}
