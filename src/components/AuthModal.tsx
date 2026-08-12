import React, { useState } from 'react';
import { X, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import {
  authenticateWithGoogleProfile,
  authenticateWithAppleProfile,
  loginWithEmail,
  signUpWithEmail,
  GOOGLE_PROFILES,
  APPLE_PROFILES,
} from '../utils/authEngine';
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
  const [subView, setSubView] = useState<'main' | 'google_picker' | 'apple_picker'>('main');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide your email address and password.');
      return;
    }

    try {
      let user: User;
      if (mode === 'signup') {
        user = await signUpWithEmail(name || email.split('@')[0], email, password);
      } else {
        user = await loginWithEmail(email, password);
      }
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  const handleSelectGoogleAccount = (profileEmail: string) => {
    const user = authenticateWithGoogleProfile(profileEmail);
    onAuthSuccess(user);
    onClose();
  };

  const handleSelectAppleAccount = (profileEmail: string) => {
    const user = authenticateWithAppleProfile(profileEmail);
    onAuthSuccess(user);
    onClose();
  };

  const handleAdminDemoLogin = async () => {
    try {
      const user = await loginWithEmail('admin@databeta.io', 'admin123');
      onAuthSuccess(user);
      onClose();
    } catch {
      try {
        const user = await signUpWithEmail('Admin User', 'admin@databeta.io', 'admin123');
        onAuthSuccess(user);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Admin login failed.');
      }
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

        {subView === 'main' && (
          <>
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

            {/* Interactive OAuth Buttons */}
            <div className="space-y-2.5">
              <div className="text-[10px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg mb-2 text-center border border-amber-200 dark:border-amber-900/50">
                Note: OAuth requires a backend. The buttons below will log you in using local mock data. For a true test, use Email sign up below.
              </div>
              <button
                type="button"
                onClick={() => setSubView('google_picker')}
                className="w-full flex items-center justify-between py-2.5 px-4 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 rounded-full text-xs font-bold text-slate-900 dark:text-white transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
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
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setSubView('apple_picker')}
                className="w-full flex items-center justify-between py-2.5 px-4 bg-zinc-950 text-white dark:bg-white dark:text-black border border-zinc-800 rounded-full text-xs font-bold transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.82c.67-.82 1.13-1.96.99-3.11-.98.04-2.18.66-2.88 1.48-.62.72-1.16 1.88-1.01 3.01 1.1.08 2.22-.56 2.9-1.38z" />
                  </svg>
                  <span>Continue with Apple</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

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
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-full shadow-md shadow-rose-600/30 transition-all text-xs"
              >
                {mode === 'signin' ? 'Sign In to Account' : 'Create Free Account'}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-900 text-center space-y-2">
              <button
                onClick={handleAdminDemoLogin}
                className="w-full py-1.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-full border border-slate-200 dark:border-zinc-800 transition-all flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-rose-600" />
                <span>Log in as Website Owner / Admin</span>
              </button>
            </div>
          </>
        )}

        {/* SubView: Google Account Picker Modal */}
        {subView === 'google_picker' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Sign in with Google</h4>
              </div>
              <button onClick={() => setSubView('main')} className="text-xs font-bold text-rose-600">Back</button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Choose an account to continue to <span className="font-bold text-slate-900 dark:text-white">DataBeta Platform</span>:
            </p>

            <div className="space-y-2">
              {GOOGLE_PROFILES.map((p) => (
                <div
                  key={p.email}
                  onClick={() => handleSelectGoogleAccount(p.email)}
                  className="p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500">{p.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
                    {p.role.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SubView: Apple ID Picker Modal */}
        {subView === 'apple_picker' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 fill-current text-slate-900 dark:text-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.82c.67-.82 1.13-1.96.99-3.11-.98.04-2.18.66-2.88 1.48-.62.72-1.16 1.88-1.01 3.01 1.1.08 2.22-.56 2.9-1.38z" />
                </svg>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Sign in with Apple ID</h4>
              </div>
              <button onClick={() => setSubView('main')} className="text-xs font-bold text-rose-600">Back</button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Confirm your Apple ID account to authenticate securely:
            </p>

            <div className="space-y-2">
              {APPLE_PROFILES.map((p) => (
                <div
                  key={p.email}
                  onClick={() => handleSelectAppleAccount(p.email)}
                  className="p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500">{p.email}</div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Hide My Email</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
