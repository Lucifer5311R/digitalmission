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

export default router;
