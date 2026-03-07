import { Response, NextFunction } from 'express';
import sessionsService from '../services/sessions.service';
import { AuthRequest, ApiResponse } from '../types';

export class SessionsController {
  async checkin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await sessionsService.checkin(req.user!.id, req.body.class_id);
      const response: ApiResponse = { success: true, data: session, message: 'Checked in successfully' };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async checkout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await sessionsService.checkout(req.params.id, req.user!.id);
      const response: ApiResponse = { success: true, data: session, message: 'Checked out successfully' };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async findMySessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, page, limit } = req.query;
      const result = await sessionsService.findMySessions(req.user!.id, {
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      const response: ApiResponse = { success: true, data: result.sessions, pagination: result.pagination };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, trainer_id, class_id, page, limit } = req.query;
      const result = await sessionsService.findAll({
        startDate: startDate as string,
        endDate: endDate as string,
        trainer_id: trainer_id as string,
        class_id: class_id as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      const response: ApiResponse = { success: true, data: result.sessions, pagination: result.pagination };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getActive(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await sessionsService.getActiveSession(req.user!.id);
      const response: ApiResponse = { success: true, data: session };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new SessionsController();
