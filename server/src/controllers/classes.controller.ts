import { Response, NextFunction } from 'express';
import classesService from '../services/classes.service';
import { AuthRequest, ApiResponse } from '../types';

export class ClassesController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, page, limit } = req.query;
      const result = await classesService.findAll({
        status: status as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      const response: ApiResponse = {
        success: true,
        data: result.classes,
        pagination: result.pagination,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cls = await classesService.findById(req.params.id);
      const response: ApiResponse = { success: true, data: cls };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cls = await classesService.create({ ...req.body, created_by: req.user!.id });
      const response: ApiResponse = { success: true, data: cls, message: 'Class created successfully' };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cls = await classesService.update(req.params.id, req.body);
      const response: ApiResponse = { success: true, data: cls, message: 'Class updated successfully' };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await classesService.delete(req.params.id);
      const response: ApiResponse = { success: true, message: result.message };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await classesService.getStats(req.params.id);
      const response: ApiResponse = { success: true, data: stats };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new ClassesController();
