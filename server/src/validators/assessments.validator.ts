import { body, param, query } from 'express-validator';

export const createAssessmentValidator = [
  body('class_id').isUUID().withMessage('Valid class ID required'),
  body('name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('max_marks').isInt({ min: 1 }).withMessage('Max marks must be at least 1'),
  body('weightage').optional().isFloat({ min: 0, max: 100 }).withMessage('Weightage must be 0-100'),
];

export const updateAssessmentValidator = [
  param('id').isUUID().withMessage('Valid assessment ID required'),
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('max_marks').optional().isInt({ min: 1 }).withMessage('Max marks must be at least 1'),
  body('weightage').optional().isFloat({ min: 0, max: 100 }).withMessage('Weightage must be 0-100'),
];

export const assessmentIdValidator = [
  param('id').isUUID().withMessage('Valid assessment ID required'),
];

export const assessmentQueryValidator = [
  query('class_id').isUUID().withMessage('Valid class ID required'),
];
