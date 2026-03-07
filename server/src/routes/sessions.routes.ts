import { Router } from 'express';
import sessionsController from '../controllers/sessions.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { checkinValidator, checkoutValidator, sessionQueryValidator } from '../validators/sessions.validator';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.post('/checkin', authorize(UserRole.TRAINER), validate(checkinValidator), (req, res, next) => sessionsController.checkin(req, res, next));
router.post('/:id/checkout', authorize(UserRole.TRAINER), validate(checkoutValidator), (req, res, next) => sessionsController.checkout(req, res, next));
router.get('/active', authorize(UserRole.TRAINER), (req, res, next) => sessionsController.getActive(req, res, next));
router.get('/my-sessions', authorize(UserRole.TRAINER), validate(sessionQueryValidator), (req, res, next) => sessionsController.findMySessions(req, res, next));
router.get('/', authorize(UserRole.SUPERVISOR), validate(sessionQueryValidator), (req, res, next) => sessionsController.findAll(req, res, next));

export default router;
