import { body, param } from 'express-validator';

export const createNoteValidator = [
  param('id').isUUID().withMessage('Valid session ID required'),
  body('note_text').isString().trim().notEmpty().withMessage('Note text is required').isLength({ max: 5000 }),
];

export const deleteNoteValidator = [
  param('id').isUUID().withMessage('Valid session ID required'),
  param('noteId').isUUID().withMessage('Valid note ID required'),
];
