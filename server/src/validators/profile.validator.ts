import { body } from 'express-validator';

export const updateProfileValidator = [
  body('name')
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-()]{7,20}$/)
    .withMessage('Valid phone number is required'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];
