import React from 'react';
import { Ship, Plus, RefreshCw, FileText, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
  onOpenDocParserModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateModal, onOpenDocParserModal, onRefresh, isRefreshing }) => {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Ship className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">NAGARKOT</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold tracking-wider uppercase">
                Logistics
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Shipment Status Tracker & Audit Hub</p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 disabled:opacity-50"
            title="Refresh Shipments"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            onClick={onOpenDocParserModal}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-indigo-500/30 hover:border-indigo-400/50 shadow-md transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Doc Parser</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 transition-all duration-200 border border-indigo-400/30 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Cargo Shipment</span>
          </button>
        </div>

      </div>
    </header>
  );
};

