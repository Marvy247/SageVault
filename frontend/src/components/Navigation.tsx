import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/vaults', label: 'Vaults', icon: '🏦' },
  { path: '/sage', label: 'Sage AI', icon: '🤖' },
  { path: '/portfolio', label: 'Portfolio', icon: '📈' },
];

export default function Navigation() {
  const location = useLocation();
  const { isConnected, shortAddress, connectWallet, disconnect, isPending } = useWallet();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-6xl">
      <div className="glass rounded-2xl px-5 py-3 shadow-floating flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-accent-green flex items-center justify-center text-white font-bold text-sm shadow-premium">
            S
          </div>
          <span className="font-serif font-bold text-xl tracking-tight text-text-main group-hover:text-accent-green transition-colors">
            Sage<span className="italic text-accent-green">Vault</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-green text-white shadow-premium'
                    : 'text-text-dim hover:text-accent-green hover:bg-app-hover'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            );
          })}
        </div>

        <div className="relative">
          {isConnected ? (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-green/10 border border-accent-green/30 rounded-xl text-sm font-medium text-accent-green hover:bg-accent-green/20 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              {shortAddress}
            </button>
          ) : (
            <button onClick={connectWallet} disabled={isPending} className="btn-primary text-sm py-2 px-5">
              {isPending ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}

          <AnimatePresence>
            {showMenu && isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-44 glass rounded-xl shadow-floating border border-app-border overflow-hidden"
              >
                <button
                  onClick={() => { disconnect(); setShowMenu(false); }}
                  className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  🔌 Disconnect
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
