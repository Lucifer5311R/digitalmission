import { body, param, query } from 'express-validator';

export const createStudentValidator = [
  body('register_no').isString().trim().notEmpty().withMessage('Register number is required'),
  body('name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().isString().trim(),
  body('class_id').isUUID().withMessage('Valid class ID required'),
];

export const studentIdValidator = [
  param('id').isUUID().withMessage('Valid student ID required'),
];

export const studentQueryValidator = [
  query('class_id').optional().isUUID().withMessage('Valid class ID required'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
