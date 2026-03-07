import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { classPerformanceValidator, alertsQueryValidator, dashboardValidator } from '../validators/analytics.validator';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/class/:id', authorize(UserRole.SUPERVISOR), validate(classPerformanceValidator), (req, res, next) => analyticsController.getClassPerformance(req, res, next));
router.get('/attendance-alerts', validate(alertsQueryValidator), (req, res, next) => analyticsController.getAttendanceAlerts(req, res, next));
router.get('/dashboard', authorize(UserRole.SUPERVISOR), validate(dashboardValidator), (req, res, next) => analyticsController.getDashboardStats(req, res, next));

export default router;
