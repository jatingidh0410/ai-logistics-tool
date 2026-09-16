import React from 'react';
import { ShipmentStatus } from '../types/shipment';
import { Bookmark, Truck, AlertTriangle, PackageCheck, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ShipmentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = (status: ShipmentStatus) => {
    switch (status) {
      case 'Booked':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          dot: 'bg-blue-400',
          icon: Bookmark,
        };
      case 'In Transit':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400 animate-pulse',
          icon: Truck,
        };
      case 'Customs Hold':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400 animate-ping',
          icon: AlertTriangle,
        };
      case 'Out for Delivery':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          dot: 'bg-purple-400 animate-pulse',
          icon: PackageCheck,
        };
      case 'Delivered':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
        };
      case 'Cancelled':
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          dot: 'bg-slate-400',
          icon: XCircle,
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          dot: 'bg-slate-400',
          icon: Bookmark,
        };
    }
  };

  const style = getBadgeStyle(status);
  const Icon = style.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-medium gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-semibold gap-2',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border backdrop-blur-md ${style.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <Icon size={iconSizes} />
      <span>{status}</span>
    </span>
  );
};
