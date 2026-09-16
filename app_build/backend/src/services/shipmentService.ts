import {
  getAllShipmentsFromDb,
  getShipmentByIdFromDb,
  createShipmentInDb,
  updateShipmentStatusInDb,
  getShipmentHistoryFromDb,
} from '../db/index.js';
import { CreateShipmentInput, Shipment, ShipmentHistory, ShipmentStatus, UpdateShipmentStatusInput } from '../types/index.js';

export class ShipmentService {
  static async listShipments(status?: string, search?: string): Promise<Shipment[]> {
    return await getAllShipmentsFromDb(status, search);
  }

  static async getShipmentById(id: string): Promise<(Shipment & { history: ShipmentHistory[] }) | null> {
    return await getShipmentByIdFromDb(id);
  }

  static async createShipment(input: CreateShipmentInput): Promise<Shipment> {
    const refNum = input.reference_number && input.reference_number.trim() !== '' 
      ? input.reference_number.trim().toUpperCase() 
      : `NAG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return await createShipmentInDb({
      ...input,
      reference_number: refNum,
    });
  }

  static async updateStatus(id: string, input: UpdateShipmentStatusInput): Promise<{ shipment: Shipment; historyItem: ShipmentHistory }> {
    const validStatuses: ShipmentStatus[] = [
      'Booked',
      'In Transit',
      'Customs Hold',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ];

    if (!validStatuses.includes(input.status)) {
      throw new Error(`Invalid status: ${input.status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    return await updateShipmentStatusInDb(id, input.status, input.location_comment);
  }

  static async getHistory(shipmentId: string): Promise<ShipmentHistory[]> {
    return await getShipmentHistoryFromDb(shipmentId);
  }
}
