import React, { useState } from 'react';
import { Search, Sparkles, X, ArrowRight, HelpCircle } from 'lucide-react';
import { NormalizedRecord, CurrencyCode, QueryResultCard } from '../types';
import { evaluateNaturalQuery } from '../utils/naturalQueryEngine';

interface NaturalQueryBarProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
}

const SAMPLE_QUERIES = [
  'What was my best month?',
  'How much did I spend on marketing?',
  'Who is my top customer?',
  'Total expenses',
  'What is my profit margin?',
];

export const NaturalQueryBar: React.FC<NaturalQueryBarProps> = ({ records, currency }) => {
  const [queryText, setQueryText] = useState('');
  const [activeCard, setActiveCard] = useState<QueryResultCard | null>(null);

  const handleSearch = (text: string) => {
    setQueryText(text);
    if (!text.trim()) {
      setActiveCard(null);
      return;
    }

    const card = evaluateNaturalQuery(text, records, currency);
    setActiveCard(card);
  };

  const handleClear = () => {
    setQueryText('');
    setActiveCard(null);
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 no-print">
      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <span>Natural Language Data Query</span>
      </div>

      {/* Input Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={queryText}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder='Ask anything (e.g. "What was my best month?", "Marketing spend", "Top customer")...'
          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
        />
        {queryText && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sample Query Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-slate-400 font-medium mr-1">Suggestions:</span>
        {SAMPLE_QUERIES.map((sq) => (
          <button
            key={sq}
            onClick={() => handleSearch(sq)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] font-semibold transition-all border border-slate-200"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Answer Card */}
      {activeCard && (
        <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900 shadow-md animate-fadeIn">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                Instant Query Result
              </span>
              <h4 className="text-base font-bold mt-0.5 text-white">{activeCard.title}</h4>
            </div>
            <span className="text-xl font-black text-emerald-400">{activeCard.valueString}</span>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">{activeCard.subtitle}</p>
        </div>
      )}
    </div>
  );
};
