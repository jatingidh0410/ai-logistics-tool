import React, { useEffect, useState } from 'react';
import { Shipment } from './types/shipment';
import { fetchShipments } from './services/api';
import { Navbar } from './components/Navbar';
import { MetricsHeader } from './components/MetricsHeader';
import { ShipmentCard } from './components/ShipmentCard';
import { ShipmentDetailModal } from './components/ShipmentDetailModal';
import { CreateShipmentModal } from './components/CreateShipmentModal';
import { StatusUpdateModal } from './components/StatusUpdateModal';
import { Search, Filter, PackageSearch, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [shipmentToUpdate, setShipmentToUpdate] = useState<Shipment | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShipments(statusFilter, searchQuery);
      setShipments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load shipments. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [statusFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-16">
      
      {/* Navbar */}
      <Navbar
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onRefresh={loadData}
        isRefreshing={loading}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1 w-full">
        
        {/* Page Hero Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-2">
            Cargo Tracking & Logistics Operations
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Monitor real-time cargo movement, review granular status progression audit histories, and record location updates across global freight routes.
          </p>
        </div>

        {/* Metrics Counters */}
        <MetricsHeader
          shipments={shipments}
          activeFilter={statusFilter}
          onSelectFilter={(status) => setStatusFilter(status)}
        />

        {/* Control Bar: Search & Status Selector */}
        <div className="glass-panel rounded-2xl p-4 mb-8 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Ref Number, Origin, Destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={15} className="text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="ALL">All Statuses</option>
              <option value="Booked">Booked</option>
              <option value="In Transit">In Transit</option>
              <option value="Customs Hold">Customs Hold</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

        </div>

        {/* Shipment Cards Grid */}
        {loading && shipments.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm font-medium">Fetching active shipments database...</span>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
            <p className="font-semibold mb-1">Database Connection Error</p>
            <p className="text-xs opacity-90 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : shipments.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800/80 my-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
              <PackageSearch size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Shipments Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No shipments match your current search query or filter criteria. Try adjusting your parameters.'
                : 'Your shipment tracker database is currently empty.'}
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
            >
              Create New Cargo Shipment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shipments.map((shipment) => (
              <ShipmentCard
                key={shipment.id}
                shipment={shipment}
                onSelect={(s) => setSelectedShipmentId(s.id)}
                onUpdateStatus={(s) => setShipmentToUpdate(s)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto pt-12 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>Nagarkot Forwarders Pvt. Ltd. — Logistics Excellence Since 1989</p>
        <p className="mt-1 text-[11px] text-slate-600">"We deliver care, not just cargo"</p>
      </footer>

      {/* Modals */}
      <ShipmentDetailModal
        shipmentId={selectedShipmentId}
        onClose={() => setSelectedShipmentId(null)}
        onOpenUpdateStatus={(s) => setShipmentToUpdate(s)}
      />

      <CreateShipmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={loadData}
      />

      <StatusUpdateModal
        shipment={shipmentToUpdate}
        onClose={() => setShipmentToUpdate(null)}
        onSuccess={loadData}
      />

    </div>
  );
};

export default App;
