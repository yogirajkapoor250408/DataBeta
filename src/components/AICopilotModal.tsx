import React, { useState } from 'react';
import { NormalizedRecord, CurrencyCode, CRMContact, AICopilotMessage } from '../types';
import { generateAICopilotResponse } from '../utils/aiEngine';
import { Sparkles, Send, X, Bot, User, CheckCircle2, AlertTriangle, Info, ArrowUpRight } from 'lucide-react';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: NormalizedRecord[];
  currency: CurrencyCode;
  contacts: CRMContact[];
}

const PROMPT_SUGGESTIONS = [
  'Generate Executive Briefing',
  'How do I increase net profit by 10%?',
  'Analyze operational cost risks',
  'Summarize tax deductions & savings',
  'Who are my top customer accounts?',
];

export const AICopilotModal: React.FC<AICopilotModalProps> = ({
  isOpen,
  onClose,
  records,
  currency,
  contacts,
}) => {
  const [messages, setMessages] = useState<AICopilotMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: 'Hello! I am the DataBeta Intelligence Engine. I run 100% deterministically using rule-based algorithms to analyze your transactions, profit margins, tax deductions, and customer pipeline.',
      timestamp: 'Just now',
      cards: [
        {
          title: 'DataBeta Intelligence Engine',
          value: 'Deterministic',
          detail: 'Rule-based analysis from your real transaction data',
          type: 'positive',
        },
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: AICopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAICopilotResponse(query, records, currency, contacts);

      const aiMsg: AICopilotMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cards: response.cards,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-end p-0 sm:p-4 no-print">
      <div className="bg-white dark:bg-zinc-950 w-full sm:max-w-md h-full sm:h-[90vh] sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between overflow-hidden relative">
        {/* Header */}
        <div className="p-4 bg-zinc-950 text-white border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-600 flex items-center justify-center font-bold shadow-md shadow-rose-600/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">Rule-Based Insight Engine</h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">High-Level Algorithm Engine • 100% Local</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          {PROMPT_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSendMessage(s)}
              className="px-3 py-1 rounded-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-bold whitespace-nowrap hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-all shrink-0"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[10px] ${
                  m.sender === 'user' ? 'bg-zinc-900 dark:bg-white dark:text-black' : 'bg-rose-600'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div className={`space-y-2 max-w-[85%] ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`p-3.5 rounded-2xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-rose-600 text-white rounded-tr-none font-medium'
                      : 'bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white rounded-tl-none border border-slate-200/80 dark:border-zinc-800 font-medium'
                  }`}
                >
                  {m.text}
                </div>

                {/* Structured Cards */}
                {m.cards && m.cards.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {m.cards.map((card, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900 dark:text-white">{card.title}</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{card.value}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">{card.detail}</p>
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-slate-400 dark:text-zinc-500 block px-1">
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 items-center text-xs text-slate-400 dark:text-zinc-500 italic">
              <Bot className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Insight Engine is evaluating rules...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-zinc-950 border-t border-slate-200/80 dark:border-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              placeholder="Ask the Insight Engine anything about your business..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full pl-4 pr-10 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center absolute right-1.5 shadow-md shadow-rose-600/30 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="text-[9px] text-slate-400 dark:text-zinc-500 text-center mt-1 font-mono">
            🔒 100% In-Browser Local Decision Tree Logic
          </div>
        </div>
      </div>
    </div>
  );
};
