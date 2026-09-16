import { CreateShipmentInput, Shipment, ShipmentDetail, ShipmentHistory, UpdateStatusInput } from '../types/shipment';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchShipments(statusFilter?: string, searchQuery?: string): Promise<Shipment[]> {
  const params = new URLSearchParams();
  if (statusFilter && statusFilter !== 'ALL') {
    params.append('status', statusFilter);
  }
  if (searchQuery && searchQuery.trim() !== '') {
    params.append('search', searchQuery.trim());
  }

  const url = `${API_BASE_URL}/shipments${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch shipments: ${response.statusText}`);
  }
  const json = await response.json();
  return json.data || [];
}

export async function fetchShipmentById(id: string): Promise<ShipmentDetail> {
  const response = await fetch(`${API_BASE_URL}/shipments/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch shipment details`);
  }
  const json = await response.json();
  return json.data;
}

export async function createShipment(input: CreateShipmentInput): Promise<Shipment> {
  const response = await fetch(`${API_BASE_URL}/shipments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || 'Failed to create shipment');
  }

  return json.data;
}

export async function updateShipmentStatus(id: string, input: UpdateStatusInput): Promise<{ shipment: Shipment; historyItem: ShipmentHistory }> {
  const response = await fetch(`${API_BASE_URL}/shipments/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || 'Failed to update status');
  }

  return json.data;
}

export async function fetchShipmentHistory(id: string): Promise<ShipmentHistory[]> {
  const response = await fetch(`${API_BASE_URL}/shipments/${id}/history`);
  if (!response.ok) {
    throw new Error(`Failed to fetch shipment timeline`);
  }
  const json = await response.json();
  return json.data || [];
}
