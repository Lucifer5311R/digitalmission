import { body, param, query } from 'express-validator';

export const createClassValidator = [
  body('name').isString().trim().isLength({ min: 2, max: 200 }).withMessage('Name must be 2-200 characters'),
  body('description').optional().isString().trim(),
  body('scheduled_time').optional().isObject().withMessage('Scheduled time must be an object'),
  body('location').optional().isString().trim().isLength({ max: 200 }),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('teacher_name').optional().isString().trim().isLength({ max: 100 }),
  body('teacher_contact').optional().isString().trim().isLength({ max: 20 }),
  body('cr_name').optional().isString().trim().isLength({ max: 100 }),
  body('cr_contact').optional().isString().trim().isLength({ max: 20 }),
];

export const updateClassValidator = [
  param('id').isUUID().withMessage('Valid class ID required'),
  body('name').optional().isString().trim().isLength({ min: 2, max: 200 }),
  body('description').optional().isString().trim(),
  body('scheduled_time').optional().isObject(),
  body('location').optional().isString().trim().isLength({ max: 200 }),
  body('capacity').optional().isInt({ min: 1 }),
  body('status').optional().isIn(['active', 'inactive', 'archived']),
  body('teacher_name').optional().isString().trim().isLength({ max: 100 }),
  body('teacher_contact').optional().isString().trim().isLength({ max: 20 }),
  body('cr_name').optional().isString().trim().isLength({ max: 100 }),
  body('cr_contact').optional().isString().trim().isLength({ max: 20 }),
];

export const classIdValidator = [
  param('id').isUUID().withMessage('Valid class ID required'),
];

export const classQueryValidator = [
  query('status').optional().isIn(['active', 'inactive', 'archived']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
