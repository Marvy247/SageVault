import { useVaultAllocations } from '@yo-protocol/react';
import type { VaultId, DailyAllocationSnapshot } from '@yo-protocol/core';
import { motion } from 'framer-motion';

const PROTOCOL_COLORS: Record<string, string> = {
  morpho: 'bg-blue-500',
  lido: 'bg-sky-400',
  pendle: 'bg-purple-500',
  aave: 'bg-violet-500',
  compound: 'bg-green-500',
  idle: 'bg-gray-300',
};

function getColor(protocol: string) {
  const key = protocol.toLowerCase();
  for (const [name, color] of Object.entries(PROTOCOL_COLORS)) {
    if (key.includes(name)) return color;
  }
  return 'bg-accent-emerald';
}

interface Props { vaultId: string }

export default function AllocationPanel({ vaultId }: Props) {
  const { allocations, isLoading } = useVaultAllocations(vaultId as VaultId);
  const latest = (allocations as DailyAllocationSnapshot[] | undefined)?.[0];

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-5 bg-app-border rounded w-1/3 mb-4" />
        {[1, 2, 3].map(i => <div key={i} className="h-8 bg-app-border rounded mb-2" />)}
      </div>
    );
  }

  if (!latest?.protocols || Object.keys(latest.protocols).length === 0) {
    return (
      <div className="card">
        <h4 className="font-bold text-text-main mb-2">Protocol Allocations</h4>
        <p className="text-sm text-text-muted">Deployed across Lido, Morpho, and Pendle — allocation data loading.</p>
      </div>
    );
  }

  const protocols = Object.entries(latest.protocols);
  const total = protocols.reduce((acc, [, v]) => acc + parseFloat(v), 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-text-main">Where Your Money Works</h4>
        <span className="text-xs text-text-muted">{vaultId} · Live</span>
      </div>

      <div className="space-y-3">
        {protocols.map(([protocol, value], i) => {
          const pct = total > 0 ? (parseFloat(value) / total) * 100 : 0;
          return (
            <div key={protocol}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-text-main capitalize">{protocol}</span>
                <span className="text-text-muted">{pct.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-app-border rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getColor(protocol)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-text-muted mt-4 pt-3 border-t border-app-border">
        🔒 All protocols are audited. YO rebalances automatically to optimize risk-adjusted yield.
      </p>
    </div>
  );
}
