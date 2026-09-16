import React from 'react';
import { ShipmentHistory } from '../types/shipment';
import { StatusBadge } from './StatusBadge';
import { Clock, MessageSquare, CheckCircle } from 'lucide-react';

interface TimelineViewProps {
  history: ShipmentHistory[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-sm">
        No status history recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-slate-800">
      {history.map((item, index) => {
        const isLatest = index === 0;
        const formattedTime = new Date(item.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={item.id || index} className="relative group">
            
            {/* Dot Indicator */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isLatest
                  ? 'bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-500/50'
                  : 'bg-slate-900 border-slate-700'
              }`}
            >
              {isLatest ? (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              )}
            </div>

            {/* Content Box */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isLatest
                  ? 'bg-indigo-950/30 border-indigo-500/30 shadow-md'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <StatusBadge status={item.status} size="sm" />
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock size={12} className="text-slate-500" />
                  <span>{formattedTime}</span>
                </div>
              </div>

              {item.location_comment && (
                <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-800/60 text-xs text-slate-300">
                  <MessageSquare size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{item.location_comment}</p>
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};
