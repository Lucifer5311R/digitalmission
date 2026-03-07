import { body, param, query } from 'express-validator';

export const checkinValidator = [
  body('class_id').isUUID().withMessage('Valid class ID required'),
];

export const checkoutValidator = [
  param('id').isUUID().withMessage('Valid session ID required'),
];

export const sessionQueryValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('startDate').optional().isISO8601().withMessage('Valid start date required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date required'),
  query('trainer_id').optional().isUUID(),
  query('class_id').optional().isUUID(),
];
