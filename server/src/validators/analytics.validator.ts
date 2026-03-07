import { param, query } from 'express-validator';

export const classPerformanceValidator = [
  param('id').isUUID().withMessage('Valid class ID required'),
];

export const alertsQueryValidator = [
  query('threshold').optional().isFloat({ min: 0, max: 100 }).withMessage('Threshold must be a number between 0 and 100'),
];

export const dashboardValidator: any[] = [];
