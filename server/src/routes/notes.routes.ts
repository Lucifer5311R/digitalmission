import { Router } from 'express';
import notesController from '../controllers/notes.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createNoteValidator, deleteNoteValidator } from '../validators/notes.validator';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/:id/notes', validate(createNoteValidator), (req, res, next) => notesController.create(req, res, next));
router.get('/:id/notes', (req, res, next) => notesController.findBySession(req, res, next));
router.delete('/:id/notes/:noteId', validate(deleteNoteValidator), (req, res, next) => notesController.delete(req, res, next));

export default router;
