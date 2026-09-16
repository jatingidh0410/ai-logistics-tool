import React, { useState } from 'react';
import { Shipment, ShipmentStatus } from '../types/shipment';
import { updateShipmentStatus } from '../services/api';
import { StatusBadge } from './StatusBadge';
import { X, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';

interface StatusUpdateModalProps {
  shipment: Shipment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  shipment,
  onClose,
  onSuccess,
}) => {
  if (!shipment) return null;

  const statusOptions: ShipmentStatus[] = [
    'Booked',
    'In Transit',
    'Customs Hold',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  const [status, setStatus] = useState<ShipmentStatus>(shipment.current_status);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateShipmentStatus(shipment.id, {
        status,
        location_comment: comment,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-modal rounded-3xl overflow-hidden flex flex-col border border-slate-700/50 shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <RefreshCw size={18} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">Update Shipment Status</h2>
              <p className="text-xs text-slate-400">{shipment.reference_number}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current vs Target Status */}
          <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Current State:</span>
            <StatusBadge status={shipment.current_status} size="sm" />
          </div>

          {/* Target Status Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select New Status Stage
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                    status === st
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span>{st}</span>
                  {status === st && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Status Notes / Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Location Update / Audit Note <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                rows={3}
                placeholder="e.g. Scanned at sorting terminal; cleared customs inspection."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <MessageSquare size={14} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Log Status Transition'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
