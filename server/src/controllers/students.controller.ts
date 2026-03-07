import { Response, NextFunction } from 'express';
import studentsService from '../services/students.service';
import { AuthRequest, ApiResponse } from '../types';

export class StudentsController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { class_id, status, page, limit } = req.query;
      const result = await studentsService.findAll({
        class_id: class_id as string,
        status: status as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      const response: ApiResponse = {
        success: true,
        data: result.students,
        pagination: result.pagination,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await studentsService.findById(req.params.id);
      const response: ApiResponse = { success: true, data: result };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentsService.create(req.body);
      const response: ApiResponse = { success: true, data: student, message: 'Student created successfully' };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentsService.update(req.params.id, req.body);
      const response: ApiResponse = { success: true, data: student, message: 'Student updated successfully' };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await studentsService.delete(req.params.id);
      const response: ApiResponse = { success: true, message: result.message };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async upload(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' } as ApiResponse);
        return;
      }
      const classId = req.body.class_id || (req.query.class_id as string);
      if (!classId) {
        res.status(400).json({ success: false, error: 'class_id is required' } as ApiResponse);
        return;
      }
      const result = await studentsService.uploadStudents(classId, req.file.path);
      const response: ApiResponse = { success: true, data: result, message: 'Students uploaded successfully' };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentsController();
