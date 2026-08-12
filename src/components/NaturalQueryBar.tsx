import React, { useState } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
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
    <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3 no-print">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
        <Sparkles className="w-4 h-4 text-rose-600" />
        <span>Natural Language Data Query</span>
      </div>

      {/* Input Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={queryText}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder='Ask anything (e.g. "What was my best month?", "Marketing spend", "Top customer")...'
          className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full pl-11 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
        />
        {queryText && (
          <button
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sample Query Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mr-1">Suggestions:</span>
        {SAMPLE_QUERIES.map((sq) => (
          <button
            key={sq}
            onClick={() => handleSearch(sq)}
            className="px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-zinc-300 text-[11px] font-bold transition-all border border-slate-200/80 dark:border-zinc-800"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Answer Card */}
      {activeCard && (
        <div className="mt-3 p-5 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-xl animate-fadeIn">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">
                Instant Query Result
              </span>
              <h4 className="text-base font-extrabold mt-0.5 text-white">{activeCard.title}</h4>
            </div>
            <span className="text-xl font-black text-emerald-400">{activeCard.valueString}</span>
          </div>
          <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{activeCard.subtitle}</p>
        </div>
      )}
    </div>
  );
};
