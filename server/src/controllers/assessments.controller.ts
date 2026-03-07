import { Response, NextFunction } from 'express';
import assessmentsService from '../services/assessments.service';
import { AuthRequest, ApiResponse } from '../types';

export class AssessmentsController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = req.query.class_id as string;
      const assessments = await assessmentsService.findAll(classId);
      const response: ApiResponse = { success: true, data: assessments };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const assessment = await assessmentsService.findById(req.params.id);
      const response: ApiResponse = { success: true, data: assessment };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const assessment = await assessmentsService.create({ ...req.body, created_by: req.user!.id });
      const response: ApiResponse = { success: true, data: assessment, message: 'Assessment created successfully' };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const assessment = await assessmentsService.update(req.params.id, req.body);
      const response: ApiResponse = { success: true, data: assessment, message: 'Assessment updated successfully' };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await assessmentsService.delete(req.params.id);
      const response: ApiResponse = { success: true, message: result.message };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new AssessmentsController();
