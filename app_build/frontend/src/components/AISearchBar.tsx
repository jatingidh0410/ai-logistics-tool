import React, { useState } from 'react';
import { Sparkles, Search, X, Bot, ArrowRight, Filter, AlertTriangle } from 'lucide-react';
import { AIQueryResult, ExtractedAIFilters } from '../types/shipment';

interface AISearchBarProps {
  onSearch: (query: string) => Promise<void>;
  onClear: () => void;
  isLoading: boolean;
  aiResult: AIQueryResult | null;
}

const SAMPLE_PROMPTS = [
  'Show me delayed shipments to Pune',
  'Customs hold cargo from Shanghai',
  'In Transit with Maersk',
  'Delivered shipments to Nhava Sheva',
];

export const AISearchBar: React.FC<AISearchBarProps> = ({
  onSearch,
  onClear,
  isLoading,
  aiResult,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handlePromptClick = (sample: string) => {
    setQuery(sample);
    onSearch(sample);
  };

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  const filters = aiResult?.extractedFilters;

  return (
    <div className="w-full bg-slate-900/70 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-indigo-950/40 relative overflow-hidden mb-8">
      {/* Background glow overlay */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Natural Language AI Search
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Gemini AI Powered
              </span>
            </h3>
            <p className="text-xs text-slate-400">Ask questions in human text to automatically query database filters.</p>
          </div>
        </div>

        {aiResult && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset AI Filters</span>
          </button>
        )}
      </div>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="relative mb-3">
        <div className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try: 'Show me all delayed shipments heading to Pune' or 'Customs hold cargo from Shanghai'"
            className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 text-slate-100 placeholder-slate-500 rounded-xl pl-12 pr-28 py-3.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-md disabled:opacity-50 transition-all active:scale-95"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Query</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Quick Prompts Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-slate-500" /> Examples:
        </span>
        {SAMPLE_PROMPTS.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => handlePromptClick(sample)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-all hover:border-indigo-500/40"
          >
            "{sample}"
          </button>
        ))}
      </div>

      {/* AI Parsed Results & Extracted Filter Tags */}
      {aiResult && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 animate-fadeIn">
          <div className="flex items-start gap-2.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3">
            <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-indigo-300 mb-1">
                {aiResult.explanation}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {filters?.status && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-500/40">
                    Status: <strong className="text-white">{filters.status}</strong>
                  </span>
                )}
                {filters?.isDelayed && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/40 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Delayed Cargo Only
                  </span>
                )}
                {filters?.origin && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-200 border border-sky-500/40">
                    Origin: <strong className="text-white">{filters.origin}</strong>
                  </span>
                )}
                {filters?.destination && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-200 border border-purple-500/40">
                    Destination: <strong className="text-white">{filters.destination}</strong>
                  </span>
                )}
                {filters?.carrier && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-500/40">
                    Carrier: <strong className="text-white">{filters.carrier}</strong>
                  </span>
                )}
                {filters?.searchQuery && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-700 text-slate-200">
                    Keyword: "{filters.searchQuery}"
                  </span>
                )}
                <span className="text-xs text-slate-400 ml-auto font-medium">
                  Found <strong className="text-white">{aiResult.count}</strong> matching shipment(s)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
