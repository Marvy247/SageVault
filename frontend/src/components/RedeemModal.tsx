import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRedeem, useUserPosition, usePreviewRedeem } from '@yo-protocol/react';
import type { VaultId } from '@yo-protocol/core';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { formatBigInt, parseToBigInt } from '../utils/format';

interface RedeemModalProps {
  vault: string;
  vaultName: string;
  isOpen: boolean;
  onClose: () => void;
}

const STEP_LABELS: Record<string, string> = {
  idle: 'Redeem',
  approving: 'Approving...',
  redeeming: 'Redeeming...',
  waiting: 'Confirming...',
  success: 'Success!',
  error: 'Failed',
};

export default function RedeemModal({ vault, vaultName, isOpen, onClose }: RedeemModalProps) {
  const [amount, setAmount] = useState('');
  const { address } = useAccount();
  const vaultId = vault as VaultId;
  const { position } = useUserPosition(vaultId, address);
  const sharesBig = parseToBigInt(amount, 6);
  const { assets } = usePreviewRedeem(vaultId, sharesBig, { enabled: sharesBig > 0n });

  const { redeem, step, isLoading, isSuccess, hash, instant, assetsOrRequestId, reset } = useRedeem({
    vault: vaultId,
    onConfirmed: (h) => {
      toast.success(`Redeemed! Tx: ${h.slice(0, 10)}...`);
      setTimeout(() => { reset(); onClose(); setAmount(''); }, 1500);
    },
    onError: (err) => toast.error(err.message?.slice(0, 60) || 'Redeem failed'),
  });

  const handleRedeem = async () => {
    if (!sharesBig) return;
    await redeem(sharesBig);
  };

  const maxShares = position?.shares ? formatBigInt(position.shares, 6, 6) : '0';
  const isProcessing = isLoading || step === 'waiting';
  const stepLabel = STEP_LABELS[step] ?? step;

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
                <h3 className="font-serif font-bold text-2xl text-text-main">Redeem</h3>
                <p className="text-sm text-text-muted mt-0.5">{vaultName}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-app-hover flex items-center justify-center text-text-muted hover:text-text-main transition-colors">✕</button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-text-dim">Shares to redeem</label>
                <button onClick={() => setAmount(maxShares)} className="text-xs text-accent-green font-medium hover:underline">
                  Max: {maxShares}
                </button>
              </div>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.000000"
                className="input-field text-lg font-semibold"
                disabled={isProcessing}
              />
            </div>

            {assets != null && sharesBig > 0n && (
              <div className="mb-4 p-3 bg-app-hover rounded-xl border border-app-border">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">You receive</span>
                  <span className="font-semibold text-accent-green">{formatBigInt(assets, 6)} USDC</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-text-muted">Redemption type</span>
                  <span className="font-medium text-text-dim">Instant or queued</span>
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
                {isSuccess && (
                  <p className="text-xs text-text-muted mt-1">
                    {instant ? '⚡ Instant redemption' : `⏳ Queued — Request ID: ${assetsOrRequestId?.toString()}`}
                  </p>
                )}
                {hash && (
                  <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-teal underline mt-1 block">
                    View on Basescan ↗
                  </a>
                )}
              </div>
            )}

            <button
              onClick={handleRedeem}
              disabled={!amount || !address || isProcessing || parseFloat(amount) <= 0}
              className="btn-primary w-full justify-center"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {stepLabel}
                </span>
              ) : isSuccess ? '✓ Redeemed!' : 'Redeem Shares'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
