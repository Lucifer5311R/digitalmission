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

export default router;
