import { Router } from 'express';
import reportsController from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.SUPERVISOR));

router.get('/attendance', (req, res, next) => reportsController.getAttendanceReport(req, res, next));
router.get('/trainer/:id', (req, res, next) => reportsController.getTrainerReport(req, res, next));
router.get('/class/:id', (req, res, next) => reportsController.getClassReport(req, res, next));

export default router;
