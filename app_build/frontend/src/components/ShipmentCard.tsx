import React from 'react';
import { Shipment } from '../types/shipment';
import { StatusBadge } from './StatusBadge';
import { ArrowRight, Calendar, MapPin, History, RefreshCcw, Anchor } from 'lucide-react';

interface ShipmentCardProps {
  shipment: Shipment;
  onSelect: (shipment: Shipment) => void;
  onUpdateStatus: (shipment: Shipment) => void;
}

export const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment, onSelect, onUpdateStatus }) => {
  const formattedDate = new Date(shipment.expected_delivery_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between group">
      
      {/* Top Header: Ref Number & Status */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                {shipment.reference_number}
              </span>
            </div>
            {shipment.carrier && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Anchor size={12} className="text-slate-500" />
                {shipment.carrier}
              </span>
            )}
          </div>

          <StatusBadge status={shipment.current_status} size="md" />
        </div>

        {/* Route Details (Origin ---> Destination) */}
        <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800/60 mb-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex-1 min-w-0 pr-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">Origin</span>
              <p className="font-semibold text-slate-200 truncate flex items-center gap-1">
                <MapPin size={12} className="text-indigo-400 shrink-0" />
                {shipment.origin}
              </p>
            </div>

            <div className="px-2 shrink-0 text-slate-600 flex flex-col items-center">
              <ArrowRight size={14} className="text-indigo-500/70" />
            </div>

            <div className="flex-1 min-w-0 pl-2 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">Destination</span>
              <p className="font-semibold text-slate-200 truncate flex items-center gap-1 justify-end">
                {shipment.destination}
                <MapPin size={12} className="text-emerald-400 shrink-0" />
              </p>
            </div>
          </div>
        </div>

        {/* Notes excerpt if any */}
        {shipment.notes && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 italic">
            "{shipment.notes}"
          </p>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar size={13} className="text-indigo-400" />
          <span>Expected: <strong className="text-slate-200">{formattedDate}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateStatus(shipment)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-slate-700/60 hover:border-indigo-500/40 text-xs font-medium transition-all flex items-center gap-1"
            title="Update Shipment Status"
          >
            <RefreshCcw size={13} />
            <span className="hidden sm:inline">Update</span>
          </button>

          <button
            onClick={() => onSelect(shipment)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <History size={13} />
            <span>Timeline</span>
          </button>
        </div>
      </div>

    </div>
  );
};
