import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface Message {
  role: 'user' | 'sage';
  content: string;
  timestamp: Date;
}

export interface UserProfile {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | null;
  monthlyIncome: number | null;
  savingsGoal: string | null;
  timeHorizon: number | null; // months
}

interface SageContextType {
  messages: Message[];
  profile: UserProfile;
  isThinking: boolean;
  sendMessage: (text: string, vaultData?: VaultSnapshot[]) => void;
  updateProfile: (p: Partial<UserProfile>) => void;
  clearChat: () => void;
}

export interface VaultSnapshot {
  id: string;
  name: string;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
}

const SageContext = createContext<SageContextType | null>(null);

// Deterministic AI responses based on keywords — no API key needed, works offline
function generateSageResponse(userMsg: string, profile: UserProfile, vaults: VaultSnapshot[]): string {
  const msg = userMsg.toLowerCase();
  const vaultList = vaults.map(v => `${v.name} (${v.apy.toFixed(2)}% APY, ${v.risk} risk)`).join(', ');

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello! I'm Sage, your personal DeFi wealth co-pilot 🌿\n\nI can help you:\n• Build a personalized savings strategy\n• Allocate across YO vaults based on your goals\n• Simulate yield projections\n• Explain how each vault works\n\nTell me about your savings goals — what are you saving for?`;
  }

  if (msg.includes('risk') && (msg.includes('low') || msg.includes('safe') || msg.includes('conservative') || msg.includes('stable'))) {
    return `For a conservative strategy, I recommend focusing on **yoUSD** — it targets stable, risk-adjusted yields by deploying across battle-tested protocols like Morpho and Pendle.\n\n📊 Suggested allocation:\n• 80% yoUSD — stable yield, low volatility\n• 20% yoETH — modest growth exposure\n\nYO's risk engine dynamically rebalances to protect your principal. You won't get the highest APY, but you'll sleep well at night. Want me to run a projection?`;
  }

  if (msg.includes('aggressive') || msg.includes('growth') || msg.includes('maximum') || msg.includes('high yield')) {
    return `For a growth-oriented strategy, here's what I'd suggest:\n\n📊 Suggested allocation:\n• 40% yoUSD — stable base\n• 35% yoETH — ETH-denominated yield\n• 25% yoBTC — BTC exposure with yield\n\n⚠️ Higher yields come with higher volatility. YO's risk engine helps, but ETH/BTC price swings affect your USD value. Only allocate what you can hold long-term.\n\nCurrent live vaults: ${vaultList || 'loading...'}`;
  }

  if (msg.includes('project') || msg.includes('simulation') || msg.includes('how much') || msg.includes('earn')) {
    const income = profile.monthlyIncome || 1000;
    const savingsRate = 0.2;
    const monthly = income * savingsRate;
    const apy = 8.5;
    const months = profile.timeHorizon || 12;
    const total = monthly * months * (1 + (apy / 100) * (months / 12));
    return `Based on your profile, here's a projection:\n\n💰 Monthly savings: $${monthly.toFixed(0)}\n📈 Estimated APY: ~${apy}% (blended across vaults)\n⏱️ Time horizon: ${months} months\n\n🎯 Projected balance: **$${total.toFixed(2)}**\n\nThis assumes consistent deposits and current YO vault yields. Actual returns vary — YO adjusts allocations dynamically to optimize risk-adjusted yield.\n\nWant to adjust the numbers?`;
  }

  if (msg.includes('inflation') || msg.includes('nigeria') || msg.includes('naira') || msg.includes('emerging')) {
    return `Great point — for savers in high-inflation regions, DeFi yields can be a game-changer.\n\n🌍 Strategy for inflation protection:\n• Keep savings in **yoUSD** (USDC-denominated) to avoid local currency devaluation\n• Current yoUSD APY typically beats inflation in most emerging markets\n• Withdraw to stablecoins anytime — no lock-up\n\nFor example, if local inflation is 25% and yoUSD yields 8-12%, you're still ahead vs. a local savings account at 3-5%.\n\nYO vaults are non-custodial — your funds stay onchain, not with a bank.`;
  }

  if (msg.includes('safe') || msg.includes('trust') || msg.includes('audit') || msg.includes('secure')) {
    return `Great question — trust is everything in DeFi. Here's what makes YO safe:\n\n🔒 **Security layers:**\n• Smart contracts audited by leading firms\n• Non-custodial — you always control your funds\n• Risk engine dynamically shifts allocations away from underperforming protocols\n• No lock-up periods on most vaults\n\n📊 **Transparency:**\n• Every deposit/redeem is an onchain transaction you can verify\n• Real-time TVL and allocation breakdowns visible in the dashboard\n• Full transaction history with Etherscan links\n\nYO deploys across Lido, Morpho, Pendle — all battle-tested protocols.`;
  }

  if (msg.includes('withdraw') || msg.includes('redeem') || msg.includes('exit')) {
    return `Withdrawing from YO vaults is straightforward:\n\n1. Go to your vault position\n2. Click **Redeem**\n3. Enter the amount (shares or assets)\n4. Confirm the transaction\n\nMost redemptions are **instant** — you get your assets back in the same transaction. Some vaults may queue large redemptions, in which case you'll get a request ID and can claim once processed.\n\nNo penalties, no lock-up fees. Your money, your rules.`;
  }

  if (msg.includes('allocat') || msg.includes('split') || msg.includes('diversif')) {
    const risk = profile.riskTolerance;
    if (risk === 'conservative') {
      return `For your conservative profile, I recommend:\n\n• **70% yoUSD** — stable USDC yield\n• **20% yoETH** — modest ETH exposure\n• **10% cash reserve** — keep liquid\n\nThis gives you inflation-beating returns with minimal volatility.`;
    }
    if (risk === 'aggressive') {
      return `For your aggressive profile:\n\n• **30% yoUSD** — stable anchor\n• **40% yoETH** — growth\n• **30% yoBTC** — BTC yield\n\nHigh upside, but be prepared for NAV swings with ETH/BTC prices.`;
    }
    return `For a balanced approach:\n\n• **50% yoUSD** — stable yield foundation\n• **30% yoETH** — growth layer\n• **20% yoBTC** — diversification\n\nThis blended strategy typically yields 7-12% APY while managing downside risk. Want me to customize based on your income and goals?`;
  }

  if (msg.includes('what is yo') || msg.includes('how does yo') || msg.includes('explain yo')) {
    return `YO is a risk-adjusted yield protocol that automatically allocates your deposits across the best DeFi yield sources.\n\n🔄 **How it works:**\n1. You deposit USDC/ETH/BTC into a YO vault\n2. YO's risk engine allocates across protocols (Lido, Morpho, Pendle, etc.)\n3. Yields are continuously optimized and rebalanced\n4. You earn yield on your deposit, represented as vault shares\n\n📈 **Why it's better than manual yield farming:**\n• No need to monitor multiple protocols\n• Risk-adjusted — not just chasing highest APY\n• Gas-efficient batch operations\n• Available on Base, Ethereum, and Arbitrum`;
  }

  // Default contextual response
  return `I understand you're asking about "${userMsg.slice(0, 50)}${userMsg.length > 50 ? '...' : ''}"\n\nHere's what I can help you with:\n\n• **Savings strategy** — tell me your income, goals, and risk tolerance\n• **Vault comparison** — I'll explain yoUSD, yoETH, yoBTC differences\n• **Yield projections** — simulate your returns over time\n• **Safety questions** — understand how YO protects your funds\n• **Withdrawal process** — how to redeem your position\n\nWhat would you like to explore?`;
}

