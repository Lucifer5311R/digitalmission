import { Router } from 'express';
import classesController from '../controllers/classes.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createClassValidator, updateClassValidator, classIdValidator, classQueryValidator } from '../validators/classes.validator';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/', validate(classQueryValidator), (req, res, next) => classesController.findAll(req, res, next));
router.get('/:id', validate(classIdValidator), (req, res, next) => classesController.findById(req, res, next));
router.get('/:id/stats', validate(classIdValidator), (req, res, next) => classesController.getStats(req, res, next));
router.post('/', authorize(UserRole.SUPERVISOR), validate(createClassValidator), (req, res, next) => classesController.create(req, res, next));
router.put('/:id', authorize(UserRole.SUPERVISOR), validate(updateClassValidator), (req, res, next) => classesController.update(req, res, next));
router.delete('/:id', authorize(UserRole.SUPERVISOR), validate(classIdValidator), (req, res, next) => classesController.delete(req, res, next));

export default router;
