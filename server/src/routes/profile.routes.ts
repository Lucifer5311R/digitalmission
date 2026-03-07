import { Router } from 'express';
import profileController from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileValidator } from '../validators/profile.validator';
import { uploadPhoto } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => profileController.getProfile(req, res, next));
router.put('/', validate(updateProfileValidator), (req, res, next) => profileController.updateProfile(req, res, next));
router.post('/photo', uploadPhoto.single('photo'), (req, res, next) => profileController.uploadPhoto(req, res, next));

export default router;
