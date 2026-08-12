import React, { useState } from 'react';
import { X } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide your email address and password.');
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { user, error } = await authService.signUp(email, password, name || email.split('@')[0]);
        if (error) throw error;
        if (!user) throw new Error('Registration failed.');
        onAuthSuccess(user);
      } else {
        const { user, error } = await authService.signIn(email, password);
        if (error) throw error;
        if (!user) throw new Error('Authentication failed.');
        onAuthSuccess(user);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials and Supabase configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 max-w-md w-full p-6 relative my-8 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-zinc-900 rounded-full text-xs font-bold w-full">
          <button
            onClick={() => { setMode('signin'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-full transition-all ${
              mode === 'signin'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-full transition-all ${
              mode === 'signup'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {mode === 'signin' ? 'Sign in to access your CRM & financial intelligence' : 'Start tracking business finances with 100% local privacy'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-2xl text-xs">
            {errorMsg}
          </div>
        )}

        {/* Real Supabase Google OAuth Button */}
        <button
          type="button"
          onClick={async () => {
            setErrorMsg(null);
            const { error } = await authService.signInWithGoogle();
            if (error) {
              setErrorMsg(error.message || 'Google sign-in failed. Please ensure Google provider is enabled in your Supabase dashboard.');
            }
          }}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 rounded-full text-xs font-bold text-slate-900 dark:text-white active:scale-95 transition-all shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider my-2">
          <span className="bg-white dark:bg-zinc-950 px-3 relative z-10">Or use email</span>
          <div className="absolute inset-0 top-1/2 border-t border-slate-200 dark:border-zinc-800 -z-0" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-full shadow-md shadow-rose-600/30 transition-all text-xs ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Processing...' : (mode === 'signin' ? 'Sign In to Account' : 'Create Free Account')}
          </button>
        </form>
      </div>
    </div>
  );
};
