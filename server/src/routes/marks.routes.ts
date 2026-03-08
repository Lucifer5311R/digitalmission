import { Router } from 'express';
import marksController from '../controllers/marks.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { bulkMarksValidator, updateMarkValidator, markQueryValidator } from '../validators/marks.validator';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/assessment/:id', validate(markQueryValidator), (req, res, next) => marksController.getByAssessment(req, res, next));
router.get('/student/:id', validate(markQueryValidator), (req, res, next) => marksController.getByStudent(req, res, next));
router.post('/', validate(bulkMarksValidator), (req, res, next) => marksController.bulkUpsert(req, res, next));
router.put('/:id', validate(updateMarkValidator), (req, res, next) => marksController.updateMark(req, res, next));

export default router;
