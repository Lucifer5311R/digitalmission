import { Response, NextFunction } from 'express';
import assignmentsService from '../services/assignments.service';
import { AuthRequest, ApiResponse } from '../types';

export class AssignmentsController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignments = await assignmentsService.findAll(req.user!.id, req.user!.role);
      const response: ApiResponse = { success: true, data: assignments };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async findByTrainerId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignments = await assignmentsService.findByTrainerId(req.params.id);
      const response: ApiResponse = { success: true, data: assignments };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await assignmentsService.create({
        ...req.body,
        assigned_by: req.user!.id,
      });
      const response: ApiResponse = { success: true, data: assignment, message: 'Trainer assigned successfully' };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await assignmentsService.delete(req.params.id);
      const response: ApiResponse = { success: true, message: result.message };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new AssignmentsController();
