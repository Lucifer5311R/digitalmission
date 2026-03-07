import { Router } from 'express';
import assignmentsController from '../controllers/assignments.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createAssignmentValidator, assignmentIdValidator, trainerIdValidator } from '../validators/assignments.validator';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => assignmentsController.findAll(req, res, next));
router.get('/trainer/:id', validate(trainerIdValidator), (req, res, next) => assignmentsController.findByTrainerId(req, res, next));
router.post('/', authorize(UserRole.SUPERVISOR), validate(createAssignmentValidator), (req, res, next) => assignmentsController.create(req, res, next));
router.delete('/:id', authorize(UserRole.SUPERVISOR), validate(assignmentIdValidator), (req, res, next) => assignmentsController.delete(req, res, next));

export default router;
