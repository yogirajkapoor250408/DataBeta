import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { authService } from './services/authService';

export const LandingApp: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('databeta_theme') as 'dark' | 'light' | null;
      if (storedTheme) {
        setTheme(storedTheme);
        if (storedTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      } else {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    } catch {}

    // Check if OAuth callback landed on the root page with access_token tokens
    if (typeof window !== 'undefined' && window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('error='))) {
      window.location.href = `/dashboard.html${window.location.hash}`;
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#09090b] dark:text-zinc-100 transition-colors duration-300">
      <LandingPage
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onExploreDemo={() => {
          window.location.href = '/dashboard.html';
        }}
      />
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={() => {
          window.location.href = '/dashboard.html';
        }}
      />
    </div>
  );
};
