import { body, param } from 'express-validator';

export const bulkMarksValidator = [
  body('assessment_id').isUUID().withMessage('Valid assessment ID required'),
  body('marks').isArray({ min: 1 }).withMessage('Marks array must have at least 1 entry'),
  body('marks.*.student_id').isUUID().withMessage('Valid student ID required'),
  body('marks.*.marks_obtained').isFloat({ min: 0 }).withMessage('Marks obtained must be >= 0'),
  body('marks.*.remarks').optional().isString(),
];

export const updateMarkValidator = [
  param('id').isUUID().withMessage('Valid mark ID required'),
  body('marks_obtained').isFloat({ min: 0 }).withMessage('Marks obtained must be >= 0'),
  body('remarks').optional().isString(),
];

export const markQueryValidator = [
  param('id').isUUID().withMessage('Valid ID required'),
];
