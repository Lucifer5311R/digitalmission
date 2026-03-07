import { Router } from 'express';
import assessmentsController from '../controllers/assessments.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createAssessmentValidator, updateAssessmentValidator, assessmentIdValidator, assessmentQueryValidator } from '../validators/assessments.validator';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/', validate(assessmentQueryValidator), (req, res, next) => assessmentsController.findAll(req, res, next));
router.get('/:id', validate(assessmentIdValidator), (req, res, next) => assessmentsController.findById(req, res, next));
router.post('/', validate(createAssessmentValidator), (req, res, next) => assessmentsController.create(req, res, next));
router.put('/:id', validate(updateAssessmentValidator), (req, res, next) => assessmentsController.update(req, res, next));
router.delete('/:id', authorize(UserRole.SUPERVISOR), validate(assessmentIdValidator), (req, res, next) => assessmentsController.delete(req, res, next));

export default router;
