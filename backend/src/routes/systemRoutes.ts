
import { Router } from 'express';
import { getSystemMetrics } from '../controllers/systemController';

const router = Router();

router.get('/metrics', getSystemMetrics);

export default router;
