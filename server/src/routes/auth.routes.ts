import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginValidator, refreshValidator } from '../validators/auth.validator';
import { loginLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', loginLimiter, validate(loginValidator), (req, res, next) => authController.login(req, res, next));
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));
router.post('/refresh', validate(refreshValidator), (req, res, next) => authController.refresh(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));

export default router;
