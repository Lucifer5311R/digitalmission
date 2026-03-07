import { Router } from 'express';
import ratingsController from '../controllers/ratings.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createRatingValidator, trainerIdValidator } from '../validators/ratings.validator';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.post('/', authorize(UserRole.SUPERVISOR), validate(createRatingValidator), (req, res, next) => ratingsController.create(req, res, next));
router.get('/trainer/:id', validate(trainerIdValidator), (req, res, next) => ratingsController.findByTrainerId(req, res, next));

export default router;