export function SageProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'sage',
      content: `Welcome to Sage Vault 🌿\n\nI'm your AI wealth co-pilot, powered by YO's risk-adjusted yield infrastructure.\n\nTo get started, tell me:\n• What are you saving for?\n• What's your risk tolerance — conservative, moderate, or aggressive?\n• How much can you save monthly?\n\nI'll build you a personalized DeFi savings strategy.`,
      timestamp: new Date(),
    },
  ]);
  const [profile, setProfile] = useState<UserProfile>({
    riskTolerance: null,
    monthlyIncome: null,
    savingsGoal: null,
    timeHorizon: null,
  });
  const [isThinking, setIsThinking] = useState(false);

  const updateProfile = useCallback((p: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...p }));
  }, []);

  const sendMessage = useCallback((text: string, vaultData: VaultSnapshot[] = []) => {
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    // Auto-extract profile hints from message
    const lower = text.toLowerCase();
    const profileUpdate: Partial<UserProfile> = {};
    if (lower.includes('conservative') || lower.includes('safe') || lower.includes('low risk')) profileUpdate.riskTolerance = 'conservative';
    if (lower.includes('moderate') || lower.includes('balanced')) profileUpdate.riskTolerance = 'moderate';
    if (lower.includes('aggressive') || lower.includes('high risk') || lower.includes('growth')) profileUpdate.riskTolerance = 'aggressive';
    const incomeMatch = text.match(/\$?([\d,]+)\s*(k|thousand)?\/?(month|mo|monthly)?/i);
    if (incomeMatch) {
      let val = parseFloat(incomeMatch[1].replace(',', ''));
      if (incomeMatch[2]?.toLowerCase() === 'k') val *= 1000;
      if (val > 100) profileUpdate.monthlyIncome = val;
    }
    if (Object.keys(profileUpdate).length) setProfile(prev => ({ ...prev, ...profileUpdate }));

    setTimeout(() => {
      const updatedProfile = { ...profile, ...profileUpdate };
      const response = generateSageResponse(text, updatedProfile, vaultData);
      setMessages(prev => [...prev, { role: 'sage', content: response, timestamp: new Date() }]);
      setIsThinking(false);
    }, 800 + Math.random() * 600);
  }, [profile]);

  const clearChat = useCallback(() => {
    setMessages([{
      role: 'sage',
      content: `Chat cleared. How can I help you with your savings strategy today?`,
      timestamp: new Date(),
    }]);
  }, []);

  return (
    <SageContext.Provider value={{ messages, profile, isThinking, sendMessage, updateProfile, clearChat }}>
      {children}
    </SageContext.Provider>
  );
}

export function useSage() {
  const ctx = useContext(SageContext);
  if (!ctx) throw new Error('useSage must be used within SageProvider');
  return ctx;
}
