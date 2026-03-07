import { Response, NextFunction } from 'express';
import marksService from '../services/marks.service';
import { AuthRequest, ApiResponse } from '../types';

export class MarksController {
  async getByAssessment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const marks = await marksService.getByAssessment(req.params.id);
      const response: ApiResponse = { success: true, data: marks };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getByStudent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const marks = await marksService.getByStudent(req.params.id);
      const response: ApiResponse = { success: true, data: marks };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async bulkUpsert(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marksService.bulkUpsert({ ...req.body, updated_by: req.user!.id });
      const response: ApiResponse = { success: true, data: result, message: 'Marks saved successfully' };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateMark(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const mark = await marksService.updateMark(req.params.id, { ...req.body, updated_by: req.user!.id });
      const response: ApiResponse = { success: true, data: mark, message: 'Mark updated successfully' };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new MarksController();
