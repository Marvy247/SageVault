import { motion } from 'framer-motion';
import SageChat from '../components/SageChat';
import { useSage } from '../context/SageContext';

const RISK_OPTIONS = [
  { value: 'conservative', label: '🛡️ Conservative', desc: 'Stable yields, protect principal' },
  { value: 'moderate', label: '⚖️ Moderate', desc: 'Balanced growth and stability' },
  { value: 'aggressive', label: '🚀 Aggressive', desc: 'Maximum yield, higher risk' },
] as const;

export default function SagePage() {
  const { profile, updateProfile } = useSage();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif font-bold text-4xl text-text-main mb-1">
          Sage <span className="italic text-accent-green">AI Co-Pilot</span>
        </h1>
        <p className="text-text-muted">Your personal DeFi wealth advisor — powered by live YO vault data</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile setup */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-text-main mb-4">Your Profile</h3>

            <div className="mb-4">
              <label className="text-xs font-medium text-text-muted block mb-2">Risk Tolerance</label>
              <div className="space-y-2">
                {RISK_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateProfile({ riskTolerance: opt.value })}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                      profile.riskTolerance === opt.value
                        ? 'border-accent-green bg-accent-green/10 text-accent-green font-medium'
                        : 'border-app-border bg-app-hover text-text-dim hover:border-accent-green/40'
                    }`}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <span className="block text-xs opacity-70 mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-text-muted block mb-2">Monthly Income (USD)</label>
              <input
                type="number"
                value={profile.monthlyIncome || ''}
                onChange={e => updateProfile({ monthlyIncome: parseFloat(e.target.value) || null })}
                placeholder="e.g. 2000"
                className="input-field text-sm py-2.5"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-text-muted block mb-2">Savings Goal</label>
              <input
                type="text"
                value={profile.savingsGoal || ''}
                onChange={e => updateProfile({ savingsGoal: e.target.value })}
                placeholder="e.g. Emergency fund, house"
                className="input-field text-sm py-2.5"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-muted block mb-2">Time Horizon (months)</label>
              <input
                type="number"
                value={profile.timeHorizon || ''}
                onChange={e => updateProfile({ timeHorizon: parseInt(e.target.value) || null })}
                placeholder="e.g. 12"
                className="input-field text-sm py-2.5"
              />
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-accent-green/5 border-accent-green/20">
            <h4 className="font-bold text-sm text-text-main mb-3">💡 Try asking Sage:</h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>"I earn $3k/month, want to save for a house in 2 years"</li>
              <li>"What if inflation stays at 20%?"</li>
              <li>"Compare yoUSD vs yoETH for me"</li>
              <li>"Show me a conservative 6-month plan"</li>
            </ul>
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden" style={{ height: '680px', display: 'flex', flexDirection: 'column' }}>
            <SageChat />
          </div>
        </div>
      </div>
    </div>
  );
}
