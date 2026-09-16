import { Request, Response } from 'express';
import { ShipmentService } from '../services/shipmentService.js';
import { z } from 'zod';

const createShipmentSchema = z.object({
  reference_number: z.string().optional(),
  origin: z.string().min(2, 'Origin location must be at least 2 characters'),
  destination: z.string().min(2, 'Destination location must be at least 2 characters'),
  expected_delivery_date: z.string().min(1, 'Expected delivery date is required'),
  carrier: z.string().optional(),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['Booked', 'In Transit', 'Customs Hold', 'Out for Delivery', 'Delivered', 'Cancelled']),
  location_comment: z.string().optional(),
});

export class ShipmentController {
  static async listShipments(req: Request, res: Response) {
    try {
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      const shipments = await ShipmentService.listShipments(status, search);

      return res.status(200).json({
        success: true,
        count: shipments.length,
        data: shipments,
      });
    } catch (error: any) {
      console.error('Error listing shipments:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve shipments list',
        details: error.message,
      });
    }
  }

  static async getShipmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const shipment = await ShipmentService.getShipmentById(id);

      if (!shipment) {
        return res.status(404).json({
          success: false,
          error: `Shipment with ID ${id} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data: shipment,
      });
    } catch (error: any) {
      console.error('Error fetching shipment by ID:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch shipment',
        details: error.message,
      });
    }
  }

  static async createShipment(req: Request, res: Response) {
    try {
      const parseResult = createShipmentSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: parseResult.error.errors,
        });
      }

      const newShipment = await ShipmentService.createShipment(parseResult.data);

      return res.status(201).json({
        success: true,
        message: 'Shipment created successfully',
        data: newShipment,
      });
    } catch (error: any) {
      console.error('Error creating shipment:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create shipment',
        details: error.message,
      });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parseResult = updateStatusSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: parseResult.error.errors,
        });
      }

      const result = await ShipmentService.updateStatus(id, parseResult.data);

      return res.status(200).json({
        success: true,
        message: `Shipment status updated to ${parseResult.data.status}`,
        data: result,
      });
    } catch (error: any) {
      console.error('Error updating shipment status:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to update status',
      });
    }
  }

  static async getHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const history = await ShipmentService.getHistory(id);

      return res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error: any) {
      console.error('Error fetching shipment history:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch shipment history',
        details: error.message,
      });
    }
  }
}
