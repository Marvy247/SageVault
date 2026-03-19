import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSage } from '../context/SageContext';

const STEPS = [
  {
    id: 'goal',
    question: "What are you saving for?",
    subtitle: "This helps Sage tailor your strategy",
    options: [
      { label: '🏠 House / Property', value: 'house' },
      { label: '🚨 Emergency Fund', value: 'emergency' },
      { label: '📈 Wealth Building', value: 'wealth' },
      { label: '✈️ Travel / Experience', value: 'travel' },
      { label: '🎓 Education', value: 'education' },
      { label: '🌍 Beat Inflation', value: 'inflation' },
    ],
  },
  {
    id: 'risk',
    question: "How do you feel about risk?",
    subtitle: "Be honest — there's no wrong answer",
    options: [
      { label: '🛡️ Conservative — protect my money first', value: 'conservative' },
      { label: '⚖️ Balanced — some growth, some safety', value: 'moderate' },
      { label: '🚀 Aggressive — maximize my returns', value: 'aggressive' },
    ],
  },
  {
    id: 'income',
    question: "How much can you save monthly?",
    subtitle: "Approximate is fine",
    options: [
      { label: 'Under $100', value: '50' },
      { label: '$100 – $500', value: '250' },
      { label: '$500 – $2,000', value: '1000' },
      { label: '$2,000+', value: '3000' },
    ],
  },
  {
    id: 'horizon',
    question: "What's your time horizon?",
    subtitle: "When do you want to access your savings?",
    options: [
      { label: '⚡ Under 6 months', value: '6' },
      { label: '📅 6 – 12 months', value: '12' },
      { label: '📆 1 – 3 years', value: '24' },
      { label: '🌱 3+ years', value: '48' },
    ],
  },
];

const ALLOCATION_MAP: Record<string, Record<string, { vault: string; pct: number }[]>> = {
  conservative: {
    default: [{ vault: 'yoUSD', pct: 80 }, { vault: 'yoETH', pct: 20 }],
  },
  moderate: {
    default: [{ vault: 'yoUSD', pct: 50 }, { vault: 'yoETH', pct: 30 }, { vault: 'yoBTC', pct: 20 }],
  },
  aggressive: {
    default: [{ vault: 'yoUSD', pct: 30 }, { vault: 'yoETH', pct: 40 }, { vault: 'yoBTC', pct: 30 }],
  },
};

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { updateProfile, sendMessage } = useSage();
  const navigate = useNavigate();

  const current = STEPS[step];

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);

    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      // All done — update profile and generate Sage recommendation
      const risk = newAnswers.risk as 'conservative' | 'moderate' | 'aggressive';
      updateProfile({
        riskTolerance: risk,
        monthlyIncome: parseFloat(newAnswers.income ?? '500'),
        savingsGoal: newAnswers.goal ?? null,
        timeHorizon: parseInt(newAnswers.horizon ?? '12'),
      });

      const alloc = ALLOCATION_MAP[risk]?.default ?? ALLOCATION_MAP.moderate.default;
      const goalLabel = STEPS[0].options.find(o => o.value === newAnswers.goal)?.label ?? newAnswers.goal;

      sendMessage(
        `My goal is ${goalLabel}, I can save $${newAnswers.income}/month, risk tolerance is ${risk}, time horizon is ${newAnswers.horizon} months. What's my personalized strategy?`,
      );

      // Store recommendation for dashboard
      localStorage.setItem('sage_recommendation', JSON.stringify({ risk, alloc, monthly: newAnswers.income }));
      localStorage.setItem('sage_onboarded', 'true');

      onComplete();
      navigate('/dashboard');
    }
  };

  const progress = ((step) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-app-bg grid-subtle flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent-green flex items-center justify-center text-white font-bold text-xs">S</div>
              <span className="font-serif font-bold text-lg text-text-main">Sage<span className="italic text-accent-green">Vault</span></span>
            </div>
            <span className="text-xs text-text-muted">{step + 1} of {STEPS.length}</span>
          </div>
          <div className="h-1.5 bg-app-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-green rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="font-serif font-bold text-3xl text-text-main mb-2">{current.question}</h2>
            <p className="text-text-muted mb-8">{current.subtitle}</p>

            <div className="space-y-3">
              {current.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="w-full text-left px-5 py-4 rounded-2xl border-2 border-app-border bg-white hover:border-accent-green hover:bg-accent-green/5 transition-all duration-200 font-medium text-text-main group"
                >
                  <span className="group-hover:text-accent-green transition-colors">{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="mt-6 text-sm text-text-muted hover:text-text-main transition-colors">
            ← Back
          </button>
        )}
      </motion.div>
    </div>
  );
}
