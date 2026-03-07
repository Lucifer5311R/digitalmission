import { query } from 'express-validator';

export const auditLogQueryValidator = [
  query('entity_type').optional().isString().withMessage('Entity type must be a string'),
  query('entity_id').optional().isString().withMessage('Entity ID must be a string'),
  query('user_id').optional().isString().withMessage('User ID must be a string'),
  query('action').optional().isString().withMessage('Action must be a string'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];
