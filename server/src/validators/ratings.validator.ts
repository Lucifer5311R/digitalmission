import { body, param } from 'express-validator';

export const createRatingValidator = [
  body('trainer_id').isUUID().withMessage('Valid trainer ID required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('feedback_text').optional().isString().trim().isLength({ max: 5000 }),
];

export const trainerIdValidator = [
  param('id').isUUID().withMessage('Valid trainer ID required'),
];
