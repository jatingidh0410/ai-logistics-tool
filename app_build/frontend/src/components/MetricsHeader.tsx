import React from 'react';
import { Shipment, ShipmentStatus } from '../types/shipment';
import { Package, Truck, AlertTriangle, CheckCircle2, Bookmark } from 'lucide-react';

interface MetricsHeaderProps {
  shipments: Shipment[];
  activeFilter: string;
  onSelectFilter: (status: string) => void;
}

export const MetricsHeader: React.FC<MetricsHeaderProps> = ({ shipments, activeFilter, onSelectFilter }) => {
  const counts = {
    ALL: shipments.length,
    Booked: shipments.filter((s) => s.current_status === 'Booked').length,
    'In Transit': shipments.filter((s) => s.current_status === 'In Transit').length,
    'Customs Hold': shipments.filter((s) => s.current_status === 'Customs Hold').length,
    Delivered: shipments.filter((s) => s.current_status === 'Delivered').length,
  };

  const metricCards = [
    {
      id: 'ALL',
      label: 'Total Active Shipments',
      count: counts.ALL,
      icon: Package,
      color: 'from-blue-500/20 to-indigo-500/10 text-indigo-400 border-indigo-500/20',
      activeBorder: 'ring-2 ring-indigo-500/50 bg-indigo-500/10',
    },
    {
      id: 'In Transit',
      label: 'In Transit',
      count: counts['In Transit'],
      icon: Truck,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/20',
      activeBorder: 'ring-2 ring-amber-500/50 bg-amber-500/10',
    },
    {
      id: 'Customs Hold',
      label: 'Customs Inspection',
      count: counts['Customs Hold'],
      icon: AlertTriangle,
      color: 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/20',
      activeBorder: 'ring-2 ring-rose-500/50 bg-rose-500/10',
    },
    {
      id: 'Delivered',
      label: 'Delivered Successfully',
      count: counts.Delivered,
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20',
      activeBorder: 'ring-2 ring-emerald-500/50 bg-emerald-500/10',
    },
    {
      id: 'Booked',
      label: 'Booked Cargo',
      count: counts.Booked,
      icon: Bookmark,
      color: 'from-sky-500/20 to-cyan-500/10 text-sky-400 border-sky-500/20',
      activeBorder: 'ring-2 ring-sky-500/50 bg-sky-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      {metricCards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelectFilter(card.id)}
            className={`text-left p-4 rounded-2xl glass-panel glass-panel-hover border transition-all duration-200 cursor-pointer ${
              isActive ? card.activeBorder : 'hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.label}</span>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color} border`}>
                <Icon size={16} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white tracking-tight">{card.count}</span>
              {isActive && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500 text-white uppercase tracking-wider">
                  Filtered
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
