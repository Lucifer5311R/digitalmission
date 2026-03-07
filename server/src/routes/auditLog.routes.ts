import { Router } from 'express';
import auditLogController from '../controllers/auditLog.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { auditLogQueryValidator } from '../validators/auditLog.validator';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/', authorize(UserRole.SUPERVISOR), validate(auditLogQueryValidator), (req, res, next) => auditLogController.findAll(req, res, next));

export default router;
