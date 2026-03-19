import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSage } from '../context/SageContext';
import { useVaultSnapshots } from '../hooks/yoExtras';
import type { VaultSnapshot } from '@yo-protocol/core';
import { timeAgo } from '../utils/format';

const QUICK_PROMPTS = [
  "I'm risk-averse, what's the best strategy?",
  "Show me a 12-month yield projection",
  "How safe are YO vaults?",
  "I earn $2000/month, help me save",
  "Explain yoUSD vs yoETH",
  "How do I withdraw my funds?",
];

export default function SageChat() {
  const { messages, isThinking, sendMessage, clearChat } = useSage();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { snapshots } = useVaultSnapshots();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim()) return;
    const vaultData = (snapshots as VaultSnapshot[] | undefined)?.map(s => ({
      id: s.id,
      name: s.name,
      apy: parseFloat(s.stats?.yield?.['7d'] ?? '0'),
      tvl: parseFloat(s.stats?.tvl?.formatted ?? '0'),
      risk: 'medium' as const,
    })) ?? [];
    sendMessage(input.trim(), vaultData);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green to-accent-teal flex items-center justify-center text-white font-bold">
            S
          </div>
          <div>
            <h3 className="font-bold text-text-main">Sage AI Co-Pilot</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
              <span className="text-xs text-text-muted">Powered by YO Protocol data</span>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="text-xs text-text-muted hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'sage' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-green to-accent-teal flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0">
                  S
                </div>
              )}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-accent-green text-white rounded-tr-sm'
                    : 'bg-white border border-app-border text-text-main rounded-tl-sm shadow-premium'
                }`}>
                  {msg.content}
                </div>
                <p className={`text-xs text-text-muted mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {timeAgo(msg.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isThinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-green to-accent-teal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              S
            </div>
            <div className="bg-white border border-app-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-premium">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full bg-accent-green animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => sendMessage(p)}
              className="flex-shrink-0 text-xs px-3 py-1.5 bg-accent-green/10 text-accent-green rounded-full border border-accent-green/20 hover:bg-accent-green/20 transition-all whitespace-nowrap"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-app-border">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Sage anything about your savings..."
            rows={1}
            className="input-field flex-1 resize-none text-sm py-3"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="btn-primary px-4 py-3 flex-shrink-0 disabled:opacity-40"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
