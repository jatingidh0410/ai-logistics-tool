import React, { useEffect, useState } from 'react';
import { ShipmentDetail } from '../types/shipment';
import { fetchShipmentById } from '../services/api';
import { TimelineView } from './TimelineView';
import { StatusBadge } from './StatusBadge';
import { X, MapPin, Calendar, Anchor, FileText, RefreshCw, Clock } from 'lucide-react';

interface ShipmentDetailModalProps {
  shipmentId: string | null;
  onClose: () => void;
  onOpenUpdateStatus: (shipment: ShipmentDetail) => void;
}

export const ShipmentDetailModal: React.FC<ShipmentDetailModalProps> = ({
  shipmentId,
  onClose,
  onOpenUpdateStatus,
}) => {
  const [detail, setDetail] = useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shipmentId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchShipmentById(shipmentId)
      .then((data) => {
        if (isMounted) setDetail(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shipmentId]);

  if (!shipmentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] glass-modal rounded-3xl overflow-hidden flex flex-col border border-slate-700/50 shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {detail ? detail.reference_number : 'Loading Shipment...'}
                </h2>
                {detail && <StatusBadge status={detail.current_status} size="md" />}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Sequential Status Lifecycle & Audit Timeline</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
              <span className="text-sm font-medium">Fetching history audit log...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          ) : detail ? (
            <>
              {/* Route Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-2xl p-4 border border-slate-800/80">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-1">
                      <MapPin size={12} className="text-indigo-400" /> Origin Location
                    </span>
                    <p className="font-bold text-slate-100 text-sm">{detail.origin}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-1">
                      <MapPin size={12} className="text-emerald-400" /> Destination Port
                    </span>
                    <p className="font-bold text-slate-100 text-sm">{detail.destination}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-indigo-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-slate-500">Expected Delivery</span>
                      <span className="font-semibold text-slate-200">
                        {new Date(detail.expected_delivery_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {detail.carrier && (
                    <div className="flex items-center gap-2">
                      <Anchor size={14} className="text-sky-400 shrink-0" />
                      <div>
                        <span className="block text-[10px] text-slate-500">Carrier Partner</span>
                        <span className="font-semibold text-slate-200">{detail.carrier}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-purple-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-slate-500">Created Date</span>
                      <span className="font-semibold text-slate-200">
                        {new Date(detail.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes block */}
              {detail.notes && (
                <div className="bg-slate-900/40 rounded-xl p-3.5 border border-slate-800/60">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                    <FileText size={13} className="text-indigo-400" /> Additional Manifest Notes
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">{detail.notes}</p>
                </div>
              )}

              {/* Timeline Header & List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Clock size={16} className="text-indigo-400" /> Status Transition Audit Log
                  </h3>
                  <span className="text-xs text-slate-500">{detail.history.length} Events Recorded</span>
                </div>

                <TimelineView history={detail.history} />
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium bg-slate-800/60 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>

          {detail && (
            <button
              onClick={() => {
                onClose();
                onOpenUpdateStatus(detail);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Update Status</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
