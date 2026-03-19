import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'react-hot-toast';
import { SageProvider } from './context/SageContext';
import Navigation from './components/Navigation';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Vaults from './components/Vaults';
import SagePage from './components/SagePage';
import Portfolio from './components/Portfolio';

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="pt-28 pb-20 px-4 sm:px-6 min-h-screen"
    >
      <div className="max-w-6xl mx-auto">{children}</div>
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/vaults" element={<PageWrapper><Vaults /></PageWrapper>} />
        <Route path="/sage" element={<PageWrapper><SagePage /></PageWrapper>} />
        <Route path="/portfolio" element={<PageWrapper><Portfolio /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function Footer() {
  return (
    <footer className="border-t border-app-border py-10 px-6 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-green flex items-center justify-center text-white font-bold text-xs">S</div>
          <span className="font-serif font-bold text-lg text-text-main">Sage<span className="italic text-accent-green">Vault</span></span>
        </div>
        <p className="text-xs text-text-muted text-center">
          Built on <a href="https://yo.xyz" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">YO Protocol</a> · Non-custodial · Onchain · Transparent
        </p>
        <p className="text-xs text-text-muted">© 2026 Sage Vault</p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SageProvider>
        <Analytics />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#fff', border: '1px solid #D1FAE5', color: '#064E3B', borderRadius: '12px' },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          }}
        />
        <div className="min-h-screen bg-app-bg grid-subtle">
          <Navigation />
          <main>
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </SageProvider>
    </BrowserRouter>
  );
}

export default App;
