import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVaultStats } from '../hooks/yoExtras';
import type { VaultStatsItem } from '@yo-protocol/core';
import { formatUSD } from '../utils/format';

const features = [
  { icon: '🤖', title: 'AI Co-Pilot', desc: 'Sage analyzes your goals and builds a personalized savings strategy powered by live YO vault data.' },
  { icon: '📈', title: 'Risk-Adjusted Yield', desc: 'YO dynamically allocates across Lido, Morpho, and Pendle to maximize returns while protecting principal.' },
  { icon: '🔒', title: 'Non-Custodial', desc: 'Your funds stay onchain. Every transaction is verifiable. No banks, no middlemen, no lock-ups.' },
  { icon: '🌍', title: 'Built for Everyone', desc: 'Especially powerful for savers in high-inflation regions seeking USD-denominated, inflation-beating yields.' },
];

const steps = [
  { n: '01', title: 'Connect Wallet', desc: 'Use MetaMask, Coinbase Wallet, or any injected wallet. No sign-up required.' },
  { n: '02', title: 'Chat with Sage', desc: 'Tell Sage your income, goals, and risk tolerance. Get a personalized allocation plan.' },
  { n: '03', title: 'Deposit & Earn', desc: 'Deposit USDC into YO vaults on Base. Watch your savings grow in real time.' },
];

export default function Landing() {
  const { stats } = useVaultStats();
  const vaultStats = stats as VaultStatsItem[] | undefined;
  const totalTvl = vaultStats?.reduce((acc, s) => acc + parseFloat(s.tvl?.formatted ?? '0'), 0) ?? 0;
  const avgApy = vaultStats?.length
    ? vaultStats.reduce((acc, s) => acc + parseFloat(s.yield?.['7d'] ?? '0'), 0) / vaultStats.length
    : 0;

  return (
    <div className="min-h-screen">
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent-green/10 border border-accent-green/30 rounded-full text-sm font-medium text-accent-green mb-8">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              Live on Base · Ethereum · Arbitrum
            </span>
            <h1 className="font-serif font-bold text-6xl md:text-7xl lg:text-8xl tracking-tight text-text-main mb-6 leading-none">
              The Smartest Way
              <br />
              <span className="italic text-accent-green">to Save in DeFi</span>
            </h1>
            <p className="text-xl text-text-dim max-w-2xl mx-auto mb-10 leading-relaxed">
              Sage Vault combines YO's risk-adjusted yield infrastructure with an AI co-pilot that builds your personalized savings strategy — and executes it onchain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard" className="btn-primary text-base px-8 py-4">Start Saving →</Link>
              <Link to="/sage" className="btn-secondary text-base px-8 py-4">🤖 Talk to Sage</Link>
            </div>
          </motion.div>

          {totalTvl > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-6 justify-center mt-16"
            >
              {[
                { label: 'Total Value Locked', value: formatUSD(totalTvl) },
                { label: 'Average 7d APY', value: `${avgApy.toFixed(2)}%` },
                { label: 'Networks', value: 'Base · ETH · Arb' },
              ].map(({ label, value }) => (
                <div key={label} className="glass rounded-2xl px-8 py-5 text-center">
                  <p className="font-serif font-bold text-3xl text-accent-green">{value}</p>
                  <p className="text-sm text-text-muted mt-1">{label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-20 px-6 bg-white border-y border-app-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif font-bold text-4xl text-center text-text-main mb-12">
            Why <span className="italic text-accent-green">Sage Vault</span>?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg text-text-main mb-2">{f.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif font-bold text-4xl text-center text-text-main mb-12">How It Works</h2>
          <div className="space-y-6">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-accent-green/10 border border-accent-green/30 flex items-center justify-center font-display font-bold text-accent-green flex-shrink-0">
                  {s.n}
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-lg text-text-main mb-1">{s.title}</h3>
                  <p className="text-text-muted text-sm">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/dashboard" className="btn-primary text-base px-10 py-4">Get Started — It's Free →</Link>
          </div>
        </div>
      </section>

      <section className="py-12 px-6 bg-white border-t border-app-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-text-muted mb-6 font-medium uppercase tracking-widest">Powered by</p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {['YO Protocol', 'Morpho', 'Lido', 'Pendle', 'Base Network'].map(name => (
              <span key={name} className="text-text-dim font-semibold text-sm px-4 py-2 bg-app-hover rounded-xl border border-app-border">{name}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
