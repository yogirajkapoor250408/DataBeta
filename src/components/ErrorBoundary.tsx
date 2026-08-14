import React, { Component, ErrorInfo, ReactNode } from 'react';
import { generateSupportReferenceId, sanitizeErrorMessage } from '../utils/urlSanitizer';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  referenceId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    referenceId: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      referenceId: generateSupportReferenceId(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Redact any tokens before safe diagnostic logging
    const safeMsg = sanitizeErrorMessage(error.message);
    console.error('DataBeta ErrorBoundary caught an application error:', {
      message: safeMsg,
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleReturnHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex items-center justify-center p-4 font-sans">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-900 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                We Encountered an Unexpected Issue
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                We couldn’t complete sign-in or view rendering. Your account is safe. Please try again.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl text-left border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400 font-mono break-all max-h-24 overflow-y-auto">
                {sanitizeErrorMessage(this.state.error.message)}
              </div>
            )}

            <div className="text-[11px] text-slate-400 font-mono">
              Support Reference: <strong className="text-slate-700 dark:text-zinc-300">{this.state.referenceId}</strong>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry & Reload</span>
              </button>

              <button
                onClick={this.handleReturnHome}
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
