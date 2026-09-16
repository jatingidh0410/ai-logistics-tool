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

export interface ShipmentDetail extends Shipment {
  history: ShipmentHistory[];
}

export interface CreateShipmentInput {
  reference_number?: string;
  origin: string;
  destination: string;
  expected_delivery_date: string;
  carrier?: string;
  notes?: string;
}

export interface UpdateStatusInput {
  status: ShipmentStatus;
  location_comment?: string;
}

export interface ExtractedAIFilters {
  status?: string;
  origin?: string;
  destination?: string;
  carrier?: string;
  isDelayed?: boolean;
  searchQuery?: string;
}

export interface AIQueryResult {
  explanation: string;
  extractedFilters: ExtractedAIFilters;
  count: number;
  shipments: Shipment[];
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

