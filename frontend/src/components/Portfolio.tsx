import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useUserHistory, useUserPerformance } from '@yo-protocol/react';
import { useVaultSnapshots } from '../hooks/yoExtras';
import type { VaultId, UserHistoryItem, UserPerformance, VaultSnapshot } from '@yo-protocol/core';
import { formatUSD } from '../utils/format';
import YieldProjector from '../components/YieldProjector';
import { useWallet } from '../hooks/useWallet';

const VAULTS: VaultId[] = ['yoUSD', 'yoETH', 'yoBTC'];

function TxRow({ tx }: { tx: UserHistoryItem }) {
  const isDeposit = tx.type?.toLowerCase().includes('deposit');
  return (
    <div className="flex items-center justify-between py-3 border-b border-app-border last:border-0">
      <div className="flex items-center gap-3">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${isDeposit ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
          {isDeposit ? '↓' : '↑'}
        </span>
        <div>
          <p className="text-sm font-medium text-text-main capitalize">{tx.type}</p>
          <p className="text-xs text-text-muted">
            {tx.blockTimestamp ? new Date(tx.blockTimestamp * 1000).toLocaleDateString() : tx.createdAt}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-text-main">{tx.assets?.formatted ?? '—'}</p>
        {tx.transactionHash && (
          <a href={`https://basescan.org/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-teal hover:underline">
            View ↗
          </a>
        )}
      </div>
    </div>
  );
}

function VaultPerf({ vaultId }: { vaultId: VaultId }) {
  const { address } = useAccount();
  const { performance } = useUserPerformance(vaultId, address);
  const perf = performance as UserPerformance | undefined;
  if (!perf) return null;
  const pnl = parseFloat(perf.unrealized?.formatted ?? '0') + parseFloat(perf.realized?.formatted ?? '0');
  return (
    <div className="p-3 bg-app-hover rounded-xl border border-app-border">
      <p className="text-xs font-medium text-text-muted mb-1">{vaultId}</p>
      <p className={`font-bold text-lg ${pnl >= 0 ? 'text-accent-green' : 'text-red-500'}`}>
        {pnl >= 0 ? '+' : ''}{formatUSD(pnl)}
      </p>
      <p className="text-xs text-text-muted">Total P&L</p>
    </div>
  );
}

export default function Portfolio() {
  const { address, isConnected } = useAccount();
  const { connectWallet } = useWallet();
  const { history } = useUserHistory('yoUSD', address, { limit: 20 });
  const { snapshots } = useVaultSnapshots();
  const vaultSnapshots = snapshots as VaultSnapshot[] | undefined;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif font-bold text-4xl text-text-main mb-1">
          Portfolio & <span className="italic text-accent-green">Analytics</span>
        </h1>
        <p className="text-text-muted">Track performance, simulate yield, and review your transaction history</p>
      </motion.div>

      <YieldProjector />

      {vaultSnapshots && vaultSnapshots.length > 0 && (
        <div className="card">
          <h3 className="font-serif font-bold text-2xl text-text-main mb-4">Live Vault Snapshots</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-border">
                  {['Vault', '7d APY', 'TVL', 'Share Price', 'Network'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vaultSnapshots.map((s, i) => (
                  <tr key={i} className="border-b border-app-border last:border-0 hover:bg-app-hover transition-colors">
                    <td className="py-3 px-3 font-bold text-text-main">{s.name}</td>
                    <td className="py-3 px-3 font-semibold text-accent-green">{parseFloat(s.stats?.yield?.['7d'] ?? '0').toFixed(2)}%</td>
                    <td className="py-3 px-3 text-text-dim">{s.stats?.tvl?.formatted ?? '—'}</td>
                    <td className="py-3 px-3 text-text-dim">{s.stats?.sharePrice?.formatted ?? '—'}</td>
                    <td className="py-3 px-3 text-text-muted text-xs">{s.chain?.name ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isConnected ? (
        <>
          <div className="card">
            <h3 className="font-serif font-bold text-2xl text-text-main mb-4">Your P&L by Vault</h3>
            <div className="grid grid-cols-3 gap-3">
              {VAULTS.map(v => <VaultPerf key={v} vaultId={v} />)}
            </div>
          </div>

          <div className="card">
            <h3 className="font-serif font-bold text-2xl text-text-main mb-4">Transaction History</h3>
            {history && history.length > 0 ? (
              <div>{history.map((tx, i) => <TxRow key={i} tx={tx} />)}</div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-muted text-sm">No transactions yet. Make your first deposit to get started.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card text-center py-10">
          <p className="text-text-muted mb-4">Connect your wallet to see your P&L and transaction history</p>
          <button onClick={connectWallet} className="btn-primary">Connect Wallet</button>
        </div>
      )}
    </div>
  );
}
