import { body, param, query } from 'express-validator';

export const markAttendanceValidator = [
  body('class_id').isUUID().withMessage('Valid class ID required'),
  body('date').isDate().withMessage('Valid date required'),
  body('records').isArray({ min: 1 }).withMessage('Records must be a non-empty array'),
  body('records.*.student_id').isUUID().withMessage('Valid student ID required'),
  body('records.*.status').isIn(['present', 'absent', 'late']).withMessage('Status must be present, absent, or late'),
];

export const attendanceQueryValidator = [
  query('class_id').isUUID().withMessage('Valid class ID required'),
  query('date').isDate().withMessage('Valid date required'),
];

export const studentAttendanceValidator = [
  param('id').isUUID().withMessage('Valid student ID required'),
  query('startDate').optional().isDate().withMessage('Valid start date required'),
  query('endDate').optional().isDate().withMessage('Valid end date required'),
];
