export type ShipmentStatus = 
  | 'Booked'
  | 'In Transit'
  | 'Customs Hold'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface Shipment {
  id: string;
  reference_number: string;
  origin: string;
  destination: string;
  current_status: ShipmentStatus;
  expected_delivery_date: string;
  carrier?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentHistory {
  id: string;
  shipment_id: string;
  status: ShipmentStatus;
  location_comment?: string | null;
  timestamp: string;
}

export interface CreateShipmentInput {
  reference_number?: string;
  origin: string;
  destination: string;
  expected_delivery_date: string;
  carrier?: string;
  notes?: string;
}

export interface UpdateShipmentStatusInput {
  status: ShipmentStatus;
  location_comment?: string;
}

export interface ShipmentFilterOptions {
  status?: string;
  origin?: string;
  destination?: string;
  carrier?: string;
  searchQuery?: string;
  isDelayed?: boolean;
}

export interface ParsedNLQuery {
  extractedFilters: ShipmentFilterOptions;
  explanation: string;
}

export interface ParsedDocumentData {
  reference_number: string;
  origin: string;
  destination: string;
  expected_delivery_date: string;
  carrier: string;
  notes: string;
  confidenceScore: number;
}

