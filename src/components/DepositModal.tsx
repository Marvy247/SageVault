import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeposit, usePreviewDeposit } from '@yo-protocol/react';
import type { VaultId } from '@yo-protocol/core';
import { useAccount } from 'wagmi';
import { base } from 'wagmi/chains';
import toast from 'react-hot-toast';
import { parseToBigInt, formatBigInt } from '../utils/format';

const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;

interface DepositModalProps {
  vault: string;
  vaultName: string;
  isOpen: boolean;
  onClose: () => void;
}

const STEP_LABELS: Record<string, string> = {
  idle: 'Deposit',
  'switching-chain': 'Switching to Base...',
  approving: 'Approving USDC...',
  depositing: 'Depositing...',
  waiting: 'Confirming...',
  success: 'Success!',
  error: 'Failed',
};

export default function DepositModal({ vault, vaultName, isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const { address } = useAccount();
  const amountBig = parseToBigInt(amount, 6);
  const vaultId = vault as VaultId;

  const { shares } = usePreviewDeposit(vaultId, amountBig, { enabled: amountBig > 0n });

  const { deposit, step, isLoading, isSuccess, hash, reset } = useDeposit({
    vault: vaultId,
    slippageBps: 50,
    onConfirmed: (h) => {
      toast.success(`Deposited! Tx: ${h.slice(0, 10)}...`);
      setTimeout(() => { reset(); onClose(); setAmount(''); }, 1500);
    },
    onError: (err) => toast.error(err.message?.slice(0, 60) || 'Deposit failed'),
  });

  const handleDeposit = async () => {
    if (!address || !amountBig) return;
    await deposit({ token: USDC_BASE, amount: amountBig, chainId: base.id });
  };

  const stepLabel = STEP_LABELS[step] ?? step;
  const isProcessing = isLoading || step === 'waiting';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-floating border border-app-border"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif font-bold text-2xl text-text-main">Deposit</h3>
                <p className="text-sm text-text-muted mt-0.5">{vaultName}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-app-hover flex items-center justify-center text-text-muted hover:text-text-main transition-colors">✕</button>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-text-dim mb-2 block">Amount (USDC)</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field pr-16 text-lg font-semibold"
                  disabled={isProcessing}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-text-muted">USDC</span>
              </div>
              <div className="flex gap-2 mt-2">
                {['10', '100', '500', '1000'].map(v => (
                  <button key={v} onClick={() => setAmount(v)} className="flex-1 py-1.5 text-xs font-medium bg-app-hover rounded-lg text-text-dim hover:text-accent-green hover:bg-accent-green/10 transition-all">
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {shares != null && amountBig > 0n && (
              <div className="mb-4 p-3 bg-app-hover rounded-xl border border-app-border">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">You receive (shares)</span>
                  <span className="font-semibold text-accent-green">{formatBigInt(shares, 6)} shares</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-text-muted">Network</span>
                  <span className="font-medium text-text-dim">Base</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-text-muted">Slippage</span>
                  <span className="font-medium text-text-dim">0.5%</span>
                </div>
              </div>
            )}

            {step !== 'idle' && (
              <div className="mb-4 p-3 bg-accent-green/5 rounded-xl border border-accent-green/20">
                <div className="flex items-center gap-2">
                  {isProcessing && <span className="w-4 h-4 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />}
                  {isSuccess && <span className="text-accent-green">✓</span>}
                  <span className="text-sm font-medium text-accent-green">{stepLabel}</span>
                </div>
                {hash && (
                  <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-teal underline mt-1 block">
                    View on Basescan ↗
                  </a>
                )}
              </div>
            )}

            <button
              onClick={handleDeposit}
              disabled={!amount || !address || isProcessing || parseFloat(amount) <= 0}
              className="btn-primary w-full justify-center"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {stepLabel}
                </span>
              ) : isSuccess ? '✓ Deposited!' : `Deposit ${amount ? `$${amount}` : ''}`}
            </button>

            {!address && (
              <p className="text-center text-xs text-text-muted mt-3">Connect your wallet to deposit</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
