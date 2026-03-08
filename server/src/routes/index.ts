import { Router } from 'express';
import authRoutes from './auth.routes';
import classesRoutes from './classes.routes';
import assignmentsRoutes from './assignments.routes';
import sessionsRoutes from './sessions.routes';
import notesRoutes from './notes.routes';
import ratingsRoutes from './ratings.routes';
import trainersRoutes from './trainers.routes';
import reportsRoutes from './reports.routes';
import syncRoutes from './sync.routes';
import profileRoutes from './profile.routes';
import assessmentsRoutes from './assessments.routes';
import marksRoutes from './marks.routes';
import studentsRoutes from './students.routes';
import attendanceRoutes from './attendance.routes';
import analyticsRoutes from './analytics.routes';
import auditLogRoutes from './auditLog.routes';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { generalLimiter } from '../middleware/rateLimiter';
import User, { UserRole, UserStatus } from '../models/User';
import { hashPassword } from '../utils/password';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

const router = Router();

router.use('/auth', authRoutes);
router.use('/classes', classesRoutes);
router.use('/assignments', assignmentsRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/sessions', notesRoutes);
router.use('/ratings', ratingsRoutes);
router.use('/trainers', trainersRoutes);
router.use('/reports', reportsRoutes);
router.use('/sync', syncRoutes);
router.use('/profile', profileRoutes);
router.use('/assessments', assessmentsRoutes);
router.use('/marks', marksRoutes);
router.use('/students', studentsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit-logs', auditLogRoutes);

// GET /api/users?role=trainer — list users by role
router.get('/users', authenticate, async (req, res, next) => {
  try {
    const { role } = req.query;
    const where: any = {};
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      where.role = role;
    }
    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'status', 'phone', 'created_at'],
      order: [['name', 'ASC']],
    });
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
});

// POST /api/users — create a new trainer (supervisor only)
router.post(
  '/users',
  authenticate,
  authorize(UserRole.SUPERVISOR),
  generalLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().trim(),
  ],
  async (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    try {
      const { name, email, password, phone } = req.body;
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'A user with this email already exists' });
      }
      const password_hash = await hashPassword(password);
      const user = await User.create({
        id: uuidv4(),
        name,
        email,
        password_hash,
        phone: phone || null,
        role: UserRole.TRAINER,
        status: UserStatus.ACTIVE,
        refresh_token: null,
      });
      res.status(201).json({
        data: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/users/:id — remove a trainer (supervisor only)
router.delete(
  '/users/:id',
  authenticate,
  authorize(UserRole.SUPERVISOR),
  generalLimiter,
  async (req: any, res: any, next: any) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.role === UserRole.SUPERVISOR) {
        return res.status(403).json({ error: 'Cannot delete a supervisor account' });
      }
      await user.destroy();
      res.json({ message: 'Trainer deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
