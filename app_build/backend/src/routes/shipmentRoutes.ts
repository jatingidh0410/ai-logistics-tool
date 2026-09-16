import { Router } from 'express';
import { ShipmentController } from '../controllers/shipmentController.js';

const router = Router();

router.get('/shipments', ShipmentController.listShipments);
router.post('/shipments', ShipmentController.createShipment);
router.get('/shipments/:id', ShipmentController.getShipmentById);
router.patch('/shipments/:id/status', ShipmentController.updateStatus);
router.get('/shipments/:id/history', ShipmentController.getHistory);

export default router;
