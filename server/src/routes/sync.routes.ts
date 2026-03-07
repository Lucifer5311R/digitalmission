import { Router } from 'express';
import syncController from '../controllers/sync.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', (req, res, next) => syncController.sync(req, res, next));
router.get('/status', (req, res, next) => syncController.getStatus(req, res, next));

export default router;
