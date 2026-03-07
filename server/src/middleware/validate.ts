import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiResponse } from '../types';

export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      data: errors.array().map(e => ({
        field: 'path' in e ? e.path : 'unknown',
        message: e.msg,
      })),
    };

    res.status(400).json(response);
  };
}
