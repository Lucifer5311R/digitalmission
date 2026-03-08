import { Router } from 'express';
import studentsController from '../controllers/students.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createStudentValidator, studentIdValidator, studentQueryValidator } from '../validators/students.validator';
import { UserRole } from '../models/User';
import { uploadExcel } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/', validate(studentQueryValidator), (req, res, next) => studentsController.findAll(req, res, next));
router.get('/:id', validate(studentIdValidator), (req, res, next) => studentsController.findById(req, res, next));
router.post('/', authorize(UserRole.SUPERVISOR), validate(createStudentValidator), (req, res, next) => studentsController.create(req, res, next));
router.put('/:id', authorize(UserRole.SUPERVISOR), validate([...studentIdValidator, ...createStudentValidator]), (req, res, next) => studentsController.update(req, res, next));
router.delete('/:id', authorize(UserRole.SUPERVISOR), validate(studentIdValidator), (req, res, next) => studentsController.delete(req, res, next));
router.post('/upload', authorize(UserRole.SUPERVISOR), uploadExcel.single('file'), (req, res, next) => studentsController.upload(req, res, next));

export default router;
