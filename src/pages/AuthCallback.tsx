import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { generateSupportReferenceId, sanitizeErrorMessage } from '../utils/urlSanitizer';
import { ShieldCheck, AlertCircle, RotateCcw, ArrowRight, Home } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'exchanging' | 'success' | 'error'>('exchanging');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const refId = generateSupportReferenceId();
    setReferenceId(refId);

    const performExchange = async () => {
      try {
        const { success, error } = await authService.handleAuthCallback();
        if (!isMounted) return;

        if (success) {
          setStatus('success');
          // Smooth redirect to authenticated dashboard
          setTimeout(() => {
            window.location.href = '/dashboard.html?mode=live';
          }, 300);
        } else {
          setStatus('error');
          setErrorMessage(error?.message || 'Authentication code exchange could not be completed.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage(sanitizeErrorMessage(err));
      }
    };

    performExchange();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-6 animate-fadeIn">
        {/* Top Logo */}
        <div className="flex items-center justify-center gap-2.5">
          <img src="/icon.png" alt="DataBeta" className="w-10 h-10 object-contain rounded-2xl shadow-xs" />
          <div className="text-left">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white block leading-none">
              DataBeta
            </span>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              Sales & Cash Operating System
            </span>
          </div>
        </div>

        {/* Exchanging State */}
        {status === 'exchanging' && (
          <div className="py-6 space-y-4">
            <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-3 border-rose-500/20 border-t-rose-600 animate-spin" />
              <ShieldCheck className="w-6 h-6 text-rose-600 absolute" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Completing Secure Sign-In...
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Verifying authorization code and initializing your private workspace session.
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Session Verified & Encrypted
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Redirecting to your command dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Error / Recoverable State */}
        {status === 'error' && (
          <div className="py-4 space-y-5 text-left">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-extrabold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Authentication Check Blocked</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                We couldn’t complete sign-in. Your account is safe. Please try again.
              </p>
              {errorMessage && (
                <div className="p-2.5 bg-white/70 dark:bg-zinc-900/70 rounded-xl text-[11px] text-slate-600 dark:text-zinc-400 font-mono break-all">
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center font-mono">
              Diagnostic Ref: <strong className="text-slate-600 dark:text-zinc-300">{referenceId}</strong>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={() => {
                  window.location.href = '/?auth=signin';
                }}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Sign In</span>
              </button>

              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
