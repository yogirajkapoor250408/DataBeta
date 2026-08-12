import React, { useState } from 'react';
import { Building2, Globe, DollarSign, Upload, ArrowRight, Check, X, ShieldCheck } from 'lucide-react';
import { CurrencyCode, CURRENCIES } from '../types';
import { businessService, Business } from '../services/businessService';

interface OnboardingModalProps {
  isOpen: boolean;
  userId: string;
  onComplete: (business: Business) => void;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  userId,
  onComplete,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [name, setName] = useState('');
  const [type, setType] = useState('E-Commerce');
  const [country, setCountry] = useState('United States');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1 && !name.trim()) {
      setErrorMsg('Please enter a valid business name.');
      return;
    }
    if (step < 5) {
      setStep((prev) => (prev + 1) as any);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const { business, error } = await businessService.createBusiness(
      userId,
      name.trim(),
      type,
      country,
      currency
    );

    setIsSubmitting(false);

    if (error || !business) {
      setErrorMsg(error?.message || 'Failed to initialize business record.');
      return;
    }

    onComplete(business);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl max-w-lg w-full p-7 relative space-y-6 animate-fadeIn">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <span>STEP {step} OF 5</span>
            <span className="text-rose-500 uppercase font-mono">Business Setup</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-600 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-900 text-rose-200 text-xs rounded-2xl">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Business Name */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-600/40 flex items-center justify-center text-rose-500">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">What is your business called?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your official or trading company name to initialize your tenant environment.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Company / Store Name</label>
              <input
                type="text"
                autoFocus
                required
                placeholder="e.g. Apex Commerce Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-4 py-3 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Business Type */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-2xl font-black text-white">Select your industry model</h3>
              <p className="text-xs text-zinc-400 mt-1">
                This configures your default transaction categories and analytics benchmarks.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                'E-Commerce & Digital Store',
                'SaaS & Software',
                'Agency & Professional Services',
                'Retail & Hardware',
                'Consulting & Coaching',
                'Other Online Business',
              ].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`p-3.5 rounded-2xl border text-left font-bold transition-all ${
                    type === t
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Country */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center text-emerald-500">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Where is your business based?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Used to format tax estimates and regional business health scoring.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Operating Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-4 py-3 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Australia">Australia</option>
                <option value="India">India</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 4: Preferred Currency */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-600/40 flex items-center justify-center text-amber-500">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Primary Reporting Currency</h3>
              <p className="text-xs text-zinc-400 mt-1">
                All uploaded numbers will be standardized to this base reporting currency.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`p-3.5 rounded-2xl border text-left font-bold transition-all flex items-center justify-between ${
                    currency === c
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <span>{CURRENCIES[c].label}</span>
                  <span className="font-mono text-sm">{CURRENCIES[c].symbol}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Final Review & Create */}
        {step === 5 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-600/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Confirm & Create Business Tenant</h3>
              <p className="text-xs text-zinc-400 mt-1">
                You will be assigned as the **Owner** with full PostgreSQL Row Level Security (RLS) protection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Business Name:</span>
                <span className="font-bold text-white">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Industry:</span>
                <span className="font-bold text-white">{type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Country:</span>
                <span className="font-bold text-white">{country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Base Currency:</span>
                <span className="font-bold text-rose-400">{currency}</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Back
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-full shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
          >
            <span>{step === 5 ? (isSubmitting ? 'Creating...' : 'Initialize Business') : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
