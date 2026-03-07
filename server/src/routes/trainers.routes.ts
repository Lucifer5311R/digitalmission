import { Router } from 'express';
import ratingsController from '../controllers/ratings.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { trainerIdValidator } from '../validators/ratings.validator';

const router = Router();

router.use(authenticate);

router.get('/:id/stats', validate(trainerIdValidator), (req, res, next) => ratingsController.getTrainerStats(req, res, next));

export default router;
