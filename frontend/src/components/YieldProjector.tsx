import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { projectYield, formatUSD } from '../utils/format';

export default function YieldProjector() {
  const [principal, setPrincipal] = useState(1000);
  const [monthly, setMonthly] = useState(200);
  const [apy, setApy] = useState(8.5);
  const [months, setMonths] = useState(24);

  const points = projectYield(principal, monthly, apy, months);
  const data = points.map((v, i) => ({
    month: i === 0 ? 'Now' : `M${i}`,
    balance: v,
    deposited: principal + monthly * i,
  }));

  const finalBalance = points[points.length - 1];
  const totalDeposited = principal + monthly * months;
  const yieldEarned = finalBalance - totalDeposited;

  return (
    <div className="card">
      <h3 className="font-serif font-bold text-2xl text-text-main mb-1">Yield Projector</h3>
      <p className="text-sm text-text-muted mb-6">Simulate your savings growth with YO vaults</p>

      {/* Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Starting Amount', value: principal, setter: setPrincipal, prefix: '$', min: 0, max: 100000, step: 100 },
          { label: 'Monthly Deposit', value: monthly, setter: setMonthly, prefix: '$', min: 0, max: 10000, step: 50 },
          { label: 'APY (%)', value: apy, setter: setApy, prefix: '', min: 1, max: 30, step: 0.5 },
          { label: 'Months', value: months, setter: setMonths, prefix: '', min: 1, max: 60, step: 1 },
        ].map(({ label, value, setter, prefix, min, max, step }) => (
          <div key={label}>
            <label className="text-xs font-medium text-text-muted block mb-1">{label}</label>
            <div className="relative">
              {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">{prefix}</span>}
              <input
                type="number"
                value={value}
                onChange={e => setter(parseFloat(e.target.value) || 0)}
                min={min} max={max} step={step}
                className={`input-field text-sm py-2 ${prefix ? 'pl-7' : ''}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-accent-green/5 rounded-xl border border-accent-green/20 text-center">
          <p className="text-xs text-text-muted mb-1">Final Balance</p>
          <p className="font-serif font-bold text-2xl text-accent-green">{formatUSD(finalBalance)}</p>
        </div>
        <div className="p-4 bg-app-hover rounded-xl border border-app-border text-center">
          <p className="text-xs text-text-muted mb-1">Total Deposited</p>
          <p className="font-bold text-xl text-text-main">{formatUSD(totalDeposited)}</p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
          <p className="text-xs text-text-muted mb-1">Yield Earned</p>
          <p className="font-bold text-xl text-emerald-600">+{formatUSD(Math.max(0, yieldEarned))}</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="depositedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6EE7B7" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#D1FAE5" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
            interval={Math.floor(months / 6)} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #D1FAE5', borderRadius: '12px', fontSize: '12px' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => [formatUSD(Number(value)), name === 'balance' ? 'Balance' : 'Deposited'] as [string, string]}
          />
          <Area type="monotone" dataKey="deposited" stroke="#6EE7B7" strokeWidth={1.5} fill="url(#depositedGrad)" />
          <Area type="monotone" dataKey="balance" stroke="#059669" strokeWidth={2} fill="url(#balanceGrad)" />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-text-muted text-center mt-2">
        Projections are illustrative. Actual yields vary based on market conditions.
      </p>
    </div>
  );
}
