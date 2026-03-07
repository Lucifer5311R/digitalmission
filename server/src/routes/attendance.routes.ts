import { Router } from 'express';
import attendanceController from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { markAttendanceValidator, attendanceQueryValidator, studentAttendanceValidator } from '../validators/attendance.validator';
import { uploadExcel } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.post('/', validate(markAttendanceValidator), (req, res, next) => attendanceController.mark(req, res, next));
router.get('/', validate(attendanceQueryValidator), (req, res, next) => attendanceController.getByClassAndDate(req, res, next));
router.get('/student/:id', validate(studentAttendanceValidator), (req, res, next) => attendanceController.getByStudent(req, res, next));
router.get('/summary', (req, res, next) => attendanceController.getSummary(req, res, next));
router.post('/upload', uploadExcel.single('file'), (req, res, next) => attendanceController.upload(req, res, next));

export default router;
