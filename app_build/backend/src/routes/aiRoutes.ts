import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';

const router = Router();

router.post('/query', AIController.parseQuery);
router.post('/parse-doc', AIController.parseDocument);

export default router;
