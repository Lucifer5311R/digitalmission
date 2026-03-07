import { Response, NextFunction } from 'express';
import analyticsService from '../services/analytics.service';
import { AuthRequest, ApiResponse } from '../types';

export class AnalyticsController {
  async getClassPerformance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getClassPerformance(req.params.id);
      const response: ApiResponse = { success: true, data };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceAlerts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const threshold = req.query.threshold ? parseFloat(req.query.threshold as string) : 75;
      const data = await analyticsService.getAttendanceAlerts(threshold);
      const response: ApiResponse = { success: true, data };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getDashboardStats();
      const response: ApiResponse = { success: true, data };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();
