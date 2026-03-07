import { Response, NextFunction } from 'express';
import reportsService from '../services/reports.service';
import { AuthRequest, ApiResponse } from '../types';

export class ReportsController {
  async getAttendanceReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, format } = req.query;
      const result = await reportsService.getAttendanceReport({
        startDate: startDate as string,
        endDate: endDate as string,
        format: format as string,
      });

      if (result.type === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
        res.send(result.csv);
        return;
      }

      const response: ApiResponse = { success: true, data: result.data };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getTrainerReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await reportsService.getTrainerReport(req.params.id);
      const response: ApiResponse = { success: true, data: report };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getClassReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await reportsService.getClassReport(req.params.id);
      const response: ApiResponse = { success: true, data: report };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportsController();
