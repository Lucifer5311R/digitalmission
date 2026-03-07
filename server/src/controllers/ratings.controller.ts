import { Response, NextFunction } from 'express';
import ratingsService from '../services/ratings.service';
import { AuthRequest, ApiResponse } from '../types';

export class RatingsController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rating = await ratingsService.create({
        ...req.body,
        rated_by: req.user!.id,
      });
      const response: ApiResponse = { success: true, data: rating, message: 'Rating submitted' };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async findByTrainerId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ratings = await ratingsService.findByTrainerId(req.params.id);
      const response: ApiResponse = { success: true, data: ratings };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getTrainerStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await ratingsService.getTrainerStats(req.params.id);
      const response: ApiResponse = { success: true, data: stats };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new RatingsController();
