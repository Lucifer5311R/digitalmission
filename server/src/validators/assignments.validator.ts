import { body, param, query } from 'express-validator';

export const createAssignmentValidator = [
  body('trainer_id').isUUID().withMessage('Valid trainer ID required'),
  body('class_id').isUUID().withMessage('Valid class ID required'),
];

export const assignmentIdValidator = [
  param('id').isUUID().withMessage('Valid assignment ID required'),
];

export const trainerIdValidator = [
  param('id').isUUID().withMessage('Valid trainer ID required'),
];
